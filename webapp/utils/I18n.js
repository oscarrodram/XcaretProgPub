sap.ui.define([], function () {
    "use strict";

    return {
        getTranslations: function(Controller){
            return Controller.getOwnerComponent().getModel("i18n").getResourceBundle();
        }
    };
});