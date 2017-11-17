(function () {
    angular.module("DataServices").factory("DoorHeightData",
        ['$q', '$resource', '$rootScope',
            function ($q, $resource, $rootScope) {
                var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

                return {
                    getDoorHeights: function () {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "allDoorHeights");
                        var data = dataResource.query(function (resp) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    }
                };
            }]
    );
}());
