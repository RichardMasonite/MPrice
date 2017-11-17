describe('productSlabStockController', function () {
    var $controller;
    var productSlabStockController;

    beforeEach(angular.mock.module('Pricing'));

    beforeEach(inject(function (_$controller_) {
        $controller = _$controller_;
        productSlabStockController = $controller('productSlabStockController', {});
    }));

    it('should exist', function () {
        expect(productSlabStockController).toBeDefined();
    });

    describe('.fillDoorFamily()', function () {
        it('should exist', function () {
            expect(productSlabStockController.fillDoorFamily).toBeDefined();
        });

    //    it('should return false if nothing is passed in', function () {
    //        expect(ItemCostControllerShared.isDirty()).toBeFalsy();
    //    })

    //    it('should return false if an empty array is passed in', function () {
    //        expect(ItemCostControllerShared.isDirty([])).toBeFalsy();
    //    })

    //    it('should return false if all of the statuses are "Unchanged"', function () {
    //        expect(ItemCostControllerShared.isDirty([
    //            { status: 'Unchanged' },
    //            { status: 'Unchanged' },
    //            { status: 'Unchanged' },
    //            { status: 'Unchanged' },
    //            { status: 'Unchanged' }
    //        ])).toBeFalsy();
    //    })

    //    it('should return true if one of the statuses is not "Unchanged"', function () {
    //        expect(ItemCostControllerShared.isDirty([
    //            { status: 'Unchanged' },
    //            { status: 'Unchanged' },
    //            { status: 'Unchanged' },
    //            { status: 'New' },
    //            { status: 'Unchanged' }
    //        ])).toBeTruthy();
    //    })

    //    it('should return true if multiple statuses are not "Unchanged"', function () {
    //        expect(ItemCostControllerShared.isDirty([
    //            { status: 'Pending Deletion' },
    //            { status: 'Unchanged' },
    //            { status: 'Unchanged' },
    //            { status: 'New' },
    //            { status: 'Unchanged' }
    //        ])).toBeTruthy();
    //    })
    });
});