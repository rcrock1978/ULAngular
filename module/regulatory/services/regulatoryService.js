'use strict';

define([
    'app',
    'shell/model/refinerModel',
], function (app, refinerModel) {
    app.register.factory('regulatoryService', ['$http', '$timeout', 'crudService', 'regulatoryConfigService',
    function ($http, $timeout, crudService, config) {
        //globals
        var apiUrl = config.apiUrl;

        //public functions
        var svc = {
            addEvidence: addEvidence,
            buildRefiners: buildRefiners,
            buildWorkFlowRefiners: buildWorkFlowRefiners,
            deleteAuthorityRegulation: deleteAuthorityRegulation,
            deleteComplianceProgram: deleteComplianceProgram,
            deleteCountryInfo: deleteCountryInfo,
            deleteEvidence: deleteEvidence,
            deleteFile: deleteFile,
            deleteFrequencyAndTechnology: deleteFrequencyAndTechnology,
            deleteScopeStandards: deleteScopeStandards,
            deleteTestingValidity: deleteTestingValidity,
            downloadDocument: downloadDocument,
            getAll: getAll,
            getAllRefiners: getAllRefiners,
            getAuthorityRegulationData: getAuthorityRegulationData,
            getCountryInfoData: getCountryInfoData,
            getComplianceLookups: getComplianceLookups,
            getComplianceProgram: getComplianceProgram,
            getComplianceProgramUniqueIds: getComplianceProgramUniqueIds,
            getEvidenceLookups: getEvidenceLookups,
            getExistingEvidence: getExistingEvidence,
            getFrequencyTechnologyInfoData: getFrequencyTechnologyInfoData,          
            getRefiners: getRefiners,
            getRegulatoryWorkflow: getRegulatoryWorkflow,
            getScopeStandards: getScopeStandards,
            getSourceDocuments: getSourceDocuments,
            getTestingValidityData: getTestingValidityData,
            openEvidence: openEvidence,
            saveAuthorityAndRegulation: saveAuthorityAndRegulation,
            saveComplianceProgram: saveComplianceProgram,
            saveCountryInfo: saveCountryInfo,
            saveEvidence: saveEvidence,            
            saveDocument: saveDocument,
            saveFrequencyAndTechnology: saveFrequencyAndTechnology,
            saveScopeStandard: saveScopeStandard,
            saveTestingValidity: saveTestingValidity
        };

        return svc;   

        //function implementations
        ////////////

        function addEvidence(data, callback) {
            crudService.POST(apiUrl + "AddEvidence/", data, callback);
        }       

        function buildRefiners(data, preselectedRefiners) {
            var refinerDS = [];

            var refinerList = config.refinerList;

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

            var workflowRefinerList = config.workflowRefinerList;

            angular.forEach(workflowRefinerList, function (refiner) {
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

        function deleteAuthorityRegulation(data, callback) {
            crudService.POST(apiUrl + "DeleteAuthorityRegulation/", data, callback);
        }

        function deleteComplianceProgram(data, callback) {
            crudService.POST(apiUrl + "DeleteComplianceProgram/", data, callback);
        }

        function deleteCountryInfo(data, callback) {
            crudService.POST(apiUrl + "DeleteCountryInformation/", data, callback);
        }

        function deleteEvidence(data, callback) {
            crudService.POST(apiUrl + "RemoveEvidence/", data, callback);
        }

        function deleteFile(data, callback) {
            crudService.POST(apiUrl + "DeleteFile/", data, callback);
        }

        function deleteFrequencyAndTechnology(data, callback) {
            crudService.POST(apiUrl + "DeleteFrequencyTechnology/", data, callback);
        }

        function deleteScopeStandards(data, callback) {
            crudService.POST(apiUrl + "DeleteScopeStandard/", data, callback);
        }

        function deleteTestingValidity(data, callback) {
            crudService.POST(apiUrl + "DeleteTestingValidity/", data, callback);
        }

        function downloadDocument(data, callback) {
            crudService.POST_STREAM(apiUrl + "DownloadDocument/", data, callback);
        }

        function getAll(data, callback) {
            crudService.POST(apiUrl + "GetAll/", data, callback);
        };

        function getAuthorityRegulationData(params, callback) {
            crudService.GET(apiUrl + "GetAuthorityRegulation/", params, callback);
        }

        function getComplianceLookups(params, callback) {
            crudService.GET(apiUrl + "GetComplianceProgramLookup/", params, callback);
        }

        function getComplianceProgram(params, callback) {
            crudService.GET(apiUrl + "GetRegulatoryComplianceProgram/", params, callback);
        }

        function getComplianceProgramUniqueIds(params, callback) {
            crudService.GET(apiUrl + "GetComplianceProgramUniqueIds/", params, callback);
        }

        function getCountryInfoData(params, callback) {
            crudService.GET(apiUrl + "GetCountryInformation/", params, callback);
        }

        function getEvidenceLookups(callback) {
            crudService.GET(apiUrl + "GetEvidenceLookups/", {}, callback);
        }

        function getExistingEvidence(params, callback) {
            crudService.POST(apiUrl + "GetExistingEvidence/", params, callback);
        }

        function getFrequencyTechnologyInfoData(params, callback) {
            crudService.GET(apiUrl + "GetRegulatoryFrequencyTechnology/", params, callback);
        }               

        function getRefiners(params, callback) {
            crudService.GET(apiUrl + "GetRefiners/", params, callback);
        }

        function getAllRefiners(params, callback) {
            crudService.GET(apiUrl + "GetAllRefiners/", params, callback);
        }

        function getRegulatoryWorkflow(data, callback) {
            crudService.POST(apiUrl + "GetRegulatoryWorkflow/", data, callback);
        }

        function getScopeStandards(params, callback) {
            crudService.GET(apiUrl + "GetRegulatoryScopeStandard/", params, callback);
        }

        function getSourceDocuments(params, callback) {
            crudService.GET(apiUrl + "GetSourceDocuments/", params, callback);
        }

        function getTestingValidityData(params, callback) {
            crudService.GET(apiUrl + "GetRegulatoryTestingValidity/", params, callback);
        }

        function openEvidence(data, callback) {
            crudService.POST_STREAM(apiUrl + "OpenEvidence/", data, callback);
        }

        function saveAuthorityAndRegulation(data, callback) {
            crudService.POST(apiUrl + "SaveAuthorityRegulation/", data, callback);
        }

        function saveCountryInfo(data, callback) {
            crudService.POST(apiUrl + "SaveCountryInformation/", data, callback);
        }

        function saveComplianceProgram(data, callback) {
            crudService.POST(apiUrl + "SaveComplianceProgram/", data, callback);
        }

        function saveFrequencyAndTechnology(data, callback) {
            crudService.POST(apiUrl + "SaveRegulatoryFrequencyTechnology/", data, callback);
        }

        function saveScopeStandard(data, callback) {
            crudService.POST(apiUrl + "SaveScopeStandard/", data, callback);
        }

        function saveDocument(data, callback) {
            crudService.PUT(apiUrl + "SaveFile/", data, callback);
        };

        function saveEvidence(data, callback) {
            crudService.PUT(apiUrl + "SaveEvidenceFile/", data, callback);
        }

        function saveTestingValidity(data, callback) {
            crudService.POST(apiUrl + "SaveTestingValidity/", data, callback);
        }
    }]);

});
