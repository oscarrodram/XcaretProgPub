sap.ui.define([
    "com/xcaret/receptionpublic/utils/GetServices",
    "com/xcaret/receptionpublic/utils/Model",
    "com/xcaret/receptionpublic/utils/MultiInputs",
    "com/xcaret/receptionpublic/utils/Dates",
    "com/xcaret/receptionpublic/utils/SetInput",
    "com/xcaret/receptionpublic/utils/Button",
    "sap/m/Token",
    "com/xcaret/receptionpublic/utils/I18n"
], function (
	GetServices, Model, MultiInputs, Dates, SetInput, Button, Token, I18n) {
    "use strict";

    return {
        getInitialParams: async function (controller) {
            // Set view
            let view = controller.getView();

            // Establish in model /Project
			GetServices.getService(controller, `/Project`, null);

            // Establish initial DateTime of Creation View
            var oDateTimePicker = view.byId("InputProggrammingDateTime");
            oDateTimePicker.setDateValue(new Date());
            SetInput.setBehavior(oDateTimePicker, "noClear", "setEnable");
        },

        setModificationView: async function(controller, receptionId){
            let i18n = I18n.getTranslations(controller);
            // Get ScheduleLine
            let serviceError = await GetServices.getReception(controller, receptionId, null);
            if(serviceError) return `${i18n.getText("IR_NoScheduleFound")}`;
            let oScheduleLine = Model.getModel(controller, "/Reception");
            oScheduleLine.Modification = true;
            Model.setModel(controller, "/Reception", oScheduleLine);
            oScheduleLine = Model.getModel(controller, "/Reception");
            let oModel = controller.getView().getModel("JSONModel");
            oModel.setProperty("/TemplateMaterial", {});
            if(oScheduleLine.ID_HOJA){
                oModel.setProperty("/TemplateMaterial/ID_HOJA", oScheduleLine.ID_HOJA);
                await GetServices.getMaterialsFromStyleSheet(controller, `?$filter=ID_HOJA EQ '${oScheduleLine.ID_HOJA}' AND STATUSP EQ '1'&$select=MATNR,MENGE`);
            }
            // Set Edit Button
            let EditButton = controller.byId("EditButton");
            EditButton.setVisible(true);
            let SaveButton = controller.byId("SaveButton");
            SaveButton.setVisible(true);
            let oModelUser = oModel.getProperty("/RolUser/0") || {};
            if(oModelUser.EDIT !== "X"){
                EditButton.setVisible(false);
                SaveButton.setVisible(false);
            }
            // Set multiproject
            let oMultiProject = controller.byId("InputProject");
            MultiInputs.setBehavior(oMultiProject, "noClear", "noEnable");
            oMultiProject.addToken(
                new Token({
                    key: oScheduleLine.ID_PEP,
                    text: oScheduleLine.PROJ_NAME
                }));
            // Set multilocation
            let oMultiLocation = controller.byId("InputLocation");
            MultiInputs.setBehavior(oMultiLocation, "noClear", "noEnable");
            oMultiLocation.addToken(
                new Token({
                    key: oScheduleLine.LGPLA,
                    //text: oScheduleLine.LOC_NAME
                    text: oScheduleLine.LOC_DESC
                })
            )
            //let numberLocations = await GetServices.getService(controller, `/Location`, `/${oScheduleLine.ID_PEP}`);
            let numberLocations = await GetServices.getService(controller, `/LocationAll`, `?$filter=PSPNR EQ '${oScheduleLine.ID_PEP}'`);

			if (numberLocations === 0) {
				SetInput.setError(oMultiLocation, i18n.getText("Set_Init_Crea_No_Location_Found"));
				return;
			}
            // Set Room
            let oTextRoom = controller.byId("TextClaveHabitacion");
            oTextRoom.setText(oScheduleLine.LGORT);
            // Set Receptor Manager
            let oMultiReceptor = controller.byId("MultiInReceptorManager");
            MultiInputs.setBehavior(oMultiReceptor, "noClear", "noEnable");
            oMultiReceptor.addToken(
                new Token({
                    key: oScheduleLine.RESP,
                    text: `${oScheduleLine.RESP_NAME} ${oScheduleLine.RESP_LNAME}`
                })
            )
            // Set DateTime Reception
            let oInputDateTime = controller.byId("InputProggrammingDateTime");
            SetInput.setBehavior(oInputDateTime, "noClear", "noEnable");
            let date = Dates.setReceptionDate(oScheduleLine.DATETIME);
            oInputDateTime.setDateValue(date);
            // Set Unit Quantity Reception
            let oInputUnitQuantity = controller.byId("idUnitQuantityInput");
            SetInput.setBehavior(oInputUnitQuantity, "noClear", "noEnable");
            oInputUnitQuantity.setValue(oScheduleLine.HABQTY);

            // Set Table Items
            let numberContracts = await GetServices.getService(controller, `/ContractItemsFromScheduleLine`, `/?$filter=EKKO.PSPNR EQ '${oScheduleLine.ID_PEP}'`);
			let numberSpecialRequirements = await GetServices.getService(controller, `/RequirementSpecials`, `/${oScheduleLine.ID_PEP}`);
            let numberStyleSheets = await GetServices.getService(controller, `/ProductSheet`, `?$filter=T0HDH.STATUS EQ '1'`);
            // Set Table Items
            Model.setScheduleLine(controller);
        }
    };
});