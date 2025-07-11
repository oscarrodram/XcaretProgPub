sap.ui.define([
    "com/xcaret/receptionpublic/utils/I18n",
    "com/xcaret/receptionpublic/utils/SetInput",
    "com/xcaret/receptionpublic/utils/Model"
], function (I18n, SetInput, Model) {
    "use strict";

    return {
        validateReception: function (Controller, Type) { // Controller, API Route and Model name, Filter
            let i18n = I18n.getTranslations(Controller);

            // Get Table and Items
            let Table = Controller.byId("ScheduleLineItemTable");
			let Items = Table.getItems();
			if(Items.length === 0){
                return `Error, ${i18n.getText("Val_Items0")}`;
            }

            // Foreach for validate correct data
            for (const item of Items) {
                let Fields = item.getAggregation("cells");
                let Item_ID = this._findField(Fields, "IT_PositionItem");

                let IdentifierKey = this._findField(Fields, "IT_Key");
                if(!IdentifierKey) return `Error, IT_Key not found in ${Item_ID.getTitle()}`;
                let Index = IdentifierKey.getTitle();

                let ObjectStatus = this._findField(Fields, "IT_Status_Desc");
                let status = ObjectStatus.getText();

                let IdentifierAvailableQuantity = this._findField(Fields, "IT_BoughtQuantity");
                if(Type === "Modification") IdentifierAvailableQuantity = this._findField(Fields, "IT_AvailableQuantity");
                if(!IdentifierAvailableQuantity) return `Error, IT_BoughtQuantity not found in ${Item_ID.getTitle()}`;

                let InputDeliveryQuantity = this._findField(Fields, "IT_DeliveredQuantity");
                if(!InputDeliveryQuantity) return `Error, IT_DeliveredQuantity not found in ${Item_ID.getTitle()}`;
                let deliveryQuantity = parseFloat(InputDeliveryQuantity.getValue()) || 0;
                if(deliveryQuantity === 0 & status != "Deleted"){
                    SetInput.setError(InputDeliveryQuantity, i18n.getText("Val_DeliveredQuantity"));
                    return `ErrorSupplied`;
                }

                // Update Model View
                Model.setItemValue(Controller, "ScheduleLine", Index, "IT_DeliveredQuantity", deliveryQuantity);

                // Set initial behavior
                SetInput.setBehavior(InputDeliveryQuantity, "noClear", "setEnable");

                // Check Item Quantity
                let higherQuantity = this.validateQuantityItemTable(Controller, IdentifierAvailableQuantity, InputDeliveryQuantity);
                if(higherQuantity){
                    SetInput.setError(InputDeliveryQuantity, i18n.getText("DD_E_Input_Delivery_Excceded"));
                    return `ErrorSupplied`;
                }
            };
            let oModel = Controller.getView().getModel("JSONModel");
            let aMaterialStyleSheet = oModel.getProperty("/ProductSheetItems");
            let oModelScheduleLine = oModel.getProperty("/ScheduleLine");
            let oInputQuantityHab = Controller.byId("idUnitQuantityInput")
            let dQuantityHab = parseFloat(oInputQuantityHab.getValue()) || 0;
            if(dQuantityHab === 0) return "";
            let aQuantities = [];
            for(let oMaterial of aMaterialStyleSheet){
                let aScheduleLine = oModelScheduleLine.filter(({ IT_Material_ID, IT_Status }) => 
                    IT_Material_ID === `(${oMaterial.MATNR})` && IT_Status === `0`);
                if(!aScheduleLine.length) continue;
                let fTotalScheduleQuantity = 0;
                for(let oScheduleLine of aScheduleLine){
                    fTotalScheduleQuantity = fTotalScheduleQuantity + parseFloat(oScheduleLine.IT_DeliveredQuantity);
                }
                let fTotalMaterialQuantity = parseFloat(oMaterial.MENGE) * dQuantityHab;
                if(fTotalScheduleQuantity > fTotalMaterialQuantity){
                    let y = 0;
                    return `Error, ${i18n.getText("Msg_Quantity_Exceeded", 
                        [oMaterial.MATNR, fTotalMaterialQuantity.toString(), fTotalScheduleQuantity.toString()])}`;
                }
                if(fTotalScheduleQuantity < fTotalMaterialQuantity){
                    aQuantities.push({
                        sMaterialId : oMaterial.MATNR,
                        fTotalScheduleQuantity : fTotalScheduleQuantity,
                        fTotalMaterialQuantity : fTotalMaterialQuantity
                    });
                }
            }
            if (aQuantities.length) {
                let sMessage = aQuantities.map(q => i18n.getText("Msg_Quantity_Missing", [
                        q.sMaterialId,
                        q.fTotalMaterialQuantity.toString(),
                        q.fTotalScheduleQuantity.toString()
                    ])).join("\n");
                return `Warning: ${sMessage}`;
            }
            return "";
        },

        validateQuantityItemDialog: function(Controller, sBoughtQuantity, sDeliveryQuantity){
            let i18n = I18n.getTranslations(Controller);
            // Get Input Values
            let boughtQuantity = parseFloat(sBoughtQuantity);
            let deliveryQuantity = parseFloat(sDeliveryQuantity);

            // Validations
            // Validates than deliveryQuantity is not higher than boughtQuantity
            if(boughtQuantity - deliveryQuantity < 0){
                return "Error";
            }
        },

        validateQuantityItemTable: function(Controller, InputAvailable, InputDeliveried){
            let i18n = I18n.getTranslations(Controller);
            // Get Input Values
            let boughtQuantity = 0;
            if(InputAvailable.getTitle().length > 0) boughtQuantity = parseFloat(InputAvailable.getTitle());
            let deliveryQuantity = 0;
            if(InputDeliveried.getValue().length > 0) deliveryQuantity = parseFloat(InputDeliveried.getValue());

            // Validations
            // Validates than deliveryQuantity is not higher than boughtQuantity
            if(boughtQuantity - deliveryQuantity < 0){
                return "Error";
            }
        },

        _findField: function(FieldsItem, ID){
            let object;
            for (const field of FieldsItem) {
                if(object) break;
                let metadata = field.getMetadata();
                let name = metadata.getName();
                switch (name) {
                    case "sap.m.Input":{
                        let bindingInfo = field.getBindingInfo("value");
                        let binding = bindingInfo.binding;
                        let header = binding.getPath();
                        if(ID != header) continue;
                        object = field;
                        break;
                    }
                    case "sap.m.ObjectIdentifier":{
                        let bindingInfo = field.getBindingInfo("title");
                        let binding = bindingInfo.binding;
                        let header = binding.getPath();
                        if(ID != header) continue;
                        object = field;
                        break;
                    }
                    case "sap.m.ObjectStatus":{
                        let bindingInfo = field.getBindingInfo("text");
                        let binding = bindingInfo.binding;
                        let header = binding.getPath();
                        if(ID != header) continue;
                        object = field;
                        break;
                    }
                    default:{
                        break;
                    }
                }
            }
            return object;
        }
    };
});