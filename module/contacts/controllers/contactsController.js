
define([
    'app',
    'globalUtility',
    'enums', 'shell/model/refinerModel'
], function (app, globalUtility, enums, refinerModel) {

    app.register.controller('contactsController', ['$scope', '$http', '$rootScope', 'baseService', 'dialogService', 'contactsService', 'exportService', 'homeService', 'uiGridConstants', '$filter',
        function ($scope, $http, $rootScope, baseService, dialogService, contactsService, exportService, homeService, uiGridConstants, $filter, items) {
            //"global" variables
            var columns = [];
            var contributors = ['Contributor', 'Content Admin', 'Coordinator'];
            var firstload = true;
            var initialLoad = true;
            var isFavorite = false;
            var initialRowsToLoad = 200;
            var keyword = '';
            var page = 1;
            var perPageLoad = 20;
            var refinerType = {
                Country: 'Country',
                Region: 'Region',
                Sector: 'CoveredSector',
                Company: 'Company',
                OrganizationType: 'OrganizationType'
            };

            var refinerDSCopy = [];

            //viewmodel/bindable members      
            $scope.contacts = [];
            $scope.contactsEmail = [];
            $scope.contactGrid = {};
            $scope.downloadToExcel = downloadToExcel;
            $scope.gridSelections = [];
            $scope.isUserContributor = false;
            $scope.isUserContentAdmin = false;
            $scope.removeRefiner = removeRefiner;
            $scope.popupParameter = {
                Record: null,
                Country: null,
                Regions: null,
                Company: null,
                Sector: null,
                OrganizationType: null
            };
            $scope.selectedRefiners = [];
            $scope.showAddEditWindow = showAddEditWindow;
            $scope.showManageCompaniesWindow = showManageCompaniesWindow;
            $scope.showConfirmDialog = showConfirmDialog;
            $scope.showGridLoader = false;


            init();

            //function implementations
            ////////////// 

            function refreshRefinersContacts() {
                isFavorite = true;
                baseService.Publish('shell:clearRefinerList', true);
                contactsService.getAllLookup("", refinerResult);
            }

            function addSelectedRefiner(event, data) {
                if ($scope.selectedRefiners.map(function (ref) { return ref.Value; }).indexOf(data.Value) === -1) {
                    $scope.selectedRefiners.push(data);
                }

                baseService.Publish('shell:addSelectedModuleRefiner', { Refiner: data });

                page = 1;

                //reset data for each refiner
                $scope.contacts = [];

                if (!initialLoad && !isFavorite) {
                    baseService.AddToGlobalRefiners(data);

                    getContacts('initialLoad');
                }
            }

            function arrayUnique(array) {
                var a = array.concat();
                for (var i = 0; i < a.length; ++i) {
                    for (var j = i + 1; j < a.length; ++j) {
                        if (a[i] === a[j])
                            a.splice(j--, 1);
                    }
                }

                return a;
            }

            function downloadToExcel() {
                var message = "The selected items will be exported to excel.";
                var title = "Export Results";

                dialogService.Dialog.Confirm(enums.ConfirmType.OkCancel, message, title, enums.ModalSize.Small, onConfirm);

                //////////////

                function onConfirm(response) {
                    if (response == enums.CallbackType.Cancel) return;

                    var gridSelectedRecord = $scope.gridApi.selection.getSelectedRows();
                    var selectedRecord = null;

                    var records = [];
                    var header = ['Regulatory Category', 'Region', 'Country', 'Organization Type', 'Company Name', 'Address', 'Name', 'Tel. No.', 'Email', 'Mobile No.', 'Skype', 'Title', 'Note', 'Website'];
                    var data = [];

                    data.push(header);
                    if (gridSelectedRecord.length > 0) {
                        selectedRecord = gridSelectedRecord;
                    }
                    else {
                        selectedRecord = $scope.contacts;
                    }

                    angular.forEach(selectedRecord, function (rows) {
                        records.push(rows.Sector);
                        records.push(rows.Region);
                        records.push(rows.Country);
                        records.push(rows.OrganizationType);
                        records.push(rows.CompanyName);
                        records.push(rows.Address);
                        records.push(rows.Name);
                        records.push(rows.TelNo);
                        records.push(rows.Email);
                        records.push(rows.Mobile);
                        records.push(rows.Skype);
                        records.push(rows.Title);
                        records.push(rows.Note);
                        records.push(rows.Website);


                        data.push(records);
                        records = [];
                    });

                    exportService.ExportArrayToExcel(data, 'contacts');
                }
            };

            function getContacts(message) {
                
                //console.log(message);
                baseService.IsBusy(true);

                var data = {
                    Page: page,
                    Keyword: keyword,
                    Refiners: getRefinerList()
                }

                contactsService.getAll(data, result);
            }

            function getPreselectedRefiners() {
                var preselectedRefiners = [];

                //add pre-selected country if any
                if (globalUtility.SelectedCountry.length > 0) {
                    angular.forEach(globalUtility.SelectedCountry, function (country) {
                        this.push({
                            Checked: true,
                            Id: country.id,
                            IsDateRange: false,
                            Parent: "COUNTRY",
                            Type: "Country",
                            Value: country.label
                        })
                    }, preselectedRefiners);
                }

                //add pre-selected sector if any
                if (globalUtility.SelectedSector.length > 0) {
                    angular.forEach(globalUtility.SelectedSector, function (sector) {
                        this.push({
                            Checked: true,
                            Id: sector.CoveredSectorId,
                            IsDateRange: false,
                            Parent: "REGULATORY CATEGORY",
                            Type: refinerType.Sector,
                            Value: sector.CoveredSectorId
                        })
                    }, preselectedRefiners);
                }

                //add pre-selected region if any
                if (globalUtility.SelectedRegion.length > 0) {
                    angular.forEach(globalUtility.SelectedRegion, function (region) {
                        this.push({
                            Checked: true,
                            Id: region.RegionId,
                            IsDateRange: false,
                            Parent: "REGION",
                            Type: "Region",
                            Value: region.RegionName
                        })
                    }, preselectedRefiners);
                }

                if (globalUtility.SelectedOrganizationType.length > 0) {
                    angular.forEach(globalUtility.SelectedOrganizationType, function (orgType) {
                        this.push({
                            Checked: true,
                            Id: orgType.OrganizationTypeId,
                            IsDateRange: false,
                            Parent: "ORGANIZATION TYPE",
                            Type: refinerType.OrganizationType,
                            Value: orgType.OrganizationTypeId
                        })
                    }, preselectedRefiners);
                }

                return preselectedRefiners;
            }

            function getRefinerList() {
                var selectedRefiners = [];
                if ($scope.selectedRefiners.length > 0) {
                    angular.forEach($scope.selectedRefiners, function (refiner) {
                        if (refiner.IsDateRange) {

                            this.push({ RefinerType: refiner.Items[0].Type, RefinerValueId: refiner.Items[0].ValueString })
                            this.push({ RefinerType: refiner.Items[1].Type, RefinerValueId: refiner.Items[1].ValueString })

                        } else {
                            this.push({ RefinerType: refiner.Type, RefinerValueId: refiner.Id })
                        }

                    }, selectedRefiners);
                }

                return selectedRefiners;
            }

            function init() {
                $scope.showGridLoader = true;

                //set subscriptions
                
                
                if (initialLoad) {
                    baseService.Subscribe('shell:refreshRefinersContacts', refreshRefinersContacts);
                    baseService.Subscribe('shell:addSelectedRefiner', addSelectedRefiner);
                    baseService.Subscribe('shell:removeSelectedRefiner', removeSelectedRefiner);
                    baseService.Subscribe('shell:refinerSetCompleted', getContacts);
                    baseService.Subscribe('shell:clearAllSelectedRefiners', function () {
                        $scope.selectedRefiners = [];
                    });
                }

                baseService.SearchBarVisibility(true);

                initKernelSubscriptions();

                initGrid();

                homeService.getUserRoles(globalUtility.CurrentUser, onGetUserRolesCompleted);

                //////////////

                function onGetUserRolesCompleted(response) {
                    if (response.Success === true) {
                        angular.forEach(response.Data, function (role) {
                            if (globalUtility.FindOne(role.SecurityRoleName, contributors)) {
                                $scope.isUserContributor = true;

                            }
                            if (role.SecurityRoleName === 'Content Admin') {
                                $scope.isUserContentAdmin = true;
                            }
                        });
                    }

                    initGrid();

                    //load refiners
                    contactsService.getAllLookup("", refinerResult);

                    //////////////
                }
            };

            function refinerResult(data) {
                var preselectedRefiners = getPreselectedRefiners();
                var preselectedSectors = preselectedRefiners.filter(function (pr) { return pr.Type === refinerType.Sector }).map(function (sector) { return sector.Id });
                var preselectedCountries = preselectedRefiners.filter(function (pr) { return pr.Type === refinerType.Country }).map(function (country) { return country.Id });
                var preselectedRegions = preselectedRefiners.filter(function (pr) { return pr.Type === refinerType.Region }).map(function (region) { return region.Id });
                var preselectedOrgTypes = preselectedRefiners.filter(function (pr) { return pr.Type === refinerType.OrganizationType }).map(function (orgType) { return orgType.Id });

                var refinerDS = [];
                if (data.Sectors.length > 0) {
                    var items = [];
                    var parent = "REGULATORY CATEGORY";
                    angular.forEach(data.Sectors, function (item) {
                        if (preselectedSectors.indexOf(item.CoveredSectorId) === -1) {
                            this.push(refinerModel.Item(refinerType.Sector, item.CoveredSectorId, item.CoveredSector, parent));
                        }
                        else {
                            this.push(refinerModel.Item(refinerType.Sector, item.CoveredSectorId, item.CoveredSector, parent, true));
                        }
                    }, items);

                    refinerDS.push(refinerModel.Set(parent, items));
                }
                if (data.Regions.length > 0) {
                    var items = [];
                    var parent = "REGION";
                    angular.forEach(data.Regions, function (item) {
                        if (preselectedRegions.indexOf(item.RegionId) === -1) {
                            this.push(refinerModel.Item(refinerType.Region, item.RegionId, item.RegionName, parent));
                        }
                        else {
                            this.push(refinerModel.Item(refinerType.Region, item.RegionId, item.RegionName, parent, true));
                        }

                    }, items);

                    refinerDS.push(refinerModel.Set(parent, items));
                }
                if (data.Countries.length > 0) {
                    var items = [];
                    var parent = "COUNTRY";
                    angular.forEach(data.Countries, function (item) {
                        if (preselectedCountries.indexOf(item.CountryItemId) === -1) {
                            this.push(refinerModel.Item(refinerType.Country, item.CountryItemId, item.CountryName, parent));
                        }
                        else {
                            this.push(refinerModel.Item(refinerType.Country, item.CountryItemId, item.CountryName, parent, true));
                        }

                    }, items);

                    refinerDS.push(refinerModel.Set(parent, items));
                }

                if (data.OrganizationType.length > 0) {
                    var items = [];
                    var parent = "ORGANIZATION TYPE";
                    angular.forEach(data.OrganizationType, function (item) {
                        if (preselectedOrgTypes.indexOf(item.Id) === -1) {
                            this.push(refinerModel.Item(refinerType.OrganizationType, item.Id, item.Name, parent));
                        }
                        else {
                            this.push(refinerModel.Item(refinerType.OrganizationType, item.Id, item.Name, parent, true));

                        }
                    }, items);

                    refinerDS.push(refinerModel.Set(parent, items));
                }


                $scope.popupParameter.Regions = data.Regions;
                $scope.popupParameter.Countries = data.Countries;
                $scope.popupParameter.Companies = data.Companies;
                $scope.popupParameter.Sectors = data.Sectors;
                $scope.popupParameter.OrganizationType = data.OrganizationType;

                var addNotAvailableRefiner = function (data) {
                    $scope.selectedRefiners.push(data);
                    baseService.AddToGlobalRefiners(data);
                };
                var allowed = ["country", "sector"];
                globalUtility.SetNotAvailableRefiners(refinerDS, allowed, addNotAvailableRefiner);

                var keywordRefiners = globalUtility.GetPreselectedMultiKeywordRefiner();
                for (var i = 0; i < keywordRefiners.length; i++) {
                    addSelectedRefiner({}, keywordRefiners[i]);
                }
                //if (keywordRefiner != undefined) baseService.Publish('shell:addSelectedRefiner', keywordRefiner);

                baseService.Publish('shell:setRefinerDataSource', refinerDS);
                //baseService.Subscribe('shell:loadPreselectedRefiners',loadPreselectedRefiners);

                //baseService.Publish('shell:loadPreselectedRefiners');
                //loadPreselectedRefiners(); 


                //   getContacts();

                //initialLoad = false;
            };

            function initGrid() {
                //edit/delete buttons disabled for sprint 5
                if ($scope.isUserContributor) {
                    columns = [{ name: 'Edit', width: '4%', cellTemplate: '<a class="fa fa-pencil-square-o text-align-center" ng-click="grid.appScope.showAddEditWindow(row.entity)" style="cursor: pointer; padding-left:18px;"></a>', enableSorting: false, enableColumnMenu: false }];
                    columns.push({ name: 'Delete', width: '5%', cellTemplate: '<i class="fa fa-trash-o text-align-center" style="cursor: pointer;padding-left:23px;;" ng-click="grid.appScope.showConfirmDialog(row.entity)"></i>', enableSorting: false, enableColumnMenu: false });
                }

                //set default columns                  
                columns.push({ field: 'ContactId', name: 'Contact Id', width: '10%', enableColumnMenu: false, visible: false });
                columns.push({ field: 'Sector', name: 'Regulatory Category', width: '13%', enableColumnMenu: false });
                columns.push({ field: 'Region', name: 'Region', width: '12%', enableColumnMenu: false });
                columns.push({ field: 'Country', name: 'Country', width: '12%', enableColumnMenu: false });
                columns.push({ field: 'OrganizationType', name: 'Organization Type', width: '15%', enableColumnMenu: false });
                columns.push({ field: 'CompanyName', name: 'Company Name', width: '15%', enableColumnMenu: false });
                columns.push({ field: 'Address', name: 'Address', width: '15%', enableColumnMenu: false });
                columns.push({
                    field: 'Name', name: 'Name', width: '15%', enableColumnMenu: false,
                    cellTemplate: '<div>&nbsp;{{row.entity.Name}}&nbsp;<b ng-if="(row.entity.RowStatus) === 1 || (row.entity.RowStatus) === 2" style="color:red;">*{{row.entity.Status}}*</b></div>'
                });
                columns.push({ field: 'TelNo', name: 'Telephone Number', width: '10%', enableColumnMenu: false });
                columns.push({ field: 'Email', name: 'Email Address', width: '12%', enableColumnMenu: false });
                columns.push({ field: 'Mobile', name: 'Mobile Number', width: '12%', enableColumnMenu: false });
                columns.push({ field: 'Skype', name: 'Skype', width: '12%', enableColumnMenu: false });
                columns.push({ field: 'Title', name: 'Title', width: '10%', enableColumnMenu: false });
                columns.push({ field: 'Note', name: 'Notes', width: '15%', enableColumnMenu: false });
                columns.push({ field: 'Website', name: 'Website', width: '15%', enableColumnMenu: false });

                $scope.contactGrid = {
                    //enableSorting: true,
                    //enableColumnResizing: true,
                    columnDefs: columns,
                    suppressMultiColumnSorting: true,
                    data: 'contacts',
                    infiniteScrollRowsFromEnd: 10,
                    infiniteScrollUp: false,
                    infiniteScrollDown: true,
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                        gridApi.infiniteScroll.on.needLoadMoreData($scope, loadMore);
                        gridApi.selection.on.rowSelectionChanged($scope, gridSelectionChanged);
                        gridApi.selection.on.rowSelectionChangedBatch($scope, gridBatchSelectionChanged);
                    }
                };

                //////////////

                function gridBatchSelectionChanged(data) {
                    $scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
                };

                function gridSelectionChanged(data) {
                    $scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
                };

                function loadMore() {
                    //if (totalRows >= searchCertificates.length) {
                    //alert('load more');

                    //}
                    $scope.showGridLoader = true;

                    //searchContacts(page);
                    page = page + 1;

                    $scope.gridApi.infiniteScroll.saveScrollPercentage();
                    getContacts('loadMore');
                    //searchContacts();

                    $scope.gridApi.infiniteScroll.dataLoaded();
                };
            }

            function initKernelSubscriptions() {
                var channel = new kernel.messaging.channel(window.parent);

            var subscriber = new kernel.messaging.subscriber('SmartInsight Contacts', 'searchFilter', function (command) {
                var searchWord = command.arg;
                
                keywords = searchWord.split(' ');
                if (keywords.length > 0) {
                    angular.forEach(keywords, function (key) {
                        var keywordRefiner = {
                            Checked: '',
                            Id: key.length > 50 ? key.slice(0, 50) : key,
                            IsDateRange: false,
                            Parent: 'KEYWORD',
                            Type: 'keyword',
                            Value: key.length > 50 ? key.slice(0, 50) : key
                        }
                        keyword = key;
                        addSelectedRefiner({}, keywordRefiner);
                    });
                }

                //var keywordRefiner = {
                //    Checked: '',
                //    Id: searchWord.length > 50 ? searchWord.slice(0, 50) : searchWord,
                //    IsDateRange: false,
                //    Parent: 'KEYWORD',
                //    Type: 'keyword',
                //    Value: searchWord.length > 50 ? searchWord.slice(0, 50) : searchWord
                //}

                //var typeList = $scope.selectedRefiners.map(function (r) { return r.Type });
                //var keyWordIndex = typeList.indexOf('keyword');

                //$scope.selectedRefiners.splice(keyWordIndex, 1);

                //keyword = searchWord;

                //addSelectedRefiner({}, keywordRefiner);                
            });
            channel.register(subscriber);
        }

        function removeRefiner(refiner) {
            $scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== refiner; });
            baseService.Publish('shell:uncheckRefiner', refiner);

            if ($scope.selectedRefiners.length === 0) {
                keyword = '';
            }
            else {
                angular.forEach($scope.selectedRefiners, function (key) {
                    if (key.Type === 'keyword') {
                        //keyword = '';
                        keyword = key.Value;
                    }
                });
            }
            //if (refiner.Type === 'keyword') {
            //    //keyword = '';
            //    keyword = keywords;
            //}
            
            baseService.RemoveFromGlobalRefiners(refiner);

            getContacts('removeRefiner');
            };

            function removeSelectedRefiner(event, data) {
                $scope.selectedRefiners = $filter('filter')($scope.selectedRefiners, function (value, index) { return value !== data; });

                page = 1;

                //reset data for each refiner
                $scope.contacts = [];

                baseService.RemoveFromGlobalRefiners(data);

                getContacts('removeSelectedRefiner');
            }

            function result(data) {
                typeAheadList = [];

                var stillMoreData = true;

                if (data.Data.length !== 0) {
                    typeAheadList = typeAheadList.concat(data.Data.map(function (c) { return c.Firstname; }));
                    typeAheadList = arrayUnique(typeAheadList.concat(data.Data.map(function (c) { return c.Lastname; })));
                    typeAheadList = arrayUnique(typeAheadList.concat(data.Data.map(function (c) { return c.Email; })));
                    typeAheadList = arrayUnique(typeAheadList.concat(data.Data.map(function (c) { return c.CompanyName; })));

                    baseService.PopulateTypeAHead(typeAheadList);

                    if (page === 1) {
                        $scope.contacts = data.Data;

                        angular.forEach($scope.contacts, function (dataEmail) {
                            var email = dataEmail.Email.trim();
                            if (email != "") {
                                $scope.contactsEmail.push(dataEmail.Email);
                            }
                        });

                        angular.forEach($scope.contacts, function (data) {
                            if (data.RowStatus === 1) {
                                console.log('new');
                                data.Status = "New";
                            }
                            else if (data.RowStatus === 2) {
                                console.log('updated');
                                data.Status = "Updated";
                            }
                        })
                    }
                    else {
                        $scope.contacts = $scope.contacts.concat(data.Data);
                        angular.forEach($scope.contacts, function (data) {
                            if (data.RowStatus === 1) {
                                console.log('new');
                                data.Status = "New";
                            }
                            else if (data.RowStatus === 2) {
                                console.log('updated');
                                data.Status = "Updated";
                            }
                        })
                    }
                }
                else {
                    stillMoreData = false;
                }

                if ((page === 1 && data.Data.length < initialRowsToLoad) || (page > 1 && data.Data.length < perPageLoad)) {
                    stillMoreData = false;
                }

                $scope.gridApi.infiniteScroll.dataLoaded(false, stillMoreData);


                //$scope.contactGrid.data = $scope.contacts;
                $scope.showGridLoader = false;

                //page = page + 1; 
                baseService.IsBusy(false);
                initialLoad = false;
                isFavorite = false;
            };

            function showAddEditWindow(gridRow) {
                if (gridRow === undefined) {
                    $scope.popupParameter.Record = null;
                    $scope.popupParameter.EmailList = $scope.contactsEmail;
                }
                else {
                    $scope.popupParameter.Record = jQuery.extend(true, {}, gridRow);
                    $scope.popupParameter.EmailList = $scope.contactsEmail;
                }

                var modalInstance = dialogService.Dialog.WithTemplateAndControllerInstance("AddContactDialog.html", "contactsAddController", "lg", $scope.popupParameter);

                modalInstance.result.then(function (data) {
                    //refresh page
                    page = 1;

                    getContacts('showAddEditWindow');
                }, function (error) {
                    //on dismiss do something if necessary    
                    if (error !== 'cancel') {
                        dialogService.Dialog.Alert(error, enums.MessageType.Error);
                    }
                });
            };

            function showManageCompaniesWindow() {

                var modalInstance = dialogService.Dialog.WithTemplateAndControllerInstance("ManageCompaniesDialog.html", "manageCompaniesController", "md", $scope.popupParameter);

                modalInstance.result.then(function (data) {
                    //refresh page
                    page = 1;

                    getContacts('showManageCompaniesWindow');
                }, function (error) {
                    //on dismiss do something if necessary    
                    if (error !== 'cancel') {
                        dialogService.Dialog.Alert(error, enums.MessageType.Error);
                    }
                });
            };

            function showConfirmDialog(gridRow) {
                var recordId = gridRow.ContactId;
                var message = "Are you sure you want to permanently delete this contact?";
                var title = "Delete Contact";

                dialogService.Dialog.Confirm(enums.ConfirmType.DeleteCancel, message, title, enums.ModalSize.Medium, deleteRecord);

                //////////////

                function deleteRecord(response) {
                    if (response == enums.CallbackType.Cancel) return;
                    contactsService.deleteContact("'" + recordId + "'", deleteResult);

                    //////////////

                    function deleteResult(data) {
                        page = 1;

                        $scope.contactsEmail = [];
                        getContacts('deleteRecord');
                    };
                };
            };

            //destructor
            $scope.$on('$destroy', function () {
                var events = ['shell:addSelectedRefiner', 'shell:removeSelectedRefiner', 'shell:refinerSetCompleted', 'shell:clearAllSelectedRefiners', 'shell:loadPreselectedRefiners', 'shell:refreshRefinersContacts'];
                baseService.UnSubscribe(events);
            });
        }]);
});
