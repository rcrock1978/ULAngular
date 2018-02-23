define([
    'app',
    'globalUtility',
    'enums',
], function (app, globalUtility, enums) {

    app.factory('tokenInterceptor', ['$q', '$location', '$localStorage', '$timeout',
        function ($q, $location, $localStorage, $timeout) {
            var itcp = {
                request: function (config) {
                   // IsBusy(true);
                    if (window.localStorage.wresult) {
                        config.headers["wresult"] = window.localStorage.wresult;
                        //disable IE ajax request caching
                        //$httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
                        // extra
                        config.headers['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
                        config.headers['Cache-Control'] = 'no-cache';
                        config.headers['Pragma'] = 'no-cache';
                    }
                    return config;
                },
                response: function (response) {
                  //  IsBusy(false);
                    globalUtility.IsAuthorized == response.data === "Invalid or Expired Access Token" ? false : true;
                    if (!globalUtility.IsAuthorized) {
                        $location.path('/unauthorized');
                    }
                   //if (response.data === "Invalid or Expired Access Token") {
                   //    $location.path('/unauthorized');
                   //    globalUtility.IsAuthorized = false;
                   //} else {
                   //    globalUtility.IsAuthorized = true;
                   //}
                    return response;
                },
                responseError: function (rejection) {
                    globalUtility.IsAuthorized = false;
                    $location.path('/unauthorized');
                    return $q.reject(rejection);
                }
            };
            return itcp;

        }]);

});