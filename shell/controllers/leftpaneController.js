define([
	'app',
    'authService',
    'globalUtility',
    'routeResolver',
    'enums'
], function (app, authService, globalUtility, routeResolver, enums) {

    app.controller('leftpaneController', ['$scope', '$sce', '$q', '$localStorage', '$cookies', '$cookieStore', '$sessionStorage', '$timeout', 'baseService', 'dialogService', 'bsAlertService', 'moduleService','$filter',
	function ($scope, $sce, $q, $localStorage, $cookies, $cookieStore, $sessionStorage, $timeout, baseService, dialogService, bsAlertService, moduleService, $filter) {

	    $scope.IsOpen = true;
	    $scope.refiners = [];
	    $scope.init = function () {
	        baseService.Subscribe('shell:tabSelectionChange', onTabSelectionChange);
	        baseService.Subscribe('shell:setRefinerDataSource', onChangeDataSource);
	        baseService.Subscribe('shell:uncheckRefiner', onUncheckSelectedRefiner);
	    };

	    $scope.togglePane = function () {
	        $scope.IsOpen = !$scope.IsOpen;
	        $timeout(function () {
	            resizePage();
	        }, 200);
	    };

	    $scope.Next = function (item) {
	        item.CurrentPage += 1;
	        var totalPages = (item.Total / item.ItemsPerPage)
	        item.PrevVisibility = (item.CurrentPage > 1);
	        item.NextVisibility = item.CurrentPage != Math.ceil(totalPages);
	    };

	    $scope.Prev = function (item) {
	        item.CurrentPage -= 1;
	        var totalPages = (item.Total / item.ItemsPerPage)
	        item.NextVisibility = item.CurrentPage != Math.ceil(totalPages);
	        item.PrevVisibility = item.CurrentPage != 1;
	    };

	    $scope.RefinerChecked = function (item) {
	        if (item.Checked) {
	            baseService.Publish('shell:addSelectedRefiner', item);
	        } else {
	            baseService.Publish('shell:removeSelectedRefiner', item);
	        }
	    };

	    $scope.Clear = function (refiner) {

	        angular.forEach(refiner.Items, function (item) {
	            if (item.Checked) {
	                item.Checked = false;
	                $scope.RefinerChecked(item);
	            }
	        });
	    };

	    $scope.LoadMore = function (refiner) {
	        var limit = refiner.Items.length;
            if(refiner.ItemsPerPage  < limit)refiner.ItemsPerPage += 5;
	    };



	    var onUncheckSelectedRefiner = function (event, data) {

	        angular.forEach($scope.refiners, function (item) {

	            angular.forEach(item.Items, function (items) {
	                if (items.IsDateRange) {
	                    if (items.Parent == data.Parent) {
	                        items.Items[0].Value = "",
                            items.Items[0].ValueString = "",
                            items.Items[0].MaxDate = new Date("12/31/2099");

	                        items.Items[1].Value = "",
                            items.Items[1].ValueString = "",
                            items.Items[1].MinDate = new Date("1/1/0001");
	                    }
	                   
	                } else {
	                    if (items.Id == data.Id && items.Type == data.Type) {
	                        items.Checked = false;
	                        return;
	                    }

	                    angular.forEach(items.Items, function (subItems) {
	                        if (subItems == data) {
	                            subItems.Checked = false;
	                            return;
	                        }
	                    });
	                }
	               
	            });

	        });
	    };

	    var addDateRangeToRefiners = function (items) {
	        //var items = angular.copy(dateItems);
	        var fromItem = items.Items[0];
	        var toItem = items.Items[1];
	        if (globalUtility.IsNullOrWhiteSpace(fromItem.Value) || globalUtility.IsNullOrWhiteSpace(toItem.Value)) {
	            //removeDateRangeToRefiners(items);
	            return;
	        }
	        baseService.Publish('shell:addSelectedRefiner', items);
	    };

	    var removeDateRangeToRefiners = function (items) {
	        baseService.Publish('shell:removeSelectedRefiner', items);
	    };

	    $scope.ValidateDate = function (dateValueString) {
	        var valDate = new Date(dateValueString);
	        if (valDate.toDateString() == "Invalid Date") {
	            removeDateRangeToRefiners(items);
	        }
	    };
	    $scope.FromDateChanged = function (items) {
	        var fromItem = items.Items[0];
	        var toItem = items.Items[1];
	        var noDateSelected = (globalUtility.IsNullOrWhiteSpace(toItem.Value) && globalUtility.IsNullOrWhiteSpace(fromItem.Value));
	        if (globalUtility.IsNullOrWhiteSpace(fromItem.Value) || noDateSelected) {
	            removeDateRangeToRefiners(items);
	            return;
	        }
	        toItem.MinDate = new Date(fromItem.Value);
	        addDateRangeToRefiners(items);
	    };

	    $scope.ToDateChanged = function (items) {

	        var fromItem = items.Items[0];
	        var toItem = items.Items[1];
	        var noDateSelected = (globalUtility.IsNullOrWhiteSpace(toItem.Value) && globalUtility.IsNullOrWhiteSpace(fromItem.Value));
	        if (globalUtility.IsNullOrWhiteSpace(toItem.Value) || noDateSelected) {
	            removeDateRangeToRefiners(items);
	            return;
	        }
	        fromItem.MaxDate = new Date(toItem.Value);
	        addDateRangeToRefiners(items);

	    };

	    var onChangeDataSource = function (event, data) {
	        $scope.refiners = angular.copy(data);
	       
	        angular.forEach($scope.refiners, function (item) {
	            angular.forEach(item.Items, function (refiner) {
	                if (refiner.Checked == true) {
	                    $scope.RefinerChecked(refiner);
	                }
	            });

	        });

	        baseService.Publish('shell:refinerSetCompleted', true);
	    };

	    var assignSelectedRefinderOnLoad = function (event, data) {
	      
	    };


	    var onTabSelectionChange = function (event, data) {

	        var template = routeResolver.GetTemplate(data.AppName);
	        // $scope.sideNavUrl = $sce.trustAsResourceUrl(template.SideNavTemplate);
	        //if (data.HasSideNav) $scope.sideNavUrl = $sce.trustAsResourceUrl(template.SideNavTemplate);
	        //else $scope.sideNavUrl = "";
	        $scope.refiners = [];

	        baseService.Publish('shell:navToModule', data);
	    };

	   

	    $scope.init();

	    $scope.$on('$destroy', function () {

	        var events = ['shell:tabSelectionChange', 'shell:uncheckRefiner', 'shell:setRefinerDataSource'];
	        baseService.UnSubscribe(events);
	    });
	}]);

});