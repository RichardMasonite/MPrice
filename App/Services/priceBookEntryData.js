(function () {
    angular.module("DataServices").factory("PriceBookEntryData", [
        '$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                getSetupData: function () {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "familytypes");
                    var data = dataResource.get(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                filterSlabFamilies: function (filterPropertyMap) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "familytypes", null, { 'filter': { method: 'POST', isArray: true } });
                    var data = dataResource.filter(filterPropertyMap, function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                getList: function (distributorId, slabFamilyId, productTypeId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:customerId/masterdata/:slabFamilyId/:productTypeId");
                    var data = dataResource.query({ customerId: distributorId, slabFamilyId: slabFamilyId, productTypeId: productTypeId }, function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                save: function (distributorId, distMasterData) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/masterdata");
                    var data = dataResource.save(
                        { distributorId: distributorId },
                        distMasterData,
                        function (resp) {
                            deferred.resolve(data);
                        });
                    return deferred.promise;
                }
            };
        }]
    );
}());
