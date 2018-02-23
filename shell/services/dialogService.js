
define([
    'app',
    'enums'
], function (app,enums) {

    app.factory('dialogService', ['$http', 'baseService', '$uibModal', '$uibModalStack',
    function ($http, baseService, $uibModal, $uibModalStack) {

        var svc = {

            Dialog: {
                Confirm: function (confirmType, message, title, size, callBack,isDialog2) {

                    var okButtonText = "Ok", cancelButtonText = "Cancel";
                    if (confirmType == enums.ConfirmType.YesNo) { okButtonText = "Yes"; cancelButtonText = "No" };
                    if (confirmType == enums.ConfirmType.DeleteCancel) { okButtonText = "Delete"; cancelButtonText = "Cancel" };
                    $uibModal.open({
                        animation: true,
                        templateUrl: isDialog2 ? 'shellConfirmDialog2.html' : 'shellConfirmDialog.html',
                        backdrop: false,
                        keyboard:false,
                        size: size ? size : 'sm',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.message = message;
                            $scope.title = title ? title : "Confirmation";
                            $scope.okButtonText = okButtonText;
                            $scope.cancelButtonText = cancelButtonText;
                            $scope.IsDangerOkButton = confirmType == enums.ConfirmType.DeleteCancel;
                            $scope.Icon = "";
                          
                            if (confirmType == enums.ConfirmType.DeleteCancel) $scope.Icon = "fa fa-warning";
                            $scope.HasIcon = ($scope.Icon != "");
                            
                            $scope.ok = function () {
                                $uibModalInstance.close();
                                if (isDialog2){
                                    baseService.ShowModalPopUpOverLay(false);
                                }
                                 
                                else {
                                    baseService.ShowOverlay(false);
                                }
                                   
                                callBack(enums.CallbackType.Yes);
                            };

                            $scope.cancel = function () {
                                $uibModalInstance.close();
                                if (isDialog2) {
                                    baseService.ShowModalPopUpOverLay(false);
                                }

                                else {
                                    baseService.ShowOverlay(false);
                                }
                                if (confirmType == enums.ConfirmType.DeleteCancel || confirmType == enums.ConfirmType.OkCancel) callBack(enums.CallbackType.Cancel);
                                else callBack(enums.CallbackType.No);
                            };

                            $scope.CloseDialog = function () {
                                $scope.cancel();
                            };

                            $scope.$on('$destroy', function () {

                            });
                        },

                    });
                    if (isDialog2) {
                        baseService.ShowModalPopUpOverLay(true);
                    }

                    else {
                        baseService.ShowOverlay(true);
                    }
                },

                Alert: function (message, type, isDialog2) {

                    baseService.ShowOverlay(true);
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'shellAlertDialog.html',
                        backdrop: false,
                        keyboard: false,
                        size: 'sm',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.message = message;
                            $scope.title = type.Description;
                            $scope.type = type.Icon;

                            $scope.ok = function () {
                                $uibModalInstance.close();
                                if (isDialog2) {
                                    baseService.ShowModalPopUpOverLay(false);
                                }

                                else {
                                    baseService.ShowOverlay(false);
                                }
                            };

                            $scope.$on('$destroy', function () {

                            });
                        }
                    });
                },
                WithTemplateAndController: function (template, controller, size, data) {

                    $uibModal.open({
                        animation: true,
                        templateUrl: template,
                        backdrop: false,
                        keyboard: false,
                        size: size,
                        controller: controller,
                        resolve: {
                            items: function () {
                                return data ? data : null;
                            }
                        }

                    });
                    baseService.ShowOverlay(true);
                },
                WithTemplateAndControllerInstance: function (template, controller, size, data) {

                    var modal = $uibModal.open({
                        animation: true,
                        templateUrl: template,
                        backdrop: false,
                        keyboard: false,
                        size: size,
                        controller: controller,
                        resolve: {
                            items: function () {
                                return data ? data : null;
                            }
                        }

                    });
                    baseService.ShowOverlay(true);

                    return modal;
                },
                WithTemplateAndControllerInstanceAndClass: function (template, controller, size, data, cssClass) {

                    var modal = $uibModal.open({
                        animation: true,
                        templateUrl: template,
                        backdrop: false,
                        keyboard: false,
                        size: size,
                        windowClass: cssClass,
                        controller: controller,
                        resolve: {
                            items: function () {
                                return data ? data : null;
                            }
                        }

                    });
                    baseService.ShowOverlay(true);

                    return modal;
                },
                Form: function (formUrl,title,subTitle,okText,cancelText,size) {
                    baseService.ShowOverlay(true);
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'shellDialogForm.html',
                        backdrop: false,
                        keyboard: false,
                        size: size,
                        controller: function ($scope, $uibModalInstance) {
                            $scope.Title = title;
                            $scope.SubTitle = subTitle;
                            $scope.OkText = okText;
                            $scope.CancelText = cancelText;
                            $scope.formUrl = formUrl;

                            $scope.Ok = function () {

                            };

                            $scope.CloseDialog = function () {
                                $uibModalInstance.close();
                                baseService.ShowOverlay(false);
                            };
                          
                            $scope.$on('$destroy', function () {
                              
                               
                            });
                        }
                    });
                },
                
            },
            CloseAll: function (reason) {
                $uibModalStack.dismissAll(reason);
                baseService.ShowOverlay(false);
            },
            AddFavorite: function (channel, data, callback, callbackError) {
                var subscriber = new kernel.messaging.subscriber('SmartInsight', 'addFavorites', function (command) {

                    var modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: "addFavorites.html",
                        backdrop: false,
                        keyboard: false,
                        size: "sm",                    
                        controller: "favoritesPopOverController",
                        resolve: {
                            items: function () {
                                return data ? data : null;                                
                            }
                        }

                    });
                    baseService.ShowOverlay(true);

                    modalInstance.result.then(function (response) {
                        callback(response);
                    }, function (error) {
                        callbackError();
                    });
                });
                channel.register(subscriber);
            }
        };

        return svc;

    }]);
});

