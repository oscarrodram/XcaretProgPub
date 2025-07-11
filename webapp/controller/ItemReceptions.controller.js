sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"com/xcaret/receptionpublic/utils/Validations",
	"com/xcaret/receptionpublic/utils/Json",
	"com/xcaret/receptionpublic/utils/Model",
	"com/xcaret/receptionpublic/utils/ObjectPageLayout",
	"com/xcaret/receptionpublic/utils/GetServices",
	"com/xcaret/receptionpublic/utils/SetInitialCreation",
	"com/xcaret/receptionpublic/utils/SetDialogs",
	"com/xcaret/receptionpublic/utils/SetInput",
	"com/xcaret/receptionpublic/utils/MultiInputs",
	"com/xcaret/receptionpublic/utils/Text",
	"com/xcaret/receptionpublic/utils/Button",
	"com/xcaret/receptionpublic/utils/TableSelectDialog",
	"com/xcaret/receptionpublic/utils/Table",
	"sap/m/MessageToast",
	"com/xcaret/receptionpublic/utils/SelectDialogs",
	"com/xcaret/receptionpublic/utils/Cleaner",
	"com/xcaret/receptionpublic/utils/I18n",
	"sap/ushell/Container"
], (
	Controller,
	Validations,
	Json,
	Model,
	ObjectPageLayout,
	GetServices,
	SetInitialCreation,
	SetDialogs,
	SetInput,
	MultiInputs,
	Text,
	Button,
	TableSelectDialog,
	Table,
	MessageToast,
	SelectDialogs, Cleaner, I18n, Container) => {
	"use strict";

	return Controller.extend("com.xcaret.receptionpublic.controller.ItemReceptions", {
        onInit() { //-----------------------------------------------------------------------------------------//
			this.getOwnerComponent().getRouter()
				.getRoute("ItemReceptions")
				.attachPatternMatched(this._onPatternMatched, this);
        },

		_onPatternMatched: async function (oEvent) {
			let i18n = I18n.getTranslations(this);
			Cleaner.clear(this);
			let oModel = new sap.ui.model.json.JSONModel();
			oModel.setProperty("/TemplateMaterial", "");
            this.getView().setModel(oModel, "JSONModel");
			var oArgs = oEvent.getParameter("arguments");
			let recepcionId = oArgs.ID_Reception;
			// Establish in model /Users
			GetServices.getService(this, `/User`, null);
			GetServices.getRolUser(this);
			if(recepcionId === "creation"){
				SetInitialCreation.getInitialParams(this);
				return;
			}
			let error = await SetInitialCreation.setModificationView(this, recepcionId);
			if(error){
				SetDialogs.setErrorDialog(this, error);
				return;
			}
		},

		/// Events for Programación de recepción ///
		// Header //
		onSaveReception: async function(){
			// Updating
			let oEditButton = this.byId("EditButton");
			let isModification = oEditButton.getVisible();
			let operationType = "Creation";
			if(isModification) operationType = "Modification";
			// Validation of data
			let validation = Validations.validateReception(this, operationType);
			if(validation.startsWith("Error") || validation.startsWith("Warning")){
				if(validation.startsWith("ErrorSupplied")) return;
				if(validation.startsWith("Error")){
					SetDialogs.setErrorDialog(this, validation.substring(7));
					return;
				}
				let bUserResponse = await SetDialogs.setWarningDialog(this, validation.substring(9));
				if(bUserResponse === false) return;
			}
			
			// Get counter
			if(!isModification) await GetServices.getRange(this, `/Ranges/query`, `?OBJECT=RECPUB`);
			// Post in ScheduleLine
			let ScheduleLines = [];
			let ScheduleLine = await Json.getScheduleLine(this, isModification);
			let EBELN = Model.getItemValue(this, "Reception", "EBELN");
			if(isModification){
				let updateResponse = await GetServices.putScheduleLine(this, ScheduleLine, EBELN);
				if(updateResponse.startsWith(`Error: `)){
					SetDialogs.setErrorDialog(this, JSON.parse(updateResponse.substring(7)).error);
					return;
				}
				let aContracts = await Json.getContractUpdate(this, operationType);
				if(aContracts.length > 0){
					let responseContracts = await GetServices.putContracts(this, aContracts);
					if(responseContracts.startsWith(`Error: `)){
						SetDialogs.setErrorDialog(this, JSON.parse(responseContracts.substring(7)).error);
						//return;
					}
				}
				let aRequirements = await Json.getRequirementUpdate(this, operationType);
				if(aRequirements.length > 0){
					let responseRequirements = await GetServices.putRequirements(this, aRequirements);
					if(responseRequirements.startsWith(`Error: `)){
						SetDialogs.setErrorDialog(this, JSON.parse(responseRequirements.substring(7)).error);
						//return;
					}
				}
				SetDialogs.setSuccessDialog(this, `${updateResponse} ID: ${EBELN}`);
				await new Promise(resolve => setTimeout(resolve, 2000));
				Cleaner.clear(this);
				let oRouterUpdate = sap.ui.core.UIComponent.getRouterFor(this);
				oRouterUpdate.navTo("Main");
				return;
			}
			ScheduleLines.push(ScheduleLine);
			let response = await GetServices.postScheduleLine(this, ScheduleLines);
			if(response.startsWith(`Error: `)){
				SetDialogs.setErrorDialog(this, JSON.parse(response.substring(7)).error);
				return;
			}

			// Update Contracts
			let aContracts = await Json.getContractUpdate(this, operationType);
			if(aContracts.length > 0){
				let responseContracts = await GetServices.putContracts(this, aContracts);
				if(responseContracts.startsWith(`Error: `)){
					SetDialogs.setErrorDialog(this, JSON.parse(responseContracts.substring(7)).error);
					//return;
				}
			}

			// Update Requirements
			let aRequirements = await Json.getRequirementUpdate(this, operationType);
			if(aRequirements.length > 0){
				let responseRequirements = await GetServices.putRequirements(this, aRequirements);
				if(responseRequirements.startsWith(`Error: `)){
					SetDialogs.setErrorDialog(this, JSON.parse(responseRequirements.substring(7)).error);
					//return;
				};
			}
			
			// Update Range
			let aRange = await Json.getRangeUpdate(this);
			let responseRange = await GetServices.putRange(this, aRange, "RECPUB");
			if(responseRange.startsWith(`Error: `)){
				SetDialogs.setErrorDialog(this, JSON.parse(responseRange.substring(7)).error);
				return;
			};

			SetDialogs.setSuccessDialog(this, `${response} ID: ${ScheduleLine.EBELN}`);
			await new Promise(resolve => setTimeout(resolve, 2000));
			Cleaner.clear(this);
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Main");
		},

		onEditReception: async function(){
			// Set multilocation
			let oMultiLocation = this.byId("InputLocation");
			let enabled = "setEnable";
			if(oMultiLocation.getEnabled()) enabled = "noEnabled";
            MultiInputs.setBehavior(oMultiLocation, "noClear", enabled);
			// Set DateTime Reception
            let oInputDateTime = this.byId("InputProggrammingDateTime");
            SetInput.setBehavior(oInputDateTime, "noClear", enabled);
			// Set Manager Receptor
			let oMultiManagerReceptor = this.byId("MultiInReceptorManager");
            SetInput.setBehavior(oMultiManagerReceptor, "noClear", enabled);
			// Set Unit Quantity
			let oInputUnitQuantity = this.byId("idUnitQuantityInput");
			SetInput.setBehavior(oInputUnitQuantity, "noClear", enabled);
			// Set Reference Buttons
			let ReferenceToContract = this.byId("ReferenceToButtonContract");
			let oContractBadge = this.byId("idContractBadgeCustomData");
			let ReferenceToRequirement = this.byId("ReferenceToButtonRequirement");
			let oRequirementBadge = this.byId("idRequirementBadgeCustomData");
			let oReferenceToStyleSheet = this.byId("ReferenceToButtonStyleSheet");
			let oStyleSheetBadge = this.byId("idStyleSheetBadgeCustomData");
			let aContracts = Model.getModel(this, "/ContractItemsFromScheduleLine");
			let aRequirements = Model.getModel(this, "/RequirementSpecials");
			let aStyleSheets = Model.getModel(this, "/ProductSheet");
			oContractBadge.setValue("");
			oContractBadge.setVisible(false);
			if(aContracts !== undefined){
				Button.setBehavior(ReferenceToContract, enabled);
				if(enabled === "setEnable"){
					oContractBadge.setValue(aContracts.length);
					oContractBadge.setVisible(true);
				}
			}
			oRequirementBadge.setValue("");
			oRequirementBadge.setVisible(false);
			if(aRequirements !== undefined){
				Button.setBehavior(ReferenceToRequirement, enabled);
				if(enabled === "setEnable"){
					oRequirementBadge.setValue(aRequirements.length);
					oRequirementBadge.setVisible(true);
				}
			}
			oStyleSheetBadge.setValue("");
			oStyleSheetBadge.setVisible(false);
			if(aStyleSheets !== undefined){
				Button.setBehavior(oReferenceToStyleSheet, enabled);
				if(enabled === "setEnable"){
					oStyleSheetBadge.setValue(aStyleSheets.length);
					oStyleSheetBadge.setVisible(true);
				}
			}
			// Set Table Positions
			let oTable = this.byId("ScheduleLineItemTable");
			oTable.removeSelections();
			if(enabled === "setEnable") oTable.setMode("SingleSelect");
			else oTable.setMode("None");
			// Set Table Buttons
			let oOpenItemButton = this.byId("OpenItemButton");
			let oCancelItemButton = this.byId("CancelItemButton");
			Button.setBehavior(oOpenItemButton, "noEnable");
			Button.setBehavior(oCancelItemButton, "noEnable");
			let oItems = oTable.getItems();
			// foreach of all Items Table
			for (const oItem of oItems) {
				let oCells = oItem.getAggregation("cells");
				// foreach of all fields of the item table
				for (const oField of oCells) {
					let fieldMetadata = oField.getMetadata();
					let sElementName = fieldMetadata.getElementName();
					if(sElementName !== "sap.m.Input") continue;
					SetInput.setBehavior(oField, "noClear", enabled);
				}
			}
		},

		/// General ///
		// Project Input //-----------------------------------------------------------------------------------//
		onInputProjectValueHelpRequest: function(oEvent) {
			let PathModel = "/Project";
			let PropertyID = "{ID_PEP}";
			let PropertyDescription = "{NAME1}";
			SelectDialogs.Create(oEvent, this, PathModel, PropertyID, PropertyDescription);
        },

		onMultiProjectTokenUpdate: async function(oEvent){
			let i18n = I18n.getTranslations(this);
			// Save inputs
			let Input = oEvent.getSource();
			let InputLocation = this.byId("InputLocation");
			let TextClaveHab = this.byId("TextClaveHabitacion");
			let ReferenceToContract = this.byId("ReferenceToButtonContract");
			let oContractBadge = this.byId("idContractBadgeCustomData");
			let ReferenceToRequirement = this.byId("ReferenceToButtonRequirement");
			let oRequirementBadge = this.byId("idRequirementBadgeCustomData");
			let oReferenceToStyleSheet = this.byId("ReferenceToButtonStyleSheet");
			let oStyleSheetBadge = this.byId("idStyleSheetBadgeCustomData");

			// Set Initial Behavior
			SetInput.setBehavior(Input, "noClear", "setEnable");
			MultiInputs.setBehavior(InputLocation, "setClear", "noEnable");
			Text.setBehavior(TextClaveHab, "setClear");
			Button.setBehavior(ReferenceToContract, "noEnable");
			oContractBadge.setValue("");
			oContractBadge.setVisible(false);
			Button.setBehavior(ReferenceToRequirement, "noEnable");
			oRequirementBadge.setValue("");
			oRequirementBadge.setVisible(false);
			Button.setBehavior(oReferenceToStyleSheet, "noEnable");
			oStyleSheetBadge.setValue("");
			oStyleSheetBadge.setVisible(false);
			if(Model.getModel(this, "/ScheduleLine")) Model.clearModel(this, "/ScheduleLine");

			// Get Project Model
			let oModel = this.getView().getModel("JSONModel");
			let projectModel = oModel.getProperty("/Project");

			//
			let parameters = oEvent.getParameters();
			let tokenType = parameters.type;
			if(tokenType === "removed"){
				SetInput.setInformation(Input, i18n.getText("Msg_Valid_Project"));
				return;
			}
			// If a project does not exist, unable Location field
			let project = Input.getTokens()[0];
			let inputValue = project.getKey();
			if(project.length === 0){
				SetInput.setError(Input, i18n.getText("Msg_Valid_Project"));
				return;
			}
			if (!projectModel.some(item => item.ID_PEP === inputValue)) {
				SetInput.setError(Input, i18n.getText("Msg_Valid_Project"));
				return;
			}
			let numberLocations = await GetServices.getService(this, `/LocationAll`, `?$filter=PSPNR EQ '${inputValue}'`);
			if (numberLocations === 0) {
				SetInput.setError(Input, i18n.getText("Msg_No_Locations_Found"));
				return;
			}
			InputLocation.setEnabled(true);
		},

		// Location Input //-----------------------------------------------------------------------------------//
		onInputLocationValueHelpRequest: function(oEvent) {
			let PathModel = "/LocationAll";
			let PropertyID = "{LGPLA}";
			let PropertyDescription = "{LGPLAT}";
			SelectDialogs.Create(oEvent, this, PathModel, PropertyID, PropertyDescription);
        },
		
		onMultiLocationTokenUpdate: async function (oEvent) {
			let Input = oEvent.getSource();
			//let TextNameLocation = this.byId("TextProject");
			let TextClaveHab = this.byId("TextClaveHabitacion");
			let ReferenceToContract = this.byId("ReferenceToButtonContract");
			let oContractBadge = this.byId("idContractBadgeCustomData");
			let ReferenceToRequirement = this.byId("ReferenceToButtonRequirement");
			let oRequirementBadge = this.byId("idRequirementBadgeCustomData");
			let oReferenceToStyleSheet = this.byId("ReferenceToButtonStyleSheet");
			let oStyleSheetBadge = this.byId("idStyleSheetBadgeCustomData");
			// Get Values
			let LocationToken = Input.getTokens()[0];
			let Location = LocationToken.getKey();

			// Set behavior of Location and Clave Habitación Text
			Text.setBehavior(TextClaveHab, "setClear");
			Button.setBehavior(ReferenceToContract, "noEnable");
			oContractBadge.setValue("");
			oContractBadge.setVisible(false);
			Button.setBehavior(ReferenceToRequirement, "noEnable");
			oRequirementBadge.setValue("");
			oRequirementBadge.setVisible(false);
			Button.setBehavior(oReferenceToStyleSheet, "noEnable");
			oStyleSheetBadge.setValue("");
			oStyleSheetBadge.setVisible(false);

			// Get Location Model
			let locationModel = Model.getModel(this, "/LocationAll");

			// Get row for selected Location
			let locationRow = locationModel.find(item => item.LGPLA === Location);
			if (!locationRow) return;

			// Set name of location
			//TextClaveHab.setText(locationRow.LGPLAH);
			TextClaveHab.setText(locationRow.LGPLAC);
			
			// Query Service to Requirements for References
			let MultiInputProject = this.byId("InputProject");
			let ProjectToken = MultiInputProject.getTokens()[0];
			let keyInputProject = ProjectToken.getKey();
			let numberContracts = await GetServices.getService(this, `/ContractItemsFromScheduleLine`, `/?$filter=EKKO.PSPNR EQ '${keyInputProject}'`);
			if(numberContracts > 0) {
				Button.setBehavior(ReferenceToContract, "setEnable");
				oContractBadge.setValue(numberContracts.toString());
				oContractBadge.setVisible(true);
			}
			let numberSpecialRequirements = await GetServices.getService(this, `/RequirementSpecials`, `/${keyInputProject}`);
			if(numberSpecialRequirements > 0) {
				Button.setBehavior(ReferenceToRequirement, "setEnable");
				oRequirementBadge.setValue(numberSpecialRequirements.toString());
				oRequirementBadge.setVisible(true);
			}
			let numberStyleSheet = await GetServices.getService(this, `/ProductSheet`, `?$filter=T0HDH.STATUS EQ '1'`);
			if(numberStyleSheet > 0){
				Button.setBehavior(oReferenceToStyleSheet, "setEnable");
				oStyleSheetBadge.setValue(numberStyleSheet.toString());
				oStyleSheetBadge.setVisible(true);
			}
		},

		onLinkPress: async function(){
			const Navigation = await Container.getServiceAsync("Navigation");
			const sHref = await Navigation.getHref({
				target : {
				  semanticObject: "Locaciones",
				  action: "manage"
				}
			  }, this);
			sap.m.URLHelper.redirect(sHref, true);
		},

		// Receptor Manager MultiInput //-----------------------------------------------------------------------------------//
		onMultiInputReceptorManagerValueHelpRequest: function(oEvent) {
			let PathModel = "/User";
			let PropertyID = "{ERNAM}";
			let PropertyDescription = "{NAME} {LNAME}";
			SelectDialogs.CreateUserDialog(oEvent, this, PathModel, PropertyID, PropertyDescription);
        },

		onInputHabQuantityLiveChange: function(oEvent){
			let oInput = oEvent.getSource();
			SetInput.setBehavior(oInput, "noClear", "setEnable");
			let sValue = oInput.getValue();
			if(!!sValue) return;
			let i18n = I18n.getTranslations(this);
			SetInput.setError(oInput, i18n.getText("Msg_Valid_Number"));
		},

		// Cancel line Button //-------------------------------------------------------------------------------//
		onChangeItemStatus: function(oEvent){
			let i18n = I18n.getTranslations(this);
			let oTable = this.byId("ScheduleLineItemTable");
			let oSelectedItem = oTable.getSelectedItem();
			if(oSelectedItem === null) return;
			let oBindingContext = oSelectedItem.getBindingContext("JSONModel");
			let oModel = oBindingContext.getModel("JSONModel");
			let sPath = oBindingContext.getPath();
			let sStatus = oModel.getProperty(`${sPath}/IT_Status`);
			if(sStatus === "0"){
				oModel.setProperty(`${sPath}/IT_Status`, "3");
				oModel.setProperty(`${sPath}/IT_Status_Desc`, `${i18n.getText("IT_Status_3")}`);
				let oOpenItemButton = this.byId("OpenItemButton");
				Button.setBehavior(oEvent.getSource(), "noEnable");
				Button.setBehavior(oOpenItemButton, "setEnable");
			}else{
				oModel.setProperty(`${sPath}/IT_Status`, "0");
				oModel.setProperty(`${sPath}/IT_Status_Desc`, `${i18n.getText("IT_Status_0")}`);
				let oCancelItemButton = this.byId("CancelItemButton");
				Button.setBehavior(oEvent.getSource(), "noEnable");
				Button.setBehavior(oCancelItemButton, "setEnable");				
			}
		},

		// Reference to Style Sheet Button //-------------------------------------------------------------------------------//
		onPressReferenceStyleSheet: async function(oEvent){
			TableSelectDialog.CreateStyleSheet(oEvent, this, null)
			.then(async function(oSelectedStyleSheet){
				let oBindigContext = oSelectedStyleSheet.getBindingContext();
				let sPath = oBindigContext.getPath();
				let oModel = this.getView().getModel("JSONModel");
				let sTemplateId = oModel.getProperty(`${sPath}/ID_HOJA`);
				//oModel.setProperty("/TemplateMaterial/ID_HOJA", sTemplateId);
				oModel.setProperty("/TemplateMaterial", {});
				oModel.setProperty("/TemplateMaterial/ID_HOJA", sTemplateId);
				try{
					await GetServices.getMaterialsFromStyleSheet(this, `?$filter=ID_HOJA EQ '${sTemplateId}' AND STATUSP EQ '1'&$select=MATNR,MENGE`);
				}catch{
					console.log("No StyleSheet");
				}
				oModel.refresh();
				let aMaterials = oModel.getProperty("/ProductSheetItems") || [];
				let MultiInputProject = this.byId("InputProject");
				let keyInputProject;
				for(let oProjectMulti of MultiInputProject.getTokens()){
					keyInputProject = oProjectMulti.getKey();
				}
				//let sFilter = `?$filter=EKKO.PSPNR EQ '${keyInputProject}'`;
				let sFilter = "";
				for(let oMaterial of aMaterials){
					if(sFilter) sFilter += ` OR `;
					sFilter += ` MARA.MATNR EQ '${oMaterial.MATNR}'`
				}
				if(sFilter) sFilter = `?$filter=EKKO.PSPNR EQ '${keyInputProject}' AND (${sFilter})`;
				else sFilter = `?$filter=EKKO.PSPNR EQ '${keyInputProject}'`;
				await GetServices.getContractsFromStyleSheet(this, sFilter);
				let selectedItems = await TableSelectDialog.CreateContractFromStyleSheet(this);
				if(selectedItems.length === 0) return;
				Table.SetInfo(this, selectedItems, "Contract");
				let x = 0;
			}.bind(this));
		},

		// Reference to Contracts Button //-------------------------------------------------------------------------------//
		onPressReferenceContract: async function(Event){
			// Data of TableSelectDialog
			let pathAPI = "ContractItemsFromScheduleLine";
			let scheduleLine;
			if(Model.getModel(this, `/ScheduleLine`)) 
				scheduleLine = Model.getModel(this, `/ScheduleLine`).map(item => item.IT_Key);
			let selectedItems  = await TableSelectDialog.Create(Event, this, pathAPI, scheduleLine);
			if(selectedItems.length === 0) return;
			Table.SetInfo(this, selectedItems, "Contract");
		},

		// Reference to Requirements Button //-------------------------------------------------------------------------------//
		onPressReferenceRequirement: async function(Event){
			// Data of TableSelectDialog
			let pathAPI = "RequirementSpecials";
			let scheduleLine;
			if(Model.getModel(this, `/ScheduleLine`)) 
				scheduleLine = Model.getModel(this, `/ScheduleLine`).map(item => item.IT_Key);
			let selectedItems  = await TableSelectDialog.Create(Event, this, pathAPI, scheduleLine);
			if(selectedItems.length === 0) return;
			Table.SetInfo(this, selectedItems, "Requirement");
		},

		// Table Events //---------------------------------------------------------------------------------------------------//
		onSelectionItemChange: function(oEvent){
			let locationInput = this.byId("InputLocation");
			let oOpenItemButton = this.byId("OpenItemButton");
			let oCancelItemButton = this.byId("CancelItemButton");
			let editMode = locationInput.getEnabled();
			if(!editMode){
				Button.setBehavior(oOpenItemButton, "noEnable");
				Button.setBehavior(oCancelItemButton, "noEnable");
				return;
			}
			let oListItem = oEvent.getParameter("listItem");
			let oBindingContext = oListItem.getBindingContext("JSONModel");
			let oModel = oBindingContext.getModel("JSONModel");
			let sPath = oBindingContext.getPath();
			let sStatus = oModel.getProperty(`${sPath}/IT_Status`);
			if(sStatus === "0"){
				Button.setBehavior(oCancelItemButton, "setEnable");
				Button.setBehavior(oOpenItemButton, "noEnable");
			}else{
				Button.setBehavior(oOpenItemButton, "setEnable");
				Button.setBehavior(oCancelItemButton, "noEnable");
			}
		},

		onPressTableDetail: function(Event){
			let oSelectedItem = Event.getSource();
			let oBindingContexts = oSelectedItem.getBindingContext("JSONModel");
			let sPath = oBindingContexts.getPath();
			SetDialogs.Create(this, sPath);
		},

		updateFinishedTable: function(oEvent){
			let locationInput = this.byId("InputLocation");
			let enabled = "setEnable";
			if(locationInput.getEnabled() === false) enabled = "noEnabled";
			let table = oEvent.getSource();
			let oItems = table.getItems();
			for (const oItem of oItems) {
				let oCells = oItem.getAggregation("cells");
				// foreach of all fields of the item table
				for (const oField of oCells) {
					let fieldMetadata = oField.getMetadata();
					let sElementName = fieldMetadata.getElementName();
					if(sElementName !== "sap.m.Input") continue;
					SetInput.setBehavior(oField, "noClear", enabled);
				}
			}
		}
	});
});