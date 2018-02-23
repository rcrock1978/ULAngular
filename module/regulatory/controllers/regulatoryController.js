
define([
	'app',
	'globalUtility',
	'enums',
	'routeResolver',
	'shell/model/refinerModel',
], function (app, globalUtility, enums, routeResolver, refinerModel) {

	app.register.controller('regulatoryController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'regulatoryService', 'exportService', '$timeout',
		function ($scope, $http, $rootScope, $filter, baseService, dialogService, regulatoryService, exportService, $timeout) {
			//"global" variables
			var channel            = new kernel.messaging.channel(window.parent);
			var columns            = [];
			var currentView        = 'list';
			var keyword            = '';
			var initialLoad        = true;
			var isFavorite         = false;
			var maxNoOfItems       = 200;
			var page               = 1;
			var perPageLoad        = 20;
			var workflowRefiners   = [];
			var refinerDSCopy      = [];
			var regulatoryRefiners = [];

			//viewmodel/bindable members
			$scope.downloadToExcel      = downloadToExcel;
			$scope.gridSelections       = [];
			$scope.isUserContributor    = false;
			$scope.isWorkflow           = false;
			$scope.manageData           = manageData;
			$scope.modalTemplateUrl     = routeResolver.GetModuleTemplateURL(globalUtility.CurrentPage, "regModal");
			$scope.openEvidence         = openEvidence;
			$scope.regulations          = [];
			$scope.regulatoryGrid       = {};
			$scope.removeRefiner        = removeRefiner;
			$scope.selectedRefiners     = [];
			$scope.showWorkflowChanges  = showWorkflowChanges;
			$scope.switchView           = switchView;
			$scope.switchViewLink       = 'WORKFLOW TRACKING';
			$scope.viewWorkflowDetails  = viewWorkflowDetails;
			$scope.evidenceSource       = [];
			$scope.evidenceDocumentType = [];


			init();

			//function implementations
			////////////// 

			function addSelectedRefiner(event, data) {

			    if ($scope.selectedRefiners.map(function (ref) { if (ref.Type === data.Type) { return ref.Value; } }).indexOf(data.Value) === -1) {
					$scope.selectedRefiners.push(data);
			    }

			    baseService.Publish('shell:addSelectedModuleRefiner', { Refiner: data });

				page = 1;

				//reset data for each refiner
				$scope.regulations = [];

				if (!initialLoad && !isFavorite) {
					baseService.AddToGlobalRefiners(data);

					//populateGridData();
					populateData();
				}
			}

			// auto-dimension of cells (css) need to force align rows in all containers (left and right pinning)
			// https://github.com/angular-ui/ui-grid/issues/3239
			// http://plnkr.co/edit/JwbEmPhJq2LInfUNncdi?p=preview
			function alignContainers(gridContainer, grid) {
				var rows = angular.element(gridContainer + ' .ui-grid .ui-grid-render-container-body .ui-grid-row');
				var pinnedRowsLeft = angular.element(gridContainer + ' .ui-grid .ui-grid-pinned-container-left .ui-grid-row');
				var gridHasRightContainer = grid.hasRightContainer();
				if (gridHasRightContainer) {
					var pinnedRowsRight = angular.element(gridContainer + ' .ui-grid .ui-grid-pinned-container-right .ui-grid-row');
				}

				var bodyContainer = grid.renderContainers.body;

				// get count columns pinned on left
				var columnsPinnedOnLeft = grid.renderContainers.left.renderedColumns.length;

				for (var r = 0; r < rows.length; r++) {
					// Remove height CSS property to get new height if container resized (slidePanel)
					var elementBody = angular.element(rows[r]).children('div');
					elementBody.css('height', '');
					var elementLeft = angular.element(pinnedRowsLeft[r]).children('div');
					elementLeft.css('height', '');
					if (gridHasRightContainer) {
						var elementRight = angular.element(pinnedRowsRight[r]).children('div');
						elementRight.css('height', '');
					}

					// GET Height when set in auto for each container
					// BODY CONTAINER
					var rowHeight = rows[r].offsetHeight;
					// LEFT CONTAINER
					var pinnedRowLeftHeight = 0;
					if (columnsPinnedOnLeft) {
						pinnedRowLeftHeight = pinnedRowsLeft[r].offsetHeight;
					}
					// RIGHT CONTAINER
					var pinnedRowRightHeight = 0;
					if (gridHasRightContainer) {
						pinnedRowRightHeight = pinnedRowsRight[r].offsetHeight;
					}
					// LARGEST
					var largest = Math.max(rowHeight, pinnedRowLeftHeight, pinnedRowRightHeight);

					// Apply new row height in each container
					elementBody.css('height', largest);
					elementLeft.css('height', largest);
					if (gridHasRightContainer) {
						elementRight.css('height', largest);
					}

					// Apply new height in gridRow definition (used by scroll)
					bodyContainer.renderedRows[r].height = largest;
				}
				// NEED TO REFRESH CANVAS
				bodyContainer.canvasHeightShouldUpdate = true;
			};
			// END alignContainers()

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

			function createNewColumn(field, name, width, cellTemplate, hide) {
				return {
					field: field,
					name: name,
					width: width,
					cellTemplate: cellTemplate,
					enableColumnMenu: false,
					visible: !hide
				}
			}

			function downloadToExcel() {
				//implement download to excel
				var callBack = function (response) {
					if (response == enums.CallbackType.Cancel) return;

					//export to array
					var data = [];
					var dataHeader = [];

					angular.forEach(columns, function (head) {
					    if (isPartOfExport(head)) {
							this.push(head.name);
						}
					}, dataHeader);

					dataHeader.push("Remarks");
					//export to array
					data.push(dataHeader);

					angular.forEach($scope.gridSelections, function (item) {

						var dataRow = [];

						dataRow = exportData(item, dataRow);

						data.push(dataRow);

					});
					exportService.ExportArrayToExcel(data, "Regulatory");
				};

				var message = "The selected items will be exported to excel.";
				var title = "Export Results";

				dialogService.Dialog.Confirm(enums.ConfirmType.OkCancel, message, title, enums.ModalSize.Small, callBack);

				////////////
				function exportData(item, dataRow) {
					switch (currentView) {
						case 'list':
							//export to array
							dataRow.push(item.Region);
							dataRow.push(item.RegionalEconomicUnion);
							dataRow.push(item.Country);
							dataRow.push(item.RegulationName);
							dataRow.push(item.CertificationProgram);
							dataRow.push(item.SectorRegulated);
							dataRow.push(item.Mark);
							dataRow.push(item.RegulatoryAuthority);
							dataRow.push(item.CertificationOrganization);
							dataRow.push(item.ComplianceModelId);
							dataRow.push(item.ProductType);
							dataRow.push(item.ProductSubType);
							dataRow.push(item.HowProductConnectedToPower);
							dataRow.push(item.ScopedProductList);
							dataRow.push(item.FrequencyAndTechnology);
							dataRow.push(item.Scope);
							dataRow.push(item.RFRangeLower);
							dataRow.push(item.RangeUpper);
							dataRow.push(item.Unit);
							dataRow.push(item.OperatingFrequencyAndChannels);
							dataRow.push(item.OutputPower);
							dataRow.push(item.PowerDensity);
							dataRow.push(item.ChannelSpacing);
							dataRow.push(item.Bandwidth);
							dataRow.push(item.DutyCycleEtc);
							dataRow.push(item.DFS);
							dataRow.push(item.TPC);
							dataRow.push(item.IndoorUseOnly);							
							dataRow.push(item.TechnicalStandard);
							dataRow.push(item.Exceptions);
							dataRow.push(item.ExceptionsList);
							dataRow.push(item.SupplementInformationOfExceptions);
							dataRow.push(item.CertificationLimitation);
							dataRow.push(item.ModularApproval);
							dataRow.push(item.AcceptedTestReport);
							dataRow.push(item.ApplicationType);
							dataRow.push(item.SampleRequirementTestReport);
							dataRow.push(item.InCountrytesting);
							dataRow.push(item.TestingOrganization);
							dataRow.push(item.LocalRepresentative);
							dataRow.push(item.LocalRepService);
							dataRow.push(item.MarkingRequirement);
							dataRow.push(item.ManualRequirement);
							dataRow.push(item.DetailsOfMarkingOrManual);
							dataRow.push(item.ElectronicLabelAccepted);
							dataRow.push(item.InitialFactoryInspection);
							dataRow.push(item.CertificateValidityPeriod);
							dataRow.push(item.CertificateMaintenance);
							dataRow.push(item.WebPublicationOfProductDetails);
							dataRow.push(item.WebAddress);
							dataRow.push(item.PublishedContents);
							dataRow.push(item.PublicationTiming);
							dataRow.push(item.ShortTermConfidentialityPolicy);
							dataRow.push(item.Leadtime);
							dataRow.push(item.Voltage);
							dataRow.push(item.Frequency);
							dataRow.push(item.PlugType);
							dataRow.push(item.IECEEMembershipOfTheCountry);
							dataRow.push(item.BandInformation);
							dataRow.push(item.Carrier);
							dataRow.push(item.SARLimit);
							dataRow.push(item.SARParts);
							dataRow.push(item.RemarksEvidence);							
							break;
						case 'workflow':
							dataRow.push(item.RegulatoryCategory);
							dataRow.push(item.Region);
							dataRow.push(item.Country);
							dataRow.push(item.ComplianceProgram);
							dataRow.push(item.OriginalInformation);
							dataRow.push(item.UpdatedInformation);
							dataRow.push(item.Source);
							dataRow.push(item.Links.map(function (l) { return l.m_Item3 }).join(', '));
							dataRow.push(item.WorkflowStatus);
							dataRow.push(item.DateSubmitted);
							break;
					}

					return dataRow;
				}

				function isPartOfExport(head) {
				    var ret = false;

				    if (head.name.trim() !== '' && head.name.trim() !== 'Module Tab' && head.name.trim() !== 'Item Id'
                        && head.name.trim() !== 'Field Changes' && head.name.trim() !== 'Created By'
                        && head.name.trim() !== 'ComplianceProgramId' && head.name.trim() !== 'RegulatoryCountryInformationId'
                        && head.name.trim() !== 'RegulatoryAuthorityId' && head.name.trim() !== 'FrequencyTechnologyId'
                        && head.name.trim() !== 'ProductTypeId' && head.name.trim() !== 'RegulatoryTestingAndValidityId') {
				        ret = true;
				    }
                    
				    return ret;
                }
			}

			function init() {
				//enable search
				toggleSearchButtons(true);

				initKernelSubscriptions();

				initUserRoles();

			    //set subscriptions
				if (initialLoad) {
				    baseService.Subscribe('shell:refreshRefinersRegulatory', refreshRefinersRegulatory);
				    baseService.Subscribe('shell:addSelectedRefiner', addSelectedRefiner);
				    baseService.Subscribe('shell:removeSelectedRefiner', removeSelectedRefiner);
				    baseService.Subscribe('shell:refinerSetCompleted', populateData);
				    baseService.Subscribe('shell:clearAllSelectedRefiners', function () {
				        $scope.selectedRefiners = [];
				    });
				}

				setupGridParameters();

				loadRefiners();
				loadAllRefiners();

				regulatoryService.getEvidenceLookups(function (data) {
					if (data) {
						$scope.evidenceSource = data.Data.EvidenceSourceList;
						$scope.evidenceDocumentType = data.Data.DocumentTypeList;
					}
				});
			}

			function initKernelSubscriptions() {
				//search
				var subscriber = new kernel.messaging.subscriber('SmartInsight Regulatory', 'searchFilter', function (command) {
					keyword = command.arg;

					var keywordRefiner = {
						Checked: '',
						Id: keyword.length > 50 ? keyword.slice(0, 50) : keyword,
						IsDateRange: false,
						Parent: 'KEYWORD',
						Type: 'keyword',
						Value: keyword.length > 50 ? keyword.slice(0, 50) : keyword
					};

					var typeList = $scope.selectedRefiners.map(function (r) { return r.Type; });
					var keyWordIndex = typeList.indexOf('keyword');

					$scope.selectedRefiners.splice(keyWordIndex, 1);

					addSelectedRefiner({}, keywordRefiner);
				});
				channel.register(subscriber);


			}

			function initUserRoles() {
				if (globalUtility.Contributor || globalUtility.Coordinator || globalUtility.ContentAdmin) {
					$scope.isUserContributor = true;
				}
			}

			function loadPreselectedRefiners() {
				var params = {};
					regulatoryService.getRefiners(params, function (response) {
	                baseService.IsBusy(false);
	                var preselectedRefiners = globalUtility.GetPreselectedRefiners();
	                var refinerDS = regulatoryService.buildRefiners(response.Data, preselectedRefiners);
	                baseService.Publish('shell:setRefinerDataSource', refinerDS);
	             //   bsAlertService.Show(response.Data.Message, enums.AlertType.Success);
	            });
			}

			function loadAllRefiners() {
			    var params = {};
			    baseService.IsBusy(true);
			    regulatoryService.getAllRefiners(params, onGetAllRefiners_Completed) //workflow

			    function onGetAllRefiners_Completed(response) {
			        var refinerDS = [];
			        baseService.IsBusy(false);
			        if (response.Data.length !== 0) {

			            //get preselected refiners from homepage
			            var preselectedRefiners = {
			                    preselectedComplianceProgram: [],
			                    preselectedCountry: [],
			                    preselectedSector: [],
			                    preselectedRegion: [],
			                };

			            refinerDS = regulatoryService.buildWorkFlowRefiners(response.Data, preselectedRefiners);

			            //regulatoryRefiners = refinerDS;
			            workflowRefiners = refinerDS;
			        }
			    }
			}

			function loadRefiners() {
				var params = {};
				baseService.IsBusy(true);
				regulatoryService.getRefiners(params, onGetRefiners_Completed);

				////////////

				function onGetRefiners_Completed(response) {
					var refinerDS = [];
					baseService.IsBusy(false);
					if (response.Data.length !== 0) {
						//get preselected refiners from homepage
						var preselectedRefiners = globalUtility.GetPreselectedRefiners();

						refinerDS = regulatoryService.buildRefiners(response.Data, preselectedRefiners);

						var keywordRefiner = globalUtility.GetPreselectedKeywordRefiner();
						if (keywordRefiner != undefined) baseService.Publish('shell:addSelectedRefiner', keywordRefiner);

						//send refiners to left nav
						var addNotAvailableRefiner = function (data) {
							$scope.selectedRefiners.push(data);
							baseService.AddToGlobalRefiners(data);
						}
						var allowed = ["country", "region", "sector", "compliance program", "application type", "prodtype", "prodsubtype", "freqtech", "powersource"];
						globalUtility.SetNotAvailableRefiners(refinerDS, allowed, addNotAvailableRefiner);
						baseService.Publish('shell:setRefinerDataSource', refinerDS);

						regulatoryRefiners = refinerDS;
					    //workflowRefiners = loadAllRefiners();
					}

					////////////

					function getWorkflowRefiners(refinerDS) {
						var categoryList = refinerDS.map(function (r) { return r.Category });
						var workFlowCategories = ['REGULATORY CATEGORY', 'REGION', 'COUNTRY', 'COMPLIANCE PROGRAM'];
						var filteredRefiners = []

						workFlowCategories.forEach(function (element, index, array) {
							filteredRefiners.push(refinerDS[categoryList.indexOf(element)]);
						});

						return filteredRefiners;
					}

					//   populateGridData();

					//   initialLoad = false;
				}
			}

			function manageData() {
				//var modalInstance = dialogService.Dialog.WithTemplateAndControllerInstance("RegulatoryCustomizeViewDialog.html", "regulatoryAddEditController", "lg", $scope.popupParameter);
				var modalInstance = dialogService.Dialog.WithTemplateAndControllerInstanceAndClass("regModalDialog.html", "regulatoryAddEditController", "lg", $scope.popupParameter, 'manageDataModal');
				modalInstance.result.then(function (data) {
					if (data === true) {
						//populateGridData();
					    //populateData();
					    loadRefiners();
					}
				}, function (error) {
				});
			}

			function openEvidence(evidence) {
				//alert('open evidence');
				var evidenceId = evidence.m_Item2;
				var fileName = evidence.m_Item3;

				regulatoryService.openEvidence(evidenceId, onOpenEvidence_Completed);

				//////////////
				function onOpenEvidence_Completed(response) {
					if (response.Message == enums.ResponseType.Success) {
						var blob = new Blob([response.Data], { type: "application/octet-stream" });
						saveAs(blob, fileName);
					}
					baseService.IsBusy(false);
				}
			}

			function populateData() {
				switch (currentView) {
					case 'list':
						populateGridData();
						break;
					case 'workflow':
						populateGridDataWorkflow();
						break;
					default:
						populateGridData();
						break;
				}
			}

			function populateGridData() {
				baseService.IsBusy(true);
				var typeAheadList = [];

				var dataTemp = [];
				var responseTemp = [];
				//call service here
				var data = {
					Refiners: globalUtility.GetRefinerList($scope.selectedRefiners),
					Page: page,
					RowsToReturn: page === 1 ? maxNoOfItems : perPageLoad
				};
				//regulatoryService.getAll(data, onGetAll_Completed);


				var index = -1;
				for (var i = 0; i < data.Refiners.length; ++i) {
					if (data.Refiners[i].RefinerType == "keyword") {
						index = i;
						break;
					}
				}



				if (index != -1) {
					var str = data.Refiners[index].RefinerValueId;
					var n = str.indexOf(",");
					if (n != -1) {
						var arrayStr = str.split(',');
						async.map(arrayStr, exeregulatoryService, function (err, results) {
							// Square has been called on each of the numbers
							// so we're now done!
							console.log("Finished!");
						});

						function exeregulatoryService(key, doneCallback) {
							console.log(key.trim());
							data.Refiners[index].RefinerValueId = key.trim();

							var vr = [];
							var vRefiners = {
								RefinerType: data.Refiners[index].RefinerType,
								RefinerValueId: key.trim()
							};
							vr.push(vRefiners);
							var datam = {
								Page: data.Page,
								Refiners: vr,
								RowsToReturn: data.RowsToReturn
							};
							console.log(datam);
							regulatoryService.getAll(datam, function (response) {
								if (response.Success === true && response.Data.RegulatoryList.length !== 0) {
									responseTemp = response;
									dataTemp = dataTemp.concat(response.Data.RegulatoryList);
									responseTemp.Data.RegulatoryList = dataTemp;
									onGetAll_Completed(responseTemp);
								}
								return doneCallback(null);
							});

						}


					}
					else {
						regulatoryService.getAll(data, onGetAll_Completed);
					}

				} else {
					regulatoryService.getAll(data, onGetAll_Completed);
				}



				//////////////

				function onGetAll_Completed(response) {
					var stillMoreData = true;

					if (response.Success === true && response.Data.RegulatoryList.length !== 0) {
						if (page === 1) {
							$scope.regulations = response.Data.RegulatoryList;
							angular.forEach($scope.regulations, function (data) {
								if (data.RowStatus === 1) {
									data.Status = "New";
								}
								else if (data.RowStatus === 2) {
									data.Status = "Updated";
								}
							})
						}
						else {
							$scope.regulations = $scope.regulations.concat(response.Data.RegulatoryList);
							angular.forEach($scope.regulations, function (data) {
								if (data.RowStatus === 1) {
									data.Status = "New";
								}
								else if (data.RowStatus === 2) {
									data.Status = "Updated";
								}
							})
						}

						typeAheadList = typeAheadList.concat($scope.regulations.map(function (r) { return r.RegulationName; }));
						typeAheadList = arrayUnique(typeAheadList.concat($scope.regulations.map(function (r) { return r.CertificationProgram; })));

						baseService.PopulateTypeAHead(typeAheadList);

						//channel.send({ message: 'typeahead', arg: { list: typeahead } });

						//if (response.Data.RegulatoryList.length < maxNoOfItems) {
						if ((page === 1 && response.Data.RegulatoryList.length < maxNoOfItems) || (page > 1 && response.Data.RegulatoryList.lengthh < perPageLoad)) {
							stillMoreData = false;
						}
					}
					else {
						stillMoreData = false;
					}

					$scope.gridApi.infiniteScroll.dataLoaded(false, stillMoreData);

					$scope.showGridLoader = false;



					baseService.IsBusy(false);
				}

				initialLoad = false;
				isFavorite = false;
			}

			function populateGridDataWorkflow() {
				baseService.IsBusy(true);

				//call service here
				var data = {
					Refiners: globalUtility.GetRefinerList($scope.selectedRefiners),
					Page: page,
					RowsToReturn: page === 1 ? maxNoOfItems : perPageLoad
				};
				regulatoryService.getRegulatoryWorkflow(data, onGetRegulatoryWorkflow_Completed);

				//////////////
				var GetDateString = function (date) {
					var d = new Date(date);
					var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
					var m = months[d.getMonth()];
					return d.getDate().toString() + " " + m + " " + d.getFullYear();
				};

				function onGetRegulatoryWorkflow_Completed(response) {
					//for paging
					var stillMoreData = false;

					if (response.Success === true && response.Data.length !== 0) {
						$scope.regulations = angular.copy(response.Data);

						var newRegulatory = [];
						$scope.regulations.forEach(function (item, index, theArray) {
							theArray[index].DateSubmitted = GetDateString(item.DateSubmitted);
							theArray[index].RegulatoryCategory = item.RegulatoryCategory;
							newRegulatory = theArray
						});
						//debugger;
						$scope.regulations = angular.copy(newRegulatory)

						//for search
						//var typeahead = $scope.regulations.map(function (r) { return r.RegulationName });

						//channel.send({ message: 'typeahead', arg: { list: typeahead } });

						//if (response.Data.RegulatoryList.length < maxNoOfItems) {
						//if ((page === 1 && response.Data.RegulatoryList.length < maxNoOfItems) || (page > 1 && response.Data.RegulatoryList.lengthh < perPageLoad)) {
						//    stillMoreData = false;
						//}
					}
					//else {
					//    stillMoreData = false;
					//}

					$scope.gridApi.infiniteScroll.dataLoaded(false, stillMoreData);

					$scope.showGridLoader = false;

					baseService.IsBusy(false);
				}

				initialLoad = false;
			}

			function refreshRefinersRegulatory() {
			    isFavorite = true;
			    baseService.Publish('shell:clearRefinerList', true);
			    loadRefiners();
			    loadAllRefiners();
			}

			function removeRefiner(refiner) {
				$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== refiner; });
				baseService.Publish('shell:uncheckRefiner', refiner);

				baseService.RemoveFromGlobalRefiners(refiner);

				page = 1;

				//populateGridData();
				populateData();
			};


			function removeSelectedRefiner(event, data) {
				$scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== data; });

				page = 1;

				//reset data for each refiner
				$scope.regulations = [];

				baseService.RemoveFromGlobalRefiners(data);

				//populateGridData();
				populateData();
			}

			function setupGridParameters() {
				setupColumns();
				$scope.regulatoryGrid = regulatoryGrid();

				//////////////

				function regulatoryGrid() {
					var rowsRenderedTimeout;

					return {
						enableSorting: true,
						enableColumnResizing: true,
						columnDefs: columns,
						suppressMultiColumnSorting: true,
						data: 'regulations',
						infiniteScrollRowsFromEnd: 10,
						infiniteScrollUp: false,
						infiniteScrollDown: true,
						onRegisterApi: function (gridApi) {
							$scope.gridApi = gridApi;
							gridApi.infiniteScroll.on.needLoadMoreData($scope, loadMore);
							gridApi.selection.on.rowSelectionChanged($scope, gridSelectionChanged);
							gridApi.selection.on.rowSelectionChangedBatch($scope, gridBatchSelectionChanged);

							// ROWS RENDER
							gridApi.core.on.rowsRendered($scope, function () {
								// each rows rendered event (init, filter, pagination, tree expand)
								// Timeout needed : multi rowsRendered are fired, we want only the last one
								if (rowsRenderedTimeout) {
									$timeout.cancel(rowsRenderedTimeout)
								}
								rowsRenderedTimeout = $timeout(function () {
									alignContainers('', $scope.gridApi.grid);
								});
							});

							// SCROLL END
							gridApi.core.on.scrollEnd($scope, function () {
								alignContainers('', $scope.gridApi.grid);
							});

							addCellNavListener(gridApi);
						}
					};

					//////////////

					function loadMore() {
						$scope.showGridLoader = true;

						//increment page
						page = page + 1;

						$scope.gridApi.infiniteScroll.saveScrollPercentage();

						populateGridData();

						$scope.gridApi.infiniteScroll.dataLoaded();
					}

					function gridSelectionChanged(data) {
						$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
					};

					function gridBatchSelectionChanged(data) {
						$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
					};
				}

				function setupColumns() {
					columns = [];

					columns.push(createNewColumn('New', ' ', '5%', '<center><b ng-if="(row.entity.RowStatus) === 1 || (row.entity.RowStatus) === 2" style="color:red;">*{{row.entity.Status}}*</b></center>'))
					columns.push(createNewColumn('Region', 'Region', '10%'));
					columns.push(createNewColumn('RegionalEconomicUnion', 'Regional Economic Union', '10%'));
					columns.push(createNewColumn('Country', 'Country', '10%'));
					columns.push(createNewColumn('RegulationName', 'Regulation Name', '10%'));
					//columns.push(createNewColumn('CertificationProgram', 'Compliance Program', '10%'));
					columns.push({
						field: 'CertificationProgram',
						name: 'Compliance Program',
						width: '10%',
						enableColumnMenu: false,
						pinnedLeft: true
					});
					columns.push(createNewColumn('SectorRegulated', 'Regulatory Category', '10%'));
					columns.push(createNewColumn('Mark', 'Mark', '10%'));
					columns.push(createNewColumn('RegulatoryAuthority', 'Regulatory Authority', '10%'));
					columns.push(createNewColumn('CertificationOrganization', 'Certification Organization', '10%'));
					columns.push(createNewColumn('ComplianceModelId', 'Deliverable', '10%'));
					columns.push(createNewColumn('ProductType', 'Product Type', '10%'));
					columns.push(createNewColumn('ProductSubType', 'Product SubType', '10%'));
					columns.push(createNewColumn('HowProductConnectedToPower', 'Power Source', '10%'));
					columns.push(createNewColumn('ScopedProductList', 'Scoped Product List', '10%'));
					columns.push(createNewColumn('FrequencyAndTechnology', 'Frequency and Technology', '10%'));
					columns.push(createNewColumn('Scope', 'Scope', '10%'));
					columns.push(createNewColumn('RFRangeLower', 'RF Range - Lower', '10%'));
					columns.push(createNewColumn('RangeUpper', 'Range - Upper', '10%'));
					columns.push(createNewColumn('Unit', 'Unit', '10%'));
					columns.push(createNewColumn('OperatingFrequencyAndChannels', 'Operating Frequency and Channels', '10%'));
					columns.push(createNewColumn('OutputPower', 'Output Power', '10%'));
					columns.push(createNewColumn('PowerDensity', 'Power Density', '10%'));
					columns.push(createNewColumn('ChannelSpacing', 'Channel Spacing', '10%'));
					columns.push(createNewColumn('Bandwidth', 'Bandwidth', '10%'));
					columns.push(createNewColumn('DutyCycleEtc', 'Duty Cycle Etc.', '10%'));
					columns.push(createNewColumn('DFS', 'DFS', '10%'));
					columns.push(createNewColumn('TPC', 'TPC', '10%'));
					columns.push(createNewColumn('IndoorUseOnly', 'Indoor Use Only', '10%'));					
					columns.push(createNewColumn('TechnicalStandard', 'Technical Standard', '10%'));
					columns.push(createNewColumn('Exceptions', 'Exemptions', '10%'));
					columns.push(createNewColumn('ExceptionsList', 'Exemptions List', '10%'));
					columns.push(createNewColumn('SupplementInformationOfExceptions', 'Supplement Information Of Exemptions', '10%'));
					columns.push(createNewColumn('CertificationLimitation', 'Certificate Limitation', '10%'));
					columns.push(createNewColumn('ModularApproval', 'Modular Approval', '10%'));
					columns.push(createNewColumn('AcceptedTestReport', 'Accepted Test Reports', '10%'));
					columns.push(createNewColumn('ApplicationType', 'Application Type', '10%'));
					columns.push(createNewColumn('SampleRequirementTestReport', 'Sample Requirement', '10%'));
					columns.push(createNewColumn('InCountrytesting', 'In-Country Testing', '10%'));
					columns.push(createNewColumn('TestingOrganization', 'Testing Organization', '10%'));
					columns.push(createNewColumn('LocalRepresentative', 'Local Representative', '10%'));
					columns.push(createNewColumn('LocalRepService', 'Local Rep Service', '10%'));
					columns.push(createNewColumn('MarkingRequirement', 'Marking Requirement', '10%'));
					columns.push(createNewColumn('ManualRequirement', 'Manual Requirement', '10%'));
					columns.push(createNewColumn('DetailsOfMarkingOrManual', 'Details of Marking or Manual(Text or Attached file)', '10%'));
					columns.push(createNewColumn('ElectronicLabelAccepted', 'Electronic Label Accepted', '10%'));
					columns.push(createNewColumn('InitialFactoryInspection', 'Initial Factory Inspection', '10%'));
					columns.push(createNewColumn('CertificateValidityPeriod', 'Certificate Validity Period', '10%'));
					columns.push(createNewColumn('CertificateMaintenance', 'Certificate Maintenance', '10%'));
					columns.push(createNewColumn('WebPublicationOfProductDetails', 'Web Publication Of Product Details', '10%'));
					columns.push(createNewColumn('WebAddress', 'Web Address', '10%'));
					columns.push(createNewColumn('PublishedContents', 'Published Contents', '10%'));
					columns.push(createNewColumn('PublicationTiming', 'Publication Timing', '10%'));
					columns.push(createNewColumn('ShortTermConfidentialityPolicy', 'Short Term Confidentiality Policy', '10%'));
					columns.push(createNewColumn('Leadtime', 'Lead Time (Certification)', '10%'));
					columns.push(createNewColumn('Voltage', 'Voltage / V', '10%'));
					columns.push(createNewColumn('Frequency', 'Frequency / Hz', '10%'));
					columns.push(createNewColumn('PlugType', 'Plug Type', '10%'));
					columns.push(createNewColumn('IECEEMembershipOfTheCountry', 'IECEE Membership of the Country', '10%'));
					columns.push(createNewColumn('BandInformation', 'Band Information (Cellular)', '10%'));
					columns.push(createNewColumn('Carrier', 'Carrier (Cellular)', '10%'));
					columns.push(createNewColumn('SARLimit', 'SAR Limit', '10%'));
					columns.push(createNewColumn('SARParts', 'SAR Parts', '10%'));					
					columns.push(createNewColumn('ComplianceProgramId', 'ComplianceProgramId', '10%', null, true));
					columns.push(createNewColumn('RegulatoryCountryInformationId', 'RegulatoryCountryInformationId', '10%', null, true));
					columns.push(createNewColumn('RegulatoryAuthorityId', 'RegulatoryAuthorityId', '10%', null, true));
					columns.push(createNewColumn('FrequencyTechnologyId', 'FrequencyTechnologyId', '10%', null, true));
					columns.push(createNewColumn('ProductTypeId', 'ProductTypeId', '10%', null, true));
					columns.push(createNewColumn('RegulatoryTestingAndValidityId', 'RegulatoryTestingAndValidityId', '10%', null, true));					
				}
			}

			function setupGridParametersWorkflow() {
				setupColumns();
				$scope.regulatoryGrid = regulatoryGrid();

				//////////////

				function regulatoryGrid() {
					var rowsRenderedTimeout;

					return {
						enableSorting: true,
						enableColumnResizing: true,
						columnDefs: columns,
						suppressMultiColumnSorting: true,
						data: 'regulations',
						rowHeight: 100,
						onRegisterApi: function (gridApi) {
							$scope.gridApi = gridApi;
							//gridApi.infiniteScroll.on.needLoadMoreData($scope, loadMore);
							//gridApi.selection.on.rowSelectionChanged($scope, gridSelectionChanged);
							//gridApi.selection.on.rowSelectionChangedBatch($scope, gridBatchSelectionChanged);

							//dynamic row height
							//// ROWS RENDER
							//gridApi.core.on.rowsRendered($scope, function () {
							//    // each rows rendered event (init, filter, pagination, tree expand)
							//    // Timeout needed : multi rowsRendered are fired, we want only the last one
							//    if (rowsRenderedTimeout) {
							//        $timeout.cancel(rowsRenderedTimeout)
							//    }
							//    rowsRenderedTimeout = $timeout(function () {
							//        alignContainers('', $scope.gridApi.grid);
							//    });
							//});

							//// SCROLL END
							//gridApi.core.on.scrollEnd($scope, function () {
							//    alignContainers('', $scope.gridApi.grid);
							//});
						}
					};

					//////////////

					function loadMore() {
						$scope.showGridLoader = true;

						//increment page
						page = page + 1;

						$scope.gridApi.infiniteScroll.saveScrollPercentage();

						populateGridData();

						$scope.gridApi.infiniteScroll.dataLoaded();
					}

					function gridSelectionChanged(data) {
						$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
					};

					function gridBatchSelectionChanged(data) {
						$scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
					};
				}

				function setupColumns() {
					columns = [];

					//view column
					columns = [
						{
							name: '  ',
							width: '5%',
							cellTemplate:
							'<div><a style="padding-left:5px;"><span style="cursor:pointer" class="text-align-center" ng-click="grid.appScope.viewWorkflowDetails(row.entity)">View</span></a> </div>'
							,
							enableSorting: false,
							enableColumnMenu: false
						}
					];
					columns.push({
						field: 'ModuleTab',
						name: 'Module Tab',
						visible: false
					});
					columns.push({
						field: 'ItemId',
						name: 'Item Id',
						visible: false
					});
					
					columns.push(createNewColumn('RegulatoryCategory', 'RegulatoryCategory', '10%'));
					columns.push(createNewColumn('Region', 'Region', '10%'));
					columns.push(createNewColumn('Country', 'Country', '10%'));
					//columns.push(createNewColumn('ComplianceProgram', 'Compliance Program', '10%'));
					columns.push({
						field: 'ComplianceProgram',
						name: 'Compliance Program ',
						width: '10%',
						enableColumnMenu: false,
						pinnedLeft: false
					});
					columns.push({
						name: 'Original Information',
						width: '20%',
						cellTemplate: '<div><ul style="list-style: none; padding-left: 0px;">' +
						'<li ng-repeat="info in row.entity.OriginalInformation track by $index">{{info}}</li>' +
						'</ul></div>',
						enableColumnMenu: false,
						visible: false
					});
					columns.push({
						name: 'Updated Information',
						width: '20%',
						cellTemplate: '<div><ul style="list-style-type: none; padding-left: 0px;">' +
						'<li ng-repeat="info in row.entity.UpdatedInformation track by $index">{{info}}</li>' +
						'</ul></div>',
						enableColumnMenu: false,
						visible: false
					});
					columns.push({
						name: 'Field Changes',
						width: '10%',
						cellTemplate:
						'<div><a style="padding-left:5px;"><span style="cursor:pointer" class="text-align-center" ng-click="grid.appScope.showWorkflowChanges(row.entity)">View Changes</span></a> </div>'
						,
						enableSorting: false,
						enableColumnMenu: false
					});
					columns.push(createNewColumn('Source', 'Source', '10%'));
					columns.push({
						name: 'Links',
						width: '20%',
						cellTemplate:
						'<div style="word-wrap: break-word; white-space: normal;">' +
						'<span ng-repeat="link in row.entity.Links track by $index">' +
						'<a href="" ng-click="grid.appScope.openEvidence(link)">{{link.m_Item3}}</a>{{!$last? ",&nbsp;" : ""}}' +
						'</span>' +
						'</div>',
						enableColumnMenu: false
					});
					columns.push(createNewColumn('WorkflowStatus', 'Workflow Status', '10%'));
					columns.push(createNewColumn('DateSubmitted', 'Date Submitted', '10%'));
					columns.push(createNewColumn('CreatedBy', 'Created By', '10%', false));
				}
			}

			function showWorkflowChanges(row) {
				var data = {
					title: 'Field Changes',
					item: row
				};

				var modalInstance = dialogService.Dialog.WithTemplateAndControllerInstanceAndClass("workflowFieldChanges.html", "regulatoryFieldChangesController", "lg", data);
				modalInstance.result.then(function (data) {
				}, function (error) {
				});
			}

			function switchView() {
				//show is busy screen, end busy on data load
				baseService.IsBusy(true);

				$scope.regulations = [];
				initialLoad = true;

				switch (currentView) {
					case 'list':
						currentView           = 'workflow';
						$scope.switchViewLink = 'BACK TO LIST';
						$scope.isWorkflow     = true;

						//clear refiners
						$scope.selectedRefiners = [];

						// set grid settings to workflow
						setupGridParametersWorkflow();
					    // set workflow refiners
						baseService.Publish('shell:setRefinerDataSource', workflowRefiners);
						break;
					case 'workflow':
						currentView           = 'list';
						$scope.switchViewLink = 'WORKFLOW TRACKING';
						$scope.isWorkflow     = false;

						//clear refiners
						$scope.selectedRefiners = [];

						// set grid settings to regulatory list
						setupGridParameters();
						// set regulatory list refiners
						baseService.Publish('shell:setRefinerDataSource', regulatoryRefiners);
						break;
				}
			}

			function viewWorkflowDetails(row) {
				var data = {
					isWorkflow: true,
					tab: getTabEquivalent(row.ModuleTab),
					itemId: row.ItemId,
					workflowItem: row,
					salesReader: globalUtility.SalesReader
				};

				var modalInstance = dialogService.Dialog.WithTemplateAndControllerInstanceAndClass("regModalDialog.html", "regulatoryAddEditController", "lg", data, 'manageDataModal');
				modalInstance.result.then(function (data) {
					if (data === true) {
						//populateGridData();
						populateData();
					}
				}, function (error) {
				});

				////////////
				//consider creating enum for tabs or convert to object literal
				//https://toddmotto.com/deprecating-the-switch-statement-for-object-literals/
				function getTabEquivalent(tabIdentitifier) {
					var tab = 'CountryInfo';

					switch (tabIdentitifier) {
						case 1:
							tab = 'CountryInfo';
							break;
						case 2:
							tab = 'AuthorityRegulation';
							break;
						case 3:
							tab = 'FrequencyTechnology';
							break;
						case 4:
							tab = 'ComplianceProgram';
							break;
						case 5:
							tab = 'ScopeStandards';
							break;
						case 6:
							tab = 'TestingValidity';
							break;
					}

					return tab;
				}
			}

			function addCellNavListener(gridApi) {
				if (gridApi && !globalUtility.SalesReader) {
					gridApi.cellNav.on.navigate($scope, function (newRowcol, oldRowCol) {

						var
							fieldName = undefined === newRowcol.col.colDef.field
								? newRowcol.col.colDef.name
								: newRowcol.col.colDef.field;

						if (fieldName === "RegulatoryAuthority") {
							fieldName = "RegulatoryAuthorityId";
						}

						var fieldId = getFieldId(fieldName, newRowcol.row.entity) + '_' + fieldName,
							selectedField = [fieldId];

						regulatoryService.getExistingEvidence(selectedField, function (data) {
							if (data) {
								if (data.Data && data.Data.length === 0) {
									return;
								}

								var latest = data.Data[data.Data.length - 1];
								var $outer = $scope;
								dialogService.Dialog.WithTemplateAndController('shellEvidenceDialog.html',
									function ($scope, $uibModalInstance) {
										$scope.title = 'HISTORY';
										$scope.ok = function () {
											$uibModalInstance.close();
											baseService.ShowOverlay(false);
										}

										var source = $outer.evidenceSource.filter(function (elem) {
											return elem.SourceId === latest.SourceId;
										});

										var docType = $outer.evidenceDocumentType.filter(function (elem) {
											return elem.DocumentTypeId === latest.DocumentTypeId;
										});

										$scope.evidences = data.Data;
										$scope.source = source[0].SourceName;
										$scope.remarks = latest.Remarks;
										$scope.remarksInternal = latest.RemarksInternal;
										$scope.updateDate = latest.UpdateDate.substr(0, 10);
										$scope.evidenceNote = latest.EvidenceNote;
										$scope.documentType = docType[0].DocumentName;
										$scope.openEvidence = $outer.openEvidence;

									}, 'sm', null);
							}
						});

					});
				}
			}

			function getFieldId(fieldName, entity) {
				switch (fieldName) {
					case "Region":
					case "Country":
					case "RegionalEconomicUnion":
					case "Voltage":
					case "Frequency":
					case "PlugType":
					case "IECEEMembershipOfTheCountry":
					case "BandInformation":
					case "Carrier":
					case "SARLimit":
						return entity.RegulatoryCountryInformationId;
					case "CertificationProgram":
					case "Mark":
					case "CertificationOrganization":
					case "ComplianceModel":
					case "ScopedProductList":
					case "Exceptions":
					case "ExceptionsList":
					case "SupplementInformationOfExceptions":
					case "CertificationLimitation":
					case "ModularApproval":
					case "LocalRepresentative":
					case "LocalRepService":
					case "MarkingRequirement":
					case "DetailsOfMarkingOrManual":
					case "ElectronicLabelAccepted":
					case "CertificateMaintenance":
					case "WebPublicationOfProductDetails":
					case "WebAddress":
					case "PublishedContents":
					case "PublicationTiming":
					case "ShortTermConfidentialityPolicy":

						return entity.ComplianceProgramId;
					case "RegulationName":
					case "RegulatoryAuthorityId":
					case "SectorRegulated":
						return entity.RegulatoryAuthorityId;
					case "ProductType":
					case "ProductSubType":
					case "HowProductConnectedToPower":
					case "Scope":
					case "AcceptedTestReportsWireless":
					case "AcceptedTestReportSafety":
					case "AcceptedTestReportEMC":
					case "InitialFactoryInspection":
						return entity.ProductTypeId;
					case "FrequencyAndTechnology":
					case "RFRangeLower":
					case "RangeUpper":
					case "Unit":
					case "OperatingFrequencyAndChannels":
					case "OutputPower":
					case "PowerDensity":
					case "ChannelSpacing":
					case "Bandwidth":
					case "DutyCycleEtc":
					case "DFS":
					case "TPC":
					case "IndoorUseOnly":
					case "TechnicalStandardWireless":
					case "TechnicalStandardSafety":
					case "TechnicalStandardEMC":


						return entity.FrequencyTechnologyId;
					case "ApplicationType":
					case "SampleRequirementWireless":
					case "SampleRequirementSafety":
					case "SampleRequirementEMC":
					case "InCountryTestingSafety":
					case "TestingOrganizationSafety":
					case "CertificateValidityPeriod":
					case "Leadtime":
						return entity.RegulatoryTestingAndValidityId;
					default:
						return '';
				}
			}

			//destructor
			$scope.$on('$destroy', function () {
			    var events = ['shell:addSelectedRefiner', 'shell:removeSelectedRefiner', 'shell:refinerSetCompleted', 'shell:clearAllSelectedRefiners', 'shell:loadPreselectedRefiners', 'shell:refreshRefinersRegulatory'];
				baseService.UnSubscribe(events);
			});
		}]);
});
