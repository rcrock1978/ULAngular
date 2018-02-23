'use strict';

define([], function () {

    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    var model = {
        Delivery: function (item) {
            var self = this;
            return {

                //MultiSelect
                Countries: item.Countries,
                CountryName: SelectedCountry,//SetCountryNames(item.Countries),

                SectorsRegulated: item.SectorsRegulated,
                SectorRegulatedName: item.SelectedSectorRegulated,
                AcceptedTestReports: item.SelectedAcceptedTestReports,
                AcceptedTestReports_Wireless_list: item.AcceptedTestReports_Wireless_list,
                AcceptedTestReports_WirelessName: item.AcceptedTestReports_Wireless_Name,
                AcceptedTestReports_Safety_list: item.AcceptedTestReports_Safety_list,
                AcceptedTestReports_SafetyName: item.AcceptedTestReports_Safety_Name,
                AcceptedTestReports_EMC_list: item.AcceptedTestReports_EMC_list,
                AcceptedTestReports_EMCName: item.AcceptedTestReports_EMC_Name,
                ComplianceModels: item.ComplianceModels,
                ComplianceModelName: item.SelectedComplianceModel,
                PreferredChannels: item.PreferredChannels,
                PreferredChannelName: item.SelectedPreferredChannel,

                DeliveryItemId: item.DeliveryItemId,
                Region: item.Region,
                RegionalEconomicUnion_Id: item.RegionalEconomicUnion_Id,
                RegionalEconomicUnion_Name: item.RegionalEconomicUnion_Name,
                RegionalEconomicUnion: item.RegionalEconomicUnion_Name,
                ComplianceProgram_Id: item.ComplianceProgram_Id,
                ComplianceProgram_Name: item.ComplianceProgram_Name,
                ComplianceProgram: item.ComplianceProgram_Name,
                CertificationOrganization_Id: item.CertificationOrganization_Id,
                CertificationOrganization_Name: item.CertificationOrganization_Name,
                CertificationOrganization: item.CertificationOrganization_Name,
                MandatoryOrVoluntary_Id: item.MandatoryOrVoluntary_Id,
                MandatoryOrVoluntary_Name: item.MandatoryOrVoluntary_Name,
                MandatoryOrVoluntary: item.MandatoryOrVoluntary_Name,
                ModularApproval_Id: item.ModularApproval_Id,
                ModularApproval_Name: item.ModularApproval_Name,
                ModularApproval: item.ModularApproval_Name,
                ApplicationType: item.ApplicationType_Name,
                SampleRequirement: item.SelectedSampleRequirement,
                SampleRequirement_Wireless_Id: item.SampleRequirement_Wireless_Id,
                SampleRequirement_Wireless_Name: item.SampleRequirement_Wireless_Name,
                SampleRequirement_Safety_Id: item.SampleRequirement_Safety_Id,
                SampleRequirement_Safety_Name: item.SampleRequirement_Safety_Name,
                SampleRequirement_EMC_Id: item.SampleRequirement_EMC_Id,
                SampleRequirement_EMC_Name: item.SampleRequirement_EMC_Name,
                InCountryTesting: item.SelectedInCountryTesting,
                InCountryTesting_Wireless_Id: item.InCountryTesting_Wireless_Id,
                InCountryTesting_Wireless_Name: item.InCountryTesting_Wireless_Name,
                InCountryTesting_Safety_Id: item.InCountryTesting_Safety_Id,
                InCountryTesting_Safety_Name: item.InCountryTesting_Safety_Name,
                InCountryTesting_EMC_Id: item.InCountryTesting_EMC_Id,
                InCountryTesting_EMC_Name: item.InCountryTesting_EMC_Name,
                TestingOrganization: item.SelectedTestingOrganization,
                TestingOrganization_Wireless: item.TestingOrganization_Wireless,
                TestingOrganization_Safety: item.TestingOrganization_Safety,
                TestingOrganization_EMC: item.TestingOrganization_EMC,
                LocalRepresentative_Id: item.LocalRepresentative_Id,
                LocalRepresentative_Name: item.LocalRepresentative_Name,
                LocalRepresentative: item.LocalRepresentative_Name,
                LocalRepresentativeService_Id: item.LocalRepresentativeService_Id,
                LocalRepresentativeService_Name: item.LocalRepresentativeService_Name,
                LocalRepresentativeService: item.LocalRepresentativeService_Name,
                CertificateValidityPeriod: item.CertificateValidityPeriod,
                LeadTime: item.LeadTime,
                Manual: item.Manual,

                
                IsChecked: false,

                IsNew: (
                             (new Date() <= (addDays((item.ModifiedDate != null ? item.ModifiedDate : item.CreatedDate), 14)) ? true : false)),
                CreatedBy: item.CreatedBy,
                CreatedDate: item.CreatedDate,
                ModifiedBy: item.ModifiedBy,
                ModifiedDate: item.ModifiedDate
            }
        },
       
        SetCountryNames: function (countries) {
            var countryName = "";
            var limit = countries.length;
            var ctr = 0;
            angular.forEach(countries, function (country) {
                countryNames += country.CountryName;
                ctr += 1;
                if (ctr < limit) countryName += ",";
            });
            return countryName;
        },


        Set: function (data) {
            var response = [];
            var _self = this;
            angular.forEach(data, function (item) {
                this.push(_self.Delivery(item));
            }, response);

            return response;
        },
        SetHeaders: function (displayText, isSortable) {
            return {
                DisplayText: '',
                IsSortable: isSortable
            }
        }

    };

    return model;
});
