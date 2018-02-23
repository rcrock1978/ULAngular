 define([
 	'routeResolver'
 	],
 function(routeResolver) {
      var app = angular.module('app', [
            'ngRoute', 'ui.router', 'ui.bootstrap', 'ngStorage', 'ngCookies', 'angularUtils.directives.dirPagination',
            'kendo.directives', 'ui.grid', 'ui.grid.selection', 'ui.grid.infiniteScroll', 'ui.grid.edit', 'ui.grid.rowEdit',
            'ui.grid.saveState', 'ui.grid.cellNav', 'angularjs-dropdown-multiselect', 'ui.tinymce', 'ngSanitize', 'ui.select','ui.grid.resizeColumns'
      ]);

       app.config(['$stateProvider','$urlRouterProvider','$controllerProvider', 
                '$compileProvider', '$filterProvider', '$provide', '$httpProvider',                
          function ($stateProvider,$urlRouterProvider,$controllerProvider, 
                  $compileProvider, $filterProvider, $provide, $httpProvider) {
                  	
              $httpProvider.interceptors.push('tokenInterceptor');
    
            app.register =
            {
                controller: $controllerProvider.register,
                directive: $compileProvider.directive,
                filter: $filterProvider.register,
                factory: $provide.factory,
                service: $provide.service
            };

           // $locationProvider.html5Mode(true);
          	$urlRouterProvider.otherwise('/home');
          	
                $stateProvider
            .state('main', {
                url: '/main',
                	views: {
                    '': routeResolver.Resolve('masterpage'),
                	    'leftpane@main': routeResolver.Resolve('leftpane'),
                        'content@main': routeResolver.Resolve('content'),
                        'rightpane@main': routeResolver.Resolve('rightpane'),
                        'modaltemplate@main': { templateUrl: "shell/templates/modal.tpl.html" },
                        'alertTemplate@main': { templateUrl: "shell/templates/alert.tpl.html", controller: 'bsAlertController' },
                        'underConstructiontemplate@main': { templateUrl: "shell/templates/pageUnderConstruction.tpl.html" },
                        //'fileUploadTemplate@main': { templateUrl: "shell/templates/fileUploader.tpl.html", controller: 'fileUploaderController' },
                        'tabContainer@main': routeResolver.Resolve('tab'),
                        'changeRequestForm@main': { templateUrl: "shell/templates/changeRequestForm.tpl.html", controller: 'changeRequestFormController' },
                	}
                
                }).state('home', {
                url: '/home',
                	views: {
                	    '': routeResolver.Resolve('home'),
                	    'modaltemplate@home': { templateUrl: "shell/templates/modal.tpl.html" },
                	    'alertTemplate@home': { templateUrl: "shell/templates/alert.tpl.html", controller: 'bsAlertController' },
                	    'rightpane@home': routeResolver.Resolve('rightpane'),
                	    'changeRequestForm@home': { templateUrl: "shell/templates/changeRequestForm.tpl.html", controller: 'changeRequestFormController' },
                	}

                }).state('unauthorized', {
                    url: '/unauthorized',
                    views: {
                        '': { templateUrl: "shell/views/unauthorized.html", controller: 'errorPageController' }
                    }

                    });

              
          }]);
	
       app.filter('griddropdown', function () {          
           return function (input, context) {
               if (context.col !== undefined) {
                   var map = context.col.colDef.editDropdownOptionsArray;
                   var idField = context.col.colDef.editDropdownIdLabel;
                   var valueField = context.col.colDef.editDropdownValueLabel;
                   var initial = context.row.entity[context.col.field];
                   if (typeof map !== "undefined") {
                       for (var i = 0; i < map.length; i++) {
                           if (map[i][idField] == input) {
                               return map[i][valueField];
                           }
                       }
                       //return "";
                   } else if (initial) {
                       return initial;
                   }
                   return input;
               }
           };
       });
     
        return app;
  });