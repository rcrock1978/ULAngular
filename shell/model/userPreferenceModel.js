
'use strict';

define([], function ($filter) {

    var model = {
        UserPreference: function (item) {
            return {
                UserPreferenceId: item.UserPreferenceId,
                CultureTypeId: item.CultureTypeId,
                CoveredSectorId: item.CoveredSectorId
            }
        },

        Set: function (data) {
            var response = [];
            var _self = this;
            angular.forEach(data, function (item) {
                this.push(_self.UserPreference(item));
            }, response);

            return response;
        }

    };

    return model;


});
