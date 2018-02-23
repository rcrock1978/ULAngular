define([
    'app'
], function (app) {
    app.directive("smiActiveTab", [function () {

        return {
            restrict: 'A',
            link: link
        };

        ////////////

        function link(scope, element, attrs) {
            if (attrs.smiActiveTab === scope.activeTab) {
                element.addClass('active');
            }

            //if (scope.isWorkflow === true) {
            //    element.addClass('not-active');
            //}
        }
    }]);
});
