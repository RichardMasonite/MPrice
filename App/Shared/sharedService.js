(function () {
    angular.module("Pricing")
        .service("SharedService", ["ItemCostData", "$filter", "$stateParams", "$uibModal", "$q",
            function (itemCostData, $filter, $stateParams, $uibModal, $q) {
                var thisService = this;
                var orderByFilter = $filter('orderBy');
                var filterFilter = $filter('filter');

                this.uiCanExitWhenDirty = function (trans, isDirty) {
                    if (isDirty) {
                        var modalInstance = $uibModal.open({
                            templateUrl: "/app/Controls/confirmModal.html",
                            controller: "ConfirmModalController",
                            controllerAs: 'vm',
                            size: 'sm',
                            resolve: {
                                msg: function () {
                                    return "Do you want to leave this page?  Changes you made will be lost.";
                                },
                                caption: function () {
                                    return "Warning";
                                }
                            }
                        });
                        return modalInstance.result;
                    }
                    else
                        return $q.when(true);
                }
            }]
        );
}());
