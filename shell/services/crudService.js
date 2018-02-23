
'use strict';

define([
    'app',
    'globalUtility',
    'enums'
], function (app, globalUtility,enums) {

    app.factory('crudService', ['$http','$q',
        function ($http,$q) {
            var svc = {

                GET: function (apiUrl, param, callback) {
                    $http({
                        method: 'GET',
                        url: globalUtility.ServiceUrl + apiUrl,
                        headers: { 'Content-Type': 'application/json' },
                        params: param,
                    }).success(function (response) {
                        callback(response);
                    }).error(function (response) {
                        callback(response);
                    });
                },
                PUT: function (apiUrl, data, callback) {
                    $http({
                        url: globalUtility.ServiceUrl + apiUrl,
                        method: "PUT",
                        data: data,
                    }).success(function (response) {
                        callback(response);
                    }).error(function (response) {
                        callback(response);
                    });

                },
                POST: function (apiUrl, data, callback) {
                    $http({
                        url: globalUtility.ServiceUrl + apiUrl,
                        method: "POST",
                        data: data,
                    }).success(function (response) {
                        callback(response);
                    }).error(function (response) {
                        callback(response);
                    });

                },
                POST_TWO_PARAM: function (apiUrl, data, data2, callback) {
                    $http({
                        url: globalUtility.ServiceUrl + apiUrl,
                        method: "POST",
                        data: data,
                        data2: data2,
                    }).success(function (response) {
                        callback(response);
                    }).error(function (response) {
                        callback(response);
                    });

                },
                POST_PARAM: function (apiUrl, param, callback) {
                    $http({
                        url: globalUtility.ServiceUrl + apiUrl,
                        method: "POST",
                        params: param,
                    }).success(function (response) {
                        callback(response);
                    }).error(function (response) {
                        callback(response);
                    });
                },
                POST_STREAM: function (apiUrl, data, callback) {

                    $http({
                        method: 'POST',
                        url: globalUtility.ServiceUrl + apiUrl,
                        headers: { 'Content-Type': 'application/json' },
                        data: data,
                        responseType: 'arraybuffer'

                    }).success(function (response) {

                        callback({
                            Data:response,
                            Message: enums.ResponseType.Success

                        });
                    }).error(function (response) {
                        callback({
                            Data: "",
                            Message: enums.ResponseType.Fail

                        });
                    });
                  
                }

            };

            return svc;
        }]);

});
