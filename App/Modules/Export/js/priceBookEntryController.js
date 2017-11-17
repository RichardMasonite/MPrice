(function () {
    angular.module('Pricing')
        .controller('PriceBookEntryController', [
            "PriceBookEntryData", "$stateParams", "$uibModal", "$filter",
            function (priceBookEntryData, $stateParams, $uibModal, $filter) {
                var vm = this;

                var filterFilter = $filter('filter');

                vm.pageChoices = [25, 50, 100, 500];
                vm.paging = { rowsPerPage: 25, pageNumber: 1 }

                var slabFamilyProductTypes;
                var filteredSlabFamilies;
                vm.isExpanded = {};

                vm.updateView = updateView;

                vm.filterPropertyOrder = ["GlassDesigns", "GlassGridTypes", "GlassLites", "SlabSubFamilies", "SlabStyles"];
                vm.filterPropertyMap = {
                    "GlassDesigns": { idColumn: "GlassDesignId", name: "Glass Design" },
                    "GlassGridTypes": { idColumn: "GlassGridTypeId", name: "Glass Grid Type" },
                    "GlassLites": { idColumn: "GlassLiteId", name: "Glass Lite Count" },
                    "SlabSubFamilies": { idColumn: "SubfamilyId", name: "Sub Family" },
                    "SlabStyles": { idColumn: "SlabStyleId", name: "Door Style" }
                }

                activate();

                function activate() {
                    vm.dataHasLoaded = false;
                    vm.isEditMode = false;

                    return priceBookEntryData.getSetupData().then(function (data) {
                        slabFamilyProductTypes = data.SlabFamilyProductTypes;

                        // Attach the filter lists to the filterPropertyMap
                        for (var filterProperty in data.Filters)
                            if (data.Filters.hasOwnProperty(filterProperty)) {
                                vm.filterPropertyMap[filterProperty].list = data.Filters[filterProperty];
                                vm.filterPropertyMap[filterProperty].selected = {};
                            }

                        vm.updateView();
                        vm.dataHasLoaded = true;
                    });
                }

                function updateView() {
                    vm.slabFamilyProductTypeView = [];

                    vm.paging.itemCount = 0;

                    // Very carefully figure out the paging situation...
                    for (var i = 0; i < slabFamilyProductTypes.length; i++) {
                        var slabFamilyProductType = slabFamilyProductTypes[i];

                        if (!filteredSlabFamilies || (filteredSlabFamilies[slabFamilyProductType.SlabFamilyId] && filteredSlabFamilies[slabFamilyProductType.SlabFamilyId][slabFamilyProductType.ItemType])) {
                            var slabFamilyProductTypeAdded = false;

                            // See if this goes in the view on its own merits:
                            if (vm.paging.itemCount >= vm.paging.rowsPerPage * (vm.paging.pageNumber - 1) && vm.paging.itemCount < vm.paging.rowsPerPage * vm.paging.pageNumber) {
                                slabFamilyProductType.MasterDataView = [];
                                vm.slabFamilyProductTypeView.push(slabFamilyProductType);
                                slabFamilyProductTypeAdded = true;
                            }
                            vm.paging.itemCount++;

                            // Regardless, start going through the master data, if applicable.  If the parent is on the
                            // previous page but any of its children are on this page, we'll add the parent at that point.
                            if (slabFamilyProductType.isExpanded) {
                                // Apply simple text filter first.
                                var masterData = filterFilter(slabFamilyProductType.MasterData, { "SmartPartNumber": vm.textFilter });

                                for (masterDataIndex = 0; masterDataIndex < masterData.length; masterDataIndex++) {
                                    var masterDatum = masterData[masterDataIndex];

                                    // First, check against filters...
                                    var include = true;
                                    for (var filterProperty in vm.filterPropertyMap) {
                                        if (vm.filterPropertyMap.hasOwnProperty(filterProperty)) {
                                            var filterData = vm.filterPropertyMap[filterProperty];

                                            // Make sure ANY of the ids are selected.  Otherwise, there's no filter.  Since there's no length for objects, we'll just loop and break.
                                            for (var selectedId in filterData.selected) {
                                                if (filterData.selected.hasOwnProperty(selectedId)) {
                                                    if (!filterData.selected[masterDatum[filterData.idColumn]]) {
                                                        include = false;
                                                    }
                                                }
                                                break;
                                            }
                                            if (!include)
                                                break;
                                        }
                                    }

                                    if (include) {
                                        if (vm.paging.itemCount >= vm.paging.rowsPerPage * (vm.paging.pageNumber - 1) && vm.paging.itemCount < vm.paging.rowsPerPage * vm.paging.pageNumber) {
                                            // We're within range of this page.  If we haven't yet added the parent (because it was really on the previous page), add it at this point.
                                            if (!slabFamilyProductTypeAdded) {
                                                slabFamilyProductType.MasterDataView = [];
                                                vm.slabFamilyProductTypeView.push(slabFamilyProductType);
                                                slabFamilyProductTypeAdded = true;
                                            }
                                            slabFamilyProductType.MasterDataView.push(masterDatum);
                                        }
                                        vm.paging.itemCount++;
                                    }
                                }
                            }
                        }
                    }
                }

                var overrideProperties = ["ComponentCost", "DealerMargin", "DistributorMargin", "Multiplier", "AdderCost", "StockStatus", "ListPrice"];

                vm.expandSlabFamilyProductType = function (slabFamilyProductType) {
                    slabFamilyProductType.isExpanded = !slabFamilyProductType.isExpanded;

                    if (!slabFamilyProductType.isPopulated) {
                        priceBookEntryData.getList($stateParams.customerId, slabFamilyProductType.SlabFamilyId, slabFamilyProductType.ProductTypeId).then(function (data) {
                            slabFamilyProductType.MasterData = data;

                            for (i = 0; i < slabFamilyProductType.MasterData.length; i++) {
                                var masterDatum = slabFamilyProductType.MasterData[i];
                                for (j = 0; j < overrideProperties.length; j++) {
                                    var overrideProperty = overrideProperties[j];
                                    if (masterDatum["Override" + overrideProperty] == null)
                                        masterDatum["Override" + overrideProperty] = masterDatum[overrideProperty];
                                }
                                vm.edited(masterDatum);
                            }

                            slabFamilyProductType.isPopulated = true;
                            vm.updateView();
                        });
                    }
                    else
                        vm.updateView();
                }

                vm.edited = function (masterDatum) {
                    masterDatum.IsAnyOverride = false;
                    for (j = 0; j < overrideProperties.length; j++) {
                        var overrideProperty = overrideProperties[j];
                        masterDatum["IsOverride" + overrideProperty] =
                            (masterDatum["Override" + overrideProperty] || masterDatum[overrideProperty]) &&
                            (masterDatum["Override" + overrideProperty] != masterDatum[overrideProperty]);
                        masterDatum.IsAnyOverride = masterDatum.IsAnyOverride || masterDatum["IsOverride" + overrideProperty];
                    }
                }

                vm.openFilterModal = function (filterProperty) {
                    var modal = $uibModal.open({
                        templateUrl: '/App/Modules/PriceBook/Template/priceBookFilterModal.html',
                        controller: 'PriceBookFilterModalController',
                        controllerAs: 'vm',
                        resolve: {
                            filterData: function () {
                                return vm.filterPropertyMap[filterProperty];
                            }
                        },
                        size: 'lg'
                    });

                    modal.result.then(function () {
                        vm.updateFilter();
                    }, function () {
                        vm.updateFilter();
                    });
                }

                vm.updateFilter = function () {
                    vm.dataHasLoaded = false;

                    // Make a smaller version to reduce HTTP traffic.  And also turn selected false into just not selected - for simplicity in updateView.
                    var filterPropertyMap = { "TextFilter": vm.textFilter };
                    for (var filterProperty in vm.filterPropertyMap)
                        if (vm.filterPropertyMap.hasOwnProperty(filterProperty)) {
                            var filterData = vm.filterPropertyMap[filterProperty];
                            filterPropertyMap[filterProperty] = [];
                            for (var id in filterData.selected) {
                                if (filterData.selected.hasOwnProperty(id)) {
                                    if (filterData.selected[id])
                                        filterPropertyMap[filterProperty].push(id);
                                    else
                                        delete filterData.selected[id];
                                }
                            }
                        }

                    return priceBookEntryData.filterSlabFamilies(filterPropertyMap).then(function (data) {
                        filteredSlabFamilies = {};
                        for (var i = 0; i < data.length; i++) {
                            if (!filteredSlabFamilies[data[i].SlabFamilyId])
                                filteredSlabFamilies[data[i].SlabFamilyId] = {}
                            filteredSlabFamilies[data[i].SlabFamilyId][data[i].ItemType] = true;
                        }
                        vm.updateView();
                        vm.dataHasLoaded = true;
                    });
                }

                vm.marginChanged = function (entryDoorMargin) {
                    entryDoorMargin.Multiplier = 1 / (entryDoorMargin.DealerMargin / 100 - (entryDoorMargin.DealerMargin / 100) * (entryDoorMargin.DistributorMargin / 100));
                }

                vm.save = function () {
                    // Need to build this up from scratch in case there were no records in the first place.
                    var distMasterData = [];
                    for (var i = 0; i < slabFamilyProductTypes.length; i++) {
                        var slabFamilyProductType = slabFamilyProductTypes[i];
                        if (slabFamilyProductType.MasterData) {
                            for (var j = 0; j < slabFamilyProductType.MasterData.length; j++) {
                                var masterDatum = slabFamilyProductType.MasterData[j];
                                if (masterDatum.IsAnyOverride || masterDatum.Id) {
                                    if (masterDatum.Id == null) {
                                        masterDatum.Id = '00000000-0000-0000-0000-000000000000';
                                    }
                                    var newDistMasterDatum = {
                                        
                                        Id: masterDatum.Id,
                                        ProductConfigId: masterDatum.ProductConfigId,
                                        CreatedTime: masterDatum.CreatedTime,
                                        CreatedBy: masterDatum.CreatedBy,
                                        IsDelete: !masterDatum.IsAnyOverride
                                    }
                                    for (k = 0; k < overrideProperties.length; k++) {
                                        var overrideProperty = overrideProperties[k];
                                        newDistMasterDatum[overrideProperty] = masterDatum["IsOverride" + overrideProperty] ? masterDatum["Override" + overrideProperty] : null;
                                    }
                                    distMasterData.push(newDistMasterDatum);
                                }
                            }
                        }
                    }

                    return priceBookEntryData.save($stateParams.customerId, distMasterData).then(function (data) {
                        return activate();
                    });
                };

                vm.cancel = function () {
                    return activate();
                };
            }
        ]);
})();