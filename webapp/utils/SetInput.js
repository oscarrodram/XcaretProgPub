sap.ui.define([], function () {
    "use strict";

    return {
        setBehavior: function(Input, Clear, Enable){
            Input.setValueState("None");
            Input.setValueStateText("");
            if(Clear === "setClear"){
                Input.setValue("");
            }
            if(Enable === "setEnable"){
                Input.setEnabled(true);
            }else{
                Input.setEnabled(false);
            }
            //debugger;
        },

        setError: function(Input, Message){
            Input.setValueState("Error");
            Input.setValueStateText(Message);
            Input.focus();
        },

        setInformation: function(Input, Message){
            Input.setValueState("Information");
            Input.setValueStateText(Message);
            Input.focus();
        }
    };
});