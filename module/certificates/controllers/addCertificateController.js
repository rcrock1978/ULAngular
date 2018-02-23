
define([
	'app',
	'globalUtility',
    'enums',
    'module/certificates/model/certificateItemModel'
], function (app, globalUtility, enums,certItemModel) {

    app.register.controller('addCertificateController', ['$scope', '$uibModalInstance', '$location', '$anchorScroll', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'bsAlertService', 'certificatesService', 'items',
	    function ($scope, $uibModalInstance, $location, $anchorScroll, $http, $rootScope, $filter, baseService, dialogService, bsAlertService, certificatesService, items) {

	        $scope.applications = [];
	        $scope.fileCert = "";
	        $scope.alertMessage = "";
	        $scope.certItemId = "";

	        $scope.isLoading = false;
	        $scope.showErrors = false;
	        $scope.origRegion = "";
	        $scope.origCountry = [];

	        $scope.mode = enums.Mode.Add;
	    
	        $scope.modalTitle = "ADD CERTIFICATE";

	        //MODELS

	        $scope.certItem = certItemModel.SetDefault();

	        $scope.multiselectSettings = {
	            scrollableHeight: '200px',
	            scrollable: true
	        };

	        $scope.primaryFile = { name: '' };
	        $scope.invalidFilename = false;
	        $scope.invalidFilesize = false;
	        $scope.uploadPromptInvalidFilename = globalUtility.UploadPromptInvalidFilename;
	        $scope.uploadPromptInvalidFilesize = globalUtility.UploadPromptInvalidFilesize;

	        $scope.relatedFiles = [];
	        $scope.invalidRelatedFileName = [];
	        $scope.invalidRelatedFilesize = [];
            
	        $scope.isPFModified = false;
	        var originalData = [];
	        var success = [];
	        var errors = [];


	        var hasPristineRF = false;//has Original Related Files

	        $scope.init = function () {
	            if (items.Mode != enums.Mode.Add) {
	                if (items.Mode == enums.Mode.Edit)
	                {
	                    $scope.mode = enums.Mode.Edit;
	                }
	                else if (items.Mode == enums.Mode.Renew)
	                {
	                    $scope.mode = enums.Mode.Renew;
	                }
	                else
	                {
	                    $scope.mode = enums.Mode.Copy;
	                }
	                //$scope.mode = (items.Mode == enums.Mode.Edit) ? enums.Mode.Edit : enums.Mode.Copy;
	                if (items.Mode == enums.Mode.Copy)
	                {
	                    $scope.modalTitle = "COPY CERTIFICATE";
	                }
	                else if (items.Mode == enums.Mode.Renew)
	                {
	                    $scope.modalTitle = "RENEW CERTIFICATE";
	                }
	                else
	                {
	                    $scope.modalTitle = "EDIT CERTIFICATE";
	                }
	                //$scope.modalTitle = (items.Mode == enums.Mode.Copy) ? "COPY CERTIFICATE" : "EDIT CERTIFICATE";
	            }
	            initializeItems();
	        };

	        var initializeItems = function () {
	            $scope.sectors = [];
	            $scope.countries = [];
	            $scope.certificationSchemes = [];
	            $scope.applicants = [];
	            $scope.regions = [];
	            $scope.certificateOrganizations = [];

	            $scope.certificateStatus = [];
	            $scope.certificateBusinessStatus = [];
	            $scope.productTypes = [];
	            $scope.productSubTypes = [];
	            $scope.wireless = [];
	            $scope.standards = [];
	            $scope.subContractors = [];
	            $scope.pocs = [];

	            $scope.origRegion = "";
	            $scope.origCountry = [];
	            $scope.disableWireless = true;

	            angular.forEach(items.LookUps.CertificateStatus, function (item) {
	                this.push({ Id: item.StatusTypeId, Text: item.StatusName, Selected: false });
	            }, $scope.certificateStatus);

	            angular.forEach(items.LookUps.CertificateSchemes, function (item) {
	                this.push({ Id: item.SchemaId, Text: item.SchemaName, Selected: false });
	            }, $scope.certificationSchemes);

	            angular.forEach(items.LookUps.Regions, function (item) {
	                this.push({ Id: item.RegionId, Text: item.RegionName, Selected : false });
	            }, $scope.regions);

	            //angular.forEach(items.LookUps.Companies, function (item) {
	            //    this.push({ Id: item.CompanyItemId, Text: item.CompanyName, Selected : false });
	            //}, $scope.applicants);

	            angular.forEach(items.LookUps.CertificateOrganizations, function (item) {
	                this.push({ Id: item.OrganizationId, Text: item.OrganizationName, Selected : false });
	            }, $scope.certificateOrganizations);

                angular.forEach(items.LookUps.Sectors, function (sector) {
                    this.push({ id: sector.CoveredSectorId, label: sector.CoveredSector });
                },  $scope.sectors);               

                angular.forEach(items.LookUps.CertificateBusinessStatus, function (item) {
                    this.push({ Id: item.CertificateBusinessStatusTypeId, Text: item.CertificateBusinessStatusType, Selected: false });
                }, $scope.certificateBusinessStatus);

                angular.forEach(items.LookUps.ProductTypes, function (item) {
                    this.push({ Id: item.ProductTypeId, Text: item.ProductName, Selected: false });
                }, $scope.productTypes);

                angular.forEach(items.LookUps.ProductSubTypes, function (item) {
                    this.push({ Id: item.ProductSubTypeId, Text: item.ProductSubTypeName, Selected: false });
                }, $scope.productSubTypes);

                angular.forEach(items.LookUps.Wireless, function (item) {
                    this.push({ id: item.WirelessTechnologyId, label: item.WirelessTechnologyName, Selected: false });
                }, $scope.wireless);

                angular.forEach(items.LookUps.Standards, function (item) {
                    this.push({ id: item.StandardId, label: item.StandardName, sector: item.CoveredSectorId, Selected: false });
                }, $scope.standards);

                angular.forEach(items.LookUps.Subcontractors, function (item) {
                    this.push({ Id: item.SubContractorItemId, Text: item.SubcontractorName, Selected: false });
                }, $scope.subContractors);

                angular.forEach(items.LookUps.PointOfCustomers, function (item) {
                    this.push({ Id: item.PointOfContactTypeId, Text: item.PointOfContactName, Selected: false });
                }, $scope.pocs);

                if ($scope.mode != enums.Mode.Add) {
	                originalData = angular.copy(items.Data);
	                loadCertificateDetail(items.Data);
	            }
	        };

	        var onGetCertificateDetailByItemId_Completed = function (response) {
	            var param = {
	                certificateItemId: response.Data.CertificateItemId
	            };

	            $scope.certItem = certItemModel.Set(response.Data, $scope.mode);
	            $scope.certItem.OldCertificateItemId = null;
	            if ($scope.mode == enums.Mode.Renew)
	                $scope.certItem.OldCertificateItemId = response.Data.CertificateItemId;
	            
	            $scope.certItem.customer.CompanyItemId = $scope.certItem.CompanyItemId;
	            $scope.certItem.customer.CompanyName = $scope.certItem.CompanyName;

	            $scope.disableWireless = ($filter('filter')($scope.certItem.SelectedSectors, function (value, index) {
	                                        return value.id == 1;})).length == 0;
	   
	            $scope.origRegion = angular.copy($scope.certItem.RegionId);
	            getOrigCountries(response.Data.Countries);

	            $scope.LoadStandards();
	            $scope.LoadCountries(response.Data.Countries);

	            var onSuccess = function (response) {
	                if (response.IsSuccess) {
	                    $scope.primaryFile = { name: response.DocumentPaths.PrimaryFiles[0] };
	                    $scope.isPFModified = false;
	                    var relatedFiles = [];
	                    angular.forEach(response.DocumentPaths.RelatedFiles, function (doc) {
	                        this.push({ name: doc, fileTypeIcon: globalUtility.GetFileTypeIcon(doc), pristine: true })
	                    },relatedFiles)

	                    if (relatedFiles.length > 0) {
	                        hasPristineRF = true;
	                        $scope.relatedFiles = angular.copy(relatedFiles);
	                    }
	                }
	                if ($scope.mode == enums.Mode.Copy) {
	                    $scope.primaryFile.name = '';
	                    $scope.relatedFiles = [];
	                }
	                baseService.IsBusy(false);
	            };

	            if ($scope.mode == enums.Mode.Edit)
	                certificatesService.GetSourceDocuments(param, onSuccess);
	            else
	                baseService.IsBusy(false);
	        };

	        var loadCertificateDetail = function (data) {
	            var param = {
	                certificateItemId: data.CertificateItemId
	            };
	            baseService.IsBusy(true);
	            certificatesService.GetByItemId(param, onGetCertificateDetailByItemId_Completed);
	        };

	        $scope.GetCompany = function (val) {
	            return $http.get(globalUtility.ServiceUrl + 'api/certificates/GetAllLookupsForCustomers/', {
	                    params: {
	                    partyName: val
	                    }
	                    }).then(function (response) {
	                if (response.data.Success) {
	                    return response.data.Data.CertificateCompanies;
	            }
	        });
	        }

	        $scope.LoadCountries = function (selectedCountries) {
	            $scope.countries = [];

	            angular.forEach(items.LookUps.Countries, function (country) {
	                if (country.RegionItemId == $scope.certItem.RegionId) {
	                    this.push({ id: country.CountryItemId, label: country.CountryName });
	                }
	            }, $scope.countries);

	            if (selectedCountries) {
	                angular.forEach(selectedCountries, function (country) {
	                    var temp = $filter('filter')(items.LookUps.Countries, function (value, index) { return value.CountryItemId == country.CountryItemId; });
	                    if (temp.length > 0) {
	                        if (temp[0].RegionItemId == $scope.certItem.RegionId) {
	                            this.push({ id: country.CountryItemId, label: country.CountryName });
	                        }
	                    }	                  
	                }, $scope.certItem.SelectedCountries);
	            } 
	            else
	            {
	                if ($scope.origRegion == $scope.certItem.RegionId) {
	                    if (angular.equals($scope.origCountry, $scope.certItem.SelectedCountries)) {
	                    $scope.certItem.SelectedCountries;
	                }
	                    else
	                    {
	                        $scope.certItem.SelectedCountries = [];
                        }
	                }
	                else
	                {
                        $scope.certItem.SelectedCountries = [];
                    }
	            }
	        };  

	        var getOrigCountries = function (selectedCountries) {
	            $scope.origCountry = [];
	            angular.forEach(selectedCountries, function (country) {
	                var temp = $filter('filter')(items.LookUps.Countries, function (value, index) { return value.CountryItemId == country.CountryItemId; });
	                if (temp.length > 0) {
	                    if (temp[0].RegionItemId == $scope.certItem.RegionId) {
	                        this.push({ id: country.CountryItemId, label: country.CountryName });
	                    }
	                }
	            }, $scope.origCountry);
	        };

	        $scope.LoadStandards = function () {
	            $scope.optionStandards = [];
	            selectedSectors = "|" + $scope.certItem.SelectedSectors.map(function (value, index) {return value.id;}).join("|") + "|";
	            angular.forEach($scope.standards, function (standard) {
	                if (selectedSectors.indexOf("|" + standard.sector + "|") >= 0) {
	                    this.push(standard);
                    }
	            }, $scope.optionStandards);

	            selectedStandards = angular.copy($scope.certItem.SelectedStandards);
	            $scope.certItem.SelectedStandards = [];
	            angular.forEach(selectedStandards, function (selected) {
	                var temp = $filter('filter')($scope.optionStandards, function (value, index) { return value.id == selected.id; });
                    if (temp.length != 0)
                    {
                        var item = temp[0];
                        $scope.certItem.SelectedStandards.push({ id: item.id, label: item.label, sector: item.sector });
                    }
	            }, $scope.certItem.SelectedStandards);
            }

	        $scope.CloseDialog = function () {
	            dialogService.CloseAll();
	        };

	        $scope.validateExpirationDateMessage = "";
	        $scope.validateIssueDateMessage = "";

	        $scope.ValidateIssueDate = function () {
	            $scope.validateIssueDateMessage = null;
	            if (globalUtility.IsNullOrWhiteSpace($scope.certItem.IssueDate)) {
	                $scope.validateIssueDateMessage = "Issue Date is Required";
	                return true;
	            }
               
	            var valDate = new Date($scope.certItem.IssueDate);
	            if (valDate.toDateString() == "Invalid Date") {
	                $scope.validateIssueDateMessage = "Invalid Date Format";
	                return true;
	            }

	            return false;
	        };
	        $scope.ValidateExpirationDate = function () {

	            $scope.validateExpirationDateMessage = null;
	            if ($scope.certItem.IsExpirationDateNotApplicable) return false;
	            if (globalUtility.IsNullOrWhiteSpace($scope.certItem.ExpirationDate)) {
	                $scope.validateExpirationDateMessage = "Expiration Date is Required";
	                return true;
	            }
	            var valDate = new Date($scope.certItem.ExpirationDate);
	            if (valDate.toDateString() == "Invalid Date") {
	                $scope.validateExpirationDateMessage = "Invalid Date Format";
	                return true;
	            }
	            return false;
	        };

	        $scope.FromDateChanged = function () {
	            if (globalUtility.IsNullOrWhiteSpace($scope.certItem.IssueDate))return;
	            $scope.certItem.ExpirationDateMinDAte = new Date($scope.certItem.IssueDate);
	        };

	        $scope.ToDateChanged = function () {
	            if (globalUtility.IsNullOrWhiteSpace($scope.certItem.ExpirationDate))return;
	            $scope.certItem.IssueDateMaxDate = new Date($scope.certItem.ExpirationDate);
	        };

	        $scope.ToggleExpirationDate = function () {
	            if ($scope.certItem.IsExpirationDateNotApplicable) {
	                $scope.certItem.ExpirationDate = "";
	                $scope.hideme = true;
	            } else {
	                $scope.hideme = false;
                }
	        };

	        $scope.ToggleWirelessOptions = function (property) {	            
	            var temp = $filter('filter')($scope.certItem.SelectedSectors, function (value, index) { return value.id == 1; });
	            $scope.disableWireless = undefined == property || temp.length == 0 || (temp.length != 0 && temp[0].id != 1);
	            if ($scope.disableWireless) {
	                $scope.certItem.SelectedWireless = [];
	            }
	            $scope.LoadStandards();
	        };

	        var validation = function (hasError) {
	            var hasError = hasError | ($scope.ValidateIssueDate() |
                                    $scope.ValidateExpirationDate() |
                                    (undefined == $scope.certItem.SelectedSectors || $scope.certItem.SelectedSectors.length == 0) |
                                    (undefined == $scope.certItem.SelectedCountries || $scope.certItem.SelectedCountries.length == 0) |
                                    (undefined == $scope.certItem.CertificateSchemaId || $scope.certItem.CertificateSchemaId.length == 0) |
                                    (undefined == $scope.certItem.RegionId || $scope.certItem.RegionId.length == 0) |
                                    (undefined == $scope.certItem.customer || $scope.certItem.customer.CompanyItemId.length == 0) |
                                    (undefined == $scope.certItem.Status || $scope.certItem.Status.length == 0) |
                                    ((undefined == $scope.primaryFile.name || (undefined != $scope.primaryFile.name && $scope.primaryFile.name.length == 0)) ||
                                        ($scope.primaryFile.name.length != 0 && ($scope.invalidFilename = InvalidFilename($scope.primaryFile.name))) |
                                        ($scope.invalidFilesize = InvalidFilesize($scope.primaryFile.size))) |
                                    InvalidRelatedFile()
                                        );
	            return hasError;
	        }

	        var InvalidFilename = function (filename) {
	            filename = angular.lowercase(filename);
	            var regex = new RegExp("^([\\w\\s()-\\.]+)+\\.(?!(" + globalUtility.UploadExcludeExtension.join("$|") + "$" + "))[\\w\\s()]+$|^([\\w\\s()-]+)$");
	            return !(regex.test(filename));
	        }

	        var InvalidFilesize = function (filesize) {
	            if (filesize == 0) {
	                return (filesize == 0 | filesize == undefined) | filesize > globalUtility.UploadSize;
	        }
	            else {
	                return (filesize == undefined ? 0 : filesize) > globalUtility.UploadSize
	                //return (filesize == 0 | filesize == undefined) | filesize > globalUtility.UploadSize;
                }

	        }

	        var InvalidRelatedFile = function () {
	            var pristine = $filter('filter')($scope.relatedFiles, function (value, index) { return value.pristine == false; })

	            $scope.invalidRelatedFileName = $filter('filter')(pristine, function (value, index) { return InvalidFilename(value.name); })
	            $scope.invalidRelatedFilesize = $filter('filter')(pristine, function (value, index) { return InvalidFilesize(value.size); })

	            return $scope.invalidRelatedFileName.length != 0 || $scope.invalidRelatedFilesize.length != 0;
	        }

	        $scope.Save = function (hasError) {

	            if ($scope.showErrors=validation(hasError)) {
	                $location.hash("top");
	                $anchorScroll();

	                $scope.uploadPromptInvalidRelatedFilename = $scope.uploadPromptInvalidFilename + ' [' +
                                                                    ($scope.invalidRelatedFileName.map(function (value, index) {
                                                                        return value.name;})).join(" ,") + ']';
	                $scope.uploadPromptInvalidRelatedFilesize = $scope.uploadPromptInvalidFilesize + ' [' +
                                                                    ($scope.invalidRelatedFilesize.map(function (value, index) {
                                                                            return value.name;})).join(" ,") + ']';
	                return;
	            }

	            switch ($scope.certItem.CertificateOrganizationId) {
	                case (""): case (0):
	                    $scope.certItem.CertificateOrganizationId = null;
	            }
	            switch ($scope.certItem.CertificateBusinessStatusTypeId) {
	                case (""): case (0):
	                    $scope.certItem.CertificateBusinessStatusTypeId = null;
	            }
	            switch ($scope.certItem.ProductTypeId) {
	                case (""): case (0):
	                    $scope.certItem.ProductTypeId = null;
	            }
	            switch ($scope.certItem.ProductSubTypeId) {
	                case (""): case (0):
	                    $scope.certItem.ProductSubTypeId = null;
	            }
	            switch ($scope.certItem.WirelessTechnologyId) {
	                case (""): case (0):
	                    $scope.certItem.WirelessTechnologyId = null;
	            }
	            switch ($scope.certItem.OrderNumber) {
	                case (""): case (0):
	                    $scope.certItem.OrderNumber = null;
	            }

	            baseService.IsBusy(true);
	            errors = [];
	            SaveCertificateToDB();
	            //  SavePrimaryFile();
	        };

	        var showErrorMessage = function (message) {
	            baseService.IsBusy(false);
	            $scope.alertType = enums.AlertType.Error;
	            $scope.alertMessage = message;
	            $location.hash("top");
	            $anchorScroll();
	        };

	        var SaveCertificateToDB = function () {
	            
	            var sectorIds = "";

	            angular.forEach($scope.certItem.SelectedSectors, function (item, idx, array) {
	                sectorIds += item.id;
	                if (idx !== array.length - 1) sectorIds += ",";
	            });

	            var selCountries = "";
	            angular.forEach($scope.certItem.SelectedCountries, function (item, idx, array) {
	                selCountries += item.id;
	                if (idx !== array.length - 1) selCountries += ",";
	            });

	            var selWireless = "";
	            angular.forEach($scope.certItem.SelectedWireless, function (item, idx, array) {
	                selWireless += item.id;
	                if (idx != array.length - 1) selWireless += ",";
	            });

	            var selStandards = "";
	            angular.forEach($scope.certItem.SelectedStandards, function (item, idx, array) {
	                selStandards += item.id;
	                if (idx != array.length - 1) selStandards += ",";
	            });

	            var iDate = new Date($scope.certItem.IssueDate);
	            var eDate = new Date($scope.certItem.ExpirationDate);
	            var certParam = {
	                CertificateItemId: $scope.certItem.CertificateItemId,
	                CoveredSectorId: sectorIds,
	                RegionItemId: $scope.certItem.RegionId,
	                CountryItemId: selCountries,
	                CertificateSchemeItemId: $scope.certItem.CertificateSchemaId,
	                CertificateOrganisationItemId: $scope.certItem.CertificateOrganizationId, 
	                CertificateNumber: $scope.certItem.CertificateNumber,
	                CertificateStatusTypeId: $scope.certItem.Status,
	                Manufacturer: $scope.certItem.Manufacturer,
	                CustomerItemId: null,
	                LicenseHolder: $scope.certItem.LicenseHolder,
	                Factory: $scope.certItem.Factory,
	                Model: $scope.certItem.Model,
	                BrandName: $scope.certItem.BrandName,
	                IssueDate: (iDate.getMonth() + 1) + "/" + iDate.getDate() + "/" + iDate.getFullYear(),
	                ExpirationDate: (eDate.getMonth() + 1) + "/" + eDate.getDate() + "/" + eDate.getFullYear(),
	                StandardId: selStandards,
	                AgentName: $scope.certItem.AgentName,
	                IsExpirationDateApplicable: !$scope.certItem.IsExpirationDateNotApplicable,
	                CertificateTypeItemId: null,
	                AddedOrModifiedBy: globalUtility.CurrentUser,
	                BusinessStatusTypeId: $scope.certItem.CertificateBusinessStatusTypeId,
	                OrderNo: $scope.certItem.OrderNumber,
	                ProductTypeId: $scope.certItem.ProductTypeId, 
	                ProductSubTypeId: $scope.certItem.ProductSubTypeId, 
	                WirelessTechnologyId: selWireless,
	                POC: $scope.certItem.POCId,
	                Subcontractor: $scope.certItem.SubContractorItemId,
	                CompanyItemId: $scope.certItem.customer.CompanyItemId,
	                OldCertificateItemId: $scope.certItem.OldCertificateItemId
	            };

	            certificatesService.SaveCertificate(certParam, onSaveCertificate_Completed);
	        };

	     
	        var onSaveCertificate_Completed = function (response) {
	            if (response.Success && response.Data.IsSuccess) {
	                $scope.certItemId = "";
	                $scope.certItemId = response.Data.CertificateItemId;
	              //  $scope.CloseDialog();
	                //  baseService.Publish("certificates:addCertificates", response);
	                success.push(response.Data.Message);
	                SavePrimaryFile();
	            } else {   
	                showErrorMessage(response.ErrorMessage || response.Data.Message);
	            }

	        };

	        $scope.onSelect = function (e) {
	            var message = $.map(e.files, function (file) { return file.name; }).join(", ");
	        }

            //-PRIVATE METHODS
	        var SavePrimaryFile = function () {
	            var onSucess = function (response) {
	                if (response) {
	                    if (!response.IsSuccess)
	                        errors.push("Saving primary file failed.");
	                    else
	                        success.push("Related files successfuly saved.")
	                }
	                else
	                {
	                    errors.push("Saving primary file failed.");
	                }
	                SaveRelatedFiles();
	            };

	            if ($scope.isPFModified) {
	                var reader = new FileReader();
	                reader.onloadend = function () {
	                    if (reader.readyState == 2) {
	                        var arrayString = reader.result;
	                        var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                        var param = {
	                            CertificateItemId: $scope.certItemId,
	                            File: base64String.match(/.{1,255}/g),
	                            //FileArray: longInt8View,
	                            Filename: $scope.primaryFile.name,
	                            SubFolderName: 'PrimaryFiles',
	                            ApplicationId: globalUtility.AppId,
	                            HasPristine: false
	                        };

	                        certificatesService.SaveDocument(param, onSucess);
	                    }

	                };

	                reader.readAsArrayBuffer($scope.primaryFile);
	            } else {
	                SaveRelatedFiles();
	            }

	        };

	        var SaveRelatedFiles = function (saveResponse) {
	            var relatedFiles = [];
	            if ($scope.relatedFiles.length > 0) {

	                var pristine = $filter('filter')($scope.relatedFiles, function (value, index) { return value.pristine == true; })
	                var hasPristine = (pristine.length  > 0);
	                angular.forEach($scope.relatedFiles, function (file) {
	                    if (file.pristine) {
	                        var param = {
	                            CertificateItemId: $scope.certItemId,
	                            File: "",
	                            Filename: file.name,
	                            SubFolderName: 'RelatedFiles',
	                            HasPristine: hasPristine
	                        };
	                        relatedFiles.push(param);
	                        if (relatedFiles.length == $scope.relatedFiles.length) {
	                            certificatesService.SaveDocuments(relatedFiles, onSaveRelatedFilesCompleted);
	                        }
	                    } else {
	                        var reader = new FileReader();
	                        reader.onloadend = function () {
	                            if (reader.readyState == 2) {

	                                var arrayString = reader.result;
	                                var base64String = globalUtility.ArrayBufferToBase64String(arrayString);

	                                var param = {
	                                    CertificateItemId: $scope.certItemId,
	                                    File: base64String.match(/.{1,100}/g),
	                                    Filename: file.name,
	                                    SubFolderName: 'RelatedFiles',
	                                    HasPristine: hasPristine
	                                };
	                                relatedFiles.push(param);
	                                if (relatedFiles.length == $scope.relatedFiles.length) {
	                                    certificatesService.SaveDocuments(relatedFiles, onSaveRelatedFilesCompleted);
	                                }
	                            }

	                        };
	                        reader.readAsArrayBuffer(file.file);
	                    }

	                });

	            }
	            else {
	                if (hasPristineRF) {
	                    var param = {
	                        certificateItemId: $scope.certItemId,
	                        subfolderName: "RelatedFiles"
	                    };
	                    certificatesService.DeleteDocuments(param, onSaveRelatedFilesCompleted);

	                } else {
	                    saveCompleted();
	                }
	            }
	        };

	        var onSaveRelatedFilesCompleted = function (response) {
	            if (response) {
	                if (!response.IsSuccess) errors.push("Saving related files failed.");
	                else success.push("Related files successfuly saved.")
	            } else {
	               errors.push("Saving related files failed.");
	            }
	          
	            saveCompleted();
	        };

	        var saveCompleted = function () {
	            $scope.CloseDialog();
	            baseService.Publish("certificates:addCertificates", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	        };
           
	    
            //END -PRIVATE METHODS

	        $scope.init();

	        $scope.$on('$destroy', function () {

	            var events = [''];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
