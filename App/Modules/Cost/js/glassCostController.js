$(function () {
    angular.module('Pricing')
        .controller("GlassCostController", [
            "ItemCostData", "ItemCostControllerShared", "NotificationFactory", "$uibModal", "TokenStore", 
            function (costData, shared, notification, $uibModal, tokenStore) {
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
                    return shared.getItemCosts("glasscosts").then(function (data) {
                        vm.glasses = data;
                        vm.filterPropertyMap = shared.populateStatuses(vm.filterPropertyMap, statuses);
                        vm.updateView();
                        vm.dataTransferring = false;
                        vm.initialLoadComplete = true;
                    });
                }

                function updateView() {
                    vm.showStatuses = shared.setFilterStatuses(vm.filterPropertyMap, vm.showStatuses);

                    vm.glassView =
                        shared.getFilteredSortedItemCosts(
                            vm.glasses,
                            vm.showStatuses,
                            vm.filter,
                            vm.orderBy,
                            vm.paging);
                    // Now initialize the new row.
                    vm.newGlasses = [{ item: { EffectiveDate: new Date() } }];
                }

                // Called automatically by ui-router.
                vm.uiCanExit = function (trans) {
                    return shared.uiCanExit(trans, vm.glasses);
                }

                vm.delete = function (glass) {
                    if (glass.status !== 'Pending Deletion') {
                        glass.previousStatus = glass.status;
                        glass.status = 'Pending Deletion';
                        vm.enableUndo = true;
                    }
                }

                vm.undo = function (glass) {
                    if (vm.enableUndo && glass.previousStatus) {
                        glass.status = glass.previousStatus;
                        glass.previousStatus = undefined;
                    }
                }

                vm.deleteAll = function () {
                    shared.confirmDeleteAll().then(function () {
                        vm.enableUndo = shared.deleteAllItems(vm.glasses);
                    }, function () {
                    });
                }

                vm.undeleteAll = function () {
                    if (vm.enableUndo) {
                        vm.enableUndo = !shared.undeleteAllItems(vm.glasses);
                    }
                }

                vm.edited = shared.itemEdited;

                vm.costCalculatorEdited = function (glass) {
                    var retval = vm.edited(glass);
                    glass.item.Cost = Number((glass.item.Price * glass.item.Multiplier).toFixed(2));
                    return retval;
                }

                vm.costEdited = function (glass) {
                    var retval = vm.edited(glass);
                    glass.item.Price = '';
                    glass.item.Multiplier = '';
                    return retval;
                }

                vm.newGlassEdited = function (glass, $last) {
                    if ($last) {
                        glass.status = 'New';
                        vm.glasses.push(glass);
                        vm.newGlasses.push({ item: { EffectiveDate: new Date() } });
                    }
                }

                vm.newCostCalculatorEdited = function (glass, $last) {
                    var retval = vm.newGlassEdited(glass, $last);
                    glass.item.Cost = Number((glass.item.Price * glass.item.Multiplier).toFixed(2));
                }

                vm.newCostEdited = function (glass, $last) {
                    var retval = vm.newGlassEdited(glass, $last);
                    glass.item.Price = '';
                    glass.item.Multiplier = '';
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
                        });
                };

                vm.import = function () {
                    if (!/\.csv$/i.test(vm.importFile.name)) {
                        notification.error('File type not supported');
                    }
                    else {
                        var importTable = shared.parseCSV(vm.importFile.contents);
                        var modal = $uibModal.open({
                            templateUrl: '/App/Modules/Cost/Template/GlassCostImportModal.html',
                            controller: 'GlassCostImportModalController',
                            controllerAs: 'vm',
                            resolve: {
                                glasses: function () {
                                    return vm.glasses;
                                },
                                importTable: function () {
                                    return importTable;
                                }
                            },
                            size: 'lg',
                            backdrop: 'static'
                        });

                        modal.result.then(function (importRowsWithStatus) {
                            // A little post-processing for the multiplier math.
                            for (var i = 0; i < importRowsWithStatus.length; i++) {
                                var importRow = importRowsWithStatus[i];

                                // Price and multiplier specified, but cost not.
                                if (importRow.status == 'New' && importRow.importItem.Cost != 0 && !importRow.importItem.Cost &&
                                    (importRow.importItem.Multiplier || importRow.importItem.Multiplier == 0) &&
                                    (importRow.importItem.Price || importRow.importItem.Price == 0)) {
                                    importRow.importItem.Cost = importRow.importItem.Price * importRow.importItem.Multiplier;
                                }
                            }

                            shared.mergeImportTableIntoOriginal(importRowsWithStatus, vm.glasses);

                            vm.isEditMode = true;
                            vm.updateView();
                        }, function () {
                        });
                    }
                }

                vm.save = function () {
                    vm.dataTransferring = true;
                    return shared.saveItemCosts("glasscosts", vm.glasses).then(function (data) {
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
        ]);
}());
