(function () {
    angular.module('Pricing')
        .controller('PriceBookEntryController', [
            "SharedService", "PriceBookEntryData", "DistributorData", "NotificationFactory", "$stateParams", "$uibModal", "$filter", "$q",
            function (shared, priceBookEntryData, distributorData, notification, $stateParams, $uibModal, $filter, $q) {
                var vm = this;

                var filterFilter = $filter('filter');

                vm.pageChoices = [250, 500, 1000, 2500];
                vm.paging = { rowsPerPage: 250, pageNumber: 1 }

                var slabFamilyProductTypes;
                var filteredSlabFamilies;
                vm.isExpanded = {};

                vm.updateView = updateView;

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                vm.filterPropertyOrder = ["GlassDesigns", "GlassGridTypes", "GlassLites", "SlabSubFamilies", "SlabStyles"];
                vm.filterPropertyMap = {
                    "GlassDesigns": { idColumn: "GlassDesignId", name: "Glass Design" },
                    "GlassGridTypes": { idColumn: "GlassGridTypeId", name: "Glass Grid Type" },
                    "GlassLites": { idColumn: "GlassLiteId", name: "Glass Lite Count" },
                    "SlabSubFamilies": { idColumn: "SubfamilyId", name: "Sub Family" },
                    "SlabStyles": { idColumn: "SlabStyleId", name: "Door Style" }
                }

                var overrideProperties = ["FrameCost", "DealerMargin", "DistributorMargin", "Multiplier", "AdderCost", "StockStatus", "ListPrice"];

                vm.isDirty = false;

                activate();

                function activate() {
                    vm.dataTransferring = true;
                    vm.isEditMode = false;

                    return $q.all([
                        distributorData.getDistributor($stateParams.customerId).then(function (data) {
                            vm.distributorSteps = data.TypeInd;
                        }),
                        priceBookEntryData.getSetupData().then(function (data) {
                            slabFamilyProductTypes = data.SlabFamilyProductTypes;

                            // Attach the filter lists to the filterPropertyMap
                            for (var filterProperty in data.Filters)
                                if (data.Filters.hasOwnProperty(filterProperty)) {
                                    vm.filterPropertyMap[filterProperty].list = data.Filters[filterProperty];
                                    vm.filterPropertyMap[filterProperty].selected = {};
                                }

                            vm.updateView();

                            vm.dataTransferring = false;
                            vm.initialLoadComplete = true;
                        })
                    ]);
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

                vm.expandSlabFamilyProductType = function (slabFamilyProductType) {
                    slabFamilyProductType.isExpanded = !slabFamilyProductType.isExpanded;

                    if (!slabFamilyProductType.isPopulated) {
                        priceBookEntryData.getList($stateParams.customerId, slabFamilyProductType.SlabFamilyId, slabFamilyProductType.ProductTypeId).then(function (data) {
                            slabFamilyProductType.MasterData = data;

                            for (i = 0; i < slabFamilyProductType.MasterData.length; i++) {
                                var masterDatum = slabFamilyProductType.MasterData[i];
                                masterDatum.isDirty = false;
                                for (j = 0; j < overrideProperties.length; j++) {
                                    var overrideProperty = overrideProperties[j];
                                    masterDatum["IsOverride" + overrideProperty] = (masterDatum["Override" + overrideProperty] != null);
                                    if (!masterDatum["IsOverride" + overrideProperty])
                                        masterDatum["Override" + overrideProperty] = masterDatum[overrideProperty];
                                }
                                updateItem(masterDatum);
                            }

                            slabFamilyProductType.isPopulated = true;
                            vm.updateView();
                        });
                    }
                    else
                        vm.updateView();
                }

                vm.edited = function (masterDatum, overrideProperty) {
                    masterDatum["IsOverride" + overrideProperty] = true;
                    updateItem(masterDatum);
                    masterDatum.isDirty = true;
                    vm.isDirty = true;
                }

                vm.reverted = function (masterDatum, overrideProperty) {
                    masterDatum["IsOverride" + overrideProperty] = false;
                    masterDatum["Override" + overrideProperty] = masterDatum[overrideProperty];
                    updateItem(masterDatum);
                    masterDatum.isDirty = true;
                    vm.isDirty = true;
                }

                // Does some line item calculations and updates override indicators.
                function updateItem(masterDatum) {
                    masterDatum.IsAnyOverride = false;
                    for (j = 0; j < overrideProperties.length; j++)
                        masterDatum.IsAnyOverride = masterDatum.IsAnyOverride || masterDatum["IsOverride" + overrideProperties[j]];

                    // Multiplier.
                    if (!masterDatum.IsOverrideMultiplier) {
                        // Only calculate if we override margins here.  Otherwise, it may be overridden in the margin screen so we should use that.
                        if (masterDatum.IsOverrideDealerMargin || masterDatum.IsOverrideDistributorMargin) {
                            masterDatum.OverrideMultiplier = 1 / (1 - (masterDatum.OverrideDistributorMargin / 100));
                            if (vm.distributorSteps > 1)
                                masterDatum.OverrideMultiplier *= 1 / (1 - (masterDatum.OverrideDealerMargin / 100));
                        }
                        else
                            masterDatum.OverrideMultiplier = masterDatum.Multiplier;
                    }

                    // Calculate list price.
                    if (!masterDatum.IsOverrideListPrice) {
                        // Calculate this every time.  There's no inherited value to fall back to anyway.
                        masterDatum.OverrideListPrice =
                            ((masterDatum.GlazePriceBookCode ? (masterDatum.GlazeCost || 0) : (masterDatum.SlabCost || 0) + (masterDatum.GlassCost || 0) + (masterDatum.ComponentCost || 0))
                                + masterDatum.OverrideFrameCost + masterDatum.OverrideAdderCost)
                                * masterDatum.OverrideMultiplier + (masterDatum.OverrideStockStatus ? 0 : masterDatum.NonStockFee);
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
                    vm.dataTransferring = true;

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
                        vm.dataTransferring = false;
                    });
                }

                vm.uiCanExit = function (trans) {
                    var result = shared.uiCanExitWhenDirty(trans, vm.isDirty);
                    return result;
                };

                vm.save = function () {
                    // Need to build this up from scratch in case there were no records in the first place.
                    vm.dataTransferring = true;
                    var distMasterData = [];
                    for (var i = 0; i < slabFamilyProductTypes.length; i++) {
                        var slabFamilyProductType = slabFamilyProductTypes[i];
                        if (slabFamilyProductType.MasterData) {
                            for (var j = 0; j < slabFamilyProductType.MasterData.length; j++) {
                                var masterDatum = slabFamilyProductType.MasterData[j];
                                if (masterDatum.isDirty) {
                                    if (masterDatum.IsAnyOverride || masterDatum.Id != '00000000-0000-0000-0000-000000000000') {
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
                                        masterDatum.isDirty = false;
                                    }
                                }
                            }
                        }
                    }

                    return priceBookEntryData.save($stateParams.customerId, distMasterData).then(function (data) {
                        vm.dataTransferring = false;
                        notification.saveSuccess();
                        vm.isDirty = false;
                        return activate();
                    });
                };

                vm.cancel = function () {
                    vm.isDirty = false;
                    return activate();
                };
            }
        ]);
})();