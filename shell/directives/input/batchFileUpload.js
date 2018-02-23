


define([
    'app',
    'globalUtility'
], function (app, globalUtility) {
    app.directive("batchFileUpload", ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attrs) {
                var model = $parse($attrs.batchFileUpload);
                var isMultiple = $attrs.multiple;
                var modelSetter = model.assign;


                var bytesToSize = function(bytes) {
                    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                    if (bytes == 0) return '0 Byte';
                    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
                };

                var copyItem = function (item) {
                    var newItem = new File([item], item.name);
                    return newItem;
                }

                $element.bind('change', function () {
                    var values = [];
                    angular.forEach($element[0].files, function (item) {
                        var value = {
                            name: item.name,
                            size: item.size,
                            displaySize:bytesToSize(item.size),
                            url: URL.createObjectURL(item), 
                            //file: JSON.parse(JSON.stringify(item)),
                            file: item,
                            pristine: false,
                            fileTypeIcon: globalUtility.GetFileTypeIcon(item.name)
                            //setFileTypeIcon(item.name.replace(/^.*\./, ''))
                        };
                        values.push(value);
                    });
                    $scope.$apply(function () {
                        if (isMultiple) {
                            modelSetter($scope, values);
                        } else {
                            modelSetter($scope, values[0]);
                        }
                    });
                });
            }
        };
    }]);
});



