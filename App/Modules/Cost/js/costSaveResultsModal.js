$(function () {
    angular.module('Pricing')
        .controller("CostSaveResultsModalController", [
            "invalidItems", "duplicateItems", "header", "ItemCostControllerShared", "$uibModalInstance",
            function (invalidItems, duplicateItems, header, shared, $uibModalInstance) {
                var vm = this;

                activate();

                function activate() {
                    vm.invalidItems = invalidItems;
                    vm.duplicateItems = duplicateItems;
                    vm.header = header;
                }
            }]
        );
}());