
define([
	'app',
	'globalUtility',
	'enums',
	'routeResolver',
	'shell/model/refinerModel',
	'module/news/model/newsModel',
	'module/news/model/newsItemModel',
	'module/news/model/headerModel',
	'module/news/model/newsWorkflowModel'
], function (app, globalUtility, enums, routeResolver, refinerModel, newsModel, newsItemModel, headerModel, newsWorkflowModel) {

	app.register.controller('newsController', ['$scope', '$http', '$rootScope', 'baseService', 'dialogService', 'newsService', '$filter', 'bsAlertService',
		function ($scope, $http, $rootScope, baseService, dialogService, newsService, $filter, bsAlertService) {

			$scope.exportedNews            = [];
			$scope.hasSelection            = false;
			$scope.headers                 = [];
			$scope.headersWorkflow         = [];
			$scope.newsWorkflow            = [];
			$scope.news                    = [];
			$scope.newsPage                = true;
			$scope.selectedRefiners        = [];
			$scope.showGridLoader          = false;
			$scope.workflowPage            = false;
			var initialSearchLimit         = 200;
			var currentTotalRow            = 0;
			var isOnload                   = true;
			var isSetRefinerSouceCompleted = false;
			var lastRowIDReturned          = 0;
			var totalRows                  = 0;
			var initialLoad                = true;
			var isFavorite                 = false;
			$scope.canAddNews              = false;
			$scope.isReader                = globalUtility.Reader;
			$scope.isTranslatorJapanese    = globalUtility.TranslatorJapanese;
			$scope.isTranslatorChinese     = globalUtility.TranslatorChinese;

			if (globalUtility.Contributor || globalUtility.Coordinator || globalUtility.ContentAdmin) {
				$scope.canAddNews = true;
			}

			//WILL BE USED FOR REFINERS - DATABASE
			var refinerType = {
				CoveredSector: 'CoveredSector', //Sector Regulated
				FrequencyTech: 'FrequencyTech',
				ProductType: 'ProductType',
				Region: 'Region',
				Country: 'Country',
				CertScheme: 'CertScheme', //Compliance Program
				NewsSource: 'NewsSource',
				EffectiveStartDateTime: 'EffectiveStartDateTime',
				EffectiveEndDateTime: 'EffectiveEndDateTime',
				ExpirationStartDateTime: 'ExpirationStartDateTime',
				ExpirationEndDateTime: 'ExpirationEndDateTime',
				PostedStartDateTime: 'PostedStartDateTime',
				PostedEndDateTime: 'PostedEndDateTime',
				Keyword: 'Keyword'
			};

			function refreshRefinersNews() {
			    isFavorite = true;
			    baseService.Publish('shell:clearRefinerList', true);
			    initiallizeItems();
			}

			function init(data) {

			    if (initialLoad) {
			        baseService.Subscribe('shell:refreshRefinersNews', refreshRefinersNews);
			        baseService.Subscribe('shell:addSelectedRefiner', addSelectedRefiner);
			        baseService.Subscribe('shell:removeSelectedRefiner', removeSelectedRefiner);
			        baseService.Subscribe('newsModule:addNews', onAddNews);
			        baseService.Subscribe('shell:refinerSetCompleted', onSetRefinerSourceCompleted);
			        baseService.Subscribe('shell:clearAllSelectedRefiners', function () {
			            $scope.selectedRefiners = [];
			        });
			    }

				////HEADERS for NEWS GRID
				////$scope.headers.push(headerModel.Set("Posting Date", "PostedDateString", "12%"));
				////$scope.headers.push(headerModel.Set("Title", "Title", "10%"));
				//$scope.headers.push(headerModel.Set("Regulatory Category", "SectorRegulatedName", "13%"));
				//$scope.headers.push(headerModel.Set("Country", "CountryName", "15%"));
				//$scope.headers.push(headerModel.Set("Compliance Program", "ComplianceProgramName", "12%"));
				//$scope.headers.push(headerModel.Set("Category", "Category", "10%"));
				//$scope.headers.push(headerModel.Set("Posted By", "PostedBy", "18%"));

				//angular.forEach($scope.headers, function (item) {
				//    var temp = null;
				//    this.push({
				//        field: item.Field,
				//        name: item.Title,
				//        width: item.Width,
				//        cellTemplate: item.CellTemplate,
				//        enableColumnMenus: false
				//    })
				//}, $scope.columns);

	            //HEADERS FOR WORKFLOW TRACKING LIST
	            //$scope.headersWorkflow.push(headerModel.Set("View", " ", "12%"));
	            //$scope.headersWorkflow.push(headerModel.Set("View Details", " ", "10%", '<a style="padding-left:5px;"><span style="cursor:pointer" ng-click="grid.appScope.viewDetails(row.entity)">View Details</span></a>'));
	            $scope.headersWorkflow.push(headerModel.Set("Regulatory Category", "WorkflowCoveredSectorName", "13%")); //multiple //also called SECTOR REGULATED: //EMC //Safety //Wireless 
	            $scope.headersWorkflow.push(headerModel.Set("Region", "WorkflowRegionName", "10%")); //multiple
	            $scope.headersWorkflow.push(headerModel.Set("Country", "WorkflowCountryName", "13%")); //multiple
	            $scope.headersWorkflow.push(headerModel.Set("Compliance Program", "WorkflowComplianceProgramNames", "15%")); //multiple//also called CERTIFICATE SCHEME: //Afghanistan_MCIT //Japan_MIC 
	            //$scope.headersWorkflow.push(headerModel.Set("Original Information", "", "15%"));
	            //$scope.headersWorkflow.push(headerModel.Set("Updated Information", "WorkflowDetails", "15%"));
	            $scope.headersWorkflow.push(headerModel.Set("Field Changes", "", "10%", '<div><a style="padding-left:5px;"><span style="cursor:pointer" class="text-align-center" ng-click="grid.appScope.showWorkflowChanges(row.entity)">View Changes</span></a> </div>'))
	            $scope.headersWorkflow.push(headerModel.Set("Source", "WorkflowSource", "10%"));
	            $scope.headersWorkflow.push(headerModel.Set("Link(s)", "WorkflowLink", "10%"));
	            $scope.headersWorkflow.push(headerModel.Set("Workflow Status", "WorkflowStatus", "15%"));
	            $scope.headersWorkflow.push(headerModel.Set("Date Submitted", "WorkflowDateSubmitted", "13%"));

				angular.forEach($scope.headersWorkflow, function (item) {
					var temp = null;
					this.push({
						field: item.Field,
						name: item.Title,
						width: item.Width,
						cellTemplate: item.CellTemplate,
						enableColumnMenus: false
					})
				}, $scope.columnsWorkflow);

				//  $scope.applications = globalUtility.ClientApps;
				baseService.SearchBarVisibility(true);
				$scope.modalTemplateUrl = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "news");
				initiallizeItems();

			};

	        $scope.showWorkflowChanges = function (row) {
	            var data = {
	                title: 'Field Changes',
	                item: row
	            };
	            var modalInstance = dialogService.Dialog.WithTemplateAndControllerInstanceAndClass("workflowFieldChanges.html", "newsFieldChangesController", "lg", data);
	            modalInstance.result.then(function (data) {
	            }, function (error) {
	            });
	        }

	        var initiallizeItems = function () {
	            $scope.selectedRefiners = [];
	            $scope.hasSelection = false;
	            //if(!globalUtility.HasGlobalRefiners()) searchNews(initialSearchLimit, 0, []);
	            //newsService.GetRefiners(onGetRefiners_Completed);
	            //newsService.GetInformation(onSuccess);
	            // getAllNews();
	            newsService.GetAllRefiners(onGetRefiners_Completed);
				//baseService.Publish('shell:loadPreselectedRefiners');
				//loadPreselectedRefiners()
	        };

			var getAllNews = function (data) {
				var dataTemp = [];
				var responseTemp = [];
				var param = {
					SelectedRefiners: data ? data.SelectedRefiners : [],
					CultureTypeId: globalUtility.SelectedLanguage
				};
				//newsService.GetAll(param, onSearchNews_Completed);
				var index = -1;
				for (var i = 0; i < param.SelectedRefiners.length; ++i) {
					if (param.SelectedRefiners[i].RefinerType == "Keyword") {
						index = i;
						break;
					}
				}

				if (index != -1) {
					var str = param.SelectedRefiners[index].RefinerValueId;
					var n = str.indexOf(",");
					if (n != -1) {
						var arrayStr = str.split(',');
						async.map(arrayStr, exeNewsService, function (err, results) {
							console.log("Finished!");
						});

						function exeNewsService(key, doneCallback) {
							console.log(key.trim());

							var vr = [];
							var vRefiners = {
								RefinerType: param.SelectedRefiners[index].RefinerType,
								RefinerValueId: key.trim()
							};
							vr.push(vRefiners);
							var datam = {
								SelectedRefiners: vr,
								CultureTypeId: data.CultureTypeId
							};
							console.log(datam);
							newsService.GetAll(datam, function (response) {
								if (response.Success === true && response.Data.length !== 0) {
									responseTemp = response;
									dataTemp = dataTemp.concat(response.Data);
									responseTemp.Data = dataTemp;
									onSearchNews_Completed(responseTemp);
								}
								return doneCallback(null);
							});

						}


					}
					else {
						newsService.GetAll(param, onSearchNews_Completed);
					}

				} else {
					newsService.GetAll(param, onSearchNews_Completed);
				}
			};

			var getAllNewsWorkflow = function (data) {

				var criterea = {
					RowsToReturn: initialSearchLimit,
					LastRowReturned: 0,
					SelectedRefiners: data ? data.SelectedRefiners : [],
					CultureTypeId: globalUtility.SelectedLanguage
				};
				newsService.GetNewsWorkFlow(criterea, onGetWorkflow_Completed);
			};

			var onSearchNews_Completed = function (response) {
				if (response.Success) {
					//lastRowRetuned = response.Data.LastRowIdReturned;
					//totalRows = response.Data.TotalRows;
					$scope.filteredRecords = $filter("filter")(response.Data, function (value, index, array) {
						return ((value.ParentNewsItemId == "00000000-0000-0000-0000-000000000000" && value.ItemStatusId == 2) || value.ItemStatusId == 0);
					});
					$scope.news = newsModel.Set($scope.filteredRecords);
					console.log($scope.news);

					DownloadArticlePicture();

					var typeAheadList = [];

					if ($scope.news.length > 0) {
						for (var i = 0; i < $scope.news.length; i++) {

							var countries = $scope.news[i].Country;
							var complianceList = $scope.news[i].ComplianceProgram;
							var products = $scope.news[i].ProductType;

							if (countries.length > 0) {
								typeAheadList = arrayUnique(typeAheadList.concat(countries.map(function (b) { return b.CountryName; })));
							}

							if (complianceList.length > 0) {
								typeAheadList = arrayUnique(typeAheadList.concat(complianceList.map(function (b) { return b.CertificateProgramName; })));
							}

							if (products.length > 0) {
								typeAheadList = arrayUnique(typeAheadList.concat(products.map(function (b) { return b.ProductName; })));
							}
						}

						baseService.PopulateTypeAHead(typeAheadList);
					}

					bindTypeAheadSearch();
				}
				else {
					//lastRowRetuned = 0;
					//totalRows = 0;
					$scope.news = [];
					bsAlertService.Show(response.ErrorMessage, enums.AlertType.Error);
				}
			    //$scope.newsGrid.data = angular.copy($scope.news);
				initialLoad = false;
				isFavorite = false;
			};

			var bindTypeAheadSearch = function () {

				var channel = new kernel.messaging.channel(window.parent);

				var subscriber = new kernel.messaging.subscriber('News', 'searchFilter', function (command) {
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
					getAllNews();
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

			var DownloadArticlePicture = function () {
				angular.forEach($scope.news, function (item) {
					var _onSucces = function (response) {
						if (response.Message == enums.ResponseType.Success) {
							item.Image = "data:image/png;base64," + globalUtility.ArrayBufferToBase64String(response.Data);
						}
						//baseService.IsBusy(false);
					};
					newsService.DownloadArticlePicture({ NewsNumber: item.NewsId }, _onSucces);
				});
			};

			//var searchNews = function (rows, lastRowId, selectedRefiners) {
			//    if (lastRowId == 0 || currentTotalRow != totalRows) {
			//        currentTotalRow = currentTotalRow + rows;
			//        currentTotalRow = lastRowId == 0 || currentTotalRow <= totalRows ? currentTotalRow : totalRows;
			//        var criterea = {
			//            RowsToReturn: currentTotalRow,
			//            LastRowReturned: lastRowId,
			//            SelectedRefiners: selectedRefiners
			//        };


			//        $scope.showGridLoader = true;

			//        newsService.GetAll(criterea, onSearchNews_Completed);
			//    } else {
			//        $scope.showGridLoader = false;
			//    }
			//};

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
	                        if (!isExist) this.push(refinerModel.Item(refinerType.CertScheme, item.Id, item.SchemaName, parent, true));
	                    }, DS);
	                }
	            }

				if (globalUtility.SelectedFreqTech != "" && isOnload) {
					parent = "FREQUENCY AND TECHNOLOGY"
					selectedItems = $filter('filter')(itemSource, function (value, index) { return value.Parent == parent; });
					if (selectedItems.length > 0) {
						angular.forEach(globalUtility.SelectedFreqTech, function (item) {
							var isExist = false;
							angular.forEach(selectedItems, function (selItem) {
								if (item.FrequencyTechId == selItem.Id) isExist = true;
							});
							if (!isExist) this.push(refinerModel.Item(refinerType.FrequencyTech, item.FrequencyTechId, item.FrequencyTechName, parent, true));
						}, DS);
					}
				}

				if (globalUtility.SelectedProductType != "" && isOnload) {
					parent = "PRODUCT TYPE"
					selectedItems = $filter('filter')(itemSource, function (value, index) { return value.Parent == parent; });
					if (selectedItems.length > 0) {
						angular.forEach(globalUtility.SelectedProductType, function (item) {
							var isExist = false;
							angular.forEach(selectedItems, function (selItem) {
								if (item.ProductTypeId == selItem.Id) isExist = true;
							});
							if (!isExist) this.push(refinerModel.Item(refinerType.ProductType, item.ProductTypeId, item.ProductName, parent, true));
						}, DS);
					}
				}

				if (DS.length > 0) {
					angular.forEach(DS, function (item) {
						$scope.selectedRefiners.push(item);

						baseService.AddToGlobalRefiners(item);
					})
				}
			};

			var onSetRefinerSourceCompleted = function (event, data) {
				isSetRefinerSouceCompleted = true;
				searchViaRefiners();
			};

			var onGetRefiners_Completed = function (response) {

				var refinerDS = [], items = [], parent = "", itemsCopy = [];

				var pushItemsCopy = function (toCopy) {
					angular.forEach(toCopy, function (itemToCopy) {
						this.push(itemToCopy);
					}, itemsCopy);
				};

				if (response.Data.Sector.length > 0) {
					items = [];
					parent = "REGULATORY CATEGORY";
					angular.forEach(response.Data.Sector, function (item) {

						var checked = false;
						if (globalUtility.SelectedSector != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedSector, function (value, index) { return value.CoveredSectorId == item.CoveredSectorId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CoveredSector, item.CoveredSectorId, item.CoveredSector, parent, checked));
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.FrequencyTechnology.length > 0) {
					items = [];
					parent = "FREQUENCY AND TECHNOLOGY";
					//angular.forEach(response.Data.FrequencyTechnology, function (item) {
					//    this.push(refinerModel.Item(refinerType.FrequencyTech, item.FrequencyTechId, item.FrequencyTechName, parent));
					//}, items);
					angular.forEach(response.Data.FrequencyTechnology, function (item) {

						var checked = false;
						if (globalUtility.SelectedFreqTech != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedFreqTech, function (value, index) { return value.FrequencyTechId == item.FrequencyTechId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.FrequencyTech, item.FrequencyTechId, item.FrequencyTechName, parent, checked));
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.ProductType.length > 0) {
					items = [];
					parent = "PRODUCT TYPE";
					//angular.forEach(response.Data.ProductType, function (item) {
					//    this.push(refinerModel.Item(refinerType.ProductType, item.ProductTypeId, item.ProductName, parent));
					//}, items);
					angular.forEach(response.Data.ProductType, function (item) {

						var checked = false;
						if (globalUtility.SelectedProductType != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedProductType, function (value, index) { return value.ProductTypeId == item.ProductTypeId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.ProductType, item.ProductTypeId, item.ProductName, parent, checked));
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.Region.length > 0) {
					items = [];
					parent = "REGION";
					angular.forEach(response.Data.Region, function (item) {

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

				if (response.Data.Country.length > 0) {
					items = [];
					parent = "COUNTRY";
					angular.forEach(response.Data.Country, function (item) {

						var checked = false;
						if (globalUtility.SelectedCountry != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedCountry, function (value, index) { return value.id == item.CountryItemId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.Country, item.CountryItemId, item.CountryName, parent, checked));
					}, items);
					//angular.forEach(response.Data.Country, function (item) {
					//    this.push(refinerModel.Item(refinerType.Region, item.CountryItemId, item.CountryName, parent));
					//}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.ComplianceProgram.length > 0) {
					items = [];
					parent = "COMPLIANCE PROGRAM";
					angular.forEach(response.Data.ComplianceProgram, function (item) {

	                    var checked = false;
	                    if (globalUtility.SelectedComplianceProgram != "" && isOnload) {
	                        var temp = $filter('filter')(globalUtility.SelectedComplianceProgram, function (value, index) { return value.Id == item.CertificateProgramId; });
	                        checked = temp.length > 0;
	                    }
	                    this.push(refinerModel.Item(refinerType.CertScheme, item.CertificateProgramId, item.CertificateProgramName, parent, checked));
	                }, items);
	                pushItemsCopy(items);
	                refinerDS.push(refinerModel.Set(parent, items));
	            }
	            //angular.forEach(response.Data.ComplianceProgram, function (item) {
	            //    this.push(refinerModel.Item(refinerType.CertScheme, item.CertificateProgramId, item.CertificateProgramName, parent));
	            //}, items);

	            if (response.Data.Source.length > 0) {
	                items = [];
	                parent = "NEWS SOURCE";
	                angular.forEach(response.Data.Source, function (item) {
	                    var checked = false;
	                    if (globalUtility.SelectedNewsSource != "" && isOnload) {
	                        var temp = $filter('filter')(globalUtility.SelectedNewsSource, function (value, index) { return value.Id == item.NewSourceId; });
	                        checked = temp.length > 0;
	                    }
	                    this.push(refinerModel.Item(refinerType.NewsSource, item.NewSourceId, item.NewSourceDescription, parent, checked));
	                }, items);

					refinerDS.push(refinerModel.Set(parent, items));
				}

				items = [];
				parent = "EFFECTIVE DATE";

	            var effectiveDateRange = refinerModel.SetDateRange(refinerType.EffectiveStartDateTime, refinerType.EffectiveEndDateTime, parent);
	            if (globalUtility.SelectedEffectiveStartDateTime != "" && isOnload)
	            {
	                effectiveDateRange.Items[0].Value       = globalUtility.SelectedEffectiveStartDateTime[0].Id;
	                effectiveDateRange.Items[0].ValueString = globalUtility.SelectedEffectiveStartDateTime[0].Id;
	            }
	            if (globalUtility.SelectedEffectiveEndDateTime != "" && isOnload)
	            {
	                effectiveDateRange.Items[1].Value       = globalUtility.SelectedEffectiveEndDateTime[0].Id;
	                effectiveDateRange.Items[1].ValueString = globalUtility.SelectedEffectiveEndDateTime[0].Id;
	            }

	            items.push(effectiveDateRange);
	            refinerDS.push(refinerModel.Set(parent, items, true));

	            if (globalUtility.SelectedEffectiveStartDateTime != "" && globalUtility.SelectedEffectiveEndDateTime != "") {
	                baseService.Publish('shell:addSelectedRefiner', effectiveDateRange);
	            }
	           
				items = [];
				parent = "EXPIRATION DATE";

	            var expirationDateRange = refinerModel.SetDateRange(refinerType.ExpirationStartDateTime, refinerType.ExpirationEndDateTime, parent);
	            if (globalUtility.SelectedExpirationStartDateTime != "" && isOnload)
	            {
	                expirationDateRange.Items[0].Value       = globalUtility.SelectedExpirationStartDateTime[0].Id;
	                expirationDateRange.Items[0].ValueString = globalUtility.SelectedExpirationStartDateTime[0].Id;
	            }
	            if (globalUtility.SelectedExpirationEndDateTime != "" && isOnload)
	            {
	                expirationDateRange.Items[1].Value       = globalUtility.SelectedExpirationEndDateTime[0].Id;
	                expirationDateRange.Items[1].ValueString = globalUtility.SelectedExpirationEndDateTime[0].Id;
	            }

	            items.push(expirationDateRange);
	            refinerDS.push(refinerModel.Set(parent, items, true));

	            if (globalUtility.SelectedExpirationStartDateTime != "" && globalUtility.SelectedExpirationEndDateTime != "") {
	                baseService.Publish('shell:addSelectedRefiner', expirationDateRange);
	            }
	            
				items = [];
				parent = "POSTED DATE";

	            var postedDateRange = refinerModel.SetDateRange(refinerType.PostedStartDateTime, refinerType.PostedEndDateTime, parent);
	            if (globalUtility.SelectedPostedStartDateTime != "" && isOnload)
	            {
	                postedDateRange.Items[0].Value       = globalUtility.SelectedPostedStartDateTime[0].Id;
	                postedDateRange.Items[0].ValueString = globalUtility.SelectedPostedStartDateTime[0].Id;
	            }
	            if (globalUtility.SelectedPostedEndDateTime != "" && isOnload)
	            {
	                postedDateRange.Items[1].Value       = globalUtility.SelectedPostedEndDateTime[0].Id;
	                postedDateRange.Items[1].ValueString = globalUtility.SelectedPostedEndDateTime[0].Id;
	            }

	            items.push(postedDateRange);
	            refinerDS.push(refinerModel.Set(parent, items, true));

	            if (globalUtility.SelectedPostedStartDateTime != "" && globalUtility.SelectedPostedEndDateTime != "") {
	                baseService.Publish('shell:addSelectedRefiner', postedDateRange);
	            }

	            setUnAvailableRefinerFromSearchWizard(itemsCopy);

	            var keywordRefiner = globalUtility.GetPreselectedKeywordRefiner();
	            if(keywordRefiner != undefined) baseService.Publish('shell:addSelectedRefiner', keywordRefiner);

				baseService.Publish('shell:setRefinerDataSource', refinerDS);
				baseService.IsBusy(false);

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
				//searchCertificates(initialSearchLimit, 0, selectedRefiners);
				var criteria = {
					SelectedRefiners: selectedRefiners,
					CultureTypeId: globalUtility.SelectedLanguage
				}

				if ($scope.newsPage == false) {
					getAllNewsWorkflow(criteria);
				}
				else {
					getAllNews(criteria);
				}
			};

			var addSelectedRefiner = function (event, data) {

			    if ($scope.selectedRefiners.map(function (ref) { return ref.Value; }).indexOf(data.Value) === -1) {
			        $scope.selectedRefiners.push(data);
                }

			    baseService.Publish('shell:addSelectedModuleRefiner', { Refiner: data });

			    if (!initialLoad && !isFavorite) {
			        baseService.AddToGlobalRefiners(data);
			        searchViaRefiners();
			    }

			    //if (data.IsDateRange) {
			    //    var temp = $filter('filter')($scope.selectedRefiners, function (value, index) { return value.Parent == data.Parent; });
			    //    if (temp.length == 0) {
			    //        if ($scope.selectedRefiners.map(function (ref) { return ref.Value; }).indexOf(data.Value) === -1) {
			    //            $scope.selectedRefiners.push(data);
			    //        }

			    //        baseService.AddToGlobalRefiners(data);

			    //        searchViaRefiners();
			    //    }
			    //} else {

			    //    if ($scope.selectedRefiners.map(function (ref) { return ref.Value; }).indexOf(data.Value) === -1) {
			    //        $scope.selectedRefiners.push(data);
			    //    }

			    //    baseService.AddToGlobalRefiners(data);
			    //    if (isSetRefinerSouceCompleted) {
			    //        searchViaRefiners();
			    //    }
			    //}

				// console.log($scope.selectedRefiners);
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


			var onAddNews = function (event, data) {
				var message = "";
				message = data.Success;
				if (data.HasErrors) {
					angular.forEach(data.Errors, function (error) {
						this.push(error);
					}, message);
				}
				bsAlertService.Show(message, data.HasErrors ? enums.AlertType.Warning : enums.AlertType.Success, false);
				isOnload = false;
				initiallizeItems();
			};

			//LOAD MORE USING SCROLL
			$scope.newsLimit = 14;
			$scope.LoadMore = function () {
				if ($scope.newsLimit < $scope.news.length) {
					$scope.newsLimit += 5;
				}

				//var selectedRefiners = [];
				//if ($scope.selectedRefiners.length > 0) {
				//    angular.forEach($scope.selectedRefiners, function (refiner) {
				//        if (refiner.IsDateRange) {

				//            this.push({ RefinerType: refiner.Items[0].Type, RefinerValueId: refiner.Items[0].ValueString })
				//            this.push({ RefinerType: refiner.Items[1].Type, RefinerValueId: refiner.Items[1].ValueString })

				//        } else {
				//            this.push({ RefinerType: refiner.Type, RefinerValueId: refiner.Id })
				//        }

				//    }, selectedRefiners);
				//}

				//searchNews(20, lastRowIDReturned, selectedRefiners);

				//$scope.gridApi.infiniteScroll.dataLoaded();
			};

			var mode = enums.Mode.Add;
			var paramData = [];
			var openModal = function () {
				var param = {
					Mode: mode,
					Data: (openModal == enums.Mode.add) ? null : paramData,
					LookUps: globalUtility.NewsLookUps
				};
				console.log(param);
				if (mode = enums.Mode.Add) {
					dialogService.Dialog.WithTemplateAndController("newsAddEditDialog.html", "newsAddEditController", enums.ModalSize.Large, param);
				}
				//else if (mode = enums.Mode.ViewWF) {
				//    dialogService.Dialog.WithTemplateAndController("newsWorkflowDetails.html", "newsAddEditController", enums.ModalSize.Large, param);
				//}
				//else {
				//    dialogService.Dialog.WithTemplateAndController("Settings.html", "newsAddFavoriteController", "sm", param);
				//}
			};

			var onGetLookUps_Completed = function (response) {
				baseService.IsBusy(false);
				globalUtility.NewsLookUps = response.Data;
				openModal();
			};

			var onGetLookUpsForViewDetails_Completed = function (response) {
				baseService.IsBusy(false);
				globalUtility.NewsLookUps = response.Data;

				var param = {
					Mode: mode,
					Data: paramData,
					LookUps: globalUtility.NewsLookUps
				};
				console.log(param);

				dialogService.Dialog.WithTemplateAndController("newsWorkflowDetails.html", "newsAddEditController", enums.ModalSize.Large, param);
			};

			//OPEN MODAL FOR ADD NEWS
			$scope.AddNews = function () {
				mode = enums.Mode.Add;
				//openModal();
				if (globalUtility.NewsLookUps.length == 0) {
					baseService.IsBusy(true);
					newsService.GetAllLookups(onGetLookUps_Completed);
				} else {
					openModal();
				}
				//dialogService.Dialog.WithTemplateAndController("newsAddEditDialog.html", "newsAddEditController", "lg");
			}

			//OPEN MODAL FOR ADD FAVORITE
			$scope.AddFavoriteNews = function () {
				dialogService.Dialog.WithTemplateAndController("NewsAddFavoriteDialog.html", "newsAddFavoriteController", "sm");
			}

			//$scope.Preferences = function () {
			//    dialogService.Dialog.WithTemplateAndController("Settings.html", "newsAddFavoriteController", "sm");
			//}

			//OPEN MODAL FOR EDIT
			$scope.EditNews = function (data) {
				mode = enums.Mode.Edit;
				paramData = data;
				//openModal();
				//dialogService.Dialog.WithTemplateAndController("newsAddEditDialog.html", "newsAddEditController", "lg");
				if (globalUtility.NewsLookUps.length == 0) {
					baseService.IsBusy(true);
					newsService.GetAllLookups(onGetLookUps_Completed);
				} else {
					openModal();
				}
			}

			//OPEN BY NEWS TITLE
			//$scope.openNewsTitle = function (data) {
			//    dialogService.Dialog.WithTemplateAndController("NewsTitlePreview.html", "newsAddEditController", enums.ModalSize.Large, data);
			//}

			var onGetWorkflow_Completed = function (response) {
				//$scope.workflowGrid.data = response;
				//$scope.newsGrid.data = angular.copy($scope.news);

				if (response.Success) {
					//lastRowIDReturned = response.Data.LastRowIdReturned;
					//totalRows = response.Data.TotalRows;

					$scope.newsWorkflow = newsWorkflowModel.Set(response.Data.NewsWorkFlows);
				}
				else {
					lastRowIDReturned = 0;
					currentTotalRow = 0;
					totalRows = 0;
					$scope.newsWorkflow = [];
					bsAlertService.Show(response.ErrorMessage, enums.AlertType.Error);
				}
				$scope.workflowGrid.data = angular.copy($scope.newsWorkflow);

				$scope.showGridLoader = false;
				initialLoad = false;
				isFavorite = false;
			};
			var onGetWorkflowRefiners_Completed = function (response) {

				var refinerDS = [], items = [], parent = "", itemsCopy = [];

				var pushItemsCopy = function (toCopy) {
					angular.forEach(toCopy, function (itemToCopy) {
						this.push(itemToCopy);
					}, itemsCopy);
				};

				if (response.Data.Sector.length > 0) {
					items = [];
					parent = "REGULATORY CATEGORY";
					angular.forEach(response.Data.Sector, function (item) {

						var checked = false;
						if (globalUtility.SelectedSector != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedSector, function (value, index) { return value.CoveredSectorId == item.CoveredSectorId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CoveredSector, item.CoveredSectorId, item.CoveredSector, parent, checked));
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.Region.length > 0) {
					items = [];
					parent = "REGION";
					angular.forEach(response.Data.Region, function (item) {

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

				if (response.Data.Country.length > 0) {
					items = [];
					parent = "COUNTRY";
					angular.forEach(response.Data.Country, function (item) {

						var checked = false;
						if (globalUtility.SelectedCountry != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedCountry, function (value, index) { return value.id == item.CountryItemId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.Country, item.CountryItemId, item.CountryName, parent, checked));
					}, items);
					//angular.forEach(response.Data.Country, function (item) {
					//    this.push(refinerModel.Item(refinerType.Region, item.CountryItemId, item.CountryName, parent));
					//}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}

				if (response.Data.ComplianceProgram.length > 0) {
					items = [];
					parent = "COMPLIANCE PROGRAM";
					angular.forEach(response.Data.ComplianceProgram, function (item) {

						var checked = false;
						if (globalUtility.SelectedComplianceProgram != "" && isOnload) {
							var temp = $filter('filter')(globalUtility.SelectedComplianceProgram, function (value, index) { return value.SchemaId == item.CertificateProgramId; });
							checked = temp.length > 0;
						}
						this.push(refinerModel.Item(refinerType.CertScheme, item.CertificateProgramId, item.CertificateProgramName, parent, checked));
					}, items);
					pushItemsCopy(items);
					refinerDS.push(refinerModel.Set(parent, items));
				}

				//setUnAvailableRefinerFromSearchWizard(itemsCopy);

				baseService.Publish('shell:setRefinerDataSource', refinerDS);
				baseService.IsBusy(false);
			};

			//WHEN WORKFLOW TRACKING WAS CLICKED
			$scope.WorkflowTracking = function () {
				getAllNewsWorkflow();
				newsService.GetNewsWorkFlowAllRefiners(onGetWorkflowRefiners_Completed);
				$scope.showGridLoader = true;
				$scope.newsPage = false;
				$scope.workflowPage = true;
			}
			$scope.BackToList = function () {
				initiallizeItems();
				getAllNews();

				$scope.newsPage = true;
				$scope.workflowPage = false;
			}

			$scope.viewDetails = function (data) {
				mode = enums.Mode.ReviewNews;
				workflowItem = data; 
				if (data.WorkflowChangeRequest == false) {
					paramData = [];
					paramData = data;
					newsService.GetAllLookups(onGetLookUpsForViewDetails_Completed);
				}
				else {
					if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
						var param = {
							CountryName: data.WorkflowCountryName,
							CountryTradeGroup: data.WorkflowCountryTradeGroupNames,
							SectorsRegulated: data.WorkflowCoveredSectorName,
							ComplianceProgram: data.WorkflowComplianceProgramNames,
							CountryIds: data.WorkflowCountryIds,
							CountryTradeGroupId: data.WorkflowCountryTradeGroupIds,
							CoveredSectorId: data.WorkflowCoveredSectorIds,
							ComplianceProgramId: data.WorkflowComplianceProgramIds,
							Scope: enums.ModuleType.News,
							WorkflowDetails: data.WorkflowDetails,
							WorkflowLink: data.WorkflowLink,
							WorkflowItemId: data.NewsWorkflowId,
							CreatedBy: globalUtility.CurrentUser,
							ModifiedBy: $scope.mode == enums.Mode.Add ? null : globalUtility.CurrentUser,
							IsDiabled: false
						};
					}
					else {
						var param = {
							CountryName: data.WorkflowCountryNames,
							CountryTradeGroup: data.WorkflowCountryTradeGroupNames,
							SectorsRegulated: data.WorkflowSectorNames,
							ComplianceProgram: data.WorkflowComplianceProgramNames,
							CountryIds: data.WorkflowCountryIds,
							CountryTradeGroupId: data.WorkflowCountryTradeGroupIds,
							CoveredSectorId: data.WorkflowCoveredSectorIds,
							ComplianceProgramId: data.WorkflowComplianceProgramIds,
							Scope: enums.ModuleType.News,
							WorkflowDetails: data.WorkflowDetails,
							WorkflowLink: data.WorkflowLink,
							WorkflowItemId: data.NewsWorkflowId,
							CreatedBy: globalUtility.CurrentUser,
							ModifiedBy: $scope.mode == enums.Mode.Add ? null : globalUtility.CurrentUser,
							IsDiabled: true
						};
					}
					//newsWorkflowDetails.html
					//dialogService.Dialog.WithTemplateAndController("changeRequestForm.html", "newsWorkflowController", enums.ModalSize.Large, param);
					//if nes item id is not null 
					//call function same as edit
					//
					dialogService.Dialog.WithTemplateAndController("changeRequestDetails.tpl.html", "changeRequestDetailsController", enums.ModalSize.Medium, param);
				}
				//paramData = data;

			}

			//EXPORT NEWS ITEM TO PDF
			$scope.ExportNewsToPDF = function () {

				var callBack = function (response) {

					var convertedData = [];
					var imageArticlePicture = [];

					var GetDateString = function (date) {
						var d = new Date(date);
						var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
						var m = months[d.getMonth()];
						return d.getDate().toString() + " " + m + " " + d.getFullYear();
					};

					if (response == enums.CallbackType.Cancel) return;

					angular.forEach($scope.news, function (exportNewsItem) {

						if (exportNewsItem.IsChecked == true) {
							//var strDetails = exportNewsItem.Details.replace(/(?:r\n|\r|\n)/g, '<br/>');
							var canvas = document.createElement('div');
							canvas.innerHTML = exportNewsItem.Details;
							var newsDetails = canvas;

							var rowToExport = [
								exportNewsItem.Title,
								GetDateString(exportNewsItem.Posted),
								exportNewsItem.SectorRegulatedName,
								exportNewsItem.CountryName,
								exportNewsItem.ComplianceProgramName,
								exportNewsItem.Category,
								exportNewsItem.PostedBy,
								exportNewsItem.Image,
								exportNewsItem.ImageCaption,
								newsDetails
							];
							convertedData.push(rowToExport);
						}
					})

					var tempData = [];

					angular.forEach(convertedData, function (item) {
						var arr = [];

						arr.push({
							text: item[0],
							fontSize: 24,
							bold: true
						})
						arr.push({
							text: "\nPosted: " + item[1] + " | Regulatory Category: " + item[2]
							+ " | Country: " + item[3] + " | Compliance Program: " + item[4]
							+ " | Category: " + item[5],
							fontSize: 12
						})
						arr.push({
							text: "\nBy " + item[6],
							fontSize: 12
						})
						if (item[7] !== 'data:image/png;base64,bnVsbA==') {
							arr.push('\n')
							arr.push({
								image: item[7],
								width: 300
							})
							arr.push({
								text: item[8],
								fontSize: 10,
								italics: true
							})
						}
						arr.push('\n')
						arr.push({
							text: item[9].innerText,
							fontSize: 12
						})
						arr.push('\n\n\n')
						this.push(arr);
					}, tempData);

					var docDefinition = {
						pageOrientation: 'portrait',
						pageSize: 'TABLOID',
						pageMargins: [40, 60, 40, 60],
						content: tempData
					};

					var fileName = 'news.pdf';

					if (isIE()) {
						downloadPDF(fileName, docDefinition);
					} else {
						pdfMake.createPdf(docDefinition).download("news.pdf");
					}

					function isIE() {
						var match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
						return match ? parseInt(match[1]) : false;
					}

					function downloadPDF(fileName, docDefinition) {
						var D = document;
						var a = D.createElement('a');
						var strMimeType = 'application/octet-stream;charset=utf-8';
						var rawFile;
						var ieVersion;

						ieVersion = isIE();
						var doc = pdfMake.createPdf(docDefinition);
						var blob;

						doc.getBuffer(function (buffer) {
							blob = new Blob([buffer]);

							if (ieVersion && ieVersion < 10) {
								var frame = D.createElement('iframe');
								document.body.appendChild(frame);

								frame.contentWindow.document.open("text/html", "replace");
								frame.contentWindow.document.write(blob);
								frame.contentWindow.document.close();
								frame.contentWindow.focus();
								frame.contentWindow.document.execCommand('SaveAs', true, fileName);

								document.body.removeChild(frame);
								return true;
							}

							// IE10+
							if (navigator.msSaveBlob) {
								return navigator.msSaveBlob(
									blob, fileName
								);
							}
						});
					}
				}
				var message = "The selected results will be exported to PDF";
				var title = "EXPORT RESULTS";

				dialogService.Dialog.Confirm(enums.ConfirmType.OkCancel, message, title, enums.ModalSize.Small, callBack);
			};

			//GRID OPTIONS - WORKFLOW TRACKING GRID
			if (globalUtility.Coordinator || globalUtility.Contributor || globalUtility.ContentAdmin || globalUtility.Reader || globalUtility.TranslatorJapanese || globalUtility.TranslatorChinese || globalUtility.SalesReader) {
				$scope.columnsWorkflow = [
					{
						field: 'View',
						name: '  View',
						width: '10%',
						cellTemplate:
						'<div><a style="padding-left:5px;"><span style="cursor:pointer" ng-click="grid.appScope.viewDetails(row.entity)">View Details</span></a></div>',
						enableSorting: true
					}
				];
			}
			else {
				$scope.columnsWorkflow = [];
			}

			var gridSelectionChanged = function (data) {
				$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
			};
			var gridBacthSelectionChanged = function (data) {
				$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
			};

			$scope.gridSelections = [];

			$scope.workflowGrid = {
				enableColumnMenus: false,
				enableHiding: false,
				enableSorting: true,
				enableColumnResizing: true,
				columnDefs: $scope.columnsWorkflow,
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

			init();

			$scope.$on('$destroy', function () {

			    var events = ['shell:addSelectedRefiner', 'shell:removeSelectedRefiner', 'newsModule:addNews', 'shell:refinerSetCompleted', 'shell:clearAllSelectedRefiners', 'shell:loadPreselectedRefiners', 'shell:refreshRefinersNews'];
				baseService.UnSubscribe(events);
			});

		}]);
});
