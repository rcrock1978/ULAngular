'use strict';

define([], function () {
    var SetSectorNames = function (sectors) {
        var sectorNames = "";
        var limit = sectors.length;
        var ctr = 0;
        angular.forEach(sectors, function (sector) {
            sectorNames += sector.CoveredSector;
            ctr += 1;
            if (ctr < limit) sectorNames += ", ";
        });
        return sectorNames;
    }
    var SetCountryNames = function (countries) {
        var countryNames = "";
        var limit = countries.length;
        var ctr = 0;
        angular.forEach(countries, function (country) {
            countryNames += country.CountryName;
            ctr += 1;
            if (ctr < limit) countryNames += ", ";
        });
        return countryNames;
    }
    var SetCountryTradeGroupNames = function (countrytrade) {
        var countryTrades = "";
        var limit = countrytrade.length;
        var ctr = 0;
        angular.forEach(countrytrade, function (country) {
            countryTrades += country.Name;
            ctr += 1;
            if (ctr < limit) countryTrades += ", ";
        });
        return countryTrades;
    }
    var SetComplianceProgramNames = function (compliances) {
        var complianceNames = "";
        var limit = compliances.length;
        var ctr = 0;
        angular.forEach(compliances, function (compliance) {
            complianceNames += compliance.CertificateProgramName;
            ctr += 1;
            if (ctr < limit) complianceNames += ", ";
        });
        return complianceNames;
    }

    //Ids
    var SetSectorIds = function (sectors) {
        var sectorIds = "";
        var limit = sectors.length;
        var ctr = 0;
        angular.forEach(sectors, function (sector) {
            sectorIds += sector.CoveredSectorId;
            ctr += 1;
            if (ctr < limit) sectorIds += ",";
        });
        return sectorIds;
    }
    var SetCountryIds = function (countries) {
        var countryIds = "";
        var limit = countries.length;
        var ctr = 0;
        angular.forEach(countries, function (country) {
            countryIds += country.CountryItemId;
            ctr += 1;
            if (ctr < limit) countryIds += ",";
        });
        return countryIds;
    }
    var SetCountryTradeGroupIds = function (countrytrade) {
        var countryTradesIds = "";
        var limit = countrytrade.length;
        var ctr = 0;
        angular.forEach(countrytrade, function (country) {
            countryTradesIds += country.CountryTradeGroupId;
            ctr += 1;
            if (ctr < limit) countryTradesIds += ",";
        });
        return countryTradesIds;
    }
    var SetComplianceProgramIds = function (compliances) {
        var complianceIds = "";
        var limit = compliances.length;
        var ctr = 0;
        angular.forEach(compliances, function (compliance) {
            complianceIds += compliance.CertificateProgramId;
            ctr += 1;
            if (ctr < limit) complianceIds += ",";
        });
        return complianceIds;
    }

    var GetDateString = function (date) {
        var d = new Date(date);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var m = months[d.getMonth()];
        return d.getDate().toString() + " " + m + " " + d.getFullYear();
    };

    var model = {
        NewsWorkflow: function (item) {
            var self = this;
            return {
                NewsWorkflowId: item.WorkflowId,
                //NewsItemId : item.NewsItemId,
                //WorkflowCountryIds: SetCountryIds(item.Countries),
                WorkflowCountryName: item.CountryName,
                //WorkflowCountryTradeGroupIds: SetCountryTradeGroupIds(item.RegionalEconomicUnion),
                WorkflowCountryTradeGroupNames: item.CountryTradeGroupName,
                //WorkflowCountryTradeGroupName: item.CountryTradeGroupName,
                //WorkflowCoveredSectorIds: SetSectorIds(item.Sector),
                WorkflowCoveredSectorName: item.CoveredSectorName,
                //WorkflowComplianceProgramIds: SetComplianceProgramIds(item.ComplianceProgram),
                //WorkflowCertificateSchemeName: item.CertificateSchemeName,
                //WorkflowSectorNames: SetSectorNames(item.Sector),
                //WorkflowCountryNames: SetCountryNames(item.Countries),
                WorkflowRegionName: item.RegionName,
                WorkflowComplianceProgramNames: item.ComplianceProgramName,
                WorkflowModuleId: item.ModuleId,
                WorkflowDetails: item.Details,
                WorkflowSource: item.WorkflowSource,
                WorkflowLink: item.Link,
                WorkflowStatusId: item.WorkflowStatusId,
                WorkflowStatus: item.WorkflowStatus,
                //WorkflowItemActionId: item.ItemActionId,
                //WorkflowItemAction: item.ItemAction,
                //WorkflowLastItemStatusId: item.LastItemStatusId,
                WorkflowDateSubmitted: GetDateString(item.DateSubmitted),
                //WorkflowCreatedBy: item.CreatedBy,
                //WorkflowLastModifiedDate: GetDateString(item.LastModifiedDate),
                //WorkflowLastModifiedBy: item.LastModifiedBy,
                WorkflowAttachmentName: item.AttachmentName,
                WorkflowChangeRequest: item.ChangeRequest,
                WorkflowParentNewsItemId: item.ParentNewsItemId,
                WorkflowCultureTypeId: item.CultureTypeId,
                WorkflowOriginal: item.OriginalInformation,
                WorkflowUpdated: item.UpdatedInformation
            }
        },

        Set: function (data) {
            var response = [];
            var _self = this;
            angular.forEach(data, function (item) {
                this.push(_self.NewsWorkflow(item));
            }, response);

            return response;
        },

        SetDefault: function () {
            var _self = this;
            var defaultData = {
                WorkflowId:null,
                Sector:"", 
                Countries:"", 
                RegionalEconomicUnion:"", 
                ComplianceProgram:"", 
                ModuleId: "4",
                Details:"", 
                Link:null, 
                WorkflowStatusId:"", 
                WorkflowStatus:"", 
                WorkflowItemActionId:"", 
                WorkflowItemAction:"", 
                WorkflowLastItemStatusId:"", 
                WorkflowDateSubmitted:"", 
                WorkflowCreatedBy:"", 
                WorkflowLastModifiedDate: "",
                WorkflowLastModifiedBy: ""
            };
            return _self.NewsWorkflow(defaultData);
        }
        //SetHeaders: function (displayText,isSortable) {
        //    return {
        //        DisplayText: '',
        //        IsSortable: isSortable
        //    }
        //}
    };

    return model;
});
