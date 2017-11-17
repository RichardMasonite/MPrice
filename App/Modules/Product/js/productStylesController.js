(function () {
    angular.module("Pricing")
        .controller('ProductStylesController', [
            "SharedService", "ProductStyleData", "NotificationFactory", "$stateParams", "$filter", "$q",
            function (shared, productStyleData, notification, $stateParams, $filter, $q) {
                var vm = this;

                var slabFamilies;

                var filterFilter = $filter('filter');

                vm.updateView = updateView;

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                vm.isDirty = false;

                activate();

                function activate() {
                    vm.isEditMode = false;
                    vm.dataTransferring = true;

                    return $q.all([
                        productStyleData.getSlabFamilies(),
                        productStyleData.getSlabHeights()
                    ]).then(function (data) {
                        slabFamilies = data[0];
                        vm.slabHeights = data[1];
                        vm.updateView();

                        vm.dataTransferring = false;
                        vm.initialLoadComplete = true;
                    });
                }

                function updateView() {
                    vm.slabFamilyView = [];

                    for (var i = 0; i < slabFamilies.length; i++) {
                        var slabFamily = slabFamilies[i];
                        var filteredSubfamilies = filterFilter(slabFamily.Subfamilies, vm.filter);
                        if (filteredSubfamilies.length) {
                            var slabFamilyCopy = angular.extend({}, slabFamily, { Subfamilies: filteredSubfamilies, original: slabFamily });
                            vm.slabFamilyView.push(slabFamilyCopy);
                        }
                    }
                }

                vm.expandSubfamily = function (subfamily) {
                    subfamily.isExpanded = !subfamily.isExpanded;

                    if (!subfamily.isPopulated) {
                        productStyleData.getProductStyles($stateParams.customerId, subfamily.Id).then(function (data) {
                            for (var i = 0; i < data.length; i++) {
                                var productStyle = data[i];

                                // Convenience cells...
                                productStyle.heights = [];
                                for (var n = 0; n < vm.slabHeights.length; n++) {
                                    // Use object first for uniqueness.  Change to an array at the end for the view.
                                    productStyle.heights.push({ slabStyleChoicesObject: {}, slabStyleChoices: [] });
                                }

                                for (var j = 0; j < productStyle.Widths.length; j++) {
                                    var productStyleWidth = productStyle.Widths[j];

                                    // This will override the productStyleWidth's Heights afterwards, once it's filled in every possible height.
                                    var newHeights = [];

                                    // For each possible height...
                                    for (var k = 0; k < vm.slabHeights.length; k++) {
                                        var possibleHeight = vm.slabHeights[k];
                                        var thisHeight = { invalid: true };

                                        // Convenience cell...
                                        var productStyleHeight = productStyle.heights[k];

                                        // See if the height is in the data set at all.  If not, this is an invalid combination.
                                        for (var m = 0; m < productStyleWidth.Heights.length; m++) {
                                            var productStyleWidthHeight = productStyleWidth.Heights[m];
                                            if (productStyleWidthHeight.SlabHeightID == possibleHeight.Id) {
                                                // Found it, mark it for re-addition to the Heights collection.
                                                thisHeight = productStyleWidthHeight;

                                                if (thisHeight.SlabStyleChoices.length == 1) {
                                                    thisHeight.SelectedSlabStyleID = thisHeight.SlabStyleChoices[0].Id;
                                                    thisHeight.selectedSlabStyle = thisHeight.SlabStyleChoices[0];
                                                    thisHeight.originalSlabStyle = thisHeight.selectedSlabStyle;
                                                }
                                                // While we're here, let's try to set selectedSlabStyle
                                                else {
                                                    for (var n = 0; n < thisHeight.SlabStyleChoices.length; n++) {
                                                        var slabStyleChoice = thisHeight.SlabStyleChoices[n];
                                                        if (slabStyleChoice.Id == thisHeight.SelectedSlabStyleID) {
                                                            thisHeight.selectedSlabStyle = slabStyleChoice;
                                                            thisHeight.originalSlabStyle = thisHeight.selectedSlabStyle;
                                                        }
                                                        // Convenience cell...  Because the door style choices are actually different identical objects, we don't want to reset this if it's already set.  It will confuse the ng-options.
                                                        if (!productStyleHeight.slabStyleChoicesObject[slabStyleChoice.Id])
                                                            productStyleHeight.slabStyleChoicesObject[slabStyleChoice.Id] = slabStyleChoice;
                                                    }

                                                    // If we didn't select a height above, add and set the Please Select item to this dropdown.
                                                    if (!thisHeight.selectedSlabStyle) {
                                                        thisHeight.selectedSlabStyle = { StyleName: '---Please Select---', select: true };
                                                        thisHeight.SlabStyleChoices.unshift(thisHeight.selectedSlabStyle);
                                                    }
                                                }

                                                // If convenience is already Please Select, leave it alone.  Otherwise....
                                                if (!productStyleHeight.selectedSlabStyle || !productStyleHeight.selectedSlabStyle.select) {
                                                    // If this height is Please Select, set convenience likewise.
                                                    if (thisHeight.selectedSlabStyle.select) {
                                                        productStyleHeight.selectedSlabStyle = { StyleName: '---Please Select---', select: true };

                                                        // Push this now just so it's first.
                                                        productStyleHeight.slabStyleChoices = [productStyleHeight.selectedSlabStyle];
                                                    }
                                                    // First time through, just set it.
                                                    else if (!productStyleHeight.selectedSlabStyle) {
                                                        // See above: we'll do it this way because the door style choices are actually different identical objects and ng-options is prone to getting confused.  This assures that the
                                                        // select's ng-model is one of the options.
                                                        productStyleHeight.selectedSlabStyle = productStyleHeight.slabStyleChoicesObject[thisHeight.selectedSlabStyle.Id];
                                                    }
                                                    // Not the first time and it's different so set as Varies.
                                                    else if (productStyleHeight.selectedSlabStyle.Id != thisHeight.selectedSlabStyle.Id) {
                                                        productStyleHeight.selectedSlabStyle = { StyleName: 'Source Slab Varies', varies: true };

                                                        // Push this now so it will always be first.
                                                        productStyleHeight.slabStyleChoices = [productStyleHeight.selectedSlabStyle];
                                                    }
                                                    // Else it's not the first time through but it's the same so leave well enough alone.
                                                }
                                                break;
                                            }
                                        }

                                        newHeights.push(thisHeight);
                                    }

                                    productStyleWidth.Heights = newHeights;
                                }

                                // Turn convenience object into an array because it's easier on the view.
                                for (var n = 0; n < vm.slabHeights.length; n++) {
                                    var productStyleHeight = productStyle.heights[n];
                                    for (var slabStyleChoiceId in productStyleHeight.slabStyleChoicesObject) {
                                        if (productStyleHeight.slabStyleChoicesObject.hasOwnProperty(slabStyleChoiceId)) {
                                            productStyleHeight.slabStyleChoices.push(productStyleHeight.slabStyleChoicesObject[slabStyleChoiceId]);
                                        }
                                    }
                                }
                            }

                            subfamily.ProductStyles = data;
                            subfamily.isPopulated = true;
                            vm.updateView();
                        });
                    }
                    else
                        vm.updateView();
                }

                vm.fill = function (productStyle, heightIndex) {
                    var productStyleHeight = productStyle.heights[heightIndex];
                    if (productStyleHeight.selectedSlabStyle) {
                        for (var j = 0; j < productStyle.Widths.length; j++) {
                            var productStyleWidthHeight = productStyle.Widths[j].Heights[heightIndex];
                            if (!productStyleWidthHeight.invalid) {
                                for (var n = 0; n < productStyleWidthHeight.SlabStyleChoices.length; n++) {
                                    var slabStyleChoice = productStyleWidthHeight.SlabStyleChoices[n];
                                    if (slabStyleChoice.Id == productStyleHeight.selectedSlabStyle.Id) {
                                        productStyleWidthHeight.selectedSlabStyle = slabStyleChoice;

                                        // Once set, the non-choice can be removed if applicable...
                                        if (productStyleWidthHeight.SlabStyleChoices[0].select)
                                            productStyleWidthHeight.SlabStyleChoices.shift();
                                        break;
                                    }
                                }
                            }
                        }
                        vm.isDirty = true;
                    }

                    // Once set, the non-choice can be removed if applicable...
                    if (!productStyleHeight.slabStyleChoices[0].Id)
                        productStyleHeight.slabStyleChoices.shift();
                }

                vm.productStyleChanged = function (productStyleWidthHeight, productStyle, heightIndex) {
                    vm.isDirty = true;
                    var productStyleHeight = productStyle.heights[heightIndex];

                    // Once set, the non-choice can be removed if applicable...
                    if (productStyleWidthHeight.SlabStyleChoices[0].select)
                        productStyleWidthHeight.SlabStyleChoices.shift();

                    // Determine parent convenience cell value.  Reset by default.
                    productStyleHeight.selectedSlabStyle = {};

                    for (var j = 0; j < productStyle.Widths.length; j++) {
                        var productStyleWidthHeight = productStyle.Widths[j].Heights[heightIndex];
                        // Skip if it's invalid entirely or if there's only one choice anyway.
                        if (!productStyleWidthHeight.invalid && productStyleWidthHeight.SlabStyleChoices.length > 1) {
                            // If this child cell has a value...
                            if (productStyleWidthHeight.selectedSlabStyle.Id) {
                                // If the parent isn't already set to Varies...
                                if (!productStyleHeight.selectedSlabStyle.varies) {
                                    // If the parent has no value at all, i.e. this is our first time through.  Just initialize to the first child's value.
                                    if (!productStyleHeight.selectedSlabStyle.Id) {
                                        productStyleHeight.selectedSlabStyle = productStyleHeight.slabStyleChoicesObject[productStyleWidthHeight.selectedSlabStyle.Id];
                                    }
                                    // If the parent already has a value but this next child is different, just set the parent to Varies....
                                    else if (productStyleHeight.selectedSlabStyle.Id != productStyleWidthHeight.selectedSlabStyle.Id) {
                                        // Clear out the top non-choice if applicable.
                                        if (!productStyleHeight.slabStyleChoices[0].Id)
                                            productStyleHeight.slabStyleChoices.shift();
                                        productStyleHeight.selectedSlabStyle = { StyleName: 'Source Slab Varies', varies: true };
                                        productStyleHeight.slabStyleChoices.unshift(productStyleHeight.selectedSlabStyle);
                                    }
                                }
                            }
                            // If this child doesn't have a value, then the parent should just be Please Select and be done with the whole thing.
                            else {
                                // Clear out the top non-choice if applicable.
                                if (!productStyleHeight.slabStyleChoices[0].Id)
                                    productStyleHeight.slabStyleChoices.shift();
                                productStyleHeight.selectedSlabStyle = { StyleName: '---Please Select---', select: true };
                                productStyleHeight.slabStyleChoices.unshift(productStyleHeight.selectedSlabStyle);
                                break;
                            }
                        }
                    }
                };

                vm.uiCanExit = function (trans) {
                    var result = shared.uiCanExitWhenDirty(trans, vm.isDirty);
                    return result;
                };

                vm.save = function () {
                    vm.dataTransferring = true;
                    var distCompStyles = [];
                    for (var i = 0; i < slabFamilies.length; i++) {
                        var slabFamily = slabFamilies[i];
                        for (var j = 0; j < slabFamily.Subfamilies.length; j++) {
                            var subfamily = slabFamily.Subfamilies[j];
                            if (subfamily.ProductStyles) {
                                for (var k = 0; k < subfamily.ProductStyles.length; k++) {
                                    var productStyle = subfamily.ProductStyles[k];
                                    for (var m = 0; m < productStyle.Widths.length; m++) {
                                        var productStyleWidth = productStyle.Widths[m];
                                        for (var n = 0; n < productStyleWidth.Heights.length; n++) {
                                            var productStyleWidthHeight = productStyleWidth.Heights[n];
                                            if (productStyleWidthHeight.selectedSlabStyle && productStyleWidthHeight.selectedSlabStyle.Id &&
                                                (productStyleWidthHeight.Id == '00000000-0000-0000-0000-000000000000' || productStyleWidthHeight.selectedSlabStyle != productStyleWidthHeight.originalSlabStyle)) {
                                                distCompStyles.push({
                                                    Id: productStyleWidthHeight.Id,
                                                    SlabHeightID: productStyleWidthHeight.SlabHeightID,
                                                    SlabWidthID: productStyleWidth.SlabWidthID,
                                                    SlabStyleID: productStyleWidthHeight.selectedSlabStyle.Id,
                                                    ProductStyleSubfamilyID: productStyleWidthHeight.ProductStyleSubfamilyID,
                                                    CreatedTime: productStyleWidthHeight.CreatedTime,
                                                    CreatedBy: productStyleWidthHeight.CreatedBy
                                                })
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    return productStyleData.save($stateParams.customerId, distCompStyles).then(function (data) {
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