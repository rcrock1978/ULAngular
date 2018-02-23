
'use strict';

define(['enums'], function (enums) {

    var GetSectors = function (sectors) {
        var items = [];
        angular.forEach(sectors, function (sector) {
            this.push({ id: sector.CoveredSectorId, label: sector.CoveredSector });
        }, items);
        return items;
    };

    var GetWireless = function (wireless) {
        var wire = [];
        angular.forEach(wireless, function (item) {
            if (item.WirelessTechnologyId > 0) {
                this.push({ id: item.WirelessTechnologyId, label: item.WirelessTechnologyName });
            }            
        }, wire);
        return wire;
    };

    var GetStandard = function (standards) {
        var standard = [];
        angular.forEach(standards, function (item) {
            if (item.StandardId > 0) {
                this.push({ id: item.StandardId, label: item.StandardName, sector: item.CoveredSectorId });
            }
        }, standard);
        return standard;
    };

    var GetDateString = function (date) {
        var d = new Date(date);
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var m = months[d.getMonth()];
        return d.getDate().toString() + " " + m + " " + d.getFullYear();
    };
    
    var defMaxDate = new Date("12/31/2099");
    var defMinDate =  new Date("1/1/0001") ;

    var model = {
        CertItem: function (item, mode) {
            return {
                CertificateItemId: item ? (mode == enums.Mode.Edit ? item.CertificateItemId : null) : null,
                SelectedSectors: item ? GetSectors(item.Sectors) : [],
                RegionId: item ? item.RegionItemId : null,
                RegionName: item ? item.RegionName : null,
                SelectedCountries: [],
                CertificateSchemaId: item ? item.CertificateSchemeId : null,
                CertificateOrganizationId: item ? item.CertificateOrganizationId : null,
                CertificateNumber: item ? (mode == enums.Mode.Edit ? item.CertificateNumber : null) : null,
                Status: item ? ((mode == enums.Mode.Renew) ? null : item.CertificateStatusTypeId) : null,
                Manufacturer: item ? item.Manufacturer : null,
                Applicant: item ? item.CustomerItemId : null,
                LicenseHolder: item ? item.LicenseHolder : null,
                Factory: item ? item.Factory : null,
                Model: item ? item.Model : null,
                BrandName: item ? item.BrandName : null,
                IssueDate: item ? ((mode == enums.Mode.Renew) ? null : item.IssueDate) : null,
                IssueDateString: item ? ((mode == enums.Mode.Renew) ? null : GetDateString(item.IssueDate)) : null,
                IssueDateMaxDate: item ? (item.IsExpirationDateApplicable ? item.ExpirationDate : defMaxDate ) : defMaxDate,
                ExpirationDate: item ? (item.IsExpirationDateApplicable ? ((mode == enums.Mode.Renew) ? null : item.ExpirationDate) : null) : null,
                ExpirationDateString: item ? ((mode == enums.Mode.Renew) ? null : GetDateString(item.ExpirationDate)) : null,
                ExpirationDateMinDAte : item ? item.IssueDate :  defMinDate,
                IsExpirationDateApplicable: item ? ((mode == enums.Mode.Renew) ? false : item.IsExpirationDateApplicable) : false,
                IsExpirationDateNotApplicable : item ? (item.IsExpirationDateApplicable  ? false : true) : false,
                AgentName: item ? item.AgentName : null,
                CertificateBusinessStatusType: item ? ((mode == enums.Mode.Renew) ? null : item.CertificateBusinessStatusType) : null,
                CertificateBusinessStatusTypeId: item ? ((mode == enums.Mode.Renew) ? null : item.CertificateBusinessStatusTypeId) : null,
                OrderNumber: item ? ((mode == enums.Mode.Renew) ? null : item.OrderNumber) : null,
                ProductTypeId: item ? item.ProductTypeId : null,
                ProducTypeName: item ? item.ProducTypeName : null,
                ProductSubTypeId: item ? item.ProductSubTypeId : null,
                ProductSubTypeName: item ? item.ProductSubTypeName : null,
                SelectedWireless: item ? GetWireless(item.Wireless) : [],
                SelectedStandards: item ? GetStandard(item.Standards) : [],
                POC: item ? item.PointOfCustomerName : null,
                POCId: item ? item.PointOfCustomerId : null,
                SubContractorItemId: item ? item.SubContractorItemId : null,
                SubContractorName: item ? item.SubContractorName : null,
                customer: [],
                CompanyName: item ? item.CompanyName : null,
                CompanyItemId: item ? item.CompanyItemId : null
            }
        },

        SetDefault: function () {
            var self = this;
            return self.CertItem();
        },

        Set: function (item, mode) {
            var self = this;
            return self.CertItem(item, mode)
        }
    };

    return model;
});
