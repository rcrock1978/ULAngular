(function () {

    window.kernel = window.kernel || {};

    var
        _subscribers = [],

        _channel = function (wnd) {

            if (window.addEventListener) {
                window.addEventListener("message", _handle, false);
            } else {
                window.attachEvent("onmessage", _handle);
            }

            var send = function (message) {
                if (wnd.postMessage) {
                    wnd.postMessage(message, '*');
                }
            };

            var register = function (subscriber) {
                for (var i = 0; i < _subscribers.length; i++) {
                    if (_subscribers[i].name === subscriber.name && _subscribers[i].message == subscriber.message) {
                        _subscribers.splice(i, 1);
                    }
                }

                _subscribers.push(subscriber);
            };

            return {
                send: send,
                register: register
            }
        },
        _subscriber = function (name, message, handler) {
            return {
                name: name,
                message: message,
                handler: handler
            }
        },
        _handle = function (event) {
            for (var i = 0; i < _subscribers.length; i++) {
                if (_subscribers[i].message === event.data.message) {
                    _subscribers[i].handler(event.data);
                }
            }
        };


    window.kernel.messaging = {
        channel: _channel,
        subscriber: _subscriber
    };

}());