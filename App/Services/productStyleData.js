(function () {
    angular.module("DataServices").factory("ProductStyleData",
        ['$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                getSlabFamilies: function () {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "slabsubfamilies");
                    var data = dataResource.query(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                getSlabHeights: function () {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "slabheights");
                    var data = dataResource.query(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                getProductStyles: function (distributorId, slabSubfamilyId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/doorstyles/:slabSubfamilyId");
                    var data = dataResource.query({ distributorId: distributorId, slabSubfamilyId: slabSubfamilyId }, function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                },
                save: function (distributorId, distCompStyles) {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "distributors/:distributorId/doorstyles");
                    var data = dataResource.save(
                        { distributorId: distributorId },
                        distCompStyles,
                        function (resp) {
                            deferred.resolve(data);
                        });
                    return deferred.promise;
                }
            };
        }]
    );
}());
