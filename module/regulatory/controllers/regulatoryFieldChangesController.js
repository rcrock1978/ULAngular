define([
	'app'
], function (app) {

    app.register.controller('regulatoryFieldChangesController', ['$scope', '$uibModalInstance', 'baseService', 'items',
	    function ($scope, $uibModalInstance, baseService, items) {
	        //"global" variables	    	        

	        //viewmodel/bindable members
	        $scope.closeDialog = closeDialog;
	        $scope.isFileModified = false;
	        $scope.isLoading = false;        
	        $scope.modalTitle = '';
	        $scope.row = {};
	        $scope.showErrors = false;

	        init();

	        //function implementations
	        ////////////// 

	        function closeDialog(result) {
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

	        function init() {
	            $scope.modalTitle = items.title;

	            $scope.row = items.item;
	        }

	        $scope.$on('$destroy', function () {

	            var events = [''];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
