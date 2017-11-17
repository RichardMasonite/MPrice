(function () {
    angular.module("DataServices").factory("SlabStockData", [
        '$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                get: function (distributorId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/slabstock");
                    var data = dataResource.get({ distributorId: distributorId }, function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                save: function (distributorId, slabStock) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/slabstock");
                    var data = dataResource.save(
                        { distributorId: distributorId },
                        slabStock,
                        function (resp) {
                            deferred.resolve(data);
                        });
                    return deferred.promise;
                }
            };
        }]
    );
}());
