sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Label",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/Switch",
    "sap/m/MessageBox",
    "sap/ui/comp/smartvariants/PersonalizableInfo",
    "sap/m/SelectDialog",
    "sap/m/StandardListItem",
    "sap/m/Token",
    "com/xcaret/receptionpublic/utils/GetServices"
], (Controller, Filter, JSONModel, Dialog, Label, Button, Input, Switch, MessageBox, PersonalizableInfo, SelectDialog, StandardListItem, Token, GetServices) => {
    "use strict";
    let sUserID = "DEFAULT_USER", sFName, sLName, sEmail;
    var bURL;
    let host = "https://experiencias-xcaret-parques-s-a-p-i-de-c-v--xc-btpdev-15aca4ac6.cfapps.us10-001.hana.ondemand.com";
    let aIdEBELN = [], aIdPSPNR = [], aIdCONTRA = [], aIdUSER = [];
    return Controller.extend("com.xcaret.receptionpublic.controller.Main", {
        onInit: function () {
            this.getOwnerComponent().getRouter()
				.getRoute("Main")
				.attachPatternMatched(this._onPatternMatched, this);
            var sHost = window.location.hostname;
            if (sHost.includes("btpdev")) {
                host = "https://experiencias-xcaret-parques-s-a-p-i-de-c-v--xc-btpdev-15aca4ac6.cfapps.us10-001.hana.ondemand.com";
            } else if (sHost.includes("qas-btp")) {
                host = "https://node.cfapps.us10-001.hana.ondemand.com";
            } else if (sHost.includes("prd") || sHost.includes("prod")) {
                host = "";
            } else if (sHost.includes("-workspaces-")) {
                host = "https://experiencias-xcaret-parques-s-a-p-i-de-c-v--xc-btpdev-15aca4ac6.cfapps.us10-001.hana.ondemand.com";
            }

            this.getCurrentUserName();
            this.onPutUserInformation();
            let oModel = new sap.ui.model.json.JSONModel();
            this.getView().setModel(oModel, "serviceModel");
            this._onQuery();
            this.multiQuery();

            this.oSmartVariantManagement = this.getView().byId("svm");
            this.currentVariantJson = "";
            this.oFilterBar = this.getView().byId("filterbar");
            let oPersInfo = new PersonalizableInfo({
                type: "filterBar",
                keyName: "persistencyKey",
                control: this.oFilterBar
            });
            this.oSmartVariantManagement.addPersonalizableControl(oPersInfo);
            this.oSmartVariantManagement.initialise(this._onVariantLoad.bind(this), this.oFilterBar);
            this.oSmartVariantManagement.attachSelect(this._onVariantChange.bind(this));

        },

        _onPatternMatched: function(){
            this._onQuery();
        },

        getCurrentUserName: function () {
            if (sap.ushell && sap.ushell.Container) {
                const oUser = sap.ushell.Container.getUser();
                sUserID = oUser.getId();
                sFName = oUser.getFirstName();
                sLName = oUser.getLastName();
                sEmail = oUser.getEmail();
            }
        },

        onPutUserInformation: function () {
            try {
                let sHost = GetServices._getHost();
                const sBaseUrl = sHost + "/User/" + sUserID;
                var xhr = new XMLHttpRequest();
                // Open the request (synchronous)
                xhr.open("PUT", sBaseUrl, false);  // false means synchronous request
                xhr.setRequestHeader("Content-Type", "application/json");
                var data = JSON.stringify({
                    NAME: sFName,
                    LNAME: sLName,
                    EMAIL: sEmail
                });
                // Send the request
                xhr.send(data);

                // Process the response after the request completes
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    console.log("Success:", response);
                } else {
                    console.error("Error:", xhr.status, xhr.statusText);
                }
            } catch (error) {
                console.error("Request failed:", error);
            }
        },
        // Initial Get Data ######################### Read----- #########################
        //
        buildNewQueryUrl: function (base, aIdEBELN, aIdPSPNR, aIdCONTRA, aIdUSER) {
            let conditions = [];

            // Función auxiliar para construir OR con un mismo parámetro
            function addCondition(field, values) {
                if (values && values.length > 0) {
                    let condition = values.map(value => `${field} EQ '${value}'`).join(" OR ");
                    conditions.push(`${condition}`); // Agrupa con paréntesis
                }
            }

            addCondition("EBELN", aIdEBELN);
            addCondition("ID_PEP", aIdPSPNR);
            addCondition("ID_CON", aIdCONTRA);
            addCondition("ERNAM", aIdUSER);

            // Une todas las condiciones con AND
            let query = conditions.join(" AND ");

            // Retorna la URL final
            return query ? `${base} ${query}` : base;
        },

        createUrl: function () {
            const sBaseUrl = `${host}/ScheduleLine?$filter=`;
            let sUrl = sBaseUrl;

            var sFinalUrl = this.buildNewQueryUrl(sBaseUrl, aIdEBELN, aIdPSPNR, aIdCONTRA, aIdUSER);
            // Regex to remove parameters with "undefined" as the value
            sUrl = sFinalUrl.replace(/([&?])([^&=]+)=undefined/g, '$1');
            // Remove trailing '&' or '?' if no parameters remain
            sUrl = sUrl.replace(/[?&]$/, '');

            return sUrl;
        },
        //#region Integration Services
        // Query
        _onQuery: async function () {
            try {
                let oReceptionIdMultiIn = this.byId("IdEBELN");
                let oProjectMultiIn = this.byId("IdID_PEP");
                let oCreationMultiIn = this.byId("IdERNAM");
                let oIconTabBar = this.byId("iconTabBar");

                let oReceptionTokens = oReceptionIdMultiIn.getTokens().map(token => token.getText());
                let oProjectTokens = oProjectMultiIn.getTokens().map(token => token.getKey());
                let oCreationTokens = oCreationMultiIn.getTokens().map(token => token.getKey());
                let oStatus = oIconTabBar.getSelectedKey();

                // Construcción del filtro dinámico
                let oReceptionFilter = oReceptionTokens.map(token => `EBELN EQ '${token}'`).join(" OR ");
                let oProjectFilter = oProjectTokens.map(token => `EKET_H.ID_PEP EQ '${token}'`).join(" OR ");
                let oCreationFilter = oCreationTokens.map(token => `EKET_H.ERNAM EQ '${token}'`).join(" OR ");
                let oStatusFilter = 
                    oStatus === 'Active'            ? `&$virtualFilter=GENERAL_STATUS EQ '0'` :
                    oStatus === 'PartialReception'  ? `&$virtualFilter=GENERAL_STATUS EQ '1'` :
                    oStatus === 'TotalReception'    ? `&$virtualFilter=GENERAL_STATUS EQ '2'` :
                    oStatus === 'Deleted'          ? `&$virtualFilter=GENERAL_STATUS EQ '3'` :
                    "";

                let finalFilter = [];
                if (oReceptionFilter) finalFilter.push(`(${oReceptionFilter})`);
                if (oProjectFilter) finalFilter.push(`(${oProjectFilter})`);
                if (oCreationFilter) finalFilter.push(`(${oCreationFilter})`);

                let filterQuery = finalFilter.length ? ` AND ${finalFilter.join(" AND ")}` : "";
                let url = `${host}/ScheduleLine?$filter=RE_TYPE EQ '2'${filterQuery}${oStatusFilter}`;
                console.log("URL generada:", url);
                let response = await fetch(url, { method: "GET" });
                if (!response.ok) throw new Error(`${response.error}`);
                let responseData = await response.json();
                let oModel = this.getView().getModel("serviceModel");
                oModel.setProperty("/generalData", responseData.result);

                // Deletes repetead for filters
                let oFilteredReception = Array.from(new Map(responseData.result.map(item => [item.EBELN, item])).values());
                let oFilteredProject = Array.from(new Map(responseData.result.map(item => [item.PROJ_NAME, item])).values());
                let oFilteredCreation = Array.from(new Map(responseData.result.map(item => [item.ERNAM, item])).values());
                oModel.setProperty("/filteredReception", oFilteredReception);
                oModel.setProperty("/filteredProject", oFilteredProject);
                oModel.setProperty("/filteredCreation", oFilteredCreation);

            } catch (error) {
                console.error(error);
            }
        },

        multiQuery: async function () {
            try {
                let urls = [
                    `${host}/Provider/query?BLOCKED=null`,
                    `${host}/User`,
                    `${host}/Rol?$filter=ID EQ 009 AND EMAIL EQ '${sEmail}'`,
                    `${host}/Projects/Project/query?&ID_STA=1`,
                    `${host}/Contract`

                ];

                let responses = await Promise.all(
                    urls.map(url => fetch(url).then(res => {
                        if (!res.ok) throw new Error(`Error fetching ${url}`);
                        return res.json();
                    }))
                );
                // Assuming each response has a `result` property
                let structuredData = {
                    scheduleLine: responses[0].data,
                    user: responses[1].result,
                    rol: responses[2].result,
                    projects: responses[3].data,
                    contract: responses[4].result
                };

                let oModel = this.getView().getModel("serviceModel");
                oModel.setProperty("/generalProvider", responses[0].data);
                oModel.setProperty("/generalUser", responses[1].result);
                oModel.setProperty("/generalRol", responses[2].result);
                if ([responses[2].result].every(val => val?.length !== 0)) { this.validateRol(responses[2].result); }
                oModel.setProperty("/generalProjects", responses[3].data);
                oModel.setProperty("/generalContract", responses[4].result);

            } catch (error) {
                console.error(error);
            }
        },
        //
        // End Get Data ######################### Read----- #########################

        // Page Events ######################### ----- #########################
        // Page Header ######################### ----- #########################
        onSearch: function (oEvent) {
            let sQuery = oEvent.getParameter("newValue");
            let oTable = this.getView().byId("table");
            let oBinding = oTable.getBinding("items");
            let aFilters = [];
            if (sQuery) {
                let oFilter = new sap.ui.model.Filter({
                    filters: [
                        new sap.ui.model.Filter("EMAIL", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("DESC", sap.ui.model.FilterOperator.Contains, sQuery)
                    ],
                    and: false
                });
                aFilters.push(oFilter);
            }
            oBinding.filter(aFilters);
        },

        valueHelpFilterNew: function(oEvent) {
            const i18 = this.getOwnerComponent().getModel("i18n").getResourceBundle();
             // Save MultiInput which executes the event
            //this._oMultiInput = oEvent.getSource();
            let oMultiInputFilter = oEvent.getSource();

            // Get ID of MultiInput
            let id = oMultiInputFilter.getId();
            let filterId;
            let titleItem;
            let title;
            let description;
            if (id.includes("IdEBELN")) {
                filterId = "EBELN";
                title = i18.getText("Main_EBELN");
                titleItem = "{EBELN}";
            } else if (id.includes("IdID_PEP")) {
                filterId = "PROJ_NAME";
                title = i18.getText("Main_ID_PEP_NAME");
                titleItem = "{PROJ_NAME}";
                description = "{ID_PEP}";
            } else if (id.includes("IdERNAM")){
                filterId = "ERNAM";
                title = i18.getText("Main_ERNAM");
                titleItem = "{CREATION_NAME} {CREATION_LNAME}";
                description = "{ERNAM}";
            }

             // Get Model
            let oModel = this.getView().getModel("serviceModel");
            let aData = oModel.getProperty("/generalData") || [];

            // Filter and create new model
            let uniqueData = Array.from(new Map(aData.map(item => [item[filterId], item])).values());

            // Get tokens of MultiInput
            let aTokens = oMultiInputFilter.getTokens().map(token => token.getKey()); 

            // Creation of Dialog
            let oSelectDialog = new SelectDialog({
                title: title,
                multiSelect: true,
                items: {
                    path: "/filteredInfo", // -----------------------------------------------
                    template: new StandardListItem({
                        title: `${titleItem}`,
                        description: description ? `${description}` : undefined
                    })
                },
                confirm: function(oEvent) { // Confirm Button
                    let selectedItems = oEvent.getParameter("selectedItems");
                    if(!selectedItems) return;
                    oMultiInputFilter.removeAllTokens();
                    if(selectedItems.length == 0) return;
                    for(let selectedItem of selectedItems){
                        let token = new Token({
                            key: selectedItem.getDescription() ? selectedItem.getDescription() : selectedItem.getTitle(),
                            text: selectedItem.getTitle()
                        });
                        oMultiInputFilter.addToken(token);
                    }
                    oEvent.getSource().destroy();
                },
                search: function(oEvent) { // Search Event
                    let sValue = oEvent.getParameter("value");
                    let oFilter = new Filter(`${filterId}`, sap.ui.model.FilterOperator.Contains, sValue);
                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                cancel: function(oEvent){ // Cancel Button
                    oEvent.getSource().destroy();
                }
            });
            let oTempModel = new JSONModel({ filteredInfo: uniqueData });
            oSelectDialog.setModel(oTempModel);

            // Add previous tokens
            oSelectDialog.attachEventOnce("updateFinished", function() {
                let oList = oSelectDialog.getItems();
                for(let item of oList){
                    if(!aTokens.includes(item.getTitle())) continue;
                    item.setSelected(true);
                }
            });
            oSelectDialog.open("");
        },

        // Filters
        /*valueHelpFilter: function (oEvent) {
            let aData;
            const i18 = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            // Get Model
            let oModel = this.getView().getModel("serviceModel");
            // Save MultiInput which executes the event
            this._oMultiInput = oEvent.getSource();

            // Get ID of MultiInput
            let id = oEvent.getSource().getId();
            let shortId = id.split("--").pop();
            let filterId, filterDescr, title, textAdded;

            if (id.includes("IdEBELN")) {
                filterId = "EBELN";
                filterDescr = "EBELN";
                aData = oModel.getProperty("/generalData") || [];
                title = i18.getText("EBELN");

            } else if (id.includes("IdPSPNR")) {
                filterId = "ID_PEP";
                filterDescr = "NAME1";
                aData = oModel.getProperty("/generalProjects") || [];
                title = i18.getText("PSPNR");

            } else if (id.includes("ID_CON")) {
                filterId = "ID_CON";
                filterDescr = "CONAM";
                aData = oModel.getProperty("/generalContract") || [];
                title = i18.getText("ID_CON");

            } else if (id.includes("IdUSER")) {
                filterId = "ERNAM";
                filterDescr = "NAME";
                aData = oModel.getProperty("/generalUser") || [];
                title = i18.getText("ERNAM");
            }

            // Get tokens of MultiInput
            let aTokens = this._oMultiInput.getTokens().map(token => ({
                key: token.getKey(),
                text: token.getText()
            }));

            // Creation of Dialog
            if (!this._oSelectDialog) {
                this._oSelectDialog = new sap.m.SelectDialog({
                    title: title,
                    multiSelect: true,
                    items: {
                        path: "/filters",
                        template: new sap.m.StandardListItem({
                            title: `{${filterId}}`,
                            description: `{${filterDescr}}`
                        })
                    },
                    confirm: function (oEvent) { // Confirm Button
                        let selectedItems = oEvent.getParameter("selectedItems");
                        if (!selectedItems) return;
                        if (selectedItems.length == 0) { this._oMultiInput.removeAllTokens(); return; }
                        this._oMultiInput.removeAllTokens();
                        selectedItems.forEach(item => {
                            let token = new sap.m.Token({
                                key: item.getTitle(),
                                text: item.getDescription()
                            });
                            this._oMultiInput.addToken(token);
                            textAdded = item.getTitle();
                            if (id.includes("IdEBELN")) {
                                aIdEBELN.push(textAdded);
                            } else if (id.includes("IdPSPNR")) {
                                aIdPSPNR.push(textAdded);
                            } else if (id.includes("ID_CON")) {
                                aIdEBELN.push(textAdded);
                            } else if (id.includes("IdUSER")) {
                                aIdUSER.push(textAdded);
                            }
                        });
                        this._oSelectDialog.destroy();
                        this._oSelectDialog = null;
                    }.bind(this),
                    search: function (oEvent) { // Search Event
                        let sValue = oEvent.getParameter("value");
                        let oFilter = new sap.ui.model.Filter(`${filterDescr}`, sap.ui.model.FilterOperator.Contains, sValue);
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                    },
                    cancel: function (oEvent) { // Cancel Button
                        this._oSelectDialog.destroy();
                        this._oSelectDialog = null;
                    }.bind(this)
                });
                this.getView().addDependent(this._oSelectDialog);
            }
            // Set Items of Model
            let oTempModel = new sap.ui.model.json.JSONModel({ filters: aData });
            this._oSelectDialog.setModel(oTempModel);
            // Add previous tokens
            this._oSelectDialog.attachEventOnce("updateFinished", function () {
                let oList = this._oSelectDialog.getItems();
                oList.forEach(item => {
                    if (aTokens.includes(item.getTitle())) {
                        item.setSelected(true);
                    }
                });
            }.bind(this));
            this._oSelectDialog.open("");
        },*/
        updateTokenIdClear: function (oEvent) {
            var oSource = oEvent.getSource(); // The UI control that triggered the event
            let id = oEvent.getSource().getId();
            let shortId = id.split("--").pop();

            if (oEvent.getParameter("removedTokens")[0]) {
                var text = oEvent.getParameter("removedTokens")[0].getKey();        //getText();
                switch (shortId) {
                    case "IdEBELN":
                        aIdEBELN = aIdEBELN.filter(function (linea) {
                            return linea !== text;
                        });
                        break;
                    case "IdPSPNR":
                        aIdPSPNR = aIdPSPNR.filter(function (linea) {
                            return linea !== text;
                        });
                        break;
                    case "ID_CON":
                        aIdEBELN = aIdEBELN.filter(function (linea) {
                            return linea !== text;
                        });
                        break;
                    case "IdUSER":
                        aIdUSER = aIdUSER.filter(function (linea) {
                            return linea !== text;
                        });
                    default:
                        // Code to execute if no cases match
                        break;
                }

            }
            if (oEvent.getParameter("addedTokens")[0]) {
                var textAdded = oEvent.getParameter("addedTokens")[0].getKey();
                switch (shortId) {
                    case "IdEBELN":
                        aIdEBELN.push(textAdded);
                        break;
                    case "IdPSPNR":
                        aIdPSPNR.push(textAdded);
                        break;
                    case "ID_CON":
                        aIdEBELN.push(textAdded);
                        break;
                    case "IdUSER":
                        aIdUSER.push(textAdded);
                    default:
                        // Code to execute if no cases match
                        break;
                }
            }
        },

        onIconTabFilterSelect: function(oEvent){
            this._onQuery();
        },

        onClearQuery: function () {
            this.byId("multiInEmail").removeAllTokens();
            this.byId("multiInAppId").removeAllTokens();
            this._query();
        },

        validateRol: function (aJsonRol) {
            aJsonRol.forEach((oItem) => {
                if (oItem.CREATE === "X") {
                    this.getView().byId("idBtnCreate").setVisible(true);
                    //this.getView().byId("idBtnCopy").setVisible(true);
                }

            });
        },
        /// Set Cloumns
        onOpenColumnSettings: function () {
            this.byId("columnSettingsDialog").open();
        },
        onCloseColumnSettings: function () {
            this.byId("columnSettingsDialog").close();
        },
        onToggleColumnVisibility: function (oEvent) {
            let sColumn = oEvent.getSource().getTitle();
            let oModel = this.getView().getModel("settingsModel");
            let bCurrentValue = oModel.getProperty("/" + sColumn);
            oModel.setProperty("/" + sColumn, !bCurrentValue);
        },
        ///

        //################### -------------------------------- Begin Variant
        _onVariantLoad: function () {
            var oFilterBar = this.getView().byId("filterbar");
            var oSmartVariant = this.getView().byId("svm");
            var oVariantData = oSmartVariant.getVariantContent();
            var sNewVariantId = oSmartVariant.getCurrentVariantId();
            if (sNewVariantId === "") {
                sNewVariantId = "PROG_ALMACEN_VARIANT";
            } else { sNewVariantId = "PROG_ALMACEN_VARIANT_" + sNewVariantId; }

            var sSavedVariant = localStorage.getItem(sNewVariantId);
            if (sSavedVariant) {
                var oVariantData = JSON.parse(sSavedVariant);
                this.getView().byId("IdEBELN").setTokens(oVariantData.filterData.IdEBELN.map(value => new sap.m.Token({ key: value.key, text: value.text })));
                this.getView().byId("IdPSPNR").setTokens(oVariantData.filterData.IdPSPNR.map(value => new sap.m.Token({ key: value.key, text: value.text })));
                this.getView().byId("ID_CON").setTokens(oVariantData.filterData.IdBANFN.map(value => new sap.m.Token({ key: value.key, text: value.text })));
                this.getView().byId("IdUSER").setTokens(oVariantData.filterData.IdUSER.map(value => new sap.m.Token({ key: value.key, text: value.text })));
                //oFilterBar.setFilterData(oVariantData.filterData);
                this._applyTableSettings(oVariantData.tableSettings);
                //MessageToast.show("Page Variant Loaded!");
            }
        },

        onVariantSave: function (oEvent) {
            var oFilterBar = this.getView().byId("filterbar"); // Obtener la referencia del FilterBar
            var oSmartVariant = this.getView().byId("svm");
            var oVariantData = oSmartVariant.getVariantContent();
            var sVariantId = oSmartVariant.getCurrentVariantId();
            if (sVariantId === "") {
                sVariantId = "VARIANT_1";
            }
            var oFilterData = {
                variantId: sVariantId,
                IdEBELN: this.getView().byId("IdEBELN").getTokens().map(token => ({
                    key: token.getKey(),
                    text: token.getText()
                })),
                IdPSPNR: this.getView().byId("IdPSPNR").getTokens().map(token => ({
                    key: token.getKey(),
                    text: token.getText()
                })),
                ID_CON: this.getView().byId("ID_CON").getTokens().map(token => ({
                    key: token.getKey(),
                    text: token.getText()
                })),
                IdUSER: this.getView().byId("IdUSER").getTokens().map(token => ({
                    key: token.getKey(),
                    text: token.getText()
                }))
            };
            var oTableSettings = this._getTableSettings();
            var oVariantData = {
                filterData: oFilterData,
                tableSettings: oTableSettings
            };
            this.currentVariantJson = JSON.stringify(oVariantData);
            localStorage.setItem("PROG_ALMACEN_VARIANT_" + sVariantId, this.currentVariantJson);
            this.executeAfterDelay();
            //MessageToast.show("Page Variant Saved!");
        },
        _onVariantChange: function (oEvent) {
            var oSmartVariant = this.getView().byId("svm");
            this.onResetParameters();
            var sNewVariantId = oSmartVariant.getCurrentVariantId();
            var sSavedVariant = localStorage.getItem("PROG_ALMACEN_VARIANT_" + sNewVariantId);
            if (sSavedVariant) {
                var oVariantData = JSON.parse(sSavedVariant);
                this.getView().byId("IdEBELN").setTokens(oVariantData.filterData.IdLIFNR.map(value => new sap.m.Token({ key: value.key, text: value.text })));
                this.getView().byId("IdPSPNR").setTokens(oVariantData.filterData.IdPSPNR.map(value => new sap.m.Token({ key: value.key, text: value.text })));
                this.getView().byId("ID_CON").setTokens(oVariantData.filterData.IdEBELN.map(value => new sap.m.Token({ key: value.key, text: value.text })));
                this.getView().byId("IdUSER").setTokens(oVariantData.filterData.IdUSER.map(value => new sap.m.Token({ key: value.key, text: value.text })));
                this._applyTableSettings(oVariantData.tableSettings);
                //MessageToast.show("Page Variant Loaded!");
            }
        },
        executeAfterDelay: function () {
            var delayTime = 1500;
            var that = this;
            setTimeout(function () {
                var oSmartVariant = that.getView().byId("svm");
                if (oSmartVariant) {
                    if (that.currentVariantJson !== "") {
                        var sVariantId = oSmartVariant.getCurrentVariantId();
                        localStorage.setItem("PROG_ALMACEN_VARIANT_" + sVariantId, that.currentVariantJson);
                    }
                }
            }, delayTime);
            // Verificar si el control SmartVariantManagement está listo

        },
        _getTableSettings: function () {
            var oTable = this.getView().byId("progrAlmacenTable");
            return {
                visibleColumns: oTable.getColumns().length // Example: Capture visible columns
            };
        },

        // Apply Table Settings
        _applyTableSettings: function (oSettings) {
            var oTable = this.getView().byId("progrAlmacenTable");
            console.log("Applying Table Settings:", oSettings);
        },
        //##########End Variant
        //##########
        // Initial Navigations ######################### Create, Copy & Read ----- #########################
        // 
        navigateToCreate: function () {
            /*var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("ObjectPage", {
                mode: "a",
                objectId: "New"
            });*/
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("ItemReceptions", {
                ID_Reception: "creation"
            });
        },
        navigateToCreateandCopy: function () {
            const oTable = this.byId("progrAlmacenTable"); // Obtiene la tabla
            const aSelectedIndices = oTable.getSelectedItems(); // Obtiene las filas seleccionadas
            const i18 = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let msgElemt = i18.getText("valCopy");
            let msgMoreElm = i18.getText("valMele");
            if (aSelectedIndices.length === 0) {
                MessageToast.show(msgElemt);
                return;
            }

            if (aSelectedIndices.length > 1) {
                MessageToast.show(msgMoreElm);
                return;
            }

            // Si hay exactamente un elemento seleccionado, toma el primero
            const oSelectedContext = aSelectedIndices[0].getBindingContext("serviceModel");
            const oSelectedData = oSelectedContext.getObject();
            var sIdEBELN = oSelectedData.EBELN; // Ajusta la propiedad según tu modelo

            // Navigate to the ObjectPage
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("ObjectPage", {
                mode: "c",
                objectId: sIdEBELN
            });
        },

        getDetailReadSpecificPos: function (oEvent) {
            var sIdEBELN = oEvent.getSource().getBindingContext("serviceModel").getProperty("EBELN");

            // Navigate to the ObjectPage
            //var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            /*oRouter.navTo("ObjectPage", {
                mode: "r",
                objectId: sIdEBELN
            });*/
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("ItemReceptions", {
                ID_Reception: sIdEBELN
            });

        },
        //
        // End Navigations ######################### Create, Copy & Read ----- #########################
        //////////////////////////////////////////////////
        /////////////////////////////////////////////////
        /////////////////////////////////////////////////
        /////////////////////////////////////////////////
        // Columns ######################### ----- #########################
        // Update Button


        // Message Dialogs
        _setMessage: function (type, message, input, valueState, timeDuration) { // Type MessageBox, Message to show, Component ID, Value State of te file, Time Duration of message
            let messageBox = MessageBox[type](message);
            if (input) {
                input.setValueState(valueState);
            }
        },

        // Establish Initial Status Inputs
        _setInitialInputs: function (inputArray, cleanField) {
            inputArray.forEach(function (input) {
                if (cleanField) input.setValue("");
                input.setValueState("None");
            }, this);
        },

        _delete: async function (email, id) {
            try {
                let response = await fetch(host + `/Rol/${email}/${id}`, {
                    method: `DELETE`,
                });
                let responseData = await response.json();
                if (!response.ok) {
                    return responseData;
                }
                return responseData;
            } catch (error) {
                return { error: error.message };
            }
        },

        onItemPress: function (oEvent) {
            const i18 = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oItem = oEvent.getSource();
            let oBindingContext = oItem.getBindingContext("JSONModel");
            let oData = oBindingContext.getObject();
            let oVBox = new sap.m.VBox({
                items: [
                    new sap.m.Label({ text: i18.getText("columnEmail"), labelFor: "input-User" }), // Email
                    new sap.m.Input({ id: "input-User", required: true, type: "Email", value: oData.EMAIL, enabled: false }), // Email

                    new sap.m.Label({ text: i18.getText("columnId"), labelFor: "input-AppID" }), // ID
                    new sap.m.Select({
                        id: "input-AppID", required: true, width: "100%", selectedKey: oData.ID, // ID
                        enabled: false,
                        items: {
                            path: "JSONModel>/App",
                            template: new sap.ui.core.Item({
                                key: "{JSONModel>ID}",
                                text: "{JSONModel>DESC}"
                            })
                        }
                    }),

                    new sap.m.Label({ text: i18.getText("columnCreate"), labelFor: "switch-Create" }), // Create
                    new sap.m.Switch({ id: "switch-Create", type: "AcceptReject", state: oData.CREATE === "X" ? true : false }), // Create

                    new sap.m.Label({ text: i18.getText("columnEdit"), labelFor: "switch-Edit" }), // Edit
                    new sap.m.Switch({ id: "switch-Edit", type: "AcceptReject", state: oData.EDIT === "X" ? true : false }), // Edit

                    new sap.m.Label({ text: i18.getText("columnDelete"), labelFor: "switch-Delete" }), // Delete
                    new sap.m.Switch({ id: "switch-Delete", type: "AcceptReject", state: oData.DELETE === "X" ? true : false }), // Delete

                    new sap.m.Label({ text: i18.getText("columnErase"), labelFor: "switch-Erase" }), //Erased
                    new sap.m.Switch({ id: "switch-Erase", type: "AcceptReject", state: oData.ERASED === "X" ? true : false }) //Erased
                ]
            });
            oVBox.addStyleClass("sapUiSmallMargin"); // Add Margin to oVBox
            this.oDefaultDialog = new Dialog({
                title: i18.getText("titleUpdateDialog"),
                content: oVBox,
                beginButton: new Button({
                    type: "Emphasized",
                    text: i18.getText("beginButtonUpdate"),
                    press: async function () {
                        let inputUser = sap.ui.getCore().byId("input-User");
                        let inputAppID = sap.ui.getCore().byId("input-AppID");
                        let inputCreate = sap.ui.getCore().byId("switch-Create").getState() ? "X" : null;
                        let inputEdit = sap.ui.getCore().byId("switch-Edit").getState() ? "X" : null;
                        let inputDelete = sap.ui.getCore().byId("switch-Delete").getState() ? "X" : null;
                        let inputErase = sap.ui.getCore().byId("switch-Erase").getState() ? "X" : null;
                        let inputs = [inputUser];
                        this._setInitialInputs(inputs, false);
                        if (inputUser.getValue().length === 0) {
                            this._setMessage("error", i18.getText("emailMandatory"), inputUser, "Error", null);
                            return;
                        }
                        let data = {
                            CREATE: inputCreate, EDIT: inputEdit,
                            DELETE: inputDelete, ERASED: inputErase
                        };
                        let result = await this._update(data, inputUser.getValue(), inputAppID.getSelectedKey());
                        if (result.error) {
                            this._setMessage("error", result.error, null, null, null);
                            return;
                        }
                        console.log(result);
                        this._setMessage("success", result.result, null, null, 3);
                        this._query();
                        this.oDefaultDialog.destroy();
                        this.oDefaultDialog = null;
                    }.bind(this)
                }),
                endButton: new Button({
                    text: i18.getText("cancelButton"),
                    press: function () {
                        this.oDefaultDialog.destroy();
                        this.oDefaultDialog = null;
                    }.bind(this)
                })
            });
            this.getView().addDependent(this.oDefaultDialog);
            this.oDefaultDialog.open();
        },

        // Delete Button
        onDelete: async function (oEvent) {
            const i18 = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            let oItem = oEvent.getParameter("listItem");
            let oBindingContext = oItem.getBindingContext("JSONModel");
            let oData = oBindingContext.getObject();
            sap.m.MessageBox.confirm(i18.getText("messageDelete", [oData.EMAIL, oData.DESC]), {
                title: i18.getText("titleDelete"),
                onClose: async (oAction) => {
                    if (oAction === i18.getText("beginButtonDelete")) {
                        let result = await this._delete(oData.EMAIL, oData.ID);
                        if (result.error) {
                            this._setMessage("error", result.error, null, null, null);
                            return;
                        }
                        console.log(result);
                        this._setMessage("success", result.result, null, null, 3);
                        this._query();
                    }
                },
                actions: [i18.getText("beginButtonDelete"), i18.getText("cancelButton")],
                emphasizedAction: i18.getText("beginButtonDelete")
            });
        },

        // Page Content ######################### ----- #########################
        // Table Events ######################### ----- #########################
        // Table Header ######################### ----- #########################
        // Create Button
        onCreatePress: function () {
            const i18 = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            //const sTxt = i18.getText("columnDescription");
            let oVBox = new sap.m.VBox({
                items: [
                    new sap.m.Label({ text: i18.getText("columnEmail"), labelFor: "input-User" }),
                    new sap.m.Input({ id: "input-User", required: true, type: "Email", placeholder: i18.getText("placeHolderEmail") }),
                    //new sap.m.Label({text: "Application ID", labelFor: "input-AppID"}), new sap.m.Input({id: "input-AppID", required: true}),
                    new sap.m.Label({ text: i18.getText("columnId"), labelFor: "input-AppID" }),
                    new sap.m.Select({
                        id: "input-AppID", required: true, width: "100%",
                        items: {
                            path: "JSONModel>/App",
                            template: new sap.ui.core.Item({
                                key: "{JSONModel>ID}",
                                text: "{JSONModel>DESC}"
                            })
                        }
                    }),
                    new sap.m.Label({ text: i18.getText("columnCreate"), labelFor: "switch-Create" }), new sap.m.Switch({ id: "switch-Create", type: "AcceptReject", state: true }),
                    new sap.m.Label({ text: i18.getText("columnEdit"), labelFor: "switch-Edit" }), new sap.m.Switch({ id: "switch-Edit", type: "AcceptReject", state: true }),
                    new sap.m.Label({ text: i18.getText("columnDelete"), labelFor: "switch-Delete" }), new sap.m.Switch({ id: "switch-Delete", type: "AcceptReject", state: true }),
                    new sap.m.Label({ text: i18.getText("columnErase"), labelFor: "switch-Erase" }), new sap.m.Switch({ id: "switch-Erase", type: "AcceptReject", state: false })
                ]
            });
            oVBox.addStyleClass("sapUiSmallMargin"); // Add Margin to oVBox
            this.oDefaultDialog = new Dialog({
                title: i18.getText("titleCreateDialog"),
                content: oVBox,
                beginButton: new Button({
                    type: "Emphasized",
                    text: i18.getText("beginButtonCreate"),
                    press: async function () {
                        let inputUser = sap.ui.getCore().byId("input-User");
                        let inputAppID = sap.ui.getCore().byId("input-AppID");
                        let inputCreate = sap.ui.getCore().byId("switch-Create").getState() ? "X" : null;
                        let inputEdit = sap.ui.getCore().byId("switch-Edit").getState() ? "X" : null;
                        let inputDelete = sap.ui.getCore().byId("switch-Delete").getState() ? "X" : null;
                        let inputErase = sap.ui.getCore().byId("switch-Erase").getState() ? "X" : null;
                        let inputs = [inputUser];
                        this._setInitialInputs(inputs, false);
                        if (inputUser.getValue().length === 0) {
                            this._setMessage("error", i18.getText("emailMandatory"), inputUser, "Error", null);
                            return;
                        }
                        let data = [{
                            EMAIL: inputUser.getValue(), ID: inputAppID.getSelectedKey(),
                            CREATE: inputCreate, EDIT: inputEdit,
                            DELETE: inputDelete, ERASED: inputErase
                        }];
                        let result = await this._create(data);
                        if (result.error) {
                            this._setMessage("error", result.error, null, null, null);
                            return;
                        }
                        console.log(result);
                        this._setMessage("success", result.result, null, null, 3);
                        this._query();
                        this.oDefaultDialog.destroy();
                        this.oDefaultDialog = null;
                    }.bind(this)
                }),
                endButton: new Button({
                    text: i18.getText("cancelButton"),
                    press: function () {
                        this.oDefaultDialog.destroy();
                        this.oDefaultDialog = null;
                    }.bind(this)
                })
            });
            this.getView().addDependent(this.oDefaultDialog);
            this.oDefaultDialog.open();
        }
    });
});