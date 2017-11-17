describe('ItemCostControllerShared service', function () {
    var ItemCostControllerShared;
    var stateParams;

    beforeEach(angular.mock.module('Pricing'));

    beforeEach(inject(function (_ItemCostControllerShared_, $stateParams) {
        ItemCostControllerShared = _ItemCostControllerShared_;
        stateParams = $stateParams;
    }));

    it('should exist', function () {
        expect(ItemCostControllerShared).toBeDefined();
    });

    describe('.isDirty()', function () {
        it('should exist', function () {
            expect(ItemCostControllerShared.isDirty).toBeDefined();
        });

        it('should return false if nothing is passed in', function () {
            expect(ItemCostControllerShared.isDirty()).toBeFalsy();
        })

        it('should return false if an empty array is passed in', function () {
            expect(ItemCostControllerShared.isDirty([])).toBeFalsy();
        })

        it('should return false if all of the statuses are "Unchanged"', function () {
            expect(ItemCostControllerShared.isDirty([
                { status: 'Unchanged' },
                { status: 'Unchanged' },
                { status: 'Unchanged' },
                { status: 'Unchanged' },
                { status: 'Unchanged' }
            ])).toBeFalsy();
        })

        it('should return true if one of the statuses is not "Unchanged"', function () {
            expect(ItemCostControllerShared.isDirty([
                { status: 'Unchanged' },
                { status: 'Unchanged' },
                { status: 'Unchanged' },
                { status: 'New' },
                { status: 'Unchanged' }
            ])).toBeTruthy();
        })

        it('should return true if multiple statuses are not "Unchanged"', function () {
            expect(ItemCostControllerShared.isDirty([
                { status: 'Pending Deletion' },
                { status: 'Unchanged' },
                { status: 'Unchanged' },
                { status: 'New' },
                { status: 'Unchanged' }
            ])).toBeTruthy();
        })
    });

    describe('.getFilteredSortedItemCosts()', function () {
        it('should exist', function () {
            expect(ItemCostControllerShared.getFilteredSortedItemCosts).toBeDefined();
        });

        //it('should return false if nothing is passed in', function () {
        //    expect(ItemCostControllerShared.isDirty()).toBeFalsy();
        //})

        //it('should return false if an empty array is passed in', function () {
        //    expect(ItemCostControllerShared.isDirty([])).toBeFalsy();
        //})

        //it('should return false if all of the statuses are "Unchanged"', function () {
        //    expect(ItemCostControllerShared.isDirty([
        //        { status: 'Unchanged' },
        //        { status: 'Unchanged' },
        //        { status: 'Unchanged' },
        //        { status: 'Unchanged' },
        //        { status: 'Unchanged' }
        //    ])).toBeFalsy();
        //})

        //it('should return true if one of the statuses is not "Unchanged"', function () {
        //    expect(ItemCostControllerShared.isDirty([
        //        { status: 'Unchanged' },
        //        { status: 'Unchanged' },
        //        { status: 'Unchanged' },
        //        { status: 'New' },
        //        { status: 'Unchanged' }
        //    ])).toBeTruthy();
        //})

        //it('should return true if multiple statuses are not "Unchanged"', function () {
        //    expect(ItemCostControllerShared.isDirty([
        //        { status: 'Pending Deletion' },
        //        { status: 'Unchanged' },
        //        { status: 'Unchanged' },
        //        { status: 'New' },
        //        { status: 'Unchanged' }
        //    ])).toBeTruthy();
        //})
    });
});