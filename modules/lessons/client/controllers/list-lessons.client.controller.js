(function () {
  'use strict';

  angular
    .module('lessons')
    .controller('LessonsListController', LessonsListController);

  LessonsListController.$inject = ['$scope', 'Authentication', 'LessonsSearchService'];

  function LessonsListController($scope, Authentication, LessonsSearchService) {

    $scope.authentication = Authentication;

    //these get passed to the backend to filter the search
    $scope.filterOptions = {
      subjectAreas: [],
      setting: [],
      units: []
    };

    //seqrch for lesson, create an array OR created empty array if no items to clear template ng-repeat
    $scope.searchBackend = function(){
      if(!$scope.searchItem){
        //this removes search results if search bar is empty
        $scope.lessons = [];
      }
      else {
        LessonsSearchService.searchDB($scope.searchItem, $scope.filterOptions).then(function(a){
          $scope.lessons = a;
        });
      }
    };

    $scope.filterObjectToggle = function(filterKey, value){
        $scope.filterOptions[filterKey].push(value);
        $scope.searchBackend();
    };

  }
})();
