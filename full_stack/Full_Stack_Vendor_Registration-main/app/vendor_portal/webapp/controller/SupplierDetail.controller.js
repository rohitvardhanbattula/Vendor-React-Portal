sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, History, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("vendorportal.controller.SupplierDetail", {
        onInit: function () {
            this.getView().setModel(new JSONModel({ attachments: [] }), "attachmentsModel");
            this.getView().setModel(new JSONModel({ status: [] }), "statusModel");
            this.getView().setModel(new JSONModel({ gstChecks: [] }), "gstValidationModel");
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("SupplierDetail").attachPatternMatched(this._onObjectMatched, this);
            var oUserModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oUserModel, "user");
        },
        _fetchUserData: async function (sUsername) {
            //const sUsername = this.getOwnerComponent().getModel("session").getProperty("/username");
            try {
                const response = await fetch(this.getURL() + "/odata/v4/supplier/userinfo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: sUsername })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to fetch user data: ${errorText}`);
                }

                const data = await response.json();
                this.getView().getModel("user").setData(data.value ? data.value[0] : data);

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        },

        _onObjectMatched: async function (oEvent) {
            const oView = this.getView();
            const sSupplierName = oEvent.getParameter("arguments").supplierId;
            // Get the username once and pass it to the other functions
            const sUsername = this.getOwnerComponent().getModel("session").getProperty("/username");

            if (!sUsername) {
                this.getOwnerComponent().getRouter().navTo("login", {}, true);
                return;
            }
            this._fetchUserData(sUsername);
            oView.setModel(new JSONModel({})); // Clear main model
            oView.getModel("attachmentsModel").setData({ attachments: [] });
            oView.getModel("statusModel").setData({ status: [] });
            oView.getModel("gstValidationModel").setData({ gstChecks: [] });
            oView.setBusy(true);

            try {
                // Call all fetch functions in parallel
                await Promise.all([
                    this._fetchSupplierDetails(sSupplierName, sUsername),
                    this._fetchApprovals(sSupplierName, sUsername),
                    this._fetchAttachments(sSupplierName, sUsername),
                    this._fetchGstDetails(sSupplierName, sUsername)
                ]);
            } catch (err) {
                MessageBox.error("Failed to load all supplier details: " + err.message);
            } finally {
                oView.setBusy(false);
            }
        },

        _fetchGstDetails: async function (sSupplierName, sUsername) {
            // CORRECTED: Filter through the 'supplier' association to get to the 'username'
            const sFilter = `$filter=supplierName eq '${encodeURIComponent(sSupplierName)}' and username eq '${encodeURIComponent(sUsername)}'`;
            const sUrl = this.getURL() + `/odata/v4/supplier/gst?${sFilter}`;
            try {
                const response = await fetch(sUrl);
                if (!response.ok) throw new Error("Failed to fetch GST details.");
                const data = await response.json();
                this.getView().getModel("gstValidationModel").setProperty("/gstChecks", data.value || []);
            } catch (err) {
                console.error(err.message);
            }
        },

        _fetchSupplierDetails: async function (sSupplierName, sUsername) {
            try {
                const response = await fetch(this.getURL() + `/odata/v4/supplier/getsuppliers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: sUsername })
                });
                if (!response.ok) throw new Error("Network error fetching suppliers.");
                const data = await response.json();
                const oSupplier = (data.value || []).find(s => s.supplierName === sSupplierName);

                if (oSupplier) {
                    this.getView().setModel(new JSONModel(oSupplier));
                    this.getView().bindElement("/");
                } else {
                    MessageBox.error("Supplier not found: " + sSupplierName);
                }
            } catch (err) {
                MessageBox.error("Error fetching supplier details: " + err.message);
            }
        },

        _fetchApprovals: async function (supplierName, sUsername) {

            try {
                const oPayload = {
                    suppliername: supplierName,
                    username: sUsername
                };

                // 2. Call the 'getApprovals' action using a POST request
                const response = await fetch(this.getURL() + `/odata/v4/supplier/Approvals`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(oPayload)
                });
                if (!response.ok) throw new Error("Network error fetching approvals.");
                const data = await response.json();
                this.getView().getModel("statusModel").setProperty("/status", data.value || []);
            } catch (err) {
                MessageBox.error("Error fetching approvals: " + err.message);
            }
        },

        _fetchAttachments: async function (supplierName, sUsername) {
            const sUrl = this.getURL() + `/odata/v4/supplier/downloadAttachments(supplierName='${encodeURIComponent(supplierName)}',username='${encodeURIComponent(sUsername)}')`;
            try {
                const response = await fetch(sUrl);
                if (!response.ok) throw new Error("Network error fetching attachments.");
                const data = await response.json();
                this.getView().getModel("attachmentsModel").setProperty("/attachments", data.value || []);
            } catch (err) {
                MessageBox.error("Error loading attachments: " + err.message);
            }
        },

        onNavBack: function () {
            const oHistory = History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();
            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("SupplierList", {}, true);
            }
        },

        getURL: function () {
            return sap.ui.require.toUrl("vendorportal");
        },

        onLogout: function () {
            MessageBox.confirm("Are you sure you want to log out?", {
                title: "Confirm Logout",
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this.getOwnerComponent().getModel("session").setData({});
                        this.getOwnerComponent().getRouter().navTo("login", {}, true);
                    }
                }
            });
        },
        formatMimeType: function (sMimeType) {

            if (!sMimeType) {
                return "";
            }

            switch (sMimeType.toLowerCase()) {
                case "application/pdf":
                    return "PDF";
                case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                    return "XLSX";
                case "application/vnd.ms-excel":
                    return "XLS";
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    return "DOCX";
                case "application/msword":
                    return "DOC";
                case "image/png":
                    return "PNG";
                case "image/jpeg":
                    return "JPEG";
                case "image/jpg":
                    return "JPG";
                default:

                    const aParts = sMimeType.split("/");
                    return aParts.length > 1 ? aParts[1].toUpperCase() : sMimeType.toUpperCase();
            }
        },

        onDownloadAttachment: function (oEvent) {
            const oAttachment = oEvent.getSource().getBindingContext("attachmentsModel").getObject();
            if (!oAttachment || !oAttachment.fileName) {
                MessageBox.warning("File information missing.");
                return;
            }
            const blob = this._base64ToBlob(oAttachment.content, oAttachment.mimeType);
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = oAttachment.fileName;
            link.click();
            URL.revokeObjectURL(link.href);
        }


    });
});