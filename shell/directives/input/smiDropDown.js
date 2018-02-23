define([
    'app',
    'globalUtility',
    'text!shell/templates/smiDropDown.tpl.html'
], function (app, globalUtility, template) {
    app.directive("smiDropDown", ['$parse', function ($parse) {

        return {
            restrict: 'EA',
            scope: {
                datasource: '=',
                searchable: '=',
                model: '=',
                onchange: '&',
            },
            controller: 'smiDropDownController',
            template: template
        };
    }]);
});
