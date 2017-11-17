(function () {
    angular.module("DataServices").factory("InteriorDoorMarginData",
        ['$q', '$resource', '$rootScope',
            function ($q, $resource, $rootScope) {
                var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

                return {
                    getMargins: function (customerId) {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "allInteriorMargins"/*/:customerId"*/);
                        var data = dataResource.query(/*{ customerId: customerId }, */function (resp) {
                            deferred.resolve(data);
                        });
                        return deferred.promise;
                    },
                    saveMargin: function (/*customerId, */interiorDoorMargins) {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "interiordoormargin/list"/*/:customerId"*/);
                        var data = dataResource.save(
                            //{ customerId: customerId },
                            interiorDoorMargins,
                            function (resp) {
                                deferred.resolve(data);
                            });
                        return deferred.promise;
                    }
                };
            }]
    );
}());
