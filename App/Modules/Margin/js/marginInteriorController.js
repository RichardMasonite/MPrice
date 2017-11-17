(function () {
    angular.module('Pricing')
        .controller('marginInteriorController', [
            "InteriorDoorMarginData", "DoorDepthData", "DoorHeightData", "DoorEdgeTypeData", "DoorCoreTypeData", "DoorFamilyData",  "$q",
            function (interiorDoorMarginData, doorDepthData, doorHeightData, doorEdgeTypeData, doorCoreTypeData, doorFamilyData,  $q) {

                    var vm = this;
                    vm.ConvenienceMargins = [];
                    vm.isExpanded = {};
                    vm.isEditMode = false;
                    vm.doorDepths=[];
                    vm.doorHeights = [];
                    vm.selHeightId = '35296123-e47b-4b46-a1a1-02ad31ee813f';
                    vm.doorEdgeTypes=[];
                    vm.doorCoreTypes=[];
                    vm.interiorDoors = [];
                    vm.interiorMargins = [];

                    vm.doorDepthCoreType = [];
                    vm.doorDepthCoreObject = {
                        DepthId: '',
                        CoreName: '',
                        CoreId: '',
                    }


                    vm.lookupDict = {};
                    vm.lookupObject = {
                        HeightId: '',
                        DoorFamilyId: '',
                        DoorEdgeId: '',
                        DoorDepthId: '',
                        DoorCoreTypeId: '',
                        Margin: 0
                    };
                    vm.MarginArray = [];


                    activate();

                    function activate() {
                        $q.all([
                            getDoorDepthData(),
                            getDoorHeightData(),
                            getDoorEdgeTypeData(),
                            getDoorCoreTypeData(),
                            getInteriorDoorData(),
                            getInteriorMargins()
                        ]).then(function (data) {
                            buildDataStructure();
                        });
                       }

                    vm.assignHeight = function (value) {
                        vm.selectedHeight = value;
                    }

                    vm.toggleEditMode = function () {
                        vm.isEditMode = !vm.isEditMode;
                    };
          
                    vm.cancelMode = function () {
                        vm.doorCoreTypeData = [];
                        vm.lookupDict = {};
                        vm.doorDepths = [];
                        buildDataStructure();
                    }

                    vm.toggleCollapse = function (doorFamily) {
                        vm.isExpanded[doorFamily] = !vm.isExpanded[doorFamily];
                    }

                    function getDoorDepthData() {
                        vm.doorDepthHasLoaded = false;
                        return doorDepthData.getDoorDepths()
                            .then(function (data) {
                                var tempDoor = [];
                                var tempBifold = [];
                                var tempDoorPrefix = 'Door ';
                                var tempBifoldPrefix = 'Bifold ';
                                var tempValue = 0;
                                var temp = data;
                                for (var i = 0; i < temp.length; i++) {
                                    tempValue = (temp[i]);                           
                                    tempDoor.push(angular.copy(temp[i]));
                                    tempDoor[i].Depth = tempDoorPrefix + tempValue.Depth;
                                    tempBifold.push(angular.copy(temp[i]));
                                    tempBifold[i].Depth = tempBifoldPrefix + tempValue.Depth;
                                }
                                for (var i = 0; i < tempDoor.length; i++) {
                                    vm.doorDepths.push(tempDoor[i]);
                                }

                                for (var i = 0; i < tempBifold.length; i++) {
                                    vm.doorDepths.push(tempBifold[i]);
                                }
                                vm.doorDepthHasLoaded = true;

                        });                       
                    };

                    function getDoorHeightData() {
                        vm.doorHeightHasLoaded = false;
                        return doorHeightData.getDoorHeights()
                            .then(function (data) {
                                vm.doorHeights = data;
                                vm.doorHeightHasLoaded = true;

                            }); 
                    };

                    function getDoorEdgeTypeData() {
                        vm.doorEdgeTypeHasLoaded = false;
                        return doorEdgeTypeData.getDoorEdgeTypes()
                            .then(function (data) {

                                var desiredEdgeTypes = ['WoodEdge', 'FiberEdge'];
                                var tempData = data;
                                for (var i = 0; i < tempData.length; i++) {
                                    if (desiredEdgeTypes.indexOf(tempData[i].DoorEdge) > -1) {
                                        vm.doorEdgeTypes.push(tempData[i]);
                                        if (vm.doorEdgeTypes.length == desiredEdgeTypes.length) {
                                            break;
                                        }
                                    }
                                }
                                vm.doorEdgeTypeHasLoaded = true;

                            });
                    };

                    function getDoorCoreTypeData() {
                        vm.doorCoreTypeHasLoaded = false;
                        return doorCoreTypeData.getDoorCoreTypes()
                            .then(function (data) {
                                var desiredCoreTypes = ['HC', 'HCE', 'SC', 'SCE'];
                                var tempData = data;
                                for (var i = 0; i < tempData.length; i++) {
                                    if (desiredCoreTypes.indexOf(tempData[i].DoorCoreCode) > -1){
                                        vm.doorCoreTypes.push(tempData[i]);
                                        if (vm.doorCoreTypes.length == desiredCoreTypes.length) {
                                            break;
                                        }
                                    }
                                }
                                vm.doorCoreTypeHasLoaded = true;
                            });
                    };

                    function getInteriorDoorData() {
                        vm.interiorDoorHasLoaded = false;
                        return doorFamilyData.getDoorFamilyByLocationCode(1)
                            .then(function (data) {
                                vm.interiorDoors = data;
                                vm.interiorDoorHasLoaded = true;

                            });
                    };

                    function getInteriorMargins() {
                        vm.interiorMarginHasLoaded = false;
                        return interiorDoorMarginData.getMargins()
                            .then(function (data) {
                                vm.interiorMargins = data;
                                vm.interiorMarginHasLoaded = true;

                            });
                    };

                    function buildDataStructure() {
                        var luDictCnt = 0;
                        vm.lookupObject.HeightName = vm.selHeightId;

                        for (var depthCnt = 0; depthCnt < vm.doorDepths.length; depthCnt++) {
                            var depthId = (vm.doorDepths[depthCnt].Id);
                            vm.lookupObject.DoorDepthId = depthId;
                         
                        for (var coreCnt = 0; coreCnt < vm.doorCoreTypes.length; coreCnt++) {
                            var coreId = (vm.doorCoreTypes[coreCnt].Id);
                            vm.lookupObject.DoorCoreTypeId = coreId;
                            var coreName = (vm.doorCoreTypes[coreCnt].DoorCoreCode);

                            vm.doorDepthCoreType.push({
                                DoorDepthId: depthId,
                                DoorCoreId: coreId,
                                DoorCoreCode: coreName
                            });

                        for (var edgeCnt = 0; edgeCnt < vm.doorEdgeTypes.length; edgeCnt++) {
                            var edgeId = (vm.doorEdgeTypes[edgeCnt].Id);
                            vm.lookupObject.DoorEdgeId = edgeId;

                        for (var familyCnt = 0; familyCnt < vm.interiorDoors.length; familyCnt++) {
                            var familyId = (vm.interiorDoors[familyCnt].Id);
                            vm.lookupObject.DoorFamilyId = familyId;


                            vm.lookupObject.Margin = 0;
                            vm.lookupDict[vm.selHeightId + '|' + familyId+ '|' + depthId + '|' + coreId + '|' + edgeId] = (vm.lookupObject);

                                    }
                               }
                            }

                        }
                        console.log('lookup Table');
                        console.log(vm.lookupObject);

                        for (var i = 0; i < vm.interiorMargins.length; i++) {

                            doorFamilyId     = vm.interiorMargins[i].DoorFamilyId;
                            doorEdgeId       = vm.interiorMargins[i].DoorEdgeId;
                            doorDepthId      = vm.interiorMargins[i].DoorDepthId;
                            doorCoreTypeId   = vm.interiorMargins[i].DoorCoreTypeId;
                            heightId         = vm.selHeightId;
                            margin           = vm.interiorMargins[i].Margin;

                        var keyThis = vm.interiorMargins[i].DoorHeightId
                            + '|' + vm.interiorMargins[i].DoorFamilyId 
                            + '|' + vm.interiorMargins[i].DoorDepthId
                            + '|' + vm.interiorMargins[i].DoorCoreTypeId
                            + '|' + vm.interiorMargins[i].DoorEdgeId  ;
                        //vm.lookupDict[keyThis] = angular.copy(vm.lookupObject);
                        vm.lookupDict[keyThis] = {
                            HeightId:       heightId,
                            DoorFamilyId:   doorFamilyId, 
                            DoorDepthId:    doorDepthId,
                            DoorCoreTypeId: doorCoreTypeId,
                            DoorEdgeId:     doorEdgeId,
                            Margin:         margin

                        };

                        }
                    }






                    vm.updateChildrenMargin = function (coreType, family, edgeType) {
                        // this will only happen when the Convenience Parent is updated
                        // at this point we want to update all child edge type margins 
                        //  with the value specified by the parent
                        var newMargin = vm.ConvenienceMargins[family.Id + '|' + coreType.DoorCoreId + '|' + coreType.DoorDepthId].Margin;

                        if (edgeType == null) {
                            var lookForKey = vm.selHeightId + '|' + family.Id + '|' + coreType.DoorDepthId + '|' + coreType.DoorCoreId;
                            for(var item in vm.lookupDict){
                                if (item.indexOf(lookForKey) > -1) {
                                    var tempObj = vm.lookupDict[item];
                                    tempObj.Margin = newMargin;
                                    vm.lookupDict[item] = tempObj;
                                }                               
                            }

                        }
                        else  //  this from the child and we have the complete key
                        {
                            var lookForKey = vm.selHeightId + '|' + family.Id + '|' + coreType.DoorDepthId + '|' + coreType.DoorCoreId + '|' + edgeType.edgeId;
                            var tempObj = vm.lookupDict[lookForKey];
                            tempObj.Margin = newMargin;
                            vm.lookupDict[lookForKey] = tempObj;
                        }
                        
                     //   alert('We outa here');
                        //var keyThis = vm.interiorMargins[i].DoorHeightId
                        //    + vm.interiorMargins[i].DoorFamilyId
                        //    + vm.interiorMargins[i].DoorEdgeId
                        //    + vm.interiorMargins[i].DoorDepthId
                        //    + vm.interiorMargins[i].DoorCoreTypeId;
                        //vm.lookupDict[keyThis] = angular.copy(vm.lookupObject);

                    }


            }]
        );
})();