(function () {
    angular.module('Pricing')
        .directive('topMenu', ["$stateParams", "SecuritySimulatorData", "TokenStore", "DistributorData", 
            function ($stateParams, securitySimulatorData, tokenStore, distributorData) {
                return {
                    templateUrl: "App/Directives/Templates/topMenu.html",
                    link: function (scope) {
                        scope.isMasoniteDist = tokenStore.isMasoniteDist();
                        scope.distributorId = tokenStore.getDistributorId();

                        if (!scope.isMasoniteDist) {
                            getDistributor(scope.distributorId);
                        }

                        function getDistributor(distributorId) {
                            return distributorData.getDistributor(distributorId)
                                .then(function (data) {
                                    scope.distributor = data;
                               });
                        }

                        if ($stateParams.customerId) {
                            scope.stateSuffix = "";
                            scope.parameters = { customerId: $stateParams.customerId };
                        }
                        else {
                            scope.stateSuffix = "NoParam";
                            scope.parameters = {};
                        }
                        scope.logoutUser = function() { return securitySimulatorData.logoutUser(); }
                    }
                }
            }
        ])
        .directive('costImportButtons', function () {
            return {
                templateUrl: "App/Directives/Templates/costImportButtons.html"
            }
        })
        .directive('itemsPerPageSelector', function () {
            return {
                templateUrl: "App/Directives/Templates/itemsPerPageSelector.html"
            }
        })
        .directive('itemCodeSearch', function () {
            return {
                template: '<search-box model="vm.filter.item.Code" on-change="vm.updateView()"></search-box>'
            }
        })
        .directive('searchBox', [
            "$timeout",
            function ($timeout) {
                return {
                    templateUrl: "App/Directives/Templates/searchBox.html",
                    scope: {
                        model: '=',
                        onChange: '&'
                    },
                    link: function (scope) {
                        scope.directiveChange = function () {
                            scope.model = scope.directiveModel;
                            $timeout(scope.onChange, 0);
                        }
                    }
                }
            }
        ])
        .directive('editCancelSaveButtons', function () {
            return {
                templateUrl: "App/Directives/Templates/editCancelSaveButtons.html"
            }
        })
        .directive('filterOptionButtons', function() {
            return{
                templateUrl: "App/Directives/Templates/modalFilterOptions.html"
            }
        })

        .directive('customerSelector', [
            'DistributorData', '$stateParams', '$timeout', '$state', "TokenStore",
            function (distributorData, $stateParams, $timeout, $state, tokenStore) {
                return {
                    templateUrl: "App/Directives/Templates/customerSelector.html",
                    link: function (scope, element) {
                        scope.onToggle = function (open) {
                            element[0].getElementsByClassName('customerInput')[0].focus();
                        }

                        getDistributors();

                        function getDistributors() {
                            return distributorData.getDistributors()
                                .then(function (data) {
                                    scope.customerArray = data;

                                    if (tokenStore.isMasoniteDist()) {
                                        for (var i = 0; i < scope.customerArray.length; i++) {
                                            if (scope.customerArray[i].Id == $stateParams.customerId) {
                                                scope.vm.selectedCustomer = scope.customerArray[i];
                                                break;
                                            }
                                        }
                                    }

                                    if (!tokenStore.isMasoniteDist()) {
                                        var currDist = tokenStore.getDistributorId(); // get distributor id
                                        for (var j = 0; j < scope.customerArray.length; j++) {
                                            var curid = scope.customerArray[j].Id;
                                            if (currDist && curid.toLowerCase() == currDist.toLowerCase()) {
                                                scope.vm.selectedCustomer = scope.customerArray[j];
                                                scope.vm.isMasoniteDistSelection();
                                                break;
                                            }
                                        }
                                    }

                                    scope.vm.customerDataHasLoaded = true;
                                });
                        }
                    }
                }
            }
        ])
        .directive('distributorSelector', [
            'DistributorData', '$stateParams', '$timeout', '$state', "TokenStore",
            function (distributorData, $stateParams, $timeout, $state, tokenStore) {
                return {
                    templateUrl: "App/Directives/Templates/distributorSelector.html",
                    link: function (scope, element) {
                        scope.onToggle = function (open) {
                            element[0].getElementsByClassName('customerInput')[0].focus();
                        }

                        scope.customerDataHasLoaded = false;

                        scope.isMasoniteDist = tokenStore.isMasoniteDist();

                        scope.assignSelected = function (customer) {
                            scope.isOpen = false;
                            var saveCustomer = scope.selectedCustomer;
                            scope.selectedCustomer = customer;
                            $state.go($state.current.name.replace('NoParam', ''), { customerId: scope.selectedCustomer.Id }, { reload: true }).catch(function () {
                                scope.selectedCustomer = saveCustomer;
                            });
                        };

                        // select for isMasonite
                        isMasoniteDistSelection = function () {
                            $state.go($state.current.name.replace('NoParam', ''), { customerId: scope.selectedCustomer.Id });
                        };

                        getDistributors();

                        function getDistributors() {
                            return distributorData.getDistributors()
                                .then(function (data) {
                                    scope.customerArray = data;

                                    if (tokenStore.isMasoniteDist()) {
                                        for (var i = 0; i < scope.customerArray.length; i++) {
                                            if (scope.customerArray[i].Id == $stateParams.customerId) {
                                                scope.selectedCustomer = scope.customerArray[i];
                                                break;
                                            }
                                        }
                                    }

                                    if (!tokenStore.isMasoniteDist()) {
                                        var currDist = tokenStore.getDistributorId(); // get distributor id
                                        for (var j = 0; j < scope.customerArray.length; j++) {
                                            var curid = scope.customerArray[j].Id;
                                            if (currDist && curid.toLowerCase() == currDist.toLowerCase()) {
                                                scope.selectedCustomer = scope.customerArray[j];
                                                isMasoniteDistSelection();
                                                break;
                                            }
                                        }
                                    }

                                    scope.customerDataHasLoaded = true;
                                });
                        }
                    }
                }
            }
        ])
        // Shamelessly stolen from https://stackoverflow.com/questions/17063000/ng-model-for-input-type-file
        .directive("textFileContents", function () {
            return {
                scope: {
                    textFileContents: "="
                },
                link: function (scope, element, attributes) {
                    element.bind("change", function (changeEvent) {
                        var reader = new FileReader();
                        reader.onload = function (loadEvent) {
                            scope.$apply(function () {
                                scope.textFileContents = {
                                    name: changeEvent.target.files[0].name,
                                    contents: loadEvent.target.result
                                };
                            });
                        }
                        reader.readAsText(changeEvent.target.files[0]);
                    });
                }
            }
        });
}());