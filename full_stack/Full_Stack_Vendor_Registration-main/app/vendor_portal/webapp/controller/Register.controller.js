sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function (Controller, MessageToast, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("vendorportal.controller.Register", {
        getURL: function () {
            return sap.ui.require.toUrl("vendorportal");
        },
        onInit: function () {
            this.getView().setModel(new JSONModel(), "viewModel");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("register").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function() {
            this._resetView();
        },

        _resetView: function() {
            var oView = this.getView();
            oView.getModel("viewModel").setData({
                otpSent: false,
                otpVerified: false,
                emailEditable: true
            });
            oView.byId("emailInput").setValue("");
            oView.byId("otpInput").setValue("");
            oView.byId("firstNameInput").setValue("");
            oView.byId("lastNameInput").setValue("");
            oView.byId("usernameInput").setValue(""); // CORRECTED ID
            oView.byId("passwordInput").setValue(""); // CORRECTED ID
            oView.byId("confirmPasswordInput").setValue("");
            
            var registerButton = oView.byId("registerButton");
            if (registerButton) {
                registerButton.setEnabled(false);
            }
        },

        onBackToLogin: function () {
            this.getOwnerComponent().getRouter().navTo("login");
        },

        _callAction: async function (sActionName, oPayload) {
            const sUrl = this.getURL()+`/odata/v4/supplier/${sActionName}`;
            const oFetchOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(oPayload)
            };
            const oResponse = await fetch(sUrl, oFetchOptions);
            if (!oResponse.ok) {
                const oErrorData = await oResponse.json();
                throw new Error(oErrorData.error.message || `HTTP error! Status: ${oResponse.status}`);
            }
            return oResponse.json();
        },

        onSendOtp: async function () {
            var oView = this.getView();
            oView.byId("otpInput").setValue("");
            var sEmail = oView.byId("emailInput").getValue();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sEmail)) {
                MessageToast.show("Please enter a valid email address.");
                return;
            }
            var oButton = oView.byId("sendOtpButton");
            oButton.setBusy(true);
            try {
                const oResultData = await this._callAction("sendOtp", { email: sEmail });
                MessageToast.show(oResultData.value);
                oView.getModel("viewModel").setProperty("/otpSent", true);
                oView.getModel("viewModel").setProperty("/emailEditable", false);
            } catch (oError) {
                MessageBox.error("Failed to send OTP: " + oError.message);
            } finally {
                oButton.setBusy(false);
            }
        },

        onVerifyOtp: async function () {
            var oView = this.getView();
            var sEmail = oView.byId("emailInput").getValue();
            var sOtp = oView.byId("otpInput").getValue();
            var oButton = oView.byId("verifyOtpButton");
            oButton.setBusy(true);
            try {
                // IMPORTANT: Ensure your backend has a 'verifyOtp' action
                const oResultData = await this._callAction("verifyOtp", { email: sEmail, otp: sOtp });
                if (oResultData.success) {
                    MessageToast.show(oResultData.message);
                    oView.getModel("viewModel").setProperty("/otpVerified", true);
                    oView.getModel("viewModel").setProperty("/otpSent", false);
                }
            } catch (oError) {
                MessageBox.error("OTP Verification Failed: " + oError.message);
            } finally {
                oButton.setBusy(false);
            }
        },

        onRegister: async function() {
            var oView = this.getView();
            var sPassword = oView.byId("passwordInput").getValue(); // CORRECTED ID
            var sConfirmPassword = oView.byId("confirmPasswordInput").getValue();
            if (sPassword !== sConfirmPassword) {
                MessageBox.error("Passwords do not match.");
                return;
            }
            const oPayload = {
                firstName: oView.byId("firstNameInput").getValue(),
                lastName: oView.byId("lastNameInput").getValue(),
                email: oView.byId("emailInput").getValue(),
                username: oView.byId("usernameInput").getValue(), // CORRECTED ID
                password: sPassword
            };
            var oButton = oView.byId("registerButton");
            oButton.setBusy(true);
            try {
                const oResultData = await this._callAction("registerUser", oPayload);
                if (oResultData.success) {
                    MessageBox.success(oResultData.message, {
                        onClose: () => this.onBackToLogin()
                    });
                }
            } catch (oError) {
                MessageBox.error("Registration Failed: " + oError.message);
            } finally {
                oButton.setBusy(false);
            }
        },

        onInputChange: function() {
            var oView = this.getView();
            var bIsOtpVerified = oView.getModel("viewModel").getProperty("/otpVerified");
            if (!bIsOtpVerified) return;

            var bAllFilled = oView.byId("firstNameInput").getValue() &&
                             oView.byId("lastNameInput").getValue() &&
                             oView.byId("usernameInput").getValue() && // CORRECTED ID
                             oView.byId("passwordInput").getValue() && // CORRECTED ID
                             oView.byId("confirmPasswordInput").getValue();
            
            oView.byId("registerButton").setEnabled(!!bAllFilled);
        }
    });
});