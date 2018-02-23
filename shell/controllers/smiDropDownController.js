

define([
	'app',
    'globalUtility',
], function (app,globalUtility) {
    app.controller('smiDropDownController', ['$scope', '$attrs', '$timeout', 'baseService', '$filter',
	function ($scope, $attrs, $timeout, baseService, $filter) {


	    $scope.limit = 10;
	    var onLoad = true;
	    $scope.searchText = "";
	    $scope.filtered = [];
	    $scope.isOpen = false;
	    $scope.isValid = true;
	    $scope.controlId = "drp-smi-" + Math.random().toString().replace(".","");
	    var elem = document.getElementById($scope.controlId);
	    var hasOnChangeEvent = $attrs.onchange || false;
	    var ds = angular.copy($scope.datasource);

	    $scope.init = function () {
	        setDrpMenuWidth();
	    };
	    var ctr = 0;

	    $scope.startsWith = function (actual, expected) {
	        var lowerStr = (actual + "").toLowerCase();
	        return lowerStr.indexOf(expected.toLowerCase()) === 0;
	    }
	    $scope.onKeyUp = function (e, val) {

	        if (!$scope.searchable) return;
	        $scope.isOpen = val.length > 0 ? true : false;
	        setDrpMenuWidth();

	        if ($scope.filtered.length > 0) {
	            var idx = 0;
	            angular.forEach($scope.filtered, function (item) {
	                item.Selected = false;
	                //if (item.Text.toLowerCase().trim().startsWith(val.toLowerCase.trim()) && !hasSelected) {
	                //    item.Selected = true;
	                //    hasSelected = true;
	                //}

	            });
	            $scope.filtered[0].Selected = true;
	         
	        }
	        $scope.filterText = val;
	    };

	    $scope.onEnter = function () {
	        if ($scope.searchText != "") {
	            if ($scope.filtered.length > 0) {
	                $scope.searchText = angular.copy($scope.filtered[0].Text.trim());
	                var temp = $filter('filter')($scope.datasource, function (value, index) { return value.Text.trim() == $scope.searchText.trim(); });
	                setModel(temp[0]);
	                $scope.filterText = "";
               
	                $scope.isOpen = false;
	            }
	        }
	    };

	    $scope.SetSelected = function (item) {
	        $scope.searchText = item.Text.trim();
	        setModel(item);
	        $scope.filterText = "";
	        onLoad = false;
	    };

	    $scope.toggleDropDown = function () {
	        //  $scope.isOpen = !$scope.isOpen;
	        setDrpMenuWidth();
	        if (!globalUtility.IsNullOrWhiteSpace($scope.model)) {
	            angular.forEach($scope.filtered, function (item) {
	               // item.Selected = item.Text.trim() == $scope.searchText.trim() ? true : false;
	                item.Selected = item.Id == $scope.model;
	            });

	        }
	    };

	    var setDrpMenuWidth = function () {
	        var elem = document.getElementById($scope.controlId);
	        if (elem) {
	            $("#" + $scope.controlId + " > div > .input-group-btn > .smi-drp-menu").css("width", elem.clientWidth + "px");
	        }
                
	    };

	    var setModel = function (model) {
	        $scope.model = model.Id;
	        $scope.searchText = model.Text;
	        $scope.filterText = "";

	        angular.forEach($scope.filtered, function (item) {
	            // item.Selected = item.Text.trim() == $scope.searchText.trim() ? true : false;
	            item.Selected = item.Id == $scope.model;
	        });
	        onLoad = false;
	    };
	

	    $scope.$watch('searchText', function (newValue, oldValue, scope) {
	        if (ds.length == 0) return;
	        if (newValue == "") { $scope.model = ""; return };
	        var temp = $filter('filter')($scope.datasource, function (value, index) { return value.Text.trim() == newValue.trim(); });
	        if (temp.length > 0) {
	          //  setModel(temp[0]);
	            $scope.isValid = true;
	        }
	        else {
	            $scope.model = "";
	            $scope.isValid = false;
	        }
	    });

	    $scope.$watch('model', function (newValue, oldValue, scope) {
	        if(ds.length == 0)return;
	        if (onLoad) {
	            if (newValue != null) {
	                if (newValue.constructor !== Array) {
	                    var temp = $filter('filter')($scope.datasource, function (value, index) { return value.Id == newValue; });

	                    if (temp.length > 0) $scope.SetSelected(temp[0]);
	                }
	            }
	        }
            
	        if (hasOnChangeEvent) {
	            $timeout(function () {
	                $scope.onchange()
	            }, 500); 
	           
	        };
	    });

	}]);

});
