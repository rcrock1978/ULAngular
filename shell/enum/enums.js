
define([], function () {

    var enums = {

        MessageType : {
            Success: {
                Id: 1,
                Description: 'Information',
                Icon: 'fa fa-info-circle'
            },
            Warning: {
                Id: 2,
                Description: 'Warning',
                Icon: 'fa fa-exclamation-triangle'
            },
            Error: {
                Id: 3,
                Description: 'Error',
                Icon: 'fa fa-exclamation-circle'
            }
        },
        ConfirmType : {
            YesNo: "YesNo",
            OkCancel: "OkCancel",
            DeleteCancel: "DeleteCancel"
        },

        AlertType: {
            Success: {
                Id: 1,
                Description: 'Success',
                Type : 'alert-success'
            },
            Info: {
                Id: 1,
                Description: 'Information',
                Type: 'alert-info'
            },
            Warning: {
                Id: 1,
                Description: 'Warning',
                Type: 'alert-warning'
            },
            Error: {
                Id: 1,
                Description: 'Error',
                Type: 'alert-danger'
            },
        },
        Page: {
            Main: "main",
            Home: "home"
        },
        Mode: {
            Add: "add",
            Edit: "edit",
            View: "view",
            Copy: "copy",
            Renew: "renew",
            ViewWF: "viewWorkflow",
            EditWF: "editWorkFlow",
            ReviewNews: "reviewNews"
        },
        CallbackType: {
            Yes: "Yes",
            No: "No",
            Cancel : "Cancel"
        },

        ModalSize : {
            Small: "sm",
            Medium: "md",
            Large: "lg"
        },
        ResponseType: {
            Success: "Success",
            Fail : "Failed"
        },
        ModuleType: {
            Regulatory: {
                Id: 1,
                Description: 'regulatory'
            },
            RequiredItems: {
                Id: 2,
                Description: 'r2c'
            },
            Delivery: {
                Id: 3,
                Description: 'delivery'
            },
            News: {
                Id: 4,
                Description: 'news'
            },
            Contacts: {
                Id: 5,
                Description: 'contacts'
            },
            Certificates: {
                Id: 6,
                Description: 'certificates'
            }
        },
        WorkflowStatus: {
            RequestForChangePendingReview: {
                Id: 1,
                Description: 'Request for Change Pending Review'
            },
            Approved: {
                Id: 2,
                Description: 'Approved'
            },
            Rejected: {
                Id: 3,
                Description: 'Rejected'
            },
            ReviewCompleted: {
                Id: 4,
                Description: 'Review Completed'
            },
            PendingChineseTranslation: {
                Id: 5,
                Description: 'Pending Chinese Translation'
            },
            PendingJapaneseTranslation: {
                Id: 6,
                Description: 'Pending Japanese Translation'
            },
            ApproverReview: {
                Id: 7,
                Description: 'Approver Review'
            }
        },
        RefinerType: {
            AcceptedTestReports: "AcceptedTestReports",
            AcceptedTestReportsEMC: 'AccepTestEMC',
            AcceptedTestReportsSafety: 'AccepTestSafety',
            AcceptedTestReportsWireless: 'AccepTestWireless',
            ApplicationType: "ApplicationType",
            CertBusinessStatus: "CertBusinessStatus",
            CertificateLimitation: 'CertLimit',
            CertificateValidityPeriod: "CertificateValidityPeriod",
            CertificationOrganization: "CertificationOrganization",
            CertOrganization: 'CertOrg',
            CertScheme: "CertScheme",
            CertStatus: "CertStatus",
            CertValidPeriod: 'CertValidPeriod',
            Company: "Company",
            ComplianceModel: "ComplianceModel",
            ComplianceProgram: "ComplianceProgram",
            Country: "Country",
            CoveredSector: "CoveredSector",
            DocumentCategory: 'DocumentType',
            EffectiveEndDateTime: 'EffectiveEndDateTime',
            EffectiveStartDateTime: 'EffectiveStartDateTime',
            ExpirationEndDateTime: "ExpirationEndDateTime",
            ExpirationStartDateTime: "ExpirationStartDateTime",
            FrequencyAndTechnology: 'FrequencyAndTechnology',
            FrequencyTech: 'FrequencyTech',
            InCountryTesting: "InCountryTesting",
            InCountryTestingEMC: 'ICTEMC',
            InCountryTestingSafety: 'ICTSafety',
            InCountryTestingWireless: 'ICTWireless',
            IsMandatory: 'IsMandatory',
            IssueEndDateTime: "IssueEndDateTime",
            IssueStartDateTime: "IssueStartDateTime",
            Keyword: "Keyword",
            LocalRep: 'LocalRep',
            LocalRepresentative: "LocalRepresentative",
            LocalRepresentativeService: "LocalRepresentativeService",
            LocalRepService: 'LocalRepService',
            MandatoryOrVoluntary: "MandatoryOrVoluntary",
            MarkingRequirement: 'MarkingReq',
            ModularApproval: "ModularApproval",
            NewsSource: 'NewsSource',
            OrganizationType: 'OrganizationType',
            PostedEndDateTime: 'PostedEndDateTime',
            PostedStartDateTime: 'PostedStartDateTime',
            PowerSource: 'PowerSource',
            PreferredChannel: "PreferredChannel",
            ProductSubType: 'ProductSubType',
            ProductType: 'ProductType',
            Region: "Region",
            SampleRequirement: "SampleRequirement",
            SampleRequirementEMC: 'SameReqEMC',
            SampleRequirementSafety: 'SampReqSafety',
            SampleRequirementWireless: 'SampReqWireless',
            ScopeWireless: 'ScopeWireless',
            SectorsRegulated: "SectorRegulated",
            Status: "StatusType",
        },
        IsLevel2Popup : true
        
    };

    return enums;
});
