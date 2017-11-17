(function () {
    angular.module("Pricing")
        .controller('productGlassStockController', [
            "SharedService", "GlassStockData", "NotificationFactory", "$stateParams", "$filter",
            function (shared, glassStockData, notification, $stateParams, $filter) {
                var vm = this;

                var filterFilter = $filter('filter');
                vm.filter = { GlassShapeCode: '' };
                vm.updateView = updateView;
                vm.glassDesignView = [];
                vm.glassDesignData = [];
                vm.isEditMode = false;
                vm.isExpanded = {};
                vm.lookupDict = {};
                vm.lookupObject = {
                    GlassDesignCode: '',
                    GlassShapeCode: '',
                    Id: '',
                    StockItem: false
                }
                vm.convenienceChecked = {};
                vm.convenienceObject = {
                    StockItem: true,
                    LiteralStock: 'stock'
                };
                vm.selectedCustomer = '';
                vm.changesDict = {};
                vm.changeObject = {
                    Id: '',
                    StockItem: false
                }
                vm.saveTheseChanges = [];

                vm.dataTransferring = false;
                vm.initialLoadComplete = false;

                vm.statusCssClass = {
                    'true': 'stock',
                    'false': 'non-stock',
                    'mixed': 'stock-varies'
                }

                vm.isDirty = false;

                activate();

                function activate() {
                    vm.selectedCustomer = $stateParams.customerId;
                    vm.dataTransferring = true;
                    return getGlassDesign().then(function (data) {
                        buildDataStructure();

                        vm.dataTransferring = false;
                        vm.initialLoadComplete = true;
                    });
                }

                vm.toggleCollapse = function (glassDesignId) {
                    vm.isExpanded[glassDesignId] = !vm.isExpanded[glassDesignId];
                }

                function getGlassDesign() {
                    vm.glassDesignHasLoaded = false;
                    return glassStockData.getAllGlassDesign(vm.selectedCustomer)
                        .then(function (data) {
                            vm.glassDesignData = data;
                            vm.glassDesignView = data;
                            vm.glassDesignHasLoaded = true;
                        });
                };


                function buildDataStructure() {
                    for (var i = 0; i < vm.glassDesignData.length; i++) {
                        var glassDesign = vm.glassDesignData[i];
                        for (var j = 0; j < glassDesign.GlassShapeStocks.length; j++) {
                            glassDesign.GlassShapeStocks[j].CustomerId = vm.selectedCustomer;
                        }
                        tempArray = glassDesign.GlassShapeStocks;
                        vm.convenienceChecked[glassDesign.Id] = undefined;
                        for (var innerLoop = 0; innerLoop < tempArray.length; innerLoop++) {
                            var item = tempArray[innerLoop];
                            var tempStock = 'non-stock';
                            if (item.StockItem == true) {
                                tempStock = 'stock'
                            }
                            if (!vm.convenienceChecked[glassDesign.Id])
                                vm.convenienceChecked[glassDesign.Id] = {
                                    StockItem: item.StockItem,
                                    LiteralStock: tempStock
                                }
                            else if (vm.convenienceChecked[glassDesign.Id].StockItem != item.StockItem)
                                vm.convenienceChecked[glassDesign.Id] = {
                                    StockItem: 'mixed',
                                    LiteralStock: 'stock may vary'
                                }
                            vm.lookupDict[item.GlassDesignId + item.GlassShapeId] = {
                                CustomerId: vm.selectedCustomer,
                                GlassDesignCode: item.GlassDesignCode,
                                GlassDesignId: item.GlassDesignId,
                                GlassShapeCode: item.GlassShapeCode,
                                GlassShapeId: item.GlassShapeId,
                                Id: item.Id,
                                StockItem: item.StockItem,
                                OriginalStockItem: item.StockItem,
                                LiteralStock: tempStock,
                                isDirty: false
                            }
                        }
                    }
                };
                /*
                   GlassDesignCode is the PK for the parent and the FK for the child
                   so we can simply loop through the  lookupDict for this value, when
                   we find it,  change the StockItem to be what the parent had put into
                  its ng-model  =>  vm.ConvenienceChecked[parent.GlassDesignCode].StockItem
                  also, have created a vm ==> ONLY  <== property called LiteralStock which
                  has the value of stock or non-stock depending on the value of StockItem
                   and is used as the label for the button face.            
                */
                vm.convenienceCheck = function (glassDesign) {
                    var tempCode = glassDesign.GlassDesignId;
                    var stockLiteral = vm.convenienceChecked[glassDesign.Id].LiteralStock;
                    switch (stockLiteral) {
                        case "stock":
                            vm.convenienceChecked[glassDesign.Id].StockItem = false;
                            vm.convenienceChecked[glassDesign.Id].LiteralStock = 'non-stock';
                            break;
                        default:
                            vm.convenienceChecked[glassDesign.Id].StockItem = true;
                            vm.convenienceChecked[glassDesign.Id].LiteralStock = 'stock';
                            break;
                    };
                    for (var item in vm.lookupDict) {
                        if (vm.lookupDict[item].GlassDesignId == tempCode) {
                            switch (stockLiteral) {
                                case "stock":
                                    vm.lookupDict[item].StockItem = false;
                                    vm.lookupDict[item].LiteralStock = 'non-stock';
                                    break;
                                default:
                                    vm.lookupDict[item].StockItem = true;
                                    vm.lookupDict[item].LiteralStock = 'stock';
                                    break;
                            };
                            vm.lookupDict[item].isDirty = true;
                        }
                    }
                    vm.isDirty = true;
                };

                /*
                 each time a child button ( stock / non-stock ) is pressed this
                 function is called.  it will simply toggle the value of the
                 stock item in the dictionary, and then update the LiteralStockItem
                */
                vm.updateChildStock = function (glassDesign, glassShape) {
                    vm.lookupDict[glassShape.GlassDesignId + glassShape.GlassShapeId].StockItem = !vm.lookupDict[glassShape.GlassDesignId + glassShape.GlassShapeId].StockItem;
                    vm.lookupDict[glassShape.GlassDesignId + glassShape.GlassShapeId].isDirty = true;
                    var tempStock = 'non-stock';
                    if (vm.lookupDict[glassShape.GlassDesignId + glassShape.GlassShapeId].StockItem == true) {
                        tempStock = 'stock'
                    };
                    this.lookupDict[glassShape.GlassDesignId + glassShape.GlassShapeId].LiteralStock = tempStock;

                    // Update convenience status.
                    vm.convenienceChecked[glassDesign.Id] = undefined;

                    for (var i = 0; i < glassDesign.GlassShapeStocks.length; i++) {
                        var item = vm.lookupDict[glassDesign.GlassShapeStocks[i].GlassDesignId + glassDesign.GlassShapeStocks[i].GlassShapeId];
                        if (!vm.convenienceChecked[glassDesign.Id])
                            vm.convenienceChecked[glassDesign.Id] = {
                                StockItem: item.StockItem,
                                LiteralStock: item.LiteralStock
                            }
                        else if (vm.convenienceChecked[glassDesign.Id].StockItem != item.StockItem) {
                            vm.convenienceChecked[glassDesign.Id] = {
                                StockItem: 'mixed',
                                LiteralStock: 'stock may vary'
                            }
                            break;
                        }
                    }
                    vm.isDirty = true;
                };

                vm.uiCanExit = function (trans) {
                    var result = shared.uiCanExitWhenDirty(trans, vm.isDirty);
                    return result;
                };

                /*
                traverses through the lookupDict, removing the LiteralStockItem,
                which is not a Model class property. it then will save the results
                and refresh the current page with the result - without collapsing
                any opened accordions -  finally it will reset the Edit button. 
                */
                vm.save = function () {
                    vm.dataTransferring = true;
                    vm.saveTheseChanges = [];
                    for (var changed in vm.lookupDict) {
                        if (vm.lookupDict[changed].isDirty) {
                            vm.saveTheseChanges.push({
                                DistributorId: vm.lookupDict[changed].CustomerId,
                                GlassDesignCode: vm.lookupDict[changed].GlassDesignCode,
                                GlassDesignId: vm.lookupDict[changed].GlassDesignId,
                                GlassShapeCode: vm.lookupDict[changed].GlassShapeCode,
                                GlassShapeId: vm.lookupDict[changed].GlassShapeId,
                                Id: vm.lookupDict[changed].Id,
                                StockItem: vm.lookupDict[changed].StockItem
                            })
                            vm.lookupDict[changed].isDirty = false;
                        }
                    }
                    if (vm.isEditMode) {
                        vm.isEditMode = !vm.isEditMode;
                    };
                    return glassStockData.saveAllGlassDesign($stateParams.customerId, vm.saveTheseChanges).then(function (data) {
                        vm.dataTransferring = false;
                        notification.saveSuccess();
                        vm.isDirty = false;
                        return activate();
                    }, function () {
                        vm.dataTransferring = false;
                    });
                };

                /*  
                   resets the edit button and refreshes the page with
                   unchanged data from the data source
                */
                vm.cancel = function () {
                    if (vm.isEditMode) {
                        vm.isEditMode = !vm.isEditMode;
                    };
                    vm.changesDict = {};
                    vm.isDirty = false;
                    activate();
                }


                function updateView() {
                    vm.glassDesignView = [];

                    for (var i = 0; i < vm.glassDesignData.length; i++) {
                        var glassDesign = vm.glassDesignData[i];

                        if (glassDesign.GlassDesign.toUpperCase().indexOf(vm.filter.GlassShapeCode.toUpperCase()) > -1) {
                            vm.glassDesignView.push(glassDesign);
                        }
                        else {
                            var glassShapeStocks = filterFilter(glassDesign.GlassShapeStocks, vm.filter);

                            if (glassShapeStocks.length) {
                                var glassDesignCopy = angular.extend({}, glassDesign, { GlassShapeStocks: glassShapeStocks });

                                vm.glassDesignView.push(glassDesignCopy);
                            }
                        }
                    }
                }
            }
        ])
})();