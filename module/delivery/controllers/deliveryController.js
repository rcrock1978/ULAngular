
define([
	'app',
	'globalUtility',
	'enums',
	'routeResolver',
	'shell/model/refinerModel',
	'module/delivery/model/deliveryModel'
], function (app, globalUtility, enums, routeResolver, refinerModel, deliveryModel) {

	app.register.controller('deliveryController', ['$scope', '$http', '$rootScope', '$filter', '$timeout', '$window', 'baseService', 'dialogService', 'bsAlertService', 'exportService', 'deliveryService', 'deliveryConfigService',
		function ($scope, $http, $rootScope, $filter, $timeout, $window, baseService, dialogService, bsAlertService, exportService, deliveryService, config) {
			//"global" variables
			var columns            = [];
			var headers            = [];
			var initialLoad        = true;
			var isFavorite         = false;
			var initialRowsToLoad  = 200;
			var initialSearchLimit = 100;
			var itemsPerPage       = 20;
			var lastRowReturned    = 0;
			var mode               = enums.Mode.Add;
			var page               = 1;
			var paramData          = [];
			var searchWord         = '';
			var totalRows          = 0;
			var workflowColumns    = [];
			var workflowHeaders    = [];

			//viewmodel/bindable members
			$scope.addDelivery = addDelivery;
			$scope.addDeliveryManual = addDeliveryManual;
			$scope.checkAllResult = checkAllResult;
			$scope.copyDelivery = copyDelivery;
			$scope.deleteDelivery = deleteDelivery;
			$scope.delivery = [];
			$scope.deliveryGrid = {};
			$scope.deliveryWorkflow = [];
			$scope.deliveryWorkflowGrid = {};
			$scope.editDelivery = editDelivery;
			$scope.exportToExcel = exportToExcel;
			$scope.getDeliveryWorkflow = getDeliveryWorkflow;
			$scope.gridSelections = [];
			$scope.gridWorkflowSelections = [];
			$scope.modalTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "deliveryModal");
			$scope.openDeliveryManual = openDeliveryManual;
			$scope.removeRefiner = removeRefiner;
			$scope.selectedRefiners = [];
			$scope.showGridLoader = false;
			$scope.displayWorkflow = false;
			$scope.workflowButtonLabel = "WORKFLOW TRACKING";
			$scope.viewWorkflowDetails = viewWorkflowDetails;


			init();
			//function implementations
			//////////////  

			function addDelivery() {
				mode = enums.Mode.Add;
				if (globalUtility.DeliveryLookups.length == 0) {
					baseService.IsBusy(true);
					deliveryService.getAllLookups(onGetLookUps_Completed);

				} else {
					openModal();
				}

			};

			function addDeliveryManual(data) {
				mode = "addManual";
				paramData = data;
				if (globalUtility.DeliveryLookups.length == 0) {
					baseService.IsBusy(true);
					deliveryService.getAllDeliveryManualLookups(onGetLookUps_Completed);

				} else {
					openModal();
				}

			};

			function addSelectedRefiner(event, data) {
				if ($scope.selectedRefiners.map(function (ref) { return ref.Value; }).indexOf(data.Value) === -1) {
					$scope.selectedRefiners.push(data);
				}

				baseService.Publish('shell:addSelectedModuleRefiner', { Refiner: data });

				page = 1;
				$scope.delivery = [];

				if (!initialLoad && !isFavorite) {
					baseService.AddToGlobalRefiners(data);
					baseService.IsBusy(true);
					searchViaRefiners();
				}
			};

			function arrayUnique(array) {
				var a = array.concat();
				for (var i = 0; i < a.length; ++i) {
					for (var j = i + 1; j < a.length; ++j) {
						if (a[i] === a[j])
							a.splice(j--, 1);
					}
				}

				return a;
			}

			function bindTypeAheadSearch() {
				var channel = new kernel.messaging.channel(window.parent);

				var subscriber = new kernel.messaging.subscriber('Delivery', 'searchFilter', function (command) {
					var searchWord = command.arg;

					Search(searchWord);
				});

				channel.register(subscriber);
			};

			function Search(searchWord) {

				var isExist = false;
				angular.forEach($scope.selectedRefiners, function (item) {

					if (item.Type == "Keyword") {
						isExist = true;
						item.Id = searchWord;
						item.Value = searchWord;
					}
				});
				if (searchWord == "") {
					if (isExist) {
						$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value.Type != refinerType.Keyword; });
					}
					searchDelivery(initialSearchLimit, 0, []);
					searchDeliveryWorkflow(initialSearchLimit, 0, []);
				}
				else {
					$scope.$apply();
					if (!isExist) {
						var data = {
							Type: config.keywordRefiner.refinerType,
							Id: searchWord.length > 50 ? searchWord.slice(0, 50) : searchWord,
							Value: searchWord.length > 50 ? searchWord.slice(0, 50) : searchWord,
							Parent: "Keyword",
							Checked: false,
							IsDateRange: false
						};
						$scope.selectedRefiners.push(data);

					}
					searchViaRefiners();
				}
			};

			function copyDelivery(data) {
				mode = enums.Mode.Copy;
				paramData = data;
				if (globalUtility.DeliveryLookups.length == 0) {
					baseService.IsBusy(true);
					deliveryService.getAllLookups(onGetLookUps_Completed);
				} else {
					openModal();
				}
			};

			function checkAllResult($event) {
				var checkbox = $event.target;

				angular.forEach($scope.delivery, function (item) {
					item.IsChecked = checkbox.checked;
				});

			};

			function deleteDelivery(data) {
				var message = "Are you sure you want to permanently delete the document /s? All related documents will also be deleted.";
				var title = "DELETE DELIVERY MANUAL";

				dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, onDelete_callBack);

				//////////////  

				function onDelete_callBack(response) {
					if (response == enums.CallbackType.Yes) {
						//var param = {
						//    DeliveryItemId: data.DeliveryItemId
						//};
						//deliveryService.DeleteDelivery(param, onDeleteDelivery_Completed);
						var deliveryItem = $filter('filter')($scope.delivery, function (value, index) { return value.DeliveryItemId == data.DeliveryItemId; });
						var param = { DeliveryItemId: deliveryItem[0].DeliveryItemId };

						deliveryService.deleteALLSourceDocuments(param, onDeleteSuccess)

						//baseService.IsBusy(true);

						//////////////  

						function onDeleteDelivery_Completed(response) {
							baseService.IsBusy(false);
							bsAlertService.Show(response.Success ? response.Data.Message : response.ErrorMessage,
								response.Success ? enums.AlertType.Success : enums.AlertType.Error);

							if (response.Success) {
								var deliveryItem = $filter('filter')($scope.delivery, function (value, index) { return value.DeliveryItemId == response.Data.DeliveryItemId; });
								//$scope.delivery = $filter('filter')($scope.certificates, function (value, index) { return value.CertificateItemId != response.Data.CertificateItemId; });
								//$scope.certificatesGrid.data = angular.copy($scope.certificates);

								var onDeleteSuccess = function (res) {
									if (!res.IsSuccess) console.log('Error Deleting Documents');
								}
								var param = { DeliveryItemId: deliveryItem[0].DeliveryItemId };
								deliveryService.deleteALLSourceDocuments(param, onDeleteSuccess)
							}
						};

						function onDeleteSuccess(res) {
							if (!res.IsSuccess) console.log('Error Deleting Documents');

							searchDelivery(initialSearchLimit, 0, []);
							searchDeliveryWorkflow(initialSearchLimit, 0, []);
						}
					}
				}
			};

			function download(event, data) {
				var onSuccess = function (response) {

					if (response.Message == enums.ResponseType.Success) {
						var blob = new Blob([response.Data], { type: "application/octet-stream" });
						saveAs(blob, data.FileName);
					}
					baseService.IsBusy(false);
				};
				deliveryService.downloadFile(
					{
						FileName: data.FileName,
						DeliveryItemId: data.DeliveryItemId,
						SubFolder: data.SubFolder
					},
					onSuccess);
			};

			function editDelivery(data) {
				mode = enums.Mode.Edit;
				paramData = data;
				if (globalUtility.DeliveryLookups.length == 0) {
					baseService.IsBusy(true);
					deliveryService.getAllLookups(onGetLookUps_Completed);

				} else {
					openModal();
				}
			};

			function exportToExcel() {
				var callBack = function (response) {
					if (response == enums.CallbackType.Cancel) return;

					var table = {
						Headers: [],
						Rows: []
					};

					//export to array
					var data = [];
					var dataHeader = [];
					var dataRow = [];

					angular.forEach(headers, function (head) {
						this.push(head.Title);
					}, dataHeader);

					//export to array
					data.push(dataHeader);

					angular.forEach($scope.gridSelections, function (item) {
						var row = {
							Items: []
						};
						//var countries = "";
						//var ctr = 0, limit = item.Countries.length;
						//angular.forEach(item.Countries, function (country) {
						//    countries += country.CountryName;
						//    if (ctr != limit) countries += ",";
						//    ctr += 1;
						//});

						// this.push(row);

						var dataRow = [];

						//export to array
						//dataRow.push(item.Manual);
						//dataRow.push(item.DeliveryItemId);
						dataRow.push(item.Region);
						dataRow.push(item.RegionalEconomicUnion);
						dataRow.push(item.Countries.map(function (c) { return c.CountryName }).join(','));
						dataRow.push(item.ComplianceProgram);
						dataRow.push(item.SectorsRegulated.map(function (sr) { return sr.SectorRegulatedName }).join(','));
						dataRow.push(item.CertificationOrganization);
						dataRow.push(item.ComplianceModels.map(function (cm) { return cm.ComplianceModelName }).join(','));
						dataRow.push(item.MandatoryOrVoluntary);
						dataRow.push(item.ModularApproval);
						//dataRow.push(item.AcceptedTestReports_EMCName);
						//dataRow.push(item.AcceptedTestReports_SafetyName);
						//dataRow.push(item.AcceptedTestReports_WirelessName);
						dataRow.push(item.AcceptedTestReports.map(function (atr) { return atr.AcceptedTestReportsName }).join(','));
						dataRow.push(item.ApplicationType);
						//dataRow.push(item.SampleRequirement_EMC);
						//dataRow.push(item.SampleRequirement_Safety);
						//dataRow.push(item.SampleRequirement_Wireless);
						dataRow.push(item.SampleRequirement);
						//dataRow.push(item.InCountryTesting_EMC);
						//dataRow.push(item.InCountryTesting_Safety);
						//dataRow.push(item.InCountryTesting_Wireless);
						dataRow.push(item.InCountryTesting);
						//dataRow.push(item.TestingOrganization_EMC);
						//dataRow.push(item.TestingOrganization_Safety);
						//dataRow.push(item.TestingOrganization_Wireless);
						dataRow.push(item.TestingOrganization);
						dataRow.push(item.LocalRepresentative);
						dataRow.push(item.LocalRepresentativeService);
						dataRow.push(item.CertificateValidityPeriod);
						//dataRow.push(item.Manual);
						dataRow.push(item.LeadTime);
						dataRow.push(item.PreferredChannels.map(function (pc) { return pc.PreferredChannelName }).join(','));
						//dataRow.push(item.CreatedDate);
						//dataRow.push(item.CreatedBy);
						//dataRow.push(item.ModifiedDate);
						//dataRow.push(item.ModifiedBy);




						data.push(dataRow);

					});

					//exportService.ExportJSONToExcel(table, "Certificates");
					exportService.ExportArrayToExcel(data, "Delivery");

				}

				var message = "The selected results will be exported to excel";
				var title = "EXPORT RESULTS";

				dialogService.Dialog.Confirm(enums.ConfirmType.OkCancel, message, title, enums.ModalSize.Small, callBack);

			};

			function getDelivery() {
				var criterea = {
					RowsToReturn: initialSearchLimit,
					LastRowReturned: 0,
					SelectedRefiners: getRefinerList(),
					Page: page,
					Keyword: searchWord,
					CultureTypeId: globalUtility.SelectedLanguage
				};

				deliveryService.getAll(criterea, result);

				////////////// 

				function result(data) {

					var stillMoreData = true;

					if (data.Data.Deliveries.length !== 0) {
						if (page === 1) {
							$scope.delivery = data.Data.Deliveries;
						}
						else {
							$scope.delivery = $scope.delivery.concat(data.Data.Deliveries);
						}
					}
					else {
						stillMoreData = false;
					}

					if (data.Data.Deliveries.length < 200) {
						stillMoreData = false;
					}

					$scope.gridApi.infiniteScroll.dataLoaded(false, stillMoreData);


					//$scope.contactGrid.data = $scope.contacts;
					$scope.showGridLoader = false;

					//page = page + 1; 
				};
			}

			function getRefinerList() {
				var selectedRefiners = [];
				if ($scope.selectedRefiners.length > 0) {
					angular.forEach($scope.selectedRefiners, function (refiner) {
						if (refiner.IsDateRange) {

							this.push({ RefinerType: refiner.Items[0].Type, RefinerValueId: refiner.Items[0].ValueString })
							this.push({ RefinerType: refiner.Items[1].Type, RefinerValueId: refiner.Items[1].ValueString })

						} else {
							this.push({ RefinerType: refiner.Type, RefinerValueId: refiner.Id })
						}

					}, selectedRefiners);
				}

				return selectedRefiners;
			}

			function getDeliveryWorkflow() {

				$scope.displayWorkflow = !$scope.displayWorkflow;
				loadRefiners();
				if (!$scope.displayWorkflow) {
					$scope.workflowButtonLabel = "WORKFLOW TRACKING";
				}
				else {
					$scope.workflowButtonLabel = "BACK TO LIST";
				}
			}

			function init() {

			    if (initialLoad) {
			        //set subscriptions
			        baseService.Subscribe('shell:refreshRefinersDelivery', refreshRefinersDelivery);
			        baseService.Subscribe('shell:addSelectedRefiner', addSelectedRefiner);
			        baseService.Subscribe('shell:removeSelectedRefiner', removeSelectedRefiner);
			        baseService.Subscribe('delivery:addDeliveryManual', onAddDeliveryManual);
			        baseService.Subscribe('delivery:downloadDelivery', download);
			        baseService.Subscribe('shell:refinerSetCompleted', populateGridData);
			        baseService.Subscribe('shell:clearAllSelectedRefiners', function () {
			            $scope.selectedRefiners = [];
			        });

			        baseService.Subscribe('workflow:addWorkflow', onAddWorkflow);
			    }
				
				//show search bar
				baseService.SearchBarVisibility(true);
				//bindTypeAheadSearch();

				setupGridParameters();
				setupWorkflowGridParameters();

				loadRefiners();

				//baseService.Publish('shell:loadPreselectedRefiners');
				//loadPreselectedRefiners();

				//searchDelivery(initialSearchLimit, 0, []);
				baseService.IsBusy(true);

				//////////////


			};

			function onGetAllDelivery_Completed(data) {

				function addDays(date, days) {
					var result = new Date(date);
					result.setDate(result.getDate() + days);
					return result;
				}

				var SetCountryNames = function (countries) {
					var countryNames = "";
					var limit = countries.length;
					var ctr = 0;
					angular.forEach(countries, function (country) {
						countryNames += country.CountryName;
						ctr += 1;
						if (ctr < limit) countryNames += ",";
					});
					return countryNames;
				};

				angular.forEach(data.Data.Deliveries, function (item) {
					var model = {

						//MultiSelect
						Countries: item.Countries,
						SectorsRegulated: item.SectorsRegulated,
						ComplianceModels: item.ComplianceModels,
						PreferredChannels: item.PreferredChannels,
						AcceptedTestReports_Wireless_list: item.AcceptedTestReports_Wireless_list,
						AcceptedTestReports_Safety_list: item.AcceptedTestReports_Safety_list,
						AcceptedTestReports_EMC_list: item.AcceptedTestReports_EMC_list,

						AcceptedTestReports: item.SelectedAcceptedTestReports,
						SampleRequirement: item.SelectedSampleRequirement,
						InCountryTesting: item.SelectedInCountryTesting,
						TestingOrganization: item.SelectedTestingOrganization,



						//CountryName: item.SelectedCountry,
						CountryName: SetCountryNames(item.Countries),
						SectorRegulatedName: item.SelectedSectorRegulated,
						AcceptedTestReports_WirelessName: item.SelectedATR_Wireless,
						AcceptedTestReports_SafetyName: item.SelectedATR_Safety,
						AcceptedTestReports_EMCName: item.SelectedATR_EMC,
						ComplianceModelName: item.SelectedComplianceModel,
						PreferredChannelName: item.SelectedPreferredChannel,


						DeliveryItemId: item.DeliveryItemId,
						Region: item.Region,
						RegionalEconomicUnion: item.RegionalEconomicUnion_Name,
						ComplianceProgram: item.ComplianceProgram_Name,
						CertificationOrganization: item.CertificationOrganization_Name,
						MandatoryOrVoluntary: item.MandatoryOrVoluntary_Name,
						ModularApproval: item.ModularApproval_Name,
						ApplicationType: item.ApplicationType_Name,
						SampleRequirement_Wireless: item.SampleRequirement_Wireless_Name,
						SampleRequirement_Safety: item.SampleRequirement_Safety_Name,
						SampleRequirement_EMC: item.SampleRequirement_EMC_Name,
						InCountryTesting_Wireless: item.InCountryTesting_Wireless_Name,
						InCountryTesting_Safety: item.InCountryTesting_Safety_Name,
						InCountryTesting_EMC: item.InCountryTesting_EMC_Name,
						TestingOrganization_Wireless: item.TestingOrganization_Wireless,
						TestingOrganization_Safety: item.TestingOrganization_Safety,
						TestingOrganization_EMC: item.TestingOrganization_EMC,
						LocalRepresentative: item.LocalRepresentative_Name,
						LocalRepresentativeService: item.LocalRepresentativeService_Name,
						CertificateValidityPeriod: item.CertificateValidityPeriod,
						LeadTime: item.LeadTime,
						Manual: item.Manual,

						IsChecked: item.IsChecked,
						IsNew: (
							(new Date() <= (addDays((item.ModifiedDate != null ? item.ModifiedDate : item.CreatedDate), 14)) ? true : false)),



						//(addDays((item.ModifiedDate != null ? item.ModifiedDate : item.CreatedDate), 14)
						//>= (item.ModifiedDate != null ? item.ModifiedDate : item.CreatedDate))
						//&&
						//(addDays((item.ModifiedDate != null ? item.ModifiedDate : item.CreatedDate), 14)
						//<= new Date())
						//) ? true : false,

						CreatedDate: item.CreatedDate,
						CreatedBy: item.CreatedBy,
						ModifiedDate: item.ModifiedDate,
						ModifiedBy: item.ModifiedBy

					};
					this.push(model);



				}, $scope.vm.deliveries)

				$scope.delivery = angular.copy($scope.vm.deliveries);

			};

			function loadRefiners() {
				if (!$scope.displayWorkflow) {
					deliveryService.getAllRefiners(onGetRefiners_Completed);
				} else {
					deliveryService.getAllWorkFlowRefiners(onGetWorkFlowRefiners_Completed);
				}




				//////////////

				function onGetRefiners_Completed(response) {
					var refinerDS = [];
					$scope.selectedRefiners = [];

					if (response.Data.length !== 0) {
						//get preselected refiners from homepage
						var preselectedRefiners = globalUtility.GetPreselectedRefiners();
						refinerDS = deliveryService.buildRefiners(response.Data, preselectedRefiners);

						var keywordRefiner = globalUtility.GetPreselectedKeywordRefiner();
						if (keywordRefiner != undefined) baseService.Publish('shell:addSelectedRefiner', keywordRefiner);

						var addNotAvailableRefiner = function (data) {
							$scope.selectedRefiners.push(data);
							baseService.AddToGlobalRefiners(data);
						};
						var allowed = ["country", "region", "sector", "compliance program", "application type"];
						globalUtility.SetNotAvailableRefiners(refinerDS, allowed, addNotAvailableRefiner);

						//send refiners to left nav
						baseService.Publish('shell:setRefinerDataSource', refinerDS);
					}

					//  searchDelivery(initialSearchLimit, 0, []);

					// initialLoad = false;
				};


				function onGetWorkFlowRefiners_Completed(response) {
					var refinerDS = [];
					$scope.selectedRefiners = [];

					if (response.Data.length !== 0) {
						//get preselected refiners from homepage
						var preselectedRefiners = globalUtility.GetPreselectedRefiners();
						refinerDS = deliveryService.buildWorkFlowRefiners(response.Data, preselectedRefiners);
						var addNotAvailableRefiner = function (data) {
							$scope.selectedRefiners.push(data);
							baseService.AddToGlobalRefiners(data);
						};
						var allowed = ["country", "region", "sector", "compliance program", "application type"];
						globalUtility.SetNotAvailableRefiners(refinerDS, allowed, addNotAvailableRefiner);

						//send refiners to left nav
						baseService.Publish('shell:setRefinerDataSource', refinerDS);
					}

					//  searchDelivery(initialSearchLimit, 0, []);

					// initialLoad = false;
				};

			}

			function populateGridData() {
				page = 1;
				//searchDelivery(initialSearchLimit, 0, $scope.selectedRefiners);
				//searchDeliveryWorkflow(initialSearchLimit, 0, []);
				searchViaRefiners();
			}

			function onAddWorkflow(event, data) {
				var message = [];
				message.push({ Message: data.Success[0], IsSuccess: true });
				if (data.HasErrors) {
					angular.forEach(data.Errors, function (error) {
						this.push({ Message: error, IsSuccess: false });
					}, message);
				}

				if ($scope.displayWorkflow) {
					bsAlertService.Show(message, data.HasErrors ? enums.AlertType.Warning : enums.AlertType.Success, true);
					page = 1;
					initialRowsToLoad = 200;
					initialSearchLimit = 100;
					//searchDeliveryWorkflow(initialSearchLimit, 0, []);
					//searchViaRefiners();
				}
			};

			function onAddDelivery(event, data) {
				if (data.Mode == enums.Mode.Add || data.Mode == enums.Mode.Copy) {
					$scope.delivery.push(data.Data);
				} else {
					angular.forEach($scope.delivery, function (item) {

						if (item == data.OriginalData) {
							item.DeliveryItemId = data.Data.DeliveryItemId;
							item.Region = data.Data.Region;
							item.RegionalEconomicUnion = data.Data.RegionalEconomicUnion;
							item.Country = data.Data.Country;
							item.ComplianceProgram = data.Data.ComplianceProgram;
							item.SectorRegulated = data.Data.SectorRegulated;
							item.CertificationOrganization = data.Data.CertificationOrganization;
							item.ComplianceModel = data.Data.ComplianceModel;
							item.MandatoryOrVoluntary = data.Data.MandatoryOrVoluntary;
							item.ModularApproval = data.Data.ModularApproval;
							item.AcceptedTestReports_Wireless = data.Data.AcceptedTestReports_Wireless;
							item.AcceptedTestReports_Safety = data.Data.AcceptedTestReports_Safety;
							item.AcceptedTestReports_EMC = data.Data.AcceptedTestReports_EMC;
							item.SampleRequirement_Wireless = data.Data.SampleRequirement_Wireless;
							item.SampleRequirement_Safety = data.Data.SampleRequirement_Safety;
							item.SampleRequirement_EMC = data.Data.SampleRequirement_EMC;
							item.InCountryTesting_Wireless = data.Data.InCountryTesting_Wireless;
							item.InCountryTesting_Safety = data.Data.InCountryTesting_Safety;
							item.InCountryTesting_EMC = data.Data.InCountryTesting_EMC;
							item.TestingOrganization_Wireless = data.Data.TestingOrganization_Wireless;
							item.TestingOrganization_Safety = data.Data.TestingOrganization_Safety;
							item.TestingOrganization_EMC = data.Data.TestingOrganization_EMC;
							item.LocalRepresentative = data.Data.LocalRepresentative;
							item.LocalRepresentativeService = data.Data.LocalRepresentativeService;
							item.CertificateValidityPeriod = data.Data.CertificateValidityPeriod;
							item.LeadTime = data.Data.LeadTime;
							item.Manual = data.Data.Manual;
							item.PreferredChannel = data.Data.PreferredChannel;
							item.Documents = data.Data.Documents;
							item.AuthorityRegulation = data.Data.AuthorityRegulation;
							item.GeneralScope = data.Data.GeneralScope;
							item.Application = data.Data.Application;
							item.CertificationScheme = data.Data.CertificationScheme;
							item.ApplicationType = data.Data.ApplicationType;
							item.LatestDayToSubmitRenewalApplication = data.Data.LatestDayToSubmitRenewalApplication;
							item.CreatedBy = data.Data.CreatedBy;
							item.CreatedDate = Date.now;
							item.ModifiedBy = null;
							item.ModifiedDate = null;
							item.IsChecked = false;
						}

					});
				}

			};

			function onAddDeliveryManual(event, data) {
				var message = [];
				message.push({ Message: data.Success[0], IsSuccess: true });
				if (data.HasErrors) {
					angular.forEach(data.Errors, function (error) {
						this.push({ Message: error, IsSuccess: false });
					}, message);
				}
				bsAlertService.Show(message, data.HasErrors ? enums.AlertType.Warning : enums.AlertType.Success, true);
				//bsAlertService.Show(data.Success ? data.Data.Message : data.ErrorMessage,
				//data.Success ? enums.AlertType.Success : enums.AlertType.Error);
				isOnload = false;
				//initiallizeItems();

				searchViaRefiners();
				//searchDelivery(initialSearchLimit, 0, []);

			};

			function onGetLookUps_Completed(response) {
				baseService.IsBusy(false);
				globalUtility.DeliveryLookups = response.Data;
				openModal();
			};

			function openDeliveryManual(item) {

				//var deliveryId = (item.ChildDeliveryId == "00000000-0000-0000-0000-000000000000") ? item.DeliveryItemId : item.ChildDeliveryId;
			    var deliveryId = item.DeliveryItemId;
			    var param;

			    var onSuccess = function (response) {
					if (response.IsSuccess) {

						if (response.DeliveryDocumentPaths.PrimaryFiles.length == 0 && response.DeliveryDocumentPaths.RelatedFiles.length == 0) {
							baseService.IsBusy(false);
							dialogService.Dialog.Alert("No Document Found!", enums.MessageType.Success);

							return;
						}
						if (response.DeliveryDocumentPaths.RelatedFiles.length == 0) {
							baseService.IsBusy(true);
							download(null, {
								FileName: response.DeliveryDocumentPaths.PrimaryFiles[0],
								SubFolder: "PrimaryFiles",
								DeliveryItemId: deliveryId
							});

							return;
						}
						var params = {
							DocumentPaths: response.DeliveryDocumentPaths,
							DeliveryItemId: deliveryId
						};
						dialogService.Dialog.WithTemplateAndController("ViewDeliveryManualDialog.html", "viewDeliveryManualController", enums.ModalSize.Small, params);
					}
					baseService.IsBusy(false);
				};
			    baseService.IsBusy(true);

				if (item.ItemFiles.length == 0) {
				    param = {
				        DeliveryItemId: deliveryId
				    };
				    deliveryService.getSourceDocumentsById(param, onSuccess);
				}
				else {
				    param = item.ItemFiles;
				    deliveryService.getSourceDocuments(param, onSuccess);
				}
			};

			function openModal() {
				var param = {
					Mode: mode,
					Data: (openModal == enums.Mode.add) ? null : paramData,
					LookUps: globalUtility.DeliveryLookups
				};

				switch (mode) {
					case 'add': dialogService.Dialog.WithTemplateAndController("AddDeliveryDialog.html", "addDeliveryController", enums.ModalSize.Large, param);
						break;
					case 'edit':
						dialogService.Dialog.WithTemplateAndControllerInstance("AddDeliveryManualDialog.html",
							"addDeliveryManualController", enums.ModalSize.Large, param);
						break;
					case 'view': dialogService.Dialog.WithTemplateAndController("ViewDeliveryManualDialog.html", "viewDeliveryManualController", enums.ModalSize.Large, param);
						break;
					case 'addManual':

						dialogService.Dialog.WithTemplateAndControllerInstance("AddDeliveryManualDialog.html",
							"addDeliveryManualController", enums.ModalSize.Large, param);


						break;

					default: dialogService.Dialog.WithTemplateAndController("AddDeliveryDialog.html", "addDeliveryController", enums.ModalSize.Large, param);
						break;
				}
			};

			function refreshRefinersDelivery() {
			    isFavorite = true;
			    baseService.Publish('shell:clearRefinerList', true);
			    loadRefiners();
			}

			function removeRefiner(refiner) {
				$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== refiner; });
				baseService.Publish('shell:uncheckRefiner', refiner);
				//searchViaRefiners();
				if (refiner.Parent === 'Keyword') {
					searchWord = '';
				}

				page = 1;
				$scope.delivery = [];

				baseService.RemoveFromGlobalRefiners(refiner);

				searchViaRefiners();
			};

			function removeSelectedRefiner(event, data) {
				page = 1;
				$scope.delivery = [];
				//if (data.IsDateRange) {
				//    $scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value.Parent !== data.Parent; });
				//} else {
				$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== data; });
				//}
				baseService.RemoveFromGlobalRefiners(data);
				//searchViaRefiners();
				baseService.IsBusy(true);

				searchViaRefiners();

			};

			function searchDelivery(rows, lastRow, selectedRefiners) {
				$scope.showGridLoader = true;

				var criteria = {
					RowsToReturn: rows,
					LastRowReturned: lastRow,
					SelectedRefiners: selectedRefiners,
					Page: page,
					Keyword: searchWord
				};

				deliveryService.getAll(criteria, onsearchDelivery_Completed);

				//////////////

				function onsearchDelivery_Completed(response) {

					var stillMoreData = true;
					initialLoad       = false;
					isFavorite        = false;
					typeAheadList     = [];

					if (response.Success) {
						if (response.Data.Deliveries.length !== 0) {

							typeAheadList = typeAheadList.concat(response.Data.Deliveries.map(function (c) { return c.ComplianceProgram; }));
							typeAheadList = arrayUnique(typeAheadList.concat(response.Data.Deliveries.map(function (c) { return c.Countries[0].CountryName })));

							baseService.PopulateTypeAHead(typeAheadList);

							if (page === 1) {
								$scope.delivery = response.Data.Deliveries;
							}
							else {
								$scope.delivery = $scope.delivery.concat(response.Data.Deliveries);
							}

							angular.forEach($scope.delivery, function (data) {
								if (data.RowStatus === 1) {
									data.Status = "New";
								}
								else if (data.RowStatus === 2) {
									data.Status = "Updated";
								}
							})

							lastRowReturned = response.Data.LastRowIdReturned;
							totalRows = response.Data.TotalRows;

							bindTypeAheadSearch();
						}
						else {
							stillMoreData = false;
							lastRowReturned = 0;
							totalRows = 0;
							$scope.delivery = response.Data.Deliveries;
						}
					}

					if ((page === 1 && response.Data.Deliveries.length < initialRowsToLoad) || (page > 1 && response.Data.Deliveries.length < itemsPerPage)) {
						stillMoreData = false;
					}

					$scope.deliveryGrid.data = angular.copy($scope.delivery);
					$scope.gridApi.infiniteScroll.dataLoaded(false, stillMoreData);
					$scope.showGridLoader = false;

					baseService.IsBusy(false);
				};
			};

			function searchDeliveryWorkflow(rows, lastRow, selectedRefiners) {
				$scope.showGridLoader = true;

				var criteria = {
					RowsToReturn: rows,
					LastRowReturned: lastRow,
					SelectedRefiners: selectedRefiners,
					Page: page,
					Keyword: searchWord
				};

				deliveryService.getAllDeliveryWorkflow(criteria, onSearchDeliveryWorkflow_Completed);

				function onSearchDeliveryWorkflow_Completed(response) {
					var stillMoreData = true;
					initialLoad       = false;
					isFavorite        = false;

					if (response.Success) {
						if (response.Data.WorkFlows.length !== 0) {
							if (page === 1) {
								$scope.deliveryWorkflow = response.Data.WorkFlows;
							}
							else {
								$scope.deliveryWorkflow = $scope.deliveryWorkflow.concat(response.Data.WorkFlows);
							}

							angular.forEach($scope.deliveryWorkflow, function (data) {
								if (data.RowStatus === 1) {
									data.Status = "New";
								}
								else if (data.RowStatus === 2) {
									data.Status = "Updated";
								}
							})

							lastRowReturned = response.Data.LastRowIdReturned;
							totalRows = response.Data.TotalRows;

						}
						else {
							stillMoreData = false;
							lastRowReturned = 0;
							totalRows = 0;
							$scope.deliveryWorkflow = response.Data.WorkFlows;

						}
					}


					if ((page === 1 && response.Data.WorkFlows.length < initialRowsToLoad) || (page > 1 && response.Data.WorkFlows.length < itemsPerPage)) {
						stillMoreData = false;
					}

					$scope.deliveryWorkflowGrid.data = angular.copy($scope.deliveryWorkflow);
					$scope.gridWorkflowApi.infiniteScroll.dataLoaded(false, stillMoreData);
					$scope.showGridLoader = false;

					baseService.IsBusy(false);
				};
			};

			function searchViaRefiners() {
				var selectedRefiners = [];

				if ($scope.selectedRefiners.length > 0) {
					angular.forEach($scope.selectedRefiners, function (refiner) {
						if (refiner.IsDateRange) {

							this.push({ RefinerType: refiner.Items[0].Type, RefinerValueId: refiner.Items[0].ValueString })
							this.push({ RefinerType: refiner.Items[1].Type, RefinerValueId: refiner.Items[1].ValueString })

						} else {
							this.push({ RefinerType: refiner.Type, RefinerValueId: refiner.Id })
						}

					}, selectedRefiners);
				}
				page = 1;

				if (!$scope.displayWorkflow) {
					searchDelivery(initialSearchLimit, 0, selectedRefiners);
				} else {
					searchDeliveryWorkflow(initialSearchLimit, 0, selectedRefiners);
				}

			};

			function setupGridParameters() {
				setupColumns();

				$scope.deliveryGrid = deliveryGrid();

				//////////////

				function deliveryGrid() {
					return {
						enableSorting: true,
						enableColumnResizing: true,
						columnDefs: columns,
						infiniteScrollRowsFromEnd: 10,
						infiniteScrollUp: false,
						infiniteScrollDown: true,
						onRegisterApi: function (gridApi) {
							$scope.gridApi = gridApi;
							gridApi.infiniteScroll.on.needLoadMoreData($scope, loadMore);
							gridApi.selection.on.rowSelectionChanged($scope, gridSelectionChanged);
							gridApi.selection.on.rowSelectionChangedBatch($scope, gridBatchSelectionChanged);
						}
					};

					//////////////

					function gridBatchSelectionChanged(data) {
						$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
					};

					function gridSelectionChanged(data) {
						$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
					};

					function loadMore() {
						page = page + 1;
						$scope.showGridLoader = true;
						$scope.gridApi.infiniteScroll.saveScrollPercentage();
						searchDelivery(lastRowReturned + 10, lastRowReturned, []);
						//getDelivery();
						$scope.gridApi.infiniteScroll.dataLoaded();
					};
				}

				function setupColumns() {
					var headerModel = {
						Header: function (title, field, width) {
							return {
								Title: title,
								Field: field,
								Width: width,
								SorReverse: false
							}
						},

						Set: function (title, field, width) {
							var self = this;
							return self.Header(title, field, width);
						}
					}

					if (globalUtility.ContentAdmin || globalUtility.Coordinator || globalUtility.Contributor) {
						columns = [
							//{
							//    name: 'Copy',
							//    width: '55',
							//    cellTemplate: '<span class="fa fa-clipboard text-align-center" ng-click="grid.appScope.CopyDelivery(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
							//    enableSorting: false
							//},
							{
								name: 'Edit',
								width: '55', //ng-if="(row.entity.Manual) == \'True\'"
								cellTemplate: '<div ng-if="(row.entity.Manual) == \'True\'"><span class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.editDelivery(row.entity)" style="cursor: pointer; padding-left:18px;"></span></div>',
								enableSorting: false
							},
							{
								name: '  ',
								width: '18%',
								//cellTemplate: '<span class="fa text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.ViewDeliveryManual(row.entity)"><a href="https://smartinsightsit.ul.com/#/main">View Manual</a><b style="color:red;margin-left:15px">*New*</b></span>',
								cellTemplate: //'<div ng-if="(row.entity.Manual) == \'N/A\'">'+
								'<div>' +
								'<div ng-if="(row.entity.Manual) == \'False\'">' +
								'<center><button class="btn btn-primary text-align-center" type="button" ng-click="grid.appScope.addDeliveryManual(row.entity)">' +
								'<i class="fa fa-plus"></i>Create Manual</button></center></div>'
								+

								'<div ng-if="(row.entity.Manual) == \'True\'" class="text-align-center">' +
								'<div><a style="padding-left:5px;"><span style="cursor:pointer" class="text-align-center" ng-click="grid.appScope.openDeliveryManual(row.entity)">View Manual</span></a> ' +

								'<b ng-if="(row.entity.RowStatus) === 1 || (row.entity.RowStatus) === 2" style="color:red;">*{{row.entity.Status}}*</b>' +

								'</div>'
								,
								enableSorting: false
							},
							//{
							//    name: '   ',
							//    width: '80',
							//    cellTemplate: '<div ng-if="(row.entity.IsNew) == true"><b style="color:red">*New*</b></div>',
							//    enableSorting: false
							//},
							{
								field: 'DeliveryItemId',
								name: 'ID',
								width: '15%',
								cellTemplate:
								'<div><a style="padding-left:5px;"><span style="cursor:pointer" ng-click="grid.appScope.openDeliveryManual(row.entity)">{{row.entity.DeliveryItemId}}</span></a></div>',
								enableSorting: true
							}
						];


						if (globalUtility.ContentAdmin) {
							var deleteColumn =
								{
									name: 'Delete',
									width: '70', // ng-if="(row.entity.Manual) == \'True\'"
									cellTemplate: '<div ng-if="(row.entity.Manual) == \'True\'"><span class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.deleteDelivery(row.entity)"></span></div>',

									//'<div><span class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.DeleteDelivery(row.entity)"></span></div>',
									enableSorting: false
								};

							columns.splice(1, 0, deleteColumn);
						}
					}
					else if (globalUtility.Reader || globalUtility.TranslatorJapanese || globalUtility.TranslatorChinese) {
						columns = [
							{
								name: '  ',
								width: '18%',
								cellTemplate:
								'<div ng-if="(row.entity.Manual) == \'True\'" class="text-align-center">' +
								'<div><a style="padding-left:5px;"><span style="cursor:pointer" class="text-align-center" ng-click="grid.appScope.openDeliveryManual(row.entity)">View Manual</span></a> ' +

								'<b ng-if="(row.entity.RowStatus) === 1 || (row.entity.RowStatus) === 2" style="color:red;">*{{row.entity.Status}}*</b>' +

								'</div>'
								,
								enableSorting: false
							}
						];
					}
					else {
						columns = [];
					}

					headers.push(headerModel.Set("Region", "Region", "18%"));
					headers.push(headerModel.Set("Regional Economic Union", "RegionalEconomicUnion", "18%"));
					headers.push(headerModel.Set("Country", "SelectedCountry", "18%"));
					headers.push(headerModel.Set("Compliance Program", "ComplianceProgram", "18%"));
					headers.push(headerModel.Set("Regulatory Category", "SelectedSectorRegulated", "18%"));
					headers.push(headerModel.Set("Certification Organization", "CertificationOrganization", "18%"));
					headers.push(headerModel.Set("Deliverable", "SelectedComplianceModel", "18%"));
					headers.push(headerModel.Set("Mandatory or Voluntary", "MandatoryOrVoluntary", "18%"));
					headers.push(headerModel.Set("Modular Approval", "ModularApproval", "18%"));
					headers.push(headerModel.Set("Accepted Test Reports", "SelectedAcceptedTestReports", "18%"));
					headers.push(headerModel.Set("Application Type", "ApplicationType", "18%"));
					headers.push(headerModel.Set("Sample Requirement", "SampleRequirement", "18%"));
					headers.push(headerModel.Set("In-Country Testing", "InCountryTesting", "18%"));
					headers.push(headerModel.Set("Testing Organization", "TestingOrganization", "18%"));
					headers.push(headerModel.Set("Local Representative", "LocalRepresentative", "18%"));
					headers.push(headerModel.Set("Local Representative Service", "LocalRepresentativeService", "18%"));
					headers.push(headerModel.Set("Certificate Validity Period", "CertificateValidityPeriod", "18%"));
					headers.push(headerModel.Set("Lead Time", "LeadTime", "18%"));
					headers.push(headerModel.Set("Preferred Channel", "SelectedPreferredChannel", "18%"));

					angular.forEach(headers, function (item) {
						var temp = {
							field: item.Field,
							name: item.Title,
							width: item.Width
						}
						this.push(temp);
					}, columns);
				}
			};

			function setupWorkflowGridParameters() {
				setupWorkflowColumns();

				$scope.deliveryWorkflowGrid = deliveryWorkflowGrid();

				//////////////

				function deliveryWorkflowGrid() {
					return {
						enableSorting: true,
						enableColumnResizing: true,
						columnDefs: workflowColumns,
						infiniteScrollRowsFromEnd: 10,
						infiniteScrollUp: false,
						infiniteScrollDown: true,
						onRegisterApi: function (gridWorkflowApi) {
							$scope.gridWorkflowApi = gridWorkflowApi;
							gridWorkflowApi.infiniteScroll.on.needLoadMoreData($scope, loadMoreWorkflow);
							gridWorkflowApi.selection.on.rowSelectionChanged($scope, gridWorkflowSelectionChanged);
							gridWorkflowApi.selection.on.rowSelectionChangedBatch($scope, gridWorkflowBatchSelectionChanged);
						}
					};

					//////////////

					function gridWorkflowBatchSelectionChanged(data) {
						$scope.gridWorkflowSelections = angular.copy($scope.gridWorkflowApi.selection.getSelectedRows());
					};

					function gridWorkflowSelectionChanged(data) {
						$scope.gridWorkflowSelections = angular.copy($scope.gridWorkflowApi.selection.getSelectedRows());
					};

					function loadMoreWorkflow() {
						page = page + 1;
						$scope.showGridLoader = true;
						$scope.gridWorkflowApi.infiniteScroll.saveScrollPercentage();
						searchDeliveryWorkflow(lastRowReturned + 10, lastRowReturned, []);
						//getDelivery();
						$scope.gridWorkflowApi.infiniteScroll.dataLoaded();
					};
				}

				function setupWorkflowColumns() {
					var headerModel = {
						Header: function (title, field, width) {
							return {
								Title: title,
								Field: field,
								Width: width,
								SorReverse: false
							}
						},

						Set: function (title, field, width) {
							var self = this;
							return self.Header(title, field, width);
						}
					}

					if (globalUtility.ContentAdmin || globalUtility.Coordinator || globalUtility.Contributor || globalUtility.TranslatorJapanese || globalUtility.TranslatorChinese || globalUtility.Reader) {
						workflowColumns = [
							{
								name: 'View',
								width: '10%',
								cellTemplate:
								'<div><a style="padding-left:5px;"><span style="cursor:pointer" class="text-align-center" ng-click="grid.appScope.viewWorkflowDetails(row.entity)">View Details</span></a> ' +
								'</div>'
								,
								enableSorting: false
							}
						];
					}
					else {
						workflowColumns = [];
					}
					workflowHeaders.push(headerModel.Set("Regulatory Category", "SectorsRegulated", "18%"));
					workflowHeaders.push(headerModel.Set("Region", "Region", "18%"));
					workflowHeaders.push(headerModel.Set("Country", "CountryName", "18%"));
					workflowHeaders.push(headerModel.Set("Compliance Program", "ComplianceProgram", "18%"));
					workflowHeaders.push(headerModel.Set("Workflow Status", "WorkFlowStatus", "18%"));
					workflowHeaders.push(headerModel.Set("Date Submitted", "CreatedDate", "18%"));

					angular.forEach(workflowHeaders, function (item) {
						var temp = {
							field: item.Field,
							name: item.Title,
							width: item.Width
						}
						this.push(temp);
					}, workflowColumns);
				}
			};
			/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			//$scope.HasSelection = function () {
			//    var checkedItems = $filter('filter')($scope.delivery, function (value, index) { return value.IsChecked === true; });
			//    $scope.hasSelection = (checkedItems.length > 0);
			//};

			function viewWorkflowDetails(value) {
				var params = {
					CountryName: value.CountryName,
					CountryIds: value.GeoItemId,
					CountryTradeGroup: value.CountryTradeGroup,
					CountryTradeGroupId: value.CountryTradeGroupId,
					SectorsRegulated: value.SectorsRegulated,
					CoveredSectorId: value.CoveredSectorId,
					ComplianceProgram: value.ComplianceProgram,
					ComplianceProgramId: value.ComplianceProgramId,
					Scope: enums.ModuleType.Delivery,
					WorkflowDetails: value.Details,
					WorkflowLink: value.Link,
					WorkflowItemId: value.DeliveryItemId,
					ParentDeliveryId: value.ParentDeliveryId,
					ItemFiles: value.ItemFiles
				};


				if (value.ChangeRequest) {
					dialogService.Dialog.WithTemplateAndController("changeRequestDetails.tpl.html", "changeRequestDetailsController", enums.ModalSize.Medium, params);
				}
				else {
					dialogService.Dialog.WithTemplateAndController("ViewDeliveryChangeRequestDetails.html", "deliveryChangeRequestDetailsController", enums.ModalSize.Large, params);
				}
			}
			$scope.$on('$destroy', function () {
				var events = ['shell:addSelectedRefiner', 'shell:removeSelectedRefiner', 'delivery:addDelivery', 'delivery:addDeliveryManual',
					'delivery:downloadDelivery', 'shell:refinerSetCompleted', 'shell:clearAllSelectedRefiners', 'shell:loadPreselectedRefiners', 'shell:refreshRefinersDelivery'];
				baseService.UnSubscribe(events);
			});
		}]);
});
