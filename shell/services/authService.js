
define([], function () {


    var authService = {

        User: {
            Username: '',
            Token: '',
            Apps: []
        },

        IsAuthenticated: false

    }

    return authService;

});


