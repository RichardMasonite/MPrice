(function () {
    angular.module("DataServices").factory("SecuritySimulatorData", [
        '$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                simulateExpiredABT: function () {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "simulateExpiredABT");
                    var data = dataResource.get(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                simulateExpiredUserToken: function () {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "simulateExpiredUserToken");
                    var data = dataResource.get(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                logoutUser: function () {
                    document.cookie = 'mod_auth_openidc_session' + '=; expires=Thu, 01-Jan-70 00:00:01 GMT;';
                    return window.location = $rootScope.webConfig.IdServerLogoutUrl;
                }
            };
        }]
    );
}());
