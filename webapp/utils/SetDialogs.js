sap.ui.define([
    "com/xcaret/receptionpublic/utils/GetServices",
    "com/xcaret/receptionpublic/utils/I18n",
    "com/xcaret/receptionpublic/utils/Model",
    "com/xcaret/receptionpublic/utils/SetInput",
    "com/xcaret/receptionpublic/utils/Validations",
    "sap/m/Button",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Text",
    "sap/ui/core/Title",
    "sap/m/Switch",
    "sap/m/FormattedText",
    "sap/m/Dialog",
    "sap/m/library",
    "sap/ui/core/library",
    "sap/m/Slider",
    "sap/m/ResponsiveScale"
], function (GetServices,
	I18n,
	Model,
	SetInput,
	Validations,
	Button,
	Label,
	Input,
	Text,
	Title,
	Switch,
	FormattedText,
	Dialog,
	mobileLibrary,
	coreLibrary,
	Slider,
    ResponsiveScale) {
    "use strict";

    // shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;

	// shortcut for sap.ui.core.ValueState
	var ValueState = coreLibrary.ValueState;

    return {
        Create: function(Controller, sPath){
            let i18n = I18n.getTranslations(Controller);
            let SimpleForm = this._setFormDialog(Controller, sPath);
            let editButton = Controller.byId("EditButton");
            let modification = editButton.getVisible();
            let Dialog = new sap.m.Dialog({
                //title: `${i18n.getText("Dialog_Header")}: ${oItemData.IT_PositionItem}`,
                title: `${i18n.getText("Dialog_Header")}: {JSONModel>IT_PositionItem}`,
                stretch: true,
                content: [SimpleForm],
                beginButton: new Button({
                    type: "Emphasized",
                    text: i18n.getText("Dialog_Save_Button"),
                    press: async function (oEvent) {
                        let oBeginButton = oEvent.getSource();
                        let oDialog = oBeginButton.getParent();
                        let oElementBindingContext = oDialog.getBindingContext("JSONModel");
                        let sPath = oElementBindingContext.getPath();
                        let oModel = oElementBindingContext.getModel();
                        let sBoughtQuantity = oModel.getProperty(`${sPath}/IT_BoughtQuantity`);
                        if(modification) sBoughtQuantity = oModel.getProperty(`${sPath}/IT_AvailableQuantity`);
                        let sDeliveredQuantity = oModel.getProperty(`${sPath}/IT_DeliveredQuantity`);
                        let error = Validations.validateQuantityItemDialog(Controller, sBoughtQuantity, sDeliveredQuantity);
                        if(error === "Error"){
                            let InputDeliveryQuantity = sap.ui.getCore().byId(Controller.createId("IT_DeliveredQuantity_Dialog"));
                            SetInput.setError(InputDeliveryQuantity, i18n.getText("DD_E_Input_Delivery_Excceded"));
                            return;
                        }
                        Dialog.close();
                        let x = 0;
                    }
                }),
                endButton: new Button({
                    text: i18n.getText("Dialog_Cancel_Button"),
                    press: function (oEvent) {
                        Dialog.close();
                    }
                }),
                afterClose: function(oEvent){
                    let dialog = oEvent.getSource();
                    dialog.destroy();
                }
            });
            Dialog.setModel(Controller.getView().getModel("JSONModel"), "JSONModel");
            Dialog.bindElement({
                path: sPath,
                model: "JSONModel"
            });
            Dialog.open();
        },

        //_setFormDialog: function(Controller, oItemData){
        _setFormDialog: function(Controller, sPath){
            // Get Translations
            let i18n = I18n.getTranslations(Controller);
            let oMultinputLocation = Controller.byId("InputLocation");
            let enabled = oMultinputLocation.getEnabled();
            let editButton = Controller.byId("EditButton");
            let visible = editButton.getVisible();

            // Set SimpleForm
            let SimpleForm = new sap.ui.layout.form.SimpleForm({
                editable: true,
                layout: "ColumnLayout",
                title: `{JSONModel>IT_DocumentType}: {JSONModel>IT_ID}`,
                columnsM: 2,
                columnsL: 3,
                columnsXL: 4,
                content: [
                    // Reception Info
                    new Title({text: i18n.getText("Dialog_SubHeader_Reception")}),

                    new Label({text: ""}),
                    new sap.m.Image({
                        src: "{JSONModel>IT_Material_Image}",
                        width: "auto",
                        height: "100px"
                    }),
                    
                    new Label({text: i18n.getText("IT_Material")}), 
                    new Text({id: "IT_Material_Dialog", text: `{JSONModel>IT_Material_ID} {JSONModel>IT_Material}`}),

                    new Label({text: i18n.getText("IT_Status")}), 
                    new Text({id: "IT_Status_Dialog", text: `{JSONModel>IT_Status_Desc}`}),
                    
                    new Label({text: i18n.getText("IT_BoughtQuantity"), labelFor: "IT_BoughtQuantity_Dialog"}), 
                    new Input({id: Controller.createId("IT_BoughtQuantity_Dialog"), value: '{JSONModel>IT_BoughtQuantity}', type: "Number", enabled: false}),

                    new Label({text: i18n.getText("IT_DeliveredQuantity"), labelFor: "IT_DeliveredQuantity_Dialog"}), 
                    new Input({id: Controller.createId("IT_DeliveredQuantity_Dialog"), value: '{JSONModel>IT_DeliveredQuantity}', type: "Number", enabled: enabled}),

                    new Label({text: i18n.getText("IT_AvailableQuantity"), visible: "{= !!${JSONModel>IT_AvailableQuantity} }"}), 
                    new Text({id: "IT_AvailableQuantity_Dialog", text: `{JSONModel>IT_AvailableQuantity}`, visible: "{= !!${JSONModel>IT_AvailableQuantity} }"}),

                    new Label({text: i18n.getText("IT_DeliveredQuantity")}),
                    new Slider({enableTickmarks: true, inputsAsTooltips: true, showAdvancedTooltip: true, enabled: enabled, 
                        max: "{= Number(${JSONModel>IT_AvailableQuantity}) }", value: "{= Number(${JSONModel>IT_DeliveredQuantity}) }", width: "100%"
                        , liveChange: function(oEvent){
                            let value = oEvent.getParameter("value");
                            let oSource = oEvent.getSource();
                            let oContext = oSource.getBindingContext("JSONModel");
                            oContext.getModel().setProperty(oContext.getPath() + "/IT_DeliveredQuantity", value);
                        }}),
                    
                    // Material Info
                    new Title({text: i18n.getText("Dialog_SubHeader_General")}),
                    new Label({text: i18n.getText("IT_Category")}),
                    new Text({id: "IT_Category_Dialog", text: `{JSONModel>IT_Category}`}),

                    new Label({text: i18n.getText("IT_Family")}),
                    new Text({id: "IT_Family_Dialog", text: `{JSONModel>IT_Family}`}),

                    new Label({text: i18n.getText("IT_Brand")}),
                    new Text({id: "IT_Brand_Dialog", text: `{JSONModel>IT_Brand}`}),

                    new Label({text: i18n.getText("IT_Model")}),
                    new Text({id: "IT_Model_Dialog", text: `{JSONModel>IT_Model}`}),

                    new Label({text: i18n.getText("IT_Dimensions")}),
                    new Text({id: "IT_Dimensions_Dialog", text: `{JSONModel>IT_Dimensions}`}),

                    new Label({text: i18n.getText("IT_IndStandard"), labelFor: "IT_IndStandard_Dialog"}),
                    new Switch({id: "IT_IndStandard_Dialog", type:"AcceptReject", enabled: false, state: "{= ${JSONModel>IT_IndStandard} === 'X' }" }),

                    new Label({text: i18n.getText("IT_IndFixAsset"), labelFor: "IT_IndFixAsset_Dialog"}), 
                    new Switch({id: "IT_IndFixAsset_Dialog", type:"AcceptReject", enabled: false, state: "{= ${JSONModel>IT_IndFixAsset} === 'X' }" }),

                    new Label({text: i18n.getText("IT_Patrimonio")}),
                    new Text({id: "IT_Patrimonio_Dialog", text: `{JSONModel>IT_Patr}`}),

                    new Label({text: i18n.getText("IT_Asset"), labelFor: "IT_Asset_Dialog"}), 
                    new Switch({id: "IT_Asset_Dialog", type:"AcceptReject", enabled: false, state: "{= ${JSONModel>IT_Asset} === 'X' }" }),

                    new Label({text: i18n.getText("IT_IndSpecial")}), 
                    new Switch({id: "IT_IndSpecial_Dialog", type:"AcceptReject", enabled: false, state: "{= ${JSONModel>IT_IndSpecial} === 'X' }" }),

                    // Requirement Info
                    new Title({text: i18n.getText("Dialog_SubHeader_Requirement")}),
                    new Label({text: i18n.getText("IT_FFE_GM_FFE_DI")}), 
                    new Text({id: "IT_FFE_GM_FFE_DI_Dialog", text: `{JSONModel>IT_FFE_GM_FFE_DI}`}),

                    new Label({text: i18n.getText("IT_Division")}), 
                    new Text({id: "IT_Division_Dialog", text: `{JSONModel>IT_Division}`}),

                    new Label({text: i18n.getText("IT_Area")}), 
                    new Text({id: "IT_Area_Dialog", text: `{JSONModel>IT_Area}`}),

                    new Label({text: i18n.getText("IT_Location")}), 
                    new Text({id: "IT_Location_Dialog", text: `{JSONModel>IT_Location}`}),

                    new Label({text: i18n.getText("IT_Sublocation")}), 
                    new Text({id: "IT_SubLocation_Dialog", text: `{JSONModel>IT_SubLocation}`}),

                    new Label({text: i18n.getText("IT_Supplier")}), 
                    new Text({id: "IT_Supplier_Dialog", text: `{JSONModel>IT_Supplier}`}),

                    new Label({text: i18n.getText("IT_View")}), 
                    new Text({id: "IT_View_Dialog", text: `{JSONModel>IT_View}`})
                ]
            });
            SimpleForm.setModel(Controller.getView().getModel("JSONModel"), "JSONModel");
            SimpleForm.bindElement({
                path: sPath,
                model: "JSONModel"
            });
            return SimpleForm;
        },

        setErrorDialog: function(Controller, Message){
            let oDialog = new Dialog({
                type: DialogType.Message,
                title: "Error",
                state: ValueState.Error,
                content: new Text({ text: Message }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: "OK",
                    press: function () {
                        oDialog.close();
                    }
                }),
                afterClose: function(oEvent){
                    let dialog = oEvent.getSource();
                    dialog.destroy();
                }
            });
            oDialog.open();
        },

        setWarningDialog: function(Controller, Message) {
            let i18n = I18n.getTranslations(Controller);
            return new Promise((resolve) => {
                let oDialog = new Dialog({
                    type: DialogType.Message,
                    title: i18n.getText("Set_Dia_Warning"),
                    state: ValueState.Warning,
                    content: new Text({ text: Message }),
                    beginButton: new Button({
                        type: ButtonType.Emphasized,
                        text: i18n.getText("Set_Dia_Save_AnyWay"),
                        press: function () {
                            oDialog.close();
                            resolve(true);
                        }
                    }),
                    endButton: new Button({
                        text: i18n.getText("Set_Dia_Cancel"),
                        press: function () {
                            oDialog.close();
                            resolve(false);
                        }
                    }),
                    afterClose: function(oEvent){
                        oEvent.getSource().destroy();
                    }
                });
        
                oDialog.open();
            });
        },

        setSuccessDialog: function(Controller, Message){
            let i18n = I18n.getTranslations(Controller);
            let oDialog = new Dialog({
                type: DialogType.Message,
                title: i18n.getText("Set_Dia_Success"),
                state: ValueState.Success,
                content: new Text({ text: Message }),
                afterClose: function(oEvent){
                    let dialog = oEvent.getSource();
                    dialog.destroy();
                }
            });
            oDialog.open();
        }
    };
});