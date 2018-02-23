
'use strict';

define(['app'],
    function (app) {
        app.controller('favoritesPopOverController', ['$scope', '$filter', 'items', '$uibModalInstance', 'baseService',
        function ($scope, $filter, items, $uibModalInstance, baseService) {

            $scope.closeDialog = closeDialog;
            $scope.favorite    = '';
            $scope.saveFile    = saveFile;
            $scope.favorites   = [];
            $scope.isExisting  = false;
            init();

            ////////////
            function closeDialog() {
                $uibModalInstance.dismiss();
                baseService.ShowOverlay(false);
            }

            function init() {
                $scope.favorites = items;
            }

            function saveFile() {
                //check database if favorite name already exists
                var existingFavorite = $filter('filter')($scope.favorites, function (value, index) { return value.Name == $scope.favorite; });
                
                if (existingFavorite.length > 0) {
                    $scope.isExisting = true;
                }
                else {
                    $uibModalInstance.close($scope.favorite);
                    baseService.ShowOverlay(false);
                }
               
            }
        }]);
});