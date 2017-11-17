(function () {
    angular.module("DataServices").factory("ExportData", [
        '$q', '$resource', '$rootScope',
        function ($q, $resource, $rootScope) {
            var exportUrl = $rootScope.webConfig.exportUrl;

            return {
                export: function (moduleId, distributorId) {
                    var deferred = $q.defer();
                    var dataResource = $resource(exportUrl, { moduleId: moduleId, distributorId: distributorId });
                    var data = dataResource.query(function (resp) {
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                }
            };
        }]
    );
}());
