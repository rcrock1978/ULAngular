
define([
	'app',
	'globalUtility',
    'enums'
], function (app, globalUtility, enums) {

    app.register.controller('r2cEvidenceController', ['$scope', '$http', '$rootScope', 'baseService', 'dialogService', 'r2cService',
	    function ($scope, $http, $rootScope, baseService, dialogService, r2cService) {


	        $scope.evidences = [];

	        $scope.evidenceDocumentTypes = [];
	        $scope.evidenceSource = [];
	        $scope.evidenceSelectedDocumentType = "";
	        $scope.evidenceSelectedSource = "";

	        $scope.evidenceUpdateDate = null;

	        $scope.evidenceFile = null;
           

	        $scope.evidenceInit = function () {
	            baseService.SearchBarVisibility(false);
	            r2cService.getEvidenceLookups(onGetEvidenceLookupCompleted);
	        };

	        $scope.evidenceInitiallizeItems = function () {
	            baseService.IsBusy(true);
	            var fields = [];
	            fields.push($scope.selectedRowId + "_" + $scope.selectedTab);
	            r2cService.getExistingEvidence(fields, onGetExistingEvidenceCompleted);
	           // alert($scope.selectedRowId)
	        };

	        $scope.SaveEvidence = function () {
	            baseService.IsBusy(true);
	            var evidence = {
	                Filename: $scope.evidenceFile.name,
	                SourceId: $scope.evidenceSelectedSource,
	                Remarks: null,
	                RemarksInternal: null,
	                UpdateDate: $scope.evidenceUpdateDate,
	                EvidenceNote: null,
	                DocumentTypeId: $scope.evidenceSelectedDocumentType
	            }

	            var fields = [];
	            fields.push($scope.selectedRowId + "_"+$scope.selectedTab);
	            var data = {
	                evidence: evidence,
	                selectedFields: fields,
	                tab: "R2C"
	            };

	            r2cService.addEvidence(data, onSaveEvidenceCompleted);
	        };

	        $scope.removeEvidence = function (item) {
	            var fields = [];
	            fields.push($scope.selectedRowId + "_"+$scope.selectedTab);
	            var param = {
	                evidenceId: item.EvidenceId,
	                selectedFields: fields
	            };
	            r2cService.deleteEvidence(param, onRemoveEvidenceCompleted);
	        };

	        $scope.onSeletedDocChange = function () {

	        };

	        $scope.onSeletedSourceChange = function () {

	        };
	        var onSaveEvidenceCompleted = function (response) {
	            if (response.Success) {
	      
	                var evidenceId = response.Data;
	                var file = $scope.evidenceFile;
	                var ext = file.name.substr(file.name.lastIndexOf('.') + 1);
	                var saveEvidenceFile = function (attachFile) {
	                    var param = {
	                        ComplienceProgramId: $scope.selectedComplianceProgram,
	                        EvidenceId: evidenceId,
	                        File: attachFile,
	                        FileExtension: ext
	                    };
	                    r2cService.saveEvidenceFile(param, onSaveEvidenceFileCompleted);
	                };
	                var reader = new FileReader();
	                reader.onloadend = function () {
	                    if (reader.readyState == 2) {
	                        var arrayString = reader.result;
	                        var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                        saveEvidenceFile(base64String.match(/.{1,100}/g));
	                    };

	                };
	                reader.readAsArrayBuffer(file);
	            } else {
	                baseService.IsBusy(false);
	                console.log(response.ErrorMessage);
	            }
	        };

	        var onSaveEvidenceFileCompleted = function (response) {
	            baseService.IsBusy(false);
	            $scope.evidenceInitiallizeItems();
	        };

	        var onRemoveEvidenceCompleted = function (response) {
	            $scope.evidenceInitiallizeItems();
	        };
	        var onGetEvidenceLookupCompleted = function (response) {

	            if (response.Success) {
	                angular.forEach(response.Data.DocumentTypeList, function (item) {
	                    this.push({ Id: item.DocumentTypeId, Text: item.DocumentName, Selected: false });
	                }, $scope.evidenceDocumentTypes);


	                angular.forEach(response.Data.EvidenceSourceList, function (item) {
	                    this.push({ Id: item.SourceId, Text: item.SourceName, Selected: false });
	                }, $scope.evidenceSource);
	            } else {
	                console.log(response.ErrorMessage);
	            }
	        };
            
	        var onGetExistingEvidenceCompleted = function (response) {
	            baseService.IsBusy(false);
	            if (response.Success) {
	                $scope.evidences = angular.copy(response.Data);
	            } else {
	                console.log(response.ErrorMessage);
	            }
	        };

	        $scope.$watch('selectedRowId', function (newValue, oldValue, scope) {
	            if (newValue != null) {
	                $scope.evidenceInitiallizeItems();
	            }
	        });

	        $scope.evidenceInit();
	    }]);
});
