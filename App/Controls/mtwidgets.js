(function() {

    angular.module('mtwidgets', [])

        .controller('ConfirmModalController',
            ['msg', 'caption',
                function (msg, caption) {
                    var vm = this;
                    vm.msg = msg;
                    vm.caption = caption;
                }]
        )

        .controller('CatalogUpdateModalController',
            ['msg', 'caption','catalog',
                function (msg, caption, catalog) {
                    var vm = this;
                    vm.msg = msg;
                    vm.caption = caption + " for " + msg;
                    vm.catalog = catalog;
                }]
        )


   .directive('mtSpinner', function () {
        return {
            restrict: 'E',
            transclude: true,
            template: '<i class="fa fa-spinner fa-pulse fa-4x fa-fw margin center"></i>'
        };
    })

   .directive('ngConfirmClick',
        ['$uibModal',
            function ($uibModal) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attr) {
                        var msg = attr.ngConfirmClick || "Are you sure?";
                        var caption = attr.ngConfirmCaption || "Confirm";
                        var confirmAction = attr.confirmedClick;
                        var clickAction = attr.actionClick;

                        element.bind('click', function () {
                            var confirmRequired = scope.$eval(attr.ngConfirmRequired || "true");
                            if (confirmRequired) {
                                var modalInstance = $uibModal.open({
                                    templateUrl: "/app/Controls/confirmModal.html",
                                    controller: "CatalogConfirmModalController",
                                    controllerAs: 'vm',
                                    size: 'sm',
                                    resolve: {
                                        msg: function () {
                                            return msg;
                                        },
                                        caption: function () {
                                            return caption;
                                        }
                                    }
                                });
                                modalInstance.result.then(function () {
                                    scope.$eval(confirmAction);
                                });

                            } else {
                                scope.$eval(clickAction);
                            }
                        });
                    }
                };
            }])

   .directive('ngCopyClick',
            ['$uibModal',
                function ($uibModal) {
                    return {
                        restrict: 'A',
                        link: function (scope, element, attr) {
                            var msg = attr.ngCopyClick || "Are you sure?";
                            var caption = attr.ngCopyCaption || "Copy";
                            var copyAction = attr.copyClick;
                            var clickAction = attr.actionClick;

                            element.bind('click', function () {
                                var copyRequired = scope.$eval(attr.ngCopyRequired || "true");
                                if (copyRequired) {
                                    var modalInstance = $uibModal.open({
                                        templateUrl: "/app/Controls/CatalogModals/genericModal.html",
                                        controller: "CatalogCopyModalController",
                                        controllerAs: 'vm',
                                        size: 'sm',
                                        resolve: {
                                            msg: function () {
                                                return msg;
                                            },
                                            caption: function () {
                                                return caption;
                                            }
                                        }
                                    });
                                    modalInstance.result.then(function () {
                                       // scope.vm.catalogId = scope.CatalogId;
                                        scope.$eval(copyAction);
                                    });

                                } else {
                                    scope.$eval(clickAction);
                                }
                            });
                        }
                    };
            }])

   .directive('ngCreateClick',
            ['$uibModal',
                function ($uibModal) {
                    return {
                        restrict: 'A',
                        link: function (scope, element, attr) {
                            var msg = attr.ngCreateClick || "Are you sure?";
                            var caption = attr.ngCreateCaption || "Create";
                            var createAction = attr.createClick;
                            var clickAction = attr.actionClick;

                            element.bind('click', function () {
                                var createRequired = scope.$eval(attr.ngCreateRequired || "true");
                                if (createRequired == true) {
                                    var modalInstance = $uibModal.open({
                                        templateUrl: "/app/Controls/CatalogModals/createModal.html",
                                        controller: "CatalogCreateModalController",
                                        controllerAs: 'vm',
                                        size: 'sm',
                                        resolve: {
                                            msg: function () {
                                                return msg;
                                            },
                                            caption: function () {
                                                return caption;
                                            }
                                        }
                                    });
                                    modalInstance.result.then(function () {
                                        scope.vm.catalogName = $("#catCreateName").val();
                                        scope.vm.catalogDesc = $("#catCreateDesc").val();
                                        scope.$eval(createAction);
                                    });

                                } else {
                                    scope.$eval(clickAction);
                                }
                            });
                        }
                    };
                }])

    .directive('ngUpdateClick',
        ['$uibModal',
            function ($uibModal) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attr) {
                        var msg = attr.ngUpdateClick || "Are you sure?";
                        var caption = attr.ngUpdateCaption || "Update";
                        var updateAction = attr.updateClick;
                        var clickAction = attr.actionClick;

                        element.bind('click', function () {
                            var updateRequired = scope.$eval(attr.ngUpdateRequired || "true");
                            if (updateRequired) {
                                var modalInstance = $uibModal.open({
                                    templateUrl: "/app/Controls/CatalogModals/updateModal.html",
                                    controller: "CatalogUpdateModalController",
                                    controllerAs: 'vm',
                                    size: 'sm',
                                    resolve: {
                                        msg: function () {
                                            return msg;
                                        },
                                        caption: function () {
                                            return caption;
                                        },
                                        catalog: function() {
                                            return scope.catalog;
                                        }
                                    }
                                });
                                modalInstance.result.then(function () {
                                    scope.$eval(updateAction);
                                });

                            } else {
                                scope.$eval(clickAction);
                            }
                        });
                    }
                };
            }]
   )



// Sticky Headers
   .directive('fsmStickyHeader', [function () {
        return {
            restrict: 'EA',
            replace: false,
            scope: {
                scrollBody: '=',
                scrollStop: '=',
                scrollableContainer: '=',
                contentOffset: '='
            },
            link: function (scope, element, attributes, control) {
                var header = $(element, this);
                var clonedHeader = null;
                var content = $(scope.scrollBody);
                var scrollableContainer = $(scope.scrollableContainer);
                var contentOffset = scope.contentOffset || 0;

                if (scrollableContainer.length === 0) {
                    scrollableContainer = $(window);
                }

                function setColumnHeaderSizes() {
                    if (clonedHeader.is('tr') || clonedHeader.is('thead')) {
                        var clonedColumns = clonedHeader.find('th');
                        header.find('th').each(function (index, column) {
                            var clonedColumn = $(clonedColumns[index]);
                            clonedColumn.css('width', column.offsetWidth + 'px');
                        });
                    }
                };

                function determineVisibility() {
                    var scrollTop = scrollableContainer.scrollTop() + (scope.scrollStop || 0);
                    var contentTop = content.offset().top + contentOffset;
                    var contentBottom = contentTop + content.outerHeight(false);

                    if ((scrollTop > contentTop) && (scrollTop < contentBottom)) {
                        if (!clonedHeader) {
                            createClone();
                            clonedHeader.css({ "visibility": "visible" });
                        }

                        if (scrollTop < contentBottom && scrollTop > contentBottom - clonedHeader.outerHeight(false)) {
                            var top = contentBottom - scrollTop + scope.scrollStop - clonedHeader.outerHeight(false);
                            clonedHeader.css('top', top + 'px');
                        } else {
                            calculateSize();
                        }
                    } else {
                        if (clonedHeader) {
                            /*
                             * remove cloned element (switched places with original on creation)
                             */
                            header.remove();
                            header = clonedHeader;
                            clonedHeader = null;

                            header.removeClass('fsm-sticky-header');
                            header.css({
                                position: 'relative',
                                left: 0,
                                top: 0,
                                width: 'auto',
                                'z-index': 1,
                                visibility: 'visible',
                                paddingBottom: "0",
                                paddingTop: "0",
                                borderBottom: "0"
                            });
                        }
                    }
                };

                function calculateSize() {
                    clonedHeader.css({
                        top: scope.scrollStop,
                        width: header.outerWidth(),
                        left: header.offset().left
                    });

                    setColumnHeaderSizes();
                };

                function createClone() {
                    /*
                     * switch place with cloned element, to keep binding intact
                     */
                    clonedHeader = header;
                    header = clonedHeader.clone();
                    clonedHeader.after(header);
                    clonedHeader.addClass('fsm-sticky-header');
                    clonedHeader.css({
                        position: 'fixed',
                        'z-index': 1000,
                        left: 0,
                        top: 0,
                        visibility: 'hidden',
                        paddingBottom: "5px",
                        paddingTop: "10px",
                        borderBottom: "1px solid black"
                    });
                    calculateSize();
                    header.css({ "visibility": "hidden" });
                    CloseMenu();
                    CloseAccount();
                };

                scrollableContainer.on('scroll.fsmStickyHeader', determineVisibility).trigger("scroll");
                scrollableContainer.on('resize.fsmStickyHeader', determineVisibility);

                scope.$on('$destroy', function () {
                    scrollableContainer.off('.fsmStickyHeader');
                });


                function CloseMenu() {
                    $("#menu-panel").removeClass('in').addClass('collapse');
                    $(".header.bg-dark .fix-container .menu > div").addClass("collapsed");
                }
                function CloseAccount() {
                    $("#account-panel").removeClass('in').addClass('collapse');
                    $(".header.bg-dark .fix-container .account").addClass("collapsed");
                }
            }
        };
    }]);


}());


