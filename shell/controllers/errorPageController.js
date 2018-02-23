

define([
	'app',
], function (app) {
    app.controller('errorPageController', ['$scope', '$timeout', 'baseService', 'dialogService',
	function ($scope, $timeout, baseService, dialogService) {



	    $scope.init = function () {
	        dialogService.CloseAll();
	    };

	    $scope.init();

	    $scope.$on('$destroy', function () {
	        //var events = ['shell:alert'];
	        //baseService.UnSubscribe(events);
	    });
	}]);

});
