
define([
	'app',
	'globalUtility',
    'enums',
    'routeResolver',
    'module/news/model/newsItemModel',
], function (app, globalUtility, enums, routeResolver, newsItemModel) {

    app.register.controller('newsAddEditController', ['$scope', '$http', '$rootScope', 'baseService', 'dialogService', '$location', '$anchorScroll', 'newsService', 'homeService', 'items', '$filter', 'bsAlertService',
	    function ($scope, $http, $rootScope, baseService, dialogService, $location, $anchorScroll, newsService, homeService, items, $filter, bsAlertService) {

	        //$scope.mode = enums.Mode.Add;
	        //$scope.modalTitle = 'ADD NEWS';
	        $scope.ArticleErrors = false;
	        $scope.articlePicture = "";
	        $scope.canSubmitItem = false; //Use to enable submit/publish button
	        $scope.isButtonDisabled = false; //to enable submit
	        $scope.coordinatorAdmin = false;
	        $scope.isAdd = true; //if add new
	        $scope.isAPModified = false;
	        $scope.isApproverReview = false;
	        $scope.isDisabled = false;
	        $scope.isMultiSelectDisabled = false;
	        $scope.isLoading = false;
	        $scope.NewsInfo = {};
	        $scope.multiselectSettings = { scrollableHeight: '200px', scrollable: true };
	        $scope.showErrors = false;
	        $scope.statusRejected = null;
	        $scope.selectedFieldList = [];
	        $scope.evidences = [];
	        $scope.isEvidenceDisabled = true;

	        //MODELS
	        $scope.newsItem = newsItemModel.SetDefault();

	        $scope.CloseDialog = function () {
	            dialogService.CloseAll("Perform Close");
	        };
	        $scope.result = '';
	        $scope.Details = '';
	        var success = [];
	        var errors = [];

	        //USED FOR DETAILS (TINYMCE)
	        $scope.tinymceOptions = {
	            plugins: 'link image code',
	            selector: '#txtDetails',
	            forced_root_block: ""
	        };

	        //DROPDOWN
	        $scope.selectedSector = [];
	        $scope.selectedCategory = '';
	        $scope.selectedRegion = '';
	        $scope.selectedRegionalEU = '';
	        $scope.selectedCountry = [];
	        $scope.selectedComplianceProgram = [];
	        $scope.selectedFrequencyTechnology = [];
	        $scope.selectedProductType = [];
	        $scope.selectedLanguage = '1';
	        $scope.selectedDocumentType = '';
	        $scope.selectedSource = '';
	        $scope.productTypes = [];
	        $scope.evidenceSelectedSource = '';

	        $scope.init = function () {
	            if (items.Mode == enums.Mode.Edit) {
	                $scope.mode = enums.Mode.Edit;
	                $scope.modalTitle = "EDIT NEWS";
	                $scope.isAdd = false;
	                if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                    $scope.buttonTitle = 'Publish';
	                    $scope.coordinatorAdmin = true;
	                    $scope.canSubmitItem = true;
	                }
	                else if (globalUtility.Contributor) {
	                    $scope.buttonTitle = 'Submit';
	                }
	                //$scope.newsItem = newsItemModel.Set(items.Data, items.Mode == enums.Mode.Edit);
	            }
	            else if (items.Mode == enums.Mode.Add) {
	                $scope.mode = enums.Mode.Add;
	                $scope.modalTitle = 'ADD NEWS';
	                $scope.isAdd = true;
	                if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                    $scope.buttonTitle = 'Publish';
	                    $scope.coordinatorAdmin = true;
	                    $scope.canSubmitItem = true;
	                }
	                else if (globalUtility.Contributor) {
	                    $scope.buttonTitle = 'Submit';
	                }
	            }
	            else if (items.Mode == enums.Mode.ReviewNews) {
	                $scope.mode = enums.Mode.ReviewNews;
	                $scope.modalTitle = 'WORKFLOW REVIEW';
                    //USER : Content Admin OR Coordinator
	                if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                    $scope.buttonTitle = 'Submit';
	                    if (items.Data.WorkflowStatusId == 5 || items.Data.WorkflowStatusId == 6) {
	                        $scope.coordinatorAdmin = false;
	                        $scope.canSubmitItem = false;
	                        $scope.isDisabled = true;
	                        $scope.isApproverReview = true;
	                        $scope.isMultiSelectDisabled = true;
	                        $scope.isEvidenceDisabled = true;
	                        $scope.isAdd = true;
	                    }
	                    else {
	                        $scope.coordinatorAdmin = true;
	                        $scope.canSubmitItem = true;
	                        $scope.isDisabled = false;
	                        $scope.isApproverReview = false;
	                        $scope.isMultiSelectDisabled = false;
	                        $scope.isEvidenceDisabled = false;
	                        $scope.isAdd = false;
	                    }
	                }

                    //USER : Contributor
	                else if (globalUtility.Contributor) {
	                    $scope.isDisabled = true;
	                    $scope.isApproverReview = true;
	                    $scope.isMultiSelectDisabled = true;
	                    $scope.isAdd = true;
	                    $scope.isEvidenceDisabled = true;
	                }

                    //USER : Translator Roles
	                else if (globalUtility.TranslatorJapanese || globalUtility.TranslatorChinese) {
	                    $scope.modalTitle = 'TRANSLATION';
	                    $scope.isDisabled = true;
	                    $scope.isApproverReview = true;
	                    $scope.isMultiSelectDisabled = true;
	                    $scope.isAdd = true;
	                    $scope.isEvidenceDisabled = true;
	                    if (globalUtility.TranslatorJapanese && items.Data.WorkflowStatusId == 6) {
	                        $scope.canSubmitItem = true;
	                        $scope.isButtonDisabled = true;
	                        $scope.buttonTitle = 'Publish';
	                    }
	                    else if (globalUtility.TranslatorChinese && items.Data.WorkflowStatusId == 5) {
	                        $scope.canSubmitItem = true;
	                        $scope.isButtonDisabled = true;
	                        $scope.buttonTitle = 'Publish';
	                    }
	                }

                    //USER : Reader OR Sales Reader
	                else if (globalUtility.Reader || globalUtility.SalesReader) {
	                    $scope.modalTitle = 'WORKFLOW REVIEW';
	                    $scope.isDisabled = true;
	                    $scope.isApproverReview = true;
	                    $scope.isMultiSelectDisabled = true;
	                    $scope.isAdd = true;
	                    $scope.isEvidenceDisabled = true;
	                }
	            }
	            initializeItems();
	        };

	        $scope.isEnable = function (value) {
	            if (value == 2 || value == 3 || value == 4) {
	                $scope.isDisabled = false;
	                $scope.isApproverReview = true;
	                $scope.isMultiSelectDisabled = true;
	                $scope.isButtonDisabled = false;
	            }
	            else {
	                $scope.isDisabled = true;
	                $scope.isApproverReview = true;
	                $scope.isMultiSelectDisabled = true;
	                $scope.isButtonDisabled = true;
	            }
	        }

	        $scope.statusChange = function (value) {
	            if (value == 'reject' && $scope.coordinatorAdmin) {
	                $scope.statusRejected = true;
	                $scope.newsItem.ItemStatusId = enums.WorkflowStatus.Rejected.Id;

	            }
	            else if (value == 'approve' && $scope.coordinatorAdmin) {
	                $scope.statusRejected = false;
	                $scope.newsItem.ItemStatusId = enums.WorkflowStatus.Approved.Id;
	            }
	        }

	        var initializeItems = function () {
	            $scope.language = []
	            //FOR SINGLE SELECTION
	            $scope.regionList = angular.copy(items.LookUps.Region);
	            $scope.regionalEconomicUnionList = angular.copy(items.LookUps.RegionalEconomicUnion);
	            $scope.sourceList = angular.copy(items.LookUps.Source);
	            $scope.categoryList = angular.copy(items.LookUps.Category);
	            $scope.evidenceSourceList = angular.copy(items.LookUps.EvidenceSource);
	            //$scope.languageList = angular.copy(items.LookUps.CultureType);
	            $scope.documentTypeList = angular.copy(items.LookUps.DocumentType)

	            angular.forEach(items.LookUps.CultureType, function (language) {
	                if (globalUtility.TranslatorJapanese && items.Data.WorkflowStatusId == 6) {
	                    if (language.CultureTypeId == 1 || language.CultureTypeId == 2) {
	                        $scope.language.push(language)
	                    }
	                }
	                else if (globalUtility.TranslatorChinese && items.Data.WorkflowStatusId == 5) {
	                    if (language.CultureTypeId == 1 || language.CultureTypeId == 3 || language.CultureTypeId == 4) {
	                        $scope.language.push(language)
	                    }
	                }
	                else {
	                    if (language.CultureTypeId == items.Data.CultureTypeId || language.CultureTypeId == items.Data.WorkflowCultureTypeId) {
	                        $scope.language.push(language)
	                    }
	                    else if (items.Mode == "add" && language.CultureTypeId == 1) {
	                        $scope.language.push(language)
	                    }
	                }
	            });
	            $scope.languageList = $scope.language;

	            //FOR MULTIPLE SELECTION
	            $scope.sectors = [];
	            $scope.countries = [];
	            $scope.compliancePrograms = [];
	            $scope.freqTech = [];
	            $scope.productTypes = [];
	            
	            angular.forEach(items.LookUps.Sector, function (sector) {
	                this.push({ id: sector.CoveredSectorId, label: sector.CoveredSector });
	            }, $scope.sectors);

	            //angular.forEach(items.LookUps.Country, function (country) {
	            //    this.push({ id: country.CountryItemId, label: country.CountryName });
	            //}, $scope.countries);

	            angular.forEach(items.LookUps.ComplianceProgram, function (comProgram) {
	                this.push({ id: comProgram.CertificateProgramId, label: comProgram.CertificateProgramName });
	            }, $scope.compliancePrograms);

	            angular.forEach(items.LookUps.FrequencyTechnology, function (freqtech) {
	                this.push({ id: freqtech.FrequencyTechId, label: freqtech.FrequencyTechName });
	            }, $scope.freqTech);

	            angular.forEach(items.LookUps.ProductType, function (productType) {
	                this.push({ id: productType.ProductTypeId, label: productType.ProductName });
	            }, $scope.productTypes);

	            if (items.Mode != enums.Mode.Add) {
	                //originalData = angular.copy(items.Data);
	                loadNewsDetail(items.Data);
	            }
	        };

	        var onGetNewsDetailByItemId_Completed = function (response) {
	            $scope.newsItem = newsItemModel.Set(response.Data, $scope.mode == enums.Mode.Edit, $scope.mode == enums.Mode.ReviewNews);

	            if ($scope.newsItem.EffectiveDateString == "1 Jan 1970") {
	                $scope.newsItem.EffectiveDateString = "";
	                $scope.newsItem.EffectiveDate = null;
	            }
	            else {
	                $scope.newsItem.EffectiveDateString = $scope.newsItem.EffectiveDateString;
	            }
	            //DROPDOWN
	            if ($scope.newsItem.CultureTypeId == null) {
	                $scope.selectedLanguage = '1';
	            }
	            else {
	                $scope.selectedLanguage = $scope.newsItem.CultureTypeId;
	            }
	            $scope.selectedRegion = $scope.newsItem.Region;
	            $scope.selectedRegionalEU = $scope.newsItem.RegionalEU;
	            $scope.selectedSource = $scope.newsItem.Source;
	            //$scope.selectedDocumentType = $scope.newsItem.DocumentType;

	            angular.forEach(items.LookUps.Category, function (category) {
	                if (category.ModuleName == $scope.newsItem.Category) {
	                    $scope.selectedCategory = category.ModuleId
	                }
	            });

                //MULTIPLE
	            $scope.LoadSectors();
	            $scope.LoadCompliance();
	            $scope.LoadCountry(response.Data.Country);
	            $scope.LoadFreqTech();
	            $scope.LoadProductType();

	            //GET FILENAME FROM SHAREPOINT (ArticlePicture)
	            var onSuccess = function (response) {
	                if (response.IsSuccess) {
	                    $scope.articlePicture = { name: response.ArticlePicturePath.ArticlePictures[0] };
	                    //$scope.articlePicture = { name: $scope.newsItem.AttachmentName };
	                }
	                //baseService.IsBusy(false);
	            };
	            var param = {
	                newsNumber: $scope.newsItem.NewsId
	            };
	            newsService.GetArticlePicture(param, onSuccess);

	            var selectedField = [];
	            selectedField.push($scope.newsItem.ParentNewsItemId != '00000000-0000-0000-0000-000000000000' ? $scope.newsItem.ParentNewsItemId + '_NewsItem' : $scope.newsItem.NewsId + '_NewsItem');
	            newsService.GetExistingEvidence(selectedField, onGetExistingEvidenceCompleted);
	        };

	        var onGetExistingEvidenceCompleted = function (response) {
	            baseService.IsBusy(false);
	            if (response.Success) {
	                $scope.evidences = angular.copy(response.Data);

	                var evidenceIds = [];
	                angular.forEach($scope.evidences, function (evidence) {
	                    evidenceIds.push(evidence.EvidenceId);
	                });
	                evidenceIds.sort(function (a, b) { return b - a });
	                var lastEvidence = evidenceIds[0];
	                var GetDateString = function (date) {
	                    var d = new Date(date);
	                    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	                    var m = months[d.getMonth()];
	                    return d.getDate().toString() + " " + m + " " + d.getFullYear();
	                };

	                angular.forEach($scope.evidences, function (getEvidence) {
	                    if (getEvidence.EvidenceId == lastEvidence) {
	                        $scope.evidenceSelectedSource = getEvidence.SourceId;
	                        $scope.UpdateDate = GetDateString(getEvidence.UpdateDate);
	                    }
	                });
	            } else {
	                console.log(response.ErrorMessage);
	            }
	        };

	        $scope.removeEvidence = function (evidence) {
	            var selectedField = [];
	            selectedField.push($scope.newsItem.ParentNewsItemId != '00000000-0000-0000-0000-000000000000' ? $scope.newsItem.ParentNewsItemId + '_NewsItem' : $scope.newsItem.NewsId + '_NewsItem');
	            var data = {
	                evidenceId: evidence.EvidenceId,
	                selectedFields: selectedField
	            }

	            var onDeleteEvidence_Completed = function (data) {
	                var selectedField = [];
	                selectedField.push($scope.newsItem.ParentNewsItemId != '00000000-0000-0000-0000-000000000000' ? $scope.newsItem.ParentNewsItemId + '_NewsItem' : $scope.newsItem.NewsId + '_NewsItem');
	                newsService.GetExistingEvidence(selectedField, onGetExistingEvidenceCompleted);
	            }

	            newsService.DeleteEvidence(data, onDeleteEvidence_Completed);
	        };

	        $scope.openEvidenceDocument = function (evidence) {
	            //alert("Hey!")
	            OpenEvidence(evidence);
	        };

	        $scope.applyEvidence = function () {
	            if ($scope.evidenceDocument !== undefined) {
	                SaveEvidence();
	            }
	        };

	        var SaveEvidence = function () {
	            baseService.IsBusy(true);
	            var evidenceDate = new Date($scope.UpdateDate);
	            var evidence = {
	                Filename: $scope.evidenceDocument.name,
	                SourceId: $scope.evidenceSelectedSource,
	                Remarks: null,
	                RemarksInternal: null,
	                UpdateDate: (evidenceDate.getMonth() + 1) + "/" + evidenceDate.getDate() + "/" + evidenceDate.getFullYear(),
	                EvidenceNote: null,
	                DocumentTypeId: $scope.selectedDocumentType
	            }

	            var selectedField = [];
	            selectedField.push($scope.newsItem.NewsId + '_NewsItem');

	            var evidenceParams = {
	                evidence: evidence,
	                selectedFields: selectedField,
	                tab: 'News'
	            }

	            var onSaveEvidence_Completed = function (response) {
	                if (!response.IsSuccess) {
	                    dialogService.Dialog.Alert("Saving evidence failed.", enums.MessageType.Error);
	                }//errors.push("Saving primary file failed.");
	                else {
	                    var selectedField = [];
	                    selectedField.push($scope.newsItem.NewsId + '_NewsItem');
	                    newsService.GetExistingEvidence(selectedField, onGetExistingEvidenceCompleted);
	                    if (items.Mode == enums.Mode.Edit || items.Mode == enums.Mode.ReviewNews) {
	                        $scope.selectedDocumentType = '';
	                        $scope.evidenceDocument = '';
	                    }
	                    baseService.IsBusy(false);
	                }
	            }

	            var onAddEvidence_Completed = function (data) {
	                if (data) {
	                    evidenceId = data.Data;
	                    var ext = $scope.evidenceDocument.name.substr($scope.evidenceDocument.name.lastIndexOf('.') + 1);
	                    //UPLOAD TO SHAREPOINT
	                    if ($scope.evidenceDocument.name === undefined || $scope.evidenceDocument.name === '') {
	                        $scope.showErrors = true;
	                    }
	                    else {
	                        var reader = new FileReader();
	                        reader.onloadend = function () {
	                            if (reader.readyState == 2) {
	                                var arrayString = reader.result;
	                                var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                                var data = {
	                                    File: base64String.match(/.{1,255}/g),
	                                    EvidenceNumber: evidenceId,
	                                    Filename: $scope.evidenceDocument.name,
	                                    FileExtension: ext
	                                };

	                                newsService.SaveEvidence(data, onSaveEvidence_Completed);
	                            }

	                        };

	                        reader.readAsArrayBuffer($scope.evidenceDocument);
	                    }
	                }
	            }
	            newsService.AddEvidence(evidenceParams, onAddEvidence_Completed);
	        };

	        var onOpenEvidence_Completed = function (response) {
	            if (response.Message == enums.ResponseType.Success) {
	                var blob = new Blob([response.Data], { type: "application/octet-stream" });
	                saveAs(blob, $scope.filename);
	            }
	            baseService.IsBusy(false);
	        }

	        var OpenEvidence = function (evidence) {
	            $scope.filename = evidence.Filename;
	            newsService.OpenEvidence(evidence.EvidenceId, onOpenEvidence_Completed);
	        };

	        var loadNewsDetail = function (data) {
	            console.log(data);
	            var param = {
	                //newsItemId: data ? (($scope.mode == 'viewWorkflow') ? data.NewsWorkflowId : data.NewsId) : data.NewsId
	                newsItemID: $scope.mode == enums.Mode.ReviewNews ? data.NewsWorkflowId : data.NewsId,
	                cultureType: $scope.mode == enums.Mode.ReviewNews ? data.WorkflowCultureTypeId : data.CultureTypeId
	            };
	            newsService.GetByItemId(param, onGetNewsDetailByItemId_Completed);
	        };

	        var getAllNewsWorkflow = function (data) {

	            var criterea = {
	                RowsToReturn: initialSearchLimit,
	                LastRowReturned: 0,
	                SelectedRefiners: data ? data.SelectedRefiners : []
	            };
	            newsService.GetNewsWorkFlow(criterea, onGetWorkflow_Completed);
	        };

	        $scope.LoadSectors = function () {
	            angular.forEach($scope.sectors, function (sector) {
	                for (var i = 0; i < $scope.newsItem.SectorRegulated.length; i++) {
	                    if (sector.id == $scope.newsItem.SectorRegulated[i].CoveredSectorId) {
	                        this.push({ id: sector.id });
	                    }
	                }
	            }, $scope.selectedSector);
	        }

	        $scope.LoadCompliance = function () {
	            angular.forEach($scope.compliancePrograms, function (complianceProgram) {
	                for (var i = 0; i < $scope.newsItem.ComplianceProgram.length; i++) {
	                    if (complianceProgram.id == $scope.newsItem.ComplianceProgram[i].CertificateProgramId) {
	                        this.push({ id: complianceProgram.id });
	                    }
	                }
	            }, $scope.selectedComplianceProgram);
	        }

	        $scope.LoadCountry = function (selectedCountries) {
	            $scope.countries = [];
	            $scope.selectedCountry = [];

	            angular.forEach(items.LookUps.Country, function (country) {
	                if (country.RegionItemId == $scope.selectedRegion) {
	                    this.push({ id: country.CountryItemId, label: country.CountryName });
	                }
	            }, $scope.countries);

	            if (selectedCountries) {
	                angular.forEach(selectedCountries, function (country) {
	                    var temp = $filter('filter')(items.LookUps.Country, function (value, index) { return value.CountryItemId == country.CountryItemId; });
	                    if (temp.length > 0) {
	                        if (temp[0].RegionItemId == $scope.selectedRegion) {
	                            this.push({ id: country.CountryItemId, label: country.CountryName });
	                        }
	                    }
	                }, $scope.selectedCountry);
	            }
	        };

	        $scope.LoadFreqTech = function () {
	            angular.forEach($scope.freqTech, function (freqTechnology) {
	                for (var i = 0; i < $scope.newsItem.FrequencyTechnology.length; i++) {
	                    if (freqTechnology.id == $scope.newsItem.FrequencyTechnology[i].FrequencyTechId) {
	                        this.push({ id: freqTechnology.id });
	                    }
	                }
	            }, $scope.selectedFrequencyTechnology);
	        }

	        $scope.LoadProductType = function () {
	            angular.forEach($scope.productTypes, function (productType) {
	                for (var i = 0; i < $scope.newsItem.ProductType.length; i++) {
	                    if (productType.id == $scope.newsItem.ProductType[i].ProductTypeId) {
	                        this.push({ id: productType.id });
	                    }
	                }
	            }, $scope.selectedProductType);
	        }

	        //----Date (Effective, Expiration)
	        $scope.validateExpirationDateMessage = "";
	        $scope.validateEffectiveDateMessage = "";

	        $scope.ValidateEffectiveDate = function () {
	            $scope.validateEffectiveDateMessage = null;
	            //if (globalUtility.IsNullOrWhiteSpace($scope.newsItem.EffectiveDate)) {
	            //    $scope.validateEffectiveDateMessage = "Effective Date is Required";
	            //    return true;
	            //}

	            var valDate = new Date($scope.newsItem.EffectiveDate);
	            if (valDate.toDateString() == "Invalid Date") {
	                $scope.validateEffectiveDateMessage = "Invalid Date Format";
	                return true;
	            }

	            return false;
	        };
	        $scope.ValidateExpirationDate = function () {

	            $scope.validateExpirationDateMessage = null;
	            if (globalUtility.IsNullOrWhiteSpace($scope.newsItem.ExpirationDate)) {
	                $scope.validateExpirationDateMessage = "Expiration Date is Required";
	                return true;
	            }
	            var valDate = new Date($scope.newsItem.ExpirationDate);
	            if (valDate.toDateString() == "Invalid Date") {
	                $scope.validateExpirationDateMessage = "Invalid Date Format";
	                return true;
	            }

	            return false;
	        };

	        $scope.FromDateChanged = function () {
	            //if (globalUtility.IsNullOrWhiteSpace($scope.newsItem.EffectiveDate)) return;
	            $scope.newsItem.ExpirationDateMinDate = new Date($scope.newsItem.EffectiveDate);
	        };
	        $scope.ToDateChanged = function () {
	            if (globalUtility.IsNullOrWhiteSpace($scope.newsItem.ExpirationDate)) return;
	            $scope.newsItem.EffectiveDateMaxDate = new Date($scope.newsItem.ExpirationDate);
	        };

	        $scope.RemovePicture = function () {
	            $scope.articlePicture.name = "";
	        }

	        var DeleteArticlePicture = function (response) {
	            if (!response.IsSuccess) errors.push("Deleting Article Picture " + response.Message);
	            //$scope.CloseDialog();
	        }

	        var SaveArticlePicture = function () {
	            var onSucess = function (response) {
	                $scope.isAPModified = false;
	                if (response.IsSuccess) {
	                    baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	                    saveCompleted();
	                }
	                else {
	                    showErrorMessage("Saving Article Picture " + response.Message);
	                }
	            };

	            if ($scope.isAPModified) {
	                var reader = new FileReader();
	                reader.onloadend = function () {
	                    if (reader.readyState == 2) {
	                        var arrayString = reader.result;
	                        var base64String = globalUtility.ArrayBufferToBase64String(arrayString);
	                        var param = {
	                            NewsNumber: $scope.newsItem.NewsId,
	                            File: base64String.match(/.{1,100}/g),
	                            FileArray: arrayString,
	                            Filename: $scope.articlePicture.name,
	                            ApplicationId: globalUtility.AppId
	                        };
	                        newsService.SaveArticlePicture(param, onSucess);
	                    }
	                };
	                reader.readAsArrayBuffer($scope.articlePicture);
	            }
	        };

	        var validation = function (hasError) {
	            if (!hasError) {
	                hasError = $scope.ValidateEffectiveDate() || $scope.ValidateExpirationDate() ? true : hasError;
	            }
	            $scope.showErrors = hasError;
	            if (hasError) {
	                $location.hash("top");
	                $anchorScroll();
	                baseService.IsBusy(false);
	                return;
	            };
	        }

	 var onSuccessEmail = function (response) {
				if (response.IsSuccess) {
					 success = response.Message;
					saveCompleted();
				}
				else {
					showErrorMessage(response.ErrorMessage)
				}
				baseService.IsBusy(false);
		};	

		var onSuccess_GetEmailWorkflowContent = function (response) {
			if (response.Success) {
			   var paramsEmail = {
						Remarks: null,
						Recipient: null
					};

				paramsEmail.Remarks   = response.Data.Remarks;
				paramsEmail.Recipient = response.Data.Recipient;
                sendEmail(false, items.Data, paramsEmail); 
  			 };	
		};		


	        //SAVING
	        $scope.Save = function (hasError) {
	            baseService.IsBusy(true);
	            hasErrorArticle = false;
	            if (hasError) {
	                validation(hasError);
	            }

	            else if ($scope.selectedSector.length == 0 || $scope.selectedCountry.length == 0 || $scope.selectedComplianceProgram.length == 0 || $scope.ValidateEffectiveDate()) {
	                hasError = true;
	                $scope.ArticleErrors = false;
	            }
	            $scope.showErrors = hasError;
	            if (hasError) {
	                $location.hash("top");
	                $anchorScroll();
	                baseService.IsBusy(false);
	                return;
	            }

	            else {
	                if ($scope.articlePicture.name != undefined && $scope.articlePicture.name != null && $scope.articlePicture.name != "") {
	                    var arrArticleName = $scope.articlePicture.name.split('.');
	                    if (arrArticleName[1].toLowerCase() != "jpg" && arrArticleName[1].toLowerCase() != 'jpeg' && arrArticleName[1].toLowerCase() != 'png') {
	                        hasErrorArticle = true;
	                    }
	                }
	                $scope.ArticleErrors = hasErrorArticle;
	                if (hasErrorArticle) {
	                    $location.hash("top");
	                    $anchorScroll();
	                    return;
	                }
	                else {
	                    $scope.newsItem.SectorRegulatedIds = "";
	                    angular.forEach($scope.selectedSector, function (item, idx, array) {
	                        $scope.newsItem.SectorRegulatedIds += item.id;
	                        if (idx !== array.length - 1) $scope.newsItem.SectorRegulatedIds += ",";
	                    });

	                    $scope.newsItem.Country = "";
	                    angular.forEach($scope.selectedCountry, function (item, idx, array) {
	                        $scope.newsItem.Country += item.id;
	                        if (idx !== array.length - 1) $scope.newsItem.Country += ",";
	                    });

	                    $scope.newsItem.ComplianceProgram = "";
	                    angular.forEach($scope.selectedComplianceProgram, function (item, idx, array) {
	                        $scope.newsItem.ComplianceProgram += item.id;
	                        if (idx !== array.length - 1) $scope.newsItem.ComplianceProgram += ",";
	                    });

	                    $scope.newsItem.FrequencyTechnology = "";
	                    angular.forEach($scope.selectedFrequencyTechnology, function (item, idx, array) {
	                        $scope.newsItem.FrequencyTechnology += item.id;
	                        if (idx !== array.length - 1) $scope.newsItem.FrequencyTechnology += ",";
	                    });

	                    $scope.newsItem.ProductType = "";
	                    angular.forEach($scope.selectedProductType, function (item, idx, array) {
	                        $scope.newsItem.ProductType += item.id;
	                        if (idx !== array.length - 1) $scope.newsItem.ProductType += ",";
	                    });

	                    switch ($scope.selectedSource) {
	                        case (""): case (0):
	                            $scope.selectedSource = null;
	                    }

	                    var iDate = new Date($scope.newsItem.EffectiveDate);
	                    var eDate = new Date($scope.newsItem.ExpirationDate);
	                    var newsParam = {
	                        NewsItemId: null,
	                        NewsTitle: $scope.newsItem.Title,
	                        NewsSummary: $scope.newsItem.Summary,
	                        NewsDetail: $scope.newsItem.Details,
	                        AttachmentName: $scope.articlePicture.name,
	                        ImageCaption: $scope.newsItem.ImageCaption,
	                        Note: $scope.newsItem.Note,
	                        //EvidenceDocuments: $scope.newsItem.EvidenceDocuments,
	                        EffectiveDate: (iDate.getMonth() + 1) + "/" + iDate.getDate() + "/" + iDate.getFullYear(),
	                        ExpirationDate: (eDate.getMonth() + 1) + "/" + eDate.getDate() + "/" + eDate.getFullYear(),
	                        CoveredSectors: $scope.newsItem.SectorRegulatedIds,
	                        ModuleItemId: $scope.selectedCategory,
	                        NewsSourceId: $scope.selectedSource,
	                        RegionItemId: $scope.selectedRegion,
	                        CountryTradeGroupItemId: $scope.selectedRegionalEU,
	                        CountryItemIds: $scope.newsItem.Country,
	                        CertificateProgramIds: $scope.newsItem.ComplianceProgram,
	                        FrequencyTechIds: $scope.newsItem.FrequencyTechnology,
	                        ProductTypeIds: $scope.newsItem.ProductType,
	                        //SourceLink: $scope.newsItem.SourceLink,
	                        //LinkToNews: $scope.newsItem.LinkToNews,
	                        PostedOrAmendedBy: globalUtility.CurrentUser,
	                        CultureTypeCultureTypeId: $scope.selectedLanguage,
	                        ItemStatusId: $scope.newsItem.ItemStatusId,
	                        ParentNewsItemId: $scope.newsItem.ParentNewsItemId

	                    };

                        //ITEMS TO BE ADDED (NEWLY ADDED)
	                    if ($scope.mode == enums.Mode.Add) {

                            //AS CONTRIBUTOR
	                        if (globalUtility.Contributor) {
	                            newsParam.NewsItemId = null,
                                newsParam.ItemStatusId = enums.WorkflowStatus.ApproverReview.Id,
                                newsParam.ParentNewsItemId = null
	                        }

                            //AS CONTENT ADMIN / COORDINATOR
	                        else if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                            newsParam.NewsItemId = null,
	                            newsParam.ItemStatusId = enums.WorkflowStatus.Approved.Id,
                                newsParam.ParentNewsItemId = null

	                            var onSuccess = function (response) {
	                                if (response.Success) {
	                                    $scope.newsItem.NewsId = response.Data.NewsItemId;

	                                    if ($scope.mode == enums.Mode.Add && $scope.isEvidenceDisabled && $scope.evidenceDocument !== undefined) {
	                                        SaveEvidence();
	                                    }
	                                    if ($scope.articlePicture.name == null || $scope.articlePicture.name == "") {
	                                        if ($scope.articlePicture.name != undefined) {
	                                            newsService.DeleteArticlePicture({ newsNumber: $scope.newsItem.NewsId }, DeleteArticlePicture);
	                                            baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	                                        }
	                                    }
	                                    else {
	                                        SaveArticlePicture();
	                                    }
	                                    dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);
	                                    saveCompleted();
	                                }
	                                else {
	                                    showErrorMessage(response.ErrorMessage)
	                                }
	                            }

	                            //INSERT IN WORKFLOW - STATUS : PENDING JAPANESE TRANSLATION
	                            var onApprove_AddJapaneseTraslation = function (response) {
	                                if (response.Success) {
	                                    newsParam.NewsItemId = null,
	                                    newsParam.ItemStatusId = enums.WorkflowStatus.PendingJapaneseTranslation.Id,
                                        newsParam.ParentNewsItemId = $scope.parentNewsItemId
	                                    $scope.newsItem.NewsId = response.Data.NewsItemId

	                                    if ($scope.mode == enums.Mode.Add && $scope.isEvidenceDisabled && $scope.evidenceDocument !== undefined) {
	                                        SaveEvidence();
	                                    }
	                                    if ($scope.articlePicture.name == null || $scope.articlePicture.name == "") {
	                                        if ($scope.articlePicture.name != undefined) {
	                                            newsService.DeleteArticlePicture({ newsNumber: $scope.newsItem.NewsId }, DeleteArticlePicture);
	                                            baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	                                        }
	                                    }
	                                    else {
	                                        SaveArticlePicture();
	                                    }

	                                    newsService.SaveNews(newsParam, onSuccess);
	                                }
	                                else {
	                                    showErrorMessage(response.ErrorMessage)
	                                }
	                            };

	                            //INSERT IN WORKFLOW - STATUS : PENDING CHINESE TRANSLATION
	                            var onApprove_AddChineseTraslation = function (response) {
	                                if (response.Success) {
	                                    newsParam.NewsItemId = null,
	                                    newsParam.ItemStatusId = enums.WorkflowStatus.PendingChineseTranslation.Id,
                                        newsParam.ParentNewsItemId = response.Data.NewsItemId
	                                    $scope.newsItem.NewsId = response.Data.NewsItemId
	                                    $scope.parentNewsItemId = response.Data.NewsItemId

	                                    if ($scope.mode == enums.Mode.Add && $scope.isEvidenceDisabled && $scope.evidenceDocument !== undefined) {
	                                        SaveEvidence();
	                                    }
	                                    if ($scope.articlePicture.name == null || $scope.articlePicture.name == "") {
	                                        if ($scope.articlePicture.name != undefined) {
	                                            newsService.DeleteArticlePicture({ newsNumber: $scope.newsItem.NewsId }, DeleteArticlePicture);
	                                            baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	                                        }
	                                    }
	                                    else {
	                                        SaveArticlePicture();
	                                    }

	                                    newsService.SaveNews(newsParam, onApprove_AddJapaneseTraslation);
	                                }
	                                else {
	                                    showErrorMessage(response.ErrorMessage)
	                                }
	                            };

	                            newsService.SaveNews(newsParam, onApprove_AddChineseTraslation);
	                            return;
	                        }
	                    }

                        //ITEMS TO BE EDITED
	                    else if ($scope.mode == enums.Mode.Edit) {

                            //AS CONTRIBUTOR
	                        if (globalUtility.Contributor) {
	                            newsParam.NewsItemId = null,
                                newsParam.ItemStatusId = enums.WorkflowStatus.ApproverReview.Id,
                                newsParam.ParentNewsItemId = $scope.newsItem.NewsId
	                        }

                            //AS CONTENT ADMIN / COORDINATOR
	                        else if (globalUtility.ContentAdmin || globalUtility.Coordinator) {
	                            newsParam.NewsItemId = $scope.newsItem.NewsId,
	                            newsParam.ItemStatusId = enums.WorkflowStatus.Approved.Id,
                                newsParam.ParentNewsItemId = null

	                            var onSuccess = function (response) {
	                                if (response.Success) {
	                                    $scope.newsItem.NewsId = response.Data.NewsItemId;
	                                    if ($scope.articlePicture.name == null || $scope.articlePicture.name == "") {
	                                        if ($scope.articlePicture.name != undefined) {
	                                            newsService.DeleteArticlePicture({ newsNumber: $scope.newsItem.NewsId }, DeleteArticlePicture);
	                                            baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	                                        }
	                                    }
	                                    else {
	                                        SaveArticlePicture();
	                                    }
	                                    dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);
	                                    saveCompleted();
	                                }
	                                else {
	                                    showErrorMessage(response.ErrorMessage)
	                                }
	                            }

                                //INSERT IN WORKFLOW - STATUS : PENDING JAPANESE TRANSLATION
	                            var onApprove_AddJapaneseTraslation = function (response) {
	                                if (response.Success) {
	                                    newsParam.NewsItemId = null,
	                                    newsParam.ItemStatusId = enums.WorkflowStatus.PendingJapaneseTranslation.Id,
                                        newsParam.ParentNewsItemId = $scope.parentNewsItemId
                                        $scope.newsItem.NewsId = response.Data.NewsItemId

	                                    if ($scope.articlePicture.name == null || $scope.articlePicture.name == "") {
	                                        if ($scope.articlePicture.name != undefined) {
	                                            newsService.DeleteArticlePicture({ newsNumber: $scope.newsItem.NewsId }, DeleteArticlePicture);
	                                            baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	                                        }
	                                    }
	                                    else {
	                                        SaveArticlePicture();
	                                    }

	                                    newsService.SaveNews(newsParam, onSuccess);
	                                }
	                                else {
	                                    showErrorMessage(response.ErrorMessage)
	                                }
	                            };

	                            //INSERT IN WORKFLOW - STATUS : PENDING CHINESE TRANSLATION
	                            var onApprove_AddChineseTraslation = function (response) {
	                                if (response.Success) {
	                                    newsParam.NewsItemId = null,
	                                    newsParam.ItemStatusId = enums.WorkflowStatus.PendingChineseTranslation.Id,
                                        newsParam.ParentNewsItemId = response.Data.NewsItemId
                                        $scope.newsItem.NewsId = response.Data.NewsItemId
                                        $scope.parentNewsItemId = response.Data.NewsItemId

	                                    if ($scope.articlePicture.name == null || $scope.articlePicture.name == "") {
	                                        if ($scope.articlePicture.name != undefined) {
	                                            newsService.DeleteArticlePicture({ newsNumber: $scope.newsItem.NewsId }, DeleteArticlePicture);
	                                            baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	                                        }
	                                    }
	                                    else {
	                                        SaveArticlePicture();
	                                    }

	                                    newsService.SaveNews(newsParam, onApprove_AddJapaneseTraslation);
	                                }
	                                else {
	                                    showErrorMessage(response.ErrorMessage)
	                                }
	                            };

	                            newsService.SaveNews(newsParam, onApprove_AddChineseTraslation);
	                            return;
	                        }
	                    }

                        //ITEMS FROM WORKFLOW
	                    else if ($scope.mode == enums.Mode.ReviewNews) {

                            //AS CONTENT ADMIN / COORDINATOR
	                        if (globalUtility.ContentAdmin || globalUtility.Coordinator) {

                                //ITEM IS EDITED AND WILL BE APPROVED BY A CONTRIBUTOR / CONTENT ADMIN
	                            if ($scope.newsItem.ParentNewsItemId != '00000000-0000-0000-0000-000000000000') {

	                                //ITEM IS APPROVED - EDITED
	                                if ($scope.statusRejected == false) {
	                                    newsParam.NewsItemId = $scope.newsItem.NewsId,
                                        newsParam.ItemStatusId = enums.WorkflowStatus.Approved.Id,
                                        newsParam.ParentNewsItemId = $scope.newsItem.ParentNewsItemId,
                                        newsParam.AttachmentName = $scope.articlePicture.name

	                                    var onSuccess = function (response) {
	                                        if (response) {
	                                            if (response.Success) {
	                                                success = response.Data.Message;
	                                                saveCompleted();
	                                            }
	                                            else {
	                                                errors = (response.Data ? response.Message : response.ErrorMessage);
	                                                saveCompleted();
	                                            }
	                                        }
	                                    }

	                                    //INSERT IN WORKFLOW - STATUS : PENDING JAPANESE TRANSLATION
	                                    var onApprove_AddJapaneseTraslation = function (response) {
	                                        if (response.Success) {
	                                            newsParam.NewsItemId = null,
                                                newsParam.ItemStatusId = enums.WorkflowStatus.PendingJapaneseTranslation.Id,
                                                newsParam.ParentNewsItemId = $scope.parentNewsItemId
	                                            $scope.newsItem.NewsId = response.Data.NewsItemId

	                                            newsService.SaveNews(newsParam, onSuccess);
	                                        }
	                                        else {
	                                            showErrorMessage(response.ErrorMessage)
	                                        }
	                                    };

	                                    //INSERT IN WORKFLOW - STATUS : PENDING CHINESE TRANSLATION
	                                    var onApprove_AddChineseTraslation = function (response) {
	                                        if (response.Success) {
	                                            newsParam.NewsItemId = null,
                                                newsParam.ItemStatusId = enums.WorkflowStatus.PendingChineseTranslation.Id,
                                                newsParam.ParentNewsItemId = response.Data.NewsItemId
	                                            $scope.newsItem.NewsId = response.Data.NewsItemId
	                                            $scope.parentNewsItemId = response.Data.NewsItemId

	                                            newsService.SaveNews(newsParam, onApprove_AddJapaneseTraslation);
	                                        }
	                                        else {
	                                            showErrorMessage(response.ErrorMessage)
	                                        }
	                                    };

	                                    //UPDATE CHILD - NewsItemId = ParentItemId
	                                    var onSuccessUpdateChild = function (response) {
	                                        if (response.Success) {
	                                            newsParam.NewsItemId = $scope.newsItem.ParentNewsItemId,
	                                            newsParam.ItemStatusId = enums.WorkflowStatus.Approved.Id,
	                                            newsParam.ParentNewsItemId = null,
                                                newsParam.AttachmentName = $scope.articlePicture.name

	                                            newsService.SaveNews(newsParam, onApprove_AddChineseTraslation);
	                                        }
	                                        else {
	                                            showErrorMessage(response.ErrorMessage)
	                                        }
	                                    };

                                      //SEND EMAIL IN WORKFLOW - APPROVED - EDITED
										var onSuccessEmailapproveEdited = function (response) {
													if (response.IsSuccess) {
     												    newsService.SaveNews(newsParam, onSuccessUpdateChild);
													}
													else {
														showErrorMessage(response.ErrorMessage)
													}
													baseService.IsBusy(false);
										};	


                                        //GET EMAIL EMAIL IN WORKFLOW - APPROVED - EDITED
										var onSuccess_GetEmailWorkflowContentApprove = function (response) {
													if (response.Success) {
												var paramsEmail = {
															Remarks: null,
															Recipient: null
														};

													paramsEmail.Remarks   = response.Data.Remarks;
													paramsEmail.Recipient = response.Data.Recipient;		
													sendEmail(true, items.Data, paramsEmail); 
												};	
										};	

										var onApprovedSaveNews_Completed = function (response) {
														if (response.Success) {
															$scope.newsItem.NewsId = response.Data.NewsItemId;


															var param = {
																newsId: $scope.newsItem.NewsId
															};					

															newsService.GetEmailWorkflowContent(param, onSuccess_GetEmailWorkflowContentApprove);

														//  saveCompleted();
														}
														else {
															showErrorMessage(response.ErrorMessage)
														}
										};																				

	                                    newsService.SaveNews(newsParam, onApprovedSaveNews_Completed);
	                                    return;
	                                }
                                    
                                    //IF ITEM IS REJECTED - EDITED
	                                else if ($scope.statusRejected == true) {
	                                    if ($scope.newsItem.Remarks == null) {
	                                        hasRemarksError = true;
	                                        $scope.RemarksError = hasRemarksError;
	                                        if (hasRemarksError) {
	                                            $location.hash("newsRejectEmpty");
	                                            $anchorScroll();
	                                            baseService.IsBusy(false);
	                                            return;
	                                        }
	                                    }
	                                    else {
	                                        newsParam.NewsItemId = $scope.newsItem.NewsId,
	                                        newsParam.ItemStatusId = enums.WorkflowStatus.Rejected.Id,
	                                        newsParam.ParentDeliveryId = null,
	                                        newsParam.Remarks = $scope.newsItem.Remarks,
                                            newsParam.AttachmentName = $scope.articlePicture.name
	                                        newsService.SaveNews(newsParam, onRejectedSaveNews_Completed);
	                                        return;
	                                    }
	                                }

                                    //STATUS IS NULL - ERROR MESSAGE
	                                else {
	                                    hasError = true;
	                                    $scope.showErrors = hasError;
	                                    if (hasError) {
	                                        $location.hash("approveRejectNull");
	                                        $anchorScroll();
	                                        baseService.IsBusy(false);
	                                        return;
	                                    };
	                                }
	                            }

                                //ITEM IS NEWLY CREATED AND WILL BE APPROVED BY A CONTRIBUTOR / CONTENT ADMIN
	                            else {
                                    //IF STATUS IS NULL - ERROR MESSAGE
	                                if ($scope.statusRejected == null) {
	                                    hasError = true;
	                                    $scope.showErrors = hasError;
	                                    if (hasError) {
	                                        $location.hash("approveRejectNull");
	                                        $anchorScroll();
	                                        baseService.IsBusy(false);
	                                        return;
	                                    };
	                                }

                                    //ITEM IS APPROVED - ADDED
	                                else if ($scope.statusRejected == false){
	                                    newsParam.NewsItemId = $scope.newsItem.NewsId,
	                                    newsParam.ItemStatusId = enums.WorkflowStatus.Approved.Id,
	                                    newsParam.ParentNewsItemId = null,
                                        newsParam.AttachmentName = $scope.articlePicture.name

										 var onSuccess = function (response) {
	                                        if (response) {
	                                            if (response.Success) {
	                                                success = response.Data.Message;
	                                                saveCompleted();
	                                            }
	                                            else {
	                                                errors = (response.Data ? response.Message : response.ErrorMessage);
	                                                saveCompleted();
	                                            }
	                                        }
	                                    }


	                                    //INSERT IN WORKFLOW - STATUS : PENDING JAPANESE TRANSLATION
	                                    var onApprove_AddJapaneseTraslation = function (response) {
	                                        if (response.Success) {
	                                            newsParam.NewsItemId = null,
                                                newsParam.ItemStatusId = enums.WorkflowStatus.PendingJapaneseTranslation.Id,
                                                newsParam.ParentNewsItemId = $scope.parentNewsItemId
                                                $scope.newsItem.NewsId = response.Data.NewsItemId

	                                            newsService.SaveNews(newsParam, onSuccess);
	                                        }
	                                        else {
	                                            showErrorMessage(response.ErrorMessage)
	                                        }
	                                    };

	                                    //INSERT IN WORKFLOW - STATUS : PENDING CHINESE TRANSLATION
	                                    var onApprove_AddChineseTraslation = function (response) {
	                                        if (response.Success) {
	                                            newsParam.NewsItemId = null,
                                                newsParam.ItemStatusId = enums.WorkflowStatus.PendingChineseTranslation.Id,
                                                newsParam.ParentNewsItemId = response.Data.NewsItemId
                                                $scope.newsItem.NewsId = response.Data.NewsItemId
                                                $scope.parentNewsItemId = response.Data.NewsItemId

	                                            newsService.SaveNews(newsParam, onApprove_AddJapaneseTraslation);
	                                        }
	                                        else {
	                                            showErrorMessage(response.ErrorMessage)
	                                        }
	                                    };

                                       //SEND EMAIL IN WORKFLOW - APPROVED - ADDED
										var onSuccessEmailApprove = function (response) {
													if (response.IsSuccess) {
     												    newsService.SaveNews(newsParam, onApprove_AddChineseTraslation);
													}
													else {
														showErrorMessage(response.ErrorMessage)
													}
													baseService.IsBusy(false);
											};	


                                        //GET EMAIL EMAIL IN WORKFLOW - APPROVED - ADDED
											var onSuccess_GetEmailWorkflowContentApprove = function (response) {
													if (response.Success) {
													var paramsEmail = {
																Remarks: null,
																Recipient: null
															};

														paramsEmail.Remarks   = response.Data.Remarks;
														paramsEmail.Recipient = response.Data.Recipient;		
														sendEmail(true, items.Data, paramsEmail); 
													};	
											};	

										var onApprovedSaveNews_Completed = function (response) {
														if (response.Success) {
															$scope.newsItem.NewsId = response.Data.NewsItemId;


															var param = {
																newsId: $scope.newsItem.NewsId
															};					

															newsService.GetEmailWorkflowContent(param, onSuccess_GetEmailWorkflowContentApprove);

														//  saveCompleted();
														}
														else {
															showErrorMessage(response.ErrorMessage)
														}
										};										

	                                    newsService.SaveNews(newsParam, onApprovedSaveNews_Completed);

	                                    return;
	                                }

                                    //ITEM IS REJECTED - ADDED
	                                else if ($scope.statusRejected == true) {
	                                    if ($scope.newsItem.Remarks == null) {
	                                        hasRemarksError = true;
	                                        $scope.RemarksError = hasRemarksError;
	                                        if (hasRemarksError) {
	                                            $location.hash("newsRejectEmpty");
	                                            $anchorScroll();
	                                            baseService.IsBusy(false);
	                                            return;
	                                        }
	                                    }
	                                    else {
	                                        newsParam.NewsItemId = $scope.newsItem.NewsId,
	                                        newsParam.ItemStatusId = enums.WorkflowStatus.Rejected.Id,
	                                        newsParam.ParentNewsItemId = null,
	                                        newsParam.Remarks = $scope.newsItem.Remarks,
                                            newsParam.AttachmentName = $scope.articlePicture.name

	                                        newsService.SaveNews(newsParam, onRejectedSaveNews_Completed);
	                                        return;
	                                    }
	                                }
	                            }
	                        }

                            //AS TRANSLATOR (JAPANESE / CHINESE)
	                        else if (globalUtility.TranslatorJapanese || globalUtility.TranslatorChinese) {

	                            var onSuccess = function (response) {
	                                if (response) {
	                                    if (response.Success) {
	                                        success = response.Data.Message;
	                                        saveCompleted();
	                                    }
	                                    else {
	                                        errors = (response.Data ? response.Message : response.ErrorMessage);
	                                        saveCompleted();
	                                    }
	                                }
	                            }

	                            var onSaveNews_Translated = function (response) {
	                                if (response.Success) {
	                                    newsParam.NewsItemId = $scope.newsItem.ParentNewsItemId,
	                                    newsParam.ItemStatusId = enums.WorkflowStatus.Approved.Id,
	                                    newsParam.ParentNewsItemId = null,
                                        newsParam.AttachmentName = $scope.articlePicture.name

	                                    newsService.SaveNews(newsParam, onSuccess);
	                                }
	                                else {
	                                    showErrorMessage(response.ErrorMessage)
	                                }
	                            };

	                            newsParam.NewsItemId = $scope.newsItem.NewsId,
	                            newsParam.ItemStatusId = enums.WorkflowStatus.Approved.Id,
	                            newsParam.ParentNewsItemId = $scope.newsItem.ParentNewsItemId,
                                newsParam.AttachmentName = $scope.articlePicture.name

	                            newsService.SaveNews(newsParam, onSaveNews_Translated);
	                            return;
	                        }
	                    }

	                    newsService.SaveNews(newsParam, onSaveNews_Completed);
	                }
	            }
	        };

	        var showErrorMessage = function (message) {
	            baseService.IsBusy(false);
	            $scope.alertType = enums.AlertType.Error;
	            $scope.alertMessage = message;
	            $location.hash("top");
	            $anchorScroll();
	        };
	   
	        var onSaveNews_Completed = function (response) {
	            if (response.Success) {
	                $scope.newsItem.NewsId = response.Data.NewsItemId;
	                if ($scope.mode == enums.Mode.Add && $scope.isEvidenceDisabled && $scope.evidenceDocument !== undefined)
	                {
	                    SaveEvidence();
	                }
	                if ($scope.articlePicture.name == null || $scope.articlePicture.name == "") {
	                    if ($scope.articlePicture.name != undefined) {
	                        newsService.DeleteArticlePicture({ newsNumber: $scope.newsItem.NewsId }, DeleteArticlePicture);
	                        baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	                    }
	                }
	                else {
	                    SaveArticlePicture();
	                }
	                baseService.IsBusy(false);
	                dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);
	                saveCompleted();
	            }
	            else {
	                showErrorMessage(response.ErrorMessage)
	            }
	        };

		var isUndefinedOrEmpty = function(data) {
	            return data === undefined || data === '' ? true : false;
        };

	    var sendEmail = function(approve, items, param) {
			var data = {
								Status: ((approve) ? "Approved":"Rejected"),
								Scope: "News",
								Category: isUndefinedOrEmpty(items.WorkflowCoveredSectorName) ? [] : [items.WorkflowCoveredSectorName],
								Region: isUndefinedOrEmpty(items.WorkflowRegionName) ? [] : [items.WorkflowRegionName],
								Country: isUndefinedOrEmpty(items.WorkflowCountryName) ? [] : [items.WorkflowCountryName],
								Compliance: isUndefinedOrEmpty(items.WorkflowComplianceProgramNames) ? [] : [items.WorkflowComplianceProgramNames],
								Original: items.WorkflowOriginal.length === 0 ? [] : items.WorkflowOriginal,
								Updated: items.WorkflowUpdated.length === 0 ? [] : items.WorkflowUpdated,
								Source: isUndefinedOrEmpty(items.WorkflowSource) ? [] : [items.WorkflowSource],
								Link:  isUndefinedOrEmpty(items.WorkflowLink) ? [] : [items.WorkflowLink],
								Remarks: param.Remarks,
								Recipient: param.Recipient
						};


	            homeService.sendEmail(data, onSuccessEmail)
		};

        var onRejectedSaveNews_Completed = function (response) {
	            if (response.Success) {
	                $scope.newsItem.NewsId = response.Data.NewsItemId;

			     	var param = {
						newsId: $scope.newsItem.NewsId
					};					


                    newsService.GetEmailWorkflowContent(param, onSuccess_GetEmailWorkflowContent);

	              // saveCompleted();
	            }
	            else {
	                showErrorMessage(response.ErrorMessage)
	            }
	     };

        var saveCompleted = function () {
            baseService.IsBusy(false);
			$scope.CloseDialog();
			baseService.Publish("newsModule:addNews", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
		};

		$scope.init();

		$scope.$on('$destroy', function () {

			var events = [''];
			baseService.UnSubscribe(events);
		});
	   }]);
});
