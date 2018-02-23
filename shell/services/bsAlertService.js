
define([
    'app'
], function (app) {

    app.factory('bsAlertService', ['$http', 'baseService',
    function ($http, baseService) {
        var svc = {

            Show: function (message,type,isMultiple) {
                var data = {
                    Message: message,
                    Type: type,
                    IsMultiple: isMultiple ? isMultiple : false
                };

                baseService.Publish('shell:alert',data);

            }
        };

        return svc;

    }]);

});

