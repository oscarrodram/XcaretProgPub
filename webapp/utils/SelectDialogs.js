sap.ui.define([
    "com/xcaret/receptionpublic/utils/Model",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/m/Token",
    "com/xcaret/receptionpublic/utils/I18n"
], function (Model, SelectDialog, StandardListItem, Token, I18n) {
    "use strict";

    return {
        CreateStyleSheet: function(oEvent, oController, sFilterParam){
            let i18n = I18n.getTranslations(oController);
            let oModel = oController.getView().getModel("JSONModel");
            return new Promise((resolve) => {
                let oSelectDialog = new SelectDialog({
                    title: `${i18n.getText("Sel_Dia_Header_StyleSheet")}`,
                    items: {
                        path: `/ProductSheet`,
                        template: new StandardListItem({
                            title: `{NAME}`,
                            description: `{ID_HOJA}`
                        })
                    },
                    confirm: function(oEvent) {
                        /*let selectedItems = oEvent.getParameter("selectedItems");
                        if (!selectedItems) return;
                        oMultiInputFilter.removeAllTokens();
                        for (let selectedItem of selectedItems) {
                            let token = new Token({
                                key: selectedItem.getDescription() || selectedItem.getTitle(),
                                text: selectedItem.getTitle()
                            });
                            oMultiInputFilter.addToken(token);
                        }
                        */
                        oEvent.getSource().destroy(); // Aquí solo se cierra, no se destruye
                        resolve(true);
                    },
                    search: function(oEvent) {
                        //let sValue = oEvent.getParameter("value");
                        //let oFilter = new Filter(sFilterParam, sap.ui.model.FilterOperator.Contains, sValue);
                        //oEvent.getSource().getBinding("items").filter([oFilter]);
                    },
                    cancel: function(oEvent) {
                        oEvent.getSource().destroy(); // También solo cierra
                        resolve(false);
                    }
                });
                oSelectDialog.setModel(oModel);
                oSelectDialog.open("");
            });
        },

        Create: function(oEvent, oController, APIPath, PropertyID, PropertyDescription,){
            const i18 = oController.getOwnerComponent().getModel("i18n").getResourceBundle();
			let oMultiInput = oEvent.getSource();

			let aData = Model.getModel(oController, APIPath);
            let oSelectDialog = new SelectDialog({
                title: "filtro",
                items: {
                    path: "/oData",
                    template: new StandardListItem({
                        title: PropertyID,
                        description: PropertyDescription
                    })
                },
                confirm: function(oEvent) { // Confirm Button
                    let selectedItem = oEvent.getParameter("selectedItem");
                    let token = new Token({
                        key: selectedItem.getProperty("title"),
                        text: selectedItem.getProperty("description")
                    });
                    oMultiInput.removeAllTokens();
                    oMultiInput.addToken(token);
                    oMultiInput.fireTokenUpdate();
                    oSelectDialog.destroy();
                },
                search: function(oEvent) { // Search Event
                    let sValue = oEvent.getParameter("value");
                    let oFilter = new sap.ui.model.Filter(`${PropertyDescription}`, sap.ui.model.FilterOperator.Contains, sValue);
                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                cancel: function(oEvent){ // Cancel Button
                    oSelectDialog.destroy();
                }
            });
            // Set Items of Model
            let oTempModel = new sap.ui.model.json.JSONModel({ oData: aData });
            oSelectDialog.setModel(oTempModel);
            oSelectDialog.open("");
        },

        CreateUserDialog: function(oEvent, oController, APIPath, PropertyID, PropertyDescription,){
            const i18 = oController.getOwnerComponent().getModel("i18n").getResourceBundle();
			let oMultiInput = oEvent.getSource();
			let aData = Model.getModel(oController, APIPath);
            let oSelectDialog = new SelectDialog({
                title: i18.getText("I_General_Manager_Receptor"),
                items: {
                    path: "/oData",
                    template: new StandardListItem({
                        title: PropertyDescription,
                        description: PropertyID
                    })
                },
                confirm: function(oEvent) { // Confirm Button
                    let selectedItem = oEvent.getParameter("selectedItem");
                    let token = new Token({
                        key: selectedItem.getProperty("description"),
                        text: selectedItem.getProperty("title")
                    });
                    oMultiInput.removeAllTokens();
                    oMultiInput.addToken(token);
                    oMultiInput.fireTokenUpdate();
                    oSelectDialog.destroy();
                },
                search: function(oEvent) { // Search Event
                    let sValue = oEvent.getParameter("value");
                    let oFilter = new sap.ui.model.Filter(`${PropertyDescription}`, sap.ui.model.FilterOperator.Contains, sValue);
                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                cancel: function(oEvent){ // Cancel Button
                    oSelectDialog.destroy();
                }
            });
            // Set Items of Model
            let oTempModel = new sap.ui.model.json.JSONModel({ oData: aData });
            oSelectDialog.setModel(oTempModel);
            oSelectDialog.open("");
        }
    };
});