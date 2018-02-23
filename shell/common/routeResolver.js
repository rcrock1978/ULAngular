

define([],function(){
	
	
 	var router = {
 		

 	    RegisterModule: function (module, $q, $rootScope,callBack) {
 	        var self = this,
 			 controllerPath = "module/" + module.AppName + "/controllers/",
             servicePath = "module/" + module.AppName + "/services/",
             cssPath = "module/" + module.AppName + "/assets/css/",
 	         dependencies = [];
 	        var services = module.Services,
 	            controllers = module.Controllers,
 	            styles = module.Styles;
 	        if (services.length > 0) {
 	            for (var i = 0; i < services.length; i++) {
 	                dependencies.push(servicePath + services[i] + "Service.js");
 	            }
 	        }
 	        if (controllers.length > 0) {
 	            for (var i = 0 ; i < controllers.length; i++) {
 	                dependencies.push(controllerPath + controllers[i] + "Controller.js");
 	            }
 	        }
 	        
            

 	        var defer = $q.defer();
 	        require(dependencies, function () {
 	            defer.resolve();
 	            callBack();
 	            $rootScope.$apply();
 	        });

 	        if (styles.length > 0) {
 	            hasStyles = true;
 	            for (var i = 0 ; i < styles.length; i++) {
 	                var cssUrl = cssPath + styles[i] + ".css";
 	                self.InjectCSS($q, cssUrl,callBack);
 	            } 
 	        }

 	        return defer.promise;
 	    },
 	   
 	    InjectCSS: function ($q, url,callBack) {

 	        var loadCSS = function (url, isLess) {
 	            var head = document.getElementsByTagName('head')[0];
 	            var script = document.createElement('link');
 	            script.rel = 'stylesheet';
 	            if (isLess) script.rel = 'stylesheet/less';
 	            script.type = 'text/css';
 	            script.href = url;
 	            script.onload = function () { deferred.resolve; if (callBack) callBack(); };

 	            angular.element('head').append(script);
 	        };
 	       
 	        var deferred = $q.defer();

 	            loadCSS(url, false);
 	        

 	        return deferred.promise;
 	    },

 	    GetModuleTemplate : function(module){
 	       return "module/" + module + "/templates/" + module + ".tpl.html"
 	    },

 	    GetModuleTemplateURL : function(currentModule,templateName){
 	        return "module/" + currentModule + "/templates/" + templateName + ".tpl.html"
 	    },
		
 	    GetTemplate: function (module,page) {
 			return {
 			    MainTemplate: "module/" + module + "/views/" + module + ".html",
 				ModulePage: page ?  "module/" + module + "/views/" + page + ".html" : ""
 			}
 		},
 		
 		//resolve route route for shell views & controllers
 		Resolve : function(module,isResolveModule){
 			var templatePath = "shell/views/";
 			if(isResolveModule){
 				templatePath = "module/"+module+"/views/"
 			}
 			return {
	 				templateUrl : templatePath + module + ".html",
	 				controller : module + "Controller"
	 			}
 				
 		},

 	};
	
	return router;
});
