define([
	'app',
    'authService',
    'globalUtility',
    'routeResolver',
    'enums',
    'shell/model/userPreferenceItemModel'
], function (app, authService, globalUtility, routeResolver, enums, userPreferenceItemModel) {

    app.controller('homeController', ['$scope', '$q', '$localStorage', '$cookies', '$filter', '$cookieStore', '$sessionStorage', 'baseService', 'dialogService', 'bsAlertService', 'moduleService', 'homeService', 'homeConfigService',
	function ($scope, $q, $localStorage, $cookies, $filter, $cookieStore, $sessionStorage, baseService, dialogService, bsAlertService, moduleService, homeService, config) {
	    //globals
	    var isInternal = true;

	    //viewmodel/bindable members
	    $scope.applicationTypes           = [];
	    $scope.applicationTypeSettings    = config.applicationTypeSettings;
	    $scope.compliancePrograms         = [];
	    $scope.complianceSettings         = config.complianceSettings;
	    $scope.countries                  = [];
	    $scope.countrySettings            = config.countrySettings;
	    $scope.customers                  = [];
	    $scope.customerSettings           = config.customerSettings;
	    $scope.disableProductType         = disableProductType;
	    $scope.disableProductSubType      = disableProductSubType;
	    $scope.freqTechs                  = [];
	    $scope.freqTechSettings           = config.freqTechSettings;
	    $scope.goToMain                   = goToMain;
	    $scope.languages                  = [];
	    $scope.onScopeSelect              = onScopeSelect;
	    $scope.onSectorChange             = onSectorChange;
	    $scope.onProductTypeChange        = onProductTypeChange;
	    $scope.modules                    = [];
	    $scope.powerSources               = [];
	    $scope.powerSourceSettings        = config.powerSourceSettings;
	    $scope.productTypes               = [];
	    $scope.productSubTypes            = [];
	    $scope.productTypeSettings        = config.productTypeSettings;
	    $scope.productSubTypeSettings     = config.productSubTypeSettings;
	    $scope.scopes                     = [];
	    $scope.sectors                    = [];
	    $scope.sectorRegulatory           = [];
	    $scope.sectorNews                 = [];
	    $scope.sectorContacts             = [];
	    $scope.sectorDelivery             = [];
	    $scope.sectorR2C                  = [];
	    $scope.sectorCertificates         = [];
	    $scope.sectorSettings             = config.sectorSettings;
	    $scope.selectedApplicationType    = [];
	    $scope.selectedComplianceProgram  = [];
	    $scope.selectedCountry            = [];
	    $scope.selectedFreqTech           = [];
	    $scope.selectedCustomer           = [];
	    $scope.selectedPowerSource        = [];
	    $scope.selectedProductType        = [];
	    $scope.selectedProductSubType     = [];
	    $scope.selectedScope              = "";
	    $scope.selectedSector             = [];
	    $scope.showApplicationType        = false;
	    $scope.showComplianceProgram      = false;
	    $scope.showCountry                = false;
	    $scope.showErrors                 = false;
	    $scope.showFreqTech               = false;
	    $scope.showPowerSource            = false;
	    $scope.showProductType            = false;
	    $scope.showProductSubType         = false;
	    $scope.showSector                 = false;
	    $scope.showCustomer               = false;
	    $scope.showSpinner                = false;
	    $scope.roles                      = [];
	    $scope.userRole                   = "";
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

	    init();

	    //function implementations
	    //////////////  
	    $scope.CloseDialog = function () {
	        dialogService.CloseAll("Perform Close");
	    };


	    function ShowProgressIndicator(progress) {
	        var show = globalUtility.IsNullOrWhiteSpace(progress) ? true : progress;
	        if (globalUtility.IsDebug) $scope.showSpinner = show;
	        else IsBusy(show);
	    };

	    function encode(data) {
	        var str = String.fromCharCode.apply(null, data);
	        return btoa(str).replace(/.{76}(?=.)/g, '$&\n');
	    };

	    function disableProductType() {
	        $scope.showProductType = false;
	        $scope.showFreqTech = false;
	        $scope.showPowerSource = false;
	    }

	    function disableProductSubType() {
	        $scope.showProductSubType = false;
	        $scope.showFreqTech = false;
	    }

	    function goToMain(hasErrors) {
	        $scope.showErrors = hasErrors;
	        if (hasErrors) {
	            var validationMessage = '';

	            bsAlertService.Show("Please fill out required fields", enums.AlertType.Error);
	            return;
	        }

	        globalUtility.SelectedApplicationType = $scope.selectedApplicationType;
	        globalUtility.SelectedScope = $scope.selectedScope;
	        globalUtility.SelectedSector = $scope.selectedSector;
	        globalUtility.SelectedCountry = $scope.selectedCountry;
	        globalUtility.SelectedComplianceProgram = $scope.selectedComplianceProgram;
	        globalUtility.SelectedPowerSource = $scope.selectedPowerSource;
	        globalUtility.SelectedProductType = $scope.selectedProductType;
	        globalUtility.SelectedProductSubType = $scope.selectedProductSubType;
	        globalUtility.SelectedFreqTech = $scope.selectedFreqTech;
	        globalUtility.SelectedCustomer = $scope.selectedCustomer;

	        baseService.RouteToPage(enums.Page.Main);
	    };


	    function init() {
	        populateGearMenu();
	        ShowProgressIndicator();

	        //remove for debug mode
	        if (!globalUtility.IsAuthorized) baseService.RouteToPage("unauthorized");

	        homeService.getServiceUrl(onGetServiceUrl_Completed);

	        var subscriber = new kernel.messaging.subscriber('SmartInsight', 'smartInsight:ToggleSettings', function (command) {
	            switch (command.arg) {
	                case "smartinsightSettings()": smartinsightSettings(); break;
	            };
	        });
	        channel.register(subscriber);

	        function smartinsightSettings() {

	            var settingParams = {
	                SectorList: globalUtility.SectorList,
	                Email: globalUtility.CurrentUser,
	                Scope: $scope.modules,
	                Language: $scope.languages,
	                IsSalesReader: globalUtility.SalesReader
	            };

	            dialogService.Dialog.WithTemplateAndController("Settings.html", "settingsController", enums.ModalSize.Small, settingParams);
	        }
	        //var theme = isInternal ? "assets/css/less/theme/internal.less.css" : "assets/css/less/theme/external.less.css";
	        //routeResolver.InjectCSS($q, theme,true);
	        //if (!$sessionStorage.rememberMe) {
	        //    $sessionStorage.$reset();
	        //}
	        //if ($sessionStorage.User != undefined) {
	        //    $scope.username = $sessionStorage.User.Username;
	        //    $scope.password = $sessionStorage.User.Password;
	        //}
	        //if (baseService.IsAuthenticated()) {
	        //    globalUtility.ClientApps = [];
	        //    baseService.RouteToPage("main");
	        //    return;
	        //}
	        //$localStorage.IsAuthenticated = false;
	    }

	    function onGetServiceUrl_Completed(response) {

	        globalUtility.ServiceUrl = response.Data;

	        function onGetHomeLookups_Completed(response) {

	            if (response.Success) {
	                if ($scope.userItem.SelectedSectors.length > 0 && $scope.userItem.SelectedSectors[0].CoveredSectorId !== 0) {
	                    $scope.selectedSector = $scope.userItem.SelectedSectors; // user preferences
	                }
	                
	                
	                $scope.sectors =  response.Data.SectorList;

	                angular.forEach(response.Data.CountryList, function (item) {
	                    this.push({ id: item.CountryItemId, label: item.CountryName });
	                }, $scope.countries);

	                angular.forEach(response.Data.CustomerList, function (item) {
	                    this.push({ id: item.CompanyItemId, label: item.CompanyName });
	                }, $scope.customers);

	                $scope.compliancePrograms = response.Data.CertificateScheme;
	                $scope.productTypes = response.Data.ProductType;
	                $scope.freqTechs = response.Data.FreqTech;
	                $scope.applicationTypes = response.Data.ApplicationTypeList;
	                $scope.powerSources = response.Data.PowerSourceList;
	                $scope.languages = response.Data.LanguageList;
	                globalUtility.CountryList = response.Data.CountryList;
	                globalUtility.RegionalEconomicUnion = response.Data.RegionalEconomicUnion;
	                globalUtility.SectorList = response.Data.SectorList;
	                globalUtility.ComplianceProgram = response.Data.ComplianceProgram;
	                globalUtility.Scope = response.Data.Modules;
	            }

	        };

	        function onGetUserRoles_Completed(response) {
	            if (response.Success) {
	                angular.forEach(response.Data, function (role) {
	                    switch (role.SecurityRoleName) {
	                        case "Contributor":
	                            globalUtility.Contributor = true;
	                            break;
	                        case "Reader":
	                            globalUtility.Reader = true;
	                            break;
	                        case "Coordinator":
	                            globalUtility.Coordinator = true;
	                            break;
	                        case "Content Admin":
	                            globalUtility.ContentAdmin = true;
	                            break;
	                        case "Translator Japanese":
	                            globalUtility.TranslatorJapanese = true;
	                            break;
	                        case "Translator Chinese":
	                            globalUtility.TranslatorChinese = true;
	                            break;
	                        case "Sales Reader":
	                            globalUtility.SalesReader = true;
	                            var newmodule = [];

	                            angular.forEach(globalUtility.Modules, function (module) {
	                                // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	                                if (!Array.prototype.findIndex) {
	                                    Object.defineProperty(Array.prototype, 'findIndex', {
	                                        value: function (predicate) {
	                                            // 1. Let O be ? ToObject(this value).
	                                            if (this == null) {
	                                                throw new TypeError('"this" is null or not defined');
	                                            }

	                                            var o = Object(this);

	                                            // 2. Let len be ? ToLength(? Get(O, "length")).
	                                            var len = o.length >>> 0;

	                                            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
	                                            if (typeof predicate !== 'function') {
	                                                throw new TypeError('predicate must be a function');
	                                            }

	                                            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
	                                            var thisArg = arguments[1];

	                                            // 5. Let k be 0.
	                                            var k = 0;

	                                            // 6. Repeat, while k < len
	                                            while (k < len) {
	                                                // a. Let Pk be ! ToString(k).
	                                                // b. Let kValue be ? Get(O, Pk).
	                                                // c. Let testResult be ToBoolean(? Call(predicate, T, � kValue, k, O �)).
	                                                // d. If testResult is true, return k.
	                                                var kValue = o[k];
	                                                if (predicate.call(thisArg, kValue, k, o)) {
	                                                    return k;
	                                                }
	                                                // e. Increase k by 1.
	                                                k++;
	                                            }

	                                            // 7. Return -1.
	                                            return -1;
	                                        }
	                                    });
	                                }

	                                var modIndexDelivery = function (element, index, array) {
	                                    if (element.AppName == "delivery")
	                                        return index;
	                                };

	                                var modIndexContacts = function (element, index, array) {
	                                    if (element.AppName == "contacts")
	                                        return index;
	                                };

	                                var indexDelivery = globalUtility.Modules.findIndex(modIndexDelivery);
	                                var indexContact = globalUtility.Modules.findIndex(modIndexContacts);
	                                var modDelivery = globalUtility.Modules[indexDelivery];
	                                var modContact = globalUtility.Modules[indexContact];
	                                if (module === modDelivery) {
	                                    if (globalUtility.SalesReader) {
	                                        this.push({
	                                            AppIcon: module.AppIcon,
	                                            AppName: module.AppName,
	                                            BasePath: module.BasePath,
	                                            Controllers: module.Controllers,
	                                            HasSideNav: module.HasSideNav,
	                                            IsEnable: false,
	                                            LinkText: module.LinkText,
	                                            Selected: module.Selected,
	                                            Services: module.Services,
	                                            Styles: module.Styles
	                                        });
	                                    }
	                                }
	                                    else  if (module === modContact) {
	                                        if (globalUtility.SalesReader) {
	                                            this.push({
	                                                AppIcon: module.AppIcon,
	                                                AppName: module.AppName,
	                                                BasePath: module.BasePath,
	                                                Controllers: module.Controllers,
	                                                HasSideNav: module.HasSideNav,
	                                                IsEnable: false,
	                                                LinkText: module.LinkText,
	                                                Selected: module.Selected,
	                                                Services: module.Services,
	                                                Styles: module.Styles
	                                            });
	                                        }
	                                    } 
	                                else {
	                                    var mod = angular.copy(module)
	                                    this.push(mod);
	                                }

	                            }, newmodule);

	                            globalUtility.Modules = newmodule
	                            $scope.scopes = $filter('filter')(globalUtility.Modules, function (value, index) { return value.IsEnable == true; });

	                            break;
	                    }
	                });

	                homeService.getHomeLookups(onGetHomeLookups_Completed);
	            }

	            ShowProgressIndicator(false);
	        }

	        function onGetUserClaims_Completed(response) {

	            globalUtility.CurrentUser = response.Data.EmailAddress;
	            globalUtility.CurrentUserFullName = response.Data.Name;
	            $scope.userEmail = globalUtility.CurrentUser;

	            //homeService.getUserPreferences($scope.userEmail, onGetUserPreferences_Completed);
	            homeService.getUserRoles($scope.userEmail, onGetUserRoles_Completed);
	        };

	        function onGetModules_Completed(response) {
	            $scope.scopes              = $filter('filter')(response, function (value, index) { return value.IsEnable == true; });
	            globalUtility.Modules      = response;
	            $scope.modules             = response;
	            $scope.notificationModules = new Array($scope.scopes.length);

	            homeService.getUserClaims(onGetUserClaims_Completed);
	        };

	        moduleService.getModules(onGetModules_Completed);

	    };

	    $scope.LoadSectors = function () {
	        angular.forEach($scope.sectors, function (sector) {
	            for (var i = 0; i < $scope.userItem.SelectedSectors; i++) {
	                if (sector.CoveredSectorId == $scope.userItem.SelectedSectors[i].id) {
	                    this.push({ id: sector.CoveredSectorId, label: sector.CoveredSector });
	                }
	            }
	        }, $scope.userItem.SelectedSectors);
	    }

	    function onProductTypeChange(item) {
	        if ($scope.selectedProductType.length > 0) {
	            //if ($scope.selectedScope == 'news') {
	            //    $scope.showProductSubType = false;
	            //    $scope.showFreqTech = true;
	            //    $scope.showPowerSource = false;
	            //}
	            $scope.showProductSubType = true;
	            $scope.showFreqTech = true;
	            $scope.showPowerSource = $scope.selectedScope == 'certificates' ? false : true;

	            //populate productSubType
	            homeService.getProductSubTypes($scope.selectedProductType, onGetProductSubTypes_Completed);
	        }
	        else {
	            //if ($scope.selectedScope == 'news') {
	            //    $scope.showProductSubType = false;
	            //    $scope.showFreqTech = true;
	            //    $scope.showPowerSource = false;
	            //}
	            $scope.showProductSubType = false;
	            $scope.showFreqTech = false;
	            $scope.showPowerSource = false;

	            //clear productSubTypes
	            $scope.productSubTypes = [];
	        }

	        function onGetProductSubTypes_Completed(response) {
	            if (response.Success) {
	                $scope.productSubTypes = response.Data;
	            }
	        }
	    }

	    //enable other dropdowns based on selected scope
	    function onScopeSelect() {
	        homeService.setDropDownPermissions($scope.selectedScope, onSetPermission);

	        function onSetPermission(permissions) {
	            $scope.showSector = permissions.enableSector;
	            $scope.showCountry = permissions.enableCountry;
	            $scope.showComplianceProgram = permissions.enableComplianceProgram;
	            $scope.showProductType = permissions.enableProductType;
	            $scope.showFreqTech = permissions.enableFreqTech;
	            $scope.showApplicationType = permissions.enableApplicationType;
	            $scope.showCustomer = permissions.enableCustomer;
	        }
	    };

	    function onSectorChange() {
	        var allowedForProductType = ['emc', 'safety'];

	        var selectedSectors = $scope.selectedSector.map(function (sector) { return sector.CoveredSector.toLowerCase() });

	        //enable/disable Product Type
	        if (globalUtility.FindOne(allowedForProductType, selectedSectors)) {
	            $scope.showProductType = true;
	        }
	        else {
	            $scope.showProductType = false;
	        }

	        //enable/disable Frequency and Technology
	        if (selectedSectors.indexOf('wireless') != -1) {
	            $scope.showFreqTech = true;
	        }
	            //else if ($scope.selectedScope == 'news') {
	            //    $scope.showFreqTech = true;
	            //}
	        else {
	            $scope.showFreqTech = false;
	        }
	    };

	    $scope.onSectorCheckChange = function (sectorid) {
	        var idx = $scope.SelectedSectors.indexOf(sectorid);

	        if (idx > -1) {
	            $scope.SelectedSectors.splice(idx, 1);
	        }
	        else {
	            $scope.SelectedSectors.push(sectorid);
	        }
	    };
	}]);

});