define([
    'app',
    'globalUtility',
    'text!shell/templates/smiAddEvidence.tpl.html'
], function (app, globalUtility, template) {
    app.directive("smiAddEvidence", ['$parse', function ($parse) {

        return {
            restrict: 'E',                      
            template: template
        };
    }]);
});