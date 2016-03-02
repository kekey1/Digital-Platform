(function() {
  'use strict';

  angular
    .module('lessons.services')
    .factory('LessonsService', LessonsService)
    .factory('LessonsSearchService', LessonsSearchService);

  LessonsService.$inject = ['$resource'];
  LessonsSearchService.$inject = ['$q', '$http'];

  function LessonsService($resource) {
      return $resource('api/lessons/:lessonId', {
        lessonId: '@_id'
      }, {
        update: {
          method: 'PUT'
        }
      });
    }

  function LessonsSearchService($q, $http) {

    return {
      searchDB: function(data, filter) {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: '/api/lessons/search',
          params: {
            textSearch: data,
            filters: filter
          },
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }).success(function(data) {
          console.log(data);
          deferred.resolve(data); // jshint ignore:line
        }).error(function(data, status) {
          console.log(data);
          console.log('ERROR getting dashboard data. status: ' + JSON.stringify(status) + ', data: ' + JSON.stringify(data));
          deferred.resolve({});
        });
        return deferred.promise;
      }
    };
  }
})();
