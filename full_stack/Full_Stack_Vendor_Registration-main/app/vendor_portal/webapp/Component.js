    sap.ui.define([
        "sap/ui/core/UIComponent",
        "vendorportal/model/models",
        "sap/ui/model/json/JSONModel",
        
"sap/m/MessageToast",
        "sap/m/MessageBox",
    ], (UIComponent, models, JSONModel,MessageToast,MessageBox) => {
        "use strict";

        return UIComponent.extend("vendorportal.Component", {
            metadata: {
                manifest: "json",
                interfaces: [
                    "sap.ui.core.IAsyncContentCreation"
                ]
            },

            init() {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);
                var oSessionModel = new JSONModel({
                    username: "",
                    isAuthenticated: false
                });
                this.setModel(oSessionModel, "session");
                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                // enable routing
                this.getRouter().initialize();

                this.iLogoutTime = 20*60*1000;

            const aActivityEvents = ["click", "mousemove", "keydown", "scroll"];

            aActivityEvents.forEach(sEvent => {
                document.addEventListener(sEvent, () => this.resetInactivityTimer());
            });
            this.resetInactivityTimer();
            },
            resetInactivityTimer: function() {

            clearTimeout(this.inactivityTimer);

            this.inactivityTimer = setTimeout(() => {
                MessageBox.warning(
                `Your session is about to expire due to inactivity. You will need to re-login`, {
                    title: "Session Timeout Warning",
                    actions: [MessageBox.Action.OK], // This will be our "Refresh" button
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: (sAction) => {
                        if (sAction === MessageBox.Action.OK) {
                            this.getRouter().navTo("login", {}, true);
                        }
                    }
                }
            );
            }, this.iLogoutTime);
        },
        
        });
    });