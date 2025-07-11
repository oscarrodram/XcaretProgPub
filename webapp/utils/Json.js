sap.ui.define([
    "com/xcaret/receptionpublic/utils/Model",
    "com/xcaret/receptionpublic/utils/Dates"
], function (Model, Dates) {
    "use strict";

    return {
        getScheduleLine: async function(Controller, Modification){
            let ScheduleLine = {};
            let oModelScheduleLine = Model.getModel(Controller, "/ScheduleLine");
            let oModelRanges = Model.getModel(Controller, "/Range");

            // EBELN // ID
            if(!Modification){
                ScheduleLine.EBELN = oModelRanges.COUNT;
            }

            // ID_PEP // Proyect ID
            let inputProject = Controller.byId("InputProject");
            let oTokens = inputProject.getTokens();
            for(const oToken of oTokens){
                ScheduleLine.ID_PEP = oToken.getKey();
            }

            // RE_TYPE // Reception Type
            ScheduleLine.RE_TYPE = 2; // Área Pública 2

            // PSPNR // Location ID
            let inputLocation = Controller.byId("InputLocation");
            for(const oToken of oTokens){
                ScheduleLine.PSPNR = oToken.getKey();
            }

            // LGPLA // Location Item
            let locationToken = inputLocation.getTokens()[0];
            ScheduleLine.LGPLA = locationToken.getProperty("key");

            // LGORT Warehouse
            let roomText = Controller.byId("TextClaveHabitacion");
            ScheduleLine.LGORT = roomText.getText();

            // RESP // Receptor Manager
            let multiManagerReceptor = Controller.byId("MultiInReceptorManager");
            for(const oToken of multiManagerReceptor.getTokens()){
                ScheduleLine.RESP = oToken.getKey();
            }

            // ERNAM // Creator User
            let userInfo = sap.ushell.Container.getUser();
            ScheduleLine.ERNAM = userInfo.getId();

            // ERNAM2 // Modifier User
            ScheduleLine.ERNAM2 = userInfo.getId();

            // DATETIME // Input Datetime
            let inputDateTime = Controller.byId("InputProggrammingDateTime");
            let oReceptionDate = Dates.getReceptionDate(inputDateTime);

            ScheduleLine.DATETIME = oReceptionDate;

            // Unit Quantities
            let oInputUnitQuantity = Controller.byId("idUnitQuantityInput");
            let sUnitQuantityValue = oInputUnitQuantity.getValue();
            ScheduleLine.HABQTY = sUnitQuantityValue;

            let Items = [];
            for (const item of oModelScheduleLine) {
                let Item = {};
                Item.EBELN = ScheduleLine.EBELN;
                Item.EBELP = item.IT_PositionItem;
                
                // Material
                Item.MATNR = item.IT_Material_ID.replace("(", "").replace(")", "");

                // Material Description
                Item.MAKTX1 = item.IT_Material;

                // Status
                if(Modification) Item.STATU = item.IT_Status;
                else Item.STATU = "0";

                // Unit of Measure
                Item.MEINS = item.IT_UnitMeasure;

                // Bought Quantity
                Item.MENGE = item.IT_BoughtQuantity;

                // Delivered Quantity
                Item.WEMNG = item.IT_DeliveredQuantity;
                if(Item.STATU === "3") Item.WEMNG = "0";

                // Requirement ID
                Item.BANFN = item.IT_BANFN;

                // Position of Requirement
                Item.BNFPO = item.IT_BNFPO;

                // Position Type
                Item.TYPE = "R";
                if(item.IT_DocumentType === "Contract"){
                    // Position Type
                    Item.TYPE = "C";
                    // Contract ID
                    Item.ID_CON = item.IT_ID.split(" ")[0];
                    // Position of Contract
                    Item.CONPO = item.IT_ID.split(" ")[1].replace("(", "").replace(")", "");
                }
                Items.push(Item);
            }
            ScheduleLine.Items = Items;
            return ScheduleLine;
        },

        getContractUpdate: function(Controller, type){
            let oModelScheduleLine = Model.getModel(Controller, "/ScheduleLine");
            let aContracts = [];
            for (const item of oModelScheduleLine.filter(n => n.IT_DocumentType === "Contract")) {
                let contract = {};
                // Contract ID
                contract.ID_CON = item.IT_ID.split(" ")[0];

                // Position of contract
                contract.CONPO = item.IT_ID.split(" ")[1].replace("(", "").replace(")", "");

                // Available Quantity
                let deliveredQuantity = parseFloat(item.IT_DeliveredQuantity);

                if(type === "Creation"){
                    contract.ADD_QUANTITY = deliveredQuantity.toString();
                }else{
                    let statusProcess = `${item.IT_Initial_Status}|${item.IT_Status}`
                    let initialQuantity = parseFloat(item.IT_MemoryWEMNGQuantity) || 0;
                    switch (statusProcess) { //
                        case "0|0": // Active to Active
                            contract.ADD_QUANTITY = ((initialQuantity - deliveredQuantity) * -1).toString();
                            break;
                        case "0|3": // Active to Inactive
                            contract.ADD_QUANTITY = (initialQuantity * -1).toString();
                            break;
                        case "3|0": // Inactive to Active
                            contract.ADD_QUANTITY = deliveredQuantity.toString();
                            break;
                        default:
                            continue;
                    }
                }
                aContracts.push(contract);
            }
            return aContracts;
        },

        getRequirementUpdate: function(Controller, type){
            let oModelScheduleLine = Model.getModel(Controller, "/ScheduleLine");
            let aRequirements = [];
            for (const item of oModelScheduleLine.filter(n => n.IT_DocumentType === "Requirement")) {
                let requirement = {};
                // Contract ID
                requirement.BANFN = item.IT_ID.split(" ")[0];

                // Position of contract
                requirement.BNFPO = item.IT_ID.split(" ")[1].replace("(", "").replace(")", "");

                // Available Quantity
                let deliveredQuantity = parseFloat(item.IT_DeliveredQuantity);

                if(type === "Creation"){
                    requirement.ADD_QUANTITY = deliveredQuantity.toString();
                }else{
                    let statusProcess = `${item.IT_Initial_Status}|${item.IT_Status}`
                    let initialQuantity = parseFloat(item.IT_MemoryWEMNGQuantity) || 0;
                    switch (statusProcess) { //
                        case "0|0": // Active to Active
                            requirement.ADD_QUANTITY = ((initialQuantity - deliveredQuantity) * -1).toString();
                            break;
                        case "0|3": // Active to Inactive
                            requirement.ADD_QUANTITY = (initialQuantity * -1).toString();
                            break;
                        case "3|0": // Inactive to Active
                            requirement.ADD_QUANTITY = deliveredQuantity.toString();
                            break;
                        default:
                            continue;
                    }
                }
                aRequirements.push(requirement);
            }
            return aRequirements;
        },

        getRangeUpdate: function(Controller){
            let oModelRanges = Model.getModel(Controller, "/Range");
            let Count = parseInt(oModelRanges.COUNT) + 1;
            let aRange = { COUNT: Count };
            return aRange;
        }
    };
});