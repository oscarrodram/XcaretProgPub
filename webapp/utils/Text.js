sap.ui.define([], function () {
    "use strict";

    return {
        setBehavior: function(Text, Clear){
            if(Clear === "setClear"){
                Text.setText("");
            }
        }
    };
});