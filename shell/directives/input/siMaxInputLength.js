define(['app'], function (app) {
    app.directive('siMaxInputLength', function () {
        return {
            restrict: 'A',
            //scope: {
            //    maxLenght : ''
            //},
            link: function (scope, element, attr) {
                var limit = parseInt(attr.siMaxInputLength);

                element.on('keypress', function (event) {
                    if (element.val().length === limit) event.preventDefault();
                });
            }
        }

        //return function ($scope, $element, $attrs) {
        //    $element.bind("keydown keypress", function (event) {
        //        if (event.which === 13) {
        //            $scope.$apply(function () {
        //                $scope.$eval($attrs.processOnEnter);
        //            });

        //            event.preventDefault();
        //        }
        //    });
        //};
    });
});
