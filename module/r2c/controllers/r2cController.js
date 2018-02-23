
define([
	'app',
	'globalUtility',
	'enums',
	'routeResolver',
	'shell/model/refinerModel',
], function (app, globalUtility, enums, routeResolver, refinerModel) {

	app.register.controller('r2cController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'r2cService', 'exportService',
		function ($scope, $http, $rootScope, $filter, baseService, dialogService, r2cService, exportService) {

	        $scope.isWorkFlowMode          = false;
	        $scope.selectedRefiners        = [];
	        $scope.docs                    = [];
	        $scope.r2c                     = [];
	        $scope.r2citem                 = [];
	        $scope.isEnabled               = true;
	        $scope.canAdd                  = false;
	        $scope.AllowedToExport         = true;
	        $scope.contentTemplateUrl      = "";
	        var isOnload                   = true;
	        var isSetRefinerSouceCompleted = false;
	        var keywords                   = [];
	        var initialLoad                = true;
	        var isFavorite                 = false;

			if (globalUtility.Contributor || globalUtility.Coordinator || globalUtility.ContentAdmin || globalUtility.TranslatorJapanese || globalUtility.TranslatorChinese) {
			    $scope.canAdd = true;
			}

			if (globalUtility.SalesReader) {
				$scope.AllowedToExport = false;
			}

			var GetIEVersion = function () {
				var sAgent = window.navigator.userAgent;
				var Idx = sAgent.indexOf("MSIE");
				// If IE, return version number.
				if (Idx > 0)
					return parseInt(sAgent.substring(Idx + 5, sAgent.indexOf(".", Idx)));

				// If IE 11 then look for Updated user agent string.
				else if (!!navigator.userAgent.match(/Trident\/7\./))
					return 11;

				else
					return 0; //It is not IE
			}
			$scope.IsIE = (GetIEVersion() > 0)

	        var originalDocs = [];
	        var refinerType = {
	            CoveredSector: 'CoveredSector', //Sector Regulated
	            FrequencyTech: 'FrequencyTech', //Frequency and Technology
	            ProductType: 'ProductType', //Product Type
                ApplicationType : 'ApplicationType',
	            Region: 'Region', //Region
	            Country: 'Country', //Country
	            CertScheme: 'CertScheme', //Compliance Program
	            CertOrganization: 'CertOrg',
	            DocumentCategory: 'DocumentType',
	            Keyword: "Keyword",
                Status : "StatusType"

			};

	        var defaultRefiner = { RefinerType: refinerType.Status, RefinerValueId: enums.WorkflowStatus.Approved.Id };

	        $scope.headers = {
	            Info: ["Region", "Sector Regulated", "Certification Organization",
                "Frequency and Technology", "Application Type", "Regional Economic Union", "Country", "Product Type", "Product Subtype"],
	            Documents: ["", "Document Name", "Remarks", "Document Type"],
	            Samples: ["", "Sample Mode", "Remarks", "Number of Units Required"],
	            CommonRemarks: ["Common Remarks"]
	        };

			//$scope.headersDocuments = [];


	        function init() {
	            if (initialLoad) {
	                baseService.Subscribe('shell:refreshRefinersRequiredItems', refreshRefinersRequiredItems);
	                baseService.Subscribe('shell:addSelectedRefiner', addSelectedRefiner);
	                baseService.Subscribe('shell:removeSelectedRefiner', removeSelectedRefiner);
	                baseService.Subscribe('shell:refinerSetCompleted', onSetRefinerSourceCompleted);
	                baseService.Subscribe('shell:clearAllSelectedRefiners', function () {
	                    $scope.selectedRefiners = [];
	                });
	                //baseService.Subscribe('shell:loadPreselectedRefiners',loadPreselectedRefiners);
	                //baseService.Subscribe('r2cWorkFlow:SearchViaRefiners', onSearchViaRefiners);
	                // baseService.Subscribe('r2c:viewWorkFlow', viewWorkFlow);
	                baseService.Subscribe('r2c:addR2C', onAddR2C);
	            }
	          
	            baseService.SearchBarVisibility(true);

	            //$scope.contentTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "r2cWorkflowTracking");
	            $scope.modalTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "r2cModal");
	            $scope.r2cWorkFlowFieldChangesTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "r2cWorkFlowFieldChanges");
	            loadRefiners();
			   //loadPreselectedRefiners();
	           // GetAll();
	            var searchDS = [];

				//angular.forEach($scope.certificates, function (item) {
				//    this.push(item.CertificateNumber);
				//}, searchDS);

				baseService.PopulateTypeAHead(searchDS);
				bindTypeAheadSearch();
	        };

	        function refreshRefinersRequiredItems() {
	            isFavorite = true;
	            baseService.Publish('shell:clearRefinerList', true);
	            loadRefiners();
	        }

	        function loadRefiners() {
	            r2cService.GetAllRefiners(onGetAllRefiners_Completed);
	        }

	        $scope.WorkflowTracking = function () {
	            $scope.isWorkFlowMode = true;
	            r2cService.GetAllWorkFlowRefiners(onGetAllWorkFlowRefiners_Completed);
	            $scope.contentTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "r2cWorkflowTracking");
	        };

	        $scope.BackToList = function () {
	           // $scope.contentTemplateUrl = "";
				$scope.resetAll();

			};

	        $scope.AddItem = function () {
	            $scope.selectedRefiners = [];
	            mode = enums.Mode.Add;
	            baseService.IsBusy(true);
	            r2cService.getAllLookups(onGetLookUps_Completed);
	        };

	        $scope.EditItem = function (data) {
	            mode = enums.Mode.Edit;
	            paramData = data;
	            baseService.IsBusy(true);
	            r2cService.getAllLookups(onGetLookUps_Completed); 
	        };

			$scope.removeRefiner = function (refiner) {
				$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== refiner; });
				baseService.Publish('shell:uncheckRefiner', refiner);

				removeFromGlobalRefiners(refiner);

				searchViaRefiners();
			};

			$scope.IsExportEnable = function () {
				var hasSelected = true;
				angular.forEach($scope.docs, function (items) {
					angular.forEach(items.Documents, function (docs) {
						if (docs.IsChecked) {
							hasSelected = false;
						}
					});
					angular.forEach(items.Samples, function (samps) {
						if (samps.IsChecked) {
							hasSelected = false;
						}
					});
				});
				return hasSelected;
			};

			$scope.Export = function () {
				var callBack = function (response) {
					if (response == enums.CallbackType.Cancel) return;

					var data = [];
					var dataHeader = [];
					var dataRow = [];
					var dataDocsHeader = [];
					var dataDocsRow = [];
					var dataSampleHeader = [];
					var dataSampleRow = [];
					var dataSpaceRow = [];
					var exportItemsCount = 0;
					var exportItemsSampleCount = 0;
					var itemHeader = 0;
					var docCount = 0;
					var sampCount = 0;
					var print = 0;

					angular.forEach($scope.docs, function (items) {

						angular.forEach(items.Documents, function (docs) {
							if (docs.IsChecked) {
								docCount++;
								$scope.isEnabled = false;
							}
						});
						angular.forEach(items.Samples, function (samps) {
							if (samps.IsChecked) {
								sampCount++;
								$scope.isEnabled = false;
							}
						});
						var itemHeader = 0;
						var exportItemsCount = 0;
						var exportItemsSampleCount = 0;
						var dataRow = [];
						if (docCount > 0 || sampCount > 0) {
							docCount = 0;
							sampCount = 0;
							itemHeader++;
							if (itemHeader == 1) {
								print++;
								dataHeader.push("Compliance Program");
								dataHeader.push("Region");
								dataHeader.push("Sector Regulated");
								dataHeader.push("Certification Organization");
								//dataHeader.push("Product Category");
								dataHeader.push("Frequency and Technology");
								dataHeader.push("Application Type");
								dataHeader.push("Regional Economic Union");
								dataHeader.push("Country");
								dataHeader.push("Product Type");
								dataHeader.push("Product SubType");

								data.push(dataSpaceRow);
								data.push(dataHeader);

								dataRow.push(items.ComplienceProgramName);
								dataRow.push(items.Region);
								dataRow.push(items.SectorRegulated);
								dataRow.push(items.CertificateOrganization);
								//dataRow.push(items.ProductCategory);
								dataRow.push(items.FreqAndTech);
								dataRow.push(items.ApplicationType);
								dataRow.push(items.RegionalEconomicUnion);
								dataRow.push(items.Country);
								dataRow.push(items.ProductType);
								dataRow.push(items.ProductSubType);

								data.push(dataRow);
							}
							angular.forEach(items.Documents, function (exportItems) {

								if (exportItems.IsChecked == true) {
									var dataDocsRow = [];
									exportItemsCount++;

									if (exportItemsCount == 1) {
										dataDocsHeader.push("Document Name");
										dataDocsHeader.push("Remarks");
										dataDocsHeader.push("Number of Copies");
										dataDocsHeader.push("Document Type");

										data.push(dataSpaceRow);
										data.push(dataDocsHeader);
									}

									dataDocsRow.push(exportItems.DocumentName);
									dataDocsRow.push(exportItems.Remarks);
									dataDocsRow.push(exportItems.NumberOfCopies);
									dataDocsRow.push(exportItems.DocumentType);

									data.push(dataDocsRow);
								}
							});

							angular.forEach(items.Samples, function (exportItemsSample) {
								if (exportItemsSample.IsChecked == true) {
									var dataSampleRow = [];
									exportItemsSampleCount++;

									if (exportItemsSampleCount == 1) {
										dataSampleHeader.push("Sample Mode");
										dataSampleHeader.push("Remarks (Common)");
										dataSampleHeader.push("Remarks (Country  Specific)");
										dataSampleHeader.push("Number of Units Required");
										dataSampleHeader.push("Sample Requirement");

										data.push(dataSpaceRow);
										data.push(dataSampleHeader);
									}

									dataSampleRow.push(exportItemsSample.SampleMode);
									dataSampleRow.push(exportItemsSample.Remarks);
									dataSampleRow.push(exportItemsSample.RemarksCountrySpecific);
									dataSampleRow.push(exportItemsSample.NumberOfUnitsRequired);
									dataSampleRow.push(exportItemsSample.SampleRequirement == '' ? 'N' : 'Y');

									data.push(dataSampleRow);
								}
							});
						}
					});
					if (print != 0) {
						exportService.ExportArrayToExcel(data, "R2C");
					}
				}
				var message = "The selected results will be exported to excel";
				var title = "EXPORT RESULTS";

				dialogService.Dialog.Confirm(enums.ConfirmType.OkCancel, message, title, enums.ModalSize.Small, callBack);
			};


			var bindTypeAheadSearch = function () {

				var channel = new kernel.messaging.channel(window.parent);

				var subscriber = new kernel.messaging.subscriber('R2C', 'searchFilter', function (command) {
					var searchWord = command.arg;
					Search(searchWord);
				});

				channel.register(subscriber);

			};
			var Search = function (searchWord) {

				var isExist = false;
				angular.forEach($scope.selectedRefiners, function (item) {

				    keywords = searchWord.split(' ');
				    if (keywords.length > 0) {
				        angular.forEach(keywords, function (key) {
				            if (item.Type == "Keyword") {
				                isExist = true;
				                item.Id = key;
				                item.Value = key;
				            }
				        });
				    }
				});
				if (searchWord == "") {
					if (isExist) {
						$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value.Type != refinerType.Keyword; });
					}
					searchViaRefiners();
				}
				else {
					$scope.$apply();
					if (!isExist) {
					    keywords = searchWord.split(' ');
					    if (keywords.length > 0) {
					        angular.forEach(keywords, function (key) {
					            var data = {
					                Type: refinerType.Keyword,
					                Id: key.length > 50 ? key.slice(0, 50) : key,
					                Value: key.length > 50 ? key.slice(0, 50) : key,
					                Parent: "Keyword",
					                Checked: false,
					                IsDateRange: false
					            };
					            $scope.selectedRefiners.push(data);
					        });
					    }
					}
					searchViaRefiners();
				}
			};

	        var onAddR2C = function (event, data) {
	            var message = [];
	            message.push(data.Success[0]);
	            if (data.HasErrors) {
	                angular.forEach(data.Errors, function (error) {
	                    this.push(error);
	                }, message);
	            }
	            //bsAlertService.Show(message, data.HasErrors ? enums.AlertType.Warning : enums.AlertType.Success, true);
	            isOnload = false;
	            searchViaRefiners();
	            //initiallizeItems();
	        };

			var mode = enums.Mode.Add;
			var paramData = [];
			var openModal = function () {
				var param = {
					Mode: mode,
					Data: (mode == enums.Mode.add) ? null : paramData,
					LookUps: globalUtility.R2CLookups
				};
				dialogService.Dialog.WithTemplateAndController("r2cModalDialog.html", "r2cModalController", enums.ModalSize.Large, param);

			};

			var onGetLookUps_Completed = function (response) {
				baseService.IsBusy(false);
				globalUtility.R2CLookups = response.Data;
				openModal();
			};



			var onGetAllRefiners_Completed = function (response) {
				var refinerDS = [], items = [], parent = "";
				if (response.Data.Sectors.length > 0) {
					items = [];
					parent = "REGULATORY CATEGORY";
					angular.forEach(response.Data.Sectors, function (item) {

						var checked = false;
						if (globalUtility.SelectedSector != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedSector, function (value, index) { return value.CoveredSectorId == item.CoveredSectorId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CoveredSector, item.CoveredSectorId, item.CoveredSector, parent, checked));
					}, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.FrequencyAndTechnologies.length > 0) {
					items = [];
					parent = "FREQUENCY AND TECHNOLOGY";
					angular.forEach(response.Data.FrequencyAndTechnologies, function (item) {

						var checked = false;
						if (globalUtility.SelectedFreqTech != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedFreqTech, function (value, index) { return value.FrequencyTechId == item.FrequencyTechId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.FrequencyTech, item.FrequencyTechId, item.FrequencyTechName, parent, checked));
					}, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.ProductTypes.length > 0) {
					items = [];
					parent = "PRODUCT TYPE";
					angular.forEach(response.Data.ProductTypes, function (item) {

						var checked = false;
						if (globalUtility.SelectedProductType != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedProductType, function (value, index) { return value.ProductTypeId == item.ProductTypeId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.ProductType, item.ProductTypeId, item.ProductName, parent, checked));
					}, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.ApplicationTypes.length > 0) {
					items = [];
					parent = "APPLICATION TYPE";
					angular.forEach(response.Data.ApplicationTypes, function (item) {

						var checked = false;
						if (globalUtility.SelectedApplicationType != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedApplicationType, function (value, index) { return value.ApplicationTypeId == item.ApplicationTypeId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.ApplicationType, item.ApplicationTypeId, item.ApplicationTypeName, parent, checked));
					}, items);

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

					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.Countries.length > 0) {
					items = [];
					parent = "COUNTRY";
					angular.forEach(response.Data.Countries, function (item) {

						var checked = false;
						if (globalUtility.SelectedCountry != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedCountry, function (value, index) { return value.id == item.CountryItemId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.Country, item.CountryItemId, item.CountryName, parent, checked));
					}, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.CompliancePrograms.length > 0) {
					items = [];
					parent = "COMPLIANCE PROGRAM";
					angular.forEach(response.Data.CompliancePrograms, function (item) {
						var checked = false;
						if (globalUtility.SelectedComplianceProgram != "" && isOnload) {
						    var temp = $filter('filter')(globalUtility.SelectedComplianceProgram, function (value, index) { return value.Id == item.CertificateProgramId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CertScheme, item.CertificateProgramId, item.CertificateProgramName, parent, checked));
					}, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.CertificateOrganizations.length > 0) {
					items = [];
					parent = "CERTIFICATION ORGANIZATON";
					angular.forEach(response.Data.CertificateOrganizations, function (item) {
					    var checked = false;
					    if (globalUtility.SelectedCertOrg != "" && isOnload) {
					        var temp = $filter('filter')(globalUtility.SelectedCertOrg, function (value, index) { return value.Id == item.OrganizationId; });
					        checked = temp.length > 0;
					    }
					    this.push(refinerModel.Item(refinerType.CertOrganization, item.OrganizationId, item.OrganizationName, parent, checked));
					}, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}


				if (response.Data.DocumentTypes.length > 0) {
					items = [];
					parent = "DOCUMENT CATEGORY";
					angular.forEach(response.Data.DocumentTypes, function (item) {
					    var checked = false;
					    if (globalUtility.SelectedDocumentType != "" && isOnload) {
					        var temp = $filter('filter')(globalUtility.SelectedDocumentType, function (value, index) { return value.Id == item.DocumentTypeId; });
					        checked = temp.length > 0;
					    }
					    this.push(refinerModel.Item(refinerType.DocumentCategory, item.DocumentTypeId, item.DocumentTypeName, parent, checked));
					}, items);

					items.push(refinerModel.Item(refinerType.DocumentCategory, "Samples", "Samples", parent));
					refinerDS.push(refinerModel.Set(parent, items));
				}

				var keywordRefiner = globalUtility.GetPreselectedKeywordRefiner();
				if(keywordRefiner != undefined) baseService.Publish('shell:addSelectedRefiner', keywordRefiner);

				baseService.Publish('shell:setRefinerDataSource', refinerDS);
			};


	        var onGetAllWorkFlowRefiners_Completed = function (response) {
	            var refinerDS = [], items = [], parent = "";
	            if (response.Data.Sectors.length > 0) {
	                items = [];
	                parent = "REGULATORY CATEGORY";
	                angular.forEach(response.Data.Sectors, function (item) {
	                    this.push(refinerModel.Item(refinerType.CoveredSector, item.CoveredSectorId, item.CoveredSector, parent));
	                }, items);

	                refinerDS.push(refinerModel.Set(parent, items));
	            }

	            if (response.Data.Regions.length > 0) {
	                items = [];
	                parent = "REGION";
	                angular.forEach(response.Data.Regions, function (item) {
	                    this.push(refinerModel.Item(refinerType.Region, item.RegionId, item.RegionName, parent));
	                }, items);

	                refinerDS.push(refinerModel.Set(parent, items));
	            }

	            if (response.Data.Countries.length > 0) {
	                items = [];
	                parent = "COUNTRY";
	                angular.forEach(response.Data.Countries, function (item) {
	                    this.push(refinerModel.Item(refinerType.Country, item.CountryItemId, item.CountryName, parent));
	                }, items);

	                refinerDS.push(refinerModel.Set(parent, items));
	            }

	            if (response.Data.CompliancePrograms.length > 0) {
	                items = [];
	                parent = "COMPLIANCE PROGRAM";
	                angular.forEach(response.Data.CompliancePrograms, function (item) {
	                    this.push(refinerModel.Item(refinerType.CertScheme, item.CertificateProgramId, item.CertificateProgramName, parent));
	                }, items);

	                refinerDS.push(refinerModel.Set(parent, items));
	            }

	            baseService.Publish('shell:setRefinerDataSource', refinerDS);
	        };
	        var onGetAll_Completed = function (response) {

	            baseService.IsBusy(false);
	            $scope.docs       = angular.copy(response.Data);
	            originalDocs      = angular.copy(response);
	            var typeAheadList = [];

	            if ($scope.docs.length !== 0) {

	                typeAheadList = typeAheadList.concat($scope.docs.map(function (c) { return c.Country; }));
	                typeAheadList = arrayUnique(typeAheadList.concat($scope.docs.map(function (c) { return c.ComplienceProgramName; })));

	                for (var i = 0; i < $scope.docs.length; i++) {

	                    var documents = $scope.docs[i].Documents;
	                    var samples   = $scope.docs[i].Samples;

	                    if (documents.length > 0) {
	                        typeAheadList = arrayUnique(typeAheadList.concat(documents.map(function (b) { return b.DocumentName; })));
	                        typeAheadList = arrayUnique(typeAheadList.concat(documents.map(function (b) { return b.Remarks; })));
	                    }

	                    if (samples.length > 0) {
	                        typeAheadList = arrayUnique(typeAheadList.concat(samples.map(function (b) { return b.RemarksCountrySpecific; })));
	                    }
	                }

	                baseService.PopulateTypeAHead(typeAheadList);

	                angular.forEach($scope.docs, function (docs) {
	                    angular.forEach(docs.Documents, function (docItem) {
	                        if (docItem.RowStatus === 1) {
	                            docItem.Status = "New";
	                        }
	                        else if (docItem.RowStatus === 2) {
	                            docItem.Status = "Updated";
	                        }
	                    });
	                    angular.forEach(docs.Samples, function (sampleItem) {
	                        if (sampleItem.RowStatus === 1) {
	                            sampleItem.Status = "New";
	                        }
	                        else if (sampleItem.RowStatus === 2) {
	                            sampleItem.Status = "Updated";
	                        }
	                    });

                    
	                    //angular.forEach(docs.CommonRemarks, function (sampleItem) {
	                    //    if (sampleItem.RowStatus === 1) {
	                    //        sampleItem.Status = "New";
	                    //    }
	                    //    else if (sampleItem.RowStatus === 2) {
	                    //        sampleItem.Status = "Updated";
	                    //    }
	                    //})
	                });

	            }

	            initialLoad = false;
	            isFavorite = false;
			};

	        var onSetRefinerSourceCompleted = function (event, data) {
	            isSetRefinerSouceCompleted = true;
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

	            var param = {
	                SelectedRefiners: selectedRefiners,
	                CultureTypeId: globalUtility.SelectedLanguage
	            };
	            if (!$scope.isWorkFlowMode) param.SelectedRefiners.push(defaultRefiner);

	            if (!$scope.isWorkFlowMode) r2cService.GetAll(param, onGetAll_Completed);
	            else baseService.Publish("r2cWorkFlow:GetAllByRefiners", param)
	        };

	        var addSelectedRefiner = function (event, data) {
	            if ($scope.selectedRefiners.map(function (ref) { return ref.Value; }).indexOf(data.Value) === -1) {
	                $scope.selectedRefiners.push(data);
	            }

	            baseService.Publish('shell:addSelectedModuleRefiner', { Refiner: data });

	            if (!initialLoad && !isFavorite) {
	                baseService.AddToGlobalRefiners(data);
	                baseService.IsBusy(true);
	                searchViaRefiners();
	            }
	        };

			function addGlobalRefiner(data) {
				if (data.Type === 'CoveredSector') {
					var refiner = {
						CoveredSectorId: data.Id,
						CoveredSector: data.Value
					}

					globalUtility.SelectedSector.push(refiner);
				}
				if (data.Type === 'FrequencyTech') {
					var refiner = {
						FrequencyTechId: data.Id,
						FrequencyTechName: data.Value
					}

					globalUtility.SelectedFreqTech.push(refiner);
				}
				if (data.Type === 'ApplicationType') {
					var refiner = {
						ApplicationTypeId: data.Id,
						ApplicationTypeName: data.Value
					}

					globalUtility.SelectedApplicationType.push(refiner);
				}
				if (data.Type === 'Region') {
					var refiner = {
						RegionId: data.Id,
						RegionName: data.Value
					}

					globalUtility.SelectedRegion.push(refiner);
				}
				if (data.Type === 'Country') {
					var refiner = {
						CountryItemId: data.Id,
						CountryName: data.Value
					}

					globalUtility.SelectedCountry.push(refiner);
				}
				if (data.Type === 'CertScheme') {
					var refiner = {
						SchemaId: data.Id,
						SchemaName: data.Value
					}

					globalUtility.SelectedComplianceProgram.push(refiner);
				}
				if (data.Type === 'ProductType') {
					var refiner = {
						ProductTypeId: data.Id,
						ProductName: data.Value
					}

					globalUtility.SelectedProductType.push(refiner);
				}
			}

	        var removeSelectedRefiner = function (event, data) {
	
	            if (data.IsDateRange) {
	                $scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value.Parent !== data.Parent; });
	            } else {
	                $scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== data; });
	            }

	            if(!$scope.isWorkFlowMode)removeFromGlobalRefiners(data);

				searchViaRefiners();
			};

			function removeFromGlobalRefiners(refiner) {
				if (refiner.Type === 'CoveredSector') {
					var index = globalUtility.SelectedSector.map(function (s) { return s.CoveredSectorId }).indexOf(refiner.Id);
					while (index !== -1) {
						globalUtility.SelectedSector.splice(index, 1);
						index = globalUtility.SelectedSector.map(function (s) { return s.CoveredSectorId }).indexOf(refiner.Id);
					}
				}
				if (refiner.Type === 'FrequencyTech') {
					var index = globalUtility.SelectedFreqTech.map(function (s) { return s.FrequencyTechId }).indexOf(refiner.Id);
					while (index !== -1) {
						globalUtility.SelectedFreqTech.splice(index, 1);
						index = globalUtility.SelectedFreqTech.map(function (s) { return s.FrequencyTechId }).indexOf(refiner.Id);
					}

				}
				if (refiner.Type === 'ApplicationType') {
					var index = globalUtility.SelectedApplicationType.map(function (s) { return s.ApplicationTypeId }).indexOf(refiner.Id);
					while (index !== -1) {
						globalUtility.SelectedApplicationType.splice(index, 1);
						index = globalUtility.SelectedApplicationType.map(function (s) { return s.ApplicationTypeId }).indexOf(refiner.Id);
					}
				}
				if (refiner.Type === 'Region') {
					var index = globalUtility.SelectedRegion.map(function (s) { return s.RegionId }).indexOf(refiner.Id);
					while (index !== -1) {
						globalUtility.SelectedRegion.splice(index, 1);
						index = globalUtility.SelectedRegion.map(function (s) { return s.RegionId }).indexOf(refiner.Id);
					}
				}
				if (refiner.Type === 'Country') {
					var index = globalUtility.SelectedCountry.map(function (s) { return s.CountryItemId }).indexOf(refiner.Id);
					while (index !== -1) {
						globalUtility.SelectedCountry.splice(index, 1);
						index = globalUtility.SelectedCountry.map(function (s) { return s.CountryItemId }).indexOf(refiner.Id);
					}
				}
				if (refiner.Type === 'CertScheme') {
					var index = globalUtility.SelectedComplianceProgram.map(function (s) { return s.SchemaId }).indexOf(refiner.Id);
					while (index !== -1) {
						globalUtility.SelectedComplianceProgram.splice(index, 1);
						index = globalUtility.SelectedComplianceProgram.map(function (s) { return s.SchemaId }).indexOf(refiner.Id);
					}
				}
				if (refiner.Type === 'ProductType') {
					var index = globalUtility.SelectedProductType.map(function (s) { return s.ProductTypeId }).indexOf(refiner.Id);
					while (index !== -1) {
						globalUtility.SelectedProductType.splice(index, 1);
						index = globalUtility.SelectedProductType.map(function (s) { return s.ProductTypeId }).indexOf(refiner.Id);
					}
				}
			}

			$scope.viewWorkFlow = function (data) {
			    mode = enums.Mode.ViewWF;
			    paramData = data;
			    baseService.IsBusy(true);
			    r2cService.getAllLookups(onGetLookUps_Completed);
			};
            //to be called from child templates
			$scope.searchViaRefiners = function () {
			    searchViaRefiners();
			};

			//var viewWorkFlow = function (event, data) {
			//	mode = enums.Mode.ViewWF;
			//	paramData = data;
			//	baseService.IsBusy(true);
			//	r2cService.getAllLookups(onGetLookUps_Completed);
			//};

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

			//var onDeleteR2C_Completed = function (response) {
			//    baseService.IsBusy(false);
			//    bsAlertService.Show(response.Success ? response.Data.Message : response.ErrorMessage,
			//        response.Success ? enums.AlertType.Success : enums.AlertType.Error);

			//    if (response.Success) {
			//        var certificateItem = $filter('filter')($scope.certificates, function (value, index) { return value.CertificateItemId == response.Data.CertificateItemId; });
			//        $scope.certificates = $filter('filter')($scope.certificates, function (value, index) { return value.CertificateItemId != response.Data.CertificateItemId; });
			//        $scope.certificatesGrid.data = angular.copy($scope.certificates);

			//        var onDeleteSuccess = function (res) {
			//            if (!res.IsSuccess) console.log('Error Deleting Documents');
			//        }
			//        var param = { certificateNumber: certificateItem[0].CertificateNumber };
			//        certificatesService.DeleteALLSourceDocuments(param, onDeleteSuccess)
			//    }
			//};

			////DELETE R2C Item
			//$scope.DeleteR2C = function () {
			//    var callBack = function (response) {
			//        if (response == enums.CallbackType.Yes) {
			//            var param = {
			//                R2CItemId: data.R2CItemId
			//            };
			//            r2cService.DeleteR2C(param, onDeleteR2C_Completed);
			//            baseService.IsBusy(true);
			//        }
			//    }
			//    var message = "Are you sure you want to permanently delete this item?";
			//    var title = "DELETE ITEM";

			//    dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);
			//};

	        //EXPORT TO EXCEL
	      
	        $scope.resetAll = function () {
	            destroyListeners();
	            $scope.contentTemplateUrl = "";
	            $scope.isWorkFlowMode = false;
	            $scope.selectedRefiners = [];
	            $scope.docs = [];
	            $scope.r2c = [];
	            $scope.r2citem = [];
	            $scope.isEnabled = true;
	            isSetRefinerSouceCompleted = false;
	            $scope.contentTemplateUrl = "";
	            isOnload = true;
	            init();
	        };

	        init();

			$scope.$on('$destroy', function () {

	            destroyListeners();
	        });

	        var destroyListeners = function () {
	            var events = [
                 'shell:addSelectedRefiner',
                 'shell:removeSelectedRefiner',
                 'shell:refinerSetCompleted',
                 'r2cWorkFlow:SearchViaRefiners',
                 'r2c:addR2C',
                 'r2c:viewWorkFlow',
                 'shell:clearAllSelectedRefiners',
				 'shell:loadPreselectedRefiners',
                 'shell:refreshRefinersRequiredItems'
	            ];
	            baseService.UnSubscribe(events);
	        };
	    }]);
});
