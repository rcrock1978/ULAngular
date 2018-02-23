define([
	'app',
    'authService',
    'globalUtility',
    'routeResolver',
    'enums'
], function (app, authService, globalUtility, routeResolver, enums) {

    app.controller('changeRequestDetailsController', ['$scope', '$location', '$filter', '$sce', '$q', '$localStorage', '$cookies', '$cookieStore', '$sessionStorage', '$timeout', 'homeService', 'baseService', 'dialogService', 'bsAlertService', 'moduleService', 'workflowService', 'workflowConfigService', 'items',
	function ($scope, $location, $filter, $sce, $q, $localStorage, $cookies, $cookieStore, $sessionStorage, $timeout, homeService, baseService, dialogService, bsAlertService, moduleService, workflowService, config, items) {

	    $scope.CloseDialog           = CloseDialog;
	    $scope.Download              = Download;
	    $scope.title                 = "REQUEST FOR CHANGE DETAILS";
	    $scope.Save                  = Submit;
	    $scope.Country               = items.CountryName;
	    $scope.RegionalEconomicUnion = items.CountryTradeGroup;
	    $scope.Sector                = items.SectorsRegulated;
	    $scope.ComplianceProgram     = items.ComplianceProgram;
	    $scope.Scope                 = items.Scope.Description;
	    $scope.WorkflowDetails       = items.WorkflowDetails;
	    $scope.WorkflowLink          = items.WorkflowLink;
	    $scope.isDisabled            = globalUtility.Contributor || globalUtility.Reader || globalUtility.SalesReader;
	    $scope.relatedFiles          = [];
	    var success                  = [];
	    var errors                   = [];

	    init();

	    function init() {
	        var onSuccess = function (response) {
	            if (response.IsSuccess) {
	                $scope.relatedFiles = {
	                    files: angular.copy(response.WorkflowPicturePath.PrimaryFiles),
	                    workflowItemId: angular.copy(items.WorkflowItemId)
	                };
	            }

	        };

	        var param = {
	            itemId: items.WorkflowItemId
	        };
	        homeService.getSourceDocuments(param, onSuccess);
	    }

	    function Download(item, workflowItemId) 
	    {
	        baseService.IsBusy(true);

	        var onSuccess = function (response) {

	            if (response.Message == enums.ResponseType.Success) {
	                var blob = new Blob([response.Data], { type: "application/octet-stream" });
	                saveAs(blob, item);
	            }
	            baseService.IsBusy(false);
	        };

	        homeService.downloadFile(
                {
                    FileName: item,
                    WorkflowItemId: workflowItemId
                },
               onSuccess);
	    };

	    function Submit() {
	        baseService.IsBusy(true);
	        var requestParam = {
	            WorkflowId: items.WorkflowItemId,
	            GeoItemId: items.CountryIds,
	            CountryTradeGroupId: items.CountryTradeGroupId,
	            CoveredSectorId: items.CoveredSectorId,
	            ComplianceProgramId: items.ComplianceProgramId,
	            ModuleId: items.Scope.Id,
	            Details: items.WorkflowDetails,
	            Link: items.WorkflowLink,
	            WorkflowStatusId: enums.WorkflowStatus.ReviewCompleted.Id,
	            CreatedBy: globalUtility.CurrentUser,
	            ModifiedBy: globalUtility.CurrentUser
	        };

	        workflowService.saveWorkflow(requestParam, onSaveWorkflow_Completed);
	    }

	    var onSaveWorkflow_Completed = function (response) {
	        if (response) {
	            if (response.Success) {
	                success.push(response.Data.Message);
	                saveCompleted();
	            }
	            else {
	                errors.push(response.Data ? response.Data.Message : response.ErrorMessage);
	                saveCompleted();
	            }
	        }
	    };

	    var saveCompleted = function () {
	        baseService.IsBusy(false);
	        $scope.CloseDialog();
	        baseService.Publish("workflow:addWorkflow", { Success: success, Errors: errors, HasErrors: errors.length > 0 });
	        baseService.Publish('shell:refreshRefiners', true);
	    };

	    function CloseDialog() {
	        dialogService.CloseAll();
	    }


	    $scope.$on('$destroy', function () {


	    });
	}]);

});