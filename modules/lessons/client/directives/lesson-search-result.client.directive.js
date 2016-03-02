(function() {
  'use strict';

  /* jshint -W098 */
  angular
    .module('lessons')
    .directive('librarySearchResult', function() {
      return {
        restrict: 'AE',
        templateUrl: 'modules/lessons/client/views/lesson-search-result.client.view.html',
        link: link,
        scope: {
          title: '@',
          classPeriod: '@',
          setting: '@',
          unit: '@',
          summary: '@',
          subjectAreas: '='
        },
        replace: true
      };

      function link(scope, element) {
        scope.returnHeaderClass = function(inputUnit) {
          //TODO - tie this in to unit service
          /* jshint ignore:start *//*eslint-disable */
          return inputUnit === 'Field'  ? 'unit-blue' :
                 inputUnit === 'Action' ? 'unit-red'  :
                                          'unit-green';
          /*eslint-enable *//* jshint ignore:end */
        };
      }
    });
})();
