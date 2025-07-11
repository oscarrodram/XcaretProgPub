sap.ui.define([
    "com/xcaret/receptionpublic/utils/MultiInputs",
    "com/xcaret/receptionpublic/utils/Text",
    "com/xcaret/receptionpublic/utils/Button",
	"com/xcaret/receptionpublic/utils/SetInput"
], function (MultiInputs,
	Text,
	Button,
	SetInput) {
    "use strict";

    return {
        clear: function(Controller){
            let oMultiProject = Controller.byId("InputProject");
            MultiInputs.setBehavior(oMultiProject, "setClear", "setEnable");

            let oMultiLocation = Controller.byId("InputLocation");
            MultiInputs.setBehavior(oMultiLocation, "setClear", "noEnable");

            let oTextRoomKey = Controller.byId("TextClaveHabitacion");
            Text.setBehavior(oTextRoomKey, "setClear");

            let oMultiReceptorManager = Controller.byId("MultiInReceptorManager");
            MultiInputs.setBehavior(oMultiReceptorManager, "setClear", "setEnable");

            let oInputUnitQty = Controller.byId("idUnitQuantityInput");
            SetInput.setBehavior(oInputUnitQty, "setClear", "setEnable");

            let oTable = Controller.byId("ScheduleLineItemTable");
            oTable.setMode("None");

            let oReferenceToButtonStyleSheet = Controller.byId("ReferenceToButtonStyleSheet");
            Button.setBehavior(oReferenceToButtonStyleSheet, "noEnable");

            let oStyleSheetBadge = Controller.byId("idStyleSheetBadgeCustomData");
            oStyleSheetBadge.setValue("");
			oStyleSheetBadge.setVisible(false);

            let oReferenceToButtonContract = Controller.byId("ReferenceToButtonContract");
            Button.setBehavior(oReferenceToButtonContract, "noEnable");

            let oContractBadge = Controller.byId("idContractBadgeCustomData");
            oContractBadge.setValue("");
			oContractBadge.setVisible(false);

            let oReferenceToButtonRequirement = Controller.byId("ReferenceToButtonRequirement");
            Button.setBehavior(oReferenceToButtonRequirement, "noEnable");

            let oRequirementBadge = Controller.byId("idRequirementBadgeCustomData");
            oRequirementBadge.setValue("");
			oRequirementBadge.setVisible(false);

            let oCancelItemButton = Controller.byId("CancelItemButton");
            Button.setBehavior(oCancelItemButton, "noEnable");

            let oOpenItemButton = Controller.byId("OpenItemButton");
            Button.setBehavior(oOpenItemButton, "noEnable");
        }
    };
});