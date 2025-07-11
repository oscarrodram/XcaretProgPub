sap.ui.define([
    "com/xcaret/receptionpublic/utils/Model",
    "com/xcaret/receptionpublic/utils/I18n",
    "sap/m/TableSelectDialog",
    "sap/m/Column",
    "sap/m/Label",
    "sap/m/ColumnListItem",
    "sap/m/FormattedText",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
], function (Model, I18n, TableSelectDialog, Column, Label, ColumnListItem, FormattedText, Filter, FilterOperator) {
    "use strict";

    return {
        Create: async function(oEvent, Controller, APIPath, SelectedItems){
            let oModel = Controller.getView().getModel("JSONModel");
            let Data = this._setColumns(Controller, APIPath);
            return new Promise((resolve, reject) =>{
                let oTableSelectDialog = new TableSelectDialog({
                    growingThreshold: 150,
                    title: APIPath,
                    multiSelect: true,
                    columns: Data.columns.map(colName => new Column({
                        header: new Label({ text: colName }), minScreenWidth: "Tablet", 
                        demandPopin: true,
                        hAlign: "Center"
                    })),
                    items: {
                        path: `/${APIPath}`,
                        template: new ColumnListItem({
                            cells: Data.cells.map(cell =>
                                new FormattedText({ htmlText: cell })
                            ),
                        })
                    },
                    search: function(oEvent) { // Search Event
                        let source = oEvent.getSource();
                    },
                    liveChange: function(oEvent) { // Confirm Button
                        oEvent.getSource().destroy();
                    },
                    confirm: function(oEvent) { // Confirm Button
                        const selectedItems = oEvent.getParameters().selectedItems.map(item =>
                            item.getBindingContext().getObject()
                        );
                        oEvent.getSource().destroy();
                        resolve(selectedItems);
                    },
                    cancel: function(oEvent){ // Cancel Button
                        oEvent.getSource().destroy();
                        resolve([]);
                    }
                });
                oTableSelectDialog.setModel(oModel);

                // Items Selecteds
                const oItems = oTableSelectDialog.getItems();
                const aScheduleLines = Model.getModel(Controller, "/ScheduleLine");
                for (const oItem of oItems) {
                    if(!aScheduleLines) break;
                    const cells = oItem.getAggregation("cells");
                    const fieldId = cells[0].getProperty("htmlText");
                    let id = fieldId.replace("<strong>", "").replace("</strong>", "");
                    let aScheduleLine = aScheduleLines.find(({ IT_ID }) => IT_ID === id);
                    if(!aScheduleLine) continue;
                    oItem.setSelected(true);
                }
                
                // Open Dialog
                oTableSelectDialog.open("");
            });
        },

        CreateContractFromStyleSheet: function(oController){
            let i18n = I18n.getTranslations(oController);
            let oModel = oController.getView().getModel("JSONModel");
            return new Promise((resolve, reject) =>{
                let oTableSelectDialog = new TableSelectDialog({
                    title: i18n.getText("Ref_C_Contract_Title"),
                    multiSelect: true,
                    columns: [
                        new Column({
                            header: new Label({ text: i18n.getText("Ref_C_ID")}), 
                            minScreenWidth: "Tablet", demandPopin: true
                        }),
                        new Column({
                            header: new Label({ text: i18n.getText("Ref_C_Contract")}), 
                            minScreenWidth: "Tablet", demandPopin: true
                        }),
                        new Column({
                            header: new Label({ text: i18n.getText("Ref_C_Material")}), 
                            minScreenWidth: "Tablet", demandPopin: true
                        })
                        ,new Column({
                            header: new Label({ text: i18n.getText("Ref_C_UM")}), 
                            minScreenWidth: "Tablet", demandPopin: true
                        })
                        ,new Column({
                            header: new Label({ text: i18n.getText("Ref_C_Supplier")}), 
                            minScreenWidth: "Tablet", demandPopin: true
                        })
                        ,new Column({
                            header: new Label({ text: i18n.getText("Ref_C_Av_Quan")}), 
                            minScreenWidth: "Tablet", demandPopin: true
                        })
                    ],
                    items: {
                        path: `/ContractFromStyleSheet`,
                        template: new ColumnListItem({
                            selected: "{Selected}",
                            cells: [ 
                                new FormattedText({ htmlText: "<strong>{ID_CON}</strong> ({CONPO})" }), 
                                new FormattedText({ htmlText: "{CONAM}"}), 
                                new FormattedText({ htmlText: "<strong>({MAT_MATNR})</strong> {MAT_NAME}" }), 
                                new FormattedText({ htmlText: "{QUO_MEINS}" }), 
                                new FormattedText({ htmlText: "<strong>({LIFNR})</strong> {NAME1}" }),
                                new FormattedText({ htmlText: "{CONTR_AVAIL}" })
                            ]
                        })
                    },
                    search: function(oEvent) { // Search Event
                        const sValue = oEvent.getParameter("value");
                        const oBinding = oEvent.getSource().getBinding("items");
                        if (sValue) {
                            const aFilters = [
                                new Filter("ID_CON", FilterOperator.Contains, sValue),
                                new Filter("CONAM", FilterOperator.Contains, sValue),
                                new Filter("MAT_MATNR", FilterOperator.Contains, sValue),
                                new Filter("MAT_NAME", FilterOperator.Contains, sValue),
                                new Filter("QUO_MEINS", FilterOperator.Contains, sValue),
                                new Filter("LIFNR", FilterOperator.Contains, sValue),
                                new Filter("NAME1", FilterOperator.Contains, sValue),
                                new Filter("CONTR_AVAIL", FilterOperator.Contains, sValue),
                            ];
                            oBinding.filter(new Filter(aFilters, false)); // OR
                        } else {
                            oBinding.filter([]);
                        }
                    },
                    liveChange: function(oEvent) { // Confirm Button
                        const sValue = oEvent.getParameter("value");
                        const oBinding = oEvent.getSource().getBinding("items");
    
                        if (sValue) {
                            const aFilters = [
                                new Filter("ID_CON", FilterOperator.Contains, sValue),
                                new Filter("CONAM", FilterOperator.Contains, sValue),
                                new Filter("MAT_MATNR", FilterOperator.Contains, sValue),
                                new Filter("MAT_NAME", FilterOperator.Contains, sValue),
                                new Filter("QUO_MEINS", FilterOperator.Contains, sValue),
                                new Filter("LIFNR", FilterOperator.Contains, sValue),
                                new Filter("NAME1", FilterOperator.Contains, sValue),
                                new Filter("CONTR_AVAIL", FilterOperator.Contains, sValue),
                            ];
                            oBinding.filter(new Filter(aFilters, false)); // OR
                        } else {
                            oBinding.filter([]);
                        }
                    },
                    confirm: function(oEvent) { // Confirm Button
                        const selectedItems = oEvent.getParameters().selectedItems.map(item =>
                            item.getBindingContext().getObject());
                        oEvent.getSource().destroy();
                        resolve(selectedItems);
                    },
                    cancel: function(oEvent){ // Cancel Button
                        oEvent.getSource().destroy();
                        resolve([]);
                    },
                    updateFinished: function(oEvent){
                        let oModel = oController.getView().getModel("JSONModel");
                        let aContracts = oModel.getProperty("/ContractFromStyleSheet") || [];
                        let aScheduleLine = oModel.getProperty("/ScheduleLine") || [];
                        for(let oScheduleLine of aScheduleLine){
                            let iIndex = aContracts.findIndex(contract => `${contract.ID_CON} (${contract.CONPO})` === oScheduleLine.IT_ID);
                            if(iIndex === -1) continue;
                            oModel.setProperty(`/ContractFromStyleSheet/${iIndex}/Selected`, true);
                        }
                    }
                });
                oTableSelectDialog.setModel(oModel);
                oTableSelectDialog.open(null);
            });
        },

        CreateStyleSheet: function(oEvent, oController, sFilterParam){
            let i18n = I18n.getTranslations(oController);
            let oModel = oController.getView().getModel("JSONModel");
            let Data = this._setColumns(oController, "StyleSheets");
            return new Promise((resolve) => {
                let oTableSelectDialog = new TableSelectDialog({
                    title: i18n.getText("Sel_Dia_Header_StyleSheet"),
                    //multiSelect: true,
                    columns: Data.columns.map(colName => new Column({
                        header: new Label({ text: colName }), minScreenWidth: "Tablet", 
                        demandPopin: true
                    })),
                    items: {
                        path: `/ProductSheet`,
                        template: new ColumnListItem({
                            cells: Data.cells.map(cell =>
                                new FormattedText({ htmlText: cell })
                            )
                        })
                    },
                    search: function(oEvent) { // Search Event
                        let source = oEvent.getSource();
                    },
                    liveChange: function(oEvent) { // Confirm Button
                        oEvent.getSource().destroy();
                    },
                    confirm: function(oEvent) { // Confirm Button
                        const selectedItems = oEvent.getParameters().selectedItem;
                        oEvent.getSource().destroy();
                        resolve(selectedItems);
                    },
                    cancel: function(oEvent){ // Cancel Button
                        oEvent.getSource().destroy();
                        resolve([]);
                    }
                });
                oTableSelectDialog.setModel(oModel);
                oTableSelectDialog.open("");
            });
        },

        _setColumns: function(controller, APIPath){
            let i18n = I18n.getTranslations(controller);
            let data = {
                columns : [],
                cells : []
            }
            switch (APIPath) {
                case "ContractItemsFromScheduleLine" :
                    data.columns = [i18n.getText("Ref_C_ID"), i18n.getText("Ref_C_Contract"), 
                                    i18n.getText("Ref_C_Material"), i18n.getText("Ref_C_UM"), 
                                    i18n.getText("Ref_C_Supplier"), i18n.getText("Ref_C_Av_Quan")];
                    data.cells = [ "<strong>{ID_CON}</strong> ({CONPO})", 
                                   "{CONAM}", 
                                   "<strong>({MAT_MATNR})</strong> {MAT_NAME}", 
                                   "{QUO_MEINS}", 
                                   "<strong>({LIFNR})</strong> {NAME1}",
                                   "{CONTR_AVAIL}" ];
                    break;

                case "RequirementSpecials" :
                    data.columns = [i18n.getText("Ref_R_Requirement"), i18n.getText("Ref_R_Material"), 
                                    i18n.getText("Ref_R_UM"), i18n.getText("Ref_R_Av_Quan")];
                    data.cells = [ "<strong>{BANFN}</strong> ({BNFPO})", 
                                   "<strong>({MATNR})</strong> {MAT_NAME}", 
                                   "{MAT_MEINS}",
                                   "{EBAN_AVAIL}" ];
                    break;
                case "StyleSheets" :
                    data.columns = [ i18n.getText("Ref_SS_ID"), i18n.getText("Ref_SS_Name")
                        , i18n.getText("Ref_SS_CreatedBy") ];
                    data.cells = [ "{ID_HOJA}", "{NAME}", "{CREATION_NAME} {CREATION_LNAME}" ];
            }
            return data;
        }
    };
});