const cds = require('@sap/cds');
const nodemailer = require('nodemailer');
const { sendMail } = require('@sap-cloud-sdk/mail-client');
const fileUpload = require('express-fileupload');
const JSZip = require('jszip');
const { executeHttpRequest } = require('@sap-cloud-sdk/http-client');
const { getDestination } = require('@sap-cloud-sdk/connectivity');

cds.on('bootstrap', app => {
  app.use(fileUpload());
});

const app = cds.app;
app.use(require("express").json());
app.use(fileUpload());

app.post('/fileextraction', async (req, res) => {
    const file = req.files?.file;
    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const base64Data = file.data.toString('base64');
        const fileType = file.mimetype;
        const destination = await getDestination({ destinationName: 'gemini_api' }, { useCache: false });
        const url = destination.url.replace(/\/$/, '');
        
        // Prompt the AI to return structured JSON (this is more reliable)
        const prompt = `
            Extract the Trade Name, GSTIN, and PAN number from the document. 
            Respond with only a valid JSON object in the format: 
            {"tradeName": "<value>", "gstin": "<value>", "pan": "<value>"}.
        `;

       const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: fileType, data: base64Data } }
          ]
        }]
      })
    });
        const result = await response.json();
        let extractedJsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
        extractedJsonText = extractedJsonText.replace(/```json/g, "").replace(/```/g, "").trim();
        const extractedData = JSON.parse(extractedJsonText);
        const combinedText = `Trade Name: ${extractedData.tradeName || 'N/A'}\nGSTIN: ${extractedData.gstin || 'N/A'}\nPAN: ${extractedData.pan || 'N/A'}`;

        return res.json({ extractedText: combinedText });

    } catch (err) {
        console.error("Gemini API error:", err);
        return res.status(500).json({ error: "Error extracting details from document" });
    }
});


app.post('/fetchGSTDetails', async (req, res) => {
  const { gstin } = req.body;

  if (!gstin) {
    return res.status(400).json({ error: "GSTIN missing" });
  }

  try {
    //const apiKey = "84de71e50cad6f02804c5bfc60c2b6e9";
    //const url = `destinations/gstcheck_api/check/${apiKey}/${gstin}`;

    const destination = await getDestination({ destinationName: 'gstcheck_api' }, { useCache: false });
    if (!destination || !destination.url) throw new Error("Destination not found or invalid");
    const url = destination.url.replace(/\/$/, '');
    const host = `${url}/${gstin}`;
    const response = await fetch(host);
    const result = await response.json();

    if (!result?.flag || !result?.data) {
      return res.status(404).json({ error: "GST details not found." });
    }

    // Return GST details only
    return res.json({
      gstStatus: result.data.sts,
      gstTradeName: result.data.tradeNam?.trim() || "",
      gstPincode: result.data.pradr?.addr?.pncd || ""
    });

  } catch (e) {
    console.error("GST fetch error:", e);
    return res.status(500).json({ error: "Error while fetching GST details." });
  }
});


app.get('/downloadZip/:supplierName/:username', async (req, res) => {
  const { supplierName,username } = req.params;
  const files = await SELECT.from('my.username.Attachment').where({ supplierName,username });
  if (!files || files.length === 0) return res.status(404).send("No files found");

  const zip = new JSZip();
  files.forEach(file => {
    const buffer = Buffer.from(file.content, 'base64');
    zip.file(file.fileName, buffer);
  });

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  res.setHeader('Content-Disposition', `attachment; filename="Vendor_${supplierName}_Files.zip"`);
  res.setHeader('Content-Type', 'application/zip');
  res.send(zipBuffer);
});

app.get('/downloadFile/:fileID', async (req, res) => {
  const { fileID } = req.params;
  const file = await SELECT.one.from('my.username.Attachment').where({ ID: fileID });
  if (!file) return res.status(404).send("File not found");

  const buffer = Buffer.from(file.content, 'base64');
  res.setHeader('Content-Disposition', `inline; filename="${file.fileName}"`);
  res.setHeader('Content-Type', file.mimeType);
  res.send(buffer);
});

app.post('/uploadattachments', async (req, res) => {
  const supplierName = req.body.supplierName;
  const username= req.body.username;

  if (req.files && req.files.files) {
    // Normalize to array (even if only 1 file)
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    console.log(files);
    // Save all attachments
    for (const uploadedFile of files) {
      const base64Content = uploadedFile.data.toString('base64');
      await INSERT.into('my.username.Attachment').entries({
        ID: cds.utils.uuid(),
        username,
        supplierName,
        fileName: uploadedFile.name,
        mimeType: uploadedFile.mimetype,
        filesize: Math.round(uploadedFile.size / 1024),
        content: base64Content,
        uploadedAt: new Date()
      });
    }
    

    try {
      const [vendor] = await SELECT.from('my.username.Supplier').where({ supplierName,username });
      if (!vendor) {
        console.error("Vendor not found for BPA");
        return res.status(404).send({ message: "Vendor not found" });
      }

      // ✅ Trigger BPA only once per supplier
      setTimeout(async () => {
        try {
          await triggerNextApprover(supplierName,username);
          console.log(`✅ BPA triggered for supplier ${supplierName}`);
        } catch (err) {
          console.error(`❌ BPA trigger failed for supplier ${supplierName}:`, err);
        }
      }, 10000);

      res.send({ message: `${files.length} file(s) uploaded, BPA trigger scheduled` });
    } catch (err) {
      console.error("❌ Error after file upload:", err);
      res.status(500).send({ message: "Error after file upload" });
    }
  } else {
    res.status(400).send({ message: "No file uploaded" });
  }
});




async function triggerNextApprover(supplierName,username) {
  const vendor = await SELECT.one
    .from('my.username.Supplier')
    .columns(
      'supplierName',
      'username',
      'primaryContact.email',
      'primaryContact.phone',
      'mainAddress.country'
    )
    .where({ supplierName,username });


  const approvals = await SELECT.from('my.username.ApproverComment')
    .where({ sup_name: supplierName,username })
    .orderBy('level asc');

  const allPreviousComments = approvals
    .filter(a => a.status !== 'PENDING' && a.comment)
    .map(a => `${a.email} ${new Date(a.updatedAt || new Date()).toLocaleString()} - ${a.comment}`)
    .join("\n");

  for (const approver of approvals) {
    if (approver.status === 'PENDING') {
      await startBPAWorkflow({
        username: vendor.username,
        name: vendor.supplierName,
        email: vendor.primaryContact_email,
        country: vendor.mainAddress_country,
        phone: vendor.primaryContact_phone,
        status: "PENDING",
        approver_name: approver.name,
        approver_email: approver.email,
        approver_level: approver.level,
        prior_comments: allPreviousComments || "No prior comments"
      });
      break;
    }
  }
}

app.post('/bpa-callback', async (req, res) => {
  try {
    const { suppliername, level, status, comment, email,username } = req.body;
    if (!suppliername || !level || !status || !email || !username) return res.status(400).send("Missing fields");

    const comments = comment ?? "No Comments";

    await UPDATE('my.username.ApproverComment')
      .set({ status, comment: comments, updatedAt: new Date() })
      .where({ sup_name: suppliername, level, email,username });

    if (status === 'Rejected') {
      const currentLevelNum = Number(level);
      const approvers = await SELECT.from('my.username.ApproverComment')
        .where({ sup_name: suppliername,username });
      for (let approver of approvers) {
        const lvlNum = Number(approver.level);
        if (lvlNum > currentLevelNum) {
          await UPDATE('my.username.ApproverComment')
            .set({
              status: 'REJECTED',
              comment: 'Auto-rejected due to previous rejection'
            })
            .where({ sup_name: suppliername, level: approver.level,username });
        }

      }
      await UPDATE('my.username.Supplier')
        .set({ status: "REJECTED" })
        .where({ supplierName: suppliername,username });
      return res.send({ message: "Approval rejected." });
    }

    const nextLevel = (parseInt(level, 10) + 1).toString();
    const next = await SELECT.one.from('my.username.ApproverComment')
      .where({ sup_name: suppliername, level: nextLevel,username });

    if (next) {
      await triggerNextApprover(suppliername,username);
    } else {
      const vendor = await SELECT.one.from('my.username.Supplier').where({ supplierName: suppliername,username });
      await createBusinessPartnerInS4(vendor);
      return res.send({ message: "All levels approved." });
    }

    res.send({ message: "Approval recorded. Next level in progress." });
  } catch (err) {
    console.error("❌ BPA callback failed:", err);
    res.status(500).send("Callback failed");
  }
});


const { aBusinessPartner } = require('./src/generated/A_BUSINESS_PARTNER');

async function createBusinessPartnerInS4(vendor) {
  const { businessPartnerApi } = aBusinessPartner();

  try {
    const partnerEntity = businessPartnerApi.entityBuilder()
      .businessPartnerCategory("2")
      .businessPartnerGrouping("BP02")
      .firstName(vendor.supplierName)
      .personFullName(vendor.supplierName)
      .businessPartnerFullName(vendor.supplierName)
      .nameCountry("US")
      .businessPartnerName(vendor.supplierName)
      .organizationBpName1(vendor.supplierName)
      .build();

    console.log("Payload:", partnerEntity);

    const result = await businessPartnerApi
      .requestBuilder()
      .create(partnerEntity)
      .execute({ destinationName: 'vendordestination' });

    console.log("Business Partner created:", result);
    const bpId = result.businessPartner;
    await UPDATE('my.username.Supplier')
      .set({ businessPartnerId: bpId, status: "APPROVED" })
      .where({ supplierName: vendor.supplierName,username: vendor.username });
    return result;
  } catch (error) {
    console.error("Error creating Business Partner:", error.rootCause?.response?.data?.error?.message?.value || error.message);
    throw error;
  }

}
async function getAppHostURLFromDestination() {


  const destination = await getDestination({ destinationName: 'vendorportaldest' }, { useCache: true });
  console.log("destination fetched", destination)
  if (!destination || !destination.url) throw new Error("Destination not found or invalid");
  return destination.url.replace(/\/$/, '');
}

async function startBPAWorkflow({username, name, email, country, phone, status, approver_name, approver_email, approver_level, prior_comments }) {
  const files = await SELECT.from('my.username.Attachment').columns('ID', 'fileName').where({ supplierName: name,username });
  var host = '';
  //host = `https://the-hackett-group-d-b-a-answerthink--inc--at-development1a73fa6.cfapps.us10.hana.ondemand.com`;
  host = await getAppHostURLFromDestination();
  const fileLinks = files.map(file => `${host}/downloadFile/${file.ID}`);
  const fileZipLink = `${host}/downloadZip/${name}/${username}`;

  const [attachment1, attachment2] = [fileLinks[0] || "", fileLinks[1] || ""];

  return await executeHttpRequest(
    { destinationName: 'spa_process_destination' },
    {
      method: 'POST',
      url: "/",
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        definitionId: "us10.at-development-hgv7q18y.vendorportalbuildautomation.vendorportalprocess",
        context: {
          _name: name,
          username,
          email,
          country,
          phone,
          status,
          attachment1,
          attachment2,
          attachments: fileZipLink,
          approver_name,
          approver_level,
          approver_email,
          prior_comments
        }
      }
    }
  );

}

module.exports = cds.service.impl(function () {
  this.on('getsuppliers', async (req) => {
    const { username } = req.data;

    if (!username) {
        return req.error(400, 'A username is required to fetch suppliers.');
    }
    try {
      return await cds.run(
        SELECT.from('my.username.Supplier').columns(
          '*',
          { ref: ['mainAddress'], expand: ['*'] },
          { ref: ['categoryAndRegion'], expand: ['*'] },
          { ref: ['primaryContact'], expand: ['*'] },
          { ref: ['additionalInfo'], expand: ['*'] }
        ).where({ username })
      );
    } catch (e) {
      return req.error(500, 'Error fetching suppliers: ' + e.message);
    }
  });
  this.on('checkIfSupplierExists', async (req) => {
        const { supplierName,username } = req.data;
        if (!supplierName || !username) {
            return false;
        }
        // Use SELECT.one to be efficient. We only need to know if at least one exists.
        const existingSupplier = await SELECT.one.from('my.username.Supplier').where({ supplierName: supplierName,username });
        
        // If 'existingSupplier' is not null, it exists. Return true. Otherwise, return false.
        return !!existingSupplier; 
    });
  this.on('createSupplierWithFiles', async (req) => {
    try {
      const supplierData = req.data.supplierData;
      const username= req.data.username;
      const exists = await SELECT.one.from('my.username.Supplier').where({ supplierName: supplierData.supplierName,username });
      if (exists) return req.error(400, `Supplier '${supplierData.supplierName}' already exists`);

      const addressId = cds.utils.uuid();
      await INSERT.into('my.username.Address').entries({ ID: addressId, ...supplierData.mainAddress });

      const contactId = cds.utils.uuid();
      await INSERT.into('my.username.Contact').entries({ ID: contactId, ...supplierData.primaryContact });

      const catRegId = cds.utils.uuid();
      await INSERT.into('my.username.CategoryRegion').entries({ ID: catRegId, ...supplierData.categoryAndRegion });

      const addInfoId = cds.utils.uuid();
      await INSERT.into('my.username.AdditionalInfo').entries({ ID: addInfoId, ...supplierData.additionalInfo });

      const supplierId = cds.utils.uuid();
      await INSERT.into('my.username.Supplier').entries({
        username,
        ID: supplierId,
        supplierName: supplierData.supplierName,
        aiExtractedText : "-",
    gstValidationStatus : "Failed",
    gstValidationRemarks : "-",
        status: "PENDING",
        businessPartnerId: "-",
        mainAddress_ID: addressId,
        primaryContact_ID: contactId,
        categoryAndRegion_ID: catRegId,
        additionalInfo_ID: addInfoId
      });
      const OUser= await SELECT.from('my.username.gst').where({ supplierName:supplierData.supplierName,username })
      console.log(OUser)
      
      const hasFailedEntry = OUser.some(entry => entry.status === 'Failed');
    console.log(hasFailedEntry)
    if(!hasFailedEntry && OUser.length >= 1)
    {
      const approversList = await SELECT.from('my.username.Approver').orderBy('level').where({ country: supplierData.mainAddress.country });

      const approvalEntries = approversList.map(approver => ({
        username,
        sup_name: supplierData.supplierName,
        level: approver.level,
        email: approver.email,
        name: approver.name,
        status: 'PENDING',
        updatedAt: new Date().toISOString()
      }));

      if (approvalEntries.length) {
        await INSERT.into('my.username.ApproverComment').entries(approvalEntries);
      }
    }
      

      return `Supplier ${supplierData.supplierName} created successfully`;
    } catch (err) {
      req.error(500, 'Error creating supplier: ' + err.message);
    }
  });

  this.on("Approvers", async (req) => {
    try {
      return await cds.run(
        SELECT.from('my.username.Approver')
      );
    } catch (e) {
      return req.error(500, 'Error fetching approvers: ' + e.message);
    }
  });

  this.on("deleteapprover", async (req) => {
    const { name, level, country } = req.data;

    if (!name) {
        return req.error(400, 'An approver ID must be provided for deletion.');
    }

    try {
        const result = await DELETE.from('my.username.Approver').where({name, level, country});

        if (result === 0) {
            return req.warn(404, `Approver with name ${name} not found.`);
        }

        return { message: "Approver deleted successfully." };

    } catch (e) {
        return req.error(500, 'Error deleting approver: ' + e.message);
    }
});

  this.on("resetAllData", async () => {
    try {

      const destination = await getDestination({ destinationName: 'gstcheck_api' }, { useCache: false });
      console.log("destination fetched", destination)
      if (!destination || !destination.url) throw new Error("Destination not found or invalid");
      console.log(destination.url.replace(/\/$/, ''));
      await DELETE.from("my.username.Attachment");
      await DELETE.from("my.username.ApproverComment");
      await DELETE.from("my.username.Supplier");
      await DELETE.from("my.username.Address");
      await DELETE.from("my.username.Contact");
      await DELETE.from("my.username.gst");
      await DELETE.from("my.username.CategoryRegion");
      await DELETE.from("my.username.AdditionalInfo");

      return "All data deleted successfully!";
    } catch (e) {
      return `Error deleting data: ${e.message}`;
    }
  });


  this.on("approverentry", async (req) => {
    try {
      const { approverentry } = req.data;
      const { level, country } = approverentry;

      const exists = await SELECT.one.from("my.username.Approver")
        .where({ level: level, country: country });

      if (exists) {
        return `Approver already exists for Level ${level} and Country ${country}`;
      }

      await INSERT.into("my.username.Approver").entries(approverentry);

      return `Approver entry inserted successfully for Level ${level}, country ${country}`;
    } catch (e) {
      return req.error(500, "Error inserting approver entry: " + e.message);
    }
  });

  this.on("approverupdateentry", async (req) => {
    try {
      const { approverentry } = req.data;
      const { level, country } = approverentry;

      // check if record exists
      const exists = await SELECT.one.from("my.username.Approver")
        .where({ level: level, country: country });

      if (!exists) {
        return req.error(404, `No approver found for Level ${level} and Country ${country}`);
      }


      await UPDATE("my.username.Approver")
        .set(approverentry)
        .where({ level: level, country: country });

      return `Approver entry updated successfully for Level ${level}, Country ${country}`;
    } catch (e) {
      return req.error(500, "Error updating approver entry: " + e.message);
    }
  });


  this.on('Approvals', async (req) => {
    const { suppliername,username } = req.data;
    if (!suppliername && !username) return "Not found";
    const approvals = await SELECT.from('my.username.ApproverComment')
      .columns('level', 'status', 'comment', 'email', 'name')
      .where({ sup_name: suppliername , username});

    return approvals;
  });

   this.on('saveextractedtext', async (req) => {
        const { suppliername, extractedGstin,username } = req.data; // Matches your CDS action definition
        
        // Note: The field in the Supplier entity should match, e.g., 'extractedText'
        const result = await UPDATE('my.username.Supplier')
            .set({ aiExtractedText: extractedGstin }) 
            .where({ supplierName: suppliername,username });

        if (result === 0) {
            return req.error(404, `Supplier '${suppliername}' not found.`);
        }
        return `Extracted text for ${suppliername} has been saved.`;
    });

    // Correct implementation for saveValidationResult
    this.on('saveValidationResult', async (req) => {
        const { supplierName, field, validationStatus, validationRemarks,username } = req.data;

        // You are CREATING new validation entries, so you must use INSERT.
        await INSERT.into('my.username.gst').entries({
            username,
            supplierName: supplierName,
            field: field,
            status: validationStatus,
            remarks: validationRemarks
        });
        
        return `Validation result for field '${field}' has been saved.`;
    });

  this.on('deletesuppliers', async (req) => {
    const { supplierName,username } = req.data;
    if (!supplierName) {
        return req.error(400, "Missing supplierName in request data.");
    }

    // Use a transaction to ensure all deletes succeed or none do.
    const tx = cds.transaction(req);

    try {
        // Step 1: Find the Supplier to get the foreign keys for associated entities.
        // We need these because Address, Contact, etc., don't have the 'supplierName' field.
        const supplier = await tx.read('my.username.Supplier')
            .where({ supplierName: supplierName,username })
            .columns([
                'mainAddress_ID', 
                'primaryContact_ID', 
                'categoryAndRegion_ID', 
                'additionalInfo_ID'
            ]);
        if (!supplier) {
            return req.warn(404, `Supplier '${supplierName}' not found.`);
        }
        const deleteBySupplierNamePromises = [
            tx.delete('my.username.Attachment').where({ supplierName: supplierName, username }),
            tx.delete('my.username.ApproverComment').where({ sup_name: supplierName, username }),
            tx.delete('my.username.gst').where({ supplierName: supplierName, username })
        ];

        await Promise.all(deleteBySupplierNamePromises);
        const deleteByAssociationPromises = [];
        if (supplier.mainAddress_ID) {
            deleteByAssociationPromises.push(tx.delete('my.username.Address').where({ ID: supplier.mainAddress_ID }));
        }
        if (supplier.primaryContact_ID) {
            deleteByAssociationPromises.push(tx.delete('my.username.Contact').where({ ID: supplier.primaryContact_ID }));
        }
        if (supplier.categoryAndRegion_ID) {
            deleteByAssociationPromises.push(tx.delete('my.username.CategoryRegion').where({ ID: supplier.categoryAndRegion_ID }));
        }
        if (supplier.additionalInfo_ID) {
            deleteByAssociationPromises.push(tx.delete('my.username.AdditionalInfo').where({ ID: supplier.additionalInfo_ID }));
        }

        if (deleteByAssociationPromises.length > 0) {
            await Promise.all(deleteByAssociationPromises);
        }

        // Step 4: Finally, delete the main Supplier record itself.
        await tx.delete('my.username.Supplier').where({ supplierName: supplierName,username });
        
        // If everything was successful, the transaction will be committed automatically.
        return { message: `Successfully deleted supplier '${supplierName}' and all related data.` };

    } catch (error) {
        // If any of the delete operations fail, the transaction will be rolled back.
        req.error(500, `Failed to delete supplier '${supplierName}': ${error.message}`);
    }
});
  this.on("downloadAttachments", async (req) => {
    const { supplierName,username } = req.data;
    if (!supplierName) return req.error(400, "Missing supplierName");

    const files = await SELECT.from('my.username.Attachment')
      .columns("fileName", "mimeType", "content","filesize","uploadedAt")
      .where({ supplierName,username });

    if (!files || files.length === 0) {
      return req.error(404, "No files found for supplier " + supplierName);
    }

    return files.map((file) => ({
      fileName: file.fileName,
      mimeType: file.mimeType,
      content: file.content?.toString("base64"),
      filesize:file.filesize,
      uploadedAt:file.uploadedAt
    }));
  });

this.on('sendOtp', async (req) => {
        const { email } = req.data;
        if (!email) {
            return req.error(400, 'Email is required');
        }

        const existingUser = await SELECT.one.from('my.username.Users').where({ email: email });
        if (existingUser) {
            return req.error(409, 'An account with this email address already exists.');
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await UPSERT.into('my.username.Otps').entries({
            email: email,
            code: otp,
            expiresAt: expiresAt.toISOString()
        });

        try {
            const mailConfig = {
                to: email,
                subject: 'Your Verification Code for Vendor Portal',
                text: `Your one-time password (OTP) is: ${otp}. It is valid for 10 minutes.`
            };
            await sendMail({ destinationName: 'sap_process_automation_mail' }, [mailConfig]);
            return `An OTP has been sent to ${email}.`;
        } catch (error) {
            console.error("Failed to send email:", error.message);
            return req.error(500, 'Could not send the verification email.');
        }
    });
    this.on('verifyOtp', async (req) => {
        const { email, otp } = req.data;
        if (!email || !otp) {
            return req.error(400, 'Email and OTP are required.');
        }
        const otpRecord = await SELECT.one.from('my.username.Otps').where({ email: email });
        if (!otpRecord || otpRecord.code !== otp) {
            return req.error(400, 'Invalid OTP.');
        }
        if (new Date() > new Date(otpRecord.expiresAt)) {
            await DELETE.from('my.username.Otps').where({ email: email });
            return req.error(400, 'OTP has expired. Please request a new one.');
        }
        return { success: true, message: 'OTP verified successfully.' };
    });


    this.on('registerUser', async (req) => {
        const { firstName, lastName, email, username, password } = req.data;
        
        if (!firstName || !lastName || !email || !username || !password) {
            return req.error(400, 'All fields are required.');
        }
      

        const existingUser = await SELECT.one.from('my.username.Users').where({ username: username });
        if (existingUser) {
            return req.error(409, 'This username is already taken. Please choose another one.');
        }

        try {
            await INSERT.into('my.username.Users').entries({
                firstName,
                lastName,
                email,
                username,
                password: password
            });

            await DELETE.from('my.username.Otps').where({ email: email });

            return { success: true, message: 'Registration successful! You can now log in.' };
        } catch (error) {
            console.error('Error during user registration:', error);
            return req.error(500, 'An unexpected error occurred during registration.');
        }
    });

    this.on('login', async (req) => {
    const { username, password } = req.data;

    if (!username || !password) {
        return { success: false, message: 'Username and password are required.' };
    }

    const oUser = await SELECT.one.from('my.username.Users').where({ username: username });

    if (!oUser) {
        return { success: false, message: 'Username not found.Please Register' };
    }

    if (oUser.PASSWORD !== password) {
        return { success: false, message: 'Invalid Password. Please try again.' };
    }

    return { success: true, message: 'Login successful!' };
});

  this.on('userinfo', async (req) => {
    const { username } = req.data;

    if (!username) {
        return { success: false, message: 'Username is required.' };
    }

    const oUser = await SELECT.one.from('my.username.Users').where({ username: username });

    return { firstName: oUser.FIRSTNAME, lastName: oUser.LASTNAME, email: oUser.EMAIL,username: username  };
});


});