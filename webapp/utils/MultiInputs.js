sap.ui.define([], function () {
    "use strict";

    return {
        setBehavior: function(MultiInput, Clear, Enable){
            MultiInput.setValueState("None");
            MultiInput.setValueStateText("");
            if(Clear === "setClear"){
                MultiInput.setValue("");
                MultiInput.removeAllTokens();
            }
            if(Enable === "setEnable"){
                MultiInput.setEnabled(true);
            }else{
                MultiInput.setEnabled(false);
            }
        },
    };
});