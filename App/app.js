(function() {
    angular.module("DataServices", []);

    var pricingApp = angular.module("Pricing",
        [   "ui.bootstrap", "ui.router", "ui.router.tabs",
            "ngAnimate", "ngSanitize", "DataServices", 
            "ngResource", "mtwidgets", "as.sortable", "OAuth"])
        .controller('MainController', ["ToastrFactory", function (toastrFactory) {
            var vm = this;
            toastrFactory.listen();
            }])
        ;

    pricingApp.run(['$rootScope', '$state', '$stateParams', function ($rootScope,$state, $stateParams) {
        $rootScope.webConfig = webConfig;
        $rootScope.title = $state.current.title;
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }])

    var $injector = angular.injector(['ng', 'OAuth']);
    var tokenRetrieval = $injector.get('TokenRetrieval');

    tokenRetrieval
        .init()
        .then(function (data)
            {
            angular.bootstrap(document, ['Pricing']);
            },
        function (data) {
              angular.bootstrap(document, ['Pricing']);
             });

}());
