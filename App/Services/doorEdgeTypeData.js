(function () {
    angular.module("DataServices").factory("DoorEdgeTypeData",
        ['$q', '$resource', '$rootScope',
            function ($q, $resource, $rootScope) {
                var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

                return {
                    getDoorEdgeTypes: function () {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "allDoorEdges");
                        var data = dataResource.query(function (resp) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    }
                };
            }]
    );
}());