// Karma configuration
// Generated on Fri Aug 25 2017 23:08:22 GMT-0400 (Eastern Daylight Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        './Scripts/angular/angular.js',
        './Scripts/angular/angular-resource.js',
        './Scripts/angular/angular-animate.js',
        './Scripts/angular/angular-ui-router.js',
        './Scripts/angular/angular-sanitize.js',
        './Scripts/angular-paste.js',
        './Scripts/angular-ui/ui-bootstrap-tpls-2.5.0.js',
        './Scripts/angular/ui-router-tabs.js',
        './Scripts/ng-sortable.js',
        './node_modules/angular-mocks/angular-mocks.js',
        './App/testGlobals.js',
        './App/app.js',
        './App/Controls/mtwidgets.js',
        './App/Shared/itemCostControllerShared.js',
        './App/Shared/itemCostControllerShared.spec.js',
        './App/Services/slabStockData.js',
        './App/Services/doorWidthData.js',
        './App/Services/itemCostData.js',
        './App/Services/slabFamilyStyleHeightData.js',
        './App/Modules/Product/js/productSlabStockController.js',
        './App/Modules/Product/js/productSlabStockController.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
