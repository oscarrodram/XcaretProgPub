sap.ui.define([
    "com/xcaret/receptionpublic/utils/Users"
], function (Users) {
    "use strict";

    return {
        getService: async function (controller, api, filter) { // Controller, API Route and Model name, Filter
            // Set view
            let view = controller.getView();
            // Get host
            let host = this._getHost();
            // Add filter
            let Filter = "";
            if(filter) Filter = filter;
            // Get Service Info
            try {
                let response = await fetch(host + `${api}${Filter}`, { method: "GET" });
                if (!response.ok) throw new Error(`${response.error}`);
                let responseData = await response.json();
                let oModel = view.getModel("JSONModel");
                oModel.setProperty(`${api}`, responseData.result);
                if(responseData.result) return responseData.result.length;
                return 0;
            } catch (error) {
                return console.error(error);
            }
        },

        getRolUser: async function(controller){ /// ------ Main | Item ------ ///
            let view = controller.getView();
            let host = this._getHost();
            let oUserInfo = Users.getUserInfo();
            try {
                let response = await fetch(host + `/Rol?$filter=EMAIL EQ '${oUserInfo.sEmail}' AND ID EQ '009'`, { method: "GET" });
                if (!response.ok) throw new Error(`${response.error}`);
                let responseData = await response.json();
                if(responseData.length === 0) return "No Data";
                let oModel = view.getModel("JSONModel");
                oModel.setProperty(`/RolUser`, responseData.result);
            } catch (error) {
                return console.error(error);
            }
        },

        getReception: async function(controller, recepcionId, filter){
            // Set view
            let view = controller.getView();
            // Get host
            let host = this._getHost();
            // Add filter
            let Filter = "";
            if(filter) Filter = filter;
            // Get Service Info
            try {
                let response = await fetch(host + `/ScheduleLine/${recepcionId}`, { method: "GET" });
                if (!response.ok) throw new Error(`${response.error}`);
                let responseData = await response.json();
                if(responseData.length === 0) return "No Data";
                let oModel = view.getModel("JSONModel");
                oModel.setProperty(`/Reception`, responseData.response);
            } catch (error) {
                return console.error(error);
            }
        },

        getMaterialsFromStyleSheet: async function (oController, sFilter) {
            let oView = oController.getView();
            let oModel = oView.getModel("JSONModel");
            let host = this._getHost();
            let Filter = "";
            if(sFilter) Filter = sFilter;
            try {
                let response = await fetch(host + `/ProductSheetItems${sFilter}`, { method: "GET" });
                if (!response.ok) throw new Error(`${response.error}`);
                let responseData = await response.json();
                if(responseData.length === 0) return "No Data";
                oModel.setProperty(`/ProductSheetItems`, responseData.result);
            } catch (error) {
                return console.error(error);
            }
        },

        getContractsFromStyleSheet: async function (oController, sFilter) {
            let oView = oController.getView();
            let oModel = oView.getModel("JSONModel");
            let host = this._getHost();
            let Filter = "";
            if(sFilter) Filter = sFilter;
            try {
                let response = await fetch(host + `/ContractItemsFromScheduleLine${sFilter}`, { method: "GET" });
                if (!response.ok) throw new Error(`${response.error}`);
                let responseData = await response.json();
                if(responseData.length === 0) return "No Data";
                oModel.setProperty(`/ContractFromStyleSheet`, responseData.result);
            } catch (error) {
                return console.error(error);
            }
        },

        getRange: async function (controller, api, filter) { // Controller, API Route and Model name, Filter
            // Set view
            let view = controller.getView();
            // Get host
            let host = this._getHost();
            // Add filter
            let Filter = "";
            if(filter) Filter = filter;
            // Get Service Info
            try {
                let response = await fetch(host + `${api}${Filter}`, { method: "GET" });
                if (!response.ok) throw new Error(`${response.error}`);
                let responseData = await response.json();
                let oModel = view.getModel("JSONModel");
                oModel.setProperty(`/Range`, responseData[0]);
                if(responseData.length) return responseData.length;
                return 0;
            } catch (error) {
                return console.error(error);
            }
        },

        _getHost: function(){
            // Set host
            let host = "";
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

            return host;
        },

        postScheduleLine: async function(Controller, Body){
            // Set view
            let view = Controller.getView();
            // Get host
            let host = this._getHost();
            // Get Service Info
            try {
                let response = await fetch(host + `/ScheduleLine`, {
                    method: "POST" ,
                    headers: { "Content-Type" : "application/json" },
                    body: JSON.stringify(Body)
                });
                if (!response.ok) throw new Error(`${await response.text()}`);
                let responseData = await response.json();
                return responseData.result;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        },

        putScheduleLine: async function(Controller, Body, EBELN){
            let host = this._getHost();
            try {
                let response = await fetch(host + `/ScheduleLine/${EBELN}`, {
                    method: "PUT" ,
                    headers: { "Content-Type" : "application/json" },
                    body: JSON.stringify(Body)
                });
                if (!response.ok) throw new Error(`${await response.text()}`);
                let responseData = await response.json();
                return responseData.result;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        },

        putRequirements: async function(Controller, Body){
            // Set view
            let view = Controller.getView();
            // Get host
            let host = this._getHost();
            // Get Service Info
            try {
                let response = await fetch(host + `/RequirementQuantity`, {
                    method: "PUT" ,
                    headers: { "Content-Type" : "application/json" },
                    body: JSON.stringify(Body)
                });
                if (!response.ok) throw new Error(`${await response.text()}`);
                let responseData = await response.json();
                return responseData.result;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        },

        putContracts: async function(Controller, Body){
            // Set view
            let view = Controller.getView();
            // Get host
            let host = this._getHost();
            // Get Service Info
            try {
                let response = await fetch(host + `/ContractQuantity`, {
                    method: "PUT" ,
                    headers: { "Content-Type" : "application/json" },
                    body: JSON.stringify(Body)
                });
                if (!response.ok) throw new Error(`${await response.text()}`);
                let responseData = await response.json();
                return responseData.result;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        },

        putRange: async function(Controller, Body, Count){
            // Set view
            let view = Controller.getView();
            // Get host
            let host = this._getHost();
            // Get Service Info
            try {
                let response = await fetch(host + `/Ranges/${Count}`, {
                    method: "PUT" ,
                    headers: { "Content-Type" : "application/json" },
                    body: JSON.stringify(Body)
                });
                if (!response.ok) throw new Error(`${await response.text()}`);
                let responseData = await response.json();
                return responseData.result;
            } catch (error) {
                return `Error: ${error.message}`;
            }
        },

        getImageMaterial: function(MaterialID) {
            debugger;
            const host = this._getHost();
            return fetch(`${host}/ImageMaterial/${MaterialID}`, { method: "GET" })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    //return response.json();  // Promise que resuelve al body JSON
                    return response;
                })
                .catch(error => {
                    console.error("getImageMaterial error:", error);
                    // opcionalmente devolvemos algo por defecto: []
                    return [];
                }
            );
        }
    };
});