sap.ui.define([
    "com/xcaret/receptionpublic/utils/I18n",
	"com/xcaret/receptionpublic/utils/GetServices"
], function (I18n, GetServices) {
    "use strict";

    return {
        setProjectModel: function(Controller, KeyValue){
            let oModel = Controller.getView().getModel("JSONModel");
            oModel.setProperty(`/ProjectKey`, {
                ID_PEP : KeyValue
            });
        },

        getProjectModel: function(Controller){
            let oModel = Controller.getView().getModel("JSONModel");
            return oModel.getProperty(`/ProjectKey/ID_PEP`);
        },

        getModel: function(Controller, Model){
            let oModel = Controller.getView().getModel("JSONModel");
            return oModel.getProperty(`${Model}`);
        },

        setModel: function(Controller, Path, Model){
            let oModel = Controller.getView().getModel("JSONModel");
            oModel.setProperty(`${Path}`, Model);
        },

        clearModel: function(Controller, Model){
            let oModel = Controller.getView().getModel("JSONModel");
            return oModel.setProperty(`${Model}`, []);
        },

        // Set Field Input
        setItemValue: function(Controller, Property, Path, Field, Value){
            let oModel = Controller.getView().getModel("JSONModel");
            oModel.setProperty(`/${Property}/${Path}/${Field}`, Value);
        },
        getItemValue: function(Controller, Property, Path){
            let oModel = Controller.getView().getModel("JSONModel");
            return oModel.getProperty(`/${Property}/${Path}`);
        },

        // Set Reception to ScheduleLine
        setScheduleLine: function(Controller){
            let i18n = I18n.getTranslations(Controller);
            let aReceptions = this.getModel(Controller, "/Reception");
            let oModel = Controller.getView().getModel("JSONModel");
            let aScheduleLines = [];
            let host = GetServices._getHost();
            for(const reception of aReceptions.items){
                let status = i18n.getText("IT_Status_0");
                if(reception.STATU === "1") status = i18n.getText("IT_Status_1");
                if(reception.STATU === "2") status = i18n.getText("IT_Status_2");
                if(reception.STATU === "3") status = i18n.getText("IT_Status_3");
                let id = `${reception.ID_CON} (${reception.CONPO})`;
                let id_front = reception.CON_NAME;
                let type = "Contract";
                let quantAvail = reception.CONTR_AVAIL;
                if(reception.TYPE === "R"){
                    id = `${reception.BANFN} (${reception.BNFPO})`;
                    id_front = `${reception.BANFN} (${reception.BNFPO})`;
                    type = "Requirement";
                    quantAvail = reception.EBAN_AVAIL;
                }
                let Entry = {
                    IT_Key: "",//oItem.sPath, ///
                    IT_ID: id, // Header ///
                    IT_ID_Front: id_front,
                    IT_DocumentType: type, // Header ///
                    IT_PositionItem: reception.EBELP, // Header ///
                    IT_Status : reception.STATU != null ? reception.STATU : '0',
                    IT_Initial_Status : reception.STATU != null ? reception.STATU : '0',
                    IT_Status_Desc : status,
                    IT_BANFN: reception.BANFN || "",
                    IT_BNFPO: reception.BNFPO || "",
                    IT_Material_ID: reception.MATNR != null ? `(${reception.MATNR})` : '', // Material Information ///
                    IT_Material_Image_Status: false,
                    IT_Material_Image: `${host}/ImageMaterial/${reception.MATNR}`,
                    IT_Material: reception.MAKTX1 || '', // Material Information ///
                    IT_BoughtQuantity: reception.MENGE || '', // Reception Information ///
                    IT_DeliveredQuantity: reception.WEMNG || "", //data.MENGE_C || '', // Reception Information ///
                    IT_MemoryWEMNGQuantity: reception.WEMNG || "",
                    IT_AvailableQuantity: quantAvail || "",
                    IT_ReceivedQuantity: reception.EBAN_MENGE_C	|| "",
                    IT_Category_ID: reception.CAT_ID != null ? `(${reception.CAT_ID})` : '', // Material Information ///
                    IT_Category: reception.CAT_DESC || '', // Material Information ///
                    IT_Family_ID: reception.FAM_ID != null ? `(${reception.FAM_ID})` : '', // Material Information ///
                    IT_Family: reception.FAM_DESC || '', // Material Information ///
                    IT_Brand_ID: reception.BRA_ID != null ? `(${reception.BRA_ID})` : '', // Material Information ///
                    IT_Brand: reception.BRA_DESC || '', // Material Information ///
                    IT_Model_ID: reception.MOD_ID != null ? `(${reception.MOD_ID})` : '', // Material Information ///
                    IT_Model: reception.MOD_DESC || '', // Material Information ///
                    IT_Dimensions: reception.MAT_DIMENS || '', // Material Information ///
                    IT_IndStandard: reception.MAT_IND_STAN || '', // Material Information
                    IT_IndFixAsset: reception.MAT_IND_ASSET || '', // Material Information
                    IT_Patr: reception.MAT_PATR || '', // Material Information
                    IT_UnitMeasure: reception.MAT_MEINS || 'N/A',
                    IT_Asset: "", // Missing
                    IT_IndSpecial: "X", // Material Information
                    IT_FFE_GM_FFE_DI: reception.MAT_FFE || '', // Requirement Information
                    IT_Division_ID: reception.DIV_ID != null ? `(${reception.DIV_ID})` : '', // Requirement Information
                    IT_Division: reception.DIV_DESC || '', // Requirement Information
                    IT_Area_ID: reception.AREA_ID != null ? `(${reception.AREA_ID})` : '', // Requirement Information
                    IT_Area: reception.AREA_DESC || '', // Requirement Information
                    IT_Location: reception.EBAN_UBICA || '', // Requirement Information
                    IT_SubLocation: reception.REQ_SUBIC || '', // Requirement Information
                    IT_Supplier_ID: reception.EBAN_SUMIN != null ? `(${reception.EBAN_SUMIN})` : '', // Requirement Information
                    IT_Supplier: reception.REQ_SUMIN_DESC || '', // Requirement Information
                    IT_View_ID: reception.EBAN_VISTA != null ? `(${reception.EBAN_VISTA})` : '', // Requirement Information
                    IT_View: reception.REQ_VISTA_DESC || '' // Requirement Information
                };
                aScheduleLines.push(Entry);
            }
            this.setModel(Controller, "/ScheduleLine", aScheduleLines);
        }
    };
});