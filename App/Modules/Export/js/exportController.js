(function () {
    angular.module('Pricing')
        .controller('ExportController', ['ExportData', "TokenStore", "SecuritySimulatorData", function (exportData, tokenStore, securitySimulatorData) {
            var vm = this;

            vm.customerDataHasLoaded = false;

            vm.assignSelected = function (customer) {
                vm.isOpen = false;
                vm.selectedCustomer = customer;
            }

            vm.logoutUser = function () {
                return securitySimulatorData.logoutUser();
            }

            vm.export = function (moduleId) {
                vm.dataTransferring = true;
                return exportData.export(moduleId, vm.selectedCustomer.Id).then(function (data) {
                    // Convert to CSV
                    var csvString = '';
                    for (var i = 0; i < data.length; i++) {
                        var row = data[i];
                        csvString += '"'
                            + row.SmartpartNumber.replace('"', '""') + '",'
                            + row.Price + ',"'
                            + row.StockStatus.replace('"', '""') + '","'
                            + row.ProductType.replace('"', '""') + '"\r\n';
                    }

                    // Download by pushing it into a Blob.
                    var blob = new Blob([csvString]);
                    var downloadLink = angular.element('<a></a>');
                    downloadLink.attr('href', window.URL.createObjectURL(blob));
                    downloadLink.attr('download', 'MaxExport.csv');
                    downloadLink[0].click();

                    vm.dataTransferring = false ;
                });
            }
        }]);
})()