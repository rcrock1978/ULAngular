

define([
	'app',
], function (app) {
    app.controller('fileUploaderController', ['$scope', '$timeout', 'baseService','$filter',
	function ($scope, $timeout, baseService, $filter) {

	    $scope.files = [];
	    $scope.browsedFiles = [];

	    $scope.Remove = function (file) {
	        $scope.files = $filter('filter')($scope.files, function (value, index) { return value.name != file.name; });
	        $scope.datasource = $scope.files;
	    };

	    $scope.ClearAll = function () {
	        $scope.files = [];
	        $scope.browsedFiles = [];
	        $scope.datasource = $scope.files;
	    };


	    $scope.$watch('browsedFiles', function (newValue, oldValue, scope) {
           
	        if ($scope.browsedFiles.length == 0 ) return;
	        angular.forEach($scope.browsedFiles, function (item) {
	            var contains = $filter('filter')(this, function (value, index) { return value.name == item.name; });
	            if (contains.length == 0) {
	                this.push(item);
	            }
	           
	        }, $scope.files);
	        $scope.datasource = $scope.files;
	    });

	    $scope.$watch('datasource', function (newValue, oldValue, scope) {
	        //if ($scope.files.length != 0) return;
	        //$scope.files = angular.copy(newValue);
	        $scope.files = newValue;
	    });
	}]);

});
