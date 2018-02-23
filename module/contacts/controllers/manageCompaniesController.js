
define([
	'app',
	'globalUtility',
    'enums'
], function (app, globalUtility, enums) {

    app.register.controller('manageCompaniesController', ['$scope', '$http', '$rootScope', 'baseService', 'dialogService', 'bsAlertService', 'contactsService', 'items', '$uibModalInstance', '$location', '$anchorScroll',
    function ($scope, $http, $rootScope, baseService, dialogService, bsAlertService, contactsService, items, $uibModalInstance, $location, $anchorScroll) {

        $scope.hasErrors = '';



        $scope.email = "";

        //error variables
        $scope.nameHasErrors = false;
        $scope.addressHasErrors = false;
        $scope.cityHasErrors = false;
        $scope.postalCodeHasErrors = false;
        $scope.countryHasErrors = false;
        $scope.regionHasErrors = false;
        $scope.organizationTypeHasErrors = false;
        $scope.regulatoryCategoryHasErrors = false;
        $scope.websiteHasErrors = false;







        $scope.init = function () {

            $scope.modalTitle = "MANAGE COMPANIES";

            $scope.editCompanySectionVisible = false;
            $scope.showEditCompanySection = function() {
                $scope.editCompanySectionVisible = true;
                $scope.addCompanySectionVisible = false;
                
            };

            $scope.addCompanySectionVisible = false;
            $scope.showAddCompanySection = function() {
                $scope.addCompanySectionVisible = true;
                $scope.editCompanySectionVisible = false;
                $scope.declareItems();
            };

            $scope.showErrors = false;

            $scope.searchResults = [];

            $scope.search = function () {
                $scope.searchResults = [];

                if ($scope.items.CompanyToSearchFor.trim().length === 0) {
                    return;
                }

                var params = {
                    companyName: $scope.items.CompanyToSearchFor
                };

                contactsService.searchCompany(params,
                    function (companies) {
                        angular.forEach(companies.Data,
                            function (company) {
                                $scope.searchResults.push(company);
                            });
                    });

                //TODO: later for edit
                //contactsService.getCompanyDetails(params,
                //    function (response) {
                //        if (response.Success) {
                //            $scope.items.Sector = response.Data.SectorRegulated;
                //            $scope.items.Region = response.Data.Region;
                //            $scope.items.Country = response.Data.Country;
                //            $scope.items.OrganizationType = response.Data.OrganizationType;
                //            $scope.items.Address = response.Data.Address;
                //            $scope.items.City = response.Data.City;
                //            $scope.items.PostalCode = response.Data.PostalCode;
                //            $scope.items.Website = response.Data.Website;
                //        }
                //    });
            }

            //$scope.typeAheadSelect = function(item, model, label, event) {
            //    var params = {
            //        companyId: item.CompanyItemId
            //    };

            //    debugger;
            //    contactsService.getCompanyDetails(params,
            //        function(response) {
            //            if (response.Success) {
            //                $scope.items.Sector = response.Data.SectorRegulated;
            //                $scope.items.Region = response.Data.Region;
            //                $scope.items.Country = response.Data.Country;
            //                $scope.items.OrganizationType = response.Data.OrganizationType;
            //                $scope.items.Address = response.Data.Address;
            //                $scope.items.City = response.Data.City;
            //                $scope.items.PostalCode = response.Data.PostalCode;
            //                $scope.items.Website = response.Data.Website;
            //            }
            //        });
            //};

            $scope.declareItems();

            $scope.Regions = items.Regions;
            $scope.Countries = items.Countries;
            $scope.Companies = items.Company;
            $scope.Sectors = items.Sectors;
            $scope.OrganizationTypes = items.OrganizationType;


        };

        $scope.declareItems = function() {
            $scope.items = {
                CompanyItemId: '',
                CompanyName: '',
                Address: '',
                City: '',
                PostalCode: '',
                Country: '',
                Region: '',
                OrganizationType: '',
                RegulatoryCategory: '',
                Website: '',
                //Sector: '',
                CompanyToSearchFor: '',
                Contacts: []
            };
        };

        $scope.editCompany = function (companyName, companyId) {
            if (companyName && companyId) {
                baseService.IsBusy(true);
                contactsService.getCompanyDetails({ companyId: companyId },
                    function (response) {
                        if (response.Success) {
                            $scope.items.CompanyItemId = companyId;
                            $scope.items.CompanyName = companyName;
                            $scope.items.Address = response.Data.Address ? response.Data.Address : '';
                            $scope.items.City = response.Data.City ? response.Data.City : '';
                            $scope.items.PostalCode = response.Data.PostalCode ? response.Data.PostalCode : '';
                            if (response.Data.Country) {
                                $scope.items.Country = $scope.Countries.filter(function (item) {
                                    return item.CountryName === response.Data.Country;
                                })[0].CountryItemId;
                            }

                            if (response.Data.Region) {
                                $scope.items.Region = $scope.Regions.filter(function (item) {
                                    return item.RegionName === response.Data.Region;
                                })[0].RegionId;
                            }

                            if (response.Data.OrganizationType) {
                                $scope.items.OrganizationType = $scope.OrganizationTypes.filter(function (item) {
                                    return item.Name === response.Data.OrganizationType;
                                })[0].Id;
                            }

                            if (response.Data.SectorRegulated) {
                                $scope.items.RegulatoryCategory = $scope.Sectors.filter(function (item) {
                                    return item.CoveredSector === response.Data.SectorRegulated;
                                })[0].CoveredSectorId;
                            }
                           

                            $scope.items.Website = response.Data.Website;
                            $scope.items.Contacts = response.Data.Contacts;
                        }

                        $scope.showEditCompanySection();
                        baseService.IsBusy(false);
                    });
            }
        };

        $scope.CloseDialog = function (result) {
            //dialogService.CloseAll("Perform Close");
            if (result === undefined) {
                $uibModalInstance.dismiss('cancel');
            }
            else if (result) {
                $uibModalInstance.close(result);
            }
            else {
                if (result.ExceptionMessage) {
                    $uibModalInstance.dismiss(result.ExceptionMessage);
                    //dialogService.CloseAll(result.ExceptionMessage);
                }
            }
            baseService.ShowOverlay(false);
        };

        $scope.Save = function () {
            if (!$scope.validate() && $scope.companyForm.$valid) {
                contactsService.saveCompany($scope.items, function (result) {
                    if (result) {
                        if (result.Success) {
                            dialogService.Dialog.Alert("Company successfully added", enums.MessageType.Success, true);

                            $scope.declareItems();
                        }
                        else {
                            if (result.Message) {
                                dialogService.Dialog.Alert(result.Message, enums.MessageType.Error, true);
                            } else {
                                dialogService.Dialog.Alert(result.ErrorMessage, enums.MessageType.Error, true);
                            }

                        }
                    }
                });
            }
        };

        $scope.validate = function () {
            var count = false;

            //CompanyName validation
            if ($scope.items.CompanyName === '' || $scope.items.CompanyName === undefined) {
                $scope.nameHasErrors = true;
                count = true;
            } else {
                $scope.nameHasErrors = false;
            }

            //Address validation
            if ($scope.items.Address === '' || $scope.items.Address === undefined) {
                $scope.addressHasErrors = true;
                count = true;
            }
            else {
                $scope.addressHasErrors = false;
            }

            //City validation
            if ($scope.items.City === '' || $scope.items.City === undefined) {
                $scope.cityHasErrors = true;
                count = true;
            }
            else {
                $scope.cityHasErrors = false;
            }

            //Postal Code validation
            if ($scope.items.PostalCode === '' || $scope.items.PostalCode === undefined) {
                $scope.postalCodeHasErrors = true;
                count = true;
            }
            else {
                $scope.postalCodeHasErrors = false;
            }

            //Country validation
            if ($scope.items.Country === '' || $scope.items.Country === undefined) {
                $scope.countryHasErrors = true;
                count = true;
            }
            else {
                $scope.countryHasErrors = false;
            }

            //Region validation
            if ($scope.items.Region === '' || $scope.items.Region === undefined) {
                $scope.regionHasErrors = true;
                count = true;
            }
            else {
                $scope.regionHasErrors = false;
            }

            //Organization Type validation
            if ($scope.items.OrganizationType === '' || $scope.items.OrganizationType === undefined) {
                $scope.organizationTypeHasErrors = true;
                count = true;
            }
            else {
                $scope.organizationTypeHasErrors = false;
            }

            //Regulatory Category
            if ($scope.items.RegulatoryCategory === '' || $scope.items.RegulatoryCategory === undefined) {
                $scope.regulatoryCategoryHasErrors = true;
                count = true;
            }
            else {
                $scope.regulatoryCategoryHasErrors = false;
            }

            //Website
            var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

            if ($scope.items.Website && $scope.items.Website.trim() !== '') {
                if (regex.test($scope.items.Website)) {
                    $scope.websiteHasErrors = false;
                } else {
                    $scope.websiteHasErrors = true;
                    count = true;
                }
            }

            return count;
        };

        $scope.GetCompany = function (val) {
            return $http.get(globalUtility.ServiceUrl + 'api/contacts/SearchCompany/', {
                params: {
                    companyName: val
                }
            }).then(function (response) {
                if (response.data.Success) {
                    return response.data.Data;
                }
            });
        }

        $scope.init();

        $scope.$on('$destroy', function () {
        });
    }]);
});
