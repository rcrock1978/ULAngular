
define([
	'app',
	'globalUtility',
    'enums',
    'module/delivery/model/deliveryManualItemModel'
], function (app, globalUtility, enums, deliveryManualItem) {

    app.register.controller('viewDeliveryManualController', ['$scope', '$uibModalInstance', '$location', '$anchorScroll', '$http', '$rootScope'
        , '$filter', 'baseService', 'dialogService', 'bsAlertService', 'deliveryService', 'items',
	    function ($scope, $uibModalInstance, $location, $anchorScroll, $http,
            $rootScope, $filter, baseService, dialogService, bsAlertService, deliveryService, items) {

	        $scope.modalTitle = "PLEASE SELECT A DOCUMENT TO VIEW :";
	        $scope.primaryFiles = [];

	        $scope.relatedFiles = [];

	        $scope.CloseDialog = function () {
	            dialogService.CloseAll();
	        };

	        $scope.Download = function (item, subfolder) {

	            baseService.Publish('delivery:downloadDelivery',
                    {
                        FileName: item,
                        DeliveryItemId: items.DeliveryItemId,
                        SubFolder: subfolder
                    });
	        };
	        $scope.init = function () {

	            $scope.primaryFiles = angular.copy(items.DocumentPaths.PrimaryFiles);
	            $scope.relatedFiles = angular.copy(items.DocumentPaths.RelatedFiles);
	        };

	        $scope.init();

	        $scope.$on('$destroy', function () {

	            var events = [''];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
