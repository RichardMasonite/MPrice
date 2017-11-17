(function () {
    angular.module("DataServices").factory("EntryDoorMarginData", [
        '$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                get: function (distributorId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/entrymargins");
                    var data = dataResource.query({ distributorId: distributorId }, function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                save: function (distributorId, entryDoorMargins) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/entrymargins");
                    var data = dataResource.save(
                        { distributorId: distributorId },
                        entryDoorMargins,
                        function (resp) {
                            deferred.resolve(data);
                        });
                    return deferred.promise;
                }
            };
        }]
    );
}());
