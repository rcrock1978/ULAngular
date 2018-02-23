

define([
	'app',
], function (app) {
    app.controller('bsAlertController', ['$scope','$timeout', 'baseService',
	function ($scope, $timeout, baseService) {
        
	    $scope.message = "";
	    $scope.type = "";
	    $scope.isMultiple = false;

	    $scope.close = function () {
	        $scope.message = "";
	    };

	    $scope.init = function () {
	        baseService.Subscribe('shell:alert', onShow);
	    };

	    var onShow = function (event, data) {
	        var self = $scope;
	        self.message = data.Message;
	        self.type = data.Type.Type;
	        self.isMultiple = data.IsMultiple;
	        //$timeout(function () {
	        //    $scope.close();
	        //}, 8000);
	    };

	  
	    $scope.init();

	    $scope.$on('$destroy', function () {
	        var events = ['shell:alert'];
	        baseService.UnSubscribe(events);
	    });
	}]);

});
