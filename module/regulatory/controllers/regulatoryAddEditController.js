define([
	'app',
	'globalUtility',
    'enums',
    'shell/model/refinerModel',
], function (app, globalUtility, enums, refinerModel) {

    app.register.controller('regulatoryAddEditController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'regulatoryService', '$timeout', '$q', '$interval', 'regulatoryConfigService', '$uibModalInstance', 'items', 'homeService',
    function ($scope, $http, $rootScope, $filter, baseService, dialogService, regulatoryService, $timeout, $q, $interval, config, $uibModalInstance, items, homeService) {
	        //"global" variables	
	        //var activeTab = 'CountryInfo';
	        var deleteMessage = "Are you sure you want to delete this item?";
	        var downloadParams = {};
	        var evidenceId = '';
	        var markFolder = config.markFolder;
	        var manualFolder = config.manualFolder;	        
	        var updateFlag = false;
	        

	        //viewmodel/bindable members
	        $scope.activeTab                                     = 'CountryInfo';
	        $scope.addAuthorityRegulation                        = addAuthorityRegulation;
	        $scope.addEvidence                                   = addEvidence;	        
	        $scope.authorityRegulationsGridOnSelectedCountry     = authorityRegulationsGridOnSelectedCountry;
	        $scope.authorityRegulationSelectedCountry            = "";
	        $scope.addCountryInfo                                = addCountryInfo;
	        $scope.addComplianceProgram                          = addComplianceProgram;
	        $scope.addEditFile                                   = addEditFile;
	        $scope.addEvidenceClicked                            = false;
	        $scope.addFrequencyTechnology                        = addFrequencyTechnology;
	        $scope.addScopeStandards                             = addScopeStandards;
	        $scope.addTestingValidity                            = addTestingValidity;
	        $scope.authorityregulationInfoGrid                   = {};
	        $scope.closeDialog                                   = closeDialog;
	        $scope.complianceProgramInfoGrid                     = {};
	        $scope.complianceProgramLookup                       = [];
	        $scope.complianceProgramUniqueIds                    = [];
	        $scope.countryInfoGrid                               = {};
	        $scope.countryLookup                                 = [];            
	        $scope.deleteFile                                    = deleteFile;
	        $scope.enableAddEvidence                             = enableAddEvidence;
	        $scope.enableEvidence                                = false;
	        $scope.evidenceDocumentType                          = [];	        
	        $scope.evidenceNote                                  = '';
	        $scope.evidenceRemarks                               = '';
	        $scope.evidenceRemarksInternal                       = '';
	        $scope.evidenceSelectedDocumentType                  = '';
	        $scope.evidenceSelectedSource                        = '';
	        $scope.evidenceSource                                = [];
	        $scope.evidenceUpdateDate                            = '';
	        $scope.existingEvidenceList                          = [];
	        $scope.frequencytechnologyInfoGrid                   = {};
	        $scope.frequencyTechnologyGridOnSelectedCountry      = frequencyTechnologyGridOnSelectedCountry;
	        $scope.frequencyTechnologySelectedCountry            = "";
	        $scope.gridHasNoData                                 = true;	        
	        $scope.isApprover                                    = false;
	        $scope.isWorkflow                                    = false;
	        $scope.itemId                                        = null;
	        $scope.modalTitle                                    = 'MANAGE DATA';
	        $scope.onComplianceProgramCountrySelect              = onComplianceProgramCountrySelect;
	        $scope.onScopeStandardsCountrySelect                 = onScopeStandardsCountrySelect;
	        $scope.onTestingValidityCountrySelect                = onTestingValidityCountrySelect;
	        $scope.onTestingValidityComplianceProgramSelect      = onTestingValidityComplianceProgramSelect;
	        $scope.openEvidence                                  = openEvidence;
	        $scope.openFile                                      = openFile;
	        $scope.rejectComment                                 = '';
	        $scope.removeEvidence                                = removeEvidence;
	        $scope.removeField                                   = removeField;
	        $scope.rowId                                         = 0;
	        $scope.scopeStandardsInfoGrid                        = {};
	        $scope.saveAuthorityAndRegulation                    = saveAuthorityAndRegulation;
	        $scope.saveCountryInfo                               = saveCountryInfo;
	        $scope.saveComplianceProgram                         = saveComplianceProgram;
	        $scope.saveFrequencyAndTechnology                    = saveFrequencyAndTechnology;
	        $scope.saveScopeStandards                            = saveScopeStandards;
	        $scope.saveTestingValidity                           = saveTestingValidity;
	        $scope.selectedFieldList                             = [];
	        $scope.selectedFile                                  = {};
	        $scope.scopeStandardsGridOnSelectedCountryCompliance = scopeStandardsGridOnSelectedCountryCompliance;
	        $scope.scopeStandardsSelectedCountry                 = "";
            $scope.scopeStandardsSelectedCompliance              = "";
	        $scope.selectedCountry                               = {};
	        $scope.selectedComplianceProgram                     = {};
	        $scope.selectedComplianceProgramCountry              = null;
	        $scope.selectedTestingValidityComplianceProgram      = null;
	        $scope.selectedTestingValidityCountry                = null;
	        $scope.showConfirmDialog                             = showConfirmDialog;
	        $scope.showDeleteAuthorityAndRegulation              = showDeleteAuthorityAndRegulation;
	        $scope.showDeleteComplianceProgram                   = showDeleteComplianceProgram;
	        $scope.showDeleteCountryInfo                         = showDeleteCountryInfo;	        
	        $scope.showDeleteFrequencyAndTechnology              = showDeleteFrequencyAndTechnology;
	        $scope.showDeleteTestingValidity                     = showDeleteTestingValidity;
	        $scope.showDeleteScopeStandards                      = showDeleteScopeStandards;
	        $scope.showGrid1                                     = true;
	        $scope.showGrid2                                     = false;
	        $scope.showGrid3                                     = false;
	        $scope.showGrid4                                     = false;
	        $scope.showGrid5                                     = false;
	        $scope.showGrid6                                     = false;
	        $scope.submitText                                    = 'Submit';
	        $scope.switchGrid                                    = switchGrid;	        
	        $scope.testingValidityInfoGrid                       = {};
	        $scope.workflowAction                                = true;
	        
	        init();

	        //function implementations
	        ////////////// 

	        function addEvidence(addAnotherEvidence) {
	            //add validation before saving evidence

	            var evidence = {
	                Filename: $scope.selectedFile.name,
	                SourceId: $scope.evidenceSelectedSource,
	                Remarks: $scope.evidenceRemarks,
	                RemarksInternal: $scope.evidenceRemarksInternal,
	                UpdateDate: $scope.evidenceUpdateDate,
	                EvidenceNote: $scope.evidenceNote,
	                DocumentTypeId: $scope.evidenceSelectedDocumentType
	            }

	            var data = {
	                evidence: evidence,
	                selectedFields: $scope.selectedFieldList.map(function (sf) { return sf.fieldId }),
	                tab: $scope.activeTab
	            }

	            //add evidence to sql database and return generated evidence id
	            if ($scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0) {
	                baseService.IsBusy(true);
	                regulatoryService.addEvidence(data, onAddEvidence_Completed);
	            }
	            else {
	                //saveTabEdits(0);
	            }


	            //////////////

	            function onAddEvidence_Completed(data) {
	                if (data) {
	                    evidenceId = data.Data;

	                    //upload to sharepoint                    

	                    if ($scope.selectedFile.name === undefined || $scope.selectedFile.name === '') {
	                        $scope.showErrors = true;
	                    }
	                    else {
	                        var reader = new FileReader();
	                        reader.onloadend = function () {
	                            if (reader.readyState == 2) {
	                                var arrayString = reader.result;
	                                var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                                var data = {
	                                    //ComplianceProgramId: items.data.ComplianceProgramId,
	                                    File: base64String.match(/.{1,255}/g),
	                                    //FileArray: longInt8View,
	                                    EvidenceNumber: evidenceId//$scope.selectedFile.name,
	                                    //SubFolderName: items.subFolder,
	                                    //ApplicationId: globalUtility.AppId,
	                                    //HasPristine: false
	                                };

	                                regulatoryService.saveEvidence(data, onSaveEvidence_Completed);
	                            }

	                        };

	                        reader.readAsArrayBuffer($scope.selectedFile);
	                    }
	                }

	                //////////////
	                function onSaveEvidence_Completed(response) {
	                    if (!response.IsSuccess) {
	                        dialogService.Dialog.Alert("Saving evidence failed.", enums.MessageType.Error);
	                    }//errors.push("Saving primary file failed.");
	                    else {
	                        //dialogService.Dialog.Alert("Evidence saved/updated!", enums.MessageType.Success);
	                        clearEvidence();
	                        getExistingEvidence($scope.selectedFieldList.map(function (sf) { return sf.fieldId }));

	                        baseService.IsBusy(false);

	                        //if add another evidence dont save tab data
	                        if (!addAnotherEvidence) {
	                            saveTabEdits(evidenceId);
	                        }
	                    }
	                }
	            }
	        }

	        function addModuleEvidence(addAnotherEvidence, rowId, itemId) {
                //add validation before saving evidence
	            baseService.IsBusy(true);

	            $scope.itemId = itemId;

	            var evidence = {
	                Filename: $scope.selectedFile.name,
	                SourceId: $scope.evidenceSelectedSource,
	                Remarks: $scope.evidenceRemarks,
	                RemarksInternal: $scope.evidenceRemarksInternal,
	                UpdateDate: $scope.evidenceUpdateDate,
	                EvidenceNote: $scope.evidenceNote,
	                DocumentTypeId: $scope.evidenceSelectedDocumentType
	            }

	            var filteredList = $filter('filter')($scope.selectedFieldList, function (value, index) { return value.fieldId.split('_')[0] == rowId; });
	            var data = {
	                evidence: evidence,
	                selectedFields: filteredList.map(function (sf) { return itemId + '_' + sf.fieldId.split('_')[1] }),
	                tab: $scope.activeTab
	            }

                //add evidence to sql database and return generated evidence id
	            if ($scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0) {
	                regulatoryService.addEvidence(data, onAddEvidence_Completed);
	            } 
                else {
	                //saveTabEdits(0);
	            }


	            //////////////

	            function onAddEvidence_Completed(data) {
	                if (data) {
	                    evidenceId = data.Data;

                        //upload to sharepoint                    

	                    if ($scope.selectedFile.name === undefined || $scope.selectedFile.name === '') {
	                        $scope.showErrors = true;
	                    }
	                    else {
	                        var reader = new FileReader();
	                        reader.onloadend = function () {
	                            if (reader.readyState == 2) {
	                                var arrayString = reader.result;
	                                var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                                var data = {
	                                    //ComplianceProgramId: items.data.ComplianceProgramId,
	                                    File: base64String.match(/.{1,255}/g),
	                                    //FileArray: longInt8View,
	                                    EvidenceNumber: evidenceId//$scope.selectedFile.name,
	                                    //SubFolderName: items.subFolder,
	                                    //ApplicationId: globalUtility.AppId,
	                                    //HasPristine: false
	                                };

	                                regulatoryService.saveEvidence(data, onSaveEvidence_Completed);
	                            }

	                        };

	                        reader.readAsArrayBuffer($scope.selectedFile);
	                    }
	                }

	                //////////////
	                function onSaveEvidence_Completed(response) {	                    
	                    if (!response.IsSuccess) {
	                        dialogService.Dialog.Alert("Saving evidence failed.", enums.MessageType.Error);
	                    }//errors.push("Saving primary file failed.");
	                    else {
	                        //dialogService.Dialog.Alert("Evidence saved/updated!", enums.MessageType.Success);
	                        clearEvidence();
	                        getExistingEvidence($scope.selectedFieldList.map(function (sf) { return $scope.itemId + '_' + sf.fieldId.split('_')[1] }));
	                        
	                        baseService.IsBusy(false);

                            //if add another evidence dont save tab data
	                        if (!addAnotherEvidence) {
	                            //saveTabEdits(evidenceId);
	                        }
	                    }	                    
	                }
	            }
	        }

	        function addEvidenceFile() {
	            //add validation before saving evidence

	            var evidence = {
	                Filename: $scope.selectedFile.name,
	                SourceId: $scope.evidenceSelectedSource,
	                Remarks: $scope.evidenceRemarks,
	                RemarksInternal: $scope.evidenceRemarksInternal,
	                UpdateDate: $scope.evidenceUpdateDate,
	                EvidenceNote: $scope.evidenceNote,
	                DocumentTypeId: $scope.evidenceSelectedDocumentType
	            }

	            var data = {
	                evidence: evidence,
	                selectedFields: $scope.selectedFieldList.map(function (sf) { return sf.fieldId }),
	                tab: $scope.activeTab
	            }

	            //add evidence to sql database and return generated evidence id
	            if ($scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0)
	            {
	                baseService.IsBusy(true);
	                regulatoryService.addEvidence(data, onAddEvidence_Completed);
	            }

	            function onAddEvidence_Completed(data) {
	                if (data) {
	                    evidenceId = data.Data;

	                    //upload to sharepoint                    

	                    if ($scope.selectedFile.name === undefined || $scope.selectedFile.name === '') {
	                        $scope.showErrors = true;
	                    }
	                    else {
	                        var reader = new FileReader();
	                        reader.onloadend = function () {
	                            if (reader.readyState == 2) {
	                                var arrayString = reader.result;
	                                var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                                var data = {
	                                    //ComplianceProgramId: items.data.ComplianceProgramId,
	                                    File: base64String.match(/.{1,255}/g),
	                                    //FileArray: longInt8View,
	                                    EvidenceNumber: evidenceId//$scope.selectedFile.name,
	                                    //SubFolderName: items.subFolder,
	                                    //ApplicationId: globalUtility.AppId,
	                                    //HasPristine: false
	                                };

	                                regulatoryService.saveEvidence(data, onSaveEvidence_Completed);
	                            }

	                        };

	                        reader.readAsArrayBuffer($scope.selectedFile);
	                    }
	                }

	                //////////////
	                function onSaveEvidence_Completed(response) {
	                    if (!response.IsSuccess) {
	                        dialogService.Dialog.Alert("Saving evidence failed.", enums.MessageType.Error);
	                    }//errors.push("Saving primary file failed.");
	                    else {
	                        //dialogService.Dialog.Alert("Evidence saved/updated!", enums.MessageType.Success);
	                        clearEvidence();
	                        getExistingEvidence($scope.selectedFieldList.map(function (sf) { return sf.fieldId }));

	                        baseService.IsBusy(false);

	                        //if add another evidence dont save tab data
	                        //if (!addAnotherEvidence) {
	                        //    saveTabEdits(evidenceId);
	                        //}
	                    }
	                }
	            }
	        }

	        function authorityRegulationsGridOnSelectedCountry(country) {
	            $scope.authorityRegulationSelectedCountry = country.CountryItemId;
	            //setupAuthorityRegulationGrid();
	            getAuthorityandRegulationData();
	        }

	        function frequencyTechnologyGridOnSelectedCountry(country) {
	            $scope.frequencyTechnologySelectedCountry = country.CountryItemId;
	            //setupFrequencyTechnologyGrid();
	            getFrequencyandTechnologyData();
	        }

	        function scopeStandardsGridOnSelectedCountryCompliance(country, compliance) {
	            $scope.scopeStandardsSelectedCountry = country.CountryItemId;
	            $scope.scopeStandardsSelectedCompliance = compliance.CertificateProgramId;
	            //setupScopeStandardsGrid();
	            getScopeStandardsData();
	        }

	        function addAuthorityRegulation() {
	            $scope.authorityregulationInfoGrid.data.push({
	                RegulatoryAuthority: '',
	                RegulationName: '',
	                ComplianceProgram: '',
	                Sector: '',
	                state: 'Changed'
	            });

	            setToLastRow($scope.authorityregulationInfoGrid, $scope.authorityregulationInfoGridApi);
	        }

	        function addCountryInfo() {
	            $scope.countryInfoGrid.data.push({
                    RegulatoryCountryInformationId: '',
                    Region: '',
                    Country: '',
                    RegionalEconomicUnion: '',
                    Voltage: '',
                    Frequency: '',
                    PlugType: '',
                    IECEEMembership: '',
                    BandInformation: '',
                    Carrier: '',
                    SARLimits: '',
                    SARParts: '',
                    state: 'Changed'
	            });

	            setToLastRow($scope.countryInfoGrid, $scope.countryInfoGridApi);
	        }

	        function addComplianceProgram() {
	            $scope.complianceProgramInfoGrid.data.push({
	                ComplianceProgramId: '',
	                Name: '',
	                Mark: '',
	                CertificateOrganisationId: '',
	                ComplianceModelId: '',
	                ScopedProductListLink: '',
	                ExceptionsTypeId: '',
	                ExceptionsLink: '',
	                SupplementInformationOfExceptions: '',
	                CertificateLimitationTypeId: '',
	                ModularApprovalTypeId: '',
	                LocalRepresentativeTypeId: '',
	                LocalServiceTypeId: '',
	                MarkRequirementTypeId: '',
	                ManualRequirementTypeId: '',
	                DetailsOfMarkingName: '',
	                ElectronicLabelTypeId: '',
	                CertificateMaintenanceTypeId: '',
	                InitialFactoryInspectionTypeId: '',
	                WebPublicationOfProductTypeId: '',
	                WebAddress: '',
	                PublishedContentTypeId: '',
	                PublicationTimingTypeId: '',
	                ShortTermConfidentialityTypeId: '',
	                state: 'Changed'
	            });

	            setToLastRow($scope.complianceProgramInfoGrid, $scope.complianceProgramInfoGridApi);
            }

	        function addEditFile(data, mode) {
	            var items = {
	                data: data,
	                title: '',
	                subFolder: '',                    
	            };

	            switch (mode) {
                    //add mark
	                case 1:
	                    items.title = 'Attach Mark';
	                    items.subFolder = markFolder;
	                    break;
	                //edit mark
	                case 2:
	                    items.title = 'Edit Mark';
	                    items.subFolder = markFolder;
                        break;
	                //add details of marking or manual
	                case 3:
                        items.title = 'Attach Details of Marking or Manual';
                        items.subFolder = manualFolder;
	                    break;
	                //edit details of marking or manual
	                case 4:
                        items.title = 'Edit Details of Marking or Manual';
                        items.subFolder = manualFolder;
	                    break;
	                default:
                        //do nothing
	                    return;
	            }

	            var modalInstance = dialogService.Dialog.WithTemplateAndControllerInstanceAndClass("addEditFile.html", "regulatoryAddEditFileController", "md", items);
	            modalInstance.result.then(function (response) {
	                var index = $scope.complianceProgramInfoGrid.data.indexOf(response.data);

	                switch (mode) {
	                    case 1:
                        case 2:	                        
                            $scope.complianceProgramInfoGrid.data[index].Mark = response.fileName;
	                        break;
	                    case 3:
                        case 4:	                        
                            $scope.complianceProgramInfoGrid.data[index].DetailsOfMarkingName = response.fileName;
	                        break;
	                }
	                
	                $scope.complianceProgramInfoGrid.data[index].state = 'Changed';
	            }, function (error) {
                    
	            });
	        }

	        function addFrequencyTechnology() {
	            $scope.frequencytechnologyInfoGrid.data.push({
	                FrequencyTechnlogyId: '',
	                FrequencyRangeLower: '',
	                FrequencyRangeUpper: '',
	                FrequencyTechnologyUnitTypeId: '',
	                OperatingFrequencyChannel: '',
	                OutputPower: '',
	                PowerDensity: '',
	                ChannelSpacing: '',
	                Bandwidth: '',
	                DutyCycle: '',
	                DFSApplicableTypeId: '',
	                TPCApplicableTypeId: '',
	                IndoorUseOnlyApplicableTypeId: '',
	                state: 'Changed'
	            });
	            setToLastRow($scope.frequencytechnologyInfoGrid, $scope.frequencytechnologyInfoGridApi);
	        }

	        function addScopeStandards() {
	            $scope.scopeStandardsInfoGrid.data.push({
	                ProductTypeId: '',
	                ProductSubTypeId: '',
	                PowerSourceTypeId: '',
	                FrequencyTechnologyId: '',
	                CoveredSectorId: '',
	                RegulatoryStandardWirelessScopeTypeId: '',
	                AcceptedTestTypeId: '',
	                TestingOrganisation: '',
	                RegulatoryStandardTechnicalStandardId: '',
	                state: 'Changed'
	            });
	            setToLastRow($scope.scopeStandardsInfoGrid, $scope.scopeStandardsInfoGridApi);
	        }

	        function addTestingValidity() {
	            $scope.testingValidityInfoGrid.data.push({
	                CoveredSectorId: '',
	                RegulatoryApplicationTypeId: '',
	                CertificateValidityPeriod: '',
	                LeadTime: '',
	                state: 'Changed'
	            });

	            setToLastRow($scope.testingValidityInfoGrid, $scope.testingValidityInfoGridApi);
	        }

	        function checkIfGridHasNoData() {
	            var result = false;

	            switch ($scope.activeTab) {
	                case 'CountryInfo':
	                    result = $scope.countryInfoGrid.data.length === 0;
	                    break;
	                case 'AuthorityRegulation':
	                    result = $scope.authorityregulationInfoGrid.data.length === 0;
	                    break;
	                case 'FrequencyTechnology':
	                    result = $scope.frequencytechnologyInfoGrid.data.length === 0;
	                    break;
	                case 'ComplianceProgram':
	                    result = $scope.complianceProgramInfoGrid.data.length === 0;
	                    break;
	                case 'ScopeStandards':
	                    result = $scope.scopeStandardsInfoGrid.data.length === 0;
	                    break;
	                case 'TestingValidity':
	                    result = $scope.testingValidityInfoGrid.data.length === 0;
	                    break;
	            }

	            $scope.gridHasNoData = result;
	        }

	        function clearEvidence() {            

	            $scope.evidenceSelectedSource = '';
	            $scope.evidenceRemarks = '';
	            $scope.evidenceRemarksInternal = '';
	            $scope.evidenceUpdateDate = '';
	            $scope.evidenceNote = '';
	            $scope.selectedFile = {};
	            $scope.evidenceSelectedDocumentType = '';
	        }

	        function closeDialog() {
	            $uibModalInstance.close(updateFlag);
	            baseService.ShowOverlay(false);
	            //dialogService.CloseAll(updateFlag);
	        }

	        function deleteFile(row, mode) {
	            var data = {
	                ComplianceProgramId: row.ComplianceProgramId,
                    SubFolderName: ''
	            };

	            switch (mode) {
                    //mark
	                case 1:
	                    data.SubFolderName = markFolder;
	                    break;
                    //manual
	                case 2:
	                    data.SubFolderName = manualFolder;
	                    break;
                }

	            regulatoryService.deleteFile(data, onDeleteFile_Completed);

	            ////////////// 
	            function onDeleteFile_Completed(response) {
	                if (response) {
	                    if (response.Message === 'Successful') {
	                        dialogService.Dialog.Alert('Successfully deleted file.', enums.MessageType.Success);

	                        var index = $scope.complianceProgramInfoGrid.data.indexOf(row);

	                        switch (mode) {
	                            case 1:
	                                $scope.complianceProgramInfoGrid.data[index].Mark = 'False';
	                                break;
	                            case 2:
	                                $scope.complianceProgramInfoGrid.data[index].DetailsOfMarkingName = 'False';	                                
	                                break;	                            
	                        }

	                        $scope.complianceProgramInfoGrid.data[index].state = 'Changed';
	                    }
	                    else {
	                        dialogService.Dialog.Alert('Failed to delete file.', enums.MessageType.Error);
	                    }
	                }
                }
	        }

	        function enableAddEvidence(mode) {

	            if ($scope.enableEvidence && mode === 'show') {
	                return; // cannot be in add evidence mode and show evidence at the same time
	            }

	            //enable add evidence form
	            $scope.enableEvidence = mode === 'add';

	            activateEvidence();	            

	            //load evidence lookups
	            regulatoryService.getEvidenceLookups(onGetEvidenceLookups_Completed);

	            /////////////
	            function activateEvidence() {
	                $scope.selectedFieldList = [];

	                switch ($scope.activeTab) {
	                    case 'CountryInfo':                       
	                        addRowNumbers($scope.countryInfoGrid);

	                        addCellNavListener($scope.countryInfoGridApi);
	                        break;
	                    case 'AuthorityRegulation':
	                        addRowNumbers($scope.authorityregulationInfoGrid);

	                        addCellNavListener($scope.authorityregulationInfoGridApi);
	                        break;
	                    case 'FrequencyTechnology':
	                        addRowNumbers($scope.frequencytechnologyInfoGrid);

	                        addCellNavListener($scope.frequencytechnologyInfoGridApi);
	                        break;
	                    case 'ComplianceProgram':
	                        addRowNumbers($scope.complianceProgramInfoGrid);

	                        addCellNavListener($scope.complianceProgramInfoGridApi);
	                        break;
	                    case 'ScopeStandards':                       
	                        addRowNumbers($scope.scopeStandardsInfoGrid);

	                        addCellNavListener($scope.scopeStandardsInfoGridApi);
	                        break;
	                    case 'TestingValidity':                       
	                        addRowNumbers($scope.testingValidityInfoGrid);

	                        addCellNavListener($scope.testingValidityInfoGridApi);	                        
	                        break;
	                }
	            }

	            function addCellNavListener(gridApi) {
	                if (gridApi) {
	                    gridApi.cellNav.on.navigate($scope, function (newRowcol, oldRowCol) {
	                        //condition to get column name if multiselect
	                        var fieldName = undefined === newRowcol.col.colDef.field ? newRowcol.col.colDef.name : newRowcol.col.colDef.field;
	                        //field id = unique row id + column name
	                        var fieldId = getRowId(newRowcol.row.entity) + '_' + fieldName;

	                        //display text = row id + column name + cell value
	                        var displayText = newRowcol.row.entity.rowId + '_' + newRowcol.col.colDef.name + '_';

	                        //check if selected cell is text, array or uses filters
	                        //check if using filters
	                        if (newRowcol.col.colDef.editDropdownOptionsArray.length !== 0) {
	                            switch (typeof (newRowcol.row.entity[newRowcol.col.field])) {
	                                case 'string':
	                                case 'number':
	                                    displayText = displayText + $filter('griddropdown')(newRowcol.row.entity[newRowcol.col.field], newRowcol).trim();
	                                    break;
	                                case 'object':
	                                    displayText = displayText + newRowcol.row.entity[newRowcol.col.field].join(',');
	                                    break;
	                                default:
	                                    displayText = displayText + (newRowcol.row.entity[newRowcol.col.field] === undefined ? '' : newRowcol.row.entity[newRowcol.col.field]);
	                                    break;
	                            }
	                        }
	                        else {
	                            displayText = displayText + newRowcol.row.entity[newRowcol.col.field];
	                        }

	                        var selectedField = {
	                            fieldId: fieldId,
	                            displayText: displayText
	                        }

	                        //check if field exists
	                        if ($scope.selectedFieldList.map(function (f) { return f.fieldId }).indexOf(fieldId) === -1) {

	                            if (!$scope.enableEvidence) {
	                                $scope.selectedFieldList = []; // when view is single field only
	                            }

	                            $scope.selectedFieldList.push(selectedField);

	                            getExistingEvidence($scope.selectedFieldList.map(function (sf) { return sf.fieldId }));
	                        }
	                    });
	                }
	            }

	            function addRowNumbers(grid) {
	                if (grid) {
	                    //add row id to grid
	                    grid.columnDefs.unshift({
	                        field: 'rowId',
	                        name: 'Row #',
	                        width: '50',
	                        visible: true,
	                        enableColumnMenu: false,
	                        enableCellEdit: false
	                    });

	                    //create row numbers
	                    var ctr = 1;
	                    grid.data.forEach(function (element, index, array) {
	                        element.rowId = ctr;
	                        ctr++;
	                    });
	                }	                
	            }

	            function getRowId(rowEntity) {
	                var rowId = '';

	                switch ($scope.activeTab) {
	                    case 'CountryInfo':	                        
	                        rowId = rowEntity.RegulatoryCountryInformationId ? rowEntity.RegulatoryCountryInformationId : rowEntity.rowId;
	                        break;
	                    case 'AuthorityRegulation':
	                        rowId = rowEntity.RegulationId ? rowEntity.RegulationId : rowEntity.rowId;
	                        break;
	                    case 'FrequencyTechnology':
	                        rowId = rowEntity.RegulatoryFrequencyTechnologyId ? rowEntity.RegulatoryFrequencyTechnologyId : rowEntity.rowId;
	                        break;
	                    case 'ComplianceProgram':
	                        rowId = rowEntity.ComplianceProgramId ? rowEntity.ComplianceProgramId : rowEntity.rowId;
	                        break;
	                    case 'ScopeStandards':
	                        rowId = rowEntity.RegulatoryStandardId ? rowEntity.RegulatoryStandardId : rowEntity.rowId;
	                        break;
	                    case 'TestingValidity':
	                        rowId = rowEntity.RegulatoryTestingAndValidityId ? rowEntity.RegulatoryTestingAndValidityId : rowEntity.rowId;
	                        break;
	                }

	                return rowId;
	            }

	            function onGetEvidenceLookups_Completed(data) {
	                if (data) {
	                    $scope.evidenceSource = data.Data.EvidenceSourceList;
	                    $scope.evidenceDocumentType = data.Data.DocumentTypeList;	                    
	                }
	            }
	        }

	        function init() {
	            //check if from workflow tab
	            if (typeof (items) !== 'undefined' && items !== null) {
	                if (typeof (items.isWorkflow) !== 'undefined' && items.isWorkflow === true) {
	                    $scope.isWorkflow = true;

                        //set manage data editable if user is approver
	                    //if (!globalUtility.ContentAdmin && !globalUtility.Coordinator) {
	                    //    config.isEditable(false);
	                    //}
	                }

					if (items.salesReader) {
						 $scope.isWorkflow = true;
					}

					if ($scope.isWorkflow) {
					    $scope.modalTitle = "WORKFLOW REVIEW";
					}
					else {
					    $scope.modalTitle = "MANAGE DATA";
					}

	            }
                

	            setupAuthorityRegulationGrid();	           
	            setupCountryInfoGrid();
	            setupComplianceProgramGrid();
	            setupFrequencyTechnologyGrid();
	            setupScopeStandardsGrid();
	            setupTestingValidityGrid();	            

	            //clear data
	            $scope.countryInfoGrid.data = [];
	            $scope.authorityregulationInfoGrid.data = [];
	            $scope.frequencytechnologyInfoGrid.data = [];
	            $scope.complianceProgramInfoGrid.data = [];
	            $scope.scopeStandardsInfoGrid.data = [];
	            $scope.testingValidityInfoGrid.data = [];

                //if is workflow                        
	            if ($scope.isWorkflow === true) {
	                //navigate to tab if from workflow and after grids are finished setting up	    
	                if (typeof (items) !== 'undefined' && items !== null) {
	                    if (typeof (items.tab) !== 'undefined') {
	                        $scope.activeTab = items.tab;

	                        //disable delete column
	                        displayDelete(false);

	                        switchGrid(items.tab);
	                    }
	                }	               

	                //check if is approver
                    //for refactor
	                if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                    $scope.isApprover = true;
	            }
	            }
	            else {
	                displayDelete(true);
	            }

	            if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                $scope.submitText = 'Publish';
	            }

	            ////////////
	            function displayDelete(toggle) {
                    //set delete state for all tabs
	                //switch ($scope.activeTab) {
	                //    case 'CountryInfo':
	                        setDeleteState($scope.countryInfoGrid, toggle);
	                //        break;
	                //    case 'AuthorityRegulation':
	                        setDeleteState($scope.authorityregulationInfoGrid, toggle);
	                //        break;
	                //    case 'FrequencyTechnology':
	                        setDeleteState($scope.frequencytechnologyInfoGrid, toggle);
	                //        break;
	                //    case 'ComplianceProgram':
	                        setDeleteState($scope.complianceProgramInfoGrid, toggle);
	                //        break;
	                //    case 'ScopeStandards':
	                        setDeleteState($scope.scopeStandardsInfoGrid, toggle);
	                //        break;
	                //    case 'TestingValidity':
	                        setDeleteState($scope.testingValidityInfoGrid, toggle);
	                //        break;
	                //}

                    ////////////

	                function setDeleteState(grid, toggle) {
	                    var deleteIndex = grid.columnDefs.map(function (c) { return c.name }).indexOf('Delete');
	                    if (deleteIndex !== -1) {
	                        grid.columnDefs[deleteIndex].visible = toggle;
	                    }
	        }
	            }
	        }

	        function isUndefinedOrEmpty(data) {
	            return data === undefined || data === '' ? true : false;
            }

	        function getAuthorityandRegulationData() {
	            baseService.IsBusy(true);

	            var params = {
	                id: $scope.isWorkflow ? items.itemId : $scope.authorityRegulationSelectedCountry,
                    isWorkflow: $scope.isWorkflow
	            }
                //call service
	            regulatoryService.getAuthorityRegulationData(params, onGetAuthorityRegulationData_Completed);

                ////////////

	            function onGetAuthorityRegulationData_Completed(response) {
	                if (response) {
	                    if (response.Success === true) {
	                        $scope.authorityregulationInfoGrid.data = response.Data;
	                        checkIfGridHasNoData();
                        }
	                }
	                baseService.IsBusy(false);
	            }
	        }

	        function getCountryInfoData() {
	            baseService.IsBusy(true);

	            var params = {};

	            if ($scope.isWorkflow) {
	                params = {
	                    countryInformationId: items.itemId
	                }
	            }

	            regulatoryService.getCountryInfoData(params, onGetCountryInfoData_Completed);

	            ////////////// 

	            function onGetCountryInfoData_Completed(response) {	                
	                if (response) {
	                    if (response.Success === true) {
	                        $scope.countryInfoGrid.data = response.Data;

	                        if ($scope.activeTab === 'CountryInfo') {
	                            checkIfGridHasNoData();
	                        }
	                    }
	                }
	                baseService.IsBusy(false);
	            }
	        }

	        function getComplianceProgramData() {
	            baseService.IsBusy(true);
	            
	            //if ($scope.selectedComplianceProgramCountry === null) {
	            //    return;
	            //}

	            var params = {};

	            if ($scope.isWorkflow) {
	                params.itemId = items.itemId;
	            }
	            else {
	                params.geoCountryItemId = $scope.selectedComplianceProgramCountry.CountryItemId;
	            }

	            regulatoryService.getComplianceProgram(params, onGetComplianceProgram_Completed);

	            ////////////// 

	            function onGetComplianceProgram_Completed(response) {
	                if (response) {
	                    if (response.Success === true) {                        	                       

	                        $scope.complianceProgramInfoGrid.data = response.Data;
	                        checkIfGridHasNoData();
                            }
	                }

	                baseService.IsBusy(false);
	            }

	            //$scope.complianceProgramInfoGrid.data = [
                //            {
                //                UniqueID: 'Indonesia SDPPI Type 1',
                //                Mark: 'File1.Doc',
                //                CertificationOrganization: 'SDPPI',
                //                ComplianceModel: 'Certification',
                //                ScopedProductList: 'n/a for safety',
                //                Exceptions: 'N',
                //                ExceptionsList: 'N',
                //                SupplementInformationExceptions: 'Lorem Ipsum dolor sit',
                //                CertificationLimitation: 'One Model, One Brand',
                //                ModularApproval: 'Y',
                //                LocalRepresentative: 'Y',
                //                LocalRepService: 'n/a',
                //                MarkingRequirement: 'Y',
                //                ManualRequirement: 'Y',
                //                DetailsMarkingManual: 'File1.doc',
                //                ElectronicLabelAccepted: 'N',
                //                CertificateMaintenance: 'N',
                //                WebPublication: 'Y',
                //                WebAddress: 'http://www.ul.com?info',
                //                PublishedContents: 'Certificate',
                //                PublicationTiming: 'After Approval',
                //                ShortTermConfidentialPolicy: 'N'
                //            },
                //            {
                //                UniqueID: 'Indonesia SDPPI Type 1',
                //                Mark: 'File2.Doc',
                //                CertificationOrganization: 'SDPPI',
                //                ComplianceModel: 'Certification',
                //                ScopedProductList: 'n/a for safety',
                //                Exceptions: 'N',
                //                ExceptionsList: 'N',
                //                SupplementInformationExceptions: 'Lorem Ipsum dolor sit',
                //                CertificationLimitation: 'One Model, One Brand',
                //                ModularApproval: 'Y',
                //                LocalRepresentative: 'Y',
                //                LocalRepService: 'n/a',
                //                MarkingRequirement: 'Y',
                //                ManualRequirement: 'Y',
                //                DetailsMarkingManual: 'File2.doc',
                //                ElectronicLabelAccepted: 'N',
                //                CertificateMaintenance: 'N',
                //                WebPublication: 'Y',
                //                WebAddress: 'http://www.ul.com?info',
                //                PublishedContents: 'Certificate',
                //                PublicationTiming: 'After Approval',
                //                ShortTermConfidentialPolicy: 'N'
                //            }
	            //]
	        }

	        function getExistingEvidence(selectedFieldList) {
	            regulatoryService.getExistingEvidence(selectedFieldList, onGetExistingEvidence_Completed);

	            /////////////

	            function onGetExistingEvidence_Completed(data) {
	                //$scope.existingEvidenceList.push.apply($scope.existingEvidenceList, data);
	                //clear array for fresh list every change
	                if (data) {
	                    if ($scope.enableEvidence) {
	                        $scope.existingEvidenceList = data.Data; //add
	                    }// else {
	                    //    //view (display popup)
	                    //    if (data.Data && data.Data.length === 0) {
	                    //        return;
	                    //    }
	                    //    var latest = data.Data[data.Data.length - 1];
	                    //    var $outer = $scope;
	                    //    dialogService.Dialog.WithTemplateAndController('shellEvidenceDialog.html',
	                    //        function($scope, $uibModalInstance) {
	                    //            $scope.title = 'HISTORY';
	                    //            $scope.ok = function() {
	                    //                $uibModalInstance.close();
	                    //                baseService.ShowOverlay(false);
	                    //            }

	                    //            var source = $outer.evidenceSource.filter(function (elem) {
	                    //                return elem.SourceId === latest.SourceId;
	                    //            });

	                    //            var docType = $outer.evidenceDocumentType.filter(function (elem) {
	                    //                return elem.DocumentTypeId === latest.DocumentTypeId;
	                    //            });
	                             
	                    //            $scope.evidences = data.Data;
	                    //            $scope.source = source[0].SourceName;
	                    //            $scope.remarks = latest.Remarks;
	                    //            $scope.remarksInternal = latest.RemarksInternal;
	                    //            $scope.updateDate = latest.UpdateDate.substr(0, 10);
	                    //            $scope.evidenceNote = latest.EvidenceNote;
	                    //            $scope.documentType = docType[0].DocumentName;
	                    //            $scope.openEvidence = $outer.openEvidence;

	                    //        },'sm', null);
	                    //}
	                   
	                }
	            }
	        }

	        function getFrequencyandTechnologyData() {
	            baseService.IsBusy(true);

	            var params = {};

	            if ($scope.isWorkflow) {	                
	                params.ItemId = items.itemId;
	            }
	            else {
	                params.GeoCountryItemId = $scope.frequencyTechnologySelectedCountry;
	            }

                //call service to populate data
	            regulatoryService.getFrequencyTechnologyInfoData(params, onGetFrequencyTechnologyInfoData_Completed);

	            function onGetFrequencyTechnologyInfoData_Completed(response) {
	                if (response) {
	                    if (response.Success === true) {
	                        $scope.frequencytechnologyInfoGrid.data = response.Data;
	                        checkIfGridHasNoData();
                            }
	                }

	                baseService.IsBusy(false);
	            }
	            
	        }

	        function getScopeStandardsData() {
	            baseService.IsBusy(true);

	            var params = {};

	            if ($scope.isWorkflow) {
	                params.itemId = items.itemId;
	            }
	            else {
	                params.ComplianceProgramId = $scope.scopeStandardsSelectedCompliance;
	            }

	            //var params = {	                
	            //    ComplianceProgramId: $scope.scopeStandardsSelectedCompliance
	            //}
	            //call service
	            regulatoryService.getScopeStandards(params, onGetScopeStandardsData_Completed);

	            function onGetScopeStandardsData_Completed(response) {
	                if (response) {
	                    if (response.Success === true) {
	                        $scope.scopeStandardsInfoGrid.data = response.Data;
	                        checkIfGridHasNoData();
	                    }
	                }

	                baseService.IsBusy(false);
	            }
	        }

	        function getTestingValidityData() {
	            baseService.IsBusy(true);

	            var params = {};

	            if ($scope.isWorkflow) {
	                params.itemId = items.itemId;
	            }
	            else {
	                params.complianceProgramId = $scope.selectedTestingValidityComplianceProgram.CertificateProgramId
	            }

	            regulatoryService.getTestingValidityData(params, onGetTestingValidity_Completed);

                ///////////////

	            function onGetTestingValidity_Completed(response) {
	                if (response) {
	                    if (response.Success === true) {
	                        $scope.testingValidityInfoGrid.data = response.Data;
	                        checkIfGridHasNoData();
	                    }
	                }

	                baseService.IsBusy(false);
	            }

	        }

	        function onComplianceProgramCountrySelect() {	            
	            getComplianceProgramData();
	        }

	        function onScopeStandardsCountrySelect() {
	            baseService.IsBusy(true);

	            var params = {
	                geoCountryItemId: $scope.selectedScopeStandardsCountry.CountryItemId
	            }

	            regulatoryService.getComplianceProgramUniqueIds(params, onGetComplianceProgramUniqueIds_Completed);

	            //////////////
	            function onGetComplianceProgramUniqueIds_Completed(response) {
	                if (response) {
	                    if (response.Success === true) {
	                        $scope.complianceProgramUniqueIds = response.Data;
	                    }
	                }

	                baseService.IsBusy(false);
	            }
	        }

	        function onTestingValidityCountrySelect() {
	            baseService.IsBusy(true);

	            var params = {
	                geoCountryItemId: $scope.selectedTestingValidityCountry.CountryItemId
	            }

	            regulatoryService.getComplianceProgramUniqueIds(params, onGetComplianceProgramUniqueIds_Completed);

	            //////////////
	            function onGetComplianceProgramUniqueIds_Completed(response) {
	                if (response) {
	                    if (response.Success === true) {
	                        $scope.complianceProgramUniqueIds = response.Data;
	                    }
	                }

	                baseService.IsBusy(false);
	            }
	        }

	        function onTestingValidityComplianceProgramSelect() {
	            getTestingValidityData();
	        }

	        function openEvidence(evidence) {
	            //alert('open evidence');
	            regulatoryService.openEvidence(evidence.EvidenceId, onOpenEvidence_Completed);

	            //////////////
	            function onOpenEvidence_Completed(response) {
	                if (response.Message == enums.ResponseType.Success) {
	                    var blob = new Blob([response.Data], { type: "application/octet-stream" });
	                    saveAs(blob, evidence.Filename);
	                }
	                baseService.IsBusy(false);
	            }
	        }

	        function openFile(data, mode) {
                var param = {
                    complianceProgramId: data.ComplianceProgramId
	            };

                regulatoryService.getSourceDocuments(param, onGetSourceDocuments_Completed);

                ////////////// 

                function onGetSourceDocuments_Completed(response) {
                    downloadParams = {
                        ComplianceProgramId: data.ComplianceProgramId,
                        FileName: '',
                        SubFolder: ''
                    }

                    if (response) {
                        if (response.Message === 'Success') {
                            switch (mode) {
                                //mark 
                                case 1:
                                    var markFiles = response.RegulatoryComplianceProgramDocumentPath.MarkFiles;
                                    if (markFiles.length !== 0) {
                                        downloadParams.FileName = markFiles[0];
                                        downloadParams.SubFolder = markFolder;

                                        regulatoryService.downloadDocument(downloadParams, ondownload_Completed);
                                        }
                                    else {
                                        dialogService.Dialog.Alert("No Document Found!", enums.MessageType.Error);
                                    }
                                    break;
                                //details of marking or manual
                                case 2:
                                    var manualFiles = response.RegulatoryComplianceProgramDocumentPath.ManualFiles;
                                    if (manualFiles.length !== 0) {
                                        downloadParams.FileName = manualFiles[0];
                                        downloadParams.SubFolder = manualFolder;

                                        regulatoryService.downloadDocument(downloadParams, ondownload_Completed);
                                    }
                                    else {
                                        dialogService.Dialog.Alert("No Document Found!", enums.MessageType.Error);
                                    }
                                    break;
                            }
                            
                        }
                    }

                    //////////////

                    function ondownload_Completed(response) {
                        if (response.Message == enums.ResponseType.Success) {
                            var blob = new Blob([response.Data], { type: "application/octet-stream" });
                            saveAs(blob, downloadParams.FileName);
                        }
                        baseService.IsBusy(false);
                    }
                }

	           
	            
	        }

	        function removeEvidence(evidence) {
	            //alert('remove evidence');

	            var data = {
	                evidenceId: evidence.EvidenceId,
	                selectedFields: $scope.selectedFieldList.map(function (sf) { return sf.fieldId })
	            }

	            regulatoryService.deleteEvidence(data, onDeleteEvidence_Completed);

	            //////////////
	            function onDeleteEvidence_Completed(data) {
	                getExistingEvidence($scope.selectedFieldList.map(function (sf) { return sf.fieldId }));
                    //output message
	            }
	        }

	        function removeField(element) {
	            var selectedIndex = $scope.selectedFieldList.map(function (f) { return f.fieldId }).indexOf(element);

	            if (selectedIndex !== -1) {
	                $scope.selectedFieldList.splice(selectedIndex, 1);

	                //refresh evidence list
	                getExistingEvidence($scope.selectedFieldList.map(function (sf) { return sf.fieldId }));
	            }
	        }

	        function saveAuthorityAndRegulation() {
	            var data = $scope.authorityregulationInfoGrid.data;
	            var modifiedList = [];

	            //get all modified rows
	            for (var i = 0; i < data.length; i++) {
	                if (data[i].state === "Changed" || $scope.isWorkflow) {
                        //data validation
	                    if (isUndefinedOrEmpty(data[i].CertificateSchemeId) || isUndefinedOrEmpty(data[i].CoveredSectorId) || isUndefinedOrEmpty(data[i].RegulatoryAuthorityId)) {
	                        baseService.IsBusy(false);

	                        return;
                        }

						var currentUser = '';
						var isAdminRole = null;
 
						if (globalUtility.Coordinator || globalUtility.ContentAdmin) {
							currentUser =  globalUtility.CurrentUser;
						    isAdminRole = 1;
						}
						else if (globalUtility.Contributor) {
							currentUser =  globalUtility.CurrentUser;
						    isAdminRole = 0;
						}

						modifiedList = [];

						$scope.rowId = data[i].RegulationId ? data[i].RegulationId : data[i].rowId;

	                    modifiedList.push({
	                        RegulationId: data[i].RegulationId !== undefined ? data[i].RegulationId : null,
	                        RegulatoryAuthorityId: data[i].RegulatoryAuthorityId,
	                        RegulationName: data[i].RegulationName,
	                        CertificateSchemeId: data[i].CertificateSchemeId,
	                        CoveredSectorId: data[i].CoveredSectorId,
	                        ComplianceProgramId: data[i].ComplianceProgramId !== undefined ? data[i].ComplianceProgramId : null,
	                        GeoCountryItemId: typeof ($scope.selectedAuthorityRegulationCountry) !== 'undefined' ? $scope.selectedAuthorityRegulationCountry.CountryItemId : data[i].GeoCountryItemId,
	                        Approve: $scope.isWorkflow ? $scope.workflowAction : '',
	                        Comments: $scope.isWorkflow ? $scope.rejectComment : '',
							
							CreatedBy: currentUser,
							isAdminRole: isAdminRole,
							RowItemId: $scope.rowId
	                    });

	                    baseService.IsBusy(true);
	                    regulatoryService.saveAuthorityAndRegulation(modifiedList, onSaveAuthorityRegulation_Completed);
	                }
	            }

	            if (modifiedList.length == 0 && $scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0) {
	                addEvidenceFile();
	            }
	            else {
	                return;
	            }

	            //////////////

	            function onSaveAuthorityRegulation_Completed(response) {
	                if (response) {
	                    if (response.Success) {
                            
	                        addModuleEvidence(false, response.Data.RowItemId, response.Data.ItemId);

	                        updateFlag = true;

	                        if ($scope.isWorkflow) {
	                            //if reject send email
	                            
	                            sendEmail($scope.workflowAction);
	                            
	                            closeDialog();
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getAuthorityandRegulationData();
	                            regulatoryService.getComplianceLookups({}, getComplianceProgramLookups_Completed);
                            }
	                    }
	                    else {
	                        dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                    }
	                }

	                function getComplianceProgramLookups_Completed(response) {
	                    if (response) {
	                        if (response.Success === true) {
	                            $scope.complianceProgramInfoGrid.columnDefs[1].editDropdownOptionsArray = response.Data.RegulationList;
	                        }
	                    }
	                }
	                baseService.IsBusy(false);
	            }
	        }

	        function saveComplianceProgram() {
	            var data = $scope.complianceProgramInfoGrid.data;
	            var modifiedList = [];

	            //get all modified rows
	            for(var i = 0; i < data.length; i++) {
	                if (data[i].state === "Changed" || $scope.isWorkflow) {
	                    if (isUndefinedOrEmpty(data[i].Name) || isUndefinedOrEmpty(data[i].CertificateOrganisationId) || isUndefinedOrEmpty(data[i].ComplianceModelId)
                            || isUndefinedOrEmpty(data[i].ScopedProductListLink) || isUndefinedOrEmpty(data[i].ExceptionsTypeId) || isUndefinedOrEmpty(data[i].ExceptionsLink)
                            || isUndefinedOrEmpty(data[i].SupplementInformationOfExceptions) || isUndefinedOrEmpty(data[i].CertificateLimitationType)
                            || isUndefinedOrEmpty(data[i].ModularApprovalTypeId) || isUndefinedOrEmpty(data[i].LocalRepresentativeTypeId)
                            || isUndefinedOrEmpty(data[i].LocalServiceTypeId) || isUndefinedOrEmpty(data[i].MarkRequirementTypeId)
                            || isUndefinedOrEmpty(data[i].ManualRequirementTypeId) || isUndefinedOrEmpty(data[i].ElectronicLabelTypeId)
                            || isUndefinedOrEmpty(data[i].CertificateMaintenanceType) || isUndefinedOrEmpty(data[i].InitialFactoryInspectionTypeId) || isUndefinedOrEmpty(data[i].WebPublicationOfProductTypeId)
                            || isUndefinedOrEmpty(data[i].WebAddress) || isUndefinedOrEmpty(data[i].PublishedContentType)
                            || isUndefinedOrEmpty(data[i].PublicationTimingTypeId) || isUndefinedOrEmpty(data[i].ShortTermConfidentialityTypeId)
						) {
	                        baseService.IsBusy(false);
	                        return;
	                    }

	                    var currentUser = '';
	                    var isAdminRole = null;

	                    if (globalUtility.Coordinator || globalUtility.ContentAdmin) {
	                        currentUser = globalUtility.CurrentUser;
	                        isAdminRole = 1;
	                    }
	                    else if (globalUtility.Contributor) {
	                        currentUser = globalUtility.CurrentUser;
	                        isAdminRole = 0;
	                    }

	                    modifiedList = [];

	                    $scope.rowId = data[i].ComplianceProgramId ? data[i].ComplianceProgramId : data[i].rowId;

	                    modifiedList.push({
	                        ComplianceProgramId: data[i].ComplianceProgramId,
	                        Name: data[i].Name,
	                        Mark: data[i].Mark,
	                        CertificateOrganisationId: data[i].CertificateOrganisationId,
	                        //ComplianceModelId: data[i].ComplianceModelId,
	                        ComplianceModelId: isUndefinedOrEmpty(data[i].ComplianceModelId) ? '' : data[i].ComplianceModelId.join(','),
	                        ScopedProductListLink: data[i].ScopedProductListLink,
	                        ExceptionsTypeId: data[i].ExceptionsTypeId,
	                        ExceptionsLink: data[i].ExceptionsLink,
	                        SupplementInformationOfExceptions: data[i].SupplementInformationOfExceptions,
	                        //CertificateLimitationTypeId: data[i].CertificateLimitationTypeId,
	                        CertificateLimitationType: isUndefinedOrEmpty(data[i].CertificateLimitationType) ? '' : data[i].CertificateLimitationType.join(','),
	                        ModularApprovalTypeId: data[i].ModularApprovalTypeId,
	                        LocalRepresentativeTypeId: data[i].LocalRepresentativeTypeId,
	                        LocalServiceTypeId: data[i].LocalServiceTypeId,
	                        MarkRequirementTypeId: data[i].MarkRequirementTypeId,
	                        ManualRequirementTypeId: data[i].ManualRequirementTypeId,
	                        DetailsOfMarkingName: data[i].DetailsOfMarkingName,
	                        ElectronicLabelTypeId: data[i].ElectronicLabelTypeId,
	                        //CertificateMaintenanceTypeId: data[i].CertificateMaintenanceTypeId,
	                        CertificateMaintenanceType: isUndefinedOrEmpty(data[i].CertificateMaintenanceType) ? '' : data[i].CertificateMaintenanceType.join(','),
	                        InitialFactoryInspectionTypeId: data[i].InitialFactoryInspectionTypeId,
	                        WebPublicationOfProductTypeId: data[i].WebPublicationOfProductTypeId,
	                        WebAddress: data[i].WebAddress,
	                        //PublishedContentTypeId: data[i].PublishedContentTypeId,
	                        PublishedContentType: isUndefinedOrEmpty(data[i].PublishedContentType) ? '' : data[i].PublishedContentType.join(','),
	                        PublicationTimingTypeId: data[i].PublicationTimingTypeId,
	                        ShortTermConfidentialityTypeId: data[i].ShortTermConfidentialityTypeId,

	                        EvidenceId: evidenceId,

	                        Approve: $scope.isWorkflow ? $scope.workflowAction : '',
	                        Comments: $scope.isWorkflow ? $scope.rejectComment : '',

	                        CreatedBy: currentUser,
	                        isAdminRole: isAdminRole,

	                        RowItemId: $scope.rowId
	                    });

	                    baseService.IsBusy(true);
	                    regulatoryService.saveComplianceProgram(modifiedList, onSaveComplianceProgram_Completed);
	                }
	            }
                
	            if (modifiedList.length == 0 && $scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0) {
                    addEvidenceFile();
                }

	            ////////////// 

	            function onSaveComplianceProgram_Completed(response) {
	                if (response) {
	                    if (response.Success) {

	                        addModuleEvidence(false, response.Data.RowItemId, response.Data.ItemId);

	                        updateFlag = true;

                            if ($scope.isWorkflow) {
                                sendEmail($scope.workflowAction);
	                            closeDialog();
                            }
                            else {
                                dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

                                getComplianceProgramData();
                            }
	                    }
	                    else {
	                        dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                    }
	                }
	                baseService.IsBusy(false);
	            }
	        }

	        function saveCountryInfo() {            
	            var data = $scope.countryInfoGrid.data;
	            var modifiedList = [];

                //get all modified rows
	            for (var i = 0; i < data.length; i++) {
                    //if data is added/updated or if viewed in workflow
	                if (data[i].state === "Changed" || $scope.isWorkflow) {
                        //check if required fields are empty/null
	                    if (isUndefinedOrEmpty(data[i].CountryName) ||
                            //isUndefinedOrEmpty(data[i].sds) ||
                            isUndefinedOrEmpty(data[i].IEEEMembershipType)) {

	                        baseService.IsBusy(false);

	                        return;
                        }

                        //current user/is admin role for refactoring (used by all tab saving)
						var currentUser = '';
						var isAdminRole = null;
 
						if (globalUtility.Coordinator || globalUtility.ContentAdmin) {
							currentUser =  globalUtility.CurrentUser;
						    isAdminRole = 1;
						}
						else if (globalUtility.Contributor) {
							currentUser =  globalUtility.CurrentUser;
						    isAdminRole = 0;
						}

						modifiedList = [];

						$scope.rowId = data[i].RegulatoryCountryInformationId ? data[i].RegulatoryCountryInformationId : data[i].rowId;

						modifiedList.push({
							RegulatoryCountryInformationId: data[i].RegulatoryCountryInformationId,
							Voltage: data[i].Voltage,
							Frequency: data[i].Frequency,
							IEEEMembershipTypeId: data[i].IEEEMembershipType,
							BandInformation: data[i].BandInformation,
							Carrier: data[i].Carrier,
							SARLimit: data[i].SARLimit,
							SARPart: isUndefinedOrEmpty(data[i].SARPart) ? '' : data[i].SARPart.join(','),
						    //PlugType: data[i].DevicePlugType,  
							PlugType: isUndefinedOrEmpty(data[i].DevicePlugType) ? '' : data[i].DevicePlugType.join(','),
							RegionalEconomicUnionId: data[i].RegionalEconomicUnion,
							CountryName: data[i].CountryName.join(','),

							EvidenceId: evidenceId,

							Approve: $scope.isWorkflow ? $scope.workflowAction : '',
							Comments: $scope.isWorkflow ? $scope.rejectComment : '',

							CreatedBy: currentUser,
							isAdminRole: isAdminRole,
							ItemId: $scope.rowId
						});

						baseService.IsBusy(true);
						regulatoryService.saveCountryInfo(modifiedList, onSaveCountryInfo_Completed);

                    }
                }

	            if (modifiedList.length == 0 && $scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0)
	            {
	                addEvidenceFile();
	            }	            
	            //else {
	            //    baseService.IsBusy(false);
	            //}
                ////////////

	            function onSaveCountryInfo_Completed(response) {
	                if (response) {	                    
	                    if (response.Success) {

	                        addModuleEvidence(false, response.Data.ItemId, response.Data.CountryInfoItemId);

	                        updateFlag = true;

	                        if ($scope.isWorkflow) {
	                             sendEmail($scope.workflowAction);                            
	                            closeDialog();
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getCountryInfoData();
                            }                       
	                    }
	                    else {
	                        dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                    }
	                }
	                baseService.IsBusy(false);
                }
	        }

	        function saveFrequencyAndTechnology() {
	            var data = $scope.frequencytechnologyInfoGrid.data;
	            var modifiedList = [];

	            //get all modified rows
	            for (var i = 0; i < data.length; i++) {
	                if (data[i].state === "Changed" || $scope.isWorkflow) {
	                    if (isUndefinedOrEmpty(data[i].FrequencyTechnlogyId)) {
	                        baseService.IsBusy(false);
	                        return;
                        }

						var currentUser = '';
						var isAdminRole = null;
 
						if (globalUtility.Coordinator || globalUtility.ContentAdmin) {
							currentUser =  globalUtility.CurrentUser;
						    isAdminRole = 1;
						}
						else if (globalUtility.Contributor) {
							currentUser =  globalUtility.CurrentUser;
						    isAdminRole = 0;
						}

						modifiedList = [];

						$scope.rowId = data[i].RegulatoryFrequencyTechnologyId ? data[i].RegulatoryFrequencyTechnologyId : data[i].rowId;

	                    modifiedList.push({
	                        RegulatoryFrequencyTechnologyId: data[i].RegulatoryFrequencyTechnologyId !== undefined ? data[i].RegulatoryFrequencyTechnologyId : null,
	                        FrequencyTechnlogyId: data[i].FrequencyTechnlogyId,
	                        FrequencyRangeLower: data[i].FrequencyRangeLower,
	                        FrequencyRangeUpper: data[i].FrequencyRangeUpper,
	                        FrequencyTechnologyUnitTypeId: data[i].FrequencyTechnologyUnitTypeId,
	                        OperatingFrequencyChannel: data[i].OperatingFrequencyChannel,
	                        OutputPower: data[i].OutputPower,
	                        PowerDensity: data[i].PowerDensity,
	                        ChannelSpacing: data[i].ChannelSpacing,
	                        Bandwitdth: data[i].Bandwidth,
	                        DutyCycle: data[i].DutyCycle,
	                        DFSApplicableTypeId: data[i].DFSApplicableTypeId,
	                        TPCApplicableTypeId: data[i].TPCApplicableTypeId,
	                        GeoCountryItemId: typeof ($scope.selectedFreqTechCountry) != 'undefined' ? $scope.selectedFreqTechCountry.CountryItemId : data[i].GeoCountryItemId,
	                        IndoorUseOnlyApplicableTypeId: data[i].IndoorUseOnlyApplicableTypeId,

	                        EvidenceId: evidenceId,

	                        Approve: $scope.isWorkflow ? $scope.workflowAction : '',
	                        Comments: $scope.isWorkflow ? $scope.rejectComment : '',

							CreatedBy: currentUser,
							isAdminRole: isAdminRole,
							RowItemId: $scope.rowId
	                    });

	                    baseService.IsBusy(true);
	                    regulatoryService.saveFrequencyAndTechnology(modifiedList, onSaveFrequencyAndTechnology_Completed);
	                }
	            }

	            if (modifiedList.length == 0 && $scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0) {
	                addEvidenceFile();
	            }
	                
	            //////////////

	            function onSaveFrequencyAndTechnology_Completed(response) {
	                if (response) {
	                    if (response.Success) {

	                        addModuleEvidence(false, response.Data.RowItemId, response.Data.RegulatoryFrequencyTechnologyItemId);

	                        updateFlag = true;

                            if ($scope.isWorkflow) {
                                sendEmail($scope.workflowAction);
	                            closeDialog();
                            }
                            else {
                                dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

                                getFrequencyandTechnologyData();
                            }
	                    }
	                    else {
	                        dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                    }
	                }
	                baseService.IsBusy(false);
                }
	        }

	        function saveScopeStandards(evidenceId) {
	            var data = $scope.scopeStandardsInfoGrid.data;
	            var modifiedList = [];

	            //get all modified rows
	            for (var i = 0; i < data.length; i++) {
	                if (isUndefinedOrEmpty(data[i].CoveredSectorId)) {
	                    return;
                    }

	                if (data[i].state === "Changed" || $scope.isWorkflow) {
	                    switch (data[i].ProductTypeId) {
	                        case (""): case (0):
	                            data[i].ProductTypeId = null;
	                    }
	                    switch (data[i].ProductSubTypeId) {
	                        case (""): case (0):
	                            data[i].ProductSubTypeId = null;
	                    }
	                    switch (data[i].PowerSourceTypeId) {
	                        case (""): case (0):
	                            data[i].PowerSourceTypeId = null;
	                    }
	                    switch (data[i].FrequencyTechnologyId) {
	                        case (""): case (0):
	                            data[i].FrequencyTechnologyId = null;
	                    }
	                    switch (data[i].CoveredSectorId) {
	                        case (""): case (0):
	                            data[i].CoveredSectorId = null;
	                    }
	                    switch (data[i].RegulatoryStandardWirelessScopeTypeId) {
	                        case (""): case (0):
	                            data[i].RegulatoryStandardWirelessScopeTypeId = null;
	                    }
	                    switch (data[i].AcceptedTestType) {
	                        case (""): case (0):
	                            data[i].AcceptedTestType = null;
	                    } 
	                    switch (data[i].TestingOrganisation) {
	                        case (""): case (0):
	                            data[i].TestingOrganisation = null;
	                    }
	                    switch (data[i].RegulatoryStandardTechnicalStandardId) {
	                        case (""): case (0):
	                            data[i].RegulatoryStandardTechnicalStandardId = null;
	                    }

	                    var currentUser = '';
	                    var isAdminRole = null;

	                    if (globalUtility.Coordinator || globalUtility.ContentAdmin) {
	                        currentUser = globalUtility.CurrentUser;
	                        isAdminRole = 1;
	                    }
	                    else if (globalUtility.Contributor) {
	                        currentUser = globalUtility.CurrentUser;
	                        isAdminRole = 0;
	                    }

	                    modifiedList = [];
	                    $scope.rowId = data[i].RegulationId ? data[i].RegulationId : data[i].rowId;

 		modifiedList.push({
	                        RegulatoryStandardId: data[i].RegulatoryStandardId !== undefined ? data[i].RegulatoryStandardId : null,
	                        ProductTypeId: data[i].ProductTypeId,
	                        ProductSubTypeId: data[i].ProductSubTypeId,
	                        PowerSourceTypeId: data[i].PowerSourceTypeId,
	                        FrequencyTechnologyId: data[i].FrequencyTechnologyId,
	                        CoveredSectorId: data[i].CoveredSectorId,
	                        RegulatoryStandardWirelessScopeTypeId: data[i].RegulatoryStandardWirelessScopeTypeId,
	                        //AcceptedTestTypeId: data[i].AcceptedTestTypeId,
	                        AcceptedTestTypeId: isUndefinedOrEmpty(data[i].AcceptedTestTypeId) ? '' : data[i].AcceptedTestTypeId.join(','),
	                        TestingOrganisation: data[i].TestingOrganisation,
	                        //GeoCountryItemId: $scope.selectedFreqTechCountry.CountryItemId,
	                        ComplianceProgramId: typeof($scope.selectedScopeStandardsCompliance) != 'undefined' ? $scope.selectedScopeStandardsCompliance.CertificateProgramId : '',
	                        RegulatoryStandardTechnicalStandardId: data[i].RegulatoryStandardTechnicalStandardId,

	                        EvidenceId: evidenceId,

	                        Approve: $scope.isWorkflow ? $scope.workflowAction : '',
	                        Comments: $scope.isWorkflow ? $scope.rejectComment : '',

	                        CreatedBy: currentUser,
	                        isAdminRole: isAdminRole,
	                        RowItemId: $scope.rowId
	                    });

	                    baseService.IsBusy(true);
	                    regulatoryService.saveScopeStandard(modifiedList, onSaveScopeStandards_Completed);
	                }
	            }

	            if (modifiedList.length !== 0 && $scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0) {
	                addEvidenceFile();
	            }

	            //////////////

	            function onSaveScopeStandards_Completed(response) {
	                if (response) {
	                    if (response.Success) {
	                        addModuleEvidence(false, response.Data.RowItemId, response.Data.ItemId);
	                        updateFlag = true;

	                        if ($scope.isWorkflow) {
	                            sendEmail($scope.workflowAction);
	                            closeDialog();
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getScopeStandardsData();
                            }
	                    }
	                    else {
	                        dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                    }
	                }
	                baseService.IsBusy(false);
	            }
	        }

	        function saveTabEdits(evidenceId) {
	            switch ($scope.activeTab) {
	                case 'CountryInfo':
	                    saveCountryInfo(evidenceId);
	                    break;
	                case 'AuthorityRegulation':
	                    saveAuthorityAndRegulation(evidenceId);
	                    break;
	                case 'FrequencyTechnology':
	                    saveFrequencyAndTechnology(evidenceId);
	                    break;
	                case 'ComplianceProgram':
	                    saveComplianceProgram(evidenceId);
	                    break;
	                case 'ScopeStandards':
	                    saveScopeStandards(evidenceId);
	                    break;
	                case 'TestingValidity':
	                    saveTestingValidity(evidenceId);
	                    break;

	            }
	        }

	        function saveTestingValidity(evidenceId) {
	            var data = $scope.testingValidityInfoGrid.data;
	            var modifiedList = [];

	            //get all modified rows
	            for (var i = 0; i < data.length; i++) {
	                if (data[i].state === "Changed" || $scope.isWorkflow) {
	                    if (isUndefinedOrEmpty(data[i].CoveredSectorId) || isUndefinedOrEmpty(data[i].RegulatoryApplicationTypeId)) {
	                        baseService.IsBusy(false);
	                        return;
	                    }

	                    var currentUser = '';
	                    var isAdminRole = null;

	                    if (globalUtility.Coordinator || globalUtility.ContentAdmin) {
	                        currentUser = globalUtility.CurrentUser;
	                        isAdminRole = 1;
	                    }
	                    else if (globalUtility.Contributor) {
	                        currentUser = globalUtility.CurrentUser;
	                        isAdminRole = 0;
	                    }

	                    modifiedList = [];
	                    $scope.rowId = data[i].RegulationId ? data[i].RegulationId : data[i].rowId;

	                    modifiedList.push({	                        
	                        RegulatoryTestingAndValidityId: data[i].RegulatoryTestingAndValidityId !== undefined ? data[i].RegulatoryTestingAndValidityId : null,
	                        CoveredSectorId: data[i].CoveredSectorId,
	                        RegulatoryApplicationTypeId: data[i].RegulatoryApplicationTypeId,
	                        SampleRequirementTypeId: data[i].SampleRequirementTypeId !== undefined ? data[i].SampleRequirementTypeId : null,
	                        InCountryTestingTypeId: data[i].InCountryTestingTypeId !== undefined ? data[i].InCountryTestingTypeId : null,
	                        CertificateValidityPeriod: data[i].CertificateValidityPeriod,
	                        LeadTime: data[i].LeadTime,
	                        ComplianceProgramId: typeof ($scope.selectedTestingValidityComplianceProgram) != 'undefined' && $scope.selectedTestingValidityComplianceProgram !== null ? $scope.selectedTestingValidityComplianceProgram.CertificateProgramId : '',

	                        EvidenceId: evidenceId,

	                        Approve: $scope.isWorkflow ? $scope.workflowAction : '',
	                        Comments: $scope.isWorkflow ? '': $scope.rejectComment,

	                        CreatedBy: currentUser,
	                        isAdminRole: isAdminRole,
	                        RowItemId: $scope.rowId
	                    });

	                    baseService.IsBusy(true);
	                    regulatoryService.saveTestingValidity(modifiedList, onSaveTestingValidity_Completed);
	                }
	            }

	            if (modifiedList.length !== 0 && $scope.enableEvidence &&
	                $scope.selectedFile.name !== undefined &&
	                $scope.selectedFile.name !== '' &&
	                $scope.selectedFieldList.length > 0) {
	                addEvidenceFile();
                }

                //////////////
        
	            function onSaveTestingValidity_Completed(response) {
	                if (response) {
	                    if (response.Success) {
	                        addModuleEvidence(false, response.Data.RowItemId, response.Data.ItemId);
	                        updateFlag = true;

	                        if ($scope.isWorkflow) {
	                            sendEmail($scope.workflowAction);
	                            closeDialog();
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getTestingValidityData();
                            }
	                    }
	                    else {
	                        dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                    }
	                }
	                baseService.IsBusy(false);
                }
	        }

	        function sendEmail(approve) {
	            var data = {
	                Status: ((approve) ? "Approved":"Rejected"),
	                Scope: "Regulatory",
	                Category: isUndefinedOrEmpty(items.workflowItem.RegulatoryCategory) ? [] : [items.workflowItem.RegulatoryCategory],
	                Region: isUndefinedOrEmpty(items.workflowItem.Region) ? [] : [items.workflowItem.Region],
	                Country: isUndefinedOrEmpty(items.workflowItem.Country) ? [] : [items.workflowItem.Country],
	                Compliance: isUndefinedOrEmpty(items.workflowItem.ComplianceProgram) ? [] : [items.workflowItem.ComplianceProgram],
	                Original: items.workflowItem.OriginalInformation.length === 0 ? [] : items.workflowItem.OriginalInformation,
	                Updated: items.workflowItem.UpdatedInformation.length === 0 ? [] : items.workflowItem.UpdatedInformation,
	                Source: isUndefinedOrEmpty(items.workflowItem.Source) ? [] : [items.workflowItem.Source],
	                Link: items.workflowItem.Links.length === 0 ? [] : items.workflowItem.Links.map(function (l) { return l.m_Item3 }),
	                Remarks: $scope.rejectComment,
	                Recipient: items.workflowItem.CreatedBy 
	            };

	            homeService.sendEmail(data, onSuccessEmail)

	            /////////////
	            function onSuccessEmail() {
                    //do nothing
                }
            }

	        function setToLastRow(grid, gridApi) {
	            if (grid && gridApi) {
	                var lastRow = grid.data.length - 1;

	                //set focus to the new row 
	                $timeout(function () {
	                    var newRow = grid.data[lastRow];
	                    gridApi.cellNav.scrollToFocus(newRow, grid.columnDefs[0]);
	                }, 100);
	            }
	        }
	        
	        function setupAuthorityRegulationGrid() {
	            //setup grid properties
	            $scope.authorityregulationInfoGrid = config.authorityAndRegulationGrid;
	            
	            //enable/disable editing	            
	            toggleEditing($scope.authorityregulationInfoGrid);

	            //setup additional lookups
	            $scope.authorityRegulationCountryList = config.authorityCountryLookup;

	            //setup grid APIs
	            $scope.authorityregulationInfoGrid.onRegisterApi = function (gridApi) {
	                //set gridApi on scope
	                $scope.authorityregulationInfoGridApi = gridApi;

	                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
	                    //var selectedRows = $scope.authorityregulationInfoGridApi.selection.getSelectedRows();

	                    if (newValue != oldValue) {
	                        rowEntity.state = "Changed";
	                    }
	                });

	                enableAddEvidence('show');
	            };

	            //populate data 
	            //if ($scope.selectedAuthorityRegulationCountry != null && $scope.selectedAuthorityRegulationCountry != undefined) {
	            //getAuthorityandRegulationData();
	            //}
	        }

	        function setupCountryInfoGrid() {
	            //setup grid
	            $scope.countryInfoGrid = config.countryInfoGrid;

	            //enable/disable editing
	            toggleEditing($scope.countryInfoGrid);
	            

	            //setup grid APIs
	            $scope.countryInfoGrid.onRegisterApi = function (gridApi) {
	                //set gridApi on scope
	                $scope.countryInfoGridApi = gridApi;

	                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
	                    //var selectedRows = $scope.countryInfoGridApi.selection.getSelectedRows();

	                    if (newValue != oldValue) {
	                        rowEntity.state = "Changed";
	                    }
	                });

	                enableAddEvidence('show');
	            };

	            //if not from workflow load country info data by default
	            if ($scope.isWorkflow === false) {
	                getCountryInfoData();
	            }	            
	        }

	        function setupFrequencyTechnologyGrid() {
	            //setup grid
	            $scope.frequencytechnologyInfoGrid = config.frequencytechnologyInfoGrid;

	            //enable/disable editing
	            toggleEditing($scope.frequencytechnologyInfoGrid);


	            //setup additional lookups
	            $scope.frequencytechnologyCountryLookup = config.freqtechCountryLookup;

	            //setup grid APIs
	            $scope.frequencytechnologyInfoGrid.onRegisterApi = function (gridApi) {
	                //set gridApi on scope
	                $scope.frequencytechnologyInfoGridApi = gridApi;

	                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
	                    //var selectedRows = $scope.frequencytechnologyInfoGridApi.selection.getSelectedRows();

	                    if (newValue != oldValue) {
	                        rowEntity.state = "Changed";
	                    }
	                });

	                enableAddEvidence('show');
	            };

	            //populate data
	            //if ($scope.selectedFreqTechCountry != null && $scope.selectedFreqTechCountry != undefined) {
	            //    getFrequencyandTechnologyData();	            
	            //}
	        }

	        function setupComplianceProgramGrid() {
	            //setup grid properties
	            $scope.complianceProgramInfoGrid = config.complianceProgramInfoGrid;

	            //enable/disable editing
	            toggleEditing($scope.complianceProgramInfoGrid);

	            //setup additional lookups
	            //$scope.scopeStandardsCountryLookup = config.scopeStandardsCountryLookup;
	            //$scope.scopeStandardsComplianceProgramLookup = config.scopeStandardsComplianceProgramLookup;

	            //setup grid APIs
	            $scope.complianceProgramInfoGrid.onRegisterApi = function (gridApi) {
	                //set gridApi on scope
	                $scope.complianceProgramInfoGridApi = gridApi;

	                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
	                    //var selectedRows = $scope.complianceProgramInfoGridApi.selection.getSelectedRows();

						if (newValue != oldValue) {
	                        rowEntity.state = "Changed";
                        }
	                });

	                enableAddEvidence('show');
                };

	            //populate data 	            
	            //getComplianceProgramData();	            
	        }

	        function setupScopeStandardsGrid() {
	            //setup grid properties
	            $scope.scopeStandardsInfoGrid = config.scopeStandardsInfoGrid;

	            //enable/disable editing
	            toggleEditing($scope.scopeStandardsInfoGrid);

	            //setup additional lookups
	            $scope.scopeStandardsCountryLookup = config.scopeStandardsCountryLookup;
	            $scope.scopeStandardsComplianceProgramLookup = config.scopeStandardsComplianceProgramLookup

	            //setup grid APIs
	            $scope.scopeStandardsInfoGrid.onRegisterApi = function (gridApi) {
	                //set gridApi on scope
	                $scope.scopeStandardsInfoGridApi = gridApi;

	                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
	                    //var selectedRows = $scope.scopeStandardsInfoGridApi.selection.getSelectedRows();

	                    if (newValue != oldValue) {
	                        rowEntity.state = "Changed";
	                    }
	                });

	                enableAddEvidence('show');
	            };

	            //populate data
	            //if ($scope.selectedScopeStandardsCountry != null && $scope.selectedScopeStandardsCountry != undefined) {
	            //    getScopeStandardsData();
	            //}
	        }

	        function setupTestingValidityGrid() {
	            //setup grid properties
	            $scope.testingValidityInfoGrid = config.testingValidityInfoGrid;

	            //enable/disable editing
	            toggleEditing($scope.testingValidityInfoGrid);

	            //setup additional lookups
	            $scope.countryLookup = config.countryLookup;
	            $scope.complianceProgramLookup = config.complianceProgramLookup;

	            //setup grid APIs	            
	            $scope.testingValidityInfoGrid.onRegisterApi = function (gridApi) {
	                //set gridApi on scope
	                $scope.testingValidityInfoGridApi = gridApi;

	                gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
	                    //var selectedRows = $scope.testingValidityInfoGridApi.selection.getSelectedRows();

	                    if (newValue != oldValue) {
	                        rowEntity.state = "Changed";
	                    }
	                });

	                enableAddEvidence('show');
	            };

	            //populate data
	            //getTestingValidityData();
	        }

	        function showConfirmDialog(data) {
	            var message = deleteMessage;
	            var title = "DELETE REGULATION";
	            dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);

	            function callBack(response) {
	                if (response == enums.CallbackType.Yes) {
						if (data.CountryInformationId === '') {
                            var index = $scope.countryInfoGrid.data.indexOf(data);
                            $scope.countryInfoGrid.data.splice(index);
	                    }
	                    else {
	                        //do service call to delete row
	                        //on delete complete refresh grid data
	                        alert('service call to delete');
	                    }
	                }
	            }
	        }

	        function showDeleteAuthorityAndRegulation(data) {
	            var message = deleteMessage;
	            var title = "DELETE AUTHORITY AND REGULATION";
	            dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);

	            function callBack(response) {
	                if (response == enums.CallbackType.Yes) {
	                    if (data.RegulationId !== '' && data.RegulationId !== undefined) {
	                        baseService.IsBusy(true);
	                        regulatoryService.deleteAuthorityRegulation(String('"' + data.RegulationId) + '"', deleteAuthorityRegulation_Completed)
	                    }
	                    else {
	                        var index = $scope.authorityregulationInfoGrid.data.indexOf(data);
	                        $scope.authorityregulationInfoGrid.data.splice(index);
	                    }
	                }

	                ////////////// 

	                function deleteAuthorityRegulation_Completed(response) {
	                    if (response) {
	                        if (response.Success) {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getAuthorityandRegulationData();

	                            updateFlag = true;
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Error);
	                        }
	                    }
	                    baseService.IsBusy(false);
	                }
	            }
	        }

	        function showDeleteComplianceProgram(data) {
	            var message = deleteMessage;
	            var title = "DELETE COMPLIANCE PROGRAM";
	            dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);

	            ////////////// 

	            function callBack(response) {
	                if (response == enums.CallbackType.Yes) {
	                    if (data.ComplianceProgramId !== '' && data.ComplianceProgramId !== undefined) {
	                        baseService.IsBusy(true);
	                        regulatoryService.deleteComplianceProgram(data.ComplianceProgramId, deleteComplianceProgram_Completed)
	                    }
	                    else {
	                        var index = $scope.complianceProgramInfoGrid.data.indexOf(data);
	                        $scope.complianceProgramInfoGrid.data.splice(index);
	                    }
	                }

	                ////////////// 

	                function deleteComplianceProgram_Completed(response) {
	                    if (response) {
	                        if (response.Success) {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getComplianceProgramData();

	                            updateFlag = true;
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                        }
	                    }
	                    baseService.IsBusy(false);
	                }
	            }
	        }

	        function showDeleteCountryInfo(data) {
	            var message = deleteMessage;
	            var title = "DELETE COUNTRY INFO";
	            dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);

	            ////////////// 

	            function callBack(response) {
	                if (response == enums.CallbackType.Yes) {
	                    if (data.RegulatoryCountryInformationId !== '' && data.RegulatoryCountryInformationId !== undefined) {
	                        baseService.IsBusy(true);
							regulatoryService.deleteCountryInfo(String('"' + data.RegulatoryCountryInformationId) + '"', deleteCountryInformation_Completed)
	                    }
	                    else {
	                        var index = $scope.countryInfoGrid.data.indexOf(data);
	                        $scope.countryInfoGrid.data.splice(index);
	                    }
	                }

	                ////////////// 

	                function deleteCountryInformation_Completed(response) {
	                    if (response) {
	                        if (response.Success) {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getCountryInfoData();

	                            updateFlag = true;
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                        }
	                    }
	                    baseService.IsBusy(false);
	                }
	            }
	        }

	        function showDeleteFrequencyAndTechnology(data) {
	            var message = deleteMessage;
	            var title = "DELETE FREQUENCY AND TECHNOLOGY";
	            dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);

	            ////////////// 

	            function callBack(response) {
	                if (response == enums.CallbackType.Yes) {
	                    if (data.RegulatoryFrequencyTechnologyId !== '' && data.RegulatoryFrequencyTechnologyId !== undefined) {
	                        baseService.IsBusy(true);
	                        regulatoryService.deleteFrequencyAndTechnology(data.RegulatoryFrequencyTechnologyId, deleteFrequencyAndTechnology_Completed)
	                    }
	                    else {
	                        var index = $scope.frequencytechnologyInfoGrid.data.indexOf(data);
	                        $scope.frequencytechnologyInfoGrid.data.splice(index);
	                    }
	                }

	                ////////////// 

	                function deleteFrequencyAndTechnology_Completed(response) {
	                    if (response) {
	                        if (response.Success) {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getFrequencyandTechnologyData();

	                            updateFlag = true;
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                        }
	                    }
	                    baseService.IsBusy(false);
	                }
	            }
	        }

	        function showDeleteScopeStandards(data) {
	            var message = deleteMessage;
	            var title = "DELETE SCOPE AND STANDARDS";
	            dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);

	            //////////////

	            function callBack(response) {
	                if (response == enums.CallbackType.Yes) {
	                    if (data.RegulatoryStandardId !== '' && data.RegulatoryStandardId !== undefined) {
	                        baseService.IsBusy(true);
	                        regulatoryService.deleteScopeStandards(data.RegulatoryStandardId, deleteScopeStandards_Completed)
	                    }
	                    else {
	                        var index = $scope.scopeStandardsInfoGrid.data.indexOf(data);
	                        $scope.scopeStandardsInfoGrid.data.splice(index);
	                    }
	                }

	                //////////////

	                function deleteScopeStandards_Completed(response) {
	                    if (response) {
	                        if (response.Success) {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getScopeStandardsData();

	                            updateFlag = true;
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                        }
	                    }
	                    baseService.IsBusy(false);
	                }
	            }
	        }

	        function showDeleteTestingValidity(data) {
	            var message = deleteMessage;
	            var title = "DELETE TESTING AND VALIDITY";
	            dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Small, callBack);

	            //////////////

	            function callBack(response) {
	                if (response == enums.CallbackType.Yes) {
	                    if (data.RegulatoryTestingAndValidityId !== '' && data.RegulatoryTestingAndValidityId !== undefined) {
	                        baseService.IsBusy(true);
	                        regulatoryService.deleteTestingValidity(data.RegulatoryTestingAndValidityId, deleteTestingValidity_Completed)
	                    }
	                    else {
	                        var index = $scope.testingValidityInfoGrid.data.indexOf(data);
	                        $scope.testingValidityInfoGrid.data.splice(index);
                        }	                    
	                }

	                //////////////

	                function deleteTestingValidity_Completed(response) {
	                    if (response) {
	                        if (response.Success) {
	                            dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);

	                            getTestingValidityData();

	                            updateFlag = true;
	                        }
	                        else {
	                            dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
	                        }
	                    }
	                    baseService.IsBusy(false);
	                }
	            }
            }

	        function switchGrid(tab) {
	            //clear evidence variables 
	            clearEvidence();
	            $scope.selectedFieldList = [];
	            $scope.existingEvidenceList = [];
	            $scope.enableEvidence = false;

	            //show and hide grids to boost modal performance
                //consider creating enum for tabs
	            switch (tab) {
	                case 'CountryInfo':
	                    $scope.showGrid1 = true;
	                    $scope.showGrid2 = false;
	                    $scope.showGrid3 = false;
	                    $scope.showGrid4 = false;
	                    $scope.showGrid5 = false;
	                    $scope.showGrid6 = false;
	                    break;
	                case 'AuthorityRegulation':
	                    $scope.showGrid1 = false;
	                    $scope.showGrid2 = true;
	                    $scope.showGrid3 = false;
	                    $scope.showGrid4 = false;
	                    $scope.showGrid5 = false;
	                    $scope.showGrid6 = false;
	                    break;
	                case 'FrequencyTechnology':
	                    $scope.showGrid1 = false;
	                    $scope.showGrid2 = false;
	                    $scope.showGrid3 = true;
	                    $scope.showGrid4 = false;
	                    $scope.showGrid5 = false;
	                    $scope.showGrid6 = false;
	                    break;
	                case 'ComplianceProgram':
	                    $scope.showGrid1 = false;
	                    $scope.showGrid2 = false;
	                    $scope.showGrid3 = false;
	                    $scope.showGrid4 = true;
	                    $scope.showGrid5 = false;
	                    $scope.showGrid6 = false;
	                    break;
	                case 'ScopeStandards':
	                    $scope.showGrid1 = false;
	                    $scope.showGrid2 = false;
	                    $scope.showGrid3 = false;
	                    $scope.showGrid4 = false;
	                    $scope.showGrid5 = true;
	                    $scope.showGrid6 = false;
	                    break;
	                case 'TestingValidity':
	                    $scope.showGrid1 = false;
	                    $scope.showGrid2 = false;
	                    $scope.showGrid3 = false;
	                    $scope.showGrid4 = false;
	                    $scope.showGrid5 = false;
	                    $scope.showGrid6 = true;
	                    break;
	                default:
	                    $scope.showGrid1 = true;
	                    $scope.showGrid2 = false;
	                    $scope.showGrid3 = false;
	                    $scope.showGrid4 = false;
	                    $scope.showGrid5 = false;
	                    $scope.showGrid6 = false;
	                    $scope.activeTab = 'CountryInfo';
	                    break;
	            }

	            $scope.activeTab = tab;

                //for enabling/disabling add evidence button
	            checkIfGridHasNoData();
	            //if workflow, show item data in tab
	            loadTabData(tab);

	            ////////////
	            function loadTabData(tab) {
	                if (tab === 'CountryInfo') {
	                    getCountryInfoData();
	                }
	                else {
	                    if ($scope.isWorkflow === true) {
	                        switch (tab) {
	                            case 'AuthorityRegulation':
	                                getAuthorityandRegulationData();
	                                break;
	                            case 'FrequencyTechnology':
	                                getFrequencyandTechnologyData();
	                                break;
	                            case 'ComplianceProgram':
	                                getComplianceProgramData();
	                                break;
	                            case 'ScopeStandards':
	                                getScopeStandardsData();
	                                break;
	                            case 'TestingValidity':
	                                getTestingValidityData();
	                                break;
	                        }
	                    }
	                }
	            }
	        }

	        function toggleEditing(grid) {
	            if ($scope.isWorkflow && globalUtility.Coordinator !== true && globalUtility.ContentAdmin !== true) {
	                angular.forEach(grid.columnDefs, function (value) {
	                    value.cellEditableCondition = false;
	                    if ($scope.isWorkflow && (value.name === 'Mark' || value.name === 'DetailsOfMarkingName')) {
	                        value.cellTemplate = '';
                        }
	                });
	            }
	            else {
	                angular.forEach(grid.columnDefs, function (value) {
	                    value.cellEditableCondition = true;
	                    
                        //revert cell template for compliance program
	                    switch (value.name) {
	                        case 'Mark':
	                            value.cellTemplate = '<div>' +
                                        '<div ng-if="(row.entity.Mark) == \'\' && row.entity.ComplianceProgramId !== \'\'">' +
                                            '<center>' +
                                                '<button class="btn btn-primary text-align-center" type="button" ng-click="grid.appScope.addEditFile(row.entity, 1)">' +
                                                '<i class="fa fa-folder-open-o"></i>Browse ...</button>' +
                                            '</center>' +
                                        '</div>' +

                                        '<div ng-if="(row.entity.Mark) !== \'\'" class="text-align-center">' +
	                                        '<div>' +
                                                '<a style="padding-left:5px;"><span style="cursor:pointer" class="text-align-center" ng-click="grid.appScope.openFile(row.entity, 1)">View File</span></a> ' +
                                                '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.addEditFile(row.entity, 2)" style="cursor: pointer; padding-left:18px;"></a>' +
                                                '<a class="fa fa-trash-o text-align-center" ng-click="grid.appScope.deleteFile(row.entity, 1)" style="cursor: pointer; padding-left:18px;"></a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';
	                            break;
	                        case 'DetailsOfMarkingName':
	                            value.cellTemplate = '<div>' +
                                        '<div ng-if="(row.entity.DetailsOfMarkingName) == \'\' && row.entity.ComplianceProgramId !== \'\'">' +
                                            '<center>' +
                                                '<button class="btn btn-primary text-align-center" type="button" ng-click="grid.appScope.addEditFile(row.entity, 3)">' +
                                                '<i class="fa fa-folder-open-o"></i>Browse ...</button>' +
                                            '</center>' +
                                        '</div>' +

                                        '<div ng-if="(row.entity.DetailsOfMarkingName) !== \'\'" class="text-align-center">' +
	                                        '<div>' +
                                                '<a style="padding-left:5px;"><span style="cursor:pointer" class="text-align-center" ng-click="grid.appScope.openFile(row.entity, 2)">View File</span></a> ' +
                                                '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.addEditFile(row.entity, 4)" style="cursor: pointer; padding-left:18px;"></a>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>';
	                            break;
                            }
	                    
	                });
	            }
	        }

	        $scope.$on('$destroy', function () {
	            //var events = ['certificates:loadCertificateDetails'];
	            //baseService.UnSubscribe(events);
	        });
	    }]);

    
});