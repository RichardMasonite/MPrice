(function () {
    angular.module("DataServices").factory("FrameCostData", [
        '$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                getDoorSubAndSideLite: function (distributorId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/componentcosts");
                    var data = dataResource.get({ distributorId: distributorId },
                        function(resp) {
                            deferred.resolve(data);
                        });
                    return deferred.promise;
                },
                save: function (distributorId, distCompCosts) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/componentcosts");
                    var data = dataResource.save({distributorId: distributorId}, distCompCosts, function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                }
            };
        }
    ]);
}());