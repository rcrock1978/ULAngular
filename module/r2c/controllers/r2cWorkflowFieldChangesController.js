
define([
	'app',
	'globalUtility',
	'enums'
], function (app, globalUtility, enums) {

    app.register.controller('r2cWorkflowFieldChangesController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'homeService', 'items',
		function ($scope, $http, $rootScope, $filter, baseService, dialogService, homeService, items) {


		    $scope.info = [];
		    $scope.init = function () {

		        var onSucces = function(response){
		            $scope.info = response.Data;
		        };
		        homeService.getWorkFlowChanges({ workflowId: items.ItemId }, onSucces);
		    };


		    $scope.closeDialog = function () {
		        dialogService.CloseAll();
		    };

			$scope.init();

			$scope.$on('$destroy', function () {

				//var events = ['shell:addSelectedRefiner', 'shell:removeSelectedRefiner'];
				//baseService.UnSubscribe(events);
			});
		}]);
});
