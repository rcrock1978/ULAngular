'use strict';

define(['app','globalUtility','enums'],
    function (app, globalUtility, enums) {
        app.controller('manageFavoritesController', ['$scope', '$location', 'items', '$uibModalInstance', 'baseService', 'homeConfigService', 'homeService', 'dialogService', '$filter',
        function ($scope, $location, items, $uibModalInstance, baseService, homeConfigService, homeService, dialogService, $filter) {
            var favoritesList = [];

            $scope.closeDialog = closeDialog;
            $scope.deleteFavorite = deleteFavorite;
            $scope.favorite = '';
            $scope.favoritesGrid = {};
            $scope.gridSelection = [];
            $scope.moveDown = moveDown;
            $scope.moveUp = moveUp;
            $scope.saveFavorites = saveFavorites;
            $scope.searchFavorite = searchFavorite;

            init();

            ////////////
            function closeDialog() {
                $uibModalInstance.dismiss();
                baseService.ShowOverlay(false);
            }

            function deleteFavorite(row) {
                var data = row.UserPreferenceFavoriteId;

                homeService.deleteFavorite(data, deleteFavorite_Completed);

                function deleteFavorite_Completed(response) {
                    if (response) {                        
                        if (response.Success) {
                            //dialogService.Dialog.Alert(response.Data.Message, enums.MessageType.Success);
                            loadFavorites();
                        }
                        else {
                            //dialogService.Dialog.Alert(response.ErrorMessage, enums.MessageType.Success);
                        }
                    }
                }
            }

            function init() {
                //create favorites grid setup
                //alert(items.moduleId);
                $scope.favoritesGrid = homeConfigService.favoritesGridConfig;

                $scope.favoritesGrid.onRegisterApi = function (gridApi) {
                    //set gridApi on scope
                    $scope.favoritesGridApi = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, gridSelectionChanged);
                };

                loadFavorites();

                ////////////

                function gridSelectionChanged(data) {
                    $scope.gridSelection = angular.copy($scope.favoritesGridApi.selection.getSelectedRows());
                };
            }

            function loadFavorites() {
                var params = {
                    UserName: globalUtility.CurrentUser,
                    UserType: 0
			    };

	            homeService.getUserPreferences(params, onGetUserPreferences_Completed);
            }

            function onGetUserPreferences_Completed(response) {
                if (response.Success) {
                    angular.forEach(response.Data.Favorites, function (value, key, obj) {
                        switch (value.ModuleId) {
                            case enums.ModuleType.Regulatory.Id:
                                value.ModuleName = enums.ModuleType.Regulatory.Description;
                                break;
                            case enums.ModuleType.RequiredItems.Id:
                                value.ModuleName = enums.ModuleType.RequiredItems.Description;
                                break;
                            case enums.ModuleType.Delivery.Id:
                                value.ModuleName = enums.ModuleType.Delivery.Description;
                                break;
                            case enums.ModuleType.News.Id:
                                value.ModuleName = enums.ModuleType.News.Description;
                                break;
                            case enums.ModuleType.Contacts.Id:
                                value.ModuleName = enums.ModuleType.Contacts.Description;
                                break;
                            case enums.ModuleType.Certificates.Id:
                                value.ModuleName = enums.ModuleType.Certificates.Description;
                                break;

                        }
                    });
                    $scope.favoritesGrid.data = response.Data.Favorites;
                }
            }

            function moveDown() {
                var idx;

                if ($scope.gridSelection.length !== 0) {
                    //for (var i = $scope.selectedChosen.length - 1; i > -1; i--) {
                        //get index from array
                    idx = $scope.favoritesGrid.data.map(function (f) { return f.UserPreferenceFavoriteId }).indexOf($scope.gridSelection[0].UserPreferenceFavoriteId);

                    //check if index not equal to grid data length
                    if (idx !== $scope.favoritesGrid.data.length - 1) {
                        //remove selected from grid               
                        $scope.favoritesGrid.data.splice(idx, 1);

                        //increment idx
                        idx++;

                        //re-insert at lower spot
                        $scope.favoritesGrid.data.splice(idx, 0, $scope.gridSelection[0]);
                    }
                    //}
                }
            }

            function moveUp() {
                var idx;

                if ($scope.gridSelection.length !== 0) {
                    //for multiple selection
                    //for (var i = 0; i < $scope.selectedChosen.length; i++) {
                        //get index from array
                    idx = $scope.favoritesGrid.data.map(function (f) { return f.UserPreferenceFavoriteId }).indexOf($scope.gridSelection[0].UserPreferenceFavoriteId);

                    if (idx !== 0 && idx !== -1) {
                        //remove selected from chosen array                    
                        $scope.favoritesGrid.data.splice(idx, 1);

                        //increment idx
                        idx--;

                        //re-insert at lower spot
                        $scope.favoritesGrid.data.splice(idx, 0, $scope.gridSelection[0]);
                    }
                    //}
                }
            }

            function saveFavorites() {
                //check database if favorite name already exists
                var data = [];
                var favItem = {};

                angular.forEach($scope.favoritesGrid.data, function (value, key, obj) {
                    favItem = {
                        UserPreferenceFavoriteId: value.UserPreferenceFavoriteId, //should not be included
                        ModuleId: 0,
                        Name: value.Name,
                        Sort: (obj.length - key), //should not be included
                        CreatedBy: '',
                        ModifiedBy: globalUtility.CurrentUser, //should be blank on first save
                        SelectedRefiners: [],
                        UserPreference:
                        {
                            Id: null,
                            UserName: globalUtility.CurrentUser,
                            UserType: 0,
                            ApplicationId: null,
                            CultureTypeIds: 1,
                            CoveredSectorIds: '',
                            CreatedOrModifiedBy: globalUtility.CurrentUser,
                        }
                    };

                    data.push(favItem);
                })

                homeService.saveFavorites(data, onSaveFavorites_Completed);

                
            }

            function searchFavorite(favItem) {
                globalUtility.SelectedScope = "";
                switch (favItem.ModuleId) {
                    case enums.ModuleType.Regulatory.Id: globalUtility.SelectedScope = enums.ModuleType.Regulatory.Description; break;
                    case enums.ModuleType.RequiredItems.Id: globalUtility.SelectedScope = enums.ModuleType.RequiredItems.Description; break;
                    case enums.ModuleType.Delivery.Id: globalUtility.SelectedScope = enums.ModuleType.Delivery.Description; break;
                    case enums.ModuleType.News.Id: globalUtility.SelectedScope = enums.ModuleType.News.Description; break;
                    case enums.ModuleType.Contacts.Id: globalUtility.SelectedScope = enums.ModuleType.Contacts.Description; break;
                    case enums.ModuleType.Certificates.Id: globalUtility.SelectedScope = enums.ModuleType.Certificates.Description; break;
                }

                homeService.buildRefiners(favItem.FavoriteDetails);

                var validModules = $filter('filter')(globalUtility.Modules, function (value, index) { return value.IsEnable == true; });
                var defaultModule = $filter('filter')(validModules, function (value, index) { return value.AppName == globalUtility.SelectedScope; });

                angular.forEach(globalUtility.Modules, function (module) {
                    module.Selected = (module.AppName == globalUtility.SelectedScope);
                });

                var path = $location.path();

                if (globalUtility.CurrentPage != globalUtility.SelectedScope) {
                    baseService.Publish('shell:tabSelectionChange', defaultModule[0]);
                }
                else {
                    baseService.Publish('shell:clearAllSelectedRefiners');

                    switch (favItem.ModuleId) {
                        case enums.ModuleType.Regulatory.Id: baseService.Publish('shell:refreshRefinersRegulatory', true); break;
                        case enums.ModuleType.RequiredItems.Id: baseService.Publish('shell:refreshRefinersRequiredItems', true); break;
                        case enums.ModuleType.Delivery.Id: gbaseService.Publish('shell:refreshRefinersDelivery', true); break;
                        case enums.ModuleType.News.Id: baseService.Publish('shell:refreshRefinersNews', true); break;
                        case enums.ModuleType.Contacts.Id: baseService.Publish('shell:refreshRefinersContacts', true); break;
                        case enums.ModuleType.Certificates.Id: baseService.Publish('shell:refreshRefinersCertificates', true); break;
                    }
                }

                if (path == '/home') {
                    baseService.RouteToPage(enums.Page.Main);
                }

                //baseService.Publish('shell:tabSelectionChange', defaultModule[0]);

                //baseService.RouteToPage(enums.Page.Main);

                closeDialog();
            }

            function onSaveFavorites_Completed() {
                baseService.Publish('favorites:refresh', {});
                $uibModalInstance.close($scope.favorite);
                baseService.ShowOverlay(false);
            }
        }]);
    });