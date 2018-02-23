
'use strict';

define([], function () {

    var GetSectors = function (sectors) {
        var items = [];
        angular.forEach(sectors, function (sector) {
            this.push({ id: sector.CoveredSectorId, label: sector.CoveredSector });
        }, items);
        return items;
    };

    var GetDateString = function (date) {
        var d = new Date(date);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var m = months[d.getMonth()];
        return d.getDate().toString() + " " + m + " " + d.getFullYear();
    };

    var defMaxDate = new Date("12/31/2099");
    var defMinDate = new Date("1/1/0001");

    var model = {
        R2CItem: function (item, isEditMode) {
            return {
                R2CItemId: item ? item.ItemId : null,
                ComplianceProgram: item ? item.ComplianceProgram : [],
                ProductType: item ? item.ProductType : [],
                FrequencyTechnology: item ? item.FrequencyTechnology : [],
                DocumentType: item ? item.DocumentType : "",
                ApplicationType: item ? item.ApplicationType : "",
                SampleMode: item ? item.SampleMode : ""
            }
        },

        SetDefault: function () {
            var self = this;
            return self.R2CItem();
        },

        Set: function (item, isEditMode) {
            var self = this;
            return self.R2CItem(item, isEditMode)
        }
    };

    return model;
});
