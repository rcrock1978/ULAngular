define([
	'app',
	'globalUtility',
    'enums',
    'shell/model/refinerModel',
], function (app, globalUtility, enums, refinerModel) {

    app.register.controller('newsAddFavoriteController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'newsService',
	    function ($scope, $http, $rootScope, $filter, baseService, dialogService, regulatoryService) {
	        $scope.modalTitle = "Add Favorite";
	        $scope.isLoading = false;

	        $scope.CloseDialog = function () {
	            dialogService.CloseAll("Perform Close");
	        };

	        $scope.$on('$destroy', function () {

	            //var events = ['certificates:loadCertificateDetails'];
	            //baseService.UnSubscribe(events);
	        });
	    }]);
});