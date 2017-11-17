(function () {
    angular.module("Pricing")
        .controller("FrameCostController", [
            "ItemCostControllerShared", "FrameCostData", "NotificationFactory", "$stateParams", "$filter", "$q",
            function (shared, frameCostData, notification, $stateParams, $filter, $q) {
                var vm = this;
                var filterFilter = $filter('filter');
                vm.isCollapsed = true;
                vm.slabHeights = [];
                var dccSlabFamilies = [];
                vm.dccSlabFamiliesView = [];
                vm.updateView = updateView;
                vm.isEditMode = false;
                vm.isExpanded = {};
                vm.costChanges = [];
                vm.isDirty = false;

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                activate();

                function activate() {
                    vm.isEditMode = false;
                    vm.dataTransferring = true;
                    return frameCostData.getDoorSubAndSideLite($stateParams.customerId)
                        .then(function (data) {
                            var oldDccSlabFamilies = {};
                            for (var oldFam = 0; oldFam < dccSlabFamilies.length; oldFam++) {
                                var dccSlabFamily = dccSlabFamilies[oldFam];
                                oldDccSlabFamilies[dccSlabFamily.FamilyProductType] = dccSlabFamily.isExpanded;
                            }
                            dccSlabFamilies = data.slabFamilyList;
                            vm.slabHeights = data.SlabHeights;
                            for (var i = 0; i < dccSlabFamilies.length; i++) {
                                dccSlabFamilies[i].isExpanded = oldDccSlabFamilies[dccSlabFamilies[i].FamilyProductType];
                                var family = dccSlabFamilies[i];
                                for (var k = 0; k < family.subFamilyList.length; k++) {                                                                 
                                    var subFamily = family.subFamilyList[k];
                                    subFamily.costLookup = {};
                                    for (var j = 0; j < subFamily.GlazeCostList.length; j++) {
                                        var glazeCost = subFamily.GlazeCostList[j];
                                        subFamily.costLookup[glazeCost.HeightId] = glazeCost;
                                    }
                                }  
                            } 
                            vm.costChanges = [];
                            vm.updateView();

                            vm.dataTransferring = false;
                            vm.initialLoadComplete = true;
                        });
                }

                function updateView() {
                    vm.dccSlabFamiliesView = [];
                    for (var upView = 0; upView < dccSlabFamilies.length; upView++) {
                        var dccSlabFamily = dccSlabFamilies[upView];
                        var slabSubFamilyList = filterFilter(dccSlabFamily.subFamilyList, vm.filter);
                        if (slabSubFamilyList.length) {
                            var dccSlabFamilyCopy =
                                angular.extend({},
                                    dccSlabFamily,
                                    { subFamilyList: slabSubFamilyList, original: dccSlabFamily });
                            vm.dccSlabFamiliesView.push(dccSlabFamilyCopy);
                        }
                    }
                }

                vm.fillSlabFamily = function (dccSlabFamily, height, property) {
                    for (var i = 0; i < dccSlabFamily.subFamilyList.length; i++) {
                        var tempSubFamily = dccSlabFamily.subFamilyList[i];
                        for (var j = 0; j < tempSubFamily.GlazeCostList.length; j++) {
                            var tempCost = tempSubFamily.GlazeCostList[j];
                            if (tempCost.HeightId === height.Id)
                            {
                                tempCost[property] = vm.costChanges[height.Id][dccSlabFamily.FamilyProductType][property];
                                 vm.markThatChange(tempSubFamily, height.Id);
                            }
                        }
                    }
                };
                vm.markThatChange = function (slabSubFamily, heightId) {
                    var heightCost = slabSubFamily.costLookup[heightId];
                    if (heightCost.GlazeCost == null) {
                        heightCost.GlazeCost = 0;
                    }
                    if (heightCost.NonGlazeCost == null) {
                        heightCost.NonGlazeCost = 0;
                    }
                    slabSubFamily.costLookup[heightId].changed = true;
                    vm.isDirty = true;
                };

                vm.uiCanExit = function (trans) {
                    var result = shared.uiCanExitWhenDirty(trans, vm.isDirty);
                    return result;
                };

                vm.save = function () {
                    vm.dataTransferring = true;
                    var markedChanges = [];
                    for (var i = 0; i < dccSlabFamilies.length; i++) {
                        var family = dccSlabFamilies[i];
                        for (var j = 0; j < family.subFamilyList.length; j++) {
                            var subFamily = family.subFamilyList[j];
                            for (var k = 0; k < vm.slabHeights.length; k++) {
                                var changedHere = subFamily.costLookup[vm.slabHeights[k].Id];
                                if (changedHere != null){
                                    if (changedHere.changed) {
                                       markedChanges.push({
                                            Id: changedHere.Id,
                                            HeightId: changedHere.HeightId,
                                            SubFamilyId: changedHere.SubFamilyId,
                                            ProductTypeId: changedHere.ProductTypeId,
                                            GlazeCost: changedHere.GlazeCost,
                                            NonGlazeCost: changedHere.NonGlazeCost
                                        })
                                    }

                                }
                            }

                        }
                    }

                    return frameCostData.save($stateParams.customerId, markedChanges).then(function (data) {
                        vm.dataTransferring = false;
                        vm.isDirty = false;
                        notification.saveSuccess();
                        return activate();
                    });
                };

                vm.cancel = function () {
                    vm.costChanges = [];
                    vm.isDirty = false;
                    return activate();
                };
            }
        ]);
})();