(function () {
    angular.module("Pricing")
        .controller('productSlabStockController', [
            "SharedService", "SlabStockData", "SlabFamilyStyleHeightData", "DoorWidthData", "NotificationFactory", "$q", "$stateParams", "$filter",
            function (shared, slabStockData, slabFamilyStyleHeightData, doorWidthData, notification, $q, $stateParams, $filter) {
                var vm = this;

                var filterFilter = $filter('filter');

                var slabFamilyStyleHeightTree;

                var stockStatuses = {
                    stock: { text: 'stock', value: true, next: 'nonstock', cssClass: 'stock' },
                    nonstock: { text: 'non-stock', value: false, next: 'stock', cssClass: 'non-stock' },
                    mixed: { text: 'stock may vary', value: null, next: 'stock', cssClass: 'stock-varies' }
                }
                var statusFromValue = { false: stockStatuses.nonstock, true: stockStatuses.stock }

                vm.stockStatuses = stockStatuses;
                vm.statusFromValue = statusFromValue;

                vm.updateView = updateView;

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                vm.isDirty = false;

                activate();

                function activate() {
                    vm.slabStockLookup = {};
                    vm.dataTransferring = true;
                    vm.isEditMode = false;

                    return $q.all([
                        slabStockData.get($stateParams.customerId)
                    ]).then(function (data) {
                        slabFamilyStyleHeightTree = data[0].SlabStockLeftSideDataList;
                        vm.doorWidths = data[0].SlabWidthList;

                        for (var i = 0; i < slabFamilyStyleHeightTree.length; i++) {
                            var slabFamily = slabFamilyStyleHeightTree[i];
                            slabFamily.fill = {}

                            for (var j = 0; j < slabFamily.DoorSubFamilies.length; j++) {
                                var subFamily = slabFamily.DoorSubFamilies[j];
                                subFamily.parent = slabFamily;
                                subFamily.fill = {}

                                for (var k = 0; k < subFamily.Styles.length; k++) {
                                    var style = subFamily.Styles[k];
                                    style.parent = subFamily;
                                    style.fill = {}

                                    for (var m = 0; m < style.Heights.length; m++) {
                                        var height = style.Heights[m];
                                        height.parent = style;
                                        height.widthLookup = {}
                                        height.Widths.forEach(function (obj) { obj.isDirty = false; });
                                        for (var n = 0; n < height.Widths.length; n++) {
                                            var width = height.Widths[n];
                                            height.widthLookup[width.Id] = width.StockInd;

                                            if (!style.fill[width.Id])
                                                style.fill[width.Id] = statusFromValue[width.StockInd];
                                            else if (style.fill[width.Id].value != width.StockInd)
                                                style.fill[width.Id] = stockStatuses.mixed;
                                            if (!subFamily.fill[width.Id])
                                                subFamily.fill[width.Id] = style.fill[width.Id];
                                            else if (subFamily.fill[width.Id] != style.fill[width.Id])
                                                subFamily.fill[width.Id] = stockStatuses.mixed;
                                            if (!slabFamily.fill[width.Id])
                                                slabFamily.fill[width.Id] = subFamily.fill[width.Id];
                                            else if (slabFamily.fill[width.Id] != subFamily.fill[width.Id])
                                                slabFamily.fill[width.Id] = stockStatuses.mixed;
                                        }
                                    }
                                }
                            }
                        }

                        vm.updateView();

                        vm.dataTransferring = false;
                        vm.initialLoadComplete = true;
                    });
                }

                function updateView() {
                    vm.slabFamilyStyleHeightView = [];

                    for (var i = 0; i < slabFamilyStyleHeightTree.length; i++) {
                        var slabFamilyProductType = slabFamilyStyleHeightTree[i];
                        var doorSubFamilies = filterFilter(slabFamilyProductType.DoorSubFamilies, vm.filter);
                        if (doorSubFamilies.length) {
                            var slabFamilyProductTypeCopy = angular.extend({}, slabFamilyProductType, { DoorSubFamilies: doorSubFamilies, original: slabFamilyProductType });
                            vm.slabFamilyStyleHeightView.push(slabFamilyProductTypeCopy);
                        }
                    }
                }

                // Fill from here down.
                vm.fillDoorFamily = function (slabFamilyProductType, widthId, newValue) {
                    slabFamilyProductType.fill[widthId] = newValue;
                    for (var i = 0; i < slabFamilyProductType.DoorSubFamilies.length; i++) {
                        var doorSubFamily = slabFamilyProductType.DoorSubFamilies[i];
                        doorSubFamily.fill[widthId] = newValue;
                        vm.fillDoorSubFamily(doorSubFamily, widthId, newValue, true);
                    }
                }

                // Filling up, end here.
                function updateDoorFamilyFill(slabFamilyProductType, widthId) {
                    slabFamilyProductType.fill[widthId] = undefined;
                    for (var subIndex = 0; subIndex < slabFamilyProductType.DoorSubFamilies.length; subIndex++) {
                        var subFamily = slabFamilyProductType.DoorSubFamilies[subIndex];

                        if (subFamily.fill[widthId]) {
                            if (!slabFamilyProductType.fill[widthId])
                                slabFamilyProductType.fill[widthId] = subFamily.fill[widthId];
                            else if (slabFamilyProductType.fill[widthId] != subFamily.fill[widthId]) {
                                slabFamilyProductType.fill[widthId] = stockStatuses.mixed;
                                break;
                            }
                        }
                    }
                }

                // Fill from here down, and possibly fill up as well.
                vm.fillDoorSubFamily = function (doorSubFamily, widthId, newValue, fillDownOnly) {
                    doorSubFamily.fill[widthId] = newValue;
                    for (var i = 0; i < doorSubFamily.Styles.length; i++) {
                        var doorStyle = doorSubFamily.Styles[i];
                        doorStyle.fill[widthId] = newValue;
                        vm.fillDoorStyle(doorStyle, widthId, newValue, true);
                    }
                    if (!fillDownOnly)
                        updateDoorFamilyFill(doorSubFamily.parent, widthId);
                }

                // Fill up from here.
                function updateDoorSubFamilyFill(subFamily, widthId) {
                    subFamily.fill[widthId] = undefined;

                    for (var styleIndex = 0; styleIndex < subFamily.Styles.length; styleIndex++) {
                        var style = subFamily.Styles[styleIndex];

                        if (style.fill[widthId]) {
                            if (!subFamily.fill[widthId])
                                subFamily.fill[widthId] = style.fill[widthId];
                            else if (subFamily.fill[widthId] != style.fill[widthId]) {
                                subFamily.fill[widthId] = stockStatuses.mixed;
                                break;
                            }
                        }
                    }

                    updateDoorFamilyFill(subFamily.parent, widthId);
                }

                vm.fillDoorStyle = function (doorStyle, widthId, newValue, fillDownOnly) {
                    doorStyle.fill[widthId] = newValue;
                    for (var i = 0; i < doorStyle.Heights.length; i++) {
                        var doorHeight = doorStyle.Heights[i];
                        var stockValue = doorHeight.widthLookup[widthId];
                        if (statusFromValue[stockValue])
                            vm.setStock(doorHeight, widthId, newValue.value, true);
                    }
                    if (!fillDownOnly)
                        updateDoorSubFamilyFill(doorStyle.parent, widthId);
                }

                // Fill up from here.
                function updateDoorStyleFill(style, widthId) {
                    style.fill[widthId] = undefined;

                    for (var heightIndex = 0; heightIndex < style.Heights.length; heightIndex++) {
                        var height = style.Heights[heightIndex];

                        var stockValue = height.widthLookup[widthId];
                        if (statusFromValue[stockValue]) {
                            if (!style.fill[widthId])
                                style.fill[widthId] = statusFromValue[stockValue];
                            else if (style.fill[widthId].value != stockValue) {
                                style.fill[widthId] = stockStatuses.mixed;
                                break;
                            }
                        }
                    }

                    updateDoorSubFamilyFill(style.parent, widthId);
                }

                // Fill down ends here, possibly fill up as well.
                vm.setStock = function (doorHeight, widthId, newValue, fillDownOnly) {
                    doorHeight.widthLookup[widthId] = newValue;
                    for (var i = 0; i < doorHeight.Widths.length; i++) {
                        if (doorHeight.Widths[i].Id == widthId) {
                            doorHeight.Widths[i].isDirty = true;
                            break;
                        }
                    }
                    if (!fillDownOnly)
                        updateDoorStyleFill(doorHeight.parent, widthId);
                    vm.isDirty = true;
                }

                vm.uiCanExit = function (trans) {
                    var result = shared.uiCanExitWhenDirty(trans, vm.isDirty);
                    return result;
                };

                vm.save = function () {
                    vm.dataTransferring = true;
                    var slabStock = [];
                    for (var i = 0; i < slabFamilyStyleHeightTree.length; i++) {
                        var slabFamily = slabFamilyStyleHeightTree[i];
                        for (var j = 0; j < slabFamily.DoorSubFamilies.length; j++) {
                            var subFamily = slabFamily.DoorSubFamilies[j];
                            for (var k = 0; k < subFamily.Styles.length; k++) {
                                var style = subFamily.Styles[k];
                                for (var m = 0; m < style.Heights.length; m++) {
                                    var height = style.Heights[m];
                                    for (var n = 0; n < height.Widths.length; n++) {
                                        var width = height.Widths[n];
                                        if (width.isDirty) {
                                            slabStock.push({
                                                Id: width.DistSlabStockId,
                                                ProductTypeId: slabFamily.ProductTypeId,
                                                SubFamilyId: subFamily.Id,
                                                SlabStyleId: style.Id,
                                                SlabHeightId: height.Id,
                                                SlabWidthId: width.Id,
                                                StockInd: height.widthLookup[width.Id]
                                            });
                                            width.isDirty = false;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    return slabStockData.save($stateParams.customerId, slabStock).then(function (data) {
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
        ])
})();