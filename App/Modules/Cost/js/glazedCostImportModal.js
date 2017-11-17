$(function () {
    angular.module('Pricing')
        .controller("GlazedCostImportModalController",
            ["glazedUnits", "importTable", "ItemCostControllerShared", "$uibModalInstance",
            function (glazedUnits, importTable, shared, $uibModalInstance) {
                var vm = this;
                vm.setStatuses = setStatuses;

                var glazedUnitDictionary = {};

                activate();

                function activate() {
                    // Setup dictionary for faster record matching later.
                    angular.forEach(glazedUnits, function (glazedUnit) {
                        this[glazedUnit.item.Code] = glazedUnit;
                    }, glazedUnitDictionary);

                    // Here's all the choices
                    vm.columnChoices = [
                        { column: "Code", display: "Price Book Code", type: "string" },
                        { column: "Cost", display: "Cost", type: "number" },
                        //{ column: "EffectiveDate", display: "Effective Date", type: "date" }
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
                    //vm.importRowsWithStatus = shared.matchAndSetStatus(importTable, glazedUnitDictionary, vm.columnChoices, vm.columnSelections)

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
                            var glazedUnit = glazedUnitDictionary[newRow.importItem.Code];
                            if (glazedUnit) {
                                // Matched.  Check for change.
                                newRow.originalItem = glazedUnit;
                                newRow.status = 'Unchanged';

                                if (columnMatches.Cost >= 0) {
                                    newRow.importItem.Cost = Number(newRow.columns[columnMatches.Cost].replace(/[^0-9\.]+/g, ""));
                                    if (glazedUnit.item.Cost != newRow.importItem.Cost)
                                        newRow.status = 'Changed';
                                }
                                else
                                    newRow.importItem.Cost = glazedUnit.item.Cost;

                                if (columnMatches.EffectiveDate >= 0) {
                                    newRow.importItem.EffectiveDate = new Date(newRow.columns[columnMatches.EffectiveDate]);
                                    if (+glazedUnit.item.EffectiveDate != +newRow.importItem.EffectiveDate)
                                        newRow.status = 'Changed';
                                }
                                else
                                    newRow.importItem.EffectiveDate = glazedUnit.item.EffectiveDate;
                            }
                            else {
                                // No match.  Mark as new.
                                newRow.status = 'New';
                                newRow.importItem.Cost = (columnMatches.Cost >= 0) ? Number(newRow.columns[columnMatches.Cost].replace(/[^0-9\.]+/g, "")) : 0;
                                newRow.importItem.EffectiveDate = (columnMatches.EffectiveDate >= 0) ? new Date(newRow.columns[columnMatches.EffectiveDate]) : new Date();
                            }
                        }
                    }
                };

                vm.save = function () {
                    $uibModalInstance.close(vm.importRowsWithStatus);
                }
            }]
        );
}());