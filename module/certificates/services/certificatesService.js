

'use strict';

define([
    'app',
    'globalUtility'
], function (app, globalUtility) {

    app.register.factory('certificatesService', ['$timeout','crudService','$http',
        function ($timeout, crudService, $http) {
            var apiUrl = "api/certificates/";
            var svc = {};


            svc.SaveCertificate = function (data, callback) {
                crudService.POST(apiUrl + "Save/", data, callback);
            };

            svc.DeleteCertificate = function (param, callback) {
                crudService.POST_PARAM(apiUrl + "Delete/", param, callback);
            };

            svc.GetSourceDocuments = function(param,callback){
                crudService.GET(apiUrl + "GetSourceDocuments/", param, callback);
            };

            svc.GetByItemId= function (param, callback) {
                crudService.GET(apiUrl + "GetByItemId/", param, callback);
            };

            svc.GetAll = function (data, callback) {
                crudService.POST(apiUrl + "GetAll/", data, callback);
            };

            svc.GetAllLookups = function (callback) {
                crudService.GET(apiUrl + "GetAllLookups/", null, callback);
            };

            svc.GetAllLookupsForCustomers = function (data, callback) {
                crudService.GET(apiUrl + "GetAllLookupsForCustomers/", data, callback);
            };


            svc.GetAllRefiners = function (callback) {
                crudService.GET(apiUrl + "GetAllRefiners/", null, callback);
            };

            //SHAREPOINT API
            svc.SaveDocument = function (data, callback) {
                crudService.PUT(apiUrl + "SavePrimaryFile/", data, callback);
            };

            svc.SaveDocuments = function (data, callback) {
                crudService.POST(apiUrl + "SaveRelatedFiles/", data, callback);
            };

            svc.DownloadFile = function (data, callback) {
                crudService.POST_STREAM(apiUrl + "DownloadDocument/", data, callback);
              
            };

            svc.DeleteDocuments = function (param, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteSourceDocuments/", param, callback);
            };

            svc.DeleteALLSourceDocuments = function (param, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteAllSourceDocuments/", param, callback);
            };

            return svc;
        }]);

});
