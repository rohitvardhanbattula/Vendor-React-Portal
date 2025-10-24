using my.username as my from '../db/newschema';

type approverinput {
    name    : String(100);
    email   : String(200);
    country : String(50);
    level   : Integer;
}
 
type SupplierInput {
    supplierName      : String(200);
    status: String(100);
    businessPartnerId   : String;
    aiExtractedText : LargeString;
    gstValidationStatus : String;
    gstValidationRemarks : String;
    mainAddress       : AddressInput;
    primaryContact    : ContactInput;
    categoryAndRegion : CategoryRegionInput;
    additionalInfo    : AdditionalInfoInput;
}
 
type AddressInput {
    street     : String(200);
    line2      : String(200);
    line3      : String(200);
    city       : String(100);
    postalCode : String(20);
    country    : String(100);
    region     : String(100);
}
 
type ContactInput {
    firstName : String(100);
    lastName  : String(100);
    email     : String(200);
    phone     : String(50);
}
 
type CategoryRegionInput {
    category : String(100);
    region   : String(100);
}
 
type AdditionalInfoInput {
    details : String(100);
}
 
 
type GSTAddressType {
    pncd  : String;
}
 
type GSTPradrType {
    adr  : String;
    addr : GSTAddressType;
}
 
type GSTDataType {
    pradr         : GSTPradrType;
    sts           : String;
    tradeNam      : String;
}
 
type GSTApiResponseType {
    flag    : Boolean;
    message : String;
    data    : GSTDataType;
}
 
@unrestricted
service SupplierService {
 
    action getsuppliers(username: String)                                       returns array of SupplierInput;
    function Approvers()                                          returns array of approverinput;
 
    action   approverentry(approverentry: approverinput)          returns String;
    action   approverupdateentry(approverentry: approverinput)          returns String;
    action   createSupplierWithFiles(supplierData: SupplierInput,username: String) returns String;
 
    function downloadAttachments(supplierName: String, username: String)            returns array of {
        fileName : String;
        mimeType : String;
        content  : LargeBinary;
        filesize: String(100);
    uploadedAt   : Timestamp;
    };
    function resetAllData() returns String;
    action Approvals(suppliername : String,username: String)                          returns array of {
    level : String;
    email  : String;
    name: String;
    status : String;
    comment: String;
    updatedAt: Timestamp;
  };
 
   
    function validateGST(gstin: String) returns GSTApiResponseType;
    action saveValidationResult(
        username: String,
        supplierName      : String,
        field    : String,
        validationStatus  : String,
        validationRemarks : String
    ) ;
    action saveextractedtext(
        username: String,
        suppliername :String,
        extractedGstin : String
    );
    action deletesuppliers(supplierName : String,username: String) returns { message : String };
    action deleteapprover(name : String, country: String, level: String) returns String;
    action checkIfSupplierExists(supplierName: String,username: String) returns Boolean;
    entity gst as projection on my.gst;
    action sendOtp(email : String) returns String;
    action verifyOtp(
        email : String,
        otp   : String
    ) returns {
        success : Boolean;
        message : String;
    };
    action registerUser(
        firstName : String,
        lastName  : String,
        email     : String,
        username  : String,
        password  : String
    ) returns {
        success : Boolean;
        message : String;
    };

    action login(
        username: String,
        password: String 
    ) returns String;


    action userinfo(
        username  : String
    ) returns {
        firstName : String;
        lastName  : String;
        email     : String;
        username  : String;
    };
}
 