(function() {
    angular.module("Pricing")
        .controller('addersController', [
            "ItemCostControllerShared", "adderData", "NotificationFactory", "$stateParams", "$filter",
            function (shared, adderData, notification, $stateParams, $filter) {
                var vm = this;
                var filterFilter = $filter('filter');

                vm.updateView = updateView;

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                vm.isDirty = false;

                activate();

                function activate() {
                    vm.isEditMode = false;
                    vm.dataTransferring = true;
                    return adderData.getAllProductAddersForCustomer($stateParams.customerId)
                        .then(function (data) {
                            vm.adders = data;
                            for (var i = 0; i < vm.adders.length; i++) {
                                vm.adders[i].isDirty = false;
                            }
                            vm.updateView();

                            vm.dataTransferring = false;
                            vm.initialLoadComplete = true;
                        });
                }

                vm.edited = function (adder) {
                    for (var i = 0; i < vm.adders.length; i++) {
                        if (vm.adders[i].Id == adder.Id) {
                            vm.adders[i].Price = adder.Price;
                            vm.adders[i].isDirty = true;
                        }
                    }
                    vm.isDirty = true;
                }

                vm.uiCanExit = function (trans) {
                    var result = shared.uiCanExitWhenDirty(trans, vm.isDirty);
                    return result;
                };

                vm.save = function saveProductAddersForCustomer() {
                    vm.dataTransferring = true;
                    changedAdders = [];
                    for (var i = 0; i < vm.adders.length; i++) {
                        if (vm.adders[i].isDirty) {
                            changedAdders.push(vm.adders[i]);
                            vm.adders[i].isDirty = false;
                        }
                    } 
                    return adderData.updateAddersForCustomer($stateParams.customerId, changedAdders)
                        .then(function (data) {
                            vm.dataTransferring = false;
                            notification.saveSuccess();
                            vm.isDirty = false;
                            return activate();
                        });
                };

                function updateView() {
                    vm.adderView = [];

                    var description = filterFilter(vm.adders, vm.filter);
                    for (var descCnt = 0; descCnt < description.length; descCnt++) {
                        var adderType = description[descCnt];
                        var adderTypeCopy = angular.extend({}, adderType, {});
                        vm.adderView.push(adderTypeCopy);
                    }
                };

                vm.cancel = function () {
                   vm.isDirty = false;
                   return activate();
                };
            }
        ]);
})();