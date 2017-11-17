(function () {
    angular.module("Pricing")
        .controller('portalController', ["SecuritySimulatorData", "TokenStore","$window",
            function (securitySimulatorData, tokenStore, $window) {
                var vm = this;

                vm.emailTo = 'max@masonite.com';
                vm.subject = 'MPrice Support Request';

                vm.isMasoniteDist = tokenStore.isMasoniteDist();

                vm.simulateExpiredABT = function () {
                    return securitySimulatorData.simulateExpiredABT();
                }

                vm.simulateExpiredUserToken = function () {
                    return securitySimulatorData.simulateExpiredUserToken();
                }

                vm.logoutUser = function () {
                    return securitySimulatorData.logoutUser();
                }

                vm.sendEmail = function() {
                    $window.open("mailto:" + vm.emailTo + "?subject=" + vm.subject, "_self");
                }

            }
        ]);
})();