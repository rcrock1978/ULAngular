
define([
    'app',
    'globalUtility',
    'enums',
], function (app, globalUtility,enums) {

    app.factory('baseService', ['$http', '$rootScope', '$location', '$localStorage','$filter',
        function ($http, $rootScope, $location, $localStorage, $filter) {
        var svc = {
           
            //--Properties
            IsAuthenticated: function () {
                return $localStorage.IsAuthenticated;
            },
            //--End Properties

            //--raise event
            Publish: function (eventName, data) {
                $rootScope.$emit(eventName, data);
            },
            //--event listener
            Subscribe: function (eventName,callBack) {
                $rootScope.$on(eventName, callBack);
            },

            //--Toggle Search Bar Visibility
            SearchBarVisibility: function (data) {

                toggleSearchButtons(data);
                //var self = this;
                //self.Publish('shell:showSearchBar', data);
            },

            PopulateTypeAHead: function(data){
                populateTypeAheadSearch(data);
            },

            //--populate Search Bar data source
            //list of strings only
            PopulateSearchDataSource: function (source) {
                var self = this;
                self.Publish('shell:populateSearchDS', source);
            },
            //--Route to Page
            RouteToPage: function (page) {
                $location.url("/"+page);
            },
           
            //--Important 
            //Initillize Page Content
            //This will check if the page is authenticated
            PageInit: function () {
                var self = this;
                if (globalUtility.Modules.length == 0) {
                    self.RouteToPage(enums.Page.Home);
                }
            },
            //--Show Spinner
            IsBusy: function (isOpen) {
                var self = this;
                self.Publish('shell:showSpinner', isOpen);
            },

            ShowOverlay: function(isOpen){
                var self = this;
                self.Publish('shell:showOverlay', isOpen);
            },

            ShowModalPopUpOverLay : function(isOpen){
                var self = this;
                self.Publish('shell:showModalPopUpOverLay', isOpen);
            },

            Logout: function () {
                var self = this;
                $localStorage.$reset();
                globalUtility.ClientApps = [];
               self.RouteToPage("login");
            },
            //--Unsubscribe Events
            UnSubscribe: function (events) {
                angular.forEach(events, function (item) {
                    $rootScope.$$listeners[item] = null;
                });
            },

            ToggleLeftPane: function (toggleVal) {
                var self = this;
                self.Publish('shell:toggleLeftPane', toggleVal);
            },

            ResizeContentWidth: function () {
                //var rp = $("#rightPane").width();
                //var lp = $("#leftPane").width();

                //var appContainer = $("#appContainer");

                //var vpw = $(window).width();

                //appContainer.css({ 'width': vpw - (rp + lp) + 'px' });
            },

            GoToModulePage: function (page) {
                var self = this;
                self.Publish('shell:goToModulePage', page);
            },
            //-GLOBAL REFINERS
            AddToGlobalRefiners: function (data) {
                var filtered = [], refiner = [];
                if (data.Type === 'CoveredSector' || data.Type === 'SectorRegulated') {
                    refiner = {
                        CoveredSectorId: data.Id,
                        CoveredSector: data.Value
                    }
                    filtered = $filter('filter')(globalUtility.SelectedSector, function (value, index) { return value.CoveredSectorId == data.Id; });
                    if (filtered.length === 0) globalUtility.SelectedSector.push(refiner);
                }
                if (data.Type === 'FrequencyTech') {
                    refiner = {
                        FrequencyTechId: data.Id,
                        FrequencyTechName: data.Value
                    }
                    filtered = $filter('filter')(globalUtility.SelectedFreqTech, function (value, index) { return value.FrequencyTechId == data.Id; });
                    if (filtered.length === 0) globalUtility.SelectedFreqTech.push(refiner);
                }
                if (data.Type === 'ApplicationType') {
                    refiner = {
                        ApplicationTypeId: data.Id,
                        ApplicationTypeName: data.Value
                    }
                    filtered = $filter('filter')(globalUtility.SelectedApplicationType, function (value, index) { return value.ApplicationTypeId == data.Id; });
                    if (filtered.length === 0) globalUtility.SelectedApplicationType.push(refiner);
                }
                if (data.Type === 'Region') {
                    refiner = {
                        RegionId: data.Id,
                        RegionName: data.Value
                    }
                    filtered = $filter('filter')(globalUtility.SelectedRegion, function (value, index) { return value.RegionId == data.Id; });
                    if (filtered.length === 0) {
                        globalUtility.SelectedRegion.push(refiner);
                    }
                }
                if (data.Type === 'Country') {
                    refiner = {
                        id: data.Id,
                        label: data.Value
                    }
                    filtered = $filter('filter')(globalUtility.SelectedCountry, function (value, index) { return value.id == data.Id; });
                    if (filtered.length === 0) globalUtility.SelectedCountry.push(refiner);
                }
                if (data.Type === 'CertScheme' || data.Type === 'ComplianceProgram') {
                    refiner = {
                        SchemaId: data.Id,
                        SchemaName: data.Value
                    }
                    filtered = $filter('filter')(globalUtility.SelectedComplianceProgram, function (value, index) { return value.SchemaId == data.Id; });
                    if (filtered.length === 0) globalUtility.SelectedComplianceProgram.push(refiner);
                }
                if (data.Type === 'ProductType') {
                    refiner = {
                        ProductTypeId: data.Id,
                        ProductName: data.Value
                    }
                    filtered = $filter('filter')(globalUtility.SelectedProductType, function (value, index) { return value.ProductTypeId == data.Id; });
                    if (filtered.length === 0) globalUtility.SelectedProductType.push(refiner);
                }
            },

            RemoveFromGlobalRefiners: function (data) {
                if (data.Type === 'CoveredSector' || data.Type === 'SectorRegulated') {
                    var index = globalUtility.SelectedSector.map(function (s) { return s.CoveredSectorId }).indexOf(data.Id);
                    while (index !== -1) {
                        globalUtility.SelectedSector.splice(index, 1);
                        index = globalUtility.SelectedSector.map(function (s) { return s.CoveredSectorId }).indexOf(data.Id);
                    }
                }
                if (data.Type === 'FrequencyTech') {
                    var index = globalUtility.SelectedFreqTech.map(function (s) { return s.FrequencyTechId }).indexOf(data.Id);
                    while (index !== -1) {
                        globalUtility.SelectedFreqTech.splice(index, 1);
                        index = globalUtility.SelectedFreqTech.map(function (s) { return s.FrequencyTechId }).indexOf(data.Id);
                    }

                }
                if (data.Type === 'ApplicationType') {
                    var index = globalUtility.SelectedApplicationType.map(function (s) { return s.ApplicationTypeId }).indexOf(data.Id);
                    while (index !== -1) {
                        globalUtility.SelectedApplicationType.splice(index, 1);
                        index = globalUtility.SelectedApplicationType.map(function (s) { return s.ApplicationTypeId }).indexOf(data.Id);
                    }
                }
                if (data.Type === 'Region') {
                    var index = globalUtility.SelectedRegion.map(function (s) { return s.RegionId }).indexOf(data.Id);
                    while (index !== -1) {
                        globalUtility.SelectedRegion.splice(index, 1);
                        index = globalUtility.SelectedRegion.map(function (s) { return s.RegionId }).indexOf(data.Id);
                    }
                }
                if (data.Type === 'Country') {
                    var index = globalUtility.SelectedCountry.map(function (s) { return s.id }).indexOf(data.Id);
                    while (index !== -1) {
                        globalUtility.SelectedCountry.splice(index, 1);
                        index = globalUtility.SelectedCountry.map(function (s) { return s.id }).indexOf(data.Id);
                    }
                }
                if (data.Type === 'CertScheme' || data.Type === 'ComplianceProgram') {
                    var index = globalUtility.SelectedComplianceProgram.map(function (s) { return s.SchemaId }).indexOf(data.Id);
                    while (index !== -1) {
                        globalUtility.SelectedComplianceProgram.splice(index, 1);
                        index = globalUtility.SelectedComplianceProgram.map(function (s) { return s.SchemaId }).indexOf(data.Id);
                    }
                }
                if (data.Type === 'ProductType') {
                    var index = globalUtility.SelectedProductType.map(function (s) { return s.ProductTypeId }).indexOf(data.Id);
                    while (index !== -1) {
                        globalUtility.SelectedProductType.splice(index, 1);
                        index = globalUtility.SelectedProductType.map(function (s) { return s.ProductTypeId }).indexOf(data.Id);
                    }
                }
            }
            //-END GLOBAL REFINERS


        };

        return svc;

    }]);

});