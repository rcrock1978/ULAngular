
define([
	'app',
	'globalUtility',
    'enums'
], function (app, globalUtility, enums) {

    app.register.controller('addDeliveryController', ['$scope', '$uibModalInstance', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'bsAlertService', 'deliveryService', 'fileUploadService', 'items',
	    function ($scope, $uibModalInstance, $http, $rootScope, $filter, baseService, dialogService, bsAlertService, deliveryService, fileUploadService, items) {
	        //"global" variables

	        //viewmodel/bindable members
	        $scope.closeDialog = closeDialog;
	        $scope.isLoading = false;
	        $scope.modalTitle = "ADD ITEM";


	        //function implementations
	        //////////////  

	        function closeDialog() {
	            $uibModalInstance.close();
	            baseService.ShowOverlay(false);
	        };

            ////////////////////////////////////////////////////////////////////////////////////////
	        $scope.applications = [];
	        $scope.fileCert = "";

	        $scope.fileUploaderTemplateUrl = fileUploadService.TemplateUrl;

	        
	        $scope.showErrors = false;

	        $scope.mode = enums.Mode.Add;
	    
	        
	      
	        //MODELS

            //Multi Select
	        $scope.sectorsRegulated = [];
	        $scope.selectedsectorsRegulated = [];
	        $scope.countries = [];
	        $scope.selectedCountries = [];
	        $scope.complianceModels = [];
	        $scope.selectedcomplianceModels = [];
	        $scope.acceptedTestReportsEMC_list = [];
	        $scope.selectedacceptedTestReportsEMC_list = [];
	        $scope.acceptedTestReportsSafety_list = [];
	        $scope.selectedacceptedTestReportsSafety_list = [];
	        $scope.acceptedTestReportsWireless_list = [];
	        $scope.selectedacceptedTestReportsWireless_list = [];
	        $scope.preferredChannels = [];
	        $scope.selectedpreferredChannels = [];
	        $scope.regions = [];
	        $scope.productTypes = [];
	        $scope.productTypeSubTypes = [];
	        $scope.selectedproductTypes = [];
	        $scope.selectedproductTypeSubTypes = [];


            //Single Select
	        $scope.selectedRegion = "";
	        $scope.regionalEconomicUnions = [];
	        $scope.selectedregionalEconomicUnions = "";
	        $scope.certificationPrograms = [];
	        $scope.selectedcertificationPrograms = "";
	        $scope.certificationOrganizations = [];
	        $scope.selectedcertificationOrganizations = "";
	        $scope.mandatoryOrVoluntary_list = [];
	        $scope.selectedmandatoryOrVoluntary_list = "";
	        $scope.modularApprovals = [];
	        $scope.selectedmodularApprovals = "";
	        $scope.applicationTypes = [];
	        $scope.selectedapplicationTypes = "";
	        $scope.sampleRequirement_Wireless_list = [];
	        $scope.selectedsampleRequirement_Wireless_list = "";
	        $scope.sampleRequirement_EMC_list = [];
	        $scope.selectedsampleRequirement_EMC_list = "";
	        $scope.sampleRequirement_Safety_list = [];
	        $scope.selectedsampleRequirement_Safety_list = "";
	        $scope.inCountryTesting_Wireless_list = [];
	        $scope.selectedinCountryTesting_Wireless_list = "";
	        $scope.inCountryTesting_EMC_list = [];
	        $scope.selectedinCountryTesting_EMC_list = "";
	        $scope.inCountryTesting_Safety_list = [];
	        $scope.selectedinCountryTesting_Safety_list = "";
	        $scope.testingOrganization_Wireless = ""; 
	        $scope.testingOrganization_Safety = ""; 
	        $scope.testingOrganization_EMC = ""; 
	        $scope.localRepresentetatives = [];
	        $scope.selectedlocalRepresentetatives = "";
	        $scope.localRepresentetativeServices = [];
	        $scope.selectedlocalRepresentetativeServices = "";
	        $scope.certificateValidityPeriod = "";  
	        $scope.leadtime = ""; 
	        $scope.manual = ""; 

	        //$scope.documents = "";
	        //$scope.authorityRegulation = "";
	        //$scope.generalScope = "";
	        //$scope.application = "";
	        //$scope.certificateScheme = "";
	        //$scope.latestDateToSubmitRenewalpplication = "";

	        $scope.isChecked = "";
	        //$scope.createdBy = "";
	        //$scope.createdDate = "";
	        //$scope.modifiedBy = "";
	        //$scope.modifiedDate = "";

	        $scope.multiselectSettings = {
	            scrollableHeight: '200px',
	            scrollable: true
	        };

	        $scope.relatedFiles = [];
	        $scope.primaryFile = "";

	        var originalData = [];

	        $scope.init = function () {
	            if (items.Mode != enums.Mode.Add) {
	                $scope.mode = (items.Mode == enums.Mode.Edit) ? enums.Mode.Edit : enums.Mode.View;
	                $scope.modalTitle = (items.Mode == enums.Mode.Edit) ? "EDIT ITEM" : "VIEW DELIVERY MANUAL";
	            }
	            initializeItems();
	        };

	       

	        var initializeItems = function () {

	            //Multi Select, Serialize multi select controls, then populate.
	            $scope.countries = [];
	            $scope.sectorsRegulated = [];//angular.copy(items.LookUps.SectorsRegulated);
	            $scope.complianceModels = [];//angular.copy(items.LookUps.ComplianceModels);
	            $scope.acceptedTestReportsEMC_list = [];//angular.copy(items.LookUps.AcceptedTestReportsEMC_List);
	            $scope.acceptedTestReportsSafety_list = [];//angular.copy(items.LookUps.AcceptedTestReportsSafety_List);
	            $scope.acceptedTestReportsWireless_list = [];//angular.copy(items.LookUps.AcceptedTestReportsWireless_List);
	            $scope.preferredChannels = [];//angular.copy(items.LookUps.PreferredChannels);
	            //$scope.productTypes = [];
	            //$scope.productTypeSubTypes = [];

	            angular.forEach(items.LookUps.Countries, function (countries) {
	                this.push({ id: countries.CountryId, label: countries.CountryName });
	            }, $scope.countries);

	            angular.forEach(items.LookUps.SectorsRegulated, function (sectorsRegulated) {
	                this.push({ id: sectorsRegulated.SectorRegulatedId, label: sectorsRegulated.SectorRegulatedName });
	            }, $scope.sectorsRegulated);

	            angular.forEach(items.LookUps.ComplianceModels, function (complianceModels) {
	                this.push({ id: complianceModels.ComplianceModelId, label: complianceModels.ComplianceModelName });
	            }, $scope.complianceModels);

	            angular.forEach(items.LookUps.AcceptedTestReportsEMC_list, function (acceptedTestReports_EMC_list) {
	                this.push({ id: acceptedTestReports_EMC_list.AcceptedTestReports_EMCId, label: acceptedTestReports_EMC_list.AcceptedTestReports_EMCName });
	            }, $scope.acceptedTestReportsEMC_list);

	            angular.forEach(items.LookUps.AcceptedTestReportsSafety_list, function (acceptedTestReports_Safety_list) {
	                this.push({ id: acceptedTestReports_Safety_list.AcceptedTestReports_SafetyId, label: acceptedTestReports_Safety_list.AcceptedTestReports_SafetyName });
	            }, $scope.acceptedTestReportsSafety_list);

	            angular.forEach(items.LookUps.AcceptedTestReportsWireless_list, function (acceptedTestReports_Wireless_list) {
	                this.push({ id: acceptedTestReports_Wireless_list.AcceptedTestReports_WirelessId, label: acceptedTestReports_Wireless_list.AcceptedTestReports_WirelessName });
	            }, $scope.acceptedTestReportsWireless_list);

	            angular.forEach(items.LookUps.PreferredChannels, function (preferredChannels) {
	                this.push({ id: preferredChannels.PreferredChannelId, label: preferredChannels.PreferredChannelName });
	            }, $scope.preferredChannels);

	            //angular.forEach(items.LookUps.ProductTypes, function (productTypes) {
	            //    this.push({ id: productTypes.ProductTypeId, label: productTypes.ProductTypeName });
	            //}, $scope.productTypes);

	            //angular.forEach(items.LookUps.ProductSubTypes, function (productSubTypes) {
	            //    this.push({ id: productSubTypes.ProductSubTypeId, label: productSubTypes.ProductSubTypeName });
	            //}, $scope.productSubTypes);


                //Single Select
	            $scope.regions = angular.copy(items.LookUps.Regions);
	            $scope.regionalEconomicUnions = angular.copy(items.LookUps.RegionalEconomicUnions);
	            $scope.certificationPrograms = angular.copy(items.LookUps.CertificationPrograms);
	            $scope.certificationOrganizations = angular.copy(items.LookUps.CertificationOrganizations);
	            $scope.mandatoryOrVoluntary_list = angular.copy(items.LookUps.MandatoryOrVoluntary_List);
	            $scope.modularApprovals = angular.copy(items.LookUps.ModularApprovals);
	            $scope.applicationTypes = angular.copy(items.LookUps.ApplicationTypes);
	            $scope.sampleRequirement_EMC_list = angular.copy(items.LookUps.SampleRequirementEMC_List);
	            $scope.sampleRequirement_Safety_list = angular.copy(items.LookUps.SampleRequirementSafety_List);
	            $scope.sampleRequirement_Wireless_list = angular.copy(items.LookUps.SampleRequirementWireless_List);
	            $scope.inCountryTesting_EMC_list = angular.copy(items.LookUps.InCountryTestingEMC_List);
	            $scope.inCountryTesting_Safety_list = angular.copy(items.LookUps.InCountryTestingSafety_List);
	            $scope.inCountryTesting_Wireless_list = angular.copy(items.LookUps.InCountryTestingWireless_List);
	            $scope.localRepresentetatives = angular.copy(items.LookUps.LocalRepresentetatives);
	            $scope.localRepresentetativeServices = angular.copy(items.LookUps.LocalRepresentetativeServices);

	          
                if ($scope.mode != enums.Mode.Add) {
	                originalData = angular.copy(items.Data);
	               // loadDeliveryDetail(items.Data);
	            }
	        };

	        //var loadDeliveryDetail = function (data) {
	        //    $scope.deliveryItemId = '';
	        //    if (data.Countries.length > 0) {
	        //        var _tempCountry = $filter('filter')(items.LookUps.Countries, function (value, index) { return value.CountryItemId == data.Countries[0].CountryItemId; });
	        //        var _tempRegion = _tempCountry.length > 0 ? $filter('filter')(items.LookUps.Regions, function (value, index) { return value.RegionItemId == _tempCountry[0].RegionItemId; }) : null;
	        //        $scope.regionId = _tempRegion;
	        //        $scope.selectedRegion = _tempRegion;
	        //    }

	        //    //multi select

	        //    angular.forEach(data.Countries, function (country) {
	        //        this.push({ id: country.CountryItemId, label: country.CountryName });
	        //    }, $scope.selectedCountries);

	        //    angular.forEach(data.SectorsRegulated, function (sectorsRegulated) {
	        //        this.push({ id: sectorsRegulated.SectorRegulatedId, label: sectorsRegulated.SectorRegulatedName });
	        //    }, $scope.selectedsectorsRegulated);

	        //    angular.forEach(data.ComplianceModels, function (complianceModels) {
	        //        this.push({ id: complianceModels.ComplianceModelId, label: complianceModels.ComplianceModelName });
	        //    }, $scope.selectedcomplianceModels);

	        //    angular.forEach(data.AcceptedTestReportsEMC_list, function (acceptedTestReportsEMC_list) {
	        //        this.push({ id: acceptedTestReportsEMC_list.AcceptedTestReports_EMCId, label: acceptedTestReportsEMC_list.AcceptedTestReports_EMCName });
	        //    }, $scope.selectedacceptedTestReportsEMC_list);

	        //    angular.forEach(data.AcceptedTestReportsWireless_list, function (acceptedTestReportsWireless_list) {
	        //        this.push({ id: acceptedTestReportsWireless_list.AcceptedTestReports_WirelessId, label: acceptedTestReportsWireless_list.AcceptedTestReports_WirelessName });
	        //    }, $scope.selectedacceptedTestReportsWireless_list);

	        //    angular.forEach(data.AcceptedTestReportsSafety_list, function (acceptedTestReportsSafety_list) {
	        //        this.push({ id: acceptedTestReportsSafety_list.AcceptedTestReports_SafetyId, label: acceptedTestReportsSafety_list.AcceptedTestReports_SafetyName });
	        //    }, $scope.selectedacceptedTestReportsSafety_list);

	        //    angular.forEach(data.PreferredChannels, function (preferredChannels) {
	        //        this.push({ id: preferredChannels.PreferredChannelId, label: preferredChannels.PreferredChannelName });
	        //    }, $scope.selectedpreferredChannels);

	        //    //angular.forEach(data.ProductTypes, function (productTypes) {
	        //    //    this.push({id: productTypes.ProductTypeId, label: productTypes.ProductTypeName });
	        //    //}, $scope.selectedproductTypes);

	        //    //angular.forEach(data.ProductSubTypes, function (productSubTypes) {
	        //    //    this.push({ id: productSubTypes.ProductSubTypeId, label: productSubTypes.ProductSubTypeName });
	        //    //}, $scope.selectedproductTypeSubTypes);


            //    //Single Select

	        //    $scope.selectedRegion = data.Region
	        //    $scope.selectedregionalEconomicUnions = data.RegionalEconomicUnionName
            //    $scope.selectedcertificationPrograms = data.CertificationProgramName;
	        //    $scope.selectedcertificationOrganizations = data.CertificationOrganizationName;
	        //    $scope.selectedmandatoryOrVoluntary_list = data.MandatoryOrVoluntaryName;
	        //    $scope.selectedmodularApprovals = data.ModularApprovalName;
	        //    $scope.selectedapplicationTypes = data.ApplicationTypeName;
	        //    $scope.selectedsampleRequirement_Wireless_list = data.SampleRequirement_WirelessName;
	        //    $scope.selectedsampleRequirement_EMC_list = data.SampleRequirement_EMCName;
	        //    $scope.selectedsampleRequirement_Safety_list = data.SampleRequirement_SafetyName;
	        //    $scope.selectedinCountryTesting_Wireless_list = data.InCountryTesting_WirelessName;
	        //    $scope.selectedinCountryTesting_EMC_list = data.InCountryTesting_EMCName;
	        //    $scope.selectedinCountryTesting_Safety_list = data.InCountryTesting_SafetyName;
	        //    $scope.testingOrganization_Wireless = data.TestingOrganization_WirelessName;
	        //    $scope.testingOrganization_Safety = data.TestingOrganization_SafetyName;
	        //    $scope.testingOrganization_EMC = data.TestingOrganization_EMCName;
	        //    $scope.selectedlocalRepresentetatives = data.LocalRepresentetativeName;
	        //    $scope.selectedlocalRepresentetativeServices = data.LocalRepresentetativeServiceName;
	        //    $scope.certificateValidityPeriod = data.CertificateValidityPeriod;
	        //    $scope.leadtime = data.LeadTime;
	        //    $scope.manual = data.Manual;
	        //    $scope.deliveryItemId = $scope.mode == enums.Mode.Edit ? data.deliveryItemId : '';
	        //    $scope.isChecked = data.IsChecked;
	        //    //$scope.createdBy = data.CreatedBy;
	        //    //$scope.createdDate = data.CreatedDate;
	        //    //$scope.modifiedBy = data.ModifiedBy;
	        //    //$scope.modifiedDate = data.ModifiedDate;          
	        //}

	        $scope.LoadCountries = function () {
	            $scope.countries = [];
	            angular.forEach(items.LookUps.Countries, function (country) {
	                if (country.RegionItemId == $scope.region) {
	                    this.push({ id: country.CountryItemId ,label : country.CountryName});
	                }
	            },  $scope.countries);

	            $scope.selectedCountries = [];
	        };

	        

	        //$scope.IsValidExpirationDate = function () {

	        //    if (!globalUtility.IsNullOrWhiteSpace($scope.issueDate) && !globalUtility.IsNullOrWhiteSpace($scope.expirationDate))
	        //    {
	        //        var iDate = new Date($scope.issueDate);
	        //        var eDate = new Date($scope.expirationDate);
	        //        return (iDate >= eDate);
	        //    }
            //    else {
            //        return true;
            //    }
	        //};

	        $scope.getItemByValue = function(value, list) {
	            angular.forEach(list, function (val, key) {
	                if (val == value) {
	                    $scope.selected = key;
	                }
	            });
	        };
	        

	        $scope.Save = function (hasError) {

	            $scope.showErrors = hasError;
	            if (hasError) return;
                
	            //var issueDate = new Date($scope.issueDate);
	            //var expirationDate = new Date($scope.expirationDate);
	            //var issueDateDisplay = issueDate.getFullYear() + '-' + (issueDate.getMonth() + 1) + '-' + issueDate.getDate();

	            //var oneDay = 24 * 60 * 60 * 1000;
	            //var diffDays = Math.round(Math.abs((issueDate.getTime() - expirationDate.getTime()) / (oneDay)));

	            var daliveryData = {
	                "DeliveryItemId": $scope.deliveryItemId,
	                "Region": $scope.region,
	                "RegionalEconomicUnion_Id": $scope.getItemByValue($scope.selectedregionalEconomicUnions,$scope.regionalEconomicUnions),
	                "RegionalEconomicUnion_Name": $scope.selectedregionalEconomicUnions,
	                "Countries": $scope.country,
	                "CertificationProgram_Id": $scope.getItemByValue($scope.selectedcertificationPrograms, $scope.certificationPrograms),
	                "CertificationProgram_Name": $scope.selectedcertificationPrograms,
	                "SectorsRegulated": $scope.sectorsRegulated,
	                "CertificationOrganization_Id": $scope.getItemByValue($scope.selectedcertificationOrganizations, $scope.certificationOrganizations),
	                "CertificationOrganization_Name": $scope.selectedcertificationOrganizations,
	                "ComplianceModels": $scope.complianceModels,
	                "MandatoryOrVoluntary_Id": $scope.getItemByValue($scope.selectedmandatoryOrVoluntary_list, $scope.mandatoryOrVoluntary_list),
	                "MandatoryOrVoluntary_Name": $scope.selectedmandatoryOrVoluntary_list,
	                "ModularApproval_Id": $scope.getItemByValue($scope.selectedmodularApprovals, $scope.modularApprovals),
	                "ModularApproval_Name": $scope.selectedmodularApprovals,
	                "AcceptedTestReports_Wireless_list": $scope.acceptedTestReports_Wireless_list,
	                "AcceptedTestReports_EMC_list": $scope.acceptedTestReports_EMC_list,
	                "AcceptedTestReports_Safety_list": $scope.acceptedTestReports_Safety_list,
	                "SampleRequirement_Wireless_Id": $scope.getItemByValue($scope.selectedsampleRequirement_Wireless_list, $scope.sampleRequirement_Wireless_list),
	                "SampleRequirement_Wireless_Name": $scope.selectedsampleRequirement_Wireless_list,
	                "SampleRequirement_Safety_Id": $scope.getItemByValue($scope.selectedsampleRequirement_Safety_list, $scope.sampleRequirement_Safety_list),
	                "SampleRequirement_Safety_Name": $scope.selectedsampleRequirement_Safety_list,
	                "SampleRequirement_EMC_Id": $scope.getItemByValue($scope.selectedsampleRequirement_EMC_list, $scope.sampleRequirement_EMC_list),
	                "SampleRequirement_EMC_Name": $scope.selectedsampleRequirement_EMC_list,
	                "InCountryTesting_Wireless_Id": $scope.getItemByValue($scope.selectedinCountryTesting_Wireless_list, $scope.inCountryTesting_Wireless_list),
	                "InCountryTesting_Wireless_Name": $scope.selectedinCountryTesting_Wireless_list,
	                "InCountryTesting_Safety_Id": $scope.getItemByValue($scope.selectedinCountryTesting_Safety_list, $scope.inCountryTesting_Safety_list),
	                "InCountryTesting_Safety_Name": $scope.selectedinCountryTesting_Safety_list,
	                "InCountryTesting_EMC_Id": $scope.getItemByValue($scope.selectedinCountryTesting_EMC_list, $scope.inCountryTesting_EMC_list),
	                "InCountryTesting_EMC_Name": $scope.selectedinCountryTesting_EMC_list,
	                "TestingOrganization_Wireless": $scope.testingOrganization_Wireless,
	                "TestingOrganization_Safety": $scope.testingOrganization_Safety,
	                "TestingOrganization_EMC": $scope.testingOrganization_EMC,
	                "LocalRepresentative_Id": $scope.getItemByValue($scope.selectedlocalRepresentative_Id, $scope.localRepresentetatives),
	                "LocalRepresentative_Name": $scope.selectedlocalRepresentative_Name,
	                "LocalRepresentativeService_Id": $scope.getItemByValue($scope.selectedlocalRepresentativeService_Id, $scope.localRepresentetativeServices),
	                "LocalRepresentativeService_Name": $scope.selectedlocalRepresentativeService_Name,
	                "CertificateValidityPeriod": $scope.certificateValidityPeriod,
	                "LeadTime": $scope.leadTime,
	                "Manual": $scope.manual,
	                "PreferredChannels": $scope.preferredChannels,
	            };

	            var data = {
	                Mode: $scope.mode,
	                Data: deliveryData,
	                OriginalData: originalData
	            };

	            baseService.Publish('delivery:addDelivery',data);
	            $scope.SaveDocument();
	            $scope.CloseDialog();

	          
	        };

	        $scope.SaveDocument = function () {

                //SAVE DOCUMENT TO SHAREPOINT
	            var onSuccess = function (response) {

	                $scope.CloseDialog();
	            };

	            var reader = new FileReader();
	            reader.onloadend = function () {
	                if (reader.readyState == 2) {
	                    var arrayString = reader.result;
	                    var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayString)));

	                    var param = {
	                        DeliveryItemId: '1',
	                        File: base64String,
	                        Filename: $scope.primaryFile.name,
	                        ApplicationId: "17C2A926-C9AC-413B-B901-21F5B5856CBF"
	                    };

	                    deliveryService.SaveCertificate(param, onSuccess);
	                }

	            };
	            reader.readAsArrayBuffer($scope.primaryFile);
	        };

	        $scope.onSelect = function (e) {
	            var message = $.map(e.files, function (file) { return file.name; }).join(", ");
	            console.log("event :: select (" + message + ")");
	        }

	        $scope.init();

	        $scope.$on('$destroy', function () {

	            var events = [''];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
