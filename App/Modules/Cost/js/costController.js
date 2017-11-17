(function () {
    angular.module('Pricing')
        .controller("costController", [
            "$state", "$stateParams", "TokenStore",
            function ($state, $stateParams, tokenStore) {
                var vm = this;

                vm.isMasoniteDist = tokenStore.isMasoniteDist();

                vm.customerArray = [];
                vm.customerId = '';
                vm.customerDataHasLoaded = false;

                vm.childTabs = function () {
                    vm.go = function (state) {
                        vm.go(state);
                    };
                    vm.tabData = [
                        {
                            heading: 'Slab Cost',
                            route: 'cost.slabCost'
                        },

                        {
                            heading: 'Glass Cost',
                            route: 'cost.glassCost'
                        },
                        {
                            heading: 'Factory Glazed Cost',
                            route: 'cost.glazedCost'
                        },
                        {
                            heading: 'Component Cost',
                            route: 'cost.componentCost'
                        },
                        {
                            heading: 'Frame Cost',
                            route: 'cost.frame'
                        },
                        {
                            heading: 'Adders',
                            route: 'cost.adders'
                        }
                    ];
                };

                vm.customerDataHasLoaded = false;

                activate();

                function activate() {
                    vm.childTabs();
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
                    $state.go($state.current.name.replace('NoParam', ''), { customerId: vm.selectedCustomer.Id });
                };
            }
        ]);
}());
