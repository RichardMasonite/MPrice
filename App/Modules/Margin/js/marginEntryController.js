(function () {
    angular.module('Pricing')
        .controller('marginEntryController', [
            "SharedService", "EntryDoorMarginData", "DistributorData", "NotificationFactory", "$stateParams", "$filter", "$q",
            function (shared, entryDoorMarginData, distributorData, notification, $stateParams, $filter, $q) {
                var vm = this;

                var filterFilter = $filter('filter');

                var dataStore;
                var slabFamilyProductTypes = [];
                vm.isExpanded = {};

                vm.updateView = updateView;

                vm.glassFamilies = ['Decorative', 'Clear', 'Opaque'];

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                vm.isDirty = false;

                activate();

                function activate() {
                    vm.entryDoorMarginLookup = {};
                    vm.dataTransferring = true;
                    vm.isEditMode = false;

                    return $q.all([
                        distributorData.getDistributor($stateParams.customerId).then(function (data) {
                            vm.distributorSteps = data.TypeInd;
                        }),
                        entryDoorMarginData.get($stateParams.customerId).then(function (data) {
                            var oldSlabFamilyProductTypes = {};
                            for (var j = 0; j < slabFamilyProductTypes.length; j++) {
                                var slabFamilyProductType = slabFamilyProductTypes[j];
                                oldSlabFamilyProductTypes[slabFamilyProductType.SlabFamilyId + slabFamilyProductType.ProductTypeId] = slabFamilyProductType.isExpanded;
                            }

                            slabFamilyProductTypes = [];
                            dataStore = data;
                            var slabFamilyProductType = {};
                            for (var i = 0; i < dataStore.length; i++) {
                                var datum = dataStore[i];
                                if (datum.SlabFamilyId != slabFamilyProductType.SlabFamilyId || datum.ProductTypeId != slabFamilyProductType.ProductTypeId) {
                                    slabFamilyProductType = {
                                        SlabFamilyId: datum.SlabFamilyId,
                                        SlabFamilyName: datum.SlabFamilyName,
                                        ProductTypeId: datum.ProductTypeId,
                                        ProductTypeName: datum.ProductTypeName,
                                        Subfamilies: [],
                                        isExpanded: oldSlabFamilyProductTypes[datum.SlabFamilyId + datum.ProductTypeId]
                                    }
                                    slabFamilyProductTypes.push(slabFamilyProductType);
                                }
                                slabFamilyProductType.Subfamilies.push(datum);
                                checkIsAnyOverride(datum);
                            }

                            vm.updateView();

                            vm.dataTransferring = false;
                            vm.initialLoadComplete = true;
                        })
                    ]);
                }

                function updateView() {
                    vm.slabFamilyProductTypeView = [];

                    for (var i = 0; i < slabFamilyProductTypes.length; i++) {
                        var slabFamilyProductType = slabFamilyProductTypes[i];
                        var slabSubFamilies = filterFilter(slabFamilyProductType.Subfamilies, vm.filter);
                        if (slabSubFamilies.length) {
                            var slabFamilyProductTypeCopy = angular.extend({}, slabFamilyProductType, { Subfamilies: slabSubFamilies, original: slabFamilyProductType });
                            vm.slabFamilyProductTypeView.push(slabFamilyProductTypeCopy);
                        }
                    }
                }

                vm.fillDoorFamily = function (slabFamilyProductType, glassFamily, property) {
                    for (var i = 0; i < slabFamilyProductType.Subfamilies.length; i++) {
                        var slabSubFamily = slabFamilyProductType.Subfamilies[i];
                        slabSubFamily[glassFamily + property] = slabFamilyProductType[glassFamily + property];
                        if (property != 'FamilyMultiplier')
                            vm.marginChanged(slabSubFamily, glassFamily);
                        else
                            vm.multiplierChanged(slabSubFamily, glassFamily);
                    }
                }

                vm.marginChanged = function (slabSubFamily, glassFamily) {
                    slabSubFamily[glassFamily + 'FamilyMultiplier'] = 1 / (1 - slabSubFamily[glassFamily + 'DistributorMargin'] / 100);
                    if (vm.distributorSteps > 1)
                        slabSubFamily[glassFamily + 'FamilyMultiplier'] *= 1 / (1 - slabSubFamily[glassFamily + 'DealerMargin'] / 100);

                    // If above gives nonsense, just zero it out.
                    if (slabSubFamily[glassFamily + 'FamilyMultiplier'] == null || slabSubFamily[glassFamily + 'FamilyMultiplier'] == Infinity) {
                        slabSubFamily[glassFamily + 'FamilyMultiplier'] = 0;
                    }

                    overrideChanged(slabSubFamily, glassFamily, false);
                    valueChanged(slabSubFamily, glassFamily);
                    vm.isDirty = true;
                }

                vm.multiplierChanged = function (slabSubFamily, glassFamily) {
                    if (slabSubFamily[glassFamily + 'FamilyMultiplier'] == null || slabSubFamily[glassFamily + 'FamilyMultiplier'] == Infinity) {
                        slabSubFamily[glassFamily + 'FamilyMultiplier'] = 0;
                    }
                    overrideChanged(slabSubFamily, glassFamily, true);
                    valueChanged(slabSubFamily, glassFamily);
                    vm.isDirty = true;
               }

                function valueChanged(slabSubFamily, glassFamily) {
                    slabSubFamily[glassFamily + 'Updated'] = true;
                }

                function overrideChanged(slabSubFamily, glassFamily, newValue) {
                    for (var i = 0; i < vm.glassFamilies.length; i++) {
                        var currentGlassFamily = vm.glassFamilies[i];
                        if (slabSubFamily[currentGlassFamily + 'DealerMargin'] == null) {
                            slabSubFamily[currentGlassFamily + 'DealerMargin'] = 0;
                        }
                        if (slabSubFamily[currentGlassFamily + 'DistributorMargin'] == null) {
                            slabSubFamily[currentGlassFamily + 'DistributorMargin'] = 0;
                        }
                    }

                    slabSubFamily[glassFamily + 'Override'] = newValue;
                    checkIsAnyOverride(slabSubFamily);
                }

                function checkIsAnyOverride(slabSubFamily) {
                    slabSubFamily.IsAnyOverride = false;
                    for (var i = 0; i < vm.glassFamilies.length; i++) {
                        if (slabSubFamily[vm.glassFamilies[i] + 'Override']) {
                            slabSubFamily.IsAnyOverride = true;
                            break;
                        }
                    }
                }

                vm.uiCanExit = function (trans) {
                    var result = shared.uiCanExitWhenDirty(trans, vm.isDirty);
                    return result;
                };

                vm.save = function () {
                    var dataStoreChanged = [];
                    var distMarginRecord = {};
                    for (var i = 0; i < dataStore.length; i++) {
                        if (dataStore[i].ClearUpdated || dataStore[i].DecorativeUpdated || dataStore[i].OpaqueUpdated) {
                            if (dataStore[i].ClearUpdated) {
                                distMarginRecord = {};
                                distMarginRecord.ProductTypeId = dataStore[i].ProductTypeId;
                                distMarginRecord.SlabFamilyId = dataStore[i].SlabFamilyId;
                                distMarginRecord.SlabSubfamilyId = dataStore[i].SlabSubfamilyId;
                                distMarginRecord.DealerMargin = dataStore[i].ClearDealerMargin;
                                distMarginRecord.DistributorMargin = dataStore[i].ClearDistributorMargin;
                                distMarginRecord.FamilyMultiplier = dataStore[i].ClearFamilyMultiplier;
                                distMarginRecord.Override = dataStore[i].ClearOverride;
                                distMarginRecord.Id = dataStore[i].ClearDistMarginId;
                                distMarginRecord.DesignTypeEnum = 'Clear';
                                dataStoreChanged.push(distMarginRecord);
                            }

                            if (dataStore[i].DecorativeUpdated) {
                                distMarginRecord = {};
                                distMarginRecord.ProductTypeId = dataStore[i].ProductTypeId;
                                distMarginRecord.SlabFamilyId = dataStore[i].SlabFamilyId;
                                distMarginRecord.SlabSubfamilyId = dataStore[i].SlabSubfamilyId;
                                distMarginRecord.DealerMargin = dataStore[i].DecorativeDealerMargin;
                                distMarginRecord.DistributorMargin = dataStore[i].DecorativeDistributorMargin;
                                distMarginRecord.FamilyMultiplier = dataStore[i].DecorativeFamilyMultiplier;
                                distMarginRecord.Override = dataStore[i].DecorativeOverride;
                                distMarginRecord.Id = dataStore[i].DecorativeDistMarginId;
                                distMarginRecord.DesignTypeEnum = 'Decorative';

                                dataStoreChanged.push(distMarginRecord);
                            }

                            if (dataStore[i].OpaqueUpdated) {
                                distMarginRecord = {};
                                distMarginRecord.ProductTypeId = dataStore[i].ProductTypeId;
                                distMarginRecord.SlabFamilyId = dataStore[i].SlabFamilyId;
                                distMarginRecord.SlabSubfamilyId = dataStore[i].SlabSubfamilyId;
                                distMarginRecord.DealerMargin = dataStore[i].OpaqueDealerMargin;
                                distMarginRecord.DistributorMargin = dataStore[i].OpaqueDistributorMargin;
                                distMarginRecord.FamilyMultiplier = dataStore[i].OpaqueFamilyMultiplier;
                                distMarginRecord.Override = dataStore[i].OpaqueOverride;
                                distMarginRecord.Id = dataStore[i].OpaqueDistMarginId;
                                distMarginRecord.DesignTypeEnum = 'Opaque';

                                dataStoreChanged.push(distMarginRecord);
                            }
                        }
                    }

                    vm.dataTransferring = true;
                    return entryDoorMarginData.save($stateParams.customerId, dataStoreChanged).then(function (data) {
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