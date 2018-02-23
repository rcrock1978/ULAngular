
define([
	'app',
	'globalUtility',
    'enums',
    'routeResolver',
    'module/r2c/model/headerModel',
    'module/r2c/model/r2cWorkflowModel',
    'shell/model/refinerModel',
], function (app, globalUtility, enums, routeResolver, headerModel,workFlowModel, refinerModel) {

    app.register.controller('r2cWorkflowTrackingController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'r2cService', 'exportService',
	    function ($scope, $http, $rootScope, $filter, baseService, dialogService, r2cService, exportService) {

	        $scope.headers = [];
	        $scope.workFlows = [];

	        $scope.initWorkFlow = function (data) {
	            baseService.Subscribe("workflow:saveCompleted", onSaveCompleted);
	            baseService.Subscribe("workflow:addWorkflow", onWorkflowReviewd);
	            baseService.Subscribe("r2cWorkFlow:GetAllByRefiners", GetAllWorkFlow);
	            baseService.SearchBarVisibility(false);
	            initiallizeHeaders();
	            
	        };

	        var initiallizeHeaders = function () {
	            $scope.headers.push(headerModel.Set("RegulatoryCategory", "RegulatoryCategory", "15%"));

	            $scope.headers.push(headerModel.Set("Region", "Region", "12%"));
	            $scope.headers.push(headerModel.Set("Country", "Country", "12%"));
	            $scope.headers.push(headerModel.Set("ComplianceProgram", "ComplianceProgram", "15%"));
	            var fieldChangesTemplate = "<a ng-click='grid.appScope.OpenFieldChanges(row.entity)' style='cursor: pointer; padding-left:18px;'>{{row.entity.RequestType != 1 ? 'View Changes' : ''}}</a>";
	            $scope.headers.push(headerModel.Set("Field Changes", "OriginalInformation", "15%", fieldChangesTemplate));
	            $scope.headers.push(headerModel.Set("Source", "Source", "15%"));
	            var linksTemplate = "<a ng-click='grid.appScope.OpenWorkflow(row.entity)' style='cursor: pointer; padding-left:18px;'>{{row.entity.Links}}</a>";
	            $scope.headers.push(headerModel.Set("Links", "Links", "15%", linksTemplate));
	            $scope.headers.push(headerModel.Set("WorkflowStatus", "WorkflowStatus", "20%"));
	            $scope.headers.push(headerModel.Set("DateSubmitted", "DateSubmitted", "15%"));

	           
	            angular.forEach($scope.headers, function (item) {
	                this.push({
	                    Field: item.Field,
	                    name: item.Title,
	                    width: item.Width,
	                    cellTemplate: item.CellTemplate,
	                    enableColumnMenus: false
	                })
	            }, $scope.columns);

	          //  GetAllWorkFlow();
	        };

	        var onGetAllWorkflow_Completed = function (response) {
	            $scope.workFlows = workFlowModel.Set(response.Data);
	            $scope.workFlowGrid.data = angular.copy($scope.workFlows);
	            baseService.IsBusy(false);
	        };
	        

	        var GetAllWorkFlow = function (event,param) {
	            baseService.IsBusy(true);
	            r2cService.GetAllWorkFlow(param, onGetAllWorkflow_Completed);
	        };

	        $scope.OpenFieldChanges = function (item) {
	            dialogService.Dialog.WithTemplateAndController("r2cWorkflowFieldChanges.html", "r2cWorkflowFieldChangesController", enums.ModalSize.Medium, item);
	        };

	        $scope.OpenWorkflow = function (data) {
	            //RequestType
	            //1 = ChangeRequest
	            //0 = Document
	            //2 = Samples Mode
	            //3 = SampleRemarks
	            //4 = CommonRemarks
	            if (data.RequestType == 1) {
	                var param = {
	                    CountryName: data.Country,
	                    CountryTradeGroup : data.CountryTradeGroup,
	                    SectorsRegulated: data.SectorRegulated,
	                    ComplianceProgram: data.ComplianceProgram,
	                    Scope: enums.ModuleType.RequiredItems,
	                    WorkflowDetails: data.WorkflowStatus,
	                    WorkflowLink: null,
	                    CountryIds: data.GeoItemId,
	                    CountryTradeGroupId: data.CountryTradeGroupId,
	                    WorkflowItemId: data.ItemId,
	                    CoveredSectorId: data.SectorRegulatedId,
	                    ComplianceProgramId: data.ComplianceProgramId
	                };
	                
	                dialogService.Dialog.WithTemplateAndController("changeRequestDetails.tpl.html", "changeRequestDetailsController", enums.ModalSize.Medium, param);
	            }
	            else {
	                $scope.viewWorkFlow(data); // call function from r2cController/ or the parent controller
	                //baseService.Publish('r2c:viewWorkFlow', data);
	            }
	        };

	        //GRID OPTIONS
	        $scope.columns = [
                 {
                     name: 'View',
                     width: '12%',
                     cellTemplate:'<a ng-click="grid.appScope.OpenWorkflow(row.entity)" style="cursor: pointer; padding-left:18px;">View Details</a>',
                     enableColumnMenus: false
                 }
	        ];
	     

	        var gridSelectionChanged = function (data) {
	            $scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
	        };
	        var gridBacthSelectionChanged = function (data) {
	            $scope.gridSelections = angular.copy($scope.gridApi.selection.getSelectedRows());
	        };

	        var onWorkflowReviewd = function (data) {
	            $scope.searchViaRefiners();
	           // baseService.Publish("r2cWorkFlow:SearchViaRefiners");
	           // GetAllWorkFlow();
	        };

	        var onSaveCompleted = function (event,data) {
	            GetAllWorkFlow();
	        };

	        $scope.gridSelections = [];

	        $scope.workFlowGrid = {
	            enableColumnMenus: false,
	            enableHiding: false,
	            enableSorting: true,
	            enableColumnResizing: true,
	            columnDefs: $scope.columns,
	            infiniteScrollRowsFromEnd: 20,
	            infiniteScrollUp: true,
	            infiniteScrollDown: true,
	            onRegisterApi: function (gridApi) {
	                $scope.gridApi = gridApi;
	               // gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.LoadMore);
	                //gridApi.selection.on.rowSelectionChanged($scope, gridSelectionChanged);
	                //gridApi.selection.on.rowSelectionChangedBatch($scope, gridBacthSelectionChanged);
	            }
	        };


	        $scope.initWorkFlow();

	        $scope.$on('$destroy', function () {

	            var events = ['workflow:addWorkflow', 'r2cWorkFlow:GetAllByRefiners', 'workflow:saveCompleted'];
	            baseService.UnSubscribe(events);
	        });
	    }]);
});
