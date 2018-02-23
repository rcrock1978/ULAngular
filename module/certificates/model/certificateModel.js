'use strict';

define(['globalUtility'], function (globalUtility) {
    var SetCountryNames = function (countries) {
        var countryNames = "";
        var limit = countries.length;
        var ctr = 0;
        angular.forEach(countries, function (country) {
            countryNames += country.CountryName;
            ctr += 1;
            if (ctr < limit) countryNames += ",";
        });
        return countryNames;
    };

    var SetSectorNames = function (sectors) {
        var sectorNames = "";
        var limit = sectors.length;
        var ctr = 0;
        angular.forEach(sectors, function (sector) {
            sectorNames += sector.CoveredSector;
            ctr += 1;
            if (ctr < limit) sectorNames += ",";
        });
        return sectorNames;
    }

    var SetRegionNames = function (regions) {
        var regionNames = "";
        var limit = regions.length;
        var ctr = 0;
        angular.forEach(regions, function (region) {
            regionNames += region.RegionName;
            ctr += 1;
            if (ctr < limit) regionNames += ",";
        });
        return regionNames;
    }

    var SetWirelessNames = function (wireless) {
        var wirelessNames = "";
        var limit = wireless.length;
        var ctr = 0;
        angular.forEach(wireless, function (item) {
            wirelessNames += item.WirelessTechnologyName;
            ctr += 1;
            if (ctr < limit) wirelessNames += ",";
        });
        return wirelessNames;
    }

    var SetStandardnames = function (standards, standardDates) {
        var standardNames = "";
        var effdate = "";
        var obsdate = "";
        for (var idx=0; idx < standards.length; idx++)
        {
            effdate = (standardDates[idx].EffectiveDate == "0001-01-01T00:00:00") ? "n/a" : globalUtility.DateFormatDisplay(standardDates[idx].EffectiveDate);
            obsdate = (standardDates[idx].ObsoleteDate == "0001-01-01T00:00:00") ? "n/a" : globalUtility.DateFormatDisplay(standardDates[idx].ObsoleteDate);

            standardNames += standards[idx].StandardName + " (" + effdate + " - "
                                + obsdate + ")" + (idx + 1 < standards.length ? ", " : "");
        }
        return standardNames;
    }
    
    var model = {
        Certificates: function (item) {
            var self = this;
            return {
                CertificateItemId: item.CertificateItemId,
                Sectors: item.Sectors,
                SectorNames : SetSectorNames(item.Sectors),
                Countries: item.Countries,
                CountryName : SetCountryNames(item.Countries),
                CertificateSchemeId: item.CertificateSchemeId ? item.CertificateSchemeId : null,
                CertificateSchemaName: item.CertificateSchemaName,
                CertificateOrganizationId: item.CertificateOrganizationId,
                CertificateOrganizationName: item.CertificateOrganizationName,
                CertificateNumber: item.CertificateNumber,
                CustomerItemId: item.CustomerItemId,
                CompanyName: item.CompanyName,
                Manufacturer: item.Manufacturer,
                Model: item.Model,
                BrandName: item.BrandName,
                Factory: item.Factory,
                AgentName: item.AgentName,
                IssueDate: item.IssueDate,
                IssueDateDisplayText: globalUtility.DateFormatDisplay(item.IssueDate),
                ExpirationDate: item.ExpirationDate,
                ExpirationDateDisplayText: item.IsExpirationDateApplicable ? globalUtility.DateFormatDisplay(item.ExpirationDate) : "n/a",
                IsExpirationDateApplicable: item.IsExpirationDateApplicable,
                Standards: item.Standards,
                //StandardNames: item.Standards.map(function (value, index) { return value.StandardName;}).join(" ,"),
                StandardNames: SetStandardnames(item.Standards, item.StandardDates),
                CertificateStatusType: item.CertificateStatusType,
                CertificateStatusTypeId: item.CertificateStatusTypeId,
                ExpiringInNoDays: item.IsExpirationDateApplicable ? item.ExpiringInNoDays : '',
                RegionItemId: item.RegionItemId,
                RegionNames: item.RegionName,//SetRegionNames(item.RegionItemId),
                LicenseHolder: item.LicenseHolder,
                OrderNumber: item.OrderNumber,
                CertificateBusinessStatusType: item.CertificateBusinessStatusType,
                CertificateBusinessStatusTypeId: item.CertificateBusinessStatusTypeId,
                ProductTypeId: item.ProductTypeId,
                ProductTypeName: item.ProductTypeName,
                ProductSubTypeId: item.ProductSubTypeId,
                ProductSubTypeName: item.ProductSubTypeName,
                Wireless: item.Wireless,
                WirelessNames: SetWirelessNames(item.Wireless),
                IsChecked: false,
                POC: item.PointOfCustomerName,
                SubContractorItemId: item.SubContractorItemId,
                SubContractorName: item.SubContractorName,
                CompanyItemId: item.CompanyItemId
            }
        },
      
        Set: function (data) {
            var response = [];
            var _self = this;
            angular.forEach(data, function (item) {
                this.push(_self.Certificates(item));
            }, response);

            return response;
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
