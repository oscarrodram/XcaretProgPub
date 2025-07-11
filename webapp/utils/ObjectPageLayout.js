sap.ui.define([], function () {
    "use strict";

    return {
        setBusy: function(controller, busy){
            let ObjectPageLayout = controller.byId("ObjectPageLayout");
            ObjectPageLayout.setBusy(busy);
        },
    };
});