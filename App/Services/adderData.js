(function() {
    angular.module("DataServices").factory("adderData",
        [
            '$q', '$resource', '$rootScope',
            function($q, $resource, $rootScope) {
                var dataUrlRoot = $rootScope.webConfig.dataUrlRoot;

                return {
                    getAllProductAddersForCustomer: function(customerId) {
                        var deferred = $q.defer();                      
                        var dataResource = $resource(dataUrlRoot + "distributors/:distributorID/addercosts");
                        var data = dataResource.query({ distributorID: customerId },
                            function(resp) {
                                deferred.resolve(data);
                            });
                        return deferred.promise;
                    },

                    updateAddersForCustomer: function(customerId, productAdders) {
                        var deferred = $q.defer();
                        var dataResource = $resource(dataUrlRoot + "distributors/:distributorID/addercosts");
                        var data = dataResource.save({ distributorID: customerId },
                            productAdders,
                            function(resp) {
                                deferred.resolve(data);
                            });
                        return deferred.promise;
                    }
                };

            }
        ]
    );
}());
