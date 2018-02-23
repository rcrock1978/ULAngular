define([
	'app',
    'authService',
    'globalUtility',
    'routeResolver',
    'enums'
], function (app, authService, globalUtility, routeResolver, enums) {

    app.controller('changeRequestFormController', ['$scope', '$location', '$filter', '$sce', '$q', '$localStorage', '$cookies', '$cookieStore', '$sessionStorage', '$timeout', 'baseService', 'dialogService', 'bsAlertService', 'moduleService', 'workflowService', 'workflowConfigService', 'items',
	function ($scope, $location, $filter, $sce, $q, $localStorage, $cookies, $cookieStore, $sessionStorage, $timeout, baseService, dialogService, bsAlertService, moduleService, workflowService, config, items) {

	    $scope.CloseDialog                 = CloseDialog;
	    $scope.title                       = "REQUEST FOR CHANGE FORM";
	    $scope.countries                   = [];
	    $scope.unionList                   = [];
	    $scope.sectorList                  = [];
	    $scope.complianceList              = [];
	    $scope.modules                     = [];
	    $scope.relatedFiles                = [];
	    $scope.selectedCountry             = [];
	    $scope.selectedUnion               = [];
	    $scope.selectedSector              = [];
	    $scope.selectedCompliance          = [];
	    $scope.selectedModule              = [];
	    $scope.countrySettings             = config.crfCountrySettings;
	    $scope.unionSettings               = config.crfUnionSettings;
	    $scope.sectorSettings              = config.crfSectorSettings;
	    $scope.complianceSettings          = config.crfComplianceSettings;
	    $scope.moduleSettings              = config.crfModuleSettings;
	    $scope.Save                        = Submit;
	    var success                        = [];
	    var errors                         = [];
	    $scope.uploadPromptInvalidFilename = globalUtility.UploadPromptInvalidFilename;
	    $scope.uploadPromptInvalidFilesize = globalUtility.UploadPromptInvalidFilesize;

	    $scope.init = function () {
	        initializeItems();
	    };

	    function initializeItems() {

	        angular.forEach(items.CountryList, function (item) {
	            this.push({ id: item.CountryItemId, label: item.CountryName });
	        }, $scope.countries);
	        angular.forEach(items.RegionalEconomicUnion, function (item) {
	            this.push({ id: item.CountryTradeGroupId, label: item.Name });
	        }, $scope.unionList);

	        angular.forEach(items.SectorList, function (item) {
	            this.push({ id: item.CoveredSectorId, label: item.CoveredSector });
	        }, $scope.sectorList);

	        angular.forEach(items.ComplianceProgram, function (item) {
	            this.push({ id: item.CertificateProgramId, label: item.CertificateProgramName });
	        }, $scope.complianceList);

	        var filteredModules = $filter('filter')(items.Modules, function (value, index) { return value.ModuleId != 5 && value.ModuleId != 6; })

	        angular.forEach(filteredModules, function (item) {
	            this.push({ id: item.ModuleId, label: item.Name });
	        }, $scope.modules);

	    }

	    var validation = function (hasError) {
	        var hasError = hasError | ((undefined == $scope.selectedCountry || $scope.selectedCountry.length == 0) |
                                       (undefined == $scope.selectedSector || $scope.selectedSector.length == 0) |
                                       (undefined == $scope.details || $scope.details.length == 0) |
                                       (undefined == $scope.selectedModule || $scope.selectedModule.length == 0) |
                                       InvalidRelatedFile());
	        return hasError;
	    }

	    var InvalidRelatedFile = function () {
	        var pristine = $filter('filter')($scope.relatedFiles, function (value, index) { return value.pristine == false; })

	        $scope.invalidRelatedFileName = $filter('filter')(pristine, function (value, index) { return InvalidFilename(value.name); })
	        $scope.invalidRelatedFilesize = $filter('filter')(pristine, function (value, index) { return InvalidFilesize(value.size); })

	        return $scope.invalidRelatedFileName.length != 0 || $scope.invalidRelatedFilesize.length != 0;
	    }

	    var InvalidFilename = function (filename) {
	        filename = angular.lowercase(filename);
	        var regex = new RegExp("^([\\w\\s()-\\.]+)+\\.(?!(" + globalUtility.UploadExcludeExtension.join("$|") + "$" + "))[\\w\\s()]+$|^([\\w\\s()-]+)$");
	        return !(regex.test(filename));
	    }

	    var InvalidFilesize = function (filesize) {
	        if (filesize == 0) {
	            return (filesize == 0 | filesize == undefined) | filesize > globalUtility.UploadSize;
	        }
	        else {
	            return (filesize == undefined ? 0 : filesize) > globalUtility.UploadSize
	            //return (filesize == 0 | filesize == undefined) | filesize > globalUtility.UploadSize;
	        }

	    }

	    function Submit(hasError) {

	        baseService.IsBusy(true);

	        if ($scope.showErrors = validation(hasError)) {
	            $location.hash("top");

	            $scope.uploadPromptInvalidRelatedFilename = $scope.uploadPromptInvalidFilename + ' [' +
                                                                ($scope.invalidRelatedFileName.map(function (value, index) {
                                                                    return value.name;
                                                                })).join(" ,") + ']';
	            $scope.uploadPromptInvalidRelatedFilesize = $scope.uploadPromptInvalidFilesize + ' [' +
                                                                ($scope.invalidRelatedFilesize.map(function (value, index) {
                                                                    return value.name;
                                                                })).join(" ,") + ']';
	            baseService.IsBusy(false);

	            return;
	        }

	        var countryList    = "";
	        var unionList      = "";
	        var sectorList     = "";
	        var certSchemeList = "";
	        var moduleList     = "";

	        angular.forEach($scope.selectedCountry, function (item, idx, array) {
	            countryList += item.id;
	            if (idx !== array.length - 1) countryList += ",";
	        });

	        angular.forEach($scope.selectedUnion, function (item, idx, array) {
	            unionList += item.id;
	            if (idx !== array.length - 1) unionList += ",";
	        });

	        angular.forEach($scope.selectedSector, function (item, idx, array) {
	            sectorList += item.id;
	            if (idx !== array.length - 1) sectorList += ",";
	        });

	        angular.forEach($scope.selectedCompliance, function (item, idx, array) {
	            certSchemeList += item.id;
	            if (idx !== array.length - 1) certSchemeList += ",";
	        });

	        angular.forEach($scope.selectedModule, function (item, idx, array) {
	            moduleList += item.id;
	            if (idx !== array.length - 1) moduleList += ",";
	        });

	        var requestParam = {
	            WorkflowId: null,
	            GeoItemId: countryList,
	            CountryTradeGroupId: unionList,
	            CoveredSectorId: sectorList,
	            ComplianceProgramId: certSchemeList,
	            ModuleId: moduleList,
	            Details: $scope.details,
	            Link: $scope.webpage,
	            WorkflowStatusId: enums.WorkflowStatus.RequestForChangePendingReview.Id,
	            SourceId: null,
	            CreatedBy: globalUtility.CurrentUser,
	            ModifiedBy: globalUtility.CurrentUser
	        };

	        workflowService.saveWorkflow(requestParam, onSaveWorkflow_Completed);
	    }

	    var onSaveWorkflow_Completed = function (response) {
	        if (response) {
	            if (response.Success) {
	                if ($scope.relatedFiles.length > 0)
	                {
	                    SaveRelatedFiles(response.Data.ReponseItemId);
	                }
	                else {
	                    success.push(response.Data.Message);
	                    saveCompleted();
	                }
	            }
	            else {
	                errors.push(response.Data.Message);
	                saveCompleted();
	            }
	        }
	    };


	    function CloseDialog() {
	        dialogService.CloseAll();
	    }

        
	    var SaveRelatedFiles = function (itemId) {
	        var relatedFiles = [];
	        if ($scope.relatedFiles.length > 0) {

	            var pristine = $filter('filter')($scope.relatedFiles, function (value, index) { return value.pristine == true; })
	            var hasPristine = (pristine.length > 0);
	            angular.forEach($scope.relatedFiles, function (file) {
	                if (file.pristine) {

	                    var param = {
	                        WorkflowItemId: itemId,
	                        File: "" ,
	                        Filename: file.name,
	                        SubFolderName: 'RelatedFiles',
	                        HasPristine: hasPristine
	                    };
	                    relatedFiles.push(param);
	                    if (relatedFiles.length == $scope.relatedFiles.length) {
	                        workflowService.saveDocuments(relatedFiles, onSaveRelatedFilesCompleted);
	                    }
	                } else {
	                    var reader = new FileReader();
	                    reader.onloadend = function () {
	                        if (reader.readyState == 2) {

	                            var arrayString = reader.result;
	                            var base64String = globalUtility.ArrayBufferToBase64String(arrayString);

	                            var param = {
	                                WorkflowItemId: itemId,
	                                File: base64String.match(/.{1,100}/g),
	                                Filename: file.name,
	                                SubFolderName: 'RelatedFiles',
	                                HasPristine: hasPristine
	                            };
	                            relatedFiles.push(param);
	                            if (relatedFiles.length == $scope.relatedFiles.length) {
	                                workflowService.saveDocuments(relatedFiles, onSaveRelatedFilesCompleted);
	                            }
	                        }

	                    };
	                    reader.readAsArrayBuffer(file.file);
	                }

	            });

	        }
	        else {
	            saveCompleted();
	        }
	    };

	    var onSaveRelatedFilesCompleted = function (response) {
	        if (response) {
	            if (!response.IsSuccess) errors.push(response.Message);
	            else success.push(response.Message)
	        } else {
	            errors.push(response.Message);
	        }

	        saveCompleted();
	    };

	    var saveCompleted = function () {
	        baseService.IsBusy(false);
	        $scope.CloseDialog();
	        baseService.Publish("workflow:addWorkflow", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	    };

	    $scope.init();


	    $scope.$on('$destroy', function () {


	    });
	}]);

});