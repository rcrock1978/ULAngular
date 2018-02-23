
require.config({
    waitSeconds: 0,
    paths: {
        'app': 'shell/app',
        'text' : 'shell/libs/text',
        'ngStorage': 'shell/libs/modules/ngStorage.min',
        'ngCookies': 'shell/libs/angular/angular-cookies.min',
        //Utility
        'baseService': 'shell/services/baseService',
        'enums': 'shell/enum/enums',
        'dialogService': 'shell/services/dialogService',
        'globalUtility':'shell/common/globalUtility',
        'routeResolver': 'shell/common/routeResolver',
        //Directives
        'processOnEnter': 'shell/directives/input/processOnEnter',
        'fileread': 'shell/directives/input/fileUploadReader',
        'loadMoreOnScorllDown': 'shell/directives/scroll/loadMoreOnScorllDown',
        'batchFileUpload': 'shell/directives/input/batchFileUpload',
        'maxInputLength': 'shell/directives/input/siMaxInputLength',
        'ngDropdownMultiselectDisabled': 'shell/directives/input/ngDropdownMultiselectDisabled',
        'smiFileUpload': 'shell/directives/input/smiFileUpload',
        'smiDropDown': 'shell/directives/input/smiDropDown',
        'smiModalTabs': 'shell/directives/tab/smiModalTabs',
        'uiSelectWrap': 'shell/directives/input/uiSelectWrap',
        'smiAddEvidence': 'shell/directives/input/smiAddEvidence',
        'smiActiveTab': 'shell/directives/tab/smiActiveTab',
        //Services
        'authService': 'shell/services/authService',
        'crudService': 'shell/services/crudService',
        'moduleService': 'shell/services/moduleService',
        'homeService': 'shell/services/homeService',
        'homeConfigService': 'shell/services/homeConfigService',
        'workflowService': 'shell/services/workflowService',
        'workflowConfigService': 'shell/services/workflowConfigService',
        'bsAlertService': 'shell/services/bsAlertService',
        'exportService': 'shell/services/exportService',
        //Controllers
        'masterpageController' :'shell/controllers/masterpageController',
        'contentController' : 'shell/controllers/contentController',
        'homeController': 'shell/controllers/homeController',
        'settingsController': 'shell/controllers/settingsController',
        'bsAlertController': 'shell/controllers/bsAlertController',
        'tabController': 'shell/controllers/tabController',
        'leftpaneController': 'shell/controllers/leftpaneController',
        'rightpaneController': 'shell/controllers/rightpaneController',
        'fileUploaderController': 'shell/controllers/fileUploaderController',
        'smiDropDownController': 'shell/controllers/smiDropDownController',
        'smiModalTabController': 'shell/controllers/smiModalTabController',
        'errorPageController': 'shell/controllers/errorPageController',
        'changeRequestFormController': 'shell/controllers/changeRequestFormController',
        'changeRequestDetailsController': 'shell/controllers/changeRequestDetailsController',
        'favoritesPopOverController': 'shell/controllers/favoritesPopOverController',
        'manageFavoritesController': 'shell/controllers/manageFavoritesController',
        //Javascript Libraries
        'fileSaver': 'shell/libs/FileSaver.min',
        'xlsx': 'shell/libs/xlsx.core.min',
        'uiselect': 'shell/libs/uiselect',
        //'jquery': 'shell/libs/jquery-1.11.3.min',
        'kernelShell': 'shell/libs/kernel.client',
        //'angular': 'shell/libs/angular/angular.min'
        //Interceptor
        'tokenInterceptor': 'shell/services/tokenInterceptor',
        'tinyMCE': 'shell/libs/tinyMCE/tinymce.min',
        'uiTinyMCE': 'shell/libs/tinyMCE/ui-tinymce.min',
        'sanitize': 'shell/libs/angular/angular-sanitize.min',
        'pdfmake': 'shell/libs/pdfmake.min',
        'vfsfonts': 'shell/libs/vfs_fonts'
    },

    shim: 
        {
            //'jquery' : {
               
            //},
            //'angular' : {
            //    deps : ['jquery']
            //},
            //'app' : {
            //    deps : ['angular']
            //},
            //'xlsx': {
            //    deps: ['jquery']
            //},
            //'fileSaver': {
            //    deps: ['jquery']
            //},
            'exportService': {
                deps : ['fileSaver', 'xlsx']
            },
            //'uiselect': {
            //    deps: ['jquery']
            //}
      /*  'ngRouter': {
            deps: ['jQuery', 'angular']
        },
        'app': {
            deps: [
                'angular',
                'jQuery',
                '_kendo',
                'ngRouter'
            ]
        }
        */
      }
});


require([
	'app',
    'text',
    'ngStorage',
    'ngCookies',
    'baseService',
    'enums',
    'dialogService',
    'globalUtility',
	'routeResolver',
    'processOnEnter',
    'fileread',
    'loadMoreOnScorllDown',
    'batchFileUpload',
    'maxInputLength',
    'ngDropdownMultiselectDisabled',
    'smiFileUpload',
    'smiDropDown',
    'smiModalTabs',
    'uiSelectWrap',
    'smiAddEvidence',
    'smiActiveTab',
    'authService',
    'crudService',
    'moduleService',
    'homeService',
    'homeConfigService',
    'workflowService',
    'workflowConfigService',
    'bsAlertService',
    'exportService',
	'masterpageController',
	'contentController',
    'homeController',
    'settingsController',
    'bsAlertController',
    'tabController',
    'leftpaneController',
    'rightpaneController',
    'fileUploaderController',
    'tokenInterceptor',
    'fileUploaderController',
    'smiDropDownController',
    'smiModalTabController',
    'errorPageController',
    'changeRequestFormController',
    'changeRequestDetailsController',
    'favoritesPopOverController',
    'manageFavoritesController',
    'tinyMCE',
    'uiTinyMCE',
    'sanitize',
    'pdfmake',
    'vfsfonts',
    'uiselect'
	], function() {
	    angular.bootstrap(document, ['app']);
});


