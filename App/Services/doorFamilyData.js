(function () {
    angular.module("DataServices").factory("DoorFamilyData",
        ['$q', '$resource', '$rootScope',
            function ($q, $resource, $rootScope) {
                var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

                return {
                    getAllDoorFamily: function () {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "doorfamily");
                        var data = dataResource.query(function (resp) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    },
                    getDoorFamilyByLocationCode: function (doorLocationCode) {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "doorfamily/:doorLocationCode");
                        var data = dataResource.query({ doorLocationCode: doorLocationCode },function (resp) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    }
                };
            }]
    );
}());