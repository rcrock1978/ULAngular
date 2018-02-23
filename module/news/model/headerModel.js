
'use strict';

define([], function () {
    var model = {
        Header: function (title, field, width, cellTemplate) {
            return {
                Title: title,
                Field: field,
                Width: width,
                CellTemplate: cellTemplate,
                IsCellTemplate: cellTemplate ? true : false
            }
        },

        Set: function (title, field, width, isCellTemplate) {
            var self = this;
            return self.Header(title, field, width, isCellTemplate);
        }
    };

    return model;
});