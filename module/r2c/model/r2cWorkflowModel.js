
'use strict';

define([], function () {

    var GetDateString = function (date) {
        var d = new Date(date);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var m = months[d.getMonth()];
        return d.getDate().toString() + " " + m + " " + d.getFullYear();
    };
    var model = {
      
        Item: function (item) {
            return {
                ComplianceProgramId: item.ComplianceProgramId,
                ComplianceProgram: item.ComplianceProgramName,
                RegulatoryCategory: item.SectorsRegulated,
                Country: item.Country.CountryName,
                DateSubmitted: GetDateString(item.DateSubmitted),
                ItemId: item.ItemId,
                Links: item.Links,
                Source:item.Source,
                OriginalInfo: item.OriginalInformation,
                UpdatedInfo: item.UpdatedInformation,
                Region: item.Region.RegionName,
                WorkflowStatus: item.WorkflowStatus.WorkflowStatusName,
                RequestType: item.RequestType,
                SectorRegulated : item.SectorsRegulated,
                SectorRegulatedId: item.CoveredSectorId,
                GeoItemId: item.GeoItemId,
                CountryTradeGroup : item.CountryTradeGroup,
                CountryTradeGroupId: item.CountryTradeGroupId,
                ReadyToCertifyParentId: item.ReadyToCertifyParentId,
                Requestor: item.Requestor,
                WorkFlowId: item.WorkFlowId
            };
        },

        Set: function (data) {
            var result = [];
            var _self = this;
            angular.forEach(data, function (item) {
                this.push(_self.Item(item));
            }, result);

            return result;
        }
    };


    return model;
});