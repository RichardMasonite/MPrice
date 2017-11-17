(function () {
    angular.module('Pricing')
        .controller('FilterModalController', ["filterData", function (filterData) {
            var vm = this;

            vm.filterData = filterData;

            activate();

            function activate() {
            }
        }]);
})();