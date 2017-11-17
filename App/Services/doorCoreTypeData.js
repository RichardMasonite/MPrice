(function () {
    angular.module("DataServices").factory("DoorCoreTypeData",
        ['$q', '$resource', '$rootScope',
            function ($q, $resource, $rootScope) {
                var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

                return {
                    getDoorCoreTypes: function () {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "allDoorCoreTypes");
                        var data = dataResource.query(function (resp) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    }
                };
            }]
    );
}());