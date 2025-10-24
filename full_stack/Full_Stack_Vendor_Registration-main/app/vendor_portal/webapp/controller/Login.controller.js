sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function (Controller, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("vendorportal.controller.Login", {
        getURL: function () {
            return sap.ui.require.toUrl("vendorportal");
        },
        onInit: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            // Make sure the route name "Login" matches the name in your manifest.json
            oRouter.getRoute("login").attachPatternMatched(this._onRouteMatched, this);
        },

        /**
         * Event handler for the pattern matched event of the route.
         * This function is executed every time the user navigates to this view.
         */
        _onRouteMatched: function () {
            // Clear the input fields
            this.getView().byId("usernameinput").setValue("");
            this.getView().byId("passwordinput").setValue("");
        },
        onLoginPress: async function () {
            const oView = this.getView();
            const sUsername = oView.byId("usernameinput").getValue();
            const sPassword = oView.byId("passwordinput").getValue();
            const oLoginButton = oView.byId("loginButton");

            if (!sUsername || !sPassword) {
                MessageBox.error("Please enter both username and password.");
                return;
            }

            oLoginButton.setBusy(true);
            try {
                const payload = { username: sUsername, password: sPassword };
                const response = await this._callAction("login", payload);

                if (response.success) {
                    MessageToast.show(response.message);
                    this.getOwnerComponent().getModel("session").setProperty("/username", sUsername);
                    this.getOwnerComponent().getModel("session").setProperty("/isAuthenticated", true);
                    this.getOwnerComponent().getRouter().navTo("View1");
                } else {
                    MessageToast.show(response.message);
                }

            } catch (error) {
                MessageBox.error("A server error occurred. Please try again later.");
            } finally {
                oLoginButton.setBusy(false);
            }
        },

        onRegister: function () {
            this.getOwnerComponent().getRouter().navTo("register");
        },

        onForgotPassword: function () {
            MessageToast.show("Forgot Password is not implemented.");
        },

        _callAction: async function (actionName, payload) {
            const response = await fetch(this.getURL() + `/odata/v4/supplier/${actionName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message);
            }
            return response.json();
        }
    });
});