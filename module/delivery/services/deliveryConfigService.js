'use strict';

define([
    'app',
    'globalUtility'
], function (app, globalUtility) {

    app.register.factory('deliveryConfigService', ['crudService',
    function (crudService) {
        var refinerType = {};

        var svc = {
            refinerList: [],
            workFlowRefinerList: [],
            keywordRefiner: {}
        };

        init();

        return svc;

        ////////////

        function init() {
            initGlobalVariables();

            initRefinerList();

            initWorkFlowRefinerList();

            initKeywordRefiner();
        }

        function initGlobalVariables() {
            refinerType = {
                SectorsRegulated: 'CoveredSector',
                Country: 'Country',
                //FrequencyAndTechnology: 'FrequencyTech',
                //ProductType: 'ProductType',
                CertScheme: 'CertScheme',
                ApplicationType: 'ApplicationType',
                CertOrganization: 'CertOrg',
                MandatoryOrVoluntary: 'IsMandatory',
                AcceptedTestReports: 'AcceptedTestReports',
                ModularApproval: 'ModularApproval',                
                SampleRequirement: 'SampleRequirement',                
                InCountryTesting: 'InCountryTesting',
                LocalRepresentative: 'LocalRep',
                LocalRepresentativeService: 'LocalRepService',
                CertificateValidityPeriod: 'CertValidPeriod',
                PreferredChannel: 'PreferredChannel',
                ComplianceModel: 'ComplianceModel',                
                Region: 'Region',
                Keyword: "Keyword"
            };
        }

        function initRefinerList() {
            svc.refinerList = [
                {
                    parent: 'REGULATORY CATEGORY',
                    length: function (data) { return data.SectorsRegulated.length },
                    data: function (data) { return data.SectorsRegulated },
                    refinerType: refinerType.SectorsRegulated,
                    Id: function (item) { return item.SectorRegulatedId },
                    name: function (item) { return item.SectorRegulatedName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedSector }
                },
                //{
                //    parent: 'FREQUENCY AND TECHNOLOGY',
                //    length: function (data) { return data.FrequenciesAndTechnology.length },
                //    data: function (data) { return data.FrequenciesAndTechnology },
                //    refinerType: refinerType.FrequencyAndTechnology,
                //    Id: function (item) { return item.FrequencyTechId },
                //    name: function (item) { return item.FrequencyTechName },
                //    isOpen: true,
                //    preselected: function (data) { return data.preselectedFreqTech }
                //},
                //{
                //    parent: 'PRODUCT TYPE',
                //    length: function (data) { return data.ProductTypes.length },
                //    data: function (data) { return data.ProductTypes },
                //    refinerType: refinerType.ProductType,
                //    Id: function (item) { return item.ProductTypeId },
                //    name: function (item) { return item.ProductName },
                //    isOpen: true,
                //    preselected: function (data) { return data.preselectedProductType }
                //},
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
                    length: function (data) { return data.CompliancePrograms.length },
                    data: function (data) { return data.CompliancePrograms },
                    refinerType: refinerType.CertScheme,
                    Id: function (item) { return item.ComplianceProgramId },
                    name: function (item) { return item.ComplianceProgramName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedComplianceProgram }
                },
                {
                    parent: 'CERTIFICATION ORGANIZATION',
                    length: function (data) { return data.CertificationOrganizations.length },
                    data: function (data) { return data.CertificationOrganizations },
                    refinerType: refinerType.CertOrganization,
                    Id: function (item) { return item.CertificationOrganizationId },
                    name: function (item) { return item.CertificationOrganizationName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedCertOrg }
                },
                {
                    parent: 'MANDATORY OR VOLUNTARY',
                    length: function (data) { return data.MandatoryOrVoluntaryList.length },
                    data: function (data) { return data.MandatoryOrVoluntaryList },
                    refinerType: refinerType.MandatoryOrVoluntary,
                    Id: function (item) { return item.MandatoryOrVoluntaryId },
                    name: function (item) { return item.MandatoryOrVoluntaryName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedIsMandatory }
                },
                {
                    parent: 'ACCEPTED TEST REPORTS',
                    length: function (data) { return data.AcceptedTestReportsList.length },
                    data: function (data) { return data.AcceptedTestReportsList },
                    refinerType: refinerType.AcceptedTestReports,
                    Id: function (item) { return item.AcceptedTestReportsId },
                    name: function (item) { return item.AcceptedTestReportsName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedTestReport }
                },
                {
                    parent: 'MODULAR APPROVAL',
                    length: function (data) { return data.ModularApprovals.length },
                    data: function (data) { return data.ModularApprovals },
                    refinerType: refinerType.ModularApproval,
                    Id: function (item) { return item.ModularApprovalId },
                    name: function (item) { return item.ModularApprovalName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedModularApproval }
                },
                {
                    parent: 'SAMPLE REQUIREMENT',
                    length: function (data) { return data.SampleRequirementList.length },
                    data: function (data) { return data.SampleRequirementList },
                    refinerType: refinerType.SampleRequirement,
                    Id: function (item) { return item.SampleRequirementId },
                    name: function (item) { return item.SampleRequirementName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedSampleReqt }
                },
                {
                    parent: 'IN-COUNTRY TESTING',
                    length: function (data) { return data.InCountryTestingList.length },
                    data: function (data) { return data.InCountryTestingList },
                    refinerType: refinerType.InCountryTesting,
                    Id: function (item) { return item.InCountryTestingId },
                    name: function (item) { return item.InCountryTestingName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedInCountryTesting }
                },
                {
                    parent: 'LOCAL REPRESENTATIVE',
                    length: function (data) { return data.LocalRepresentatives.length },
                    data: function (data) { return data.LocalRepresentatives },
                    refinerType: refinerType.LocalRepresentative,
                    Id: function (item) { return item.LocalRepresentativeId },
                    name: function (item) { return item.LocalRepresentativeName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedLocalRep }
                },
                {
                    parent: 'LOCAL REPRESENTATIVE SERVICE',
                    length: function (data) { return data.LocalRepresentativeServices.length },
                    data: function (data) { return data.LocalRepresentativeServices },
                    refinerType: refinerType.LocalRepresentativeService,
                    Id: function (item) { return item.LocalRepresentativeServiceId },
                    name: function (item) { return item.LocalRepresentativeServiceName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedLocalRepService }
                },
                {
                    parent: 'CERTIFICATE VALIDITY PERIOD',
                    length: function (data) { return data.CertificateValidityPeriodList.length },
                    data: function (data) { return data.CertificateValidityPeriodList },
                    refinerType: refinerType.CertificateValidityPeriod,
                    Id: function (item) { return item.CertificateValidityPeriodId },
                    name: function (item) { return item.CertificateValidityPeriodName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedCertValidPeriod }
                },
                {
                    parent: 'PREFERRED CHANNEL',
                    length: function (data) { return data.PreferredChannels.length },
                    data: function (data) { return data.PreferredChannels },
                    refinerType: refinerType.PreferredChannel,
                    Id: function (item) { return item.PreferredChannelId },
                    name: function (item) { return item.PreferredChannelName },
                    isOpen: true,
                    preselected: function (data) { return [] }
                },
                {
                    parent: 'DELIVERABLE',
                    length: function (data) { return data.ComplianceModels.length },
                    data: function (data) { return data.ComplianceModels },
                    refinerType: refinerType.ComplianceModel,
                    Id: function (item) { return item.ComplianceModelId },
                    name: function (item) { return item.ComplianceModelName },
                    isOpen: true,
                    preselected: function (data) { return data.preselectedComplianceModel }
                }
            ];
        }
        function initWorkFlowRefinerList() {
            svc.workFlowRefinerList = [
                {
                    parent: 'REGULATORY CATEGORY',
                    length: function (data) { return data.SectorsRegulated.length },
                    data: function (data) { return data.SectorsRegulated },
                    refinerType: refinerType.SectorsRegulated,
                    Id: function (item) { return item.SectorRegulatedId },
                    name: function (item) { return item.SectorRegulatedName },
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
                    length: function (data) { return data.CompliancePrograms.length },
                    data: function (data) { return data.CompliancePrograms },
                    refinerType: refinerType.CertScheme,
                    Id: function (item) { return item.ComplianceProgramId },
                    name: function (item) { return item.ComplianceProgramName },
                    isOpen: true,
                    preselected: function (data) { return [] }
                }
            ];
        }

        function initKeywordRefiner() {
            svc.keywordRefiner = {
                parent: 'KEYWORD',
                length: function (data) { return; },
                data: function (data) { return; },
                refinerType: refinerType.Keyword,
                Id: function (item) { return; },
                name: function (item) { return; },
                isOpen: true,
                preselected: function (data) { return; }
            };
        }

    }]);

});
