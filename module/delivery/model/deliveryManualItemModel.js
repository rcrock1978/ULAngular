
'use strict';

define([], function () {

    //var GetSectors = function (sectors) {
    //    var items = [];
    //    angular.forEach(sectors, function (sector) {
    //        this.push({ id: sector.CoveredSectorId, label: sector.CoveredSector });
    //    }, items);
    //    return items;
    //};

    //var GetDateString = function (date) {
    //    var d = new Date(date);
    //    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    //    var m = months[d.getMonth()];
    //    return d.getDate().toString() + " " + m + " " + d.getFullYear();
    //};
    
    //var defMaxDate = new Date("12/31/2099");
    //var defMinDate =  new Date("1/1/0001") ;

    var model = {
        deliveryManualItem: function (item,isEditMode) {
            return {
                DeliveryItemId: item ? item.DeliveryItemId : null,
                SourceInfo: item ? item.SourceInfo: null,
                DocumentType: item ? item.DocumentType : null,
                IssueDate: item ? item.IssueDate : null,
                Remarks: item ? item.Remarks : null
            }
        },

        SetDefault: function () {
            var self = this;
            return self.deliveryManualItem();
        },

        Set: function (item,isEditMode) {
            var self = this;
            return self.deliveryManualItem(item, isEditMode)
        }
    };

    return model;
});
