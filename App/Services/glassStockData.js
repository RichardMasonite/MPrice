(function () {
    angular.module("DataServices").factory("GlassStockData",
        ['$q', '$resource', '$rootScope',
            function ($q, $resource, $rootScope) {
                var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

                return {
                    getAllGlassDesign: function (customerId) {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "distributors/:customerId/glassstock");
                        var data = dataResource.query({customerId: customerId},
                            function (resp) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    },

                    saveAllGlassDesign: function (customerId, glassDesignStockItems) {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "distributors/:customerId/glassstock");
                        var data = dataResource.save(
                            { customerId: customerId },
                            glassDesignStockItems,
                            function (resp) {
                                deferred.resolve(data);
                            });
                        return deferred.promise;
                    }
                };
            }]
    );
}());