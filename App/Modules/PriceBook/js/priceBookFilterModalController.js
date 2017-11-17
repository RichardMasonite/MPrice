(function () {
    angular.module('Pricing')
        .controller('PriceBookFilterModalController', ["filterData", function (filterData) {
            var vm = this;

            vm.filterData = filterData;

            activate();

            function activate() {
            }
        }]);
})();