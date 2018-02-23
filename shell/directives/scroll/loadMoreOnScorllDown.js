
define(['app'], function (app) {
    app.directive('loadMoreOnScrollDown', ['$timeout', '$parse', function ($timeout, $parse) {
        return {
            scope: {
                param: '=',
                onScroll:'&'
            },
            link : function (scope, element, attrs) {

                var lengthThreshold = attrs.scrollThreshold || 50;
                var timeThreshold = attrs.timeThreshold || 400;
                var  promise = null;
                 var lastRemaining = 9999;

            lengthThreshold = parseInt(lengthThreshold, 10);
            timeThreshold = parseInt(timeThreshold, 10);


            element.bind('scroll', function () {
                var
                    remaining = element[0].scrollHeight - (element[0].clientHeight + element[0].scrollTop);

                //if we have reached the threshold and we scroll down
                if (remaining < lengthThreshold && (remaining - lastRemaining) < 0) {

                    //if there is already a timer running which has no expired yet we have to cancel it and restart the timer
                    if (promise !== null) {
                        $timeout.cancel(promise);
                    }
                    promise = $timeout(function () {
                        var param = scope.param ? scope.param : "";
                        if (param == "") {
                            scope.onScroll();
                        } else {
                            scope.onScroll({ obj: scope.param });
                        }
                       
                       
                        promise = null;
                    }, timeThreshold);
                       
                   
                }
                lastRemaining = remaining;
            });
        }
        }
        }]);
});

