
define([
	'app'
], function (app) {

    app.register.controller('newsFieldChangesController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'newsService', 'items', '$uibModalInstance',
	    function ($scope, $http, $rootScope, $filter, baseService, dialogService, newsService, items, $uibModalInstance) {

	        $scope.isFileModified = false;
	        $scope.isLoading = false;
	        $scope.modalTitle = '';
	        $scope.row = {};
	        $scope.showErrors = false;

	        $scope.closeDialog = function (result) {
	            //dialogService.CloseAll("Perform Close");
	            if (result === undefined) {
	                $uibModalInstance.dismiss('cancel');
	            }
	            else if (result === true) {
	                var returnVal = {
	                    //data: items.data,
	                    //fileName: $scope.selectedFile.name
	                };

	                $uibModalInstance.close(returnVal);
	            }
	            else {
	                if (result.ExceptionMessage) {
	                    $uibModalInstance.dismiss(result.ExceptionMessage);
	                }
	            }
	            $uibModalInstance.dismiss();
	            baseService.ShowOverlay(false);
	        };

	        $scope.init = function () {
	            $scope.modalTitle = items.title;

	            $scope.row = items.item;
	        }

	        $scope.init();

	        $scope.$on('$destroy', function () {

	            var events = [''];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
