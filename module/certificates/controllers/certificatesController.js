
define([
	'app',
	'globalUtility',
	'enums',
	'routeResolver',
	'shell/model/refinerModel',
	'module/certificates/model/certificateModel',
	'module/certificates/model/headerModel'
], function (app, globalUtility, enums, routeResolver, refinerModel, certificateModel, headerModel) {

	app.register.controller('certificatesController', ['$scope', '$http', '$rootScope', '$filter', '$timeout', '$window', 'baseService', 'dialogService', 'bsAlertService', 'exportService', 'certificatesService',
		function ($scope, $http, $rootScope, $filter, $timeout, $window, baseService, dialogService, bsAlertService, exportService, certificatesService) {

			$scope.selectedRefiners        = [];
			$scope.saveSearches            = [];
			$scope.certificates            = [];
			$scope.saveSearches            = [];
			$scope.references              = [];
			$scope.hasSelection            = false;
			$scope.showGridLoader          = false;
			var certificateDS              = [];
			var initialSearchLimit         = 200;
			var isOnload                   = true;
			var isSetRefinerSouceCompleted = false;
			var currentTotalRow            = 0;
			var lastRowIDReturned          = 0;
			var totalRows                  = 0;
			var initialLoad                = true;
			var isFavorite                 = false;

			$scope.canAddCertificate = false;
			$scope.isReader = globalUtility.Reader;
			$scope.isTranslatorJapanese = globalUtility.TranslatorJapanese;
			$scope.isTranslatorChinese = globalUtility.TranslatorChinese;

			if (globalUtility.Contributor || globalUtility.Coordinator || globalUtility.ContentAdmin) {
				$scope.canAddCertificate = true;
			}

			var refinerType = {
				Country: 'Country',
				Region: 'Region',
				CertScheme: 'CertScheme',
				CoveredSector: 'CoveredSector',
				Company: 'Company',
				CertStatus: 'CertStatus',
				CertBusinessStatus: 'CertBusinessStatus',
				IssueStartDateTime: 'IssueStartDateTime',
				IssueEndDateTime: 'IssueEndDateTime',
				ExpirationStartDateTime: 'ExpirationStartDateTime',
				ExpirationEndDateTime: 'ExpirationEndDateTime',
				Keyword: "Keyword"
			};

			$scope.headers = [];


			function init() {
			    if (initialLoad) {
			        baseService.Subscribe('shell:refreshRefinersCertificates', refreshRefinersCertificates);
			        baseService.Subscribe('shell:addSelectedRefiner', addSelectedRefiner);
			        baseService.Subscribe('shell:removeSelectedRefiner', removeSelectedRefiner);
			        baseService.Subscribe('shell:removeSelectedRefiner2', removeSelectedRefiner2);
			        baseService.Subscribe('shell:refinerSetCompleted', onSetRefinerSourceCompleted);
			        baseService.Subscribe('certificates:addCertificates', onAddCertifates);
			        baseService.Subscribe('certificates:downloadCertificates', Download);
			        baseService.Subscribe('shell:clearAllSelectedRefiners', function () {
			            $scope.selectedRefiners = [];
			        });
			    }

				$scope.headers.push(headerModel.Set("Project/Order #", "OrderNumber", "12%"));
				$scope.headers.push(headerModel.Set(" ", " ", "10%", '<a style="padding-left:5px;"><span style="cursor:pointer" ng-click="grid.appScope.OpenCertificate(row.entity)">View Document</span></a>'));
				$scope.headers.push(headerModel.Set("Certificate Number", "CertificateNumber", "13%"));
				$scope.headers.push(headerModel.Set("Compliance Program", "CertificateSchemaName", "15%"));
				$scope.headers.push(headerModel.Set("Regulatory Category", "SectorNames", "14%"));
				$scope.headers.push(headerModel.Set("Region", "RegionNames", "10%"));
				$scope.headers.push(headerModel.Set("Country", "CountryName", "18%"));
				$scope.headers.push(headerModel.Set("Certification Organization", "CertificateOrganizationName", "16%"));
				$scope.headers.push(headerModel.Set("Manufacturer", "Manufacturer", "18%"));
				$scope.headers.push(headerModel.Set("Customer", "CompanyName", "18%"));
				$scope.headers.push(headerModel.Set("License Holder", "LicenseHolder", "15%"));
				$scope.headers.push(headerModel.Set("Factory", "Factory", "18%"));
				$scope.headers.push(headerModel.Set("Model", "Model", "12%"));
				$scope.headers.push(headerModel.Set("Brand Name", "BrandName", "12%"));
				$scope.headers.push(headerModel.Set("Issue Date", "IssueDateDisplayText", "10%"));
				$scope.headers.push(headerModel.Set("Expiration Date", "ExpirationDateDisplayText", "12%"));
				$scope.headers.push(headerModel.Set("Status (Certificate)", "CertificateStatusType", "12%"));
				$scope.headers.push(headerModel.Set("Status (Business)", "CertificateBusinessStatusType", "12%"));
				$scope.headers.push(headerModel.Set("Agent", "AgentName", "10%"));
				$scope.headers.push(headerModel.Set("Subcontractor", "SubContractorName", "18%"));
				$scope.headers.push(headerModel.Set("PoC Region", "POC", "18%"));
				$scope.headers.push(headerModel.Set("Product Type", "ProductTypeName", "10%"));
				$scope.headers.push(headerModel.Set("Product SubType", "ProductSubTypeName", "12%"));
				$scope.headers.push(headerModel.Set("Wireless Technology", "WirelessNames", "14%"));
				$scope.headers.push(headerModel.Set("Standards (Effective Date - Obsolete Date)", "StandardNames", "25%"));

				angular.forEach($scope.headers, function (item) {
					var temp = null;
					this.push({
						field: item.Field,
						name: item.Title,
						width: item.Width,
						cellTemplate: item.CellTemplate,
						enableColumnMenus: false
					})
				}, $scope.columns);

				$scope.modalTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "certificatesModal");
				$scope.viewCertificateFileTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "viewCertificateFilesModal");
				$scope.applications = globalUtility.ClientApps;
				initiallizeItems();
			};

			var initiallizeItems = function () {
				$scope.selectedRefiners = [];
				$scope.saveSearches = [];
				var certificateDS = [];
				//var initialSearchLimit = 100;
				$scope.certificates = [];
				$scope.saveSearches = [];
				$scope.references = [];
				$scope.hasSelection = false;
				//$scope.showGridLoader = false;
				//var lastRowRetuned = 0;
				var totalRows = 0;

				baseService.SearchBarVisibility(true);
				baseService.IsBusy(true);
				if (!globalUtility.HasGlobalRefiners()) searchCertificates(initialSearchLimit, 0, []);
				loadRefiners();
				//baseService.Publish('shell:loadPreselectedRefiners');
				//loadPreselectedRefiners();
			};

			function refreshRefinersCertificates() {
			    isFavorite = true;
			    baseService.Publish('shell:clearRefinerList', true);
			    loadRefiners();
			}

			function loadRefiners() {
			    certificatesService.GetAllRefiners(onGetRefiners_Completed);
			}

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

			$scope.ShowCheck = function (item) {

				return item.IsExpirationDateApplicable ? false : true;
			};

			$scope.LoadMore = function () {

				//$scope.showGridLoader = true;

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

				searchCertificates(20, lastRowIDReturned, selectedRefiners);

				$scope.gridApi.infiniteScroll.dataLoaded();
			};

			var searchCertificates = function (rows, lastRowId, selectedRefiners) {
				var dataTemp = [];
				var responseTemp = [];

				if (lastRowId == 0 || currentTotalRow != totalRows) {
					currentTotalRow = currentTotalRow + rows;
					currentTotalRow = lastRowId == 0 || currentTotalRow <= totalRows ? currentTotalRow : totalRows;
					var criterea = {
						RowsToReturn: currentTotalRow,
						LastRowReturned: lastRowId,
						SelectedRefiners: selectedRefiners
					};


					$scope.showGridLoader = true;
					// certificatesService.GetAll(criterea, onSearchCertificates_Completed);
					var index = -1;
					for (var i = 0; i < criterea.SelectedRefiners.length; ++i) {
						if (criterea.SelectedRefiners[i].RefinerType == "Keyword") {
							index = i;
							break;
						}
					}

					if (index != -1) {
						var str = criterea.SelectedRefiners[index].RefinerValueId;
						var n = str.indexOf(",");
						if (n != -1) {
							var arrayStr = str.split(',');
							async.map(arrayStr, exeCertificateService, function (err, results) {

								console.log("Finished!");
							});

							function exeCertificateService(key, doneCallback) {
								console.log(key.trim());

								var vr = [];
								var vRefiners = {
									RefinerType: criterea.SelectedRefiners[index].RefinerType,
									RefinerValueId: key.trim()
								};
								vr.push(vRefiners);
								var datam = {
									LastRowReturned: criterea.LastRowReturned,
									SelectedRefiners: vr,
									RowsToReturn: criterea.RowsToReturn
								};
								console.log(datam);
								certificatesService.GetAll(datam, function (response) {
									if (response.Success === true && response.Data.Certificates.length !== 0) {
										responseTemp = response;
										dataTemp = dataTemp.concat(response.Data.Certificates);
										responseTemp.Data.Certificates = dataTemp;
										onSearchCertificates_Completed(responseTemp);
									}
									return doneCallback(null);
								});

							}

						}
						else {
							certificatesService.GetAll(criterea, onSearchCertificates_Completed);
						}

					} else {
						certificatesService.GetAll(criterea, onSearchCertificates_Completed);
					}
				} else {
					$scope.showGridLoader = false;
				}
			};

			var setUnAvailableRefinerFromSearchWizard = function (itemSource) {
				var DS = [],
					parent = "",
					selectedItems = [];

				if (globalUtility.SelectedSector != "" && isOnload) {
					parent = "REGULATORY CATEGORY";
					selectedItems = $filter('filter')(itemSource, function (value, index) { return value.Parent == parent; });
					if (selectedItems.length > 0) {
						angular.forEach(globalUtility.SelectedSector, function (item) {
							var isExist = false;

							angular.forEach(selectedItems, function (selItem) {
								if (item.CoveredSectorId == selItem.Id) isExist = true;
							});
							if (!isExist) this.push(refinerModel.Item(refinerType.CoveredSector, item.CoveredSectorId, item.CoveredSector, parent, true));
						}, DS);
					}

				}
				if (globalUtility.SelectedCountry != "" && isOnload) {
					parent = "COUNTRY"
					selectedItems = $filter('filter')(itemSource, function (value, index) { return value.Parent == parent; });
					if (selectedItems.length > 0) {
						angular.forEach(globalUtility.SelectedCountry, function (item) {
							var isExist = false;
							angular.forEach(selectedItems, function (selItem) {
								if (item.id == selItem.Id) isExist = true;
							});
							if (!isExist) this.push(refinerModel.Item(refinerType.Country, item.id, item.label, parent, true));
						}, DS);
					}
				}

				if (globalUtility.SelectedRegion != "" && isOnload) {
					parent = "REGION"
					selectedItems = $filter('filter')(itemSource, function (value, index) { return value.Parent == parent; });
					if (selectedItems.length > 0) {
						angular.forEach(globalUtility.SelectedRegion, function (item) {
							var isExist = false;
							angular.forEach(selectedItems, function (selItem) {
								if (item.RegionId == selItem.Id) isExist = true;
							});
							if (!isExist) this.push(refinerModel.Item(refinerType.Region, item.RegionId, item.RegionName, parent, true));
						}, DS);
					}
				}

				if (globalUtility.SelectedComplianceProgram != "" && isOnload) {
					parent = "COMPLIANCE PROGRAM"
					selectedItems = $filter('filter')(itemSource, function (value, index) { return value.Parent == parent; });
					if (selectedItems.length > 0) {
						angular.forEach(globalUtility.SelectedComplianceProgram, function (item) {
							var isExist = false;
							angular.forEach(selectedItems, function (selItem) {
								if (item.Id == selItem.Id) isExist = true;
							});
							if (!isExist) this.push(refinerModel.Item(refinerType.CertScheme, item.SchemaId, item.SchemaName, parent, true));
						}, DS);
					}
				}

				if (globalUtility.SelectedCustomer != "" && isOnload) {
					parent = "CUSTOMER"
					selectedItems = $filter('filter')(itemSource, function (value, index) { return value.Parent == parent; });
					if (selectedItems.length > 0) {
						angular.forEach(globalUtility.SelectedCustomer, function (item) {
							var isExist = false;
							angular.forEach(selectedItems, function (selItem) {
								if (item.id == selItem.Id) isExist = true;
							});
							if (!isExist) this.push(refinerModel.Item(refinerType.Company, item.id, item.label, parent, true));
						}, DS);
					}
				}

				if (DS.length > 0) {
					angular.forEach(DS, function (item) {
						$scope.selectedRefiners.push(item);

						baseService.AddToGlobalRefiners(item);
					});
				}
			};

			var onGetRefiners_Completed = function (response) {
				var refinerDS = [], items = [], parent = "", itemsCopy = [];

				var pushItemsCopy = function (toCopy) {
					angular.forEach(toCopy, function (itemToCopy) {
						this.push(itemToCopy);
					}, itemsCopy);

				};
				if (response.Data.Sectors.length > 0) {
					items = [];
					parent = "REGULATORY CATEGORY";
					angular.forEach(response.Data.Sectors, function (item) {
						var checked = false;
						if (globalUtility.SelectedSector != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedSector, function (value, index) { return value.CoveredSectorId == item.CoveredSectorId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CoveredSector, item.CoveredSectorId, item.CoveredSector, parent, checked));;
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}
				if (response.Data.Regions.length > 0) {
					items = [];
					parent = "REGION";
					angular.forEach(response.Data.Regions, function (item) {

						var checked = false;
						if (globalUtility.SelectedRegion != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedRegion, function (value, index) { return value.RegionId == item.RegionId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.Region, item.RegionId, item.RegionName, parent, checked));

					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}
				if (response.Data.Countries.length > 0) {
					items = [];
					parent = "COUNTRY";

					angular.forEach(response.Data.Countries, function (item) {

						var checked = false;
						if (globalUtility.SelectedCountry != "" && isOnload) {

							var temp = $filter('filter')(globalUtility.SelectedCountry, function (value, index) {
								return value.id == item.CountryItemId;
							});
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.Country, item.CountryItemId, item.CountryName, parent, checked));
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}
				if (response.Data.CertificateSchemes.length > 0) {
					items = [];
					parent = "COMPLIANCE PROGRAM";
					angular.forEach(response.Data.CertificateSchemes, function (item) {
						var checked = false;
						if (globalUtility.SelectedComplianceProgram != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedComplianceProgram, function (value, index) { return value.Id == item.SchemaId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CertScheme, item.SchemaId, item.SchemaName, parent, checked));
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}
				if (response.Data.Companies.length > 0) {
					items = [];
					parent = "CUSTOMER";
					angular.forEach(response.Data.Companies, function (item) {
						var checked = false;
						if (globalUtility.SelectedCustomer != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedCustomer, function (value, index) { return value.id == item.CompanyItemId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.Company, item.CompanyItemId, item.CompanyName, parent, checked));
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}
				if (response.Data.CertificateStatus.length > 0) {
					items = [];
					parent = "STATUS (CERTIFICATE)";
					angular.forEach(response.Data.CertificateStatus, function (item) {
						var checked = false;
						if (globalUtility.SelectedCertStatus != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedCertStatus, function (value, index) { return value.Id == item.StatusTypeId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CertStatus, item.StatusTypeId, item.StatusName, parent, checked));
					}, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}
				if (response.Data.CertificateBusinessStatus.length > 0) {
					items = [];
					parent = "STATUS (BUSINESS)";
					angular.forEach(response.Data.CertificateBusinessStatus, function (item) {
						var checked = false;
						if (globalUtility.SelectedCertBusinessStatus != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedCertBusinessStatus, function (value, index) { return value.Id == item.CertificateBusinessStatusTypeId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CertBusinessStatus, item.CertificateBusinessStatusTypeId, item.CertificateBusinessStatusType, parent, checked));
					}, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}
				items = [];
				parent = "ISSUE DATE";

				var issueDateRange = refinerModel.SetDateRange(refinerType.IssueStartDateTime, refinerType.IssueEndDateTime, parent);
				if (globalUtility.SelectedIssueStartDateTime != "" && isOnload) {
					issueDateRange.Items[0].Value = globalUtility.SelectedIssueStartDateTime[0].Id;
					issueDateRange.Items[0].ValueString = globalUtility.SelectedIssueStartDateTime[0].Id;
				}
				if (globalUtility.SelectedIssueEndDateTime != "" && isOnload) {
					issueDateRange.Items[1].Value = globalUtility.SelectedIssueEndDateTime[0].Id;
					issueDateRange.Items[1].ValueString = globalUtility.SelectedIssueEndDateTime[0].Id;
				}

				items.push(issueDateRange);
				refinerDS.push(refinerModel.Set(parent, items, true));

				if (globalUtility.SelectedIssueStartDateTime != "" && globalUtility.SelectedIssueEndDateTime != "") {
					baseService.Publish('shell:addSelectedRefiner', issueDateRange);
				}

				items = [];
				parent = "EXPIRATION DATE";

				var expirationDateRange = refinerModel.SetDateRange(refinerType.ExpirationStartDateTime, refinerType.ExpirationEndDateTime, parent);
				if (globalUtility.SelectedExpirationStartDateTime != "" && isOnload) {
					expirationDateRange.Items[0].Value = globalUtility.SelectedExpirationStartDateTime[0].Id;
					expirationDateRange.Items[0].ValueString = globalUtility.SelectedExpirationStartDateTime[0].Id;
				}
				if (globalUtility.SelectedExpirationEndDateTime != "" && isOnload) {
					expirationDateRange.Items[1].Value = globalUtility.SelectedExpirationEndDateTime[0].Id;
					expirationDateRange.Items[1].ValueString = globalUtility.SelectedExpirationEndDateTime[0].Id;
				}

				items.push(expirationDateRange);
				refinerDS.push(refinerModel.Set(parent, items, true));

				if (globalUtility.SelectedExpirationStartDateTime != "" && globalUtility.SelectedExpirationEndDateTime != "") {
					baseService.Publish('shell:addSelectedRefiner', expirationDateRange);
				}

				var keywordRefiner = globalUtility.GetPreselectedKeywordRefiner();
				if (keywordRefiner != undefined) baseService.Publish('shell:addSelectedRefiner', keywordRefiner);

				setUnAvailableRefinerFromSearchWizard(itemsCopy);

				baseService.Publish('shell:setRefinerDataSource', refinerDS);
				baseService.IsBusy(false);
			};


			var onSetRefinerSourceCompleted = function (event, data) {
				isSetRefinerSouceCompleted = true;
				searchViaRefiners();
			};

			var onSearchCertificates_Completed = function (response) {

				if (response.Success) {
					lastRowIDReturned = response.Data.LastRowIdReturned;
					totalRows = response.Data.TotalRows;

					$scope.certificates = certificateModel.Set(response.Data.Certificates);

					var searchDS = [];

					angular.forEach($scope.certificates, function (item) {
						this.push(item.CertificateNumber);
						this.push(item.CompanyName);
					}, searchDS);

					baseService.PopulateTypeAHead(arrayUnique(searchDS));
					bindTypeAheadSearch();
				}
				else {
					lastRowIDReturned = 0;
					currentTotalRow = 0;
					totalRows = 0;
					$scope.certificates = [];
					bsAlertService.Show(response.ErrorMessage, enums.AlertType.Error);
				}
				$scope.certificatesGrid.data = angular.copy($scope.certificates);
				//$scope.gridApi.infiniteScroll.dataLoaded();
				$scope.showGridLoader = false;
				initialLoad           = false;
				isFavorite            = false;

				baseService.IsBusy(false);
			};



			var bindTypeAheadSearch = function () {

				var channel = new kernel.messaging.channel(window.parent);

				var subscriber = new kernel.messaging.subscriber('Certificates', 'searchFilter', function (command) {
					var searchWord = command.arg;
					Search(searchWord);
				});

				channel.register(subscriber);

			};
			var Search = function (searchWord) {

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
					searchCertificates(initialSearchLimit, 0, []);
				}
				else {
					$scope.$apply();
					if (!isExist) {
						var data = {
							Type: refinerType.Keyword,
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

			var mode = enums.Mode.Add;
			var paramData = [];
			var openModal = function () {
				var param = {
					Mode: mode,
					Data: (mode == enums.Mode.Add) ? null : paramData,
					LookUps: globalUtility.CertificateLookups
				};
				dialogService.Dialog.WithTemplateAndController("AddCertificateDialog.html", "addCertificateController", enums.ModalSize.Large, param);

			};

			var Download = function (event, data) {
				var onSucces = function (response) {

					if (response.Message == enums.ResponseType.Success) {
						var blob = new Blob([response.Data], { type: "application/octet-stream" });
						saveAs(blob, data.FileName);
					}
					baseService.IsBusy(false);
				};
				certificatesService.DownloadFile(
					{
						FileName: data.FileName,
						CertificateItemId: data.CertificateItemId,
						SubFolder: data.SubFolder
					},
					onSucces);
			};
			$scope.OpenCertificate = function (item) {
				var onSuccess = function (response) {
					if (response.IsSuccess) {

						if (response.DocumentPaths.FileUploadStatus === 1) {
							baseService.IsBusy(false);
							dialogService.Dialog.Alert("One or more documents for this certificate are still being processed. Please try again in a few moments.", enums.MessageType.Success);
							return;
						}

						if (response.DocumentPaths.FileUploadStatus === 3) {
							baseService.IsBusy(false);
							dialogService.Dialog.Alert("One or more documents for this certificate failed to upload. Please try uploading again.", enums.MessageType.Error);
							return;
						}

						if (response.DocumentPaths.PrimaryFiles.length == 0 && response.DocumentPaths.RelatedFiles.length == 0) {
							baseService.IsBusy(false);
							dialogService.Dialog.Alert("No Document Found!", enums.MessageType.Success);

							return;
						}
						if (response.DocumentPaths.RelatedFiles.length == 0) {
							baseService.IsBusy(true);
							Download(null, {
								FileName: response.DocumentPaths.PrimaryFiles[0],
								SubFolder: "PrimaryFiles",
								CertificateItemId: item.CertificateItemId
							});

							return;
						}
						var params = {
							DocumentPaths: response.DocumentPaths,
							CertificateItemId: item.CertificateItemId
						};
						dialogService.Dialog.WithTemplateAndController("viewCertificateFilesDialog.html", "viewCertificateFilesController", enums.ModalSize.Small, params);
					}
					baseService.IsBusy(false);
				};
				var param = {
					CertificateItemId: item.CertificateItemId
				};
				baseService.IsBusy(true);
				certificatesService.GetSourceDocuments(param, onSuccess);

			};

			var onGetLookUps_Completed = function (response) {
				baseService.IsBusy(false);
				globalUtility.CertificateLookups = response.Data;
				openModal();
			};

			$scope.AddCertificate = function () {
				mode = enums.Mode.Add;
				if (globalUtility.CertificateLookups) {
					openModal();
				} else {
					baseService.IsBusy(true);
					certificatesService.GetAllLookups(onGetLookUps_Completed);
				}
			};

			$scope.EditCertificate = function (data) {
				mode = enums.Mode.Edit;
				paramData = data;
				if (globalUtility.CertificateLookups) {
					openModal();
				} else {
					baseService.IsBusy(true);
					certificatesService.GetAllLookups(onGetLookUps_Completed);
				}
			};
			$scope.RenewCertificate = function (data) {
				mode = enums.Mode.Renew;
				paramData = data;
				if (globalUtility.CertificateLookups) {
					openModal();
				} else {
					baseService.IsBusy(true);
					certificatesService.GetAllLookups(onGetLookUps_Completed);
				}
			};
			$scope.CopyCertificate = function (data) {
				mode = enums.Mode.Copy;
				paramData = data;
				if (globalUtility.CertificateLookups) {
					openModal();
				} else {
					baseService.IsBusy(true);
					certificatesService.GetAllLookups(onGetLookUps_Completed);
				}
			};

			var onDeleteCertificate_Completed = function (response) {
				baseService.IsBusy(false);
				bsAlertService.Show(response.Success ? response.Data.Message : response.ErrorMessage,
					response.Success ? enums.AlertType.Success : enums.AlertType.Error);

				if (response.Success) {
					var certificateItem = $filter('filter')($scope.certificates, function (value, index) { return value.CertificateItemId == response.Data.CertificateItemId; });
					$scope.certificates = $filter('filter')($scope.certificates, function (value, index) { return value.CertificateItemId != response.Data.CertificateItemId; });
					$scope.certificatesGrid.data = angular.copy($scope.certificates);
					//certificatesService.GetAllRefiners(onGetRefiners_Completed);

					var onDeleteSuccess = function (res) {
						if (!res.IsSuccess) console.log('Error Deleting Documents');
					}
					var param = { certificateItemId: certificateItem[0].CertificateItemId };
					certificatesService.DeleteALLSourceDocuments(param, onDeleteSuccess)

					if ($scope.certificates.length == 0 && $scope.selectedRefiners.length > 0) {
						$scope.selectedRefiners = [];
						loadRefiners();
					//	baseService.Publish('shell:uncheckRefiner', $scope.selectedRefiners);
						//baseService.Publish('shell:removeSelectedRefiner2', $scope.selectedRefiners);
					//	removeSelectedRefiner2($scope.selectedRefiners);
						//initiallizeItems();
					}
				}
			};

			$scope.DeleteCertificate = function (data) {
				var callBack = function (response) {
					if (response == enums.CallbackType.Yes) {
						var param = {
							certificateItemId: data.CertificateItemId
						};
						certificatesService.DeleteCertificate(param, onDeleteCertificate_Completed);
						baseService.IsBusy(true);

						}
				}
				var message = "Are you sure you want to permanently delete the document? All related documents will also be deleted.";
				var title = "DELETE CERTIFICATE";

				dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);
			};

			$scope.removeRefiner = function (refiner) {
				$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== refiner; });
				baseService.Publish('shell:uncheckRefiner', refiner);
				baseService.RemoveFromGlobalRefiners(refiner);


				searchViaRefiners();
			};

			var searchViaRefiners = function () {

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
				currentTotalRow = 0;
				searchCertificates(initialSearchLimit, 0, selectedRefiners);
			};

			var addSelectedRefiner = function (event, data) {

				//if (data.IsDateRange) {
				//    var temp = $filter('filter')($scope.selectedRefiners, function (value, index) { return value.Parent == data.Parent; });
				//    if (temp.length == 0) {
				//        $scope.selectedRefiners.push(data);
				//        searchViaRefiners();
				//    }
				//}
			    //else {
				$scope.selectedRefiners.push(data);

				baseService.Publish('shell:addSelectedModuleRefiner', { Refiner: data });

				if (!initialLoad && !isFavorite) {
				    baseService.AddToGlobalRefiners(data);
				    baseService.IsBusy(true);
				    searchViaRefiners();
				}
			};

			var removeSelectedRefiner = function (event, data) {
				if (data.IsDateRange) {
					$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value.Parent !== data.Parent; });
				} else {
					$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== data; });
				}

				baseService.RemoveFromGlobalRefiners(data);
				searchViaRefiners();
			};

			var removeSelectedRefiner2 = function (event, data) {
				if (data.IsDateRange) {
					$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value.Parent !== data.Parent; });
				} else {
					$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== data; });
				}
				baseService.RemoveFromGlobalRefiners(data);
			};

			var onAddCertifates = function (event, data) {
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
				initiallizeItems();

			};

			$scope.HasSelection = function () {
				var checkedItems = $filter('filter')($scope.certificates, function (value, index) { return value.IsChecked === true; });
				$scope.hasSelection = (checkedItems.length > 0);

			};

			$scope.CheckAllResult = function ($event) {
				var checkbox = $event.target;

				angular.forEach($scope.certificates, function (item) {
					item.IsChecked = checkbox.checked;
				});

			};

			$scope.Export = function () {

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

					angular.forEach($scope.headers, function (head) {
						if (!head.CellTemplate) {
							this.push(head.Title);
						}
					}, dataHeader);

					//export to array
					data.push(dataHeader);
					angular.forEach($scope.gridSelections, function (item) {
						var row = {
							Items: []
						};

						var dataRow = [];
						//export to array
						dataRow.push(item.OrderNumber);
						dataRow.push(item.CertificateNumber);
						dataRow.push(item.CertificateSchemaName);
						dataRow.push(item.SectorNames);
						dataRow.push(item.RegionNames);
						dataRow.push(item.Countries.map(function (value, index) { return value.CountryName; }).join(", "));
						dataRow.push(item.CertificateOrganizationName);
						dataRow.push(item.Manufacturer);
						dataRow.push(item.CompanyName);
						dataRow.push(item.LicenseHolder);
						dataRow.push(item.Factory);
						dataRow.push(item.Model);
						dataRow.push(item.BrandName);
						dataRow.push(globalUtility.DateFormatDisplay(item.IssueDate));
						dataRow.push(item.IsExpirationDateApplicable ? globalUtility.DateFormatDisplay(item.ExpirationDate) : "n/a");
						dataRow.push(item.CertificateStatusType);
						dataRow.push(item.CertificateBusinessStatusType);
						dataRow.push(item.AgentName);
						dataRow.push(item.Subcontractor);
						dataRow.push(item.POC);
						dataRow.push(item.ProductTypeName);
						dataRow.push(item.ProductSubTypeName);
						dataRow.push(item.WirelessNames);
						dataRow.push(item.StandardNames);
						//dataRow.push(item.IsExpirationDateApplicable);
						//dataRow.push(item.ExpiringInNoDays);
						//dataRow.push(item.CertificateItemId);

						data.push(dataRow);

					});

					//exportService.ExportJSONToExcel(table, "Certificates");
					exportService.ExportArrayToExcel(data, "Certificates");

				}

				var message = "The selected results will be exported to excel";
				var title = "EXPORT RESULTS";

				dialogService.Dialog.Confirm(enums.ConfirmType.OkCancel, message, title, enums.ModalSize.Small, callBack);

			};
			//GRID OPTIONS
			//
			if (globalUtility.Coordinator) {
				$scope.columns = [
					{
						name: 'Copy',
						width: '55',
						cellTemplate: '<span class="fa fa-clipboard text-align-center" ng-click="grid.appScope.CopyCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false
					},
					{
						name: 'Renew',
						width: '65',
						cellTemplate: '<span class="fa fa-retweet text-align-center" ng-click="grid.appScope.RenewCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false
					},
					{
						name: 'Edit',
						width: '55',
						cellTemplate: '<span class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.EditCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false
					}
				];
			}
			else if (globalUtility.Contributor) {
				$scope.columns = [
					{
						name: 'Copy',
						width: '55',
						cellTemplate: '<span class="fa fa-clipboard text-align-center" ng-click="grid.appScope.CopyCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false
					},
					{
						name: 'Renew',
						width: '65',
						cellTemplate: '<span class="fa fa-retweet text-align-center" ng-click="grid.appScope.RenewCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false
					},
					{
						name: 'Edit',
						width: '55',
						cellTemplate: '<span class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.EditCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false
					}
				];
			}

			else if (globalUtility.ContentAdmin) {
				$scope.columns = [
					{
						name: 'Copy',
						width: '55',
						cellTemplate: '<span class="fa fa-clipboard text-align-center" ng-click="grid.appScope.CopyCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false,
						enableSorting: false,
						enableHiding: false
					},
					{
						name: 'Renew',
						width: '65',
						cellTemplate: '<span class="fa fa-retweet text-align-center" ng-click="grid.appScope.RenewCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false
					},
					{
						name: 'Edit',
						width: '55',
						cellTemplate: '<span class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.EditCertificate(row.entity)" style="cursor: pointer; padding-left:18px;"></span>',
						enableColumnMenus: false,
						enableSorting: false,
						enableHiding: false
					},
					{
						name: 'Delete',
						width: '70',
						cellTemplate: '<span class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;" ng-click="grid.appScope.DeleteCertificate(row.entity)"></span>',
						enableColumnMenus: false,
						enableSorting: false,
						enableHiding: false
					}
				];
			}
			else {
				$scope.columns = [];
			}

			var gridSelectionChanged = function (data) {
				$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
			};
			var gridBacthSelectionChanged = function (data) {
				$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
			};

			$scope.gridSelections = [];

			$scope.certificatesGrid = {
				enableColumnMenus: false,
				enableHiding: false,
				enableSorting: true,
				enableColumnResizing: true,
				columnDefs: $scope.columns,
				infiniteScrollRowsFromEnd: 20,
				infiniteScrollUp: true,
				infiniteScrollDown: true,
				onRegisterApi: function (gridApi) {
					$scope.gridApi = gridApi;
					gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.LoadMore);
					gridApi.selection.on.rowSelectionChanged($scope, gridSelectionChanged);
					gridApi.selection.on.rowSelectionChangedBatch($scope, gridBacthSelectionChanged);
				}
			};

			init();

			$scope.$on('$destroy', function () {

				var events = [
					'shell:addSelectedRefiner', 'shell:removeSelectedRefiner', 'shell:removeSelectedRefiner2',
					'certificates:addCertificates', 'certificates:downloadCertificates',
					'shell:refinerSetCompleted', 'shell:clearAllSelectedRefiners',
					'shell:loadPreselectedRefiners', 'shell:refreshRefinersCertificates'];
				baseService.UnSubscribe(events);
			});
		}]);
});
