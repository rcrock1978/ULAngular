define([
	'app',
	'authService',
	'globalUtility',
	'routeResolver',
	'enums'
], function (app, authService, globalUtility, routeResolver, enums) {

	app.register.controller('deliveryChangeRequestDetailsController', ['$scope', '$location', '$filter', '$sce', '$q', '$localStorage', '$cookies', '$cookieStore', '$sessionStorage', '$timeout', 'homeService', 'baseService', 'dialogService', 'bsAlertService', 'moduleService', 'deliveryService', 'items',
		function ($scope, $location, $filter, $sce, $q, $localStorage, $cookies, $cookieStore, $sessionStorage, $timeout, homeService, baseService, dialogService, bsAlertService, moduleService, deliveryService, items) {

			$scope.CloseDialog                 = CloseDialog;
			$scope.Download                    = Download;
			$scope.title                       = "APPROVE DELIVERY MANUAL";
			$scope.Save                        = Submit;
			$scope.primaryFile                 = { name: '' };
			$scope.primaryFiles                = [];
			$scope.relatedFiles                = [];
			$scope.newRelatedFiles             = [];
			$scope.deliveryItemId              = items.WorkflowItemId;
			$scope.parentDeliveryId            = items.ParentDeliveryId;
			$scope.status                      = '';
			$scope.showErrors                  = false;
			$scope.comment                     = '';
			$scope.canApprove                  = globalUtility.ContentAdmin || globalUtility.Coordinator;
			$scope.updatePrimaryFileLabel      = "UPDATE";
			$scope.updateRelatedFileLabel      = "UPDATE";
			$scope.updatePrimaryFile           = false;
			$scope.updateRelatedFile           = false;
			$scope.toggleUpdatePrimaryFile     = ToggleUpdatePrimaryFile;
			$scope.toggleUpdateRelatedFile     = ToggleUpdateRelatedFile;
			$scope.uploadPromptInvalidFilename = globalUtility.UploadPromptInvalidFilename;
			$scope.uploadPromptInvalidFilesize = globalUtility.UploadPromptInvalidFilesize;
			var success                        = [];
			var errors                         = [];
			$scope.itemId                      = "";

			init();

			function init() {
			    baseService.IsBusy(true);

				var onSuccess = function (response) {
					if (response.IsSuccess) {

						var relatedFiles = [];
						angular.forEach(response.DeliveryDocumentPaths.RelatedFiles, function (doc) {
							this.push({ name: doc, fileTypeIcon: globalUtility.GetFileTypeIcon(doc), pristine: true })
						}, relatedFiles)

						if (relatedFiles.length > 0) {
							hasPristineRF = true;
							$scope.relatedFiles = angular.copy(relatedFiles);
						}

						$scope.primaryFiles = angular.copy(response.DeliveryDocumentPaths.PrimaryFiles);
					    baseService.IsBusy(false);
					}

				};

				var param = items.ItemFiles;

				deliveryService.getSourceDocuments(param, onSuccess);
			}

			function DeleteItemFile(itemId, isPrimaryFile) {
			    var params = {
			        SourceItemId: itemId,
			        PrimaryFile: isPrimaryFile
			    };

			    homeService.deleteItemFile(params, deleteItemFile_Completed);
			}


			function deleteItemFile_Completed(response) {
			}

			function ToggleUpdatePrimaryFile() {
			    $scope.updatePrimaryFile = !$scope.updatePrimaryFile;
			    if ($scope.updatePrimaryFile) {
			        $scope.updatePrimaryFileLabel = "CANCEL";
			    }
			    else {
			        $scope.primaryFile = undefined;
			        $scope.updatePrimaryFileLabel = "UPDATE";
			    }
			}

			function ToggleUpdateRelatedFile() {
			    $scope.updateRelatedFile = !$scope.updateRelatedFile;
			    if ($scope.updateRelatedFile) {
			        $scope.updateRelatedFileLabel = "CANCEL";
			    }
			    else {
			        $scope.newRelatedFiles = [];
			        $scope.updateRelatedFileLabel = "UPDATE";
			    }
			}

			function Download(item, workflowItemId, subfolder) {
				baseService.Publish('delivery:downloadDelivery',
					{
						FileName: item,
						DeliveryItemId: $scope.deliveryItemId,
						SubFolder: subfolder
					});
			};

			var validation = function (hasError) {
			    var hasError = hasError | ((($scope.status == '') && $scope.canApprove) |
                                           (($scope.status == 'Reject' && $scope.comment == '') && $scope.canApprove) |
                                           InvalidPrimaryFile() | InvalidRelatedFile());
			    return hasError;
			}

			var InvalidPrimaryFile = function () {

			    if ($scope.primaryFile != undefined) {
			        if ($scope.primaryFile.name != "") {

			            $scope.invalidPrimaryFileName = [];
			            if (InvalidFilename($scope.primaryFile.name))
			                $scope.invalidPrimaryFileName.push($scope.primaryFile);

			            $scope.invalidPrimaryFilesize = [];
			            if (InvalidFilesize($scope.primaryFile.size))
			                $scope.invalidPrimaryFilesize.push($scope.primaryFile);
			            

			            return $scope.invalidPrimaryFileName.length != 0 || $scope.invalidPrimaryFilesize.length != 0;
			        }
			    }
			    return false;
			}

			var InvalidRelatedFile = function () {
			    if ($scope.newRelatedFiles.length > 0) {

			        $scope.invalidRelatedFileName = $filter('filter')($scope.newRelatedFiles, function (value, index) { return InvalidFilename(value.name); });
			        $scope.invalidRelatedFilesize = $filter('filter')($scope.newRelatedFiles, function (value, index) { return InvalidFilesize(value.size); });

			        return $scope.invalidRelatedFileName.length != 0 || $scope.invalidRelatedFilesize.length != 0;
			    }
			    return false;
			}

			var InvalidFilename = function (filename) {
			    filename = angular.lowercase(filename);
			    var regex = new RegExp("^([\\w\\s()-\\.]+)+\\.(?!(" + globalUtility.UploadExcludeExtension.join("$|") + "$" + "))[\\w\\s()]+$|^([\\w\\s()-]+)$");
			    return !(regex.test(filename));
			}

			var InvalidFilesize = function (filesize) {
			    if (filesize == 0) {
			        return (filesize == 0 | filesize == undefined) | filesize > globalUtility.UploadSize;
			    }
			    else {
			        return (filesize == undefined ? 0 : filesize) > globalUtility.UploadSize;
			        //return (filesize == 0 | filesize == undefined) | filesize > globalUtility.UploadSize;
			    }

			}

			function Submit(hasError) {
			    //$scope.showErrors = (($scope.status == '') && $scope.canApprove) || (($scope.status == 'Reject' && $scope.comment == '') && $scope.canApprove);
			    $scope.showErrors = validation(hasError);

			    if ($scope.showErrors)
			    {
			        $scope.uploadPromptInvalidPrimaryFilename = $scope.uploadPromptInvalidFilename + ' [' +
                                                                    ($scope.invalidPrimaryFileName.map(function (value, index) {
			                                                        return value.name;
			                                                        })).join(" ,") + ']';
			        $scope.uploadPromptInvalidPrimaryFilesize = $scope.uploadPromptInvalidFilesize + ' [' +
                                                                    ($scope.invalidPrimaryFilesize.map(function (value, index) {
                                                                        return value.name;
                                                                    })).join(" ,") + ']';

			        $scope.uploadPromptInvalidRelatedFilename = $scope.uploadPromptInvalidFilename + ' [' +
                                                                    ($scope.invalidRelatedFileName.map(function (value, index) {
                                                                        return value.name;
                                                                    })).join(" ,") + ']';
			        $scope.uploadPromptInvalidRelatedFilesize = $scope.uploadPromptInvalidFilesize + ' [' +
                                                                    ($scope.invalidRelatedFilesize.map(function (value, index) {
                                                                        return value.name;
                                                                    })).join(" ,") + ']';
			        return;
			    }
				else {
				    baseService.IsBusy(true);

					var params = {
						DeliveryItemId: null,
						ComplianceProgramId: items.ComplianceProgramId,
						FileName: $scope.primaryFiles[0], //to store old filename calling raymund's sp
						CreatedBy: $scope.mode != enums.Mode.Edit ? globalUtility.CurrentUser : null,
						ModifiedBy: globalUtility.CurrentUser,
						ItemStatusId: null,
						ParentDeliveryId: null,
						Remarks: null
					};

					var paramsEmail = {
						Status: null,
						Scope: null,
						Category: [],
						Region: [],
						Country: [],
						Compliance: [],
						Original: [],
						Updated: [],
						Source: [],
						Link: [],
						Remarks: null,
						Recipient: null
					};

					var param = {
						deliveryId: $scope.deliveryItemId
					};


					var onSuccessWorkflowDetails = function (response) {
						if (response.Success) {
							paramsEmail.Status = response.Data.Status;
							paramsEmail.Scope = response.Data.Scope;
							response.Data.Category.forEach(function (item, index) {
								paramsEmail.Category.push(item);
							});
							response.Data.Region.forEach(function (item, index) {
								paramsEmail.Region.push(item);
							});
							response.Data.Country.forEach(function (item, index) {
								paramsEmail.Country.push(item);
							});
							response.Data.Compliance.forEach(function (item, index) {
								paramsEmail.Compliance.push(item);
							});
							response.Data.Original.forEach(function (item, index) {
								paramsEmail.Original.push(item);
							});
							response.Data.Updated.forEach(function (item, index) {
								paramsEmail.Updated.push(item);
							});
							$scope.relatedFiles.forEach(function (item, index) {
								paramsEmail.Updated.push(item.name);
							});
							response.Data.Source.forEach(function (item, index) {
								paramsEmail.Source.push(item);
							});
							response.Data.Link.forEach(function (item, index) {
								paramsEmail.Link.push(item);
							});
							paramsEmail.Link      = response.Data.Link;
							paramsEmail.Remarks   = response.Data.Remarks;
							paramsEmail.Recipient = response.Data.Recipient;

							if ($scope.parentDeliveryId != '00000000-0000-0000-0000-000000000000') {

								if ($scope.status == 'Approve') {

									params.DeliveryItemId   = $scope.deliveryItemId;
									params.ItemStatusId     = enums.WorkflowStatus.Approved.Id;
									params.ParentDeliveryId = $scope.parentDeliveryId;

									var onSuccessUpdateParent = function (response) {
										if (response.IsSuccess) {
											var onSuccessEmailContent = function (response) {
												if (response.Success) {
													paramsEmail.Status = response.Data.Status;
													paramsEmail.Remarks = response.Data.Remarks;

													var onSuccessEmail = function (response) {
													    if (response.IsSuccess) {
													        SaveFiles($scope.parentDeliveryId);
														}
														else {
															dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
															baseService.IsBusy(false);
													    }
													}
												};

												homeService.sendEmail(paramsEmail, onSuccessEmail)
											};
											deliveryService.getWorkFlowDelivery(param, onSuccessEmailContent);

                                            
										}
									};

									var onSuccessUpdateChild = function (response) {
										if (response.IsSuccess) {
											params.DeliveryItemId   = $scope.parentDeliveryId;
											params.ItemStatusId     = enums.WorkflowStatus.Approved.Id;
											params.ParentDeliveryId = null;

											deliveryService.saveDeliveryManual(params, onSuccessUpdateParent);
										}
										else {
											baseService.IsBusy(false);
											dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
										}
									};


									deliveryService.saveDeliveryManual(params, onSuccessUpdateChild);

								}
								else if ($scope.status == 'Reject') {

									params.DeliveryItemId   = $scope.deliveryItemId;
									params.ItemStatusId     = enums.WorkflowStatus.Rejected.Id;
									params.ParentDeliveryId = $scope.parentDeliveryId;
									params.Remarks          = $scope.comment;

									var onSuccessReject = function (response) {
										if (response.IsSuccess) {
											var onSuccessEmailContent = function (response) {
												if (response.Success) {
													paramsEmail.Status = response.Data.Status;
													paramsEmail.Remarks = response.Data.Remarks;

													var onSuccessEmail = function (response) {
													    if (response.IsSuccess) {
															dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
															CloseDialog();
														}
													    else {
															dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
													    }
													    baseService.IsBusy(false);
													}
												};

												homeService.sendEmail(paramsEmail, onSuccessEmail)
											}
											deliveryService.getWorkFlowDelivery(param, onSuccessEmailContent);
										};
									};
									deliveryService.saveDeliveryManual(params, onSuccessReject);
								}


							} else {

								params.DeliveryItemId   = $scope.deliveryItemId;
								params.ItemStatusId     = ($scope.status == 'Approve') ? enums.WorkflowStatus.Approved.Id : enums.WorkflowStatus.Rejected.Id;
								params.ParentDeliveryId = null;
								params.Remarks          = $scope.comment;

								var onSuccess = function (response) {
									if (response.IsSuccess) {
										var onSuccessEmailContent = function (response) {
											if (response.Success) {
												paramsEmail.Status = response.Data.Status;
												paramsEmail.Remarks = response.Data.Remarks;

												var onSuccessEmail = function (response) {
												    if (response.IsSuccess) {
														
												        if ($scope.status == 'Approve') {
												            SaveFiles($scope.deliveryItemId);
												        }
													}
													else {
														dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
    													baseService.IsBusy(false);
                                                    }
												}
											};

											homeService.sendEmail(paramsEmail, onSuccessEmail)
										}
										deliveryService.getWorkFlowDelivery(param, onSuccessEmailContent);
									}
									else {
										baseService.IsBusy(false);
										dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
									}

								};
								deliveryService.saveDeliveryManual(params, onSuccess);

							}

						}
					};
					deliveryService.getWorkFlowDelivery(param, onSuccessWorkflowDetails);

					baseService.Publish('shell:refreshRefiners', true);
				}
			}

			function SaveFiles(itemId) {
			    if ($scope.primaryFile != undefined) {
			        if ($scope.primaryFile.name != "") {
			            var onSuccess = function (response) {
			                if (!response.IsSuccess)
			                    dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
			                else
			                {
			                    if ($scope.deliveryItemId != '00000000-0000-0000-0000-000000000000') {
			                        DeleteItemFile($scope.deliveryItemId, true);
			                    }
			                    SaveRelatedFiles(itemId);
			                }
			            };

			            //save primary file
			            var reader = new FileReader();
			            reader.onloadend = function () {
			                if (reader.readyState == 2) {
			                    var arrayString = reader.result;
			                    var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
			                    var param = {
			                        DeliveryItemId: itemId,
			                        File: base64String.match(/.{1,255}/g),
			                        Filename: $scope.primaryFile.name,
			                        SubFolderName: 'PrimaryFiles',
			                        HasPristine: false
			                    };

			                    deliveryService.saveDocument(param, onSuccess);
			                }

			            };

			            reader.readAsArrayBuffer($scope.primaryFile);
			        }
			        else {
			            SaveRelatedFiles(itemId);
			        }
			    }
			    else {
			        SaveRelatedFiles(itemId);
			    }
			    
			}

			function SaveRelatedFiles(itemId) {
			    var files      = [];
			    var fileParams = [];

			    if ($scope.newRelatedFiles.length > 0) {
			        angular.forEach($scope.relatedFiles, function (item) {

			            angular.forEach($scope.newRelatedFiles, function (newItem) {
			                if (item.name == newItem.name) {
			                    files.push(newItem);
			                }
			            });
			        });

			        angular.forEach(files, function (file) {
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
			                        HasPristine: false
			                    };

			                    fileParams.push(param);
			                    if (fileParams.length == files.length) {
			                        deliveryService.saveDocuments(fileParams, onSaveRelatedFilesCompleted);
			                    }
			                }

			            };
			            reader.readAsArrayBuffer(file.file);

			        });
			    }
			    else {
			        SaveCompleted();
			    }
			    
			}

			function onSaveRelatedFilesCompleted(response) {
			    if (response.IsSuccess) {
			        if ($scope.deliveryItemId != '00000000-0000-0000-0000-000000000000') {
			            DeleteItemFile($scope.deliveryItemId, false);
			        }
			        SaveItemFiles($scope.deliveryItemId);
			        SaveCompleted();
			    }
			    else {
			        baseService.IsBusy(false);
			        dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
			    }
			}

			function SaveItemFiles(itemId) {
			    var items = [];
			    var params = {};
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

			function saveItemFiles_Completed(response) {
			    var res = response;
			}

			function SaveCompleted() {
			    baseService.IsBusy(false);
			    dialogService.Dialog.Alert("Delivery Manual successfully saved/updated.", enums.MessageType.Success, enums.IsLevel2Popup);
			    CloseDialog();

			}


			function CloseDialog() {
				dialogService.CloseAll();
			}


			$scope.$on('$destroy', function () {


			});
		}]);

});