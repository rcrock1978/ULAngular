'use strict';
define([
	'app',
	'routeResolver',
	'globalUtility',
    'authService'
], function (app, routeResolver, globalUtility, authService) {
	
    app.controller('masterpageController',
        ['$scope', '$sce', '$http', '$filter', '$timeout', '$rootScope', '$q', '$localStorage', '$cookies', '$cookieStore', '$sessionStorage', 'baseService', 'dialogService','moduleService',
    function ($scope, $sce, $http, $filter, $timeout, $rootScope, $q, $localStorage, $cookies, $cookieStore, $sessionStorage, baseService, dialogService, moduleService) {

        
         //--PROPERTIES

        $scope.showOverlay = false;
        $sce.showDialog2Overlay = false;
		  $scope.searchFilter = "Search All";
		  var resolveCtr = 0;
		  var validModules = $filter('filter')(globalUtility.Modules, function (value, index) { return value.IsEnable == true; });

		  var loadModulesCompleted = function () {
		      resolveCtr += 1;
		      if (validModules.length == resolveCtr) {
		          if (globalUtility.IsDebug) $scope.showSpinner = false;
		          else IsBusy(false);
		          var defaultModule = $filter('filter')(validModules, function (value, index) { return value.AppName == globalUtility.SelectedScope; });
		          defaultModule[0].Selected = true;
		          baseService.Publish('shell:navToModule', defaultModule[0]);
		          baseService.Publish('shell:tabSelectionChange', defaultModule[0]);
		          globalUtility.CurrentPage = defaultModule[0].AppName;
		      }
		  };
          //--END PROPERTIES
		  $scope.init = function () {
		      
		      baseService.PageInit();
		      if (globalUtility.IsDebug) $scope.showSpinner = true;
		      else IsBusy(true);
		      $scope.user = $localStorage.User;
		     // if (!baseService.IsAuthenticated()) return;
		      //PUB SUB EVENT HANDLERS
		      baseService.Subscribe('shell:showSpinner', ShowSpinner);
		      baseService.Subscribe('shell:showOverlay', ShowOverlay);
		      baseService.Subscribe('shell:showModalPopUpOverLay', ShowDialog2Overlay);
		      
		      baseService.Subscribe('shell:showSearchBar', SearchBarVisibility);

		      angular.forEach(globalUtility.Modules, function (module) {
		          if (module.IsEnable) {
		              routeResolver.RegisterModule(module, $q, $rootScope, loadModulesCompleted);
		          }
		      });


		      var subscriber = new kernel.messaging.subscriber('SmartInsight', 'smi:NavigateToAction', function (command) {

		        //  if (globalUtility.CurrentPage === "") return;
		          switch (command.arg) {
		              case "SayHello": SayHello(); break;
		              case "SayHi": SayHi(); break;

		          };
		      });

		      channel.register(subscriber);
		  };
          
          $scope.setSelectedFilter  = function(e){
            	$scope.searchFilter = e.filter.filterLabel;
          };

         
	      $scope.clearCriteria = function(){
	      	var criteria = $scope.criteria;
	      	if(criteria.length > 0)$scope.criteria = "";
	
	      };

	      $scope.Search = function () {
	          baseService.Publish(globalUtility.CurrentPage + ':search', $scope.criteria);
	      };

	      var SearchBarVisibility = function (event, data) {
	          $scope.SearchBarVisible = data;
	      };

	    
	      var populateSearchCriterias = function (event,data) {
	          $scope.searchCriterias = data;
	      };

	      var ShowSpinner = function (event, data) {
	          if (globalUtility.IsDebug) $scope.showSpinner = data;
	          else IsBusy(data);
	      };

	      var ShowOverlay = function (event, data) {
	          $scope.showOverlay = data;
	          DisableKernelNavs(data);
	      };

        var ShowDialog2Overlay = function (event, data) {
            $scope.showDialog2Overlay = data;
	          //DisableKernelNavs(data);
	      };
	      
	      $scope.init();

	      $scope.$on('$destroy', function () {

	          var events = ['shell:showSpinner', 'shell:showOverlay', 'shell:showSearchBar', 'shell:showModalPopUpOverLay'];
	          baseService.UnSubscribe(events);
	      });
	}]);
	
});
