define([
    'app',
    'globalUtility',
    'text!shell/templates/smiModalTabs.tpl.html'
], function (app, globalUtility, template) {
    app.directive("smiModalTabs", ['$parse', function ($parse) {

        return {
            restrict: 'E',
            scope: {
                datasource: '=',
                selected: '=',
                ontabchange: '&'
            },
            controller: 'smiModalTabController',
            template: template
        };
    }]);
});
