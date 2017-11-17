$(function () {
    angular.module('Pricing')
        .controller("GlazedCostController", [
            "ItemCostControllerShared", "NotificationFactory", "$uibModal", "TokenStore",
            function (shared, notification, $uibModal, tokenStore) {
                var vm = this;

                vm.orderBy = {}
                vm.pageChoices = [25, 50, 100, 500];
                vm.paging = { rowsPerPage: 25, pageNumber: 1 }
                vm.showStatuses = { "Unchanged": true, "Changed": true, "New": true, "Pending Deletion": true }
                var statuses =
                {
                    "Status": {
                        'Unchanged': 'Unchanged',
                        'Changed': 'Changed',
                        'New': 'New',
                        'Pending Deletion': 'Pending Deletion'
                    }
                };
                vm.filterPropertyOrder = ["Status"];
                vm.filterPropertyMap = {
                    "Status": { idColumn: "StatusId", name: "Status" }
                };

                vm.updateView = updateView;

                vm.enableUndo = false;

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                activate();

                function activate() {
                    vm.isEditMode = false;
                    vm.dataTransferring = true;
                    return shared.getItemCosts("glazecosts").then(function (data) {
                        vm.glazedUnits = data;

                        vm.filterPropertyMap = shared.populateStatuses(vm.filterPropertyMap, statuses);

                        vm.updateView();

                        vm.dataTransferring = false;
                        vm.initialLoadComplete = true;
                    });
                }

                function updateView() {
                    vm.showStatuses = shared.setFilterStatuses(vm.filterPropertyMap, vm.showStatuses);

                    vm.glazedUnitView = shared.getFilteredSortedItemCosts(vm.glazedUnits, vm.showStatuses, vm.filter, vm.orderBy, vm.paging);

                    // Now initialize the new row.
                    vm.newglazedUnits = [{ item: { EffectiveDate: new Date() } }];
                }

                // Called automatically by ui-router.
                vm.uiCanExit = function (trans) {
                    return shared.uiCanExit(trans, vm.glazedUnits);
                }

                vm.delete = function (glazedUnit) {
                    if (glazedUnit.status !== 'Pending Deletion') {
                        glazedUnit.previousStatus = glazedUnit.status;
                        glazedUnit.status = 'Pending Deletion';
                        vm.enableUndo = true;
                    }
                }

                vm.undo = function (glazedUnit) {
                    if (vm.enableUndo && glazedUnit.previousStatus) {
                        glazedUnit.status = glazedUnit.previousStatus;
                        glazedUnit.previousStatus = undefined;
                    }
                }

                vm.deleteAll = function () {
                    shared.confirmDeleteAll().then(function () {
                        vm.enableUndo = shared.deleteAllItems(vm.glazedUnits);
                    }, function () {
                    });
                }

                vm.undeleteAll = function () {
                    if (vm.enableUndo) {
                        vm.enableUndo = !shared.undeleteAllItems(vm.glazedUnits);
                    }
                }

                vm.edited = shared.itemEdited;

                vm.newglazedUnitEdited = function (glazedUnit, $last) {
                    if ($last) {
                        glazedUnit.status = 'New';
                        vm.glazedUnits.push(glazedUnit);
                        vm.newglazedUnits.push({ item: { EffectiveDate: new Date() } });
                    }
                }

                vm.sort = function (orderByExpression) {
                    vm.orderBy.reverse = (vm.orderBy.expression != orderByExpression) ? false : !vm.orderBy.reverse;
                    vm.orderBy.expression = orderByExpression;
                    vm.updateView();
                }

                vm.openFilterModal = function (filterProperty) {
                    shared.openSharedFilterModal(vm.filterPropertyMap, filterProperty)
                        .then(function () {
                                vm.updateView();
                            },
                            function () {
                                vm.updateView();
                            }
                        );
                };

                vm.import = function () {
                    if (!/\.csv$/i.test(vm.importFile.name)) {
                        notification.error('File type not supported');
                    }
                    else {
                        var importTable = shared.parseCSV(vm.importFile.contents);
                        var modal = $uibModal.open({
                            templateUrl: '/App/Modules/Cost/Template/glazedCostImportModal.html',
                            controller: 'GlazedCostImportModalController',
                            controllerAs: 'vm',
                            resolve: {
                                glazedUnits: function () {
                                    return vm.glazedUnits;
                                },
                                importTable: function () {
                                    return importTable;
                                }
                            },
                            size: 'lg',
                            backdrop: 'static'
                        });

                        modal.result.then(function (importRowsWithStatus) {
                            shared.mergeImportTableIntoOriginal(importRowsWithStatus, vm.glazedUnits);
                            vm.isEditMode = true;
                            vm.updateView();
                        }, function () {
                        });
                    }
                }

                vm.save = function () {
                    vm.dataTransferring = true;
                    return shared.saveItemCosts("glazecosts", vm.glazedUnits).then(function (data) {
                        vm.dataTransferring = false;
                        notification.saveSuccess();
                        return activate();
                    });
                };

                vm.cancel = function () {
                    return activate();
                };

                vm.isMasoniteDist = function () {
                    return tokenStore.isMasoniteDist();
                };
            }
        ])
}());
