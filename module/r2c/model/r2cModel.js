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

    var model = {
        R2C: function (item) {
            var self = this;
            return {
                R2CItemId: item.NewsItemId,
                ComplianceProgram: item.ComplianceProgram,
                ProductType: item.ProductType,
                FrequencyTechnology: item.FrequencyTechnology,
                DocumentType: item.DocumentType,
                ApplicationType: item.ApplicationType,
                SampleMode: item.SampleMode
            }
        },

        Set: function (data) {
            var response = [];
            var _self = this;
            angular.forEach(data, function (item) {
                this.push(_self.R2C(item));
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
