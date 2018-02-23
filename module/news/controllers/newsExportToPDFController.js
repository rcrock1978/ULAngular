define([
	'app',
	'globalUtility',
    'enums',
    'shell/model/refinerModel',
], function (app, globalUtility, enums, refinerModel) {

    app.register.controller('newsExportToPDFController', ['$scope', '$http', '$rootScope', '$filter', 'baseService', 'dialogService', 'newsService',
	    function ($scope, $http, $rootScope, $filter, baseService, dialogService, newsService) {
	        $scope.modalTitle = "Export Results";
	        $scope.isLoading = false;
	        $scope.news = '';

	        $scope.ExportNewsToPDF = function () {

	            var data = document.getElementById('exportable').innerHTML;

	            var docDefinition = {
	                pageOrientation: 'portrait',
	                pageSize: 'TABLOID',
	                pageMargins: [40, 60, 40, 60],
	                content: {
	                    table: {
	                        body: []
	                    }
	                }
	            };

	            docDefinition.content.table.body = data;

	            var fileName = 'news.pdf';

	            if (isIE()) {
	                downloadPDF(fileName, docDefinition);
	            } else {
	                pdfMake.createPdf(docDefinition).open();
	            }
	        }

	        function isIE() {
	            var match = navigator.userAgent.match(/(?:MSIE |Trident\/.*; rv:)(\d+)/);
	            return match ? parseInt(match[1]) : false;
	        }

	        function downloadPDF(fileName, docDefinition) {
	            var D = document;
	            var a = D.createElement('a');
	            var strMimeType = 'application/octet-stream;charset=utf-8';
	            var rawFile;
	            var ieVersion;

	            ieVersion = isIE();
	            var doc = pdfMake.createPdf(docDefinition);
	            var blob;

	            doc.getBuffer(function (buffer) {
	                blob = new Blob([buffer]);

	                if (ieVersion && ieVersion < 10) {
	                    var frame = D.createElement('iframe');
	                    document.body.appendChild(frame);

	                    frame.contentWindow.document.open("text/html", "replace");
	                    frame.contentWindow.document.write(blob);
	                    frame.contentWindow.document.close();
	                    frame.contentWindow.focus();
	                    frame.contentWindow.document.execCommand('SaveAs', true, fileName);

	                    document.body.removeChild(frame);
	                    return true;
	                }

	                // IE10+
	                if (navigator.msSaveBlob) {
	                    return navigator.msSaveBlob(
                          blob, fileName
                        );
	                }
	            });
	        }

	        $scope.CloseDialog = function () {
	            dialogService.CloseAll("Perform Close");
	        };

	        $scope.$on('$destroy', function () {

	            //var events = ['certificates:loadCertificateDetails'];
	            //baseService.UnSubscribe(events);
	        });
	    }]);
});