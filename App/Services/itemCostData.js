(function () {
    angular.module("DataServices").factory("ItemCostData",
        ['$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;
            
            return {
                getItemCosts: function (itemType, distributorId, productTypeId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/:itemType");
                    var data = dataResource.query({ itemType: itemType, distributorId: distributorId }, function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },

                saveItemCosts: function (itemType, distributorId, newItems, changedItems, deletedItems) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/:itemType", { itemType: itemType, distributorId: distributorId });
                    var data = dataResource.save(
                        { NewItems: newItems, ChangedItems: changedItems, DeletedItems: deletedItems },
                        function (resp) {
                            deferred.resolve(data);
                        });

                    return deferred.promise;
                }
            };
        }]
    );
}());
