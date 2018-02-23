define([
	'app',
	'globalUtility',
    'enums',
    'module/delivery/model/deliveryManualItemModel'
], function (app, globalUtility, enums, deliveryManualItem) {

    app.register.controller('regulatoryAddEditFileController', ['$scope', '$uibModalInstance', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'bsAlertService', 'regulatoryService', 'items',
	    function ($scope, $uibModalInstance, $http, $rootScope, $filter, baseService, dialogService, bsAlertService, regulatoryService, items) {
	        //"global" variables	    	        

	        //viewmodel/bindable members
	        $scope.closeDialog = closeDialog;
	        $scope.isFileModified = false;
	        $scope.isLoading = false;
	        $scope.selectedFile = '';
	        $scope.modalTitle = '';
	        $scope.saveFile = saveFile;
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
	                    data: items.data,
	                    fileName: $scope.selectedFile.name
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
	        }

	        function saveFile() {
	            if ($scope.selectedFile.name === undefined || $scope.selectedFile.name === '') {
	                $scope.showErrors = true;
	            }
                else{
	                var reader = new FileReader();
	                reader.onloadend = function () {
	                    if (reader.readyState == 2) {
	                        var arrayString = reader.result;
	                        var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                        var param = {
	                            ComplianceProgramId: items.data.ComplianceProgramId,
	                            File: base64String.match(/.{1,255}/g),
	                            //FileArray: longInt8View,
	                            Filename: $scope.selectedFile.name,
	                            SubFolderName: items.subFolder,
	                            ApplicationId: globalUtility.AppId,
	                            HasPristine: false
	                        };

	                        regulatoryService.saveDocument(param, onSuccess);
	                    }

	                };

	                reader.readAsArrayBuffer($scope.selectedFile);
	            }

	            ////////////// 

	            function onSuccess(response) {
	                if (!response.IsSuccess) {
	                    dialogService.Dialog.Alert("Saving file failed.", enums.MessageType.Error);
	                }//errors.push("Saving primary file failed.");
	                else {
	                    dialogService.Dialog.Alert("File saved/updated!", enums.MessageType.Success);
	                    closeDialog(true);
	                }
	            };
	        };

	        $scope.$on('$destroy', function () {

	            var events = [''];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
