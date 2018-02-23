
define([
	'app',
	'globalUtility',
    'enums',
    'module/delivery/model/deliveryManualItemModel'
], function (app, globalUtility, enums, deliveryManualItem) {

    app.register.controller('addDeliveryManualController', ['$scope', '$uibModalInstance', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'bsAlertService', 'deliveryService', 'homeService', 'items',
	    function ($scope, $uibModalInstance, $http, $rootScope, $filter, baseService, dialogService, bsAlertService, deliveryService, homeService, items) {

	        var originalData            = [];
	        var success                 = [];
	        var errors                  = [];
	        var hasPristineRF           = false;//has Original Related Files
	        $scope.applications         = [];
	        $scope.fileCert             = "";
	        $scope.isLoading            = false;
	        $scope.showErrors           = false;
	        $scope.mode                 = items.Mode;
	        $scope.modalTitle           = "Attach Delivery Manual";
	        $scope.relatedFiles         = [];
	        $scope.primaryFileNames     = '';
	        $scope.relatedFileNames     = [];
	        $scope.primaryFile          = { name: '' };
	        $scope.isPFModified         = false;
	        $scope.sourceInfo           = "";
	        $scope.issueDate            = "";
	        $scope.remarks              = "";
	        $scope.selectedDocumentType = "";
	        $scope.documentTypes        = [];
	        $scope.deliveryManualItem   = deliveryManualItem.SetDefault();
	        $scope.deliveryItem         = items.Data;
	        $scope.buttonLabel          = "";
	        $scope.deliveryItemId       = "";
	        $scope.itemId               = "";
	        $scope.itemFiles            = [];

	        $scope.init = function () {
	            if (items.Mode != enums.Mode.Add) {
	                $scope.mode = (items.Mode == "addManual") ? "addManual" : enums.Mode.Edit;
	                $scope.modalTitle = (items.Mode == "addManual") ? "Attach Delivery Manual" : "Edit Delivery Manual";
	            }

	            if (globalUtility.Contributor) {
	                $scope.buttonLabel = "Submit";
	            }
	            else if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                $scope.buttonLabel = "Publish";
	            }
	            else {
	                $scope.buttonLabel = "Submit";
	            }

	            initializeItems();
	        };


	        //$scope.CloseDialog = function () {
	        //    $uibModalInstance.close();
	        //    baseService.ShowOverlay(false);
	        //};

	        $scope.CloseDialog = function (result) {
	            //dialogService.CloseAll("Perform Close");
	            if (result === undefined) {
	                $uibModalInstance.dismiss('cancel');
	            }
	            else if (result === true) {
	                $uibModalInstance.close(result);
	            }
	            else {
	                if (result.ExceptionMessage) {
	                    $uibModalInstance.dismiss(result.ExceptionMessage);
	                    //dialogService.CloseAll(result.ExceptionMessage);
	                }
	            }
	            $uibModalInstance.close();
	            baseService.ShowOverlay(false);
	        };


	        var initializeItems = function () {

	            $scope.documentTypes = angular.copy(items.LookUps.DocumentType);

	            if ($scope.mode == enums.Mode.Edit) {
	                originalData = angular.copy(items.Data);
	                baseService.IsBusy(true);
	                loadDeliveryManualDetail(items.Data);
	            }

	        };

	        var onGetDeliveryDetailByItemId_Completed = function (response) {
	            $scope.deliveryItem = items.Data;

	            var onSuccess = function (response) {
	                if (response.IsSuccess) {
	                    $scope.primaryFile = { name: response.DeliveryDocumentPaths.PrimaryFiles[0] };
	                    $scope.isPFModified = false;
	                    var relatedFiles = [];
	                    angular.forEach(response.DeliveryDocumentPaths.RelatedFiles, function (doc) {
	                        this.push({ name: doc, fileTypeIcon: globalUtility.GetFileTypeIcon(doc), pristine: true })
	                    }, relatedFiles)

	                    if (relatedFiles.length > 0) {
	                        hasPristineRF = true;
	                        $scope.relatedFiles = angular.copy(relatedFiles);
	                    }
	                }

	                baseService.IsBusy(false);
	            };
	            var param = {
	                DeliveryItemId: $scope.deliveryManualItem.DeliveryItemId
	            };
	            deliveryService.getSourceDocuments(param, onSuccess);
	        };

	        var loadDeliveryManualDetail = function (data) {

	            //var deliveryId = (data.ChildDeliveryId == "00000000-0000-0000-0000-000000000000") ? data.DeliveryItemId : data.ChildDeliveryId;
	            var deliveryId = data.DeliveryItemId;
	            var param;

	            $scope.deliveryItemId = deliveryId;
	         
	            var onSuccess = function (response) {
	                if (response.IsSuccess) {
	                    $scope.primaryFile = { name: response.DeliveryDocumentPaths.PrimaryFiles[0] };
	                    $scope.isPFModified = false;
	                    var relatedFiles = [];
	                    angular.forEach(response.DeliveryDocumentPaths.RelatedFiles, function (doc) {
	                        this.push({ name: doc, fileTypeIcon: globalUtility.GetFileTypeIcon(doc), pristine: true })
	                    }, relatedFiles)

	                    if (relatedFiles.length > 0) {
	                        hasPristineRF = true;
	                        $scope.relatedFiles = angular.copy(relatedFiles);
	                    }

	                    $scope.primaryFileNames = $scope.primaryFile.name;
	                    angular.forEach($scope.relatedFiles, function (file) {
	                        $scope.relatedFileNames.push(file.name);
	                    });
	                }
	                baseService.IsBusy(false);
	            };
	            
	            if (data.ChildDeliveryId == "00000000-0000-0000-0000-000000000000" && data.ItemFiles.length == 0) {
	                param = {
	                    DeliveryItemId: data.DeliveryItemId
	                };
	                deliveryService.getSourceDocumentsById(param, onSuccess);
	            }
	            else {
	                param            = data.ItemFiles;
	                $scope.itemFiles = data.ItemFiles;
	                deliveryService.getSourceDocuments(param, onSuccess);
	            }
	        };


	        $scope.getItemByValue = function (value, list) {
	            angular.forEach(list, function (val, key) {
	                if (val == value) {
	                    $scope.selected = key;
	                }
	            });
	        };

	      

	        $scope.Save = function () {
	          //  $scope.SaveDocument();
	            //var hasError = globalUtility.IsNullOrWhiteSpace($scope.primaryFile.length) ?  true : $scope.primaryFile.name.length == 0;
	            $scope.showErrors = globalUtility.IsNullOrWhiteSpace($scope.primaryFile.name) ? true  : ($scope.primaryFile.name.length == 0);
	            if ($scope.showErrors) return;
	            baseService.IsBusy(true);
	            // SavePrimaryFile();
	            SaveDeliveryManual();//save tagging to DB

	        };

	        $scope.SaveDocument = function () {
	            baseService.IsBusy(true);
	           // SavePrimaryFile();
	            SaveDeliveryManual();//save tagging to DB
	        };

	        $scope.onSelect = function (e) {
	            var message = $.map(e.files, function (file) { return file.name; }).join(", ");
	            console.log("event :: select (" + message + ")");
	        }

	        function SaveItemFiles(itemId) {
	            var items = [];
	            var params = {};

	            

	            if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                if ($scope.primaryFile.name != '') {
	                    params = {
	                        ItemFileId: null,
	                        Filename: $scope.primaryFile.name,
	                        SourceItemId: itemId,
	                        PrimaryFile: 'TRUE'
	                    }
	                    items.push(params);
	                }
	                if ($scope.relatedFiles.length > 0) {
	                    angular.forEach($scope.relatedFiles, function (file) {
	                        params = {
	                            ItemFileId: null,
	                            Filename: file.name,
	                            SourceItemId: itemId,
	                            PrimaryFile: 'FALSE'
	                        }
	                        items.push(params);
	                    });
	                }
	                homeService.saveItemFiles(items, saveItemFiles_Completed);
	            }
	            else if (globalUtility.Contributor) {

	                if ($scope.mode == enums.Mode.Edit) {
	                    if ($scope.itemFiles.length == 0) {
	                        //SAVE PARENT FILES
	                        if ($scope.primaryFileNames != '') {
	                            params = {
	                                ItemFileId: null,
	                                Filename: $scope.primaryFileNames,
	                                SourceItemId: $scope.deliveryItemId,
	                                PrimaryFile: 'TRUE'
	                            }
	                            items.push(params);
	                        }
	                        if ($scope.relatedFileNames.length > 0) {
	                            angular.forEach($scope.relatedFileNames, function (file) {
	                                params = {
	                                    ItemFileId: null,
	                                    Filename: file,
	                                    SourceItemId: $scope.deliveryItemId,
	                                    PrimaryFile: 'FALSE'
	                                }
	                                items.push(params);
	                            });
	                        }

	                        homeService.saveItemFiles(items, saveItemFiles_Completed);
	                    }

	                    items = [];
	                    params = {};

	                    if ($scope.primaryFile.name != '') {
	                        params = {
	                            ItemFileId: null,
	                            Filename: $scope.primaryFile.name,
	                            SourceItemId: itemId,
	                            PrimaryFile: 'TRUE'
	                        }
	                        items.push(params);
	                    }
	                    if ($scope.relatedFiles.length > 0) {
	                        angular.forEach($scope.relatedFiles, function (file) {
	                            params = {
	                                ItemFileId: null,
	                                Filename: file.name,
	                                SourceItemId: itemId,
	                                PrimaryFile: 'FALSE'
	                            }
	                            items.push(params);
	                        });
	                    }

	                    homeService.saveItemFiles(items, saveItemFiles_Completed);
	                }
	                else {
	                    if ($scope.itemFiles.length == 0) {
	                        //SAVE PARENT FILES
	                        if ($scope.primaryFile.name != '') {
	                            params = {
	                                ItemFileId: null,
	                                Filename: $scope.primaryFile.name,
	                                SourceItemId: itemId,
	                                PrimaryFile: 'TRUE'
	                            }
	                            items.push(params);
	                        }
	                        if ($scope.relatedFiles.length > 0) {
	                            angular.forEach($scope.relatedFiles, function (file) {
	                                params = {
	                                    ItemFileId: null,
	                                    Filename: file.name,
	                                    SourceItemId: itemId,
	                                    PrimaryFile: 'FALSE'
	                                }
	                                items.push(params);
	                            });
	                        }

	                        homeService.saveItemFiles(items, saveItemFiles_Completed);
	                    }
	                }
	                
	            }

	        }

	        function saveItemFiles_Completed(response) {
	            var res = response;
	        }

	        var SaveDeliveryManual = function () {

	            var params = {
	                DeliveryItemId: null,
	                ComplianceProgramId: items.Data.ComplianceProgramId,
	                FileName: $scope.primaryFile.name,
	                CreatedBy: globalUtility.CurrentUser,
	                ModifiedBy: globalUtility.CurrentUser,
	                ItemStatusId: 1,
	                ParentDeliveryId: null
	            }

	            var onSuccess = function (response) {

	                $scope.itemId = response.ReponseItemId;

	                if (response.IsSuccess)
	                {
	                    if ($scope.mode == "edit") {
	                        if (globalUtility.Contributor) {
	                            if (HasModifiedFiles()) {
	                                UploadModifiedFiles($scope.deliveryItemId);
	                            }
	                        }
	                        else if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                            SavePrimaryFile($scope.itemId);
	                        }
	                    }
	                    else {
	                        SavePrimaryFile($scope.itemId);
	                    }

	                    baseService.IsBusy(false);
	                }
	                else {
	                    baseService.IsBusy(false);
	                    dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
	                }
	            };

	            function HasModifiedFiles() {

	                var hasModified  = false;
	                var rfModified   = $filter('filter')($scope.relatedFiles, function (value, index) { return value.pristine == false; })
	                var isRFModified = rfModified.length > 0;

	                if ($scope.isPFModified || isRFModified) hasModified = true;

	                return hasModified;
	            }

	            function UploadModifiedFiles(itemId) {
	                var hasModified = false;
	                var rfModified = $filter('filter')($scope.relatedFiles, function (value, index) { return value.pristine == false; })
	                var isRFModified = rfModified.length > 0;

	                if ($scope.isPFModified) SavePrimaryDocument(itemId, isRFModified);
	                if (isRFModified) SaveRelatedDocuments(itemId);
	            }

	            if ($scope.mode == "addManual") {
	                if (globalUtility.Contributor) {
	                    params.DeliveryItemId = null,
                        params.ItemStatusId = enums.WorkflowStatus.ApproverReview.Id,
                        params.ParentDeliveryId = null
	                }
	                else if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                    params.DeliveryItemId = null,
                        params.ItemStatusId = enums.WorkflowStatus.Approved.Id,
                        params.ParentDeliveryId = null
	                }
	            }
	            else if ($scope.mode == "edit") {
	                if (globalUtility.Contributor) {
	                    params.DeliveryItemId = null,
                        params.ItemStatusId = enums.WorkflowStatus.ApproverReview.Id,
                        params.ParentDeliveryId = items.Data.DeliveryItemId
	                }
	                else if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                    params.DeliveryItemId = items.Data.DeliveryItemId,
                        params.ItemStatusId = enums.WorkflowStatus.Approved.Id,
                        params.ParentDeliveryId = null
	                }
	            }
	            
	            deliveryService.saveDeliveryManual(params, onSuccess);
	        };

	        function DeleteItemFile(itemId, isPrimaryFile) {
	            var params = {
	                SourceItemId: itemId,
	                PrimaryFile: isPrimaryFile
	            };

	            homeService.deleteItemFile(params, deleteItemFile_Completed);
	        }

	        function deleteItemFile_Completed(response) {
	        }

	        //-PRIVATE METHODS
	        var SavePrimaryFile = function (itemId) {
	            var onSuccess = function (response) {
	                if (!response.IsSuccess) errors.push("Saving primary file failed.");
	                else
	                {
	                    success.push("Delivery Manual successfully saved.");
	                    DeleteItemFile(itemId, true);
	                }
	                SaveRelatedFiles(itemId);
	            };

	            if ($scope.isPFModified) {
	                var reader = new FileReader();
	                reader.onloadend = function () {
	                    if (reader.readyState == 2) {
	                        var arrayString = reader.result;
	                        var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                        var param = {
	                            DeliveryItemId: itemId,
	                            File: base64String.match(/.{1,255}/g),
	                            //FileArray: longInt8View,
	                            Filename: $scope.primaryFile.name,
	                            SubFolderName: 'PrimaryFiles',
	                            ApplicationId: globalUtility.AppId,
	                            HasPristine: false
	                        };

	                        deliveryService.saveDocument(param, onSuccess);
	                    }

	                };
	                reader.readAsArrayBuffer($scope.primaryFile);

	            } else {
	                DeleteItemFile(itemId, true);
	                SaveRelatedFiles(itemId);
	            }

	        };

	        var SaveRelatedFiles = function (itemId) {
	            var relatedFiles = [];
	            if ($scope.relatedFiles.length > 0) {

	                var pristine = $filter('filter')($scope.relatedFiles, function (value, index) { return value.pristine == true; })
	                var hasPristine = (pristine.length > 0);
	                angular.forEach($scope.relatedFiles, function (file) {
	                    if (file.pristine) {

	                        var param = {
	                            DeliveryItemId: itemId,
	                            File: "" ,
	                            Filename: file.name,
	                            SubFolderName: 'RelatedFiles',
	                            HasPristine: hasPristine
	                        };
	                        relatedFiles.push(param);
	                        if (relatedFiles.length == $scope.relatedFiles.length) {
	                            deliveryService.saveDocuments(relatedFiles, onSaveRelatedFilesCompleted);
	                        }
	                    } else {
	                        var reader = new FileReader();
	                        reader.onloadend = function () {
	                            if (reader.readyState == 2) {

	                                var arrayString = reader.result;
	                                var base64String = globalUtility.ArrayBufferToBase64String(arrayString);

	                                var param = {
	                                    DeliveryItemId: itemId,
	                                    File: base64String.match(/.{1,100}/g),
	                                    Filename: file.name,
	                                    SubFolderName: 'RelatedFiles',
	                                    HasPristine: hasPristine
	                                };
	                                relatedFiles.push(param);
	                                if (relatedFiles.length == $scope.relatedFiles.length) {
	                                    deliveryService.saveDocuments(relatedFiles, onSaveRelatedFilesCompleted);
	                                }
	                            }

	                        };
	                        reader.readAsArrayBuffer(file.file);
	                    }

	                });

	            }
	            else {
	                if (hasPristineRF) {
	                    var param = {
	                        DeliveryItemId: itemId,
	                        subfolderName: "RelatedFiles"
	                    };
	                    deliveryService.deleteDocuments(param, onSaveRelatedFilesCompleted);

	                } else {
	                    success.push("Delivery Manual successfully saved.");
	                    onSaveRelatedFilesCompleted({ IsSuccess: true });
	                }
	            }
	        };

	        var SavePrimaryDocument = function (itemId, isRFModified) {

	            var onSuccess = function (response) {
	                if (!response.IsSuccess) errors.push("Saving primary file failed.");
	                else {
	                    success.push("Delivery Manual successfully saved.");
	                }
	                if (!isRFModified) {
	                    SaveItemFiles($scope.itemId);
	                }
	                saveCompleted();
	            }

	            var reader = new FileReader();

	            reader.onloadend = function () {
	                if (reader.readyState == 2) {
	                    var arrayString = reader.result;
	                    var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                    var param = {
	                        DeliveryItemId: itemId,
	                        File: base64String.match(/.{1,255}/g),
	                        //FileArray: longInt8View,
	                        Filename: $scope.primaryFile.name,
	                        SubFolderName: 'PrimaryFiles',
	                        ApplicationId: globalUtility.AppId,
	                        HasPristine: false
	                    };

	                    deliveryService.saveDocument(param, onSuccess);
	                }

	            };

	            reader.readAsArrayBuffer($scope.primaryFile);
	        }

	        var SaveRelatedDocuments = function (itemId) {
	            var relatedFiles = [];

	            if ($scope.relatedFiles.length > 0) {

	                var pristine = $filter('filter')($scope.relatedFiles, function (value, index) { return value.pristine == true; })
	                var hasPristine = (pristine.length > 0);
	                angular.forEach($scope.relatedFiles, function (file) {
	                    
	                    var reader = new FileReader();
	                    reader.onloadend = function () {
	                        if (reader.readyState == 2) {

	                            var arrayString = reader.result;
	                            var base64String = globalUtility.ArrayBufferToBase64String(arrayString);

	                            var param = {
	                                DeliveryItemId: itemId,
	                                File: base64String.match(/.{1,100}/g),
	                                Filename: file.name,
	                                SubFolderName: 'RelatedFiles',
	                                HasPristine: hasPristine
	                            };
	                            relatedFiles.push(param);
	                            if (relatedFiles.length == $scope.relatedFiles.length) {
	                                deliveryService.saveDocuments(relatedFiles, onSaveRelatedDocumentsCompleted);
	                            }
	                        }

	                    };
	                    reader.readAsArrayBuffer(file.file);

	                });
	            }
	        }

	        var onSaveRelatedDocumentsCompleted = function (response) {
	            if (!response.IsSuccess) errors.push("Saving related files failed.");
	            else {
	                success.push("Related files successfully saved.");
	                SaveItemFiles($scope.itemId);
	            }
	            saveCompleted();
	        };

	        var onSaveRelatedFilesCompleted = function (response) {
	            if (!response.IsSuccess) errors.push("Saving related files failed.");
	            else
	            {
	                success.push("Related files successfully saved.");
	                DeleteItemFile($scope.itemId, false);
	                SaveItemFiles($scope.itemId);
	            } 
	            saveCompleted();
	        };

	        var saveCompleted = function () {
	            baseService.Publish("delivery:addDeliveryManual", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	            baseService.IsBusy(false);
	            $scope.CloseDialog();
	        };

	        //END -PRIVATE METHODS



	        $scope.init();

	        $scope.$on('$destroy', function () {

	            var events = [''];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
