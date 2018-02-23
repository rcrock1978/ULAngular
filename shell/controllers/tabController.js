define([
	'app',
    'authService',
    'globalUtility',
    'routeResolver',
    'enums'
], function (app, authService, globalUtility, routeResolver, enums) {

    app.controller('tabController', ['$scope', '$q', '$localStorage', '$cookies', '$cookieStore', '$sessionStorage', 'homeService', 'baseService', 'dialogService', 'bsAlertService',
	function ($scope, $q, $localStorage, $cookies, $cookieStore, $sessionStorage, homeService, baseService, dialogService, bsAlertService) {

	   
	    $scope.modules = [];
	    $scope.init = function () {
	        angular.forEach(globalUtility.Modules, function (item) {
	            if (item.IsEnable) this.push(item);
	        },$scope.modules);
	    };

	    $scope.TabClick = function (data) {
	        if (data.IsEnable) {
	            angular.forEach($scope.modules, function (module) {
	                module.Selected = (module.AppName == data.AppName);
	            });

	            baseService.Publish("shell:tabSelectionChange", data);
	        }
	    };

	   

	    $scope.init();

	}]);

});