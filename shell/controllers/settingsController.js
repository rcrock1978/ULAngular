define([
	'app',
    'authService',
    'globalUtility',
    'routeResolver',
    'enums',
    'shell/model/userPreferenceItemModel'
], function (app, authService, globalUtility, routeResolver, enums, userPreferenceItemModel) {

    app.controller('settingsController', ['$scope', '$q', '$localStorage', '$cookies', '$filter', '$cookieStore', '$sessionStorage', 'baseService', 'dialogService', 'bsAlertService', 'moduleService', 'homeService', 'homeConfigService', 'items',
	function ($scope, $q, $localStorage, $cookies, $filter, $cookieStore, $sessionStorage, baseService, dialogService, bsAlertService, moduleService, homeService, config, items) {
	    //globals
	    var isInternal = true;

	    //viewmodel/bindable members
	    $scope.languages                  = [];
	    $scope.sectorRegulatory           = [];
	    $scope.sectorNews                 = [];
	    $scope.sectorContacts             = [];
	    $scope.sectorDelivery             = [];
	    $scope.sectorR2C                  = [];
	    $scope.sectorCertificates         = [];
	    $scope.sectorSettings             = config.sectorSettings;
	    $scope.userSelectedLanguage       = 1;
	    $scope.userSelectedSector         = [];
	    $scope.userPreferenceId           = null;
	    $scope.selectedCheckSector        = "";
	    $scope.notificationModules        = null;
	    $scope.selectedSectorRegulatory   = [];
	    $scope.selectedSectorNews         = [];
	    $scope.selectedSectorContacts     = [];
	    $scope.selectedSectorDelivery     = [];
	    $scope.selectedSectorR2C          = [];
	    $scope.selectedSectorCertificates = [];
	    $scope.userItem                   = userPreferenceItemModel.SetDefault();
	    $scope.isSalesReader              = false;
	    init();

	    //function implementations
	    //////////////  
	    $scope.CloseDialog = function () {
	        dialogService.CloseAll("Perform Close");
	    };

	    function init() {
	        $scope.sectorRegulatory    = items.SectorList;
	        $scope.sectorNews          = items.SectorList;
	        $scope.sectorContacts      = items.SectorList;
	        $scope.sectorDelivery      = items.SectorList;
	        $scope.sectorR2C           = items.SectorList;
	        $scope.sectorCertificates  = items.SectorList;
	        $scope.userSelectedSector  = items.SectorList;
	        $scope.notificationModules = new Array(items.Scope.length);
	        $scope.languages           = items.Language;
	        $scope.isSalesReader       = items.IsSalesReader;

			var params = {
				UserName: items.Email,
				UserType: 0
			};

	        homeService.getUserPreferences(params, onGetUserPreferences_Completed);
	    }

	    function onGetUserPreferences_Completed(response) {
	        if (response.Success) {
	            $scope.userItem = userPreferenceItemModel.Set(response.Data, true);
	            $scope.userSelectedSector = [];
	            var sectorsList = items.SectorList;


	            angular.forEach(sectorsList,
	                function (sector) {
	                    $scope.userSelectedSector.push({
	                        CoveredSectorId: sector.CoveredSectorId,
	                        CoveredSector: sector.CoveredSector,
	                        selected: response.Data.Sectors.map(function (e) { return e.CoveredSectorId; }).indexOf(sector.CoveredSectorId) !== -1
	                    });
	                });

	            globalUtility.SelectedSector = $scope.userSelectedSector;


	            $scope.$watch('userSelectedSector|filter:{selected:true}', function (nv) {
	                $scope.userItem.SelectedSectors = nv.map(function (sector) {
	                    return sector;
	                });
	            }, true);



	            $scope.userSelectedLanguage = $scope.userItem.CultureTypeId;
	            $scope.userSelectedModuleSectors = $scope.userItem.ModuleSectors;
	            globalUtility.SelectedLanguage = $scope.userItem.CultureTypeId;

	            angular.forEach($scope.userItem.ModuleId, function (moduleItem) {

	                var filteredModuleSectors = null;

	                switch (moduleItem) {
	                    case enums.ModuleType.News.Id:

	                        $scope.notificationModules[1] = true;
	                        filteredModuleSectors = $scope.userSelectedModuleSectors.filter(function (value, index) { return value.ModuleId == enums.ModuleType.News.Id });

	                        angular.forEach($scope.sectorNews, function (sectorItem) {
	                            angular.forEach(filteredModuleSectors, function (filteredItem) {
	                                if (sectorItem.CoveredSectorId == filteredItem.CoveredSectorId) {
	                                    $scope.selectedSectorNews.push(sectorItem);
	                                }
	                            });
	                        });

	                        break;
	                    case enums.ModuleType.Contacts.Id:

	                        $scope.notificationModules[2] = true;
	                        filteredModuleSectors = $scope.userSelectedModuleSectors.filter(function (value, index) { return value.ModuleId == enums.ModuleType.Contacts.Id });

	                        angular.forEach($scope.sectorContacts, function (sectorItem) {
	                            angular.forEach(filteredModuleSectors, function (filteredItem) {
	                                if (sectorItem.CoveredSectorId == filteredItem.CoveredSectorId) {
	                                    $scope.selectedSectorContacts.push(sectorItem);
	                                }
	                            });
	                        });

	                        break;
	                    case enums.ModuleType.Delivery.Id:

	                        $scope.notificationModules[3] = true;
	                        filteredModuleSectors = $scope.userSelectedModuleSectors.filter(function (value, index) { return value.ModuleId == enums.ModuleType.Delivery.Id });

	                        angular.forEach($scope.sectorDelivery, function (sectorItem) {
	                            angular.forEach(filteredModuleSectors, function (filteredItem) {
	                                if (sectorItem.CoveredSectorId == filteredItem.CoveredSectorId) {
	                                    $scope.selectedSectorDelivery.push(sectorItem);
	                                }
	                            });
	                        });

	                        break;
	                    case enums.ModuleType.RequiredItems.Id:

	                        $scope.notificationModules[4] = true;
	                        filteredModuleSectors = $scope.userSelectedModuleSectors.filter(function (value, index) { return value.ModuleId == enums.ModuleType.RequiredItems.Id });

	                        angular.forEach($scope.sectorR2C, function (sectorItem) {
	                            angular.forEach(filteredModuleSectors, function (filteredItem) {
	                                if (sectorItem.CoveredSectorId == filteredItem.CoveredSectorId) {
	                                    $scope.selectedSectorR2C.push(sectorItem);
	                                }
	                            });
	                        });
	                        break;
	                    case enums.ModuleType.Certificates.Id:

	                        $scope.notificationModules[5] = true;
	                        filteredModuleSectors = $scope.userSelectedModuleSectors.filter(function (value, index) { return value.ModuleId == enums.ModuleType.Certificates.Id });

	                        angular.forEach($scope.sectorCertificates, function (sectorItem) {
	                            angular.forEach(filteredModuleSectors, function (filteredItem) {
	                                if (sectorItem.CoveredSectorId == filteredItem.CoveredSectorId) {
	                                    $scope.selectedSectorCertificates.push(sectorItem);
	                                }
	                            });
	                        });

	                        break;
	                }
	            });

	            //$scope.userSelectedSector = [];
	            //$scope.userSelectedSector = angular.copy($scope.userItem.SelectedSectors);
	            //angular.forEach($scope.userSelectedSector, function (sector) {
	            //    var temp = $filter('filter')($scope.userItem.SelectedSectors, function (value, index) { return sector.value == true; });
	            //    if (temp.length > 0) {
	            //        if (temp[0].id == $scope.userItem.SelectedSectors.id) {
	            //            this.push({ id: $scope.userSelectedSector.id, label: $scope.userSelectedSector.label, value: true });
	            //        }
	            //    }
	            //}, $scope.userItem.SelectedSectors);

	            //$scope.LoadSectors();

	        };
	    }

	    $scope.SaveSettings = function () {

	        baseService.IsBusy(true);

	        var filtered = items.Scope.filter(function (x, i) { return $scope.notificationModules[i]; });
	        var moduleSectors = [];

	        angular.forEach(filtered, function (filteredItem) {
	            switch (filteredItem.AppName) {
	                case "news":
	                    if ($scope.selectedSectorNews.length > 0) {
	                        angular.forEach($scope.selectedSectorNews, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.News.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    else {
	                        angular.forEach(items.SectorList, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.News.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    break;
	                case "contacts":
	                    if ($scope.selectedSectorContacts.length > 0) {
	                        angular.forEach($scope.selectedSectorContacts, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.Contacts.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    else {
	                        angular.forEach(items.SectorList, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.Contacts.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }

	                    break;
	                case "delivery":
	                    if ($scope.selectedSectorDelivery.length > 0) {
	                        angular.forEach($scope.selectedSectorDelivery, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.Delivery.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    else {
	                        angular.forEach(items.SectorList, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.Delivery.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    break;
	                case "r2c":
	                    if ($scope.selectedSectorR2C.length > 0) {
	                        angular.forEach($scope.selectedSectorR2C, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.RequiredItems.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    else {
	                        angular.forEach(items.SectorList, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.RequiredItems.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    break;
	                case "certificates":
	                    if ($scope.selectedSectorCertificates.length > 0) {
	                        angular.forEach($scope.selectedSectorCertificates, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.Certificates.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    else {
	                        angular.forEach(items.SectorList, function (sectorIitem) {
	                            moduleSectors.push({ ModuleId: enums.ModuleType.Certificates.Id, CoveredSectorId: sectorIitem.CoveredSectorId });
	                        });
	                    }
	                    break;
	            }

	        });

	        var prefParam = {
	            Id: $scope.userItem.UserPreferenceId,
	            UserName: items.Email,
	            UserType: 0,
	            ApplicationId: null,
	            CultureTypeIds: $scope.userSelectedLanguage,
	            CoveredSectorIds: $scope.userItem.SelectedSectors.map(function (sector) {
	                return sector.CoveredSectorId;
	            }).join(","),
	            CreatedOrModifiedBy: items.Email,
	            ModuleSectors: moduleSectors
	        };

	        homeService.savePreferences(prefParam, onSavePreferences_Completed);

	    };

	    var onSavePreferences_Completed = function (response) {
	        if (response.Success && response.Data.IsSuccess) {
	            baseService.Publish('shell:clearAllSelectedRefiners');

	            globalUtility.SelectedSector = $scope.userItem.SelectedSectors;

				 //baseService.Publish('shell:loadPreselectedRefiners');

	           // var params = {};
	          //  baseService.IsBusy(true);
	          //  regulatoryService.getRefiners(params, function (response) {
	          //      baseService.IsBusy(false);
	          //      var preselectedRefiners = globalUtility.GetPreselectedRefiners();
	          //      var refinerDS = regulatoryService.buildRefiners(response.Data, preselectedRefiners);
	         //       baseService.Publish('shell:setRefinerDataSource', refinerDS);
	             //   bsAlertService.Show(response.Data.Message, enums.AlertType.Success);
	         //   });

	        } else {
	            //showErrorMessage(response.ErrorMessage || response.Data.Message);
	            bsAlertService.Show(response.Data.Message, enums.AlertType.Error);
	        }
	        baseService.IsBusy(false);
	        $scope.CloseDialog();
	    };

	}]);

});