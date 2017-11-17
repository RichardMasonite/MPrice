angular.module('Pricing')
    .factory("NavigationFactory", ["$location", function ($location) {
    var navigation = [];
    var current = 0;
    var lastPage = {};

    return {
        getNavigation: function () {
            return navigation;
        },

        addLocation: function (name, path, visible) {
            var menu = { "Name": name, "Path": path, "Visible": visible };
            navigation.push(menu);
        },

        clearLocations: function () {
            navigation.length = 0;
        },

        setCurrent: function (name) {
            for (var item in navigation) {
                if (navigation[item].Name == name) {
                    current = item;
                }
            }

            $location.path(navigation[current].Path);
        },

        setCurrentByPath: function (path) {
            for (var item in navigation) {
                if (path.startsWith(navigation[item].Path)) {
                    current = item;
                }
            }
        },

        getCurrent: function () {
            return navigation[current];
        },

        getLastPage: function (module) {
            return lastPage[module];
        },

        setLastPage: function (module, val) {
            lastPage[module] = val;
        }
    };
}]);

angular.module("Pricing")
    .factory("NotificationFactory",["$rootScope",
    function ($rootScope) {
    var notify = {
        notify: function (type, text) {
            var message = {
                MessageType: type,
                Message: text
            };
            $rootScope.$emit('notifying-service-event', message);
        },
        subscribe: function (scope, callback) {
            var handler = $rootScope.$on('notifying-service-event', callback);
            scope.$on('$destroy', handler);
        },
        saveSuccess: function () {
            notify.notify(2, 'Data has been saved successfully!');
        },
        error: function (errorMessage) {
            notify.notify(1, errorMessage);
        }
    };

    return notify;

}]);

angular.module('Pricing')
    .factory('ToastrFactory', ['NotificationFactory', '$rootScope',
    function (NotificationFactory, $rootScope) {
    return {
        listen: function () {
            toastr.options = {
                "closeButton": false,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-full-width"
             //   "positionClass": "toast-bottom-full-width",
             //   "positionClass": "toast-top-right",
             //   "positionClass": "toast-bottom-right",
             //   "positionClass": "toast-top-left",
             //   "positionClass": "toast-bottom-left",
             //   "positionClass": "toast-top-center",
             //   "positionClass": "toast-bottom-center",
                //"preventDuplicates": false,
                //"onclick": null,
                //"showDuration": "300",
                //"hideDuration": "1000",
                //"timeOut": "5000",
                //"extendedTimeOut": "1000",
                //"showEasing": "swing",
                //"hideEasing": "linear",
                //"showMethod": "fadeIn",
                //"hideMethod": "fadeOut"
            }

            function showMessage(event, message) {
                switch (message.MessageType) {
                    case 1:
                        toastr.options.timeOut = 9999999;
                        toastr.options.showDuration = '999';
                        toastr.options.closeButton = true;
                        toastr.options.dismissOnPageChange = false;
                        toastr["error"](message.Message);

                        break;
                    case 2:
                        toastr.options.timeOut = 2000;
                        toastr.options.showDuration = '999';
                        toastr.options.closeButton = false;
                        toastr.options.dismissOnPageChange = true;
                        toastr["success"](message.Message);
                        break;
                    default:
                        toastr.options.timeOut = 9999999;
                        toastr.options.showDuration = '0';
                        toastr.options.closeButton = true;
                        toastr.options.dismissOnPageChange = false;
                        toastr["error"](message.Message);

                        break;
                }
            }

            NotificationFactory.subscribe($rootScope, showMessage);
        }
    };
        }]);


