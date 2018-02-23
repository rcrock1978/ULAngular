
define([
	'app',
	'globalUtility',
	'enums',
	'shell/model/refinerModel',
	'module/r2c/model/r2cItemModel',
	'routeResolver'
], function (app, globalUtility, enums, refinerModel, r2cItemModel, routeResolver) {

	app.register.controller('r2cModalController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'r2cService', 'homeService', 'items',
		function ($scope, $http, $rootScope, $filter, baseService, dialogService, r2cService, homeService, items) {

			$scope.mode = items.Mode;

			$scope.isOpen = true;

			$scope.multiselectSettings = {
				scrollableHeight: '200px',
				scrollable: true
			};

			var GetTitle = function () {
				if (items.Mode == enums.Mode.Add) return "ADD R2C ITEM";
				if (items.Mode == enums.Mode.Edit) return "EDIT R2C ITEM";
				if (items.Mode == enums.Mode.ViewWF) return "Workflow Review";
			};

			$scope.isAdminRole = globalUtility.Coordinator || globalUtility.ContentAdmin;


			var errors = [];
			var success = [];
			$scope.selectedRowId = null;
			$scope.attachFiles = [];
			$scope.attachFile = "";
			$scope.showCommentBox = false;
			$scope.isApproved = true;
			$scope.isAFModified = false;
			var hasPristineRF = false;
			$scope.complienceProgramName = "";
			$scope.readOnlyForm = false;
			$scope.showSave = true;
			$scope.approverComment = "";
			$scope.submitText = 'Submit';

			$scope.selectedSampleMode = '';
			$scope.selectedDocumentType = '';
			$scope.selectedApplicationType = '';
			$scope.selectedComplianceProgram = [];
			$scope.selectedFrequencyTechnology = [];
			$scope.selectedProductType = [];

			$scope.sampleRemarksFreqTech = [];

			$scope.r2cItem = r2cItemModel.SetDefault();

			$scope.tabs = ["Documents", "Samples"];
			$scope.selectedTab = $scope.tabs[1];
			$scope.modalTitle = GetTitle();
			var complienceProgram = [];
			$scope.compliancePrograms = [];

			$scope.sampleModeHeaders = [];
			$scope.documentHeaders = [];
			$scope.sampleRemarksHeaders = [];
			$scope.commonRemarksHeaders = [];
			var applicationTypes = [];
			var sampleModes = [];

			$scope.samples = [];
			$scope.documentSample = [];
			$scope.sampleRemarks = [];
			$scope.commonRemarks = [];


			var origDocumentSample = [];
			var originalSamples = [];
			var originalSampleRemarks = [];
			var originalCommonRemarks = [];

			if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
				$scope.canDelete = true;
				$scope.canReviewWF = true;
				if (items.Data.WorkflowStatus == enums.WorkflowStatus.Rejected.Description) $scope.canReviewWF = false;
                $scope.submitText = 'Publish';
			};


			var sampleModel = {
				Set: function (model, remarksTypeId) {
					return {
						ItemId: model ? model.ItemId : null,
						FreqTech: model ? model.FrequencyTechnologyId : null,
						SampleMode: model ? model.ReadyToCertifySampleModeTypeId : null,
						NumberOfUnitsRequired: model ? model.NumberOfUnitsRequired : null,
						ApplicationType: model ? model.ApplicationTypeId : null,
						Remarks: model ? model.Remarks : null,
						RemarkTypeId: model ? model.RemarkTypeId : remarksTypeId ? remarksTypeId : null,
						ItemStatusId: model ? model.ItemStatusId : null,
						ParentReadyToCertifyId: model ? model.ParentReadyToCertifyId : null,
						IsSelected: false
					}
				},
				SetCollection: function (collection) {
					var items = [];
					var self = this;
					angular.forEach(collection, function (item) {
						this.push(self.Set(item));
					}, items);
					return items;
				}
				//JJ
			};

			var documentModel = {
				SetMultiSelectItem: function (items) {
					var retItems = [];
					angular.forEach(items, function (item) {
						this.push({ id: parseInt(item) });
					}, retItems);
					return retItems;
				},
				Set: function (model) {

					var self = this;
					return {
						ItemId: model ? model.ItemId : null,
						DocumentName: model ? model.DocumentName : '',
						attachFile: model ? model.attachFile : '',
						Remarks: model ? model.Remarks : '',
						NumberOfCopies: model ? model.NumberOfCopies : '',
						FreqTech: model ? self.SetMultiSelectItem(model.FreqTechIds) : [],
						ApplicationType: model ? model.ApplicationTypeId : '',
						DocumentType: model ? model.DocumentTypeId : '',
						IsAFModified: model ? model.IsAFModified : '',
						ProductType: model ? self.SetMultiSelectItem(model.ProductTypeIds) : [],
						IsPrestine: true,
						id: model ? model.ItemId : Math.random(),
						ItemStatusId: model ? model.ItemStatusId : null,
						ParentReadyToCertifyId: model ? model.ParentReadyToCertifyId : null,
						IsSelected: false
					}
				},
				SetCollection: function (collection) {
					var items = [];
					var self = this;
					angular.forEach(collection, function (item) {
						this.push(self.Set(item));
					}, items);
					return items;
				}
			};


			$scope.TabSelectionChange = function (val) {
				$scope.selectedTab = val;
			};

			$scope.CloseDialog = function () {
				dialogService.CloseAll();
			};

			$scope.AddSample = function () {
				$scope.samples.push(sampleModel.Set());
			};

			$scope.AddDocumentSample = function () {
				$scope.documentSample.push(documentModel.Set());
			};

			$scope.AddSampleRemarks = function () {
				$scope.sampleRemarks.push(sampleModel.Set(null, 1));
			};

			$scope.AddCommonRemarks = function () {
				$scope.commonRemarks.push(sampleModel.Set(null, 2));
			};

			var DeleteAttachedFile = function (response) {
				if (!response.IsSuccess) errors.push("Deleting Attached File " + response.Message);
				//$scope.CloseDialog();
			}

			var deleteR2CDocument_Completed = function (response) {
				dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
				refreshGrid(response);
			}

			$scope.DeleteDocumentSample = function (model) {
				var callBackDocumentSample = function (response) {
					if (response == enums.CallbackType.Yes) {
						$scope.documentSample = $filter('filter')($scope.documentSample, function (value, index) { return value != model; });
						//var param = {
						//    r2cItemNumber: $scope.r2cItemNumber,
						//    documentId: "AttachedFiles"
						//};
						//r2cService.deleteALLSourceDocuments(param, DeleteAttachedFile);

						var param = {
							documentItemId: model.ItemId
						};
						r2cService.deleteR2CDocument(param, deleteR2CDocument_Completed);
					}
				}
				var message = "Are you sure you want to permanently delete this item?";
				var title = "DELETE ITEM";

				dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBackDocumentSample, enums.IsLevel2Popup);
			};

			var deleteR2CSampleRemarks_Completed = function (response) {
				dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
				refreshGrid(response);
			}

			$scope.DeleteSampleRemarks = function (model) {
				var callBackSampleRemarks = function (response) {
					if (response == enums.CallbackType.Yes) {
						$scope.sampleRemarks = $filter('filter')($scope.sampleRemarks, function (value, index) { return value != model; });

						var param = {
							remarksItemId: model.ItemId
						};
						r2cService.deleteR2CSampleRemarks(param, deleteR2CSampleRemarks_Completed);
					}
				};
				var message = "Are you sure you want to permanently delete this item?";
				var title = "DELETE ITEM";

				dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBackSampleRemarks, enums.IsLevel2Popup);
			};

			$scope.DeleteCommonRemarks = function (model) {
				var callBackCommonRemarks = function (response) {
					if (response == enums.CallbackType.Yes) {
						$scope.commonRemarks = $filter('filter')($scope.commonRemarks, function (value, index) { return value != model; });


						var param = {
							remarksItemId: model.ItemId
						};
						r2cService.deleteR2CSampleRemarks(param, deleteR2CSampleRemarks_Completed);
					}
				};
				var message = "Are you sure you want to permanently delete this item?";
				var title = "DELETE ITEM";

				dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBackCommonRemarks, enums.IsLevel2Popup);
			};

			$scope.DeleteSample = function (model) {
				var callBackSample = function (response) {
					if (response == enums.CallbackType.Yes) {
						$scope.samples = $filter('filter')($scope.samples, function (value, index) { return value != model; });

						var param = {
							sampleItemId: model.ItemId
						};
						r2cService.deleteR2CSample(param, deleteR2CSample_Completed);
					}
				}
				var message = "Are you sure you want to permanently delete this item?";
				var title = "DELETE ITEM";

				dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBackSample, enums.IsLevel2Popup);
			};

			var deleteR2CSample_Completed = function (response) {
				dialogService.Dialog.Alert(response.Message, response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
				refreshGrid(response);
			}


			$scope.setEvidenceItemSource = function (item, flag) {
				switch (flag) {
					case "documents":
						angular.forEach($scope.documentSample, function (item) {
							item.IsSelected = false;
						});
						break;
					case "samples":
						angular.forEach($scope.samples, function (item) {
							item.IsSelected = false;
						});
						break;
					case "samples-remarks":
						angular.forEach($scope.sampleRemarks, function (item) {
							item.IsSelected = false;
						});
						break;
					case "samples-common-remarks":
						angular.forEach($scope.commonRemarks, function (item) {
							item.IsSelected = false;
						});
						break;
				}

				item.IsSelected = true;
				if (globalUtility.IsNullOrWhiteSpace(item.ItemId) == false) {
					$scope.selectedRowId = item.ItemId;
					// $scope.evidenceTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "r2cEvidence");
				} else {
					$scope.selectedRowId = null;
				}
			};

			var onLoad = false;
			$scope.init = function (complinceProgramId) {

				$scope.evidenceTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "r2cEvidence");
				if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
					$scope.buttonTitle = 'Publish';
				}
				else if (globalUtility.Contributor) {
					$scope.buttonTitle = 'Submit';
				}

				if ($scope.mode == enums.Mode.ViewWF) $scope.buttonTitle = 'Submit';

				$scope.buttonTitle = $scope.buttonTitle ? 'Submit' : $scope.buttonTitle;


				resetAll();
				initiallizeItems();
				if ($scope.mode == enums.Mode.Edit || $scope.mode == enums.Mode.ViewWF) {
					onLoad = true;
					$scope.selectedComplianceProgram = complinceProgramId ? complinceProgramId : items.Data.ComplianceProgramId;

					$scope.onSelectedCompliance($scope.selectedComplianceProgram);

					if ($scope.mode == enums.Mode.ViewWF) {
						$scope.readOnlyForm = true;
						$scope.showSave = $scope.isAdminRole ? true : false;
						if (items.Data.RequestType == 0) {
							$scope.tabs = ["Documents"];
							$scope.selectedTab = $scope.tabs[0];
						}
						else {
							$scope.tabs = ["Samples"];
							$scope.selectedTab = $scope.tabs[0];
						}
					}
				}

			};

			var onGetAll_Completed = function (response) {//jj
				baseService.IsBusy(false);
				if (response.Success == false) return;
				if (response.Data == null) return;
				$scope.samples = sampleModel.SetCollection(response.Data.R2cSampleModes);
				$scope.sampleRemarks = sampleModel.SetCollection(response.Data.R2cSampleRemarks);
				$scope.commonRemarks = sampleModel.SetCollection(response.Data.R2cCommonRemarks);
				$scope.documentSample = documentModel.SetCollection(response.Data.Documents);
				$scope.complienceProgramName = response.Data.ComplienceProgramName;
				$scope.selectedComplianceProgram = response.Data.ComplianceProgramId;
				//complienace program details
				var isAdminRole = globalUtility.Coordinator || globalUtility.ContentAdmin;

				if ($scope.mode == enums.Mode.ViewWF && isAdminRole) {
					$scope.emailContent = {
						SectorRegulated: response.Data.SectorRegulated,
						Region: response.Data.Region,
						Country: response.Data.Country,
						Compliance: response.Data.ComplienceProgramName,
						ModifiedBy: items.Data.Requestor,
						WorkFlowStatus: null
					};
				}



				var params = [];
				angular.forEach($scope.documentSample, function (item) {
					var param = {
						ComplienceProgramId: $scope.selectedComplianceProgram,
						R2CItemNumber: item.ItemId
					};
					this.push(param);
				}, params);
				//
				if ($scope.mode == enums.Mode.Edit) {
					originalSamples = setOriginalData($scope.samples);
					originalSampleRemarks = setOriginalData($scope.sampleRemarks);
					originalCommonRemarks = setOriginalData($scope.commonRemarks);
				}

				if ($scope.mode == enums.Mode.ViewWF) {
					if (items.Data.RequestType == 0) {
						baseService.IsBusy(true);
						r2cService.GetSourceDocuments(params, onGetSourceDocuments_Completed);
					}
				} else {

					baseService.IsBusy(true);
					r2cService.GetSourceDocuments(params, onGetSourceDocuments_Completed);
				}

			};

			var setOriginalData = function (source) {
				var json = JSON.stringify(source, function (key, value) {
					if (key === "$$hashKey") {
						return undefined;
					}

					if (value == undefined) value = null;

					return value;
				});

				var target = JSON.parse(json);
				return target;
			}

			var onGetSourceDocuments_Completed = function (response) {
				baseService.IsBusy(false);
				angular.forEach($scope.documentSample, function (item) {
					angular.forEach(response.R2CAttachedFilePath.AttachedFiles, function (doc) {
						if (item.ItemId == doc.R2CItemNumber) {
							item.FileName = doc.FileName
							item.attachFile = { name: doc.FileName }
							item.IsAFModified = false;
						}
					})
				});
				if ($scope.mode == enums.Mode.Edit) {
					origDocumentSample = setOriginalData($scope.documentSample);
				}

			};

			var initiallizeItems = function () {
				//FOR SINGLE SELECTION
				$scope.complianceProgramList = [];

				$scope.sampleModeList = angular.copy(items.LookUps.SampleMode);
				$scope.documentTypeList = angular.copy(items.LookUps.DocumentType);
				$scope.remarkTypeList = angular.copy(items.LookUps.RemarkType);
				if ($scope.mode == enums.Mode.Add) {
					angular.forEach(items.LookUps.ComplianceProgram, function (item) {
						this.push({ Id: item.CertificateProgramId, Text: item.CertificateProgramName, Selected: false });
					}, $scope.complianceProgramList);
				}

			};

			var resetAll = function () {
				$scope.selectedRowId = null;
				errors = [];
				success = [];
				$scope.attachFiles = [];
				$scope.attachFile = "";
				$scope.isAFModified = false;
				$scope.complienceProgramName = "";

				$scope.selectedSampleMode = '';
				$scope.selectedDocumentType = '';
				$scope.selectedApplicationType = '';
				$scope.selectedComplianceProgram = [];
				$scope.selectedFrequencyTechnology = [];
				$scope.selectedProductType = [];
				$scope.sampleRemarksFreqTech = [];
				$scope.r2cItem = r2cItemModel.SetDefault();
				$scope.tabs = ["Documents", "Samples"];
				$scope.selectedTab = $scope.tabs[1];

				// $scope.modalTitle = $scope.mode == enums.Mode.Add ? "ADD R2C ITEM" : "EDIT R2C ITEM";
				complienceProgram = [];
				$scope.compliancePrograms = [];

				if (globalUtility.ContentAdmin) {
					$scope.canDelete = true;
				}

				$scope.sampleModeHeaders = ["Freq. RF Tech", "Sample Mode", "Units Needed", "Application Type"];

				$scope.documentHeaders = ["Document Name", "Attach File", "Remarks", "Copies Needed", "Frequency & Technology", "Product Type", "Application Type", "Document Type"];
				$scope.sampleRemarksHeaders = ["Freq. RF Tech", "Sample Mode", "Remarks"];
				$scope.commonRemarksHeaders = ["Remarks"];
				applicationTypes = ["New", "Renewal", "Modification"];
				sampleModes = ["Sample Mode 1", "Sample Mode 2", "Sample Mode 3"];


				$scope.samples = [];
				$scope.documentSample = [];
				$scope.sampleRemarks = [];
				$scope.commonRemarks = [];
			};

			var SaveAttachFiles = function () {

				$scope.attachFiles = [];
				angular.forEach($scope.documentSample, function (item) {
					if (!globalUtility.IsNullOrWhiteSpace(item.attachFile)) {
						if (item.IsAFModified) {
							var temp = {
								File: item.attachFile,
								ItemId: item.ItemId
							}
							this.push(temp);
						}
					}

				}, $scope.attachFiles);
				baseService.IsBusy($scope.attachFiles.length > 0);
				if ($scope.attachFiles.length === 0) return;

				var attachFiles = [];
				var pristine = $filter('filter')($scope.attachFiles, function (value, index) { return value.pristine == true; })
				var hasPristine = (pristine.length > 0);
				angular.forEach($scope.attachFiles, function (item) {
					var file = item.File;
					var reader = new FileReader();
					reader.onloadend = function () {
						if (reader.readyState == 2) {

							var arrayString = reader.result;
							var base64String = globalUtility.ArrayBufferToBase64String(arrayString);

							var param = {
								ComplienceProgramId: $scope.selectedComplianceProgram,
								R2CItemNumber: item.ItemId,
								File: base64String.match(/.{1,100}/g),
								Filename: file.name,
								SubFolderName: 'AttachedFiles',
								HasPristine: hasPristine
							};
							attachFiles.push(param);
							if (attachFiles.length == $scope.attachFiles.length) {
								r2cService.saveAttachFiles(attachFiles, onSaveAttachFilesCompleted);
							}
						}

					};
					reader.readAsArrayBuffer(file);
				});

			};

			var onSaveAttachFilesCompleted = function (response) {

				baseService.IsBusy(false);
				if (!response.IsSuccess) {
					showErrorMessage("Saving Attached Files " + response.Message);
				} else {
					baseService.Publish("workflow:saveCompleted");
					$scope.CloseDialog();
				}
			};

			$scope.onSelectionChanged = function () {
				if (!onload) {
					if (globalUtility.IsNullOrWhiteSpace($scope.selectedComplianceProgram)) return;
					$scope.onSelectedCompliance($scope.selectedComplianceProgram);
				}
			}
			//jj
			$scope.onSelectedCompliance = function (selected) {

				if (globalUtility.IsNullOrWhiteSpace(selected)) return;

				if ($scope.selectedComplianceProgram.constructor == Array) {
					if ($scope.selectedComplianceProgram.length === 0) return;
				};

				var param = {
					ComplianceProgramId: selected
				};


				var onGetLookupByCompliance_Completed = function (response) {
					if (response) {

						if (response.Success === true) {
							//FOR SINGLE SELECTION
							//$scope.sampleModeList = angular.copy(items.LookUps.SampleMode);
							$scope.applicationTypeList = angular.copy(response.Data.ApplicationType);

							//FOR MULTIPLE SELECTION
							$scope.freqTech = [];
							$scope.productTypes = [];

							angular.forEach(response.Data.FrequencyTechnology, function (freqtech) {
								this.push({ id: freqtech.FrequencyTechId, label: freqtech.FrequencyTechName });
							}, $scope.freqTech);

							angular.forEach(response.Data.ProductType, function (productType) {
								this.push({ id: productType.ProductTypeId, label: productType.ProductName });
							}, $scope.productTypes);
							//if ($scope.mode != enums.Mode.ViewWF)
							getDetailsOnLoad(selected);
							//if (onLoad) {
							//	getDetailsOnLoad(selected);
							//}
						}
					}
				}

				r2cService.getAllLookupsByCompliance(param, onGetLookupByCompliance_Completed);
			}

			var getDetailsOnLoad = function (selected) {
				baseService.IsBusy(true);
				var param = {
					SelectedRefiners: []
				};
				if ($scope.mode == enums.Mode.Edit || $scope.mode == enums.Mode.Add) {
					param.SelectedRefiners.push(
						{ RefinerType: "ComplianceProgram", RefinerValueId: selected },
						{ RefinerType: "StatusType", RefinerValueId: enums.WorkflowStatus.Approved.Id }
					);
				}

				if ($scope.mode == enums.Mode.ViewWF) {
					param.SelectedRefiners.push(
						{ RefinerType: "ComplianceProgram", RefinerValueId: selected },
						{ RefinerType: "Parent", RefinerValueId: items.Data.ReadyToCertifyParentId },
						{ RefinerType: "StatusType", RefinerValueId: enums.WorkflowStatus.ApproverReview.Id },
						{ RefinerType: "RequestType", RefinerValueId: items.Data.RequestType },
						{ RefinerType: "ItemId", RefinerValueId: items.Data.ItemId }
					);
				}
				//debugger;
				onLoad = false;
				r2cService.GetByComplienceId(param, onGetAll_Completed);
			};


			$scope.Save = function () {
				if (hasErrors()) return;
				baseService.IsBusy(true);
				if ($scope.selectedTab == "Documents") {
					saveDocument();

				} else {
					saveSample();
				}
			};

			$scope.ToggleApproveStatus = function (status) {
				$scope.isApproved = status;
				$scope.showCommentBox = status ? false : true;
			};

			var hasErrors = function () {
				var _hasError = $scope.selectedComplianceProgram.length == 0;
				$scope.showErrors = _hasError;
				return _hasError;
			};

			var showErrorMessage = function (message) {
				baseService.IsBusy(false);
				$scope.alertType = enums.AlertType.Error;
				$scope.alertMessage = message;
			};

			var getItemStatusId = function () {

				if ($scope.mode == enums.Mode.Add || $scope.enums.Mode.Edit) {
					if (globalUtility.Coordinator || globalUtility.ContentAdmin) return enums.WorkflowStatus.Approved.Id;
					else return enums.WorkflowStatus.ApproverReview.Id;
				}
				if ($scope.mode == enums.Mode.ViewWF) {
					return $scope.isApproved ? enums.WorkflowStatus.Approved.Id : enums.WorkflowStatus.Rejected.Id;
				}
			};

			var setWorkflowMetadata = function (item) {

				var retVal = {
					ItemId: item.ItemId,
					ItemStatusId: null,
					ParentId: null,
					SourceItemId: null,
					WorkFlowStatus: null,
					ApproverComment: null,
				};

				var isAdminRole = globalUtility.Coordinator || globalUtility.ContentAdmin;

				if ($scope.mode == enums.Mode.Add || $scope.mode == enums.Mode.Edit) {

					if (isAdminRole) {
						retVal.ItemStatusId = enums.WorkflowStatus.Approved.Id;
						retVal.WorkFlowStatus = enums.WorkflowStatus.Approved.Description;
					} else {
						retVal.ItemStatusId = enums.WorkflowStatus.ApproverReview.Id;
						retVal.WorkFlowStatus = enums.WorkflowStatus.ApproverReview.Description;
						retVal.ParentId = item.ItemId; // if newLy added equals null
						retVal.ItemId = null
					}
					//if (isAdminRole) {
					//	retVal.ItemStatusId = enums.WorkflowStatus.Approved.Id;
					//	retVal.WorkFlowStatus = enums.WorkflowStatus.Approved.Description;
					//}
					//else {
					//	retVal.ItemStatusId = enums.WorkflowStatus.ApproverReview.Id;
					//	retVal.WorkFlowStatus = enums.WorkflowStatus.ApproverReview.Description;
					//	retVal.ParentId = $scope.mode == enums.Mode.Add ? null : item.ItemId;
					//}
				}
				if ($scope.mode == enums.Mode.ViewWF) {

					if (isAdminRole) { //just to make sure only approver can save the workflow details
						retVal.ItemStatusId = $scope.isApproved ? enums.WorkflowStatus.Approved.Id : enums.WorkflowStatus.Rejected.Id;
						retVal.WorkFlowStatus = $scope.isApproved ? enums.WorkflowStatus.Approved.Description : enums.WorkflowStatus.Rejected.Description;
						retVal.ApproverComment = $scope.isApproved == false ? $scope.approverComment : null;
						//if workflow came from edit 

						if (globalUtility.IsNullOrWhiteSpace(item.ParentReadyToCertifyId) == false) {
							retVal.ItemId = item.ParentReadyToCertifyId;
							retVal.ParentId = null;
							retVal.SourceItemId = item.ItemId;
						}
						else {
							//from add
							retVal.ItemId = item.ItemId;
						}
					}
				}
				return retVal;
			};

			var getNotPrestineItems = function (toCompareData, origData) {
				var _temp = [], retVal = [];
				angular.forEach(toCompareData, function (item) {

					var json = JSON.stringify(item, function (key, value) {
						if (key === "$$hashKey") {
							return undefined;
						}

						if (value == undefined) value = null;

						return value;
					});
					this.push({
						id: item.id,
						jsonArray: json
					})
				}, _temp);

				var ids = [];
				angular.forEach(_temp, function (item) {
					var self = this;
					angular.forEach(origData, function (orgItem) {
						if (item.id == orgItem.id) {
							var json = JSON.stringify(orgItem, function (key, value) {
								if (key === "$$hashKey") {
									return undefined;
								}

								if (value == undefined) value = null;

								return value;
							});
							if (item.jsonArray != json) self.push(item.id);
						}

					});
				}, ids);

				angular.forEach(toCompareData, function (item) {
					var self = this;
					angular.forEach(ids, function (idsItem) {
						if (item.id == idsItem) self.push(item);
					})
				}, retVal);

				return retVal;
			};


			var saveDocument = function () {
				var sourceItemId = null, itemStatusId = null, workFlowStatus = null;
				var r2cDocumentModel = {
					AggregateFreqTech: function (items) {
						var freqTechs = [];
						angular.forEach(items, function (freq, idx, array) {
							freqTechs += freq.id;
							if (idx !== array.length - 1) freqTechs += ",";
						});

						return freqTechs;
					},
					AggregateProductType: function (items) {
						var producTypes = [];
						angular.forEach(items, function (prod, idx, array) {
							producTypes += prod.id;
							if (idx !== array.length - 1) producTypes += ",";
						});

						return producTypes;
					},
					Set: function (item) {
						var wf = setWorkflowMetadata(item);
						if (sourceItemId == null) sourceItemId = wf.SourceItemId;
						if (itemStatusId == null) itemStatusId = wf.ItemStatusId;
						if (workFlowStatus == null) workFlowStatus = wf.WorkFlowStatus;
						return {
							ItemId: wf.ItemId,
							ComplienceProgramId: $scope.selectedComplianceProgram,
							ReadyToCertifyDocumentTypeId: item.DocumentType,
							FrequencyTechnologyId: this.AggregateFreqTech(item.FreqTech),
							ProductTypeId: this.AggregateProductType(item.ProductType),
							RegulatoryApplicationTypeId: item.ApplicationType,
							NoOfCopiesRequired: item.NumberOfCopies,
							AddOrModifiedBy: globalUtility.CurrentUser,
							CultureTypeId: 1,
							DocumentName: item.DocumentName,
							Remarks: item.Remarks,
							ItemStatusId: wf.ItemStatusId,
							ParentReadyToCertifyId: wf.ParentId,
							Comments: wf.ApproverComment
						}
					}
				};

				var r2cDocs = [];
				var isAdminRole = globalUtility.Coordinator || globalUtility.ContentAdmin;

				if ($scope.mode == enums.Mode.Edit && !isAdminRole) {
					//check getAllItems that has changes 
					var ds = angular.copy(getNotPrestineItems($scope.documentSample, origDocumentSample));
					angular.forEach(ds, function (item) {
						this.push(r2cDocumentModel.Set(item));
					}, r2cDocs)
				} else {
					angular.forEach($scope.documentSample, function (item) {
						var docs = r2cDocumentModel.Set(item);
						this.push(docs);
					}, r2cDocs);
				};
				var param = {
					Documents: r2cDocs,
					SourceItemId: sourceItemId,
					WorkFlowStatusId: itemStatusId
				};

				if ($scope.mode == enums.Mode.ViewWF && isAdminRole) $scope.emailContent.WorkFlowStatus = workFlowStatus;
				r2cService.saveR2CDocument(param, onSaveDocument_Completed);
			};

			var onSaveDocument_Completed = function (response) {
				if (!response.IsSuccess) errors.push(response.Message);
				else success.push(response.Message);

				dialogService.Dialog.Alert(response.IsSuccess ? response.Message : "Saving Failed!", response.IsSuccess ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);
				baseService.Publish("r2c:addR2C", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
				baseService.IsBusy(response.IsSuccess);
				if (!response.IsSuccess) return;

				var isAdminRole = globalUtility.Coordinator || globalUtility.ContentAdmin;
				if ($scope.mode == enums.Mode.ViewWF && isAdminRole) sendEmail();

				if ($scope.mode == enums.Mode.Add) SaveAttachFiles();
				else if ($scope.mmode == enums.ViewWF) {
					baseService.Publish("workflow:saveCompleted");
					$scope.CloseDialog();
				}
				else {
					var currentTab = $scope.selectedTab;
					$scope.mode = enums.Mode.Add;
					$scope.init($scope.selectedComplianceProgram);
					onLoad = true;
					$scope.onSelectedCompliance();
					$scope.selectedTab = "Documents" ? $scope.tabs[0] : $scope.tabs[1];
				}

				if ($scope.mode == enums.Mode.ViewWF) {
					baseService.Publish("workflow:saveCompleted");
					$scope.CloseDialog();
				}
			};

			var saveSample = function () {
				var sourceItemId = null, itemStatusId = null, workFlowStatus = null;
				var r2cSampleModel = {
					AggregateFreqTech: function (items) {
						var freqTechs = [];
						if (items === "undefined") return null;
						if (items === undefined) return null;
						angular.forEach(items, function (freq, idx, array) {
							freqTechs += freq;
							if (idx !== array.length - 1) freqTechs += ",";
						});

						if (freqTechs.length == 0) {
							return null;
						}

						return freqTechs;
					},
					CheckApplicationType: function (item) {
						if (item === "") return null;
						if (item === null) return null;
						if (item === "undefined") return null;
						if (item === undefined) return null;

						return item;
					},

					Set: function (item) {
						var wf = setWorkflowMetadata(item);
						if (workFlowStatus == null) workFlowStatus = wf.WorkFlowStatus;
						if (sourceItemId == null) sourceItemId = wf.SourceItemId;
						if (itemStatusId == null) itemStatusId = wf.ItemStatusId;
						if (workFlowStatus == null) workFlowStatus = wf.WorkFlowStatus;
						return {
							ItemId: wf.ItemId,
							ComplianceProgramId: $scope.selectedComplianceProgram,
							FrequencyTechnologyId: item.FreqTech ? parseInt(item.FreqTech) : null,
							ReadyToCertifySampleModeTypeId: item.SampleMode ? parseInt(item.SampleMode) : null,
							NumberOfUnitsRequired: item.NumberOfUnitsRequired ? parseInt(item.NumberOfUnitsRequired) : null,
							ApplicationTypeId: item.ApplicationType,
							CultureTypeId: 1,
							Remarks: item.Remarks,
							RemarkTypeId: item.RemarkTypeId,
							ItemStatusId: wf.ItemStatusId,
							ParentReadyToCertifyId: wf.ParentId,
							SampleModeItemId: null,
							CreatedOrModifiedBy: globalUtility.CurrentUser,
							isAdminRole: null,
							Approve: null,
							Comments: wf.ApproverComment

						}
					}
				};
				var r2cSample = [];

				var toSet = function (tempSamples) {

					angular.forEach(tempSamples, function (item) {
						this.push(r2cSampleModel.Set(item));
					}, r2cSample);
				};


				// var r2cDocs = [];
				var isAdminRole = globalUtility.Coordinator || globalUtility.ContentAdmin;

				if ($scope.mode == enums.Mode.Edit && !isAdminRole) {
					//check getAllItems that has changes 
					var ds = angular.copy(getNotPrestineItems($scope.samples, originalSamples));
					angular.forEach(ds, function (item) {
						this.push(r2cSampleModel.Set(item));
					}, r2cSample)

					var ds = angular.copy(getNotPrestineItems($scope.sampleRemarks, originalSampleRemarks));
					angular.forEach(ds, function (item) {
						this.push(r2cSampleModel.Set(item));
					}, r2cSample)

					var ds = angular.copy(getNotPrestineItems($scope.commonRemarks, originalSampleRemarks));
					angular.forEach(ds, function (item) {
						this.push(r2cSampleModel.Set(item));
					}, r2cSample)

				} else {
					toSet($scope.samples);
					toSet($scope.sampleRemarks);
					toSet($scope.commonRemarks);
				};
				var isAdminRole = globalUtility.Coordinator || globalUtility.ContentAdmin;
				if ($scope.mode == enums.Mode.ViewWF && isAdminRole) $scope.emailContent.WorkFlowStatus = workFlowStatus;

				var param = {
					Samples: r2cSample,
					SourceItemId: sourceItemId,
					WorkFlowStatusId: itemStatusId
				};

				r2cService.saveR2CSample(param, onSaveSample_Completed);
			};
			var onSaveSample_Completed = function (response) {
				baseService.IsBusy(false);
				if (!response.Success) errors.push(response.ErrorMessage);
				else success.push("Ready To Certify Sample successfully saved/updated.");
				baseService.Publish("r2c:addR2C", { Success: success, Errors: errors, HasErrors: errors.length > 0 });

				console.log(response.ErrorMessage);
				var errorMessage = "Saving Failed!";
				dialogService.Dialog.Alert(response.Success ? success : errorMessage, response.Success ? enums.MessageType.Success : enums.MessageType.Error, enums.IsLevel2Popup);

				var isAdminRole = globalUtility.Coordinator || globalUtility.ContentAdmin;
				if ($scope.mode == enums.Mode.ViewWF && isAdminRole) sendEmail();

				if ($scope.mode == enums.Mode.Edit) SaveAttachFiles();
				else if ($scope.mmode == enums.ViewWF) {
					baseService.Publish("workflow:saveCompleted");
					// $scope.CloseDialog();
				}
				else {
					var currentTab = $scope.selectedTab;
					$scope.mode = enums.Mode.Edit;
					$scope.init($scope.selectedComplianceProgram);
					onLoad = true;
					$scope.onSelectedCompliance();
					$scope.selectedTab = "Documents" ? $scope.tabs[0] : $scope.tabs[1];
				}

				if ($scope.mode == enums.Mode.ViewWF) {
					baseService.Publish("workflow:saveCompleted");
					//$scope.CloseDialog();
				}

				$scope.CloseDialog();
			};

			var sendEmail = function () {


				var onSuccessEmail = function (response) {
					console.log(response);

				};
				var categories = [];
				categories.push($scope.emailContent.SectorRegulated);

				var region = [];
				region.push($scope.emailContent.Region);

				var country = [];
				country.push($scope.emailContent.Country);
				var complience = [];
				complience.push($scope.emailContent.Compliance);

				var paramsEmail = {
					Status: $scope.emailContent.WorkFlowStatus,
					Scope: globalUtility.CurrentPage,
					Category: categories,
					Region: region,
					Country: country,
					Compliance: complience,
					Original: [],
					Updated: [],
					Source: [],
					Link: [],
					Remarks: $scope.approverComment,
					Recipient: $scope.emailContent.ModifiedBy
				};

				homeService.sendEmail(paramsEmail, onSuccessEmail);
			};

			var refreshGrid = function (response) {
				if (!response.IsSuccess) errors.push(response.Message);
				else success.push(response.Message);
				baseService.Publish("r2c:addR2C", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
			}

			var saveCompleted = function () {
				$scope.CloseDialog();
				baseService.Publish("r2c:addR2C", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
			};

			$scope.init();

			$scope.$on('$destroy', function () {

				//var events = ['shell:addSelectedRefiner', 'shell:removeSelectedRefiner'];
				//baseService.UnSubscribe(events);
			});
		}]);
});
