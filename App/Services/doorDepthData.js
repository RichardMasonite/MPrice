(function () {
    angular.module("DataServices").factory("DoorDepthData",
        ['$q', '$resource', '$rootScope',
            function ($q, $resource, $rootScope) {
                var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

                return {
                    getDoorDepths: function () {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "allDoorDepths");
                        var data = dataResource.query(function (resp) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    }
                };
            }]
    );
}());