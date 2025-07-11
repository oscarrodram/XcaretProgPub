sap.ui.define([], function () {
    "use strict";

    return {
        setBehavior: function(Button, Enable){
            if(Enable === "setEnable"){
                Button.setEnabled(true);
            }else{
                Button.setEnabled(false);
            }
            //debugger;
        }
    };
});