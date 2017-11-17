(function () {
    angular.module("DataServices").factory("SlabFamilyStyleHeightData", [
        '$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

            return {
                get: function () {
                    var deferred = $q.defer();
                    var dataResource = $resource(dataUrlRoot + "slabfamilystyleheight");
                    var data = dataResource.query(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                }
            };
        }]
    );
}());
