

define([
	'app',
], function (app) {
    app.controller('smiModalTabController', ['$scope', '$attrs','$filter', '$timeout', 'baseService', 'homeService',
	function ($scope, $attrs, $filter, $timeout, baseService, homeService) {


	    var hasOnChangeEvent = $attrs.ontabchange || false;
	    var hasSelectedAttr = $attrs.selected || false;
	    $scope.selectedLanguage = "";
	    $scope.languages = [];

	    $scope.SelectionChange = function (tab) {
	        if (hasOnChangeEvent) $scope.ontabchange({ val: tab });
	    };

	    $scope.init = function () {
	        homeService.getLanguages(onGetLanguages_Completed);
	    };

	    var onGetLanguages_Completed = function (response) {
	        angular.forEach(response.Data, function (item) {
	            this.push({ Id: item.CultureTypeId, Text: item.CultureTypeDesc, Selected: false });
	        }, $scope.languages);
	    };

        

	    $scope.init();

	    //$scope.$watch('datasource', function (newValue, oldValue, scope) {
	    //    if (!isModifiedOutSide) return;
	    //    $scope.files = angular.copy(newValue);
	    //    $scope.browsedFiles = angular.copy(newValue);
	    //});

	}]);

});
