

'use strict';

define([
    'app',
    'globalUtility'
], function (app, globalUtility) {

    app.register.factory('r2cService', ['$timeout','crudService','$http',
        function ($timeout, crudService, $http) {
            var apiUrl = "api/r2c/";
            var svc = {};

            svc.GetAll = function (data,callBack) {
                crudService.POST(apiUrl + "GetAll/", data, callBack);
            };
            svc.GetAllWorkFlow = function (data, callBack) {
                crudService.POST(apiUrl + "GetAllWorkFlow/", data, callBack);
            };
            svc.GetByComplienceId = function (data, callBack) {
                crudService.POST(apiUrl + "GetByComplienceById/", data, callBack); 
            };
            svc.GetAllWorkFlowRefiners = function (callBack) {
                crudService.GET(apiUrl + "GetAllWorkFlowRefiners/", null, callBack);
            };
            svc.GetAllRefiners = function (callBack) {
                crudService.GET(apiUrl + "GetAllRefiners/", null, callBack);
            };

            //SHAREPOINT API
            svc.saveAttachFile = function (data, callback) {
                crudService.POST(apiUrl + "SaveAttachFile/", data, callback);
            };

            svc.saveAttachFiles = function (data, callback) {
                crudService.POST(apiUrl + "SaveAttachFiles/", data, callback);
            };

            svc.deleteALLSourceDocuments = function (param, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteAllAttachedDocuments/", param, callback);
            };

            svc.saveR2CSample = function (data, callback) {
                crudService.POST(apiUrl + "SaveReadyToCertifySample/", data, callback);
            };

            svc.saveR2CDocument = function (data, callback) {
                crudService.POST(apiUrl + "SaveReadyToCertifyDocument/", data, callback);
            };
            //svc.DeleteR2C = function (param, callback) {
            //    crudService.POST_PARAM(apiUrl + "Delete/", param, callback);
            //};

            svc.GetSourceDocuments = function(data,callback){
                crudService.POST(apiUrl + "GetSourceDocuments/", data, callback);
            };

            svc.getAllLookups = function (callback) {
                crudService.GET(apiUrl + "GetAllLookups/", null, callback);
            };

            svc.getAllLookupsByCompliance = function (param, callback) {
                crudService.GET(apiUrl + "GetAllLookupsByCompliance/", param, callback);
            };


            svc.getEvidenceLookups = function (callback) {
               var url = "api/regulatory/";
               crudService.GET(url + "GetEvidenceLookups/", {}, callback);
            };

            svc.addEvidence = function (data, callback) {
                var url = "api/regulatory/";
                crudService.POST(url + "AddEvidence/", data, callback);
            };

            svc.getExistingEvidence = function (params, callback) {
                var url = "api/regulatory/";
                crudService.POST(url + "GetExistingEvidence/", params, callback);
            };

            svc.saveEvidenceFile = function (data, callback) {
                crudService.POST(apiUrl + "SaveEvidenceFile/", data, callback);
            };

            svc.deleteEvidence = function (data, callback) {
                var url = "api/regulatory/";
                crudService.POST(url + "RemoveEvidence/", data, callback);
            };

            svc.deleteR2CDocument = function (data, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteReadyToCertifyDocument/", data, callback);
            };

            svc.deleteR2CSample = function (data, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteReadyToCertifySample/", data, callback);
            };

            svc.deleteR2CSampleRemarks = function (data, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteReadyToCertifySampleRemarks/", data, callback);
            };

            return svc;
        }]);

});
