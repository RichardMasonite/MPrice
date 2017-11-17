
(function () {
    angular.module('Pricing')
        .controller("productController", [
            "$state", "TokenStore",
            function ($state, tokenStore) {
                var vm = this;

                vm.isMasoniteDist = tokenStore.isMasoniteDist();

                vm.customerId = '';
                vm.customerDataHasLoaded = false;

                vm.productChildTabs = function () {
                    vm.go = function (state) {
                        vm.go(state);
                    };
                    vm.productTabData = [
                        {
                            heading: 'Slab Stock',
                            route: 'product.slabStock'
                        },
                        {
                            heading: 'Glass Stock',
                            route: 'product.glassStock'
                        },
                        {
                            heading: 'Product Styles',
                            route: 'product.productStyles'
                        }
                    ]
                };

                activate();

                function activate() {
                    vm.productChildTabs();
                }

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
                    vm.isOpen = false;
                    $state.go($state.current.name.replace('NoParam', ''), { customerId: vm.selectedCustomer.Id });
                };

            }]
        );
}());
