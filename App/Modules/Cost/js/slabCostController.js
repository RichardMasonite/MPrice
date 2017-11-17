$(function () {
    angular.module('Pricing')
        .controller("SlabCostController", [
            "ItemCostData", "ItemCostControllerShared", "NotificationFactory", "$uibModal", "TokenStore", 
            function (itemCostData, shared, notification, $uibModal, tokenStore) {
                var vm = this;

                var opened = false;

                vm.orderBy = {}
                vm.pageChoices = [25, 50, 100, 500];
                vm.paging = { rowsPerPage: 25, pageNumber: 1 }
                vm.showStatuses = { "Unchanged": true, "Changed": true, "New": true, "Pending Deletion": true };
                //--------------------------//---------------------------//------------------------//
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
//--------------------------//---------------------------//------------------------//


                vm.updateView = updateView;

                vm.enableUndo = false;

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                activate();

                function activate() {
                    vm.isEditMode = false;
                    vm.dataTransferring = true;
                    return shared.getItemCosts("slabcosts").then(function (data) {
                        vm.slabs = data;

                        vm.filterPropertyMap = shared.populateStatuses(vm.filterPropertyMap, statuses);

                        vm.updateView();

                        vm.dataTransferring = false;
                        vm.initialLoadComplete = true;
                    });
                }

                function updateView() {
                    vm.showStatuses = shared.setFilterStatuses(vm.filterPropertyMap, vm.showStatuses);

                    vm.slabView = shared.getFilteredSortedItemCosts(vm.slabs, vm.showStatuses, vm.filter, vm.orderBy, vm.paging);

                    // Now initialize the new row.
                    vm.newSlabs = [{ item: { EffectiveDate: new Date() } }];
                }

                // Called automatically by ui-router.
                vm.uiCanExit = function (trans) {
                    return shared.uiCanExit(trans, vm.slabs);
                }

                vm.delete = function (slab) {
                    if (slab.status !== 'Pending Deletion') {
                        slab.previousStatus = slab.status;
                        slab.status = 'Pending Deletion';
                        vm.enableUndo = true;
                    }
                }

                vm.undo = function (slab) {
                    if (vm.enableUndo && slab.previousStatus) {
                        slab.status = slab.previousStatus;
                        slab.previousStatus = undefined;
                    }
                }

                vm.deleteAll = function () {
                    shared.confirmDeleteAll().then(function () {
                        vm.enableUndo = shared.deleteAllItems(vm.slabs);
                    }, function () {
                    });
                }

                vm.undeleteAll = function () {
                    if (vm.enableUndo) {
                        vm.enableUndo = !shared.undeleteAllItems(vm.slabs);
                    }
                }

                vm.edited = shared.itemEdited;

                vm.newSlabEdited = function (slab, $last) {
                    if ($last) {
                        slab.status = 'New';
                        vm.slabs.push(slab);
                        vm.newSlabs.push({ item: { EffectiveDate: new Date() } });
                    }
                }

                vm.sort = function (orderByExpression) {
                    vm.orderBy.reverse = (vm.orderBy.expression != orderByExpression) ? false : !vm.orderBy.reverse;
                    vm.orderBy.expression = orderByExpression;
                    vm.updateView();
                }

                vm.openFilterModal = function(filterProperty) {
                    shared.openSharedFilterModal(vm.filterPropertyMap, filterProperty)
                        .then(function() {
                                vm.updateView();
                            },
                            function() {
                                vm.updateView();
                            }
                        );
                };

                vm.import = function () {
                    if (opened) return;
                    else if (!/\.csv$/i.test(vm.importFile.name)) {
                        notification.error('File type not supported');
                    }
                    else {
                        var importTable = shared.parseCSV(vm.importFile.contents);
                        opened = true;
                        var modal = $uibModal.open({
                            templateUrl: '/App/Modules/Cost/Template/CostImportModal.html',
                            controller: 'SlabCostImportModalController',
                            controllerAs: 'vm',
                            resolve: {
                                slabs: function () {
                                    return vm.slabs;
                                },
                                importTable: function () {
                                    return importTable;
                                }
                            },
                            size: 'lg',
                            backdrop: 'static'
                        });

                        modal.result
                            .then(function (importRowsWithStatus) {
                                shared.mergeImportTableIntoOriginal(importRowsWithStatus, vm.slabs);
                                opened = false;
                                vm.isEditMode = true;
                                vm.updateView();
                            })
                            .then(null,
                            function () {
                                opened = false;
                            }),
                            function () {
                            };
                    }
                }

                vm.save = function () {
                    vm.dataTransferring = true;
                    return shared.saveItemCosts("slabcosts", vm.slabs).then(function (data) {
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
