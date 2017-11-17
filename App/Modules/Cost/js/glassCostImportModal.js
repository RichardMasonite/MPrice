$(function () {
    angular.module('Pricing')
        .controller("GlassCostImportModalController",
        ["$uibModalInstance", "glasses", "importTable",
            function ($uibModalInstance, glasses, importTable) {
                var vm = this;
                vm.setStatuses = setStatuses;

                var glassDictionary = {};

                activate();

                function activate() {
                    // Setup dictionary for faster record matching later.
                    angular.forEach(glasses, function (glass) {
                        this[glass.item.Code] = glass;
                    }, glassDictionary);

                    // Here's all the choices
                    vm.columnChoices = [
                        { column: "Code", display: "Price Book Code" },
                        { column: "Price", display: "Price" },
                        { column: "Multiplier", display: "Multiplier" },
                        { column: "Cost", display: "Cost" },
                        //{ column: "EffectiveDate", display: "Effective Date" }
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
                            var glass = glassDictionary[newRow.importItem.Code];
                            if (glass) {
                                // Matched.  Check for change.
                                newRow.originalItem = glass;
                                newRow.status = 'Unchanged';

                                if (columnMatches.Price >= 0) {
                                    newRow.importItem.Price = Number(newRow.columns[columnMatches.Price].replace(/[^0-9\.]+/g, ""));
                                    if (glass.item.Price != newRow.importItem.Price)
                                        newRow.status = 'Changed';
                                }
                                else
                                    newRow.importItem.Price = glass.item.Price;

                                if (columnMatches.Multiplier >= 0) {
                                    newRow.importItem.Multiplier = Number(newRow.columns[columnMatches.Multiplier].replace(/[^0-9\.]+/g, ""));
                                    if (glass.item.Multiplier != newRow.importItem.Multiplier)
                                        newRow.status = 'Changed';
                                }
                                else
                                    newRow.importItem.Multiplier = glass.item.Multiplier;

                                if (columnMatches.Cost >= 0) {
                                    newRow.importItem.Cost = Number(newRow.columns[columnMatches.Cost].replace(/[^0-9\.]+/g, ""));
                                    if (glass.item.Cost != newRow.importItem.Cost)
                                        newRow.status = 'Changed';
                                }
                                else
                                    newRow.importItem.Cost = glass.item.Cost;

                                if (columnMatches.EffectiveDate >= 0) {
                                    newRow.importItem.EffectiveDate = new Date(newRow.columns[columnMatches.EffectiveDate]);
                                    if (+glass.item.EffectiveDate != +newRow.importItem.EffectiveDate)
                                        newRow.status = 'Changed';
                                }
                                else
                                    newRow.importItem.EffectiveDate = glass.item.EffectiveDate;
                            }
                            else {
                                // No match.  Mark as new.
                                newRow.status = 'New';
                                newRow.importItem.Price = (columnMatches.Price >= 0) ? Number(newRow.columns[columnMatches.Price].replace(/[^0-9\.]+/g, "")) : NaN;
                                newRow.importItem.Multiplier = (columnMatches.Multiplier >= 0) ? Number(newRow.columns[columnMatches.Multiplier].replace(/[^0-9\.]+/g, "")) : "";
                                newRow.importItem.Cost = (columnMatches.Cost >= 0) ? Number(newRow.columns[columnMatches.Cost].replace(/[^0-9\.]+/g, "")) : NaN;
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