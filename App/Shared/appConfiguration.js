(function() {
    angular.module("Pricing")
        .config(["$locationProvider", "$httpProvider","$stateProvider", "$urlRouterProvider", "$provide",
            function ($locationProvider, $httpProvider, $stateProvider,
                $urlRouterProvider, $provide) {
                $urlRouterProvider.otherwise('/portal');
                $stateProvider
                    .state('portal', {
                        templateUrl: '/App/Modules/Portal/Template/portal.html',
                        controller: 'portalController',
                        controllerAs: 'vm',
                        url: "/portal"
                    })

                    .state('pricingroot', {
                        redirectTo: 'costNoParam',
                        templateUrl: '/App/Modules/Layout/Template/pricingRoot.html'
                    })
                    .state('costNoParam', {
                        parent: 'pricingroot',
                        templateUrl: '/App/Modules/Cost/Template/cost.html',
                        controller: 'costController',
                        controllerAs: 'vm',
                        url: "/cost"
                    })
                    .state('cost', {
                        parent: 'costNoParam',
                        redirectTo: 'cost.slabCost',
                        url: "/:customerId"
                    })
                    .state('cost.slabCost', {                     
                        templateUrl: '/App/Modules/Cost/Template/SlabCost.html',
                        controller: 'SlabCostController',
                        controllerAs: 'vm',
                        url: "/slabCost"
                    })
                    .state('cost.glassCost', {
                        templateUrl: '/App/Modules/Cost/Template/GlassCost.html',
                        controller: 'GlassCostController',
                        controllerAs: 'vm',
                        url: "/glassCost"
                    })
                    .state('cost.glazedCost', {
                        templateUrl: '/App/Modules/Cost/Template/GlazedCost.html',
                        controller: 'GlazedCostController',
                        controllerAs: 'vm',
                        url: "/glazedCost"
                    })               
                    .state('cost.componentCost', {
                        templateUrl: '/App/Modules/Cost/Template/ComponentCost.html',
                        controller: 'ComponentCostController',
                        controllerAs: 'vm',
                        url: "/componentCost"
                    })               
                    .state('cost.frame', {
                        templateUrl: '/App/Modules/Cost/Template/FrameCost.html',
                        controller: 'FrameCostController',
                        controllerAs: 'vm',
                        url: "/frame"
                    })
                    .state('cost.adders', {
                        templateUrl: '/App/Modules/Cost/Template/adders.html',
                        controller: 'addersController',
                        controllerAs: 'vm',
                        url: "/adders"
                    })

                    .state('marginNoParam', {
                        parent: 'pricingroot',
                        templateUrl: '/App/Modules/Margin/Template/margin.html',
                        controller: 'marginController',
                        controllerAs: 'vm',
                        url: "/margin"
                    })
                    .state('margin', {
                        parent: 'marginNoParam',
                        redirectTo: 'margin.marginEntry',
                        url: "/:customerId"
                    })
                    .state('margin.marginEntry', {
                        templateUrl: '/App/Modules/Margin/Template/marginEntry.html',
                        controller: 'marginEntryController',
                        controllerAs: 'vm',
                        url: "/entry"
                    })
                    //.state('margin.marginInterior', {
                    //    templateUrl: '/App/Modules/Margin/Template/marginInterior.html',
                    //    controller: 'marginInteriorController',
                    //    controllerAs: 'vm',
                    //    url: "/interior"
                    //})

                    //  product URLs


                    .state('productNoParam', {
                        parent: 'pricingroot',
                        templateUrl: '/App/Modules/Product/Template/product.html',
                        controller: 'productController',
                        controllerAs: 'vm',
                        url: "/product"
                    })
                    .state('product', {
                        parent: 'productNoParam',
                        redirectTo: 'product.slabStock',
                        url: "/:customerId"
                    })

                    .state('product.slabStock', {
                        templateUrl: '/App/Modules/Product/Template/productSlabStock.html',
                        controller: 'productSlabStockController',
                        controllerAs: 'vm',
                        url: "/productSlabStock"
                    })
                    .state('product.glassStock', {
                        templateUrl: '/App/Modules/Product/Template/productGlassStock.html',
                        controller: 'productGlassStockController',
                        controllerAs: 'vm',
                        url: "/productGlassStock"
                    })
                    .state('product.productStyles', {
                        templateUrl: '/App/Modules/Product/Template/productStyles.html',
                        controller: 'ProductStylesController',
                        controllerAs: 'vm',
                        url: "/productStyles"
                    })

                    .state('priceBookNoParam', {
                        parent: 'pricingroot',
                        templateUrl: '/App/Modules/PriceBook/Template/priceBook.html',
                        controller: 'PriceBookController',
                        controllerAs: 'vm',
                        url: "/priceBook"
                    })
                    .state('priceBook', {
                        parent: 'priceBookNoParam',
                        redirectTo: 'priceBook.priceBookEntry',
                        url: "/:customerId"
                    })
                    .state('priceBook.priceBookEntry', {
                        templateUrl: '/App/Modules/PriceBook/Template/priceBookEntry.html',
                        controller: 'PriceBookEntryController',
                        controllerAs: 'vm',
                        url: "/entry"
                    })

                    .state('export', {
                        templateUrl: '/App/Modules/Export/Template/export.html',
                        controller: 'ExportController',
                        controllerAs: 'vm',
                        url: "/export"
                    });
                //$locationProvider.html5Mode(true);
                $httpProvider.interceptors.push('DataInterceptor');
                $httpProvider.interceptors.push('oAuthInterceptor');
                $httpProvider.defaults.transformResponse.push(function (responseData) {
                    convertDateStringsToDates(responseData);
                    return responseData;
                });

                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

                // Initialize get if not there
                if (!$httpProvider.defaults.headers.get) {
                    $httpProvider.defaults.headers.get = {};
                }

                // Disable IE ajax request caching
                $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

                return $provide.decorator("$http", ["$delegate", function ($delegate) {
                    var get = $delegate.get;
                    $delegate.get = function (url, config) {
                        url = url.toLowerCase();
                        if (url.indexOf('app/') >= 0) {
                            if (!url.startsWith('/')) {
                                url = '/' + url;
                            }
                            url = "client/" + moduleversion + url;
                        }
                        return get(url, config);
                    };
                    return $delegate;
                }]);
            }
        ])
    .factory("DataInterceptor", ['$q', 'NotificationFactory',  function ($q, notificationFactory /*, messages*/) {

        var myInterceptor = {

            response: function (res) {
                if (res.data instanceof Object) {
                    var data = res.data;
                    var keys = Object.keys(data);
                    if (keys.indexOf("ResponseMessage") != -1 && keys.indexOf("IsSuccess") != -1 && keys.indexOf("Errors") != -1) {
                        if (!data.IsSuccess) {
                            for (err in data.Errors) {
                            notificationFactory.notify(1, data.Errors[err].ErrorMessage);
                            }
                        }
                        res.data = data.ResponseMessage;
                    }
                }
                return res;
            },           
            responseError: function (res) {
                if (res.status == 0) {
                    var msg = "Connection issue: Please check your internet connection and try again.";
                    notificationFactory.notify(1, msg);
                } else {
                    var msg = "An unexpected error occured.";
                    notificationFactory.notify(1, msg);

                }
                return $q.reject(res);
            }

        };

        return myInterceptor;
        }]);

    var regexIso8601 = /^(?:[1-9]\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-][01]\d:[0-5]\d)?$/;

    function convertDateStringsToDates(input) {
        // Ignore things that aren't objects.
        if (typeof input !== "object") return input;

        for (var key in input) {
            if (!input.hasOwnProperty(key)) continue;

            var value = input[key];
            var match;
            // Check for string properties which look like dates.
            if (typeof value === "string" && (match = value.match(regexIso8601))) {
                var milliseconds = Date.parse(match[0]);
                if (!isNaN(milliseconds)) {
                    var d = new Date(milliseconds);
                    input[key] = d;
                }
            } else if (typeof value === "object") {
                // Recurse into object
                convertDateStringsToDates(value);
            }
        }
    }
}());