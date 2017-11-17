$(function () {
    angular.module('Pricing')
        .controller("ComponentCostImportModalController",
        ["components", "importTable", "ItemCostControllerShared", "$uibModalInstance",
            function (components, importTable, shared, $uibModalInstance) {
                var vm = this;
                vm.setStatuses = setStatuses;

                var componentDictionary = {};

                activate();

                function activate() {
                    // Setup dictionary for faster record matching later.
                    angular.forEach(components, function (component) {
                        this[component.item.Code] = component;
                    }, componentDictionary);

                    // Here's all the choices
                    vm.columnChoices = [
                        { column: "Code", display: "Price Book Code", type: "string" },
                        { column: "Cost", display: "Cost", type: "number" },
                    ];

                    vm.columnSelections = [];

                    // Preload as best we can.
                    for (var columnIndex = 0; columnIndex < importTable[0].length; columnIndex++)
                        vm.columnSelections[columnIndex] = vm.columnChoices[columnIndex];

                    vm.importRowsWithStatus = [];
                    for (var importIndex = 0; importIndex < importTable.length; importIndex++) {
                        vm.importRowsWithStatus.push({ columns: importTable[importIndex], include: true });
                    }

                    vm.setStatuses();
                }

                function setStatuses() {
                    //vm.importRowsWithStatus = shared.matchAndSetStatus(importTable, componentDictionary, vm.columnChoices, vm.columnSelections)

                    // Match up columns;
                    var columnMatches = {};
                    angular.forEach(vm.columnChoices, function (columnChoice) {
                        this[columnChoice.column] = -1;
                    }, columnMatches);

                    for (var columnIndex = 0; columnIndex < vm.importRowsWithStatus[0].columns.length; columnIndex++) {
                        angular.forEach(columnMatches, function (matchColumnNumber, matchColumnName) {
                            if (vm.columnSelections[columnIndex].column == matchColumnName) {
                                if (matchColumnNumber == -1)
                                    columnMatches[matchColumnName] = columnIndex;
                                else
                                    // We found it twice.
                                    columnMatches[matchColumnName] = -2;
                            }
                        });
                    }

                    // Build the final collection, matching with original rows and setting status if applicable.
                    for (var importIndex = 0; importIndex < vm.importRowsWithStatus.length; importIndex++) {
                        var newRow = vm.importRowsWithStatus[importIndex];

                        // With no Code column, there's no show.
                        if (columnMatches.Code >= 0) {
                            // Initialize with the Code.
                            newRow.importItem = { Code: newRow.columns[columnMatches.Code] };

                            // Try to match to the originals
                            var component = componentDictionary[newRow.importItem.Code];
                            if (component) {
                                // Matched.  Check for change.
                                newRow.originalItem = component;
                                newRow.status = 'Unchanged';

                                if (columnMatches.Cost >= 0) {
                                    newRow.importItem.Cost = Number(newRow.columns[columnMatches.Cost].replace(/[^0-9\.]+/g, ""));
                                    if (component.item.Cost != newRow.importItem.Cost)
                                        newRow.status = 'Changed';
                                }
                                else
                                    newRow.importItem.Cost = component.item.Cost;

                            }
                            else {
                                // No match.  Mark as new.
                                newRow.status = 'New';
                                newRow.importItem.Cost = (columnMatches.Cost >= 0) ? Number(newRow.columns[columnMatches.Cost].replace(/[^0-9\.]+/g, "")) : 0;

                            }
                        }
                    }
                };

                vm.cancel = function () {
                    vm.importRowsWithStatus = [];
                    // vm.opened = false;
                    //   $dismiss();
                    $uibModalInstance.dismiss('cancel');
                }

                vm.save = function () {
                    $uibModalInstance.close(vm.importRowsWithStatus);
                }
            }]
        );
}());