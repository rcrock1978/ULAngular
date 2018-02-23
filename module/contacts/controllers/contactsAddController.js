
define([
	'app',
	'globalUtility',
    'enums'
], function (app, globalUtility, enums) {

    app.register.controller('contactsAddController', ['$scope', '$http', '$rootScope', 'baseService', 'dialogService', 'bsAlertService', 'contactsService', 'items', '$uibModalInstance', '$location', '$anchorScroll',
    function ($scope, $http, $rootScope, baseService, dialogService, bsAlertService, contactsService, items, $uibModalInstance, $location, $anchorScroll) {

	        $scope.hasErrors = '';

	        $scope.mode = enums.Mode.Add;

	        $scope.modalTitle = "";
	        $scope.email = "";

	        //error variables
	        $scope.companyHasErrors = false;
	        $scope.contactTypeHasErrors = false;
	        $scope.firstnameHasErrors = false;
	        $scope.lastnameHasErrors = false;
	        $scope.emailAddressHasErrors = false;

	        var saveResult = function (data) {
	            //refresh list
	            if (data) {
	                if (data.Success === true) {
	                    $uibModalInstance.close(data);
	                    baseService.ShowOverlay(false);	                    
	                }
	                else {
	                    dialogService.Dialog.Alert(data.ErrorMessage, enums.MessageType.Error, true);
	                }
	            }
	        };

	        var onGetCompanyDetails_Completed = function (response) {
	            if(response.Success) {
	                $scope.items.Sector = response.Data.SectorRegulated;
	                $scope.items.Region = response.Data.Region;
	                $scope.items.Country = response.Data.Country;
	                $scope.items.OrganizationType = response.Data.OrganizationType;
	                $scope.items.Address = response.Data.Address;
	                $scope.items.City = response.Data.City;
	                $scope.items.PostalCode = response.Data.PostalCode;
	                $scope.items.Website = response.Data.Website;
	            }
	        }

	        $scope.typeAheadSelect = function (item, model, label, event) {	            
	            var params = {
	                companyId : item.CompanyItemId
	            };

	            contactsService.getCompanyDetails(params, onGetCompanyDetails_Completed)
	        }

	        var onGetContactTypes_Completed = function (response) {
	            if(response.Success){
	                $scope.ContactTypes = response.Data;
	            }	            
	        }	 

	        $scope.init = function () {
	            $scope.Regions = items.Regions;
	            $scope.Countries = items.Countries;
	            $scope.Companies = items.Company;
	            $scope.Sectors = items.Sectors;

	            if (items.Record != null || items.Record != undefined) {
	                $scope.email = items.Record.Email;
	                $scope.items = items.Record;
	                $scope.mode = enums.Mode.Edit;
	                $scope.modalTitle = "EDIT CONTACTS";
	            }
	            else {
	                $scope.mode = enums.Mode.Add;
	                $scope.modalTitle = "ADD CONTACTS";
	                $scope.items = {
	                    Sector: '',
	                    Region: '',
	                    Country: '',
	                    OrganizationType: '',
	                    CompanyName: '',
	                    Firstname: '',
	                    Lastname: '',
	                    ContactType: '0',
	                    Address: '',
	                    City: '',
	                    PostalCode: '',
	                    TelNo: '',
	                    Mobile: '',	                    
	                    Skype: '',
	                    Email: '',
	                    Title: '',	                    
	                    Website: '',
	                    Note: ''
	                };
	            };

	            contactsService.getContactTypes({}, onGetContactTypes_Completed);
	        };

	        $scope.CloseDialog = function (result) {
	            //dialogService.CloseAll("Perform Close");
	            if (result === undefined) {	                
	                $uibModalInstance.dismiss('cancel');	                
	            }
	            else if(result === true) {
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
	            var emailExistCount = 0;
	            if (!$scope.validate() && $scope.contactsForm.$valid) {
	                //alert('save called!');
	                angular.forEach(items.EmailList, function (email) {
	                    if (email == $scope.items.Email) {
	                        emailExistCount++;
	                    }
	                });
	                if ($scope.modalTitle == "ADD CONTACTS") {
	                    if (emailExistCount <= 0) {
	                        contactsService.saveContact($scope.items, saveResult);
	                    }
	                    else {
	                        var emailExist = true;
	                        $scope.showErrors = emailExist;
	                        if (emailExist) {
	                            $location.hash("top");
	                            $anchorScroll();
	                            return;
	                        }
	                    }
	                }
	                else {
	                    if ($scope.email == $scope.items.Email || emailExistCount <= 0) {
	                        contactsService.saveContact($scope.items, saveResult);
	                    }
	                    else {
	                        var emailExist = true;
	                        $scope.showErrors = emailExist;
	                        if (emailExist) {
	                            $location.hash("top");
	                            $anchorScroll();
	                            return;
	                        }
	                    }
	                }
	            }
	        };

	        $scope.validate = function () {
	            var count = false;

                //company validation
	            if ($scope.items.Company === '' || $scope.items.Company === undefined) {
	                $scope.companyHasErrors = true;
	                count = true;
	            }
	            else if ($scope.items.Company.CompanyName === '') {
	                $scope.companyHasErrors = true;
	                count = true;
	            }
	            else {
	                $scope.companyHasErrors = false;
	            }

                //contactType validation
	            if ($scope.items.ContactTypeId === '0' || $scope.items.ContactTypeId === undefined) {
	                $scope.contactTypeHasErrors = true;
	                count = true;
	            }
	            else {
	                $scope.contactTypeHasErrors = false;
	            }

	            //firstname validation
	            if ($scope.items.Firstname === '' || $scope.items.Firstname === undefined) {
	                $scope.firstnameHasErrors = true;
	                count = true;
	            }
	            else {
	                $scope.firstnameHasErrors = false;
	            }

	            //firstname validation
	            if ($scope.items.Lastname === '' || $scope.items.Lastname === undefined) {
	                $scope.lastnameHasErrors = true;
	                count = true;
	            }
	            else {
	                $scope.lastnameHasErrors = false;
	            }

	            //email validation
	            if ($scope.items.Email === '' || $scope.items.Email === undefined) {
	                $scope.emailAddressHasErrors = true;
	                count = true;
	            }
	            else {
	                $scope.emailAddressHasErrors = false;
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
