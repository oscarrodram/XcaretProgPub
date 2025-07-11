sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    return {

        getReceptionDate: function(InputDate){
            let datetime = InputDate.getDateValue();
            let year = datetime.getFullYear().toString();
            let month = datetime.getMonth().toString();
            if(month.length === 1) month = `0${month}`;
            let day = datetime.getDate().toString();
            if(day.length === 1) day = `0${day}`
            let hours = datetime.getHours().toString();
            if(hours.length === 1) hours = `0${hours}`;
            let minutes = datetime.getMinutes().toString();
            if(minutes.length === 1) minutes = `0${minutes}`;
            let seconds = datetime.getSeconds().toString();
            if(seconds.length === 1) seconds = `0${seconds}`;
            let miliseconds = datetime.getTime().toString().substring(0, 6);

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${miliseconds}`;
        },

        setReceptionDate: function(StringDate){
            let year = StringDate.substring(0,4);
            let month = StringDate.substring(5,7);
            let day = StringDate.substring(8,10);
            let hour = StringDate.substring(11,13);
            let minuts = StringDate.substring(14,16);
            let seconds = StringDate.substring(17,19);
            return new Date(year, month, day, hour, minuts, seconds);
        }
    };
});