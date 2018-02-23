
'use strict';

define([], function ($filter) {

    var GetSectors = function (sectors) {
        var items = [];
        angular.forEach(sectors, function (sector) {
            this.push({ id: sector.CoveredSectorId, label: sector.CoveredSector, value: true });
        }, items);
        return items;
    };

    var model = {
        UserItem: function (item,isEditMode) {
            return {
                UserPreferenceId: item ? (isEditMode ? item.UserPreferenceId : null) : null,
                SelectedSectors: item ? GetSectors(item.Sectors) : [],
                CultureTypeId: item ? item.CultureTypeId : 1,
                ModuleSectors: item ? item.ModuleSectors : [],
                ModuleId: item ? item.ModuleId : []
               // CoveredSectorId: item ? item.CoveredSectorId : ""
            }
        },

    SetDefault: function () {
        var self = this;
        return self.UserItem();
    },

    Set: function (item,isEditMode) {
        var self = this;
        return self.UserItem(item,isEditMode)
    }
};

return model;
});
