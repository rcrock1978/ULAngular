
define([
	'app',
	'globalUtility',
    'enums',
    'module/certificates/model/certificateItemModel'
], function (app, globalUtility, enums, certItemModel) {

    app.register.controller('viewCertificateFilesController', ['$scope', '$uibModalInstance', '$location', '$anchorScroll', '$http', '$rootScope'
        , '$filter', 'baseService', 'dialogService', 'bsAlertService', 'certificatesService', 'items',
	    function ($scope, $uibModalInstance, $location, $anchorScroll, $http,
            $rootScope, $filter, baseService, dialogService, bsAlertService, certificatesService, items) {

	        $scope.modalTitle = "PLEASE SELECT A DOCUMENT TO VIEW :";
	        $scope.primaryFiles = [];

	        $scope.relatedFiles = [];
	        
	        $scope.CloseDialog = function () {
	            dialogService.CloseAll();
	        };

	        $scope.Download = function (item, subfolder, certificateItemId) {

	            baseService.Publish('certificates:downloadCertificates',
                    {
                        FileName: item,
                        CertificateItemId: certificateItemId,
                        SubFolder: subfolder
                    });
	        };
	        $scope.init = function() {
	            $scope.primaryFiles = {
	                files: angular.copy(items.DocumentPaths.PrimaryFiles),
	                certificateItemId: angular.copy(items.CertificateItemId)
	            };

	            $scope.relatedFiles = {
	                files: angular.copy(items.DocumentPaths.RelatedFiles),
	                certificateItemId: angular.copy(items.CertificateItemId)
	            };

	            //$scope.relatedFiles = angular.copy(items.DocumentPaths.RelatedFiles);
	        };

	        $scope.init();

	        $scope.$on('$destroy', function () {

	            var events = [''];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
