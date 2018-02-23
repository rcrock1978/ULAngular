'use strict';

define([
    'app',
    'globalUtility',
    'enums'
], function (app, globalUtility, enums) {

    app.factory('homeConfigService', ['$filter',
        function ($filter) {
            var favoritesColumns = [];

            var svc = {
                apiUrl: 'api/home/',
                applicationTypeSettings: {},
                complianceSettings: {},
                favoritesGridConfig: {},
                freqTechSettings: {},
                powerSourceSettings: {},
                productTypeSettings: {},
                productSubTypeSettings:{},                            
                sectorSettings: {},
                customerSettings: {},
                crfCountrySettings: {},
                crfUnionSettings: {},
                crfSectorSettings: {},
                crfComplianceSettings: {},
                crfModuleSettings: {},
                refinerList: []
            };

            init();

            return svc;
           
            //////////////

            function createNewColumn(field, name, width, visible, dropDownSettings, enableCellEdit) {
                return {
                    field: field,
                    name: name,
                    width: width,
                    enableColumnMenu: false,
                    enableCellEdit: enableCellEdit === undefined ? true : enableCellEdit,
                    visible: visible !== undefined ? visible : true,
                    editableCellTemplate: dropDownSettings === undefined ? 'ui-grid/cellEditor' : 'ui-grid/dropdownEditor',
                    editDropdownOptionsArray: dropDownSettings !== undefined ? dropDownSettings.dropDownArray : '',
                    editDropdownIdLabel: dropDownSettings !== undefined ? dropDownSettings.dropDownId : '',
                    editDropdownValueLabel: dropDownSettings !== undefined ? dropDownSettings.dropDownLabel : '',
                    cellFilter: "griddropdown:this"
                }
            }

            function init() {
                //configure settings
                initSettings();

                initGlobalRefinerList();

                initGridColumns();

                initGridConfigs();
            }

            function initGlobalRefinerList() {
                svc.refinerList = [
                    {
                        refinerType: enums.RefinerType.AcceptedTestReports,
                        set: function (data) {
                            globalUtility.SelectedAcceptedTestReports = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.AcceptedTestReports;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedAcceptedTestReports.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.AcceptedTestReportsEMC,
                        set: function (data) {
                            globalUtility.SelectedAccepTestEMC = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.AcceptedTestReportsEMC;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedAccepTestEMC.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.AcceptedTestReportsSafety,
                        set: function (data) {
                            globalUtility.SelectedAccepTestSafety = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.AcceptedTestReportsSafety;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedAccepTestSafety.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.AcceptedTestReportsWireless,
                        set: function (data) {
                            globalUtility.SelectedAccepTestWireless = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.AcceptedTestReportsWireless;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedAccepTestWireless.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.ApplicationType,
                        set: function (data) {
                            globalUtility.SelectedApplicationType = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.ApplicationType;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedApplicationType.push({ ApplicationTypeId: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertBusinessStatus,
                        set: function (data) {
                            globalUtility.SelectedCertBusinessStatus = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertBusinessStatus;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCertBusinessStatus.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertificateLimitation,
                        set: function (data) {
                            globalUtility.SelectedCertLimit = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertificateLimitation;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCertLimit.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertificateValidityPeriod,
                        set: function (data) {
                            globalUtility.SelectedCertificateValidityPeriod = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertificateValidityPeriod;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCertificateValidityPeriod.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertificationOrganization,
                        set: function (data) {
                            globalUtility.SelectedCertificationOrganization = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertificationOrganization;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCertificationOrganization.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertOrganization,
                        set: function (data) {
                            globalUtility.SelectedCertOrg = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertOrganization;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCertOrg.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertOrganization,
                        set: function (data) {
                            globalUtility.SelectedCertOrg = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertOrganization;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCertOrg.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertScheme,
                        set: function (data) {
                            globalUtility.SelectedComplianceProgram = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertScheme;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedComplianceProgram.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertStatus,
                        set: function (data) {
                            globalUtility.SelectedCertStatus = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertStatus;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCertStatus.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CertValidPeriod,
                        set: function (data) {
                            globalUtility.SelectedCertValidPeriod = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CertValidPeriod;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCertValidPeriod.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.Company,
                        set: function (data) {
                            globalUtility.SelectedCustomer = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.Company;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCustomer.push({ id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.ComplianceModel,
                        set: function (data) {
                            globalUtility.SelectedComplianceModel = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.ComplianceModel;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedComplianceModel.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    //{
                    //    refinerType: enums.RefinerType.ComplianceProgram,
                    //    set: function (data) {
                    //        globalUtility.SelectedComplianceProgram = [];
                    //        var favItems = $filter('filter')(data, function (value, index) {
                    //            return value.RefinerType == enums.RefinerType.ComplianceProgram;
                    //        });

                    //        angular.forEach(favItems, function (favItem) {
                    //            globalUtility.SelectedComplianceProgram.push({ SchemaId: Number(favItem.RefinerValueId) });
                    //        });
                    //    }
                    //},
                    {
                        refinerType: enums.RefinerType.Country,
                        set: function (data) {
                            globalUtility.SelectedCountry = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.Country;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedCountry.push({ id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.CoveredSector,
                        set: function (data) {
                            globalUtility.SelectedSector = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.CoveredSector;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedSector.push({ CoveredSectorId: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.DocumentCategory,
                        set: function (data) {
                            globalUtility.SelectedDocumentType = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.DocumentCategory;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedDocumentType.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.EffectiveEndDateTime,
                        set: function (data) {
                            globalUtility.SelectedEffectiveEndDateTime = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.EffectiveEndDateTime;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedEffectiveEndDateTime.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.EffectiveStartDateTime,
                        set: function (data) {
                            globalUtility.SelectedEffectiveStartDateTime = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.EffectiveStartDateTime;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedEffectiveStartDateTime.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.ExpirationEndDateTime,
                        set: function (data) {
                            globalUtility.SelectedExpirationEndDateTime = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.ExpirationEndDateTime;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedExpirationEndDateTime.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.ExpirationStartDateTime,
                        set: function (data) {
                            globalUtility.SelectedExpirationStartDateTime = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.ExpirationStartDateTime;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedExpirationStartDateTime.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.FrequencyAndTechnology,
                        set: function (data) {
                            globalUtility.SelectedFreqTech = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.FrequencyAndTechnology;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedFreqTech.push({ FrequencyTechId: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.FrequencyTech,
                        set: function (data) {
                            globalUtility.SelectedFreqTech = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.FrequencyTech;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedFreqTech.push({ FrequencyTechId: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.InCountryTesting,
                        set: function (data) {
                            globalUtility.SelectedInCountryTesting = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.InCountryTesting;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedInCountryTesting.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.InCountryTestingEMC,
                        set: function (data) {
                            globalUtility.SelectedICTEMC = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.InCountryTestingEMC;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedICTEMC.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.InCountryTestingSafety,
                        set: function (data) {
                            globalUtility.SelectedICTSafety = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.InCountryTestingSafety;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedICTSafety.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.InCountryTestingWireless,
                        set: function (data) {
                            globalUtility.SelectedICTWireless = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.InCountryTestingWireless;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedICTWireless.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.IsMandatory,
                        set: function (data) {
                            globalUtility.SelectedIsMandatory = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.IsMandatory;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedIsMandatory.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.IssueEndDateTime,
                        set: function (data) {
                            globalUtility.SelectedIssueEndDateTime = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.IssueEndDateTime;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedIssueEndDateTime.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.IssueStartDateTime,
                        set: function (data) {
                            globalUtility.SelectedIssueStartDateTime = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.IssueStartDateTime;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedIssueStartDateTime.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.Keyword,
                        set: function (data) {
                            globalUtility.SelectedKeyword = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.Keyword;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedKeyword.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.LocalRep,
                        set: function (data) {
                            globalUtility.SelectedLocalRep = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.LocalRep;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedLocalRep.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.LocalRepresentative,
                        set: function (data) {
                            globalUtility.SelectedLocalRepresentative = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.LocalRepresentative;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedLocalRepresentative.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.LocalRepresentativeService,
                        set: function (data) {
                            globalUtility.SelectedLocalRepresentativeService = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.LocalRepresentativeService;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedLocalRepresentativeService.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.LocalRepService,
                        set: function (data) {
                            globalUtility.SelectedLocalRepService = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.LocalRepService;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedLocalRepService.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.MandatoryOrVoluntary,
                        set: function (data) {
                            globalUtility.SelectedMandatoryOrVoluntary = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.MandatoryOrVoluntary;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedMandatoryOrVoluntary.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.MarkingRequirement,
                        set: function (data) {
                            globalUtility.SelectedMarkingReq = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.MarkingRequirement;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedMarkingReq.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.ModularApproval,
                        set: function (data) {
                            globalUtility.SelectedModularApproval = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.ModularApproval;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedModularApproval.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.NewsSource,
                        set: function (data) {
                            globalUtility.SelectedNewsSource = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.NewsSource;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedNewsSource.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.OrganizationType,
                        set: function (data) {
                            globalUtility.SelectedOrganizationType = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.OrganizationType;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedOrganizationType.push({ OrganizationTypeId: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.PostedEndDateTime,
                        set: function (data) {
                            globalUtility.SelectedPostedEndDateTime = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.PostedEndDateTime;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedPostedEndDateTime.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.PostedStartDateTime,
                        set: function (data) {
                            globalUtility.SelectedPostedStartDateTime = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.PostedStartDateTime;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedPostedStartDateTime.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.PowerSource,
                        set: function (data) {
                            globalUtility.SelectedPowerSource = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.PowerSource;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedPowerSource.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.PreferredChannel,
                        set: function (data) {
                            globalUtility.SelectedPreferredChannel = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.PreferredChannel;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedPreferredChannel.push({ Id: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.ProductSubType,
                        set: function (data) {
                            globalUtility.SelectedProductSubType = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.ProductSubType;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedProductSubType.push({ ProductSubTypeId: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.ProductType,
                        set: function (data) {
                            globalUtility.SelectedProductType = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.ProductType;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedProductType.push({ ProductTypeId: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.Region,
                        set: function (data) {
                            globalUtility.SelectedRegion = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.Region;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedRegion.push({ RegionId: favItem.RefinerValueId });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.SampleRequirement,
                        set: function (data) {
                            globalUtility.SelectedSampleRequirement = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.SampleRequirement;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedSampleRequirement.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.SampleRequirementEMC,
                        set: function (data) {
                            globalUtility.SelectedSameReqEMC = [];
                            var favItems = $filter('filter') (data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.SampleRequirementEMC;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedSameReqEMC.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.SampleRequirementSafety,
                        set: function (data) {
                            globalUtility.SelectedSampReqSafety = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.SampleRequirementSafety;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedSampReqSafety.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.SampleRequirementWireless,
                        set: function (data) {
                            globalUtility.SelectedSampReqWireless = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.SampleRequirementWireless;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedSampReqWireless.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    },
                    {
                        refinerType: enums.RefinerType.ScopeWireless,
                        set: function (data) {
                            globalUtility.SelectedScopeWireless = [];
                            var favItems = $filter('filter')(data, function (value, index) {
                                return value.RefinerType == enums.RefinerType.ScopeWireless;
                            });

                            angular.forEach(favItems, function (favItem) {
                                globalUtility.SelectedScopeWireless.push({ Id: Number(favItem.RefinerValueId) });
                            });
                        }
                    }
                ];
            }

            function initGridColumns() {
                //var scopeLookup = [];
                //get list of scope from somewhere(if still required)
                //angular.forEach(globalUtility.Modules, function (obj) {
                //});

                //row id                
                favoritesColumns.push(createNewColumn('UserPreferenceFavoriteId', 'Id', '100', false));
                favoritesColumns.push(createNewColumn('ModuleName', 'Scope', '20%', true, undefined, false));
                favoritesColumns.push(createNewColumn('Name', 'Favorite', '35%', true));
                favoritesColumns.push({ name: 'Link', width: '20%', cellTemplate: '<a style="cursor: pointer" ng-click="grid.appScope.searchFavorite(row.entity)">View Favorite</a>', enableSorting: false, enableColumnMenu: false, enableCellEdit: false });
                favoritesColumns.push({ name: 'Delete', width: '15%', cellTemplate: '<i class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.deleteFavorite(row.entity)"></i>', enableSorting: false, enableColumnMenu: false, enableCellEdit: false });
            }

            function initGridConfigs() {
                svc.favoritesGridConfig = {
                    enableSorting: true,
                    enableColumnResizing: true,
                    columnDefs: favoritesColumns,
                    enableRowSelection: true,
                    enableSelectAll: false,
                    multiSelect: false,
                    data: []
                };
            }

            function initSettings() {
                svc.applicationTypeSettings = {
                    displayProp: 'ApplicationTypeName', idProp: 'ApplicationTypeId', externalIdProp: '', scrollableHeight: '250px', scrollable: true
                };
                svc.complianceSettings = {
                    displayProp: 'SchemaName', idProp: 'SchemaId', externalIdProp: '', scrollableHeight: '250px', scrollable: true
                };
                svc.countrySettings = {
                    //displayProp: 'CountryName', idProp: 'CountryItemId', -// remove to accomodate starts with search - jj
                    externalIdProp: '', scrollableHeight: '250px',
                    scrollable: true, enableSearch: true
                };
                svc.freqTechSettings = {
                    displayProp: 'FrequencyTechName', idProp: 'FrequencyTechId', externalIdProp: '', scrollableHeight: '250px', scrollable: true
                };
                svc.powerSourceSettings = {
                    displayProp: 'Description', idProp: 'Id', externalIdProp: '', scrollableHeight: '250px', scrollable: true
                };
                svc.productTypeSettings = {
                    displayProp: 'ProductName', idProp: 'ProductTypeId', externalIdProp: '', scrollableHeight: '250px', scrollable: true
                };
                svc.productSubTypeSettings = {
                    displayProp: 'ProductSubTypeName', idProp: 'ProductSubTypeId', externalIdProp: '', scrollableHeight: '250px', scrollable: true
                };
                svc.sectorSettings = { displayProp: 'CoveredSector', idProp: 'CoveredSectorId', externalIdProp: '' };
                svc.customerSettings = {
                    //displayProp: 'CompanyName', idProp: 'CompanyItemId',
                    externalIdProp: '', scrollableHeight: '250px', scrollable: true, enableSearch: true
                };
                svc.crfCountrySettings = {
                    externalIdProp: '', scrollableHeight: '250px', scrollable: true, enableSearch: true
                };
                svc.crfUnionSettings = {
                    externalIdProp: '', scrollableHeight: '250px', scrollable: true, enableSearch: true
                };
                svc.crfSectorSettings = {
                    externalIdProp: '', scrollableHeight: '250px', scrollable: true, enableSearch: true
                };
                svc.crfComplianceSettings = {
                    externalIdProp: '', scrollableHeight: '250px', scrollable: true, enableSearch: true
                };
                svc.crfModuleSettings = {
                    externalIdProp: '', scrollableHeight: '250px', scrollable: true, enableSearch: true
                };
            }
        }]);

});
