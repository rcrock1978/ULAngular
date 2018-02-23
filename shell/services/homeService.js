'use strict';

define([
    'app',
], function (app) {
    app.factory('homeService', ['$http', '$filter', 'crudService', 'homeConfigService',
        function ($http, $filter, crudService, config) {
            var apiUrl = config.apiUrl;

            var svc = {
                buildRefiners: buildRefiners,
                deleteFavorite: deleteFavorite,
                deleteItemFile: deleteItemFile,
                downloadFile: downloadFile,
                getAllLookups: getAllLookups,
                getHomeLookups: getHomeLookups,
                getApplicationTypes: getApplicationTypes,
                getCountries: getCountries,
                getCustomers: getCustomers,
                getLanguages: getLanguages,
                getModules: getModules,
                getPowerSources: getPowerSources,
                getProductTypes: getProductTypes,
                getProductSubTypes: getProductSubTypes,
                getSourceDocuments: getSourceDocuments,
                getSectors: getSectors,
                getServiceUrl: getServiceUrl,
                getUserClaims: getUserClaims,
                getUserRoles: getUserRoles,
                getUserPreferences: getUserPreferences,
                getUserFavorites: getUserFavorites,
                getWorkFlowChanges : getWorkFlowChanges,
                setDropDownPermissions: setDropDownPermissions,
                saveFavorites: saveFavorites,
                savePreferences: savePreferences,
                saveWorkflow: saveWorkflow,
                saveDocuments: saveDocuments,
                saveItemFiles: saveItemFiles,
                sendEmail: sendEmail

            };

            return svc;

            //////////////
            function buildRefiners(data) {

                var refinerList = config.refinerList;

                angular.forEach(refinerList, function (refiner) {
                    refiner.set(data);
                });
            }

            function deleteFavorite(data, callback) {
                crudService.POST(apiUrl + "DeleteFavorite/", data, callback);
            }

            function deleteItemFile(data, callback) {
                crudService.POST(apiUrl + "DeleteItemFile/", data, callback);
            }

            function downloadFile(data, callback) {
                crudService.POST_STREAM(apiUrl + "DownloadDocument/", data, callback);

            };

            function getAllLookups(callback) {
                crudService.GET(apiUrl + "GetAllLookups/", null, callback);
            };

            function getHomeLookups(callback) {
                crudService.GET(apiUrl + "GetHomeLookups/", null, callback);
            };

            function getApplicationTypes(callback) {
                crudService.GET(apiUrl + "GetApplicationTypes/", null, callback);
            }

            function getCountries(callback) {
                crudService.GET(apiUrl + "GetCountries/", null, callback);
            };

            function getCustomers(callback) {
                crudService.GET(apiUrl + "GetCustomers/", null, callback);
            };

            function getLanguages(callback) {
                crudService.GET(apiUrl + "GetLanguages/", null, callback);
            };

            function getModules(callback) {
                var onSuccess = function (data) {
                    callback({
                        Data: data
                    });
                };

                $http.get('../shell/config/moduleDefinition.json').success(function (data) {
                    onSuccess(data);
                });
            };

            function getPowerSources(callback) {
                crudService.GET(apiUrl + "GetPowerSources/", null, callback);
            };

            function getProductTypes(callback) {
                crudService.GET(apiUrl + "GetProductTypes/", null, callback);
            }

            function getProductSubTypes(selectedProductTypes, callback) {
                var param = {
                    productTypeId: 0
                };

                if (selectedProductTypes.length > 0) {
                    param.productTypeId = selectedProductTypes.map(function (pst) { return pst.ProductTypeId }).join(',');
                }

                crudService.GET(apiUrl + "GetProductSubTypes/", param, callback);
            }

            function getSectors(callback) {
                crudService.GET(apiUrl + "GetSectors/", null, callback);
            };

            function getServiceUrl(callback) {
                var onSuccess = function (data) {
                    callback({
                        Data: data.apiUrl
                    });
                };

                $http.get('../shell/config/appConfig.json').success(function (data) {
                    onSuccess(data);
                });
            };

            function getSourceDocuments(data, callback) {
                crudService.GET(apiUrl + "GetSourceDocuments/", data, callback);
            };

            function getUserClaims(callback) {
                crudService.GET(apiUrl + "GetUserClaims/", null, callback);
            };

            function getUserRoles(userEmail, callback) {
                var params = {
                    userId: userEmail
                };
                crudService.GET(apiUrl + "GetUserRoles/", params, callback);
            };

            function getUserPreferences(data, callback) {
                crudService.POST(apiUrl + "GetUserPreferences/", data, callback);
            };

            function getUserFavorites(userPrefId, callback) {
                var params = {
                    userPreferenceId: userPrefId
                };
                crudService.GET(apiUrl + "GetUserFavorites/", params, callback);
            };

            function getWorkFlowChanges (param, callBack) {
                crudService.GET(apiUrl + "GetWorkFlowChanges/", param, callBack);
            };

            function saveWorkflow(data, callback) {
                crudService.POST(apiUrl + "SaveWorkflow/", data, callback);
            };

            function sendEmail(data, callback) {
                crudService.POST(apiUrl + "SendEmail/", data, callback);
            };

            function saveDocuments(data, callback) {
                crudService.POST(apiUrl + "SaveFiles/", data, callback);
            };

            function saveFavorites(data, callback) {
                crudService.POST(apiUrl + "SaveFavorites/", data, callback);
            };

            function savePreferences(data, callback) {
                crudService.POST(apiUrl + "SavePreferences/", data, callback);
            };

            function saveItemFiles(data, callback) {
                crudService.POST(apiUrl + "SaveItemFiles/", data, callback);
            };

            function setDropDownPermissions(selectedScope, callback) {
                var permissions = {
                    enableSector: false,
                    enableCountry: false,
                    enableComplianceProgram: false,
                    enableProductType: false,
                    enableFreqTech: false,
                    enableApplicationType: false,
                    enableCustomer: false
                };

                switch (selectedScope.toLowerCase()) {
                    case 'certificates':
                        setDropDownPermission(true, true, true, true, false, false, true);
                        break;

                    case 'contacts':
                        setDropDownPermission(true, true, false, false, false, false, false);
                        break;

                    case 'delivery':
                        setDropDownPermission(true, true, true, false, false, true, false)
                        break;

                    case 'news':
                        setDropDownPermission(true, true, true, true, true, false, false);
                        break;

                    case 'regulatory':
                        setDropDownPermission(true, true, true, false, false, true, false);
                        break;

                    case 'r2c':
                        setDropDownPermission(true, true, true, true, true, true, false);
                        break;

                    default:
                        setDropDownPermission(true, true, false, false, false, false, false);
                        break;
                }

                callback(permissions);

                function setDropDownPermission(enableSector, enableCountry, enableComplianceProgram
                    , enableProductType, enableFreqTech, enableApplicationType, enableCustomer) {

                    permissions.enableSector = enableSector;
                    permissions.enableCountry = enableCountry;
                    permissions.enableComplianceProgram = enableComplianceProgram;
                    permissions.enableProductType = enableProductType;
                    permissions.enableFreqTech = enableFreqTech;
                    permissions.enableApplicationType = enableApplicationType;
                    permissions.enableCustomer = enableCustomer;
                }
            }
        }]);

});
