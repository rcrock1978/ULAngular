'use strict';

define([
    'app',
    'globalUtility',
    'shell/model/refinerModel',
], function (app, globalUtility, refinerModel) {

    app.register.factory('deliveryService', ['$timeout','crudService','$http','deliveryConfigService',
    function ($timeout, crudService, $http, deliveryConfig) {
            var apiUrl = "api/delivery/";
            var svc = {
                buildRefiners: buildRefiners,
                buildWorkFlowRefiners: buildWorkFlowRefiners,
                deleteALLSourceDocuments: deleteALLSourceDocuments,
                deleteDocuments: deleteDocuments,
                downloadFile: downloadFile,
                getAll: getAll,
                getAllDeliveryManualLookups: getAllDeliveryManualLookups,
                getAllDeliveryWorkflow: getAllDeliveryWorkflow,
                getAllLookups: getAllLookups,
                getAllRefiners: getAllRefiners,
                getSourceDocuments: getSourceDocuments,
                getSourceDocumentsById: getSourceDocumentsById,
                saveDocument: saveDocument,
                saveDocuments: saveDocuments,
                saveDeliveryManual: saveDeliveryManual,
                getAllWorkFlowRefiners: getAllWorkFlowRefiners,
                getWorkFlowDelivery: getWorkFlowDelivery
            };

            return svc;

            ////////////

            function buildRefiners(data, preselectedRefiners) {
                var refinerDS = [];

                var refinerList = deliveryConfig.refinerList;

                angular.forEach(refinerList, function (refiner) {
                    if (refiner.length(data) > 0) {
                        var items = [];
                        angular.forEach(refiner.data(data), function (item) {
                            if (refiner.preselected(preselectedRefiners).indexOf(refiner.Id(item)) === -1) {
                                this.push(refinerModel.Item(refiner.refinerType, refiner.Id(item), refiner.name(item), refiner.parent));
                            }
                            else {
                                this.push(refinerModel.Item(refiner.refinerType, refiner.Id(item), refiner.name(item), refiner.parent, true));
                            }
                        }, items);

                        refinerDS.push(refinerModel.Set(refiner.parent, items, false, refiner.isOpen));
                    }
                    else {
                        refinerDS.push(refinerModel.Set(refiner.parent, [], false, false));
                    }
                });

                return refinerDS;
            }

         function buildWorkFlowRefiners(data, preselectedRefiners) {
                var refinerDS = [];

                var refinerList = deliveryConfig.workFlowRefinerList;

                angular.forEach(refinerList, function (refiner) {
                    if (refiner.length(data) > 0) {
                        var items = [];
                        angular.forEach(refiner.data(data), function (item) {
                            if (refiner.preselected(preselectedRefiners).indexOf(refiner.Id(item)) === -1) {
                                this.push(refinerModel.Item(refiner.refinerType, refiner.Id(item), refiner.name(item), refiner.parent));
                            }
                            else {
                                this.push(refinerModel.Item(refiner.refinerType, refiner.Id(item), refiner.name(item), refiner.parent, true));
                            }
                        }, items);

                        refinerDS.push(refinerModel.Set(refiner.parent, items, false, refiner.isOpen));
                    }
                    else {
                        refinerDS.push(refinerModel.Set(refiner.parent, [], false, false));
                    }
                });

                return refinerDS;
            }

            function deleteALLSourceDocuments(param, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteAllSourceDocuments/", param, callback);
            };

            function deleteDocuments(param, callback) {
                crudService.POST_PARAM(apiUrl + "DeleteSourceDocuments/", param, callback);
            };

            function downloadFile(data, callback) {
                crudService.POST_STREAM(apiUrl + "DownloadDocument/", data, callback);

            };

            function getAll(data, callback) {
                crudService.POST(apiUrl + "GetAll/", data, callback);
            };

            function getAllDeliveryManualLookups(callback) {
                //crudService.GET(apiUrl + "GetAllLookups/", null, callback);
                $http.get('../shell/datas/deliveryManualLookupValues.json').success(function (data) {

                    var _data = JSON.stringify(data);
                    var response = JSON.parse(_data);

                    $timeout(function () {
                        callback(response);
                    }, 1000);
                });

            };

            function getAllDeliveryWorkflow(data, callback) {
                crudService.POST(apiUrl + "GetAllWorkFlows/", data, callback);
            };

            function getAllLookups(callback) {
                //crudService.GET(apiUrl + "GetAllLookups/", null, callback);
                $http.get('../shell/datas/deliverySampleLookupValues.json').success(function (data) {

                    var _data = JSON.stringify(data);
                    var response = JSON.parse(_data);

                    $timeout(function () {
                        callback(response);
                    }, 1000);
                });

            };

             function getAllWorkFlowRefiners(callback) {
                crudService.GET(apiUrl + "GetWorkFlowAllRefiners/", null, callback);
            };            

            function getAllRefiners(callback) {
                crudService.GET(apiUrl + "GetAllRefiners/", null, callback);
            };            

            function getSourceDocuments(param, callback) {
                crudService.POST(apiUrl + "GetSourceDocuments/", param, callback);
            };

            function getSourceDocumentsById(param, callback) {
                crudService.POST_PARAM(apiUrl + "GetSourceDocumentsById/", param, callback);
            };

            function getWorkFlowDelivery(param, callback) {
                crudService.GET(apiUrl + "GetWorkFlowDelivery/", param, callback);
            };

            function saveDeliveryManual(param, callback) {
                crudService.POST(apiUrl + "SaveDeliveryManual/", param, callback);
            };
            
            function saveDocument(data, callback) {
                crudService.POST(apiUrl + "SavePrimaryFile/", data, callback);
            };

            function saveDocuments(data, callback) {
                crudService.POST(apiUrl + "SaveRelatedFiles/", data, callback);
            };
        }]);

});
