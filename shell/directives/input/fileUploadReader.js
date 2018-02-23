

define(['app'], function (app) {
    app.directive("fileread", [function () {
        return {
            scope: {
                fileread: "=",
                modified: "="
            },
            link: function (scope, element, attributes) {
                element.bind("change", function (changeEvent) {
                    scope.$apply(function () {
                        scope.fileread = changeEvent.target.files[0];
                        scope.modified = true;
                     });
                   
                    //var reader = new FileReader();
                    //reader.onload = function (loadEvent) {
                    //    scope.$apply(function () {
                    //       // scope.fileread.result = loadEvent.target.result;
                    //        scope.fileread = changeEvent.target.files[0]
                    //    });
                    //}
                    //reader.readAsDataURL(changeEvent.target.files[0]);
                });
            }
        }
    }]);
});

