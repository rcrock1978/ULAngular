

define(['app'], function (app) {
    app.directive('processOnEnter', function () {
        return function ($scope, $element, $attrs) {
            $element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    $scope.$apply(function () {
                        $scope.$eval($attrs.processOnEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });
});

