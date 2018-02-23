
define([
    'app'
], function (app) {

    app.factory('exportService', ['$http', '$window', '$timeout', 'baseService',
    function ($http, $window, $timeout, baseService) {

        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>{table}</body></html>',
            base64 = function (s) { return $window.btoa(unescape(encodeURIComponent(s))); },
            format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) };
        
        var svc = {

            ExportJSONToExcel: function (table, worksheetName) {
                var content = "<table border='2px'><thead><tr bgcolor='#87AFC6'>"
               
                angular.forEach(table.Headers, function (item) {
                    content += "<th>" + item + "</th>"
                });
                content += "</tr></thead><tbody>";

                angular.forEach(table.Rows, function (item) {
                    content += "<tr>"
                    angular.forEach(item.Items, function (tdVal) {
                        content += "<td>" + tdVal + "</td>";
                    });
                    content += "</tr>"
                });
                content += "</tbody></table>";

              
                var exportFrame = document.getElementById('exportFrame');
                var ua = window.navigator.userAgent;
                var msie = ua.indexOf("MSIE ");
                if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
                {
                    var txtArea1 = document.getElementById('exportFrame');
                    txtArea1.contentWindow.document.open("txt/html", "replace");
                    txtArea1.contentWindow.document.write(content);
                    txtArea1.contentWindow.document.close();
                    txtArea1.contentWindow.focus();
                    var sa = txtArea1.contentWindow.document.execCommand("SaveAs", true, "Certificates.xls");
                } else {

                    var ctx = { worksheet: worksheetName, table: content };
                    var href = uri + base64(format(template, ctx));
                    $timeout(function () {
                        $window.open(href, '_blank');
                    }, 100); // trigger download
                }
                
            },

            ExportTableToExcel: function (tableName,fileName) {
                var tab_text="<table border='2px'><tr bgcolor='#87AFC6'>";
                var textRange; var j=0;
                tab = document.getElementById(tableName);


                for (j = 0 ; j < tab.rows.length ; j++)
                {     
                    tab_text=tab_text+tab.rows[j].innerHTML+"</tr>";
                }

                tab_text=tab_text+"</table>";
                //tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
                tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
                tab_text= tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

                var ua = window.navigator.userAgent;
                var msie = ua.indexOf("MSIE "); 
               
                if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
                {
                    var txtArea1 = document.getElementById('exportFrame');
                    txtArea1.contentWindow.document.open("txt/html", "replace");
                    txtArea1.contentWindow.document.write(tab_text);
                    txtArea1.contentWindow.document.close();
                    txtArea1.contentWindow.focus();
                    sa = txtArea1.contentWindow.document.execCommand("SaveAs", true, fileName + ".xls");
                }  
                else                 //other browser not tested on IE 11
                    sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));  


                return (sa);
            
            },

            //data format: [[header 1, header 2], [row1col1, row1col2], [row2col1,row2,col2]]
            ExportArrayToExcel: function (data, fileName) {
                var Workbook = function () {
                    this.SheetNames = [];
                    this.Sheets = {};
                }

                var createSheet = function (data) {
                    var ws = {};
                    var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
                    for (var R = 0; R != data.length; ++R) {
                        for (var C = 0; C != data[R].length; ++C) {
                            if (range.s.r > R) range.s.r = R;
                            if (range.s.c > C) range.s.c = C;
                            if (range.e.r < R) range.e.r = R;
                            if (range.e.c < C) range.e.c = C;
                            var cell = { v: data[R][C] };
                            if (cell.v == null) continue;
                            var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

                            if (typeof cell.v === 'number') cell.t = 'n';
                            else if (typeof cell.v === 'boolean') cell.t = 'b';
                            else if (cell.v instanceof Date) {
                                cell.t = 'n';
                                cell.z = XLSX.SSF._table[14];
                                cell.v = this.dateNum(cell.v);
                            }
                            else cell.t = 's';

                            ws[cell_ref] = cell;
                        }
                    }
                    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                    return ws;
                }

                var string2ArrayBuffer = function (s) {
                    var buf = new ArrayBuffer(s.length);
                    var view = new Uint8Array(buf);
                    for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                    return buf;
                }

                var mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                var name = fileName;
                var extension = '.xlsx';

                var wb = new Workbook(),
                            ws = createSheet(data);

                wb.SheetNames.push(name);
                wb.Sheets[name] = ws;
                var wopts = { bookType: extension.substr(1, 3) + (extension.substr(4) || 'm'), bookSST: false, type: 'binary' },
                    wbout = XLSX.write(wb, wopts);

                data = string2ArrayBuffer(wbout);

                //saveAs
                saveAs(new Blob([data],
                        { type: mime + ";" + this.charset }),
                        name + extension);
            }
            
        };

        return svc;

       }]);

});

