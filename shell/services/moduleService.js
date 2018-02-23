'use strict';

define([
    'app',
    'shell/model/moduleModel'
], function (app, moduleModel) {

    app.factory('moduleService', ['$http', '$timeout',
        function ($http, $timeout) {
        var svc = {};
        svc.getModules = function (callback) {

            $http.get('../shell/config/moduleDefinition.json').success(function (data) {
               
                $timeout(function ()
                {
                    callback(moduleModel.Set(data));
                }, 1000);
            });
         
        };
    
        return svc;
    }]);

});


