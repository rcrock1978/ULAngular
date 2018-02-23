define([
    'app',
    'globalUtility',
    'text!shell/templates/fileUploader.tpl.html'
], function (app, globalUtility,template) {
    app.directive("smiFileUpload", ['$parse', function ($parse) {

        return {
            restrict: 'EA',
            scope: {
                datasource: '='
            },
            controller: 'fileUploaderController',
            template: template
        };
    }]);
});
