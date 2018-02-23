define([
	'app',
    'authService',
    'globalUtility',
    'routeResolver',
    'enums'
], function (app, authService, globalUtility, routeResolver, enums) {

    app.controller('rightpaneController', ['$scope', '$location', 'baseService', '$sce', '$q', '$filter', '$localStorage', '$cookies', '$cookieStore', '$sessionStorage', '$timeout', 'baseService', 'dialogService', 'bsAlertService', 'moduleService', 'homeService',
	function ($scope, $location, baseService, $sce, $q, $filter, $localStorage, $cookies, $cookieStore, $sessionStorage, $timeout, baseService, dialogService, bsAlertService, moduleService, homeService) {

	    $scope.savedSearches     = [];
	    $scope.references        = [];
	    $scope.documents         = [];
	    $scope.rightNavOpen      = true;
	    $scope.isUserContributor = false;
	    $scope.searchFavorite    = searchFavorite;
	    $scope.favorites         = [];

	    $scope.init = function () {

	        initUserRoles();

	        baseService.Subscribe('workflow:addWorkflow', onAddWorkflow);
            //refresh favorites list
	        baseService.Subscribe('favorites:refresh', refreshFavorites);

	        $timeout(function () {
	            resizePage();
	        }, 200);
	    };

	    function refreshFavorites() {
			var params = {
				UserName: globalUtility.CurrentUser,
				UserType: 0
			};

	        homeService.getUserPreferences(params, onGetUserPreferences_Completed);
	    }

	    function initUserRoles() {
	        homeService.getServiceUrl(onGetServiceUrl_Completed);
	    }

	    function onGetServiceUrl_Completed(response) {
	        globalUtility.ServiceUrl = response.Data;
	        homeService.getUserClaims(onGetUserClaims_Completed);
	    }

	    function onGetUserClaims_Completed(response) {
	        homeService.getUserRoles(response.Data.EmailAddress, onGetUserRoles_Completed);

			var params = {
				UserName: response.Data.EmailAddress,
				UserType: 0
			};

	        homeService.getUserPreferences(params, onGetUserPreferences_Completed);
	    };

	    function onGetUserPreferences_Completed(response) {
	        if (response.Success) {
	            //set global selected language
	            globalUtility.SelectedLanguage = response.Data.CultureTypeId;

	            $scope.favorites = response.Data.Favorites;

	            baseService.Publish('shell:getFavorites', response.Data.Favorites);

	            $scope.savedSearches = [];

	            angular.forEach($scope.favorites, function (favItem) {
	                $scope.savedSearches.push(favItem);
	            });

	            if ($scope.userItem && $scope.userItem.SelectedSectors) {
	                $scope.userItem.SelectedSectors = response.Data.Sectors;
	            }
	           
	        }
	    }

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
	                }
	            });
	        }

	        if (globalUtility.Contributor || globalUtility.Coordinator || globalUtility.ContentAdmin) {
	            $scope.isUserContributor = true;
	        }
	    }

	    $scope.TogglePane = function (toogleVal) {
	        
	        $scope.rightNavOpen = !toogleVal;
	        $timeout(function () {
	            resizePage();
	        }, 200);
	        
	    };

	    $scope.createCrf = function () {

	        var params = {
	            CountryList: globalUtility.CountryList,
	            RegionalEconomicUnion: globalUtility.RegionalEconomicUnion,
	            SectorList: globalUtility.SectorList,
	            ComplianceProgram: globalUtility.ComplianceProgram,
	            Modules: globalUtility.Scope
	        };

	        dialogService.Dialog.WithTemplateAndController("changeRequestForm.tpl.html", "changeRequestFormController", "md", params);
	    }

	    var onAddWorkflow = function (event, data) {
	        var message = [];
	        message.push({ Message: data.Success[0], IsSuccess: true });
	        if (data.HasErrors) {
	            angular.forEach(data.Errors, function (error) {
	                this.push({ Message: error, IsSuccess: false });
	            }, message);
	        }
	        bsAlertService.Show(message, data.HasErrors ? enums.AlertType.Warning : enums.AlertType.Success, true);
	    };


        //move to service
	    function searchFavorite(favItem) {
	        globalUtility.SelectedScope = "";
	        switch (favItem.ModuleId) {
	            case enums.ModuleType.Regulatory.Id: globalUtility.SelectedScope = enums.ModuleType.Regulatory.Description; break;
	            case enums.ModuleType.RequiredItems.Id: globalUtility.SelectedScope = enums.ModuleType.RequiredItems.Description; break;
	            case enums.ModuleType.Delivery.Id: globalUtility.SelectedScope = enums.ModuleType.Delivery.Description; break;
	            case enums.ModuleType.News.Id: globalUtility.SelectedScope = enums.ModuleType.News.Description; break;
	            case enums.ModuleType.Contacts.Id: globalUtility.SelectedScope = enums.ModuleType.Contacts.Description; break;
	            case enums.ModuleType.Certificates.Id: globalUtility.SelectedScope = enums.ModuleType.Certificates.Description; break;
	        }

	        homeService.buildRefiners(favItem.FavoriteDetails);

	        var validModules  = $filter('filter')(globalUtility.Modules, function (value, index) { return value.IsEnable == true; });
	        var defaultModule = $filter('filter')(validModules, function (value, index) { return value.AppName == globalUtility.SelectedScope; });

	        angular.forEach(globalUtility.Modules, function (module) {
	            module.Selected = (module.AppName == globalUtility.SelectedScope);
	        });


	        var path = $location.path();

	        if (globalUtility.CurrentPage != globalUtility.SelectedScope) {
	            baseService.Publish('shell:clearAllSelectedRefiners');
	            baseService.Publish('shell:clearRefinerList', true);
	            baseService.Publish('shell:tabSelectionChange', defaultModule[0]);
	        }
	        else {
	            baseService.Publish('shell:clearAllSelectedRefiners');

	            switch (favItem.ModuleId) {
	                case enums.ModuleType.Regulatory.Id: baseService.Publish('shell:refreshRefinersRegulatory', true); break;
	                case enums.ModuleType.RequiredItems.Id: baseService.Publish('shell:refreshRefinersRequiredItems', true); break;
	                case enums.ModuleType.Delivery.Id: baseService.Publish('shell:refreshRefinersDelivery', true); break;
	                case enums.ModuleType.News.Id: baseService.Publish('shell:refreshRefinersNews', true); break;
	                case enums.ModuleType.Contacts.Id: baseService.Publish('shell:refreshRefinersContacts', true); break;
	                case enums.ModuleType.Certificates.Id: baseService.Publish('shell:refreshRefinersCertificates', true); break;
	            }
	        }

	        if (path == '/home') {
	            baseService.RouteToPage(enums.Page.Main);
	        }
	    }

	    function ClearSelections() {
	        globalUtility.SelectedSector = [];
	    }

	    $scope.manageFavorites = function () {
	        var params = {
	            //CountryList: globalUtility.CountryList,
	            //RegionalEconomicUnion: globalUtility.RegionalEconomicUnion,
	            //SectorList: globalUtility.SectorList,
	            //ComplianceProgram: globalUtility.ComplianceProgram,
	            //Modules: globalUtility.Scope
	        };

	        dialogService.Dialog.WithTemplateAndController("manageFavorites.tpl.html", "manageFavoritesController", "md", params);
	    }

	    $scope.init();

	    $scope.$on('$destroy', function () {

	       
	    });
	}]);

});