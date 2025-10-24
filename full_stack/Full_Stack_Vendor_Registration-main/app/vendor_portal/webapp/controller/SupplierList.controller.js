sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator", "sap/ui/core/library"
], function (Controller, JSONModel, MessageBox, Filter, FilterOperator, coreLibrary) {
    "use strict";
    const ValueState = coreLibrary.ValueState;
    return Controller.extend("vendorportal.controller.SupplierList", {
        
        onInit: function () {
            this.getOwnerComponent().getRouter().getRoute("SupplierList").attachPatternMatched(this._onRouteMatched, this);
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

        _onRouteMatched: function () {
            const sUsername = this.getOwnerComponent().getModel("session").getProperty("/username");

            if (!sUsername) {
                this.getOwnerComponent().getRouter().navTo("login", {}, true);
                return;
            }
            this._fetchUserData(sUsername);
            let oModel = this.getView().getModel("supplierModel");
            if (oModel) {
                oModel.setData({ suppliers: [] });
            }

            this._fetchSuppliers();
        },

        _fetchSuppliers: async function () {
            const oList = this.byId("supplierTable");
            const username = this.getOwnerComponent().getModel("session").getProperty("/username");

            oList.setBusy(true);

            try {
                const response = await fetch(this.getURL() + "/odata/v4/supplier/getsuppliers", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.error?.message || 'Network response was not ok';
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                const suppliers = Array.isArray(data.value) ? data.value : [];
                let oModel = this.getView().getModel("supplierModel");

                if (oModel) {
                    oModel.setData({ suppliers: suppliers });
                } else {
                    oModel = new sap.ui.model.json.JSONModel({ suppliers: suppliers });
                    this.getView().setModel(oModel, "supplierModel");
                }

                oModel.refresh(true);
                this.byId("deleteModeButton").setVisible(suppliers.length > 0);

            } catch (err) {
                MessageBox.error("Error fetching suppliers: " + err.message);
            } finally {
                oList.setBusy(false);
            }
        },
        onClearFilters: function () {
            // Clear the input fields
            this.byId("filterName").setValue("");
            this.byId("filterCity").setValue("");

            // Reset the Select control to the "All" option
            this.byId("filterStatus").setSelectedKey("");

            // Trigger the filter logic again to refresh the table with no filters
            this.onFilterSuppliers();
        },
        onFilterSuppliers: function () {
            const oTable = this.byId("supplierTable");
            const oBinding = oTable.getBinding("items");
            const sName = this.byId("filterName").getValue();
            const sCity = this.byId("filterCity").getValue();
            const sStatus = this.byId("filterStatus").getSelectedKey();
            const aFilters = [];

            if (sName) {
                aFilters.push(new Filter("supplierName", FilterOperator.Contains, sName));
            }
            if (sCity) {
                aFilters.push(new Filter("mainAddress/city", FilterOperator.Contains, sCity));
            }
            if (sStatus) {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }
            oBinding.filter(aFilters);
        },

        onSupplierPress: function (oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const sSupplierName = oItem.getBindingContext("supplierModel").getProperty("supplierName");
            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("SupplierDetail", {
                supplierId: sSupplierName
            });
        },

        onDeleteMode: function () {
            const oTable = this.byId("supplierTable");
            oTable.setMode("MultiSelect");
            this.byId("deleteModeButton").setVisible(false);
            this.byId("confirmDeleteButton").setVisible(true);
            this.byId("cancelDeleteButton").setVisible(true);
        },

        onCancelDelete: function () {
            const oTable = this.byId("supplierTable");
            oTable.setMode("None");
            oTable.removeSelections(true);
            this.byId("deleteModeButton").setVisible(true);
            this.byId("confirmDeleteButton").setVisible(false);
            this.byId("cancelDeleteButton").setVisible(false);
        },

        onDeleteSelectedSuppliers: function () {
            const aSelectedItems = this.byId("supplierTable").getSelectedItems();

            if (aSelectedItems.length === 0) {
                MessageBox.warning("Please select at least one supplier to delete.");
                return;
            }

            const sConfirmationMessage = `Are you sure you want to delete these ${aSelectedItems.length} supplier(s)?`;
            MessageBox.confirm(sConfirmationMessage, {
                title: "Confirm Deletion",
                onClose: (sAction) => {
                    if (sAction === MessageBox.Action.OK) {
                        this._performDeletion(aSelectedItems);
                    }
                }
            });
        },

        _performDeletion: function (aItemsToDelete) {
            const username = this.getOwnerComponent().getModel("session").getProperty("/username");
            const sActionUrl = this.getURL() + "/odata/v4/supplier/deletesuppliers";
            const aPromises = aItemsToDelete.map(oItem => {
                const sSupplierKey = oItem.getBindingContext("supplierModel").getProperty("supplierName");
                return fetch(sActionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ supplierName: sSupplierKey,username })
                });
            });

            Promise.all(aPromises)
                .then(aResponses => {
                    const aFailed = aResponses.filter(res => !res.ok);
                    if (aFailed.length > 0) {
                        MessageBox.error(`${aFailed.length} deletion(s) failed.`);
                    } else {
                        MessageBox.success(`${aResponses.length} supplier(s) deleted successfully.`);
                    }
                })
                .catch(err => {
                    MessageBox.error("An error occurred during deletion: " + err.message);
                })
                .finally(() => {
                    this.onCancelDelete();
                    this._fetchSuppliers();
                });
        },

        onNavBack: function () {
            const oHistory = sap.ui.core.routing.History.getInstance();
            const sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getOwnerComponent().getRouter().navTo("View1", {}, true);
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
                        // Clear the session model and navigate cleanly
                        this.getOwnerComponent().getModel("session").setData({});
                        this.getOwnerComponent().getRouter().navTo("login", {}, true);
                    }
                }
            });
        },
        formatStatusState: function (sStatus) {
            switch (sStatus) {
                case "APPROVED": return ValueState.Success;
                case "REJECTED": return ValueState.Error;
                case "PENDING": return ValueState.Warning;
                default: return ValueState.None;
            }
        }
    });
});