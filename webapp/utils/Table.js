sap.ui.define([
    "com/xcaret/receptionpublic/utils/I18n",
    "com/xcaret/receptionpublic/utils/GetServices"
], function (I18n, GetServices) {
    "use strict";

    return {
        SetInfo: function(Controller, selectedItems, DocumentType){
            let Table = Controller.byId("ScheduleLineItemTable");
            let oModel = Controller.getView().getModel("JSONModel");
            let aScheduleLines = oModel.getProperty("/ScheduleLine") || [];
            let counter = aScheduleLines.length;
            if(counter > 0) counter = counter * 10;
            for(const oItem of selectedItems){
                if (aScheduleLines.find(({ IT_BANFN, IT_BNFPO }) => IT_BANFN === `${oItem.REQ_ID}` 
                    && IT_BNFPO === `${oItem.REQ_ITEM}`)) continue;
                if (aScheduleLines.find(({ IT_BANFN, IT_BNFPO }) => IT_BANFN === `${oItem.BANFN}` 
                    && IT_BNFPO === `${oItem.BNFPO}`)) continue;
                let newEntry;
                counter += 10;
                switch (DocumentType) {
                    case "Contract":
                        newEntry = this._setContractLine(Controller, oItem, counter);
                        break;

                    case "Requirement":
                        newEntry = this._setRequirementLine(Controller, oItem, counter);
                        break;
                }
                aScheduleLines.push(newEntry);
            }
            oModel.setProperty("/ScheduleLine", aScheduleLines);
        },

        _setContractLine: function(controller, oItem, Counter){ // Contracts
            let i18n = I18n.getTranslations(controller);
            let data = oItem;
            let host = GetServices._getHost();
            let status = i18n.getText("IT_Status_0");
            if(data.STATU === "1") status = i18n.getText("IT_Status_1");
            if(data.STATU === "2") status = i18n.getText("IT_Status_2");
            if(data.STATU === "3") status = i18n.getText("IT_Status_3");
            let Entry = {
                IT_Key: oItem.sPath,
                IT_ID: `${data.ID_CON} (${data.CONPO})`, // Header
                IT_ID_Front: data.CONAM,
                IT_DocumentType: "Contract", // Header
                IT_PositionItem: Counter, // Header
                IT_Status : data.STATU != null ? data.STATU : '0',
                IT_Status_Desc : status,
                IT_BANFN: data.REQ_ID || "",
                IT_BNFPO: data.REQ_ITEM || "",
                IT_Material_ID: data.MAT_MATNR != null ? `(${data.MAT_MATNR})` : '', // Material Information
                IT_Material_Image_Status: false,
                IT_Material_Image: `${host}/ImageMaterial/${data.MAT_MATNR}`,
                IT_Material: data.MAT_NAME || '', // Material Information
                IT_BoughtQuantity: data.CONTR_AVAIL || '', // Reception Information
                IT_DeliveredQuantity: data.CONTR_AVAIL || '',//data.REQ_MENGE_C || '', // Reception Information
                IT_ReceivedQuantity: data.MENGE_C || '',
                IT_Category_ID: data.CAT_ID != null ? `(${data.CAT_ID})` : '', // Material Information
                IT_Category: data.CAT_DESC || '', // Material Information
                IT_Family_ID: data.FAM_ID != null ? `(${data.FAM_ID})` : '', // Material Information
                IT_Family: data.FAM_DESC || '', // Material Information
                IT_Brand_ID: data.BRA_ID != null ? `(${data.BRA_ID})` : '', // Material Information
                IT_Brand: data.BRA_DESC || '', // Material Information
                IT_Model_ID: data.MOD_ID != null ? `(${data.MOD_ID})` : '', // Material Information
                IT_Model: data.MOD_DESC || '', // Material Information
                IT_Dimensions: data.MAT_DIMENS || '', // Material Information ///
                IT_IndStandard: data.MAT_IND_STAN || '', // Material Information
                IT_IndFixAsset: data.MAT_IND_ASSET || '', // Material Information
                IT_Patr: data.MAT_PATR || '', // Material Information
                IT_UnitMeasure: data.MAT_MEINS || 'N/A',
                IT_Asset: "", // Missing
                IT_IndSpecial: "", // Material Information
                IT_FFE_GM_FFE_DI: data.MAT_FFE || '', // Requirement Information
                IT_Division_ID: data.DIV_ID != null ? `(${data.DIV_ID})` : '', // Requirement Information
                IT_Division: data.DIV_DESC || '', // Requirement Information
                IT_Area_ID: data.AREA_ID != null ? `(${data.AREA_ID})` : '', // Requirement Information
                IT_Area: data.AREA_DESC || '', // Requirement Information
                IT_Location: data.REQ_UBICA || '', // Requirement Information
                IT_SubLocation: data.REQ_SUBIC || '', // Requirement Information
                IT_Supplied_ID: data.LIFNR != null ? `(${data.LIFNR})` : '',
                IT_Supplied: data.NAME1 || '',
                IT_Supplier_ID: data.REQ_SUMIN != null ? `(${data.REQ_SUMIN})` : '', // Requirement Information
                IT_Supplier: data.REQ_SUMIN_DESC || '', // Requirement Information
                IT_View_ID: data.VISTA != null ? `(${data.VISTA})` : '', // Requirement Information
                IT_View: data.REQ_VISTA_DESC || '', // Requirement Information
            };
            return Entry;
        },

        _setRequirementLine: function(controller, oItem, Counter){ // Requirements
            let i18n = I18n.getTranslations(controller);
            let data = oItem;
            let host = GetServices._getHost();
            let status = i18n.getText("IT_Status_0");
            if(data.STATU === "1") status = i18n.getText("IT_Status_1");
            if(data.STATU === "2") status = i18n.getText("IT_Status_2");
            if(data.STATU === "3") status = i18n.getText("IT_Status_3");
            let Entry = {
                IT_Key: oItem.sPath, ///
                IT_ID: `${data.BANFN} (${data.BNFPO})`, // Header ///
                IT_ID_Front: `${data.BANFN} (${data.BNFPO})`,
                IT_DocumentType: "Requirement", // Header ///
                IT_PositionItem: Counter, // Header ///
                IT_Status : data.STATU != null ? data.STATU : '0',
                IT_Status_Desc : status,
                IT_BANFN: data.BANFN || "",
                IT_BNFPO: data.BNFPO || "",
                IT_Material_ID: data.MATNR != null ? `(${data.MATNR})` : '', // Material Information ///
                IT_Material_Image_Status: false,
                IT_Material_Image: `${host}/ImageMaterial/${data.MATNR}`,
                IT_Material: data.MAT_NAME || '', // Material Information ///
                IT_BoughtQuantity: data.EBAN_AVAIL || '', // Reception Information ///
                IT_DeliveredQuantity:  data.EBAN_AVAIL || '', //data.MENGE_C || '', // Reception Information ///
                IT_ReceivedQuantity: data.MENGE_C || '',
                IT_Category_ID: data.CAT_ID != null ? `(${data.CAT_ID})` : '', // Material Information ///
                IT_Category: data.CAT_DESC || '', // Material Information ///
                IT_Family_ID: data.FAM_ID != null ? `(${data.FAM_ID})` : '', // Material Information ///
                IT_Family: data.FAM_DESC || '', // Material Information ///
                IT_Brand_ID: data.BRA_ID != null ? `(${data.BRA_ID})` : '', // Material Information ///
                IT_Brand: data.BRA_DESC || '', // Material Information ///
                IT_Model_ID: data.MOD_ID != null ? `(${data.MOD_ID})` : '', // Material Information ///
                IT_Model: data.MOD_DESC || '', // Material Information ///
                IT_Dimensions: data.MAT_DIMENS || '', // Material Information ///
                IT_IndStandard: data.MAT_IND_STAN || '', // Material Information
                IT_IndFixAsset: data.MAT_IND_ASSET || '', // Material Information
                IT_Patr: data.MAT_PATR || '', // Material Information
                IT_UnitMeasure: data.MAT_MEINS || 'N/A',
                IT_Asset: "", // Missing
                IT_IndSpecial: "X", // Material Information
                IT_FFE_GM_FFE_DI: data.MAT_FFE || '', // Requirement Information
                IT_Division_ID: data.DIV_ID != null ? `(${data.DIV_ID})` : '', // Requirement Information
                IT_Division: data.DIV_DESC || '', // Requirement Information
                IT_Area_ID: data.AREA_ID != null ? `(${data.AREA_ID})` : '', // Requirement Information
                IT_Area: data.AREA_DESC || '', // Requirement Information
                IT_Location: data.UBICA || '', // Requirement Information
                IT_SubLocation: data.SUBIC || '', // Requirement Information
                IT_Supplied_ID: data.LIFNR != null ? `(${data.LIFNR})` : '',
                IT_Supplied: data.NAME1 || '',
                IT_Supplier_ID: data.SUMIN != null ? `(${data.SUMIN})` : '', // Requirement Information
                IT_Supplier: data.REQ_SUMIN_DESC || '', // Requirement Information
                IT_View_ID: data.VISTA != null ? `(${data.VISTA})` : '', // Requirement Information
                IT_View: data.REQ_VISTA_DESC || '', // Requirement Information
            };
            return Entry;
        }
    };
});