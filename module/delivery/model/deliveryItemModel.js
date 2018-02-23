
'use strict';

define([], function () {

    var GetSectorsRegulated = function (sectorsRegulated) {
        var items = [];
        angular.forEach(sectorsRegulated, function (sector) {
            this.push({ id: sector.SectorRegulated_Id, label: sector.SectorRegulated_Name });
        }, items);
        return items;
    };
    var SetCountryNames = function (countries) {
        var countryNames = "";
        var limit = countries.length;
        var ctr = 0;
        angular.forEach(countries, function (country) {
            countryNames += country.CountryName;
            ctr += 1;
            if (ctr < limit) countryNames += ",";
        });
        return countryNames;
    };
    //var GetDateString = function (date) {
    //    var d = new Date(date);
    //    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    //    var m = months[d.getMonth()];
    //    return d.getDate().toString() + " " + m + " " + d.getFullYear();
    //};
    
    //var defMaxDate = new Date("12/31/2099");
    //var defMinDate =  new Date("1/1/0001") ;

    var model = {
        DeliveryGenItem: function (item,isEditMode) {
            return {

                //MultiSelect
                SelectedCountries: [],
                Countries: item ? item.Countries : null,
                CountryName: item ? SetCountryNames(item.Countries) : "",

                SectorsRegulated: item ? item.SectorsRegulated : null,
                SelectedSectorsRegulated: item ? GetSectors(item.SectorsRegulated) : [],
                SectorRegulatedName: item ? item.SectorRegulated_Name : "",

                SelectedAcceptedTestReports_Wireless_list : [],
                AcceptedTestReports_Wireless_list: item ? item.AcceptedTestReports_Wireless_list : null,
                AcceptedTestReports_WirelessName: item ? item.AcceptedTestReports_Wireless_Name : "",

                SelectedAcceptedTestReports_Safety_list : [],
                AcceptedTestReports_Safety_list: item ? item.AcceptedTestReports_Safety_list : null,
                AcceptedTestReports_SafetyName: item ? item.AcceptedTestReports_Safety_Name : "",

                SelectedAcceptedTestReports_EMC_list : [],
                AcceptedTestReports_EMC_list: item ? item.AcceptedTestReports_EMC_list : null,
                AcceptedTestReports_EMCName: item ? item.AcceptedTestReports_EMC_Name : "",

                SelectedComplianceModels: [],
                ComplianceModels: item ? item.ComplianceModels : null,
                ComplianceModelName: item ? item.ComplianceModel_Name : "",

                SelectedPreferredChannels : [],
                PreferredChannels: item ? item.PreferredChannels : null,
                PreferredChannelName: item ? item.PreferredChannel_Name : "",


                DeliveryItemId: item ? (item.DeliveryItemId == '00000000-0000-0000-0000-000000000000'? null : item.DeliveryItemId) : null,
                Region: item ? item.Region : "",
                RegionalEconomicUnion_Id: item ? item.RegionalEconomicUnion_Id : null,
                RegionalEconomicUnion_Name: item ? item.RegionalEconomicUnion_Name : "",
                RegionalEconomicUnion: item ? item.RegionalEconomicUnion : "",
                ComplianceProgram_Id: item ? item.ComplianceProgram_Id : null,
                ComplianceProgram_Name: item ? item.ComplianceProgram_Name : "",
                ComplianceProgram: item ? item.ComplianceProgram : "",
                CertificationOrganization_Id: item ? item.CertificationOrganization_Id : null,
                CertificationOrganization_Name: item ? item.CertificationOrganization_Name : "",
                CertificationOrganization: item ? item.CertificationOrganization : "",
                MandatoryOrVoluntary_Id: item ? item.MandatoryOrVoluntary_Id : null,
                MandatoryOrVoluntary_Name: item ? item.MandatoryOrVoluntary_Name : "",
                MandatoryOrVoluntary: item ? item.MandatoryOrVoluntary : "",
                ModularApproval_Id: item ? item.ModularApproval_Id : null,
                ModularApproval_Name: item ? item.ModularApproval_Name : "",
                ModularApproval: item ? item.ModularApproval : "",
                SampleRequirement: item ? item.SampleRequirement : "",
                SampleRequirement_Wireless_Id: item ? item.SampleRequirement_Wireless_Id : null,
                SampleRequirement_Wireless_Name: item ? item.SampleRequirement_Wireless_Name : "",
                SampleRequirement_Safety_Id: item ? item.SampleRequirement_Safety_Id : null,
                SampleRequirement_Safety_Name: item ? item.SampleRequirement_Safety_Name : "",
                SampleRequirement_EMC_Id: item ? item.SampleRequirement_EMC_Id : null,
                SampleRequirement_EMC_Name: item ? item.SampleRequirement_EMC_Name : "",
                InCountryTesting: item ? item.InCountryTesting : "",
                InCountryTesting_Wireless_Id: item ? item.InCountryTesting_Wireless_Id : null,
                InCountryTesting_Wireless_Name: item ? item.InCountryTesting_Wireless_Name : "",
                InCountryTesting_Safety_Id: item ? item.InCountryTesting_Safety_Id : null,
                InCountryTesting_Safety_Name: item ? item.InCountryTesting_Safety_Name : "",
                InCountryTesting_EMC_Id: item ? item.InCountryTesting_EMC_Id : null,
                InCountryTesting_EMC_Name: item ? item.InCountryTesting_EMC_Name : "",
                TestingOrganization: item ? item.TestingOrganization : "",
                TestingOrganization_Wireless: item ? item.TestingOrganization_Wireless : "",
                TestingOrganization_Safety: item ? item.TestingOrganization_Safety : "",
                TestingOrganization_EMC: item ? item.TestingOrganization_EMC : "",
                LocalRepresentative: item ? item.LocalRepresentative : "",
                LocalRepresentative_Id: item ? item.LocalRepresentative_Id : null,
                LocalRepresentative_Name: item ? item.LocalRepresentative_Name : "",
                LocalRepresentativeService: item ? item.LocalRepresentativeService : "",
                LocalRepresentativeService_Id: item ? item.LocalRepresentativeService_Id : null,
                LocalRepresentativeService_Name: item ? item.LocalRepresentativeService_Name : "",
                CertificateValidityPeriod: item ? item.CertificateValidityPeriod : "",
                LeadTime: item ? item.LeadTime : "",
                Manual: item ? item.Manual : "",


            
            }
        },

        SetDefault: function () {
            var self = this;
            return self.DeliveryGenItem();
        },

        Set: function (item,isEditMode) {
            var self = this;
            return self.DeliveryGenItem(item, isEditMode)
        }
    };

    return model;
});
