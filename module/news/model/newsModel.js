'use strict';

define([], function () {

    var GetDateDisplayText = function (date) {
        var nDate = new Date(date);
        return (nDate.getMonth() + 1) + "/" + nDate.getDate() + "/" + nDate.getFullYear();
    };

    var GroupCountry = function (countries) {
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

    var GroupSector = function (sectors) {
        var sectorNames = "";
        var limit = sectors.length;
        var ctr = 0;
        angular.forEach(sectors, function (sector) {
            sectorNames += sector.CoveredSector;
            ctr += 1;
            if (ctr < limit) sectorNames += ",";
        });
        return sectorNames;
    };

    var GroupCompliance = function (compliancePrograms) {
        var complianceProgramName = "";
        var limit = compliancePrograms.length;
        var ctr = 0;
        angular.forEach(compliancePrograms, function (complianceProgram) {
            complianceProgramName += complianceProgram.CertificateProgramName;
            ctr += 1;
            if (ctr < limit) complianceProgramName += ",";
        });
        return complianceProgramName;
    };

    var model = {
        News: function (item) {
            var self = this;
            return {
                NewsId: item.NewsItemId,
                ParentNewsItemId : item.ParentNewsItemId,
                Title: item.NewsTitle,
                Summary: item.NewsSummary,
                Details: item.NewsDetail,
                ImageCaption: item.ImageCaption,
                Note: item.Note,
                SectorRegulated: item.Sector,
                SectorRegulatedName: GroupSector(item.Sector),
                Category: item.CategoryName,
                //NewsSource: item.NewsSourceId,
                Region: item.RegionId,
                RegionalEU: item.RegionalEUId,
                CountryName: GroupCountry(item.Country),
                Country: item.Country,
                ComplianceProgramName: GroupCompliance(item.ComplianceProgram),
                ComplianceProgram: item.ComplianceProgram,
                FrequencyTechnology: item.FrequencyTechnology,
                ProductType: item.ProductType,
                Remarks: item.Remarks,
                //DocumentType: item.DocumentType,
                EffectiveDate: item.EffectiveDate,
                EffectiveDateDisplayText: GetDateDisplayText(item.EffectiveDate),
                ExpirationDate: item.ExpirationDate,
                ExpirationDateDisplayText: item.IsExpirationDateApplicable ? GetDateDisplayText(item.ExpirationDate) : "n/a",
                Posted: item.PostedDate,
                PostedDateString: GetDateDisplayText(item.PostedDate),
                PostedBy: item.PostedBy,
                Source: item.NewsSourceId,
                CultureTypeId: item.CultureTypeId,
                IsChecked: false,
                ElementId: "tbl" + item.NewsItemId,
                ItemStatusId: item.ItemStatusId
            }
        },

        Set: function (data) {
            var response = [];
            var _self = this;
            angular.forEach(data, function (item) {
                this.push(_self.News(item));
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
