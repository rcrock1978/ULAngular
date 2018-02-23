

'use strict';

define([
    'app',
    'globalUtility'
], function (app, globalUtility) {

    app.register.factory('newsService', ['$timeout', 'crudService', '$http',
        function ($timeout, crudService, $http) {
            var apiUrl = "api/news/";
            var svc = {};

            svc.SaveNews = function (data, callback) {
                crudService.POST(apiUrl + "Save/", data, callback);
            };

            ////GET ALL INFORMATION FROM JSON FILE
            //svc.GetInformation = function (callback) {
            //    $http.get('../shell/datas/newsDummyInfo.json').success(function (data) {

            //        var _data = JSON.stringify(data);
            //        var response = JSON.parse(_data);

            //        $timeout(function () {
            //            callback(response);
            //        }, 1000);
            //    });
            //};

            //svc.GetRefiners = function (callback) {
            //    $http.get('../shell/datas/newsRefiners.json').success(function (data) {

            //        $timeout(function () {
            //            callback(data);
            //        }, 1000);

            //    });
            //};

            ////LOOKUPS FROM JSON FILE
            //svc.GetLookUps = function (callback) {
            //    $http.get('../shell/datas/newsLookUps.json').success(function (data) {

            //        $timeout(function () {
            //            callback(data);
            //        }, 1000);

            //    });
            //};

            svc.GetAllLookups = function (callback) {
                crudService.GET(apiUrl + "GetAllLookups/", null, callback);
            };

            svc.GetAll = function (data, callback) {
                crudService.POST(apiUrl + "GetAll/", data, callback);
            };

            //svc.SaveNews = function (data, callback) {
            //    crudService.POST(apiUrl + "Save/", data, callback);
            //};

            svc.GetByItemId = function (data, callback) {
                crudService.GET(apiUrl + "GetByItemId/", data, callback);
            }

            svc.GetAllRefiners = function (callback) {
                crudService.GET(apiUrl + "GetAllRefiners/", null, callback);
            };

            svc.GetNewsWorkFlow = function (data, callback) {
                crudService.POST(apiUrl + "GetNewsWorkFlow/", data, callback);
            };

            svc.GetNewsWorkFlowAllRefiners = function (callback) {
                crudService.GET(apiUrl + "GetNewsWorkFlowAllRefiners/", null, callback);
            };
            
            //SHAREPOINT API
            svc.SaveArticlePicture = function (data, callback) {
                crudService.POST(apiUrl + "SaveArticlePicture/", data, callback);
            };

            svc.DownloadArticlePicture = function (data, callback) {
                crudService.POST_STREAM(apiUrl + "DownloadArticlePicture/", data, callback);
            }

            svc.GetArticlePicture = function (param, callback) {
                crudService.GET(apiUrl + "GetArticlePicture/", param, callback);
            };
 
            svc.GetEmailWorkflowContent = function (param, callback) {
                crudService.GET(apiUrl + "GetNewsWorkflow/", param, callback);
            };           

            svc.DeleteArticlePicture = function (param, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteArticlePicture/", param, callback);
            };

            //EVIDENCE DOCUMENT
            svc.AddEvidence = function (data, callback) {
                var _url = 'api/regulatory/';
                crudService.POST(_url + "AddEvidence/", data, callback);
            }

            svc.GetExistingEvidence = function (params, callback) {
                var _url = "api/regulatory/";
                crudService.POST(_url + "GetExistingEvidence/", params, callback);
            }

            svc.SaveEvidence = function (data, callback) {
                crudService.PUT(apiUrl + "SaveEvidenceFile/", data, callback);
            }

            svc.DeleteEvidence = function (data, callback) {
                var _url = "api/regulatory/";
                crudService.POST(_url + "RemoveEvidence/", data, callback);
            }

            svc.OpenEvidence = function(data, callback) {
                crudService.POST_STREAM(apiUrl + "OpenEvidence/", data, callback);
            }

            //svc.GetSampleWorkflow = function (callback) {
            //    $http.get('../shell/datas/newsWorkflow.json').success(function (data) {

            //        var _data = JSON.stringify(data);
            //        var response = JSON.parse(_data);

            //        $timeout(function () {
            //            callback(response);
            //        }, 1000);
            //    });
            //};

            svc.settingsState = false;

            return svc;
        }]);

});
