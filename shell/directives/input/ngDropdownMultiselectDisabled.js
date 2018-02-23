define(['app'], function (app) {
    app.directive('ngDropdownMultiselectDisabled', function () {
        return {
            restrict: 'A',
            controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
                var $btn;
                $btn = $element.find('button');
                return $scope.$watch($attrs.ngDropdownMultiselectDisabled, function (newVal) {
                    return $btn.attr('disabled', newVal);
                });
            }]
        }
    });
});