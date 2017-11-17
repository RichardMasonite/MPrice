(function () {
    angular.module("DataServices").factory("DistributorData", [
        '$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                getDistributors: function () {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors");
                    var data = dataResource.query(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                getDistributor: function (distributorId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId");
                    var data = dataResource.get({ distributorId: distributorId }, function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                }
            };
        }
    ]);
}());
