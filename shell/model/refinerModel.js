'use strict';

define([], function () {

    var model = {
        Item: function (type, id, value, parent, checked) {
            return {
                Type: type,
                Id: id,
                Value: value,
                Parent: parent,
                Checked: checked ? checked : false,
                IsDateRange : false
            }
        },

        SetDateRange : function(fromType,toType,parent){
            return {
                IsDateRange: true,
                Parent: parent,
                Items: [
                    {
                        Type: fromType,
                        ValueString: "",
                        Value: "",
                        MaxDate: new Date("12/31/2099")
                    },
                    {
                        Type: toType,
                        ValueString: "",
                        Value: "",
                        MinDate: new Date("1/1/0001")

                    }
                ]
            };

                
        },
        Set: function (category, items,isDateRange, isOpen) {
            var response = {
                Category: category,
                Items: items,                
                IsOpen: isOpen !== undefined ? isOpen : true,
                Total: isDateRange ? null : items.length,
                ItemsPerPage: isDateRange ? null : 5,
                CurrentPage: isDateRange ? null : 1,
                NextVisibility: isDateRange ? null : (items.length > 5 ? true : false),
                PrevVisibility: isDateRange ? null : false,
                IsDateRange: isDateRange ? true : false

            };
            return response;
        }
    };

    return model;
});
