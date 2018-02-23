
define([
	'app',
	'globalUtility',
    'enums'
], function (app, globalUtility, enums) {

    app.register.controller('sampleController', ['$scope', '$http', '$rootScope', 'baseService', 'dialogService', 'sampleService',
	    function ($scope, $http, $rootScope, baseService, dialogService, sampleService) {

	        $scope.init = function (data) {
	            //  $scope.applications = globalUtility.ClientApps;
	            baseService.SearchBarVisibility(false);
	        };

	        $scope.init();
	    }]);
});
