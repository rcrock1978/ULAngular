'use strict';

define([
    'app',
    'shell/model/refinerModel',
    'globalUtility',
], function (app, refinerModel, globalUtility) {
    app.register.factory('regulatoryConfigService', [ 'crudService',
    function (crudService) {
        //globals    
        var apiUrl = 'api/regulatory/';
        var authorityRegulationColumns = [];
        var countryInfoColumns = [];
        var complianceProgramColumns = [];
        var frequencyTechnologyColumns = [];        
        var scopeStandardsColumns = [];
        var testingValidityColumns = [];
        var refinerType = {};

        //public properties 
        var svc = {
            apiUrl: apiUrl,
            authorityAndRegulationGrid: {},
            countryInfoGrid: {},
            countryLookup: [],            
            complianceProgramInfoGrid: {},
            complianceProgramLookup: [],
            frequencytechnologyCountryList: [],
            frequencytechnologyInfoGrid: {},
            manualFolder: 'ManualFiles',
            markFolder: 'MarkFiles',
            scopeStandardsInfoGrid: {},
            testingValidityInfoGrid: {},
            refinerList: []            
        };

        init();

        return svc;

        //function implementations
        ////////////
        
        function init() {            
            initGlobalVariables();

            initRefinerList();

            initWorkFlowRefinerList();

            initManageDataColumns();

            initGridConfigs();
        }

        function initGlobalVariables() {
            refinerType = {
                Sector: 'CoveredSector',
                ProductType: 'ProductType',
                ProductSubType: 'ProductSubType',
                PowerSource: 'PowerSource',
                FrequencyAndTechnology: 'FrequencyTech',
                ApplicationType: 'ApplicationType',
                Region: 'Region',
                Country: 'Country',
                ComplianceProgram: 'CertScheme',                
                Scope: 'Scope',
                AcceptedTest: 'AcceptedTest',
                ScopeWireless: 'ScopeWireless',
                ModularApproval: 'ModularApproval',
                CertificateLimitation: 'CertLimit',
                SampleRequirement: 'SampReq',
                InCountryTesting: 'InCountryTest',
                LocalRepresentative: 'LocalRep',
                LocalRepService: 'LocalRepService',
                MarkingRequirement: 'MarkingReq',
                CertificateValidityPeriod: 'CertValidPeriod'
            };
        }

        function initGridConfigs() {            
            initAuthorityAndRegulationGrid();
            
            initCountryInfoGrid();

            initComplianceProgramGrid();

            initFrequencyAndTechnologyGrid();

            initScopeAndStandards();

            initTestingAndValidity();
            
            ////////////
            function initAuthorityAndRegulationGrid() {
                svc.authorityAndRegulationGrid = {
                    enableSorting: true,
                    enableColumnResizing: true,
                    columnDefs: authorityRegulationColumns,
                    enableRowSelection: true,
                    enableSelectAll: true,
                    data: []
                }
            }

            function initCountryInfoGrid() {
                //setup grid parameters
                svc.countryInfoGrid = {
                    enableSorting: true,
                    enableColumnResizing: true,
                    columnDefs: countryInfoColumns,
                    enableRowSelection: true,
                    enableSelectAll: true,
                    data: []
                };
            }

            function initComplianceProgramGrid() {
                svc.complianceProgramInfoGrid = {
                    enableSorting: true,
                    enableColumnResizing: true,
                    columnDefs: complianceProgramColumns,
                    data: []
                }
            }

            function initFrequencyAndTechnologyGrid() {
                svc.frequencytechnologyInfoGrid = {
                    enableSorting: true,
                    enableColumnResizing: true,
                    columnDefs: frequencyTechnologyColumns,
                    data: []
                }
            }

            function initScopeAndStandards(){
                svc.scopeStandardsInfoGrid = {
                    enableSorting: true,
                    enableColumnResizing: true,
                    columnDefs: scopeStandardsColumns,
                    data: []
                }
            }

            function initTestingAndValidity() {
                svc.testingValidityInfoGrid = {
                    enableSorting: true,
                    enableColumnResizing: true,
                    columnDefs: testingValidityColumns,
                    data: []
                }
            }
        }

        function initManageDataColumns() {
            initAuthorityandRegulation();

            initCountryInfo();

            initComplianceProgram();

            initFrequencyandTechnology();

            initScopeandStandards();

            initTestingandValidity();

            ////////////

            function createNewColumn(field, name, width, visible, dropDownSettings) {
                return {
                    field: field,
                    name: name,
                    width: width,
                    enableColumnMenu: false,
                    enableCellEdit: true,
                    visible: visible !== undefined ? visible : true,
                    editableCellTemplate: dropDownSettings === undefined ? 'ui-grid/cellEditor' : 'ui-grid/dropdownEditor',
                    editDropdownOptionsArray: dropDownSettings !== undefined ? dropDownSettings.dropDownArray : '',
                    editDropdownIdLabel: dropDownSettings !== undefined ? dropDownSettings.dropDownId : '',
                    editDropdownValueLabel: dropDownSettings !== undefined ? dropDownSettings.dropDownLabel : '',                    
                    cellFilter: "griddropdown:this"
                }
            }

            function createNewColumnWithMaxLength(field, name, width, visible, maxlength, dropDownSettings) {
                return {
                    field: field,
                    name: name,
                    width: width,
                    enableColumnMenu: false,
                    enableCellEdit: true,
                    visible: visible !== undefined ? visible : true,
                    editableCellTemplate: "<input type=\"INPUT_TYPE\" ng-class=\"'colt' + col.uid\" ui-grid-editor ng-model=\"MODEL_COL_FIELD\" maxlength=" + maxlength + ">",
                    editDropdownOptionsArray: dropDownSettings !== undefined ? dropDownSettings.dropDownArray : '',
                    editDropdownIdLabel: dropDownSettings !== undefined ? dropDownSettings.dropDownId : '',
                    editDropdownValueLabel: dropDownSettings !== undefined ? dropDownSettings.dropDownLabel : '',
                    cellFilter: "griddropdown:this"
                }
            }

            function createMultiSelectColumn(field, lookup) {
                return {
                    name: field,
                    width: 200,
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{ COL_FIELD.join(\', \') }}</div>',
                    editableCellTemplate: ' <ui-select-wrap>&nbsp;<ui-select style="width: 80%" multiple ng-model="MODEL_COL_FIELD" theme="select2" ng-disabled="disabled" append-to-body="true"><ui-select-match placeholder="Choose...">{{ $item }}</ui-select-match><ui-select-choices repeat="item in col.colDef.editDropdownOptionsArray | filter: $select.search"><span>{{ item }}</span></ui-select-choices></ui-select></ui-select-wrap>',
                    editDropdownOptionsArray: lookup
                };                
            }

            function createMultiSelectColumnName(name, field, lookup) {
                return {
                    name: name,
                    field: field,
                    width: 200,
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{ COL_FIELD.join(\', \') }}</div>',
                    editableCellTemplate: ' <ui-select-wrap>&nbsp;<ui-select style="width: 80%" multiple ng-model="MODEL_COL_FIELD" theme="select2" ng-disabled="disabled" append-to-body="true"><ui-select-match placeholder="Choose...">{{ $item }}</ui-select-match><ui-select-choices repeat="item in col.colDef.editDropdownOptionsArray | filter: $select.search"><span>{{ item }}</span></ui-select-choices></ui-select></ui-select-wrap>',
                    editDropdownOptionsArray: lookup
                };                
            }

            function initAuthorityandRegulation() {
                //call service
                crudService.GET(apiUrl + "GetAuthorityRegulationLookup/", {}, getAuthorityRegulationLookups_Completed);

                //service callback
                function getAuthorityRegulationLookups_Completed(response) {
                    if (response) {
                        if (response.Success === true) {
                            var lookups = {
                                regulatoryauthorityLookup: response.Data.AuthorityList,
                                sectorLookup: response.Data.Sectors,
                                complianceprogramLookup: response.Data.CertificateSchemes
                            }
                            svc.authorityCountryLookup = response.Data.Countries
                        }
                    }

                    initAuthorityREgulationColumns();
                    //under service callback initAuthorityandRegulationColumns()
                    function initAuthorityREgulationColumns() {
                        var regulatoryAuthorityDropdown = {
                            dropDownArray: lookups.regulatoryauthorityLookup,
                            dropDownId: 'RegulatoryAuthorityId',
                            dropDownLabel: 'Name'
                        }

                        var sectorDropdown = {
                            dropDownArray: lookups.sectorLookup,
                            dropDownId: 'CoveredSectorId',
                            dropDownLabel: 'CoveredSector'
                        }

                        var complianceProgramDropdown = {
                            dropDownArray: lookups.complianceprogramLookup,
                            dropDownId: 'SchemaId',
                            dropDownLabel: 'SchemaName'
                        }

                        authorityRegulationColumns.push(createNewColumn('RegulatoryAuthorityId', 'Regulatory Authority', '200', true, regulatoryAuthorityDropdown));
                        authorityRegulationColumns.push(createNewColumn('RegulationName', 'Regulation Name', '200'));
                        authorityRegulationColumns.push(createNewColumn('CertificateSchemeId', 'Compliance Program', '200', true, complianceProgramDropdown));
                        authorityRegulationColumns.push(createNewColumn('CoveredSectorId', 'Regulatory Category', '200', true, sectorDropdown));
                        authorityRegulationColumns.push({ name: ' ', width: '550', enableSorting: false, enableColumnMenu: false, enableCellEdit: false });

                        //authorityRegulationColumns.push({ name: 'Edit', width: '70', cellTemplate: '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.toggleEdit(2,row.entity)" style="cursor: pointer; padding-left:18px;"></a>', enableSorting: false, enableColumnMenu: false });
                        if (globalUtility.ContentAdmin) {
                            authorityRegulationColumns.push({ name: 'Delete', width: '70', cellTemplate: '<i class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.showDeleteAuthorityAndRegulation(row.entity)"></i>', enableSorting: false, enableColumnMenu: false });
                        }
                    }
                }
            }

            function initCountryInfo() {
                crudService.GET(apiUrl + "GetCountryInformationLookup/", {}, getCountryInfoLookups_Completed);                

                ////////////

                function getCountryInfoLookups_Completed(response) {
                    if (response) {
                        if (response.Success === true) {
                            var lookups = {
                                regionLookup: response.Data.Regions,
                                countryLookup: response.Data.Countries,
                                economicUnionLookup: response.Data.UnionList,
                                plugTypeLookup: response.Data.DevicePlugTypes,
                                ieceeLookup: response.Data.IECEEMembers,
                                sarParts: response.Data.SARParts
                            }
                        }
                    }

                    initCountryInfoColumns();

                    ////////////

                    function initCountryInfoColumns() {
                        var regionDropdown = {
                            dropDownArray: lookups.regionLookup,
                            dropDownId: 'RegionId',
                            dropDownLabel: 'RegionName'
                        }

                        var countryDropdown = {
                            dropDownArray: lookups.countryLookup,
                            dropDownId: 'CountryItemId',
                            dropDownLabel: 'CountryName'
                        }

                        var economicUnionDropdown = {
                            dropDownArray: lookups.economicUnionLookup,
                            dropDownId: 'CountryTradeGroupId',
                            dropDownLabel: 'Name'
                        }

                        var plugTypeDropdown = {
                            dropDownArray: lookups.plugTypeLookup,
                            dropDownId: 'DevicePlugTypeId',
                            dropDownLabel: 'Name'
                        }

                        var ieceeDropdown = {
                            dropDownArray: lookups.ieceeLookup,
                            dropDownId: 'ApplicableResponseTypeId',
                            dropDownLabel: 'Name'
                        }

                        //countryInfoColumns.push(createNewColumn(''))
                        countryInfoColumns.push(createNewColumn('RegulatoryCountryInformationId', 'Id', '100', false));
                        countryInfoColumns.push(createNewColumn('Region', 'Region', '100', true, regionDropdown));
                        //svc.countryInfoColumns.push(createNewColumn('GeoCountryItemId', 'Country', '150', true, countryDropdown));
                        countryInfoColumns.push({
                            //field: 'GeoCountryItemId',
                            name: 'CountryName',
                            width: 200,                            
                            cellTemplate: '<div class="ui-grid-cell-contents"> {{ COL_FIELD.join(\', \') }}</div>',
                            editableCellTemplate: ' <ui-select-wrap>&nbsp;<ui-select style="width: 80%" multiple ng-model="MODEL_COL_FIELD" theme="select2" ng-disabled="disabled" append-to-body="true"><ui-select-match placeholder="Choose...">{{ $item }}</ui-select-match><ui-select-choices repeat="item in col.colDef.editDropdownOptionsArray | filter: $select.search"><span>{{ item }}</span></ui-select-choices></ui-select></ui-select-wrap>',
                            editDropdownOptionsArray: countryDropdown.dropDownArray.map(function (c) { return c.CountryName })
                        });

                        //countryInfoColumns.push(createNewColumn('sds', 'Regional Economic Union', '150', true, economicUnionDropdown));
                        countryInfoColumns.push(createNewColumn('RegionalEconomicUnion', 'Regional Economic Union', '150', true, economicUnionDropdown));
                        countryInfoColumns.push(createNewColumnWithMaxLength('Voltage', 'Voltage/V', '100', true, 15));
                        countryInfoColumns.push(createNewColumnWithMaxLength('Frequency', 'Frequency/Hz', '150', true, 15));
                        //countryInfoColumns.push(createNewColumn('DevicePlugType', 'Plug Type', '100', true, plugTypeDropdown));
                        countryInfoColumns.push(createMultiSelectColumn('DevicePlugType', lookups.plugTypeLookup.map(function (s) { return s.Name })));                            
                        countryInfoColumns.push(createNewColumn('IEEEMembershipType', 'IECEE Membership of the Country', '150', true, ieceeDropdown));
                        countryInfoColumns.push(createNewColumn('BandInformation', 'Band Information (Cellular)', '100'));
                        countryInfoColumns.push(createNewColumn('Carrier', 'Carrier (Cellular)', '150'));
                        countryInfoColumns.push(createNewColumn('SARLimit', 'SAR Limits', '100'));
                        //countryInfoColumns.push(createNewColumn('SARPart', 'SAR Parts', '100'));
                        countryInfoColumns.push(createMultiSelectColumn('SARPart',lookups.sarParts.map(function (s) { return s.Name })));

                        //svc.countryInfoColumns.push({ name: 'Edit', width: '100', cellTemplate: '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.toggleEdit(1,row.entity)" style="cursor: pointer; padding-left:18px;"></a>', enableSorting: false, enableColumnMenu: false, enableCellEdit: false });
                        if (globalUtility.ContentAdmin) {
                            countryInfoColumns.push({ name: 'Delete', width: '100', cellTemplate: '<i class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.showDeleteCountryInfo(row.entity)"></i>', enableSorting: false, enableColumnMenu: false, enableCellEdit: false });
                        }
                        
                    }
                }
            }

            function initComplianceProgram() {
                crudService.GET(apiUrl + "GetComplianceProgramLookup/", {}, getComplianceProgramLookups_Completed);

                ////////////

                function getComplianceProgramLookups_Completed(response) {
                    if (response) {
                        if (response.Success === true) {
                            var lookups = {
                                uniqueLookup: response.Data.RegulationList,
                                certificateOrganizationLookup: response.Data.OrganizationList,
                                complianceModelLookup: response.Data.ComplianceModels,
                                scopedProductListLookup: response.Data.ScopedProductList,
                                exceptionsLookup: response.Data.ExceptionList,
                                certificateLimitationLookup: response.Data.CertificateLimitationList,
                                modularApprovalLookup: response.Data.ModularApprovalList,
                                localRepresentativeLookup: response.Data.LocalRepresentativeList,
                                localRepServiceLookup: response.Data.LocalRepServiceList,
                                markingRequirementLookup: response.Data.MarkingRequirementList,
                                manualRequirementLookup: response.Data.ManualRequirementList,
                                electronicLabelAcceptedLookup: response.Data.ElectronicLabelAcceptedList,
                                certificateMaintenanceLookup: response.Data.CertificateMaintenanceList,
                                factoryInspectionLookup: response.Data.FactoryInspectionTypeList,
                                webPublicationProductDetailLookup: response.Data.WebPublicationOfProductDetailsList,
                                publishedContentsLookup: response.Data.PublishedContentList,
                                publicationTimingLookup: response.Data.PublicationTimingList,
                                shortTermConfidentialPolicyLookup: response.Data.ShortTermConfidentialPolicyList
                            }
                        }                        
                    }

                    initComplianceProgramColumns();

                    ////////////

                    function initComplianceProgramColumns() {
                        var uniqueIdDropdown = {
                            dropDownArray: lookups.uniqueLookup,
                            dropDownId: 'RegulationUniqueId',
                            dropDownLabel: 'RegulationUniqueId'
                        }
                        var certificateOrganizationDropdown = {
                            dropDownArray: lookups.certificateOrganizationLookup,
                            dropDownId: 'OrganizationId',
                            dropDownLabel: 'OrganizationName'
                        }
                        var complianceModelDropdown = {
                            dropDownArray: lookups.complianceModelLookup,
                            dropDownId: 'ComplianceModelId',
                            dropDownLabel: 'ComplianceModelName'
                        }
                        var scopedProductListDropdown = {
                            dropDownArray: lookups.scopedProductListLookup,
                            dropDownId: 'ScopedProductId',
                            dropDownLabel: 'Name'
                        }
                        var exceptionsDropdown = {
                            dropDownArray: lookups.exceptionsLookup,
                            dropDownId: 'ExceptionId',
                            dropDownLabel: 'Name'
                        }
                        var certificateLimitationDropdown = {
                            dropDownArray: lookups.certificateLimitationLookup,
                            dropDownId: 'Id',
                            dropDownLabel: 'Description'
                        }
                        var modularApprovalDropdown = {
                            dropDownArray: lookups.modularApprovalLookup,
                            dropDownId: 'ModularApprovalId',
                            dropDownLabel: 'ModularApprovalName'
                        }
                        var localRepresentativeDropdown = {
                            dropDownArray: lookups.localRepresentativeLookup,
                            dropDownId: 'LocalRepresentativeId',
                            dropDownLabel: 'LocalRepresentativeName'
                        }
                        var localRepServiceDropdown = {
                            dropDownArray: lookups.localRepServiceLookup,
                            dropDownId: 'LocalRepresentativeServiceId',
                            dropDownLabel: 'LocalRepresentativeServiceName'
                        }
                        var markingRequirementDropdown = {
                            dropDownArray: lookups.markingRequirementLookup,
                            dropDownId: 'Id',
                            dropDownLabel: 'Description'
                        }
                        var manualRequirementDropdown = {
                            dropDownArray: lookups.manualRequirementLookup,
                            dropDownId: 'ManualRequirementId',
                            dropDownLabel: 'Name'
                        }
                        var electronicLabelAcceptedDropdown = {
                            dropDownArray: lookups.electronicLabelAcceptedLookup,
                            dropDownId: 'ElectronicLabelAcceptedId',
                            dropDownLabel: 'Name'
                        }
                        var certificateMaintenanceDropdown = {
                            dropDownArray: lookups.certificateMaintenanceLookup,
                            dropDownId: 'CertificateMaintenanceId',
                            dropDownLabel: 'Name'
                        }
                        var factoryInspectionDropdown = {
                            dropDownArray: lookups.factoryInspectionLookup,
                            dropDownId: 'FactoryInspectionTypeId',
                            dropDownLabel: 'Name'
                        }
                        var webPublicationProductDetailDropdown = {
                            dropDownArray: lookups.webPublicationProductDetailLookup,
                            dropDownId: 'WebPublicationOfProductId',
                            dropDownLabel: 'Name'
                        }
                        var publishedContentsDropdown = {
                            dropDownArray: lookups.publishedContentsLookup,
                            dropDownId: 'PublishedContentId',
                            dropDownLabel: 'Name'
                        }
                        var publicationTimingDropdown = {
                            dropDownArray: lookups.publicationTimingLookup,
                            dropDownId: 'PublicationTimingId',
                            dropDownLabel: 'Name'
                        }
                        var shortTermConfidentialPolicyDropdown = {
                            dropDownArray: lookups.shortTermConfidentialPolicyLookup,
                            dropDownId: 'ShortTermConfidentialPolicyId',
                            dropDownLabel: 'Name'
                        }
                            
                        complianceProgramColumns.push(createNewColumn('ComplianceProgramId', 'ID', '100', false));
                        complianceProgramColumns.push(createNewColumn('Name', 'Unique ID', '100', true, uniqueIdDropdown));
                        complianceProgramColumns.push({
                            name: 'Mark',
                            width: '150',                            
                            enableSorting: false,
                            enableColumnMenu: false,
                            enableCellEdit: false,
                            cellTemplate: 
                                        '<div>' +
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
                                        '</div>' 
                        });
                        complianceProgramColumns.push(createNewColumn('CertificateOrganisationId', 'Certification Organization', '150', true, certificateOrganizationDropdown));
                        //complianceProgramColumns.push(createNewColumn('ComplianceModelId', 'Deliverable', '150', true, complianceModelDropdown));
                        complianceProgramColumns.push(createMultiSelectColumn('ComplianceModelId', lookups.complianceModelLookup.map(function (s) { return s.ComplianceModelName })));
                        complianceProgramColumns.push(createNewColumn('ScopedProductListLink', 'Scoped Product List', '150'));
                        complianceProgramColumns.push(createNewColumn('ExceptionsTypeId', 'Exemptions', '100', true, exceptionsDropdown));
                        complianceProgramColumns.push(createNewColumn('ExceptionsLink', 'Exemptions List', '150'));
                        complianceProgramColumns.push(createNewColumn('SupplementInformationOfExceptions', 'Supplement Information of Exemptions', '150'));
                        //complianceProgramColumns.push(createNewColumn('CertificateLimitationTypeId', 'Certification Limitation', '150', true, certificateLimitationDropdown));
                        complianceProgramColumns.push(createMultiSelectColumn('CertificateLimitationType', lookups.certificateLimitationLookup.map(function (s) { return s.Description })));
                        complianceProgramColumns.push(createNewColumn('ModularApprovalTypeId', 'Modular Approval', '150', true, modularApprovalDropdown));
                        complianceProgramColumns.push(createNewColumn('LocalRepresentativeTypeId', 'Local Representative', '150', true, localRepresentativeDropdown));
                        complianceProgramColumns.push(createNewColumn('LocalServiceTypeId', 'Local Rep Service', '150', true, localRepServiceDropdown));
                        complianceProgramColumns.push(createNewColumn('MarkRequirementTypeId', 'Marking Requirement', '150', true, markingRequirementDropdown));
                        complianceProgramColumns.push(createNewColumn('ManualRequirementTypeId', 'Manual Requirement', '150', true, manualRequirementDropdown));                        
                        complianceProgramColumns.push({
                            name: 'DetailsOfMarkingName',
                            width: '150',                            
                            enableSorting: false,
                            enableColumnMenu: false,
                            enableCellEdit: false,
                            cellTemplate:
                                        '<div>' +
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
                                        '</div>'
                        });
                        complianceProgramColumns.push(createNewColumn('ElectronicLabelTypeId', 'Electronic Label Accepted', '150', true, electronicLabelAcceptedDropdown));
                        //complianceProgramColumns.push(createNewColumn('CertificateMaintenanceTypeId', 'Certificate Maintenance', '150', true, certificateMaintenanceDropdown));
                        complianceProgramColumns.push(createMultiSelectColumn('CertificateMaintenanceType', lookups.certificateMaintenanceLookup.map(function (s) { return s.Name })));
                        complianceProgramColumns.push(createNewColumn('InitialFactoryInspectionTypeId', 'Initial Factory Inspection', '150', true, factoryInspectionDropdown));
                        complianceProgramColumns.push(createNewColumn('WebPublicationOfProductTypeId', 'Web Publication', '150', true, webPublicationProductDetailDropdown));
                        complianceProgramColumns.push(createNewColumn('WebAddress', 'Web Address', '150'));
                        //complianceProgramColumns.push(createNewColumn('PublishedContentTypeId', 'Published Contents', '150', true, publishedContentsDropdown));
                        complianceProgramColumns.push(createMultiSelectColumn('PublishedContentType', lookups.publishedContentsLookup.map(function (s) { return s.Name })));
                        complianceProgramColumns.push(createNewColumn('PublicationTimingTypeId', 'Publication Timing', '150', true, publicationTimingDropdown));
                        complianceProgramColumns.push(createNewColumn('ShortTermConfidentialityTypeId', 'Short Term Confidential Policy', '150', true, shortTermConfidentialPolicyDropdown));

                        //complianceProgramColumns.push({ name: 'Edit', width: '70', cellTemplate: '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.toggleEdit(4,row.entity)" style="cursor: pointer; padding-left:18px;"></a>', enableSorting: false, enableColumnMenu: false });
                        if (globalUtility.ContentAdmin) {
                            complianceProgramColumns.push({ name: 'Delete', width: '70', cellTemplate: '<i class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.showDeleteComplianceProgram(row.entity)"></i>', enableSorting: false, enableColumnMenu: false });
                        }
                    }
                }
                //crudService.GET(apiUrl + "GetSourceDocuments/", {}, getSourceDocuments_Completed);
                //////////
                //function getSourceDocuments_Completed(response) {
                //    if (response) {
                //        if (response.IsSuccess === true) {
                //                if (response.RegulatoryComplianceProgramDocumentPath.MarkFile.length == 0) {
                //                    dialogService.Dialog.Alert("No Document Found!", enums.MessageType.Success);
                //                }
                //            }
                //        }

                //}
            }

            function initFrequencyandTechnology() {
                //call service
                crudService.GET(apiUrl + "GetRegulatoryFrequencyTechnologyLookup/", {}, getRegulatoryFrequencyTechnologyLookups_Completed);

                //service callback
                function getRegulatoryFrequencyTechnologyLookups_Completed(response) {
                    if (response) {
                        if (response.Success === true) {
                            var lookups = {
                                freqTechLookup: response.Data.FrequencyTechnologyList,
                                unitLookup: response.Data.UnitTypeList,
                                dfsLookup: response.Data.DFSList,
                                tpcLookup: response.Data.TPCList,
                                indoorUseOnlyLookup: response.Data.IndoorUseList
                            }
                            svc.freqtechCountryLookup = response.Data.Countries;
                        }
                    }

                    initRegulatoryFrequencyTechnologyColumns();
                    
                    //under service callback initFrequencyandTechnologyColumns()
                    function initRegulatoryFrequencyTechnologyColumns() {
                        var frequencyTechnologyDropdown = {
                            dropDownArray: lookups.freqTechLookup,
                            dropDownId: 'FrequencyTechId',
                            dropDownLabel: 'FrequencyTechName'
                        }

                        var unitDropdown = {
                            dropDownArray: lookups.unitLookup,
                            dropDownId: 'FrequencyTechnologyUnitTypeid',
                            dropDownLabel: 'Name'
                        }

                        var dfsDropdown = {
                            dropDownArray: lookups.dfsLookup,
                            dropDownId: 'ApplicableResponseTypeId',
                            dropDownLabel: 'Name'
                        }

                        var tpcDropdown = {
                            dropDownArray: lookups.tpcLookup,
                            dropDownId: 'ApplicableResponseTypeId',
                            dropDownLabel: 'Name'
                        }

                        var indoorUseOnlyDropdown = {
                            dropDownArray: lookups.indoorUseOnlyLookup,
                            dropDownId: 'ApplicableResponseTypeId',
                            dropDownLabel: 'Name'
                        }

                        frequencyTechnologyColumns.push(createNewColumn('FrequencyTechnlogyId', 'Frequency and Technology', '100', true, frequencyTechnologyDropdown));
                        frequencyTechnologyColumns.push(createNewColumn('FrequencyRangeLower', 'RF Range - Lower', '150'));
                        frequencyTechnologyColumns.push(createNewColumn('FrequencyRangeUpper', 'RF Range - Upper', '150'));
                        frequencyTechnologyColumns.push(createNewColumn('FrequencyTechnologyUnitTypeId', 'Unit', '100', true, unitDropdown));
                        frequencyTechnologyColumns.push(createNewColumn('OperatingFrequencyChannel', 'Operating Frequency and Channel', '150'));
                        frequencyTechnologyColumns.push(createNewColumn('OutputPower', 'Output Power', '150'));
                        frequencyTechnologyColumns.push(createNewColumn('PowerDensity', 'Power Density', '150'));
                        frequencyTechnologyColumns.push(createNewColumn('ChannelSpacing', 'Channel Spacing', '150'));
                        frequencyTechnologyColumns.push(createNewColumn('Bandwidth', 'Bandwidth', '100'));
                        frequencyTechnologyColumns.push(createNewColumn('DutyCycle', 'Duty Cycle etc.', '150'));
                        frequencyTechnologyColumns.push(createNewColumn('DFSApplicableTypeId', 'DFS', '50', true, dfsDropdown));
                        frequencyTechnologyColumns.push(createNewColumn('TPCApplicableTypeId', 'TPC', '50', true, tpcDropdown));
                        frequencyTechnologyColumns.push(createNewColumn('IndoorUseOnlyApplicableTypeId', 'Indoor Use Only', '100', true, indoorUseOnlyDropdown));

                        //frequencyTechnologyColumns.push({ name: 'Edit', width: '70', cellTemplate: '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.toggleEdit(3,row.entity)" style="cursor: pointer; padding-left:18px;"></a>', enableSorting: false, enableColumnMenu: false });
                        if (globalUtility.ContentAdmin) {
                            frequencyTechnologyColumns.push({ name: 'Delete', width: '70', cellTemplate: '<i class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.showDeleteFrequencyAndTechnology(row.entity)"></i>', enableSorting: false, enableColumnMenu: false });
                        }
                    }
                }
            }

            function initScopeandStandards() {
                //call service
                crudService.GET(apiUrl + "GetRegulatoryScopeStandardLookup/", {}, getScopeStandardsLookups_Completed);

                //service callback
                function getScopeStandardsLookups_Completed(response) {
                    if (response) {
                        if (response.Success === true) {
                            var lookups = {
                                productTypeLookup: response.Data.ProductTypeList,
                                productSubTypeLookup: response.Data.ProductSubTypeList,
                                powerSourceLookup: response.Data.PowerSourceList,
                                frequencyTechnologyLookup: response.Data.FrequencyTechnologyList,
                                sectorLookup: response.Data.SectorList,
                                scopeLookup: response.Data.ScopeWirelessList,
                                acceptedTestReportLookup: response.Data.AcceptedTestTypeList,
                                initialFactorInspectionLookup: response.Data.FactoryInspectionTypeList,
                                technicalStandardLookup: response.Data.StandardList
                            }
                            svc.scopeStandardsCountryLookup = response.Data.CountryList;
                            svc.scopeStandardsComplianceProgramLookup = response.Data.ComplianceProgramList;
                        }
                    }

                    initScopeStandardsColumns();

                    //under service callback initFrequencyandTechnologyColumns()
                    function initScopeStandardsColumns() {
                        var productTypeDropdown = {
                            dropDownArray: lookups.productTypeLookup,
                            dropDownId: 'ProductTypeId',
                            dropDownLabel: 'ProductName'
                        }

                        var productSubTypeDropdown = {
                            dropDownArray: lookups.productSubTypeLookup,
                            dropDownId: 'ProductSubTypeId',
                            dropDownLabel: 'ProductSubTypeName'
                        }

                        var powerSourceDropdown = {
                            dropDownArray: lookups.powerSourceLookup,
                            dropDownId: 'Id',
                            dropDownLabel: 'Description'
                        }

                        var frequencyTechnologyDropdown = {
                            dropDownArray: lookups.frequencyTechnologyLookup,
                            dropDownId: 'FrequencyTechId',
                            dropDownLabel: 'FrequencyTechName'
                        }

                        var sectorDropdown = {
                            dropDownArray: lookups.sectorLookup,
                            dropDownId: 'CoveredSectorId',
                            dropDownLabel: 'CoveredSector'
                        }

                        var scopeDropdown = {
                            dropDownArray: lookups.scopeLookup,
                            dropDownId: 'ScopeId',
                            dropDownLabel: 'Description'
                        }

                        var acceptedTestReportDropdown = {
                            dropDownArray: lookups.acceptedTestReportLookup,
                            dropDownId: 'AcceptedTestTypeId',
                            dropDownLabel: 'Name'
                        }

                        var initialFactorInspectionDropdown = {
                            dropDownArray: lookups.initialFactorInspectionLookup,
                            dropDownId: 'FactoryInspectionTypeId',
                            dropDownLabel: 'Name'
                        }
                        var technicalStandardDropdown = {
                            dropDownArray: lookups.technicalStandardLookup,
                            dropDownId: 'RegulatoryStandardTechnicalStandardId',
                            dropDownLabel: 'Name'
                        }

                        scopeStandardsColumns.push(createNewColumn('ProductTypeId', 'Product Type', '150', true, productTypeDropdown));
                        scopeStandardsColumns.push(createNewColumn('ProductSubTypeId', 'Product SubType (S) Freq & Tech (W)', '150', true, productSubTypeDropdown));
                        scopeStandardsColumns.push(createNewColumn('PowerSourceTypeId', 'Power Source', '150', true, powerSourceDropdown));
                        scopeStandardsColumns.push(createNewColumn('FrequencyTechnologyId', 'Frequency and Technology', '150', true, frequencyTechnologyDropdown));
                        scopeStandardsColumns.push(createNewColumn('CoveredSectorId', 'Regulatory Category', '100', true, sectorDropdown));
                        scopeStandardsColumns.push(createNewColumn('RegulatoryStandardWirelessScopeTypeId', 'Scope', '100', true, scopeDropdown));
                        //scopeStandardsColumns.push(createNewColumn('AcceptedTestTypeId', 'Accepted Test Reports', '150', true, acceptedTestReportDropdown));                        
                        scopeStandardsColumns.push(createMultiSelectColumnName('AcceptedTestType','AcceptedTestTypeId', lookups.acceptedTestReportLookup.map(function (s) { return s.Name })));
                        scopeStandardsColumns.push(createNewColumn('TestingOrganisation', 'Testing Organization', '150'));
                        scopeStandardsColumns.push(createNewColumn('RegulatoryStandardTechnicalStandardId', 'Technical Standard', '150', true, technicalStandardDropdown));

                        //scopeStandardsColumns.push({ name: 'Edit', width: '70', cellTemplate: '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.toggleEdit(5,row.entity)" style="cursor: pointer; padding-left:18px;"></a>', enableSorting: false, enableColumnMenu: false });
                        if (globalUtility.ContentAdmin) {
                            scopeStandardsColumns.push({ name: 'Delete', width: '70', cellTemplate: '<i class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.showDeleteScopeStandards(row.entity)"></i>', enableSorting: false, enableColumnMenu: false });
                        }
                    }
                }
            }

            function initTestingandValidity() {
                //call service
                crudService.GET(apiUrl + "GetTestingValidityLookup/", {}, getTestingValidityLookups_Completed);

                ////////////

                function getTestingValidityLookups_Completed(response) {
                    if (response) {
                        if (response.Success === true) {
                            var lookups = {
                                sectorLookup: response.Data.SectorList,
                                applicationTypeLookup: response.Data.AppTypeList,
                                sampleRequirementLookup: response.Data.SampleRequirementList,
                                inCountryTestingLookup: response.Data.InCountryTestingList,
                            }

                            svc.countryLookup = response.Data.CountryList;
                            svc.complianceProgramLookup = response.Data.ComplianceProgramList;
                        }
                    }

                    initTestingValidityColumns();

                    ////////////

                    function initTestingValidityColumns() {
                        var sectorDropdown = {
                            dropDownArray: lookups.sectorLookup,
                            dropDownId: 'CoveredSectorId',
                            dropDownLabel: 'CoveredSector'
                        }

                        var appTypeDropdown = {
                            dropDownArray: lookups.applicationTypeLookup,
                            dropDownId: 'ApplicationTypeId',
                            dropDownLabel: 'ApplicationTypeName'
                        }

                        var sampleRequirementDropdown = {
                            dropDownArray: lookups.sampleRequirementLookup,
                            dropDownId: 'SampleRequirementId',
                            dropDownLabel: 'SampleRequirementName'
                        }

                        var inCountryTestingDropdown = {
                            dropDownArray: lookups.inCountryTestingLookup,
                            dropDownId: 'InCountryTestingId',
                            dropDownLabel: 'InCountryTestingName'
                        }

                        testingValidityColumns.push(createNewColumn('RegulatoryTestingAndValidityId', 'Id', '150', false));
                        testingValidityColumns.push(createNewColumn('CoveredSectorId', 'Regulatory Category', '150', true, sectorDropdown));
                        testingValidityColumns.push(createNewColumn('RegulatoryApplicationTypeId', 'Application Type', '200', true, appTypeDropdown));

                        testingValidityColumns.push(createNewColumn('SampleRequirementTypeId', 'Sample Requirement', '150', true, sampleRequirementDropdown));
                        testingValidityColumns.push(createNewColumn('InCountryTestingTypeId', 'In-Country Testing', '150', true, inCountryTestingDropdown));

                        testingValidityColumns.push(createNewColumn('CertificateValidityPeriod', 'Certificate Validity Period', '200'));
                        testingValidityColumns.push(createNewColumn('LeadTime', 'Lead Time (Certification)', '200'));
                        testingValidityColumns.push({ name: ' ', width: '300', enableSorting: false, enableColumnMenu: false, enableCellEdit: false });

                        //testingValidityColumns.push({ name: 'Edit', width: '70', cellTemplate: '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.toggleEdit(6,row.entity)" style="cursor: pointer; padding-left:18px;"></a>', enableSorting: false, enableColumnMenu: false });
                        if (globalUtility.ContentAdmin) {
                            testingValidityColumns.push({ name: 'Delete', width: '70', cellTemplate: '<i class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.showDeleteTestingValidity(row.entity)"></i>', enableSorting: false, enableColumnMenu: false });
                        }
                    }
                }
            }
        }

        function initRefinerList() {
            svc.refinerList = [
                {
                    parent: 'REGULATORY CATEGORY',
                    length: function (data) { return data.Sectors.length },
                    data: function (data) { return data.Sectors },
                    refinerType: refinerType.Sector,
                    Id: function (item) { return item.CoveredSectorId },
                    name: function (item) { return item.CoveredSector },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedSector }
                },
                {
                    parent: 'PRODUCT TYPE',
                    length: function (data) { return data.ProductTypes.length },
                    data: function (data) { return data.ProductTypes },
                    refinerType: refinerType.ProductType,
                    Id: function (item) { return item.ProductTypeId },
                    name: function (item) { return item.ProductName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedProductType }
                },
                {
                    parent: 'PRODUCT SUB TYPE',
                    length: function (data) { return data.ProductSubTypes.length },
                    data: function (data) { return data.ProductSubTypes },
                    refinerType: refinerType.ProductSubType,
                    Id: function (item) { return item.ProductSubTypeId },
                    name: function (item) { return item.ProductSubTypeName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedProductSubType }
                },
                {
                    parent: 'POWER SOURCE',
                    length: function (data) { return data.PowerSources.length },
                    data: function (data) { return data.PowerSources },
                    refinerType: refinerType.PowerSource,
                    Id: function (item) { return item.NewSourceId },
                    name: function (item) { return item.NewSourceDescription },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedPowerSource }
                },
                {
                    parent: 'FREQUENCY AND TECHNOLOGY',
                    length: function (data) { return data.FrequencyTechnologies.length },
                    data: function (data) { return data.FrequencyTechnologies },
                    refinerType: refinerType.FrequencyAndTechnology,
                    Id: function (item) { return item.FrequencyTechId },
                    name: function (item) { return item.FrequencyTechName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedFreqTech }
                },
                {
                    parent: 'APPLICATION TYPE',
                    length: function (data) { return data.ApplicationTypes.length },
                    data: function (data) { return data.ApplicationTypes },
                    refinerType: refinerType.ApplicationType,
                    Id: function (item) { return item.ApplicationTypeId },
                    name: function (item) { return item.ApplicationTypeName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedApplicationType }
                },
                {
                    parent: 'REGION',
                    length: function (data) { return data.Regions.length },
                    data: function (data) { return data.Regions },
                    refinerType: refinerType.Region,
                    Id: function (item) { return item.RegionId },
                    name: function (item) { return item.RegionName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedRegion }
                },
                {
                    parent: 'COUNTRY',
                    length: function (data) { return data.Countries.length },
                    data: function (data) { return data.Countries },
                    refinerType: refinerType.Country,
                    Id: function (item) { return item.CountryItemId },
                    name: function (item) { return item.CountryName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedCountry }
                },
                {
                    parent: 'COMPLIANCE PROGRAM',
                    length: function (data) { return data.CertificateOrganizations.length },
                    data: function (data) { return data.CertificateOrganizations },
                    refinerType: refinerType.ComplianceProgram,
                    Id: function (item) { return item.OrganizationId },
                    name: function (item) { return item.OrganizationName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedComplianceProgram }
                },
                {
                    parent: 'SCOPE',
                    length: function (data) { return data.MandatoryOrVoluntary.length },
                    data: function (data) { return data.MandatoryOrVoluntary },
                    refinerType: refinerType.Scope,
                    Id: function (item) { return item.MandatoryOrVoluntaryId },
                    name: function (item) { return item.MandatoryOrVoluntaryName },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedIsMandatory }
                },
                {
                    parent: 'ACCEPTED TEST REPORTS',
                    length: function (data) { return data.AcceptedTestReportsWireless.length },
                    data: function (data) { return data.AcceptedTestReportsWireless },
                    refinerType: refinerType.AcceptedTest,
                    Id: function (item) { return item.AcceptedTestReports_Wireless_Id },
                    name: function (item) { return item.AcceptedTestReports_Wireless_Name },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedAccepTestWireless }
                },
                {
                    parent: 'MODULAR APPROVAL',
                    length: function (data) { return data.ModularApproval.length },
                    data: function (data) { return data.ModularApproval },
                    refinerType: refinerType.ModularApproval,
                    Id: function (item) { return item.ModularApprovalId },
                    name: function (item) { return item.ModularApprovalName },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedModularApproval }
                },
                {
                    parent: 'CERTIFICATE LIMITATION',
                    length: function (data) { return data.CertificateLimitations.length },
                    data: function (data) { return data.CertificateLimitations },
                    refinerType: refinerType.CertificateLimitation,
                    Id: function (item) { return item.Id },
                    name: function (item) { return item.Description },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedCertLimit }
                },
                {
                    parent: 'SAMPLE REQUIREMENT',
                    length: function (data) { return data.SampleRequirementWireless.length },
                    data: function (data) { return data.SampleRequirementWireless },
                    refinerType: refinerType.SampleRequirement,
                    Id: function (item) { return item.SampleRequirement_Wireless_Id },
                    name: function (item) { return item.SampleRequirement_Wireless_Name },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedSampReqWireless }
                },
                {
                    parent: 'IN-COUNTRY TESTING',
                    length: function (data) { return data.InCountryTestingWireless.length },
                    data: function (data) { return data.InCountryTestingWireless },
                    refinerType: refinerType.InCountryTesting,
                    Id: function (item) { return item.InCountryTesting_Wireless_Id },
                    name: function (item) { return item.InCountryTesting_Wireless_Name },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedICTWireless }
                },                
                {
                    parent: 'LOCAL REPRESENTATIVE',
                    length: function (data) { return data.LocalRepresentatives.length },
                    data: function (data) { return data.LocalRepresentatives },
                    refinerType: refinerType.LocalRepresentative,
                    Id: function (item) { return item.LocalRepresentativeId },
                    name: function (item) { return item.LocalRepresentativeName },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedLocalRep }
                },
                {
                    parent: 'LOCAL REP SERVICE',
                    length: function (data) { return data.LocalRepresentativeService.length },
                    data: function (data) { return data.LocalRepresentativeService },
                    refinerType: refinerType.LocalRepService,
                    Id: function (item) { return item.LocalRepresentativeServiceId },
                    name: function (item) { return item.LocalRepresentativeServiceName },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedLocalRepService }
                },
                {
                    parent: 'MARKING REQUIREMENT',
                    length: function (data) { return data.MarkingRequirements.length },
                    data: function (data) { return data.MarkingRequirements },
                    refinerType: refinerType.MarkingRequirement,
                    Id: function (item) { return item.Id },
                    name: function (item) { return item.Description },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedMarkingReq }
                },
                {
                    parent: 'CERTIFICATE VALIDITY PERIOD',
                    length: function (data) { return data.CertificateValidityPeriod.length },
                    data: function (data) { return data.CertificateValidityPeriod },
                    refinerType: refinerType.CertificateValidityPeriod,
                    Id: function (item) { return item.Id },
                    name: function (item) { return item.Description },
                    isOpen: false,
                    preselected: function (data) { return data.preselectedCertValidPeriod }
                }
            ];
        }

        function initWorkFlowRefinerList() {
            svc.workflowRefinerList = [
                {
                    parent: 'REGULATORY CATEGORY',
                    length: function (data) { return data.Sectors.length },
                    data: function (data) { return data.Sectors },
                    refinerType: refinerType.Sector,
                    Id: function (item) { return item.CoveredSectorId },
                    name: function (item) { return item.CoveredSector },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedSector }
                },
                {
                    parent: 'REGION',
                    length: function (data) { return data.Regions.length },
                    data: function (data) { return data.Regions },
                    refinerType: refinerType.Region,
                    Id: function (item) { return item.RegionId },
                    name: function (item) { return item.RegionName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedRegion }
                },
                {
                    parent: 'COUNTRY',
                    length: function (data) { return data.Countries.length },
                    data: function (data) { return data.Countries },
                    refinerType: refinerType.Country,
                    Id: function (item) { return item.CountryItemId },
                    name: function (item) { return item.CountryName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedCountry }
                },
                {
                    parent: 'COMPLIANCE PROGRAM',
                    length: function (data) { return data.CertificateOrganizations.length },
                    data: function (data) { return data.CertificateOrganizations },
                    refinerType: refinerType.ComplianceProgram,
                    Id: function (item) { return item.OrganizationId },
                    name: function (item) { return item.OrganizationName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedComplianceProgram }
                }
            ];
        }
    }]);

});