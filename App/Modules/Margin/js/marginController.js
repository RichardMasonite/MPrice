(function () {
    angular.module('Pricing')
        .controller('marginController', [
            "$state", "TokenStore",
            function ($state, tokenStore) {
                var vm = this;
                vm.isMasoniteDist = tokenStore.isMasoniteDist();

                vm.customerId = '';
                vm.customerDataHasLoaded = false;

                vm.assignSelected = function (customer) {
                    vm.isOpen = false;
                    var saveCustomer = vm.selectedCustomer;
                    vm.selectedCustomer = customer;
                    $state.go($state.current.name.replace('NoParam', ''), { customerId: vm.selectedCustomer.Id }, { reload: true }).catch(function () {
                        vm.selectedCustomer = saveCustomer;
                    });
                }
               
                // select for isMasonite
                vm.isMasoniteDistSelection = function () {
                    $state.go($state.current.name.replace('NoParam', ''), { customerId: vm.selectedCustomer.Id });
                };
            }
        ]);
})()