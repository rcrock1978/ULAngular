'use strict';

define([
    'app',
], function (app) {

    app.factory('workflowConfigService', [
        function () {
            var svc = {
                apiUrl: 'api/home/',
                applicationTypeSettings: {},
                complianceSettings: {},
                freqTechSettings: {},
                powerSourceSettings: {},
                productTypeSettings: {},
                productSubTypeSettings: {},
                sectorSettings: {},
                customerSettings: {},
                crfCountrySettings: {},
                crfUnionSettings: {},
                crfSectorSettings: {},
                crfComplianceSettings: {},
                crfModuleSettings: {},

            };

            init();

            return svc;

            //////////////

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

            function init() {
                //configure settings
                initSettings();
            }

        }]);

});
