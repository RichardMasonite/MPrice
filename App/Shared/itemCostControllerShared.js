(function () {
    angular.module("Pricing")
        .service("ItemCostControllerShared", ["ItemCostData", "$filter", "$stateParams", "$uibModal", "$q",
            function (itemCostData, $filter, $stateParams, $uibModal, $q) {
                var thisService = this;
                var orderByFilter = $filter('orderBy');
                var filterFilter = $filter('filter');

                this.getItemCosts = function (itemType) {
                    return itemCostData.getItemCosts(itemType, $stateParams.customerId, $stateParams.productTypeId).then(function (data) {
                        var items = [];
                        for (var itemIndex = 0; itemIndex < data.length; itemIndex++) {
                            var item = {
                                item: data[itemIndex],
                                status: 'Unchanged',
                                originalItem: angular.copy(data[itemIndex])
                            };
                            items.push(item);
                        }
                        return items;
                    });
                }

                var itemTypeMap = {
                    'slabcosts': { header: 'SLAB' },
                    'glasscosts': { header: 'GLASS', resultsView: 'GlassSaveResultsModal.html' },
                    'glazecosts': { header: 'GLAZED UNIT' },
                    'productcomps': { header: 'COMPONENT' }
                }

                this.saveItemCosts = function (itemType, items) {
                    var itemsByStatus = {
                        New: [],
                        Changed: [],
                        'Pending Deletion': []
                    };
                    angular.forEach(items, function (item) {
                        if (itemsByStatus[item.status])
                            itemsByStatus[item.status].push(item.item);
                    }, itemsByStatus);
                    return itemCostData.saveItemCosts(
                        itemType,
                        $stateParams.customerId,
                        itemsByStatus.New,
                        itemsByStatus.Changed,
                        itemsByStatus['Pending Deletion']).then(function (data) {
                            if (data && ((data.InvalidItems && data.InvalidItems.length) || (data.DuplicateItems && data.DuplicateItems.length))) {
                                var modal = $uibModal.open({
                                    templateUrl: '/App/Modules/Cost/Template/' + (itemTypeMap[itemType].resultsView || 'CostSaveResultsModal.html'),
                                    controller: 'CostSaveResultsModalController',
                                    controllerAs: 'vm',
                                    resolve: {
                                        invalidItems: function () {
                                            return data.InvalidItems;
                                        },
                                        duplicateItems: function () {
                                            return data.DuplicateItems;
                                        },
                                        header: function () {
                                            return itemTypeMap[itemType].header + ' COST';
                                        }
                                    },
                                    size: 'lg',
                                    backdrop: 'static'
                                });

                                return modal.result.then(function () { }, function () { });
                            }
                        });
                }

                this.isDirty = function (items) {
                    if (items) {
                        for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
                            if (items[itemIndex].status != 'Unchanged') {
                                return true;
                            }
                        }
                        return false;
                    }
                    else
                        return false;
                }

                this.uiCanExit = function (trans, items) {
                    if (thisService.isDirty(items)) {
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

                // MPD-662
                this.confirmDeleteAll = function () {
                    
                    var modalInstance = $uibModal.open({
                        templateUrl: "/app/Controls/confirmModal.html",
                        controller: "ConfirmModalController",
                        controllerAs: 'vm',
                        size: 'sm',
                        resolve: {
                            msg: function () {
                                return "Do you wish to permanently delete all cost data for your selected distributor and product?";
                            },
                            caption: function () {
                                return "Warning";
                            }
                        }
                    });
                    
                    return modalInstance.result;

                    //modalInstance.result.then(function () {
                    //    console.log('modalInstance.result OKAY');
                    //    return true;
                    //}, function () {
                    //    console.log('modalInstance.result CANCEL');
                    //    return false;
                    //});
                    
                }

                // Input:
                //     items        - Item cost collection to be filtered and sorted.  
                //          Assumption(s): Object containing "status" property of type string and one of these values:
                //                      'Unchanged', 'Changed', 'New', 'Pending Deletion'.
                //     showStatuses - List of statuses and whether to show. 
                //          Assumption(s): Object of form { Unchanged: <boolean>, 
                //              Changed: <boolean>, New: <boolean>, 'Pending Deletion': <boolean> }.
                //     filter       - Filter to apply to the collection.  
                //         Assumption(s): Of a form which can be handled by the "filter" filter and
                //                  fits the given collection structure.
                //     orderBy      - Sort to apply to the collection.  
                //        Assumption(s): Object of form { expression: <string or whatever
                //                   fits in "orderBy" filter expression>, reverse: <boolean> }.
                //     paging       - Paging parameters to apply to the final collection.  
                //       Assumption(s): Object of form { rowsPerPage: <int>, pageNumber: <int> }.
                // Output:
                //     Object of form { items: <items after filtering, sorting and paging>,
                //     length: <length of final items before paging applied (to be used by Bootstrap paging control)> }.

                this.getFilteredSortedItemCosts = function (items, showStatuses, filter, orderBy, paging) {
                    var filteredSortedItems = [];

                    // Filter by status.
                    angular.forEach(items, function (item) {
                        if (showStatuses[item.status])
                            this.push(item);
                    }, filteredSortedItems);

                    if (filter)
                        filteredSortedItems = filterFilter(filteredSortedItems, filter);

                    if (orderBy)
                        filteredSortedItems = orderByFilter(filteredSortedItems, orderBy.expression, orderBy.reverse);

                    // For paging control.
                    var retval = { length: filteredSortedItems.length };

                    if (paging)
                        filteredSortedItems = filteredSortedItems.slice(paging.rowsPerPage * (paging.pageNumber - 1), paging.rowsPerPage * paging.pageNumber);

                    retval.items = filteredSortedItems;

                    return retval;
                }

                this.deleteAllItems = function (items) {
                    for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
                        var item = items[itemIndex];

                        if (item.status !== 'Pending Deletion') {
                            item.previousStatus = item.status;
                            item.status = "Pending Deletion";
                        }
                    }

                    return true;
                }

                this.undeleteAllItems = function (items) {
                    for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
                        var item = items[itemIndex];

                        if (item.previousStatus) {
                            item.status = item.previousStatus;
                            item.previousStatus = undefined;
                        }
                    }

                    return true;
                }

                this.itemEdited = function (item) {
                    var currentStatus = item.status;
                    if (angular.equals(item.item, item.originalItem))
                        item.status = 'Unchanged';
                    else if (item.status != 'New')
                        item.status = 'Changed';
                }

                this.parseCSV = function (csv) {
                    var returnTable = [];
                    var pattern = /[\n\f\r]/;

                    var inQuotes = false;
                    var justFoundQuote = false;
                    returnTable = [['']];
                    var row = 0;
                    var column = 0;

                    for (var index = 0; index < csv.length; index++) {
                        var indexCharacter = csv.charAt(index);
                        if (indexCharacter == '"') {
                            inQuotes = !inQuotes;
                            if (justFoundQuote)
                                returnTable[row][column] = returnTable[row][column] + '"';
                            justFoundQuote = !justFoundQuote;
                        }
                        else {
                            justFoundQuote = false;
                            if (inQuotes)
                                returnTable[row][column] = returnTable[row][column] + (pattern.test(indexCharacter) ? '<br/>' : indexCharacter);
                            else {
                                if (indexCharacter == ",") {
                                    column++;
                                    returnTable[row].push('');
                                }
                                else if (pattern.test(indexCharacter)) {
                                    if (column || returnTable[row][column]) {
                                        row++;
                                        column = 0;
                                        returnTable.push(['']);
                                    }
                                }
                                else {
                                    returnTable[row][column] = returnTable[row][column] + indexCharacter;
                                }
                            }
                        }
                    }

                    if (returnTable[row].length == 1 && !returnTable[row][0])
                        returnTable.pop();

                    return returnTable;
                }

                this.mergeImportTableIntoOriginal = function (importRowsWithStatus, items) {
                    for (var i = 0; i < importRowsWithStatus.length; i++) {
                        var importRowWithStatus = importRowsWithStatus[i];
                        if (importRowWithStatus.include) {

                            // If the original item was matched in the modal, just point at that.  Otherwise, create a new one (add it to the master list) and point at that.
                            var item = importRowWithStatus.originalItem;
                            if (!item) {
                                item = {};
                                items.push(item);
                            }

                            // Either way, set the status, etc. from the pasted status.
                            item.status = importRowWithStatus.status;
                            item.item = angular.copy(importRowWithStatus.importItem);
                        }
                    }
                }

                this.setFilterStatuses = function(propertyMap, statuses) {
                    //there are no selections - either the first time thru or afterward if user deselects everything
                    //  there are two time when all are selected - when user selects all or selects none 

                    if (Object.keys(propertyMap.Status.selected).length === 0) {
                        this.setStatusesTrue(statuses);
                    } else {
                        // at this point there are some selections, so simply set the status to whatever
                        //  the user has selected 
                        statuses["Unchanged"]        = propertyMap.Status.selected["Unchanged"];
                        statuses["Changed"]          = propertyMap.Status.selected["Changed"];
                        statuses["New"]              = propertyMap.Status.selected["New"];
                        statuses["Pending Deletion"] = propertyMap.Status.selected["Pending Deletion"];
                    }
                    // when the last button is deselected, it will set its value to false, then come thru
                    // this code but the actual button is still present in the modal so it doesn't get 
                    // caught above.  
                    if (!statuses['Unchanged'] &&
                        !statuses['Changed'] &&
                        !statuses['New'] &&
                        !statuses['Pending Deletion']) {
                        this.setStatusesTrue(statuses);
                    }

                    return statuses;

                };

               this.setStatusesTrue = function(statuses)
                {
                    statuses['Unchanged']        = true;
                    statuses['Changed']          = true;
                    statuses['New']              = true;
                    statuses['Pending Deletion'] = true;
                }
            

                this.openSharedFilterModal = function (propertyMap, filterProperty) {
                    var retval;
                    var modal = $uibModal.open({
                        templateUrl: '/App/Shared/Filter/Template/filterModal.html',
                        controller: 'FilterModalController',
                        controllerAs: 'vm',
                        resolve: {
                            filterData: function () {
                               return  propertyMap[filterProperty];
                            }
                        },
                        size: 'lg'
                    });
                   return modal.result;
                }

                this.populateStatuses = function (propertyMap, statuses)
                {
                    for (var filterProperty in statuses)
                        if (statuses.hasOwnProperty(filterProperty)) {
                            propertyMap[filterProperty].list = statuses[filterProperty];
                            propertyMap[filterProperty].selected = {};
                        }
                    return propertyMap;
                }

            }]
        );

}());
