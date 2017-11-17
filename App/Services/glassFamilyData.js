(function () {
    angular.module("DataServices").factory("GlassFamilyData",
        ['$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                get: function (itemType, customerId, productTypeId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "glassfamily");
                    var data = dataResource.query(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                }
            };
        }]
    );
}());
