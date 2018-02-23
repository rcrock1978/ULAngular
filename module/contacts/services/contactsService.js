'use strict';

define([
    'app',
    'globalUtility'
], function (app, globalUtility) {

    app.register.factory('contactsService', ['$timeout', 'crudService',
        function ($timeout, crudService) {
            var apiUrl = "api/contacts/";
            var svc = {
                deleteContact: deleteContact,
                filterContacts: filterContacts,
                getAll: getAll,
                getAllLookup: getAllLookup,
                getCompanyDetails: getCompanyDetails,
                getContact: getContact,
                getContactTypes: getContactTypes,
                saveContact: saveContact,               
                searchCompany: searchCompany,
                saveCompany: saveCompany,
                getAllContactsByCompanyItemId: getAllContactsByCompanyItemId
            };

            return svc;

            ////////////

            function deleteContact(data, callback) {
                crudService.POST(apiUrl + "DeleteContact/", data, callback);
            };

            function filterContacts (para, callback) {
                crudService.GET(apiUrl + "FilterContacts/", param, callback);
            };

            function getAllContactsByCompanyItemId(param, callback) {
                crudService.GET(apiUrl + "GetAllContactsByCompanyItemId/", param, callback);
            };

            function getAll(data, callback) {
                crudService.POST(apiUrl + "GetAllContacts/", data, callback);
            };

            function getAllLookup(data, callback) {
                crudService.POST(apiUrl + "GetAllLookup/", data, callback);
            };

            function getCompanyDetails (param, callback) {
                crudService.GET(apiUrl + "GetCompanyDetails/", param, callback);
            };

            function getContact(data, callback) {
                crudService.POST(apiUrl + "GetContact/", data, callback);
            };

            function getContactTypes(param, callback) {
                crudService.GET(apiUrl + "GetContactTypes/", param, callback);
            };

            function saveContact(data, callback) {
                crudService.POST(apiUrl + "SaveContact/", data, callback);
            };

            function saveCompany(data, callback) {
                crudService.POST(apiUrl + "SaveCompany/", data, callback);
            };

            function searchCompany(param, callback) {
                crudService.GET(apiUrl + "SearchCompany/", param, callback);
            };
        }]);
});
