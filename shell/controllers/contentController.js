'use strict';
define([
	'app',
	'routeResolver',
	'globalUtility',
    'enums'
], function (app, routeResolver, globalUtility, enums) {
	
    app.controller('contentController', ['$scope', '$sce', '$rootScope', '$q', '$http', '$filter', '$sessionStorage', 'baseService', 'dialogService', 'homeService',
	function ($scope, $sce, $rootScope, $q, $http, $filter, $sessionStorage, baseService, dialogService, homeService) {
	    var refinerList = [];

		$scope.moduleUrl = "";
		
    	$scope.init = function () {
    	    baseService.Subscribe('shell:navToModule', onNavToModule);
    	    baseService.Subscribe('shell:goToModulePage', onRouteToModulePage);

    	    //subscribe to refiner events to populate local copy of refiners
    	    baseService.Subscribe('shell:addSelectedModuleRefiner', addSelectedRefiner);
    	    baseService.Subscribe('shell:removeSelectedRefiner', removeSelectedRefiner);
    	    baseService.Subscribe('shell:uncheckRefiner', removeSelectedRefiner);
    	    baseService.Subscribe('shell:getFavorites', getFavorites);
    	    //baseService.Subscribe('searchFilter', addKeywordRefiner);
    	    var channel = new kernel.messaging.channel(window.parent);
    	    var subscriber = new kernel.messaging.subscriber('Favorite', 'searchFilter', addKeywordRefiner);
    	    channel.register(subscriber);
    	    baseService.Subscribe('shell:clearAllSelectedRefiners', function () {
    	        $scope.selectedRefiners = [];
    	    });
    	    baseService.Subscribe('shell:clearRefinerList', function () {
    	        refinerList = [];
    	    });
    	    //add favorites
    	    var data = {};
    	   
            ////////////

    	    function getFavorites(event, items) {
    	        data = items;
    	        //servicecall to subscribe add favorites
    	        dialogService.AddFavorite(channel, data, onOk, onCancel);
    	    }

    	    function addKeywordRefiner(command) {
    	        var keyword = command.arg;
    	        if (globalUtility.CurrentPage == enums.ModuleType.Contacts.Description) {
    	            var keywords = keyword.split(' ');
    	            if (keywords.length > 0) {
    	                angular.forEach(keywords, function (key) {
    	                    var keywordRefiner = {
    	                        Checked: '',
    	                        Id: key.length > 50 ? key.slice(0, 50) : key,
    	                        IsDateRange: false,
    	                        Parent: 'KEYWORD',
    	                        Type: 'keyword',
    	                        Value: key.length > 50 ? key.slice(0, 50) : key
    	                    }

    	                    addSelectedRefiner(keywordRefiner);
    	                });
    	            }
    	        }
    	        else {
    	            var keywordRefiner = {
    	                Checked: '',
    	                Id: keyword.length > 50 ? keyword.slice(0, 50) : keyword,
    	                IsDateRange: false,
    	                Parent: 'KEYWORD',
    	                Type: 'keyword',
    	                Value: keyword.length > 50 ? keyword.slice(0, 50) : keyword
    	            };

    	            var typeList = refinerList.map(function (r) { return r.Type; });
    	            var keyWordIndex = typeList.indexOf('keyword');

    	            if (keyWordIndex != -1) {
    	                refinerList.splice(keyWordIndex, 1);
    	            }

    	            addSelectedRefiner(keywordRefiner);
    	        }
    	        
    	    }

    	    function addSelectedRefiner(event, data) {

    	        var refiner = data ? data.Refiner : event;

    	        if (refiner.IsDateRange)
    	        {
    	            var temp = $filter('filter')(refinerList, function (value, index) { return value.Parent == refiner.Parent; });
    	            if (temp.length == 0) {
    	                refinerList.push(refiner);
    	            }
    	        }
    	        else
    	        {
    	            refinerList.push(refiner);
    	        }
    	    }

    	    function removeSelectedRefiner(event, data) {

    	        if (data.IsDateRange) {
    	            refinerList = $filter('filter')(refinerList, function (value, index) { return value.Parent !== data.Parent; });
    	        } else {
    	            refinerList = $filter('filter')(refinerList, function (value, index) { return value !== data; });
    	        }

    	        baseService.RemoveFromGlobalRefiners(data);
    	    }

    	    function onOk(favoriteName) {
    	        var data = [{
    	            UserPreferenceFavoriteId: null, //should not be included
    	            ModuleId: getModuleId(),
                    Name: favoriteName,
                    Sort: null, //should not be included
                    CreatedBy: globalUtility.CurrentUser,
                    ModifiedBy: '', //should be blank on first save
                    SelectedRefiners: getDistinctRefinerList(globalUtility.GetRefinerList(refinerList)),
                    UserPreference:
	                {
	                    Id: null,
	                    UserName: globalUtility.CurrentUser,
    	                UserType: 0,
    	                ApplicationId: null,
    	                CultureTypeIds: 1,
    	                CoveredSectorIds: '',
    	                CreatedOrModifiedBy: globalUtility.CurrentUser,
	                }
    	        }];
    	        
    	        homeService.saveFavorites(data, onSaveFavorites_Completed);
    	    }

    	    function getDistinctRefinerList(array) {
    	        var a = array.concat();
    	        for (var i = 0; i < a.length; ++i) {
    	            for (var j = i + 1; j < a.length; ++j) {
    	                if (a[i].RefinerType === a[j].RefinerType && a[i].RefinerValueId === a[j].RefinerValueId)
    	                    a.splice(j--, 1);
    	            }
    	        }

    	        return a;
    	    }

    	    function onSaveFavorites_Completed(response) {
    	        if (response.Success) {
    	            //refresh favorites
    	            baseService.Publish('favorites:refresh', {});
    	        }
    	        else {

    	        }
    	    }

    	    function onCancel() {
    	        //do nothing
    	    }

    	    function getModuleId() {
    	        var moduleId = 1;

    	        switch(globalUtility.CurrentPage){
    	            case enums.ModuleType.Regulatory.Description:
    	                moduleId = enums.ModuleType.Regulatory.Id;
    	                break;
    	            case enums.ModuleType.RequiredItems.Description:
    	                moduleId = enums.ModuleType.RequiredItems.Id;
    	                break;
    	            case enums.ModuleType.Delivery.Description:
    	                moduleId = enums.ModuleType.Delivery.Id;
    	                break;
    	            case enums.ModuleType.News.Description:
    	                moduleId = enums.ModuleType.News.Id;
    	                break;
    	            case enums.ModuleType.Contacts.Description:
    	                moduleId = enums.ModuleType.Contacts.Id;
    	                break;
    	            case enums.ModuleType.Certificates.Description:
    	                moduleId = enums.ModuleType.Certificates.Id;
    	                break;
    	        }

    	        return moduleId;
    	    }
    	};

    	var onNavToModule = function (event, data) {
    	    var template = routeResolver.GetTemplate(data.AppName);
    	    $scope.moduleUrl = $sce.trustAsResourceUrl(template.MainTemplate);
    	    globalUtility.CurrentPage = data.AppName;

    	    baseService.Publish('shell:clearAllSelectedRefiners');
    	    baseService.Publish('shell:clearRefinerList', true);
    	};

    	var onRouteToModulePage = function (event, data) {
    	    var template = routeResolver.GetTemplate(globalUtility.CurrentPage,data);
    	    $scope.moduleUrl = $sce.trustAsResourceUrl(template.ModulePage);
    	};

    	
    	$scope.init();


    	$scope.$on('$destroy', function () {
    	    var events = ['shell:navToModule', 'shell:goToModulePage', 'shell:clearAllSelectedRefiners'];
    	    baseService.UnSubscribe(events);
    	});

	}]);
	
});
