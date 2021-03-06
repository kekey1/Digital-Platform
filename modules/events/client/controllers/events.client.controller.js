(function () {
  'use strict';

  // Events controller
  angular
    .module('events')
    .controller('EventsController', EventsController);

  EventsController.$inject = ['$scope', '$rootScope', '$state', '$window', '$http', '$location', '$timeout',
  'Authentication', 'eventResolve', 'EventHelper', 'FileUploader', 'moment', 'lodash'];

  function EventsController ($scope, $rootScope, $state, $window, $http, $location, $timeout,
    Authentication, event, EventHelper, FileUploader, moment, lodash) {
    var vm = this;

    vm.authentication = Authentication;
    vm.user = Authentication.user;
    vm.event = event;
    vm.error = [];
    vm.form = {};
    vm.save = save;

    vm.mapControls = {};
    vm.mapClick = function(e){
    };
    vm.markerDragEnd = function(location){
    };
    if (vm.event.location) {
      vm.mapPoints = [{
        lat: vm.event.location.latitude,
        lng: vm.event.location.longitude,
        icon: {
          icon: 'glyphicon-map-marker',
          prefix: 'glyphicon',
          markerColor: 'blue'
        },
      }];
    } else {
      vm.mapPoints = [];
    }

    vm.featuredImageURL = (vm.event && vm.event.featuredImage) ? vm.event.featuredImage.path : '';
    vm.resourceFiles = (vm.event && vm.event.resources && vm.event.resources.resourcesFiles) ?
      vm.event.resources.resourcesFiles : [];
    vm.resourceLinks = (vm.event && vm.event.resources && vm.event.resources.resourcesLinks) ?
      vm.event.resources.resourcesLinks : [];
    vm.event.deadlineToRegister = (vm.event && vm.event.deadlineToRegister) ? moment(vm.event.deadlineToRegister).toDate() : '';

    vm.featuredImageUploader = new FileUploader({
      alias: 'newFeaturedImage',
      queueLimit: 2
    });

    vm.resourceFilesUploader = new FileUploader({
      alias: 'newResourceFile',
      queueLimit: 20
    });

    vm.addDate = function() {
      vm.event.dates.push({
        date: moment().startOf('day').toDate(),
        startTime: moment().startOf('hour').toDate(),
        endTime: moment().startOf('hour').toDate()
      });
    };

    vm.removeDate = function(index) {
      vm.event.dates.splice(index, 1);
    };

    if (!vm.event.dates || vm.event.dates.length === 0) {
      vm.event.dates = [];
      vm.addDate();
    } else {
      for (var i = 0; i < vm.event.dates.length; i++) {
        vm.event.dates[i].date = (vm.event.dates[i].startDateTime) ?
          moment(vm.event.dates[i].startDateTime).startOf('day').toDate() : '';
        vm.event.dates[i].startTime = (vm.event.dates[i].startDateTime) ?
          moment(vm.event.dates[i].startDateTime).toDate() : '';
        vm.event.dates[i].endTime = (vm.event.dates[i].endDateTime) ?
          moment(vm.event.dates[i].endDateTime).toDate() : '';
      }
    }

    vm.resetDateValidity = function(fieldName) {
      vm.form.eventForm[fieldName].$setValidity('required', true);
    };

    vm.getEventDate = EventHelper.getEventDate;
    vm.getEventMonthShort = EventHelper.getEventMonthShort;
    vm.getEventDay = EventHelper.getEventDay;
    vm.getEventYear = EventHelper.getEventYear;
    vm.getEventTimeRange = EventHelper.getEventTimeRange;
    vm.earliestDateString = EventHelper.getEarliestDateString(vm.event.dates);
    vm.earliestDateTimeString = EventHelper.getEarliestDateTimeString(vm.event.dates);
    vm.openSpots = EventHelper.getOpenSpots(vm.event.registrants, vm.event.maximumCapacity);
    vm.daysRemaining = EventHelper.getDaysRemaining(vm.event.dates, vm.event.deadlineToRegister);
    vm.past = (vm.daysRemaining < 0) ? true : false;

    var checkRole = function(role) {
      var roleIndex = lodash.findIndex(vm.user.roles, function(o) {
        return o === role;
      });
      return (roleIndex > -1) ? true : false;
    };

    if (vm.user) {
      vm.isAdmin = checkRole('admin');
      vm.isTeamLead = (checkRole('team lead') || checkRole('team lead pending')) ? true : false;
      vm.notLoggedIn = false;
    } else {
      vm.notLoggedIn = true;
      vm.isAdmin = false;
      vm.isTeamLead = false;
    }

    vm.signinOrRegister = function() {
      $rootScope.redirectFromLogin = $location.path();
      $location.path('/authentication/signin');
    };

    vm.getRegistrationDate = function(date) {
      return moment(date).format('MMMM D, YYYY');
    };

    vm.openFeedback = function() {
      angular.element('#modal-feedback').modal('show');
    };

    vm.openEmailRegistrants = function() {
      angular.element('#modal-email-registrants').modal('show');
    };

    vm.openMap = function() {
      angular.element('#modal-event-map').modal('show');
      $timeout(function() {
        vm.mapControls.panTo({ lat: vm.event.location.latitude, lng: vm.event.location.longitude });
      }, 300);
    };

    vm.deleteResourceFile = function(index, file) {
      if (file.index) {
        vm.resourceFilesUploader.removeFromQueue(file.index);
      }
      vm.resourcesFiles.splice(index, 1);
    };

    vm.deleteResourceLink = function(index) {
      vm.resourceLinks.splice(index, 1);
    };

    vm.changedCategory = function() {
      if (vm.event.category.type !== 'other') {
        vm.event.category.otherType = null;
      }
    };

    vm.registerEvent = function() {
      $http.post('/api/events/' + vm.event._id + '/register', {
        full: true
      }).
      success(function(data, status, headers, config) {
        angular.element('#modal-event-register').modal('show');
        vm.event.isRegistered = true;
        vm.event.registrants = data.registrants;
        vm.error = [];
      }).
      error(function(data, status, headers, config) {
        vm.error = data.message;
        console.log('vm.error', vm.error);
      });
    };

    vm.unregisterEvent = function() {
      $http.post('/api/events/' + vm.event._id + '/unregister', {
        full: true
      }).
      success(function(data, status, headers, config) {
        angular.element('#modal-event-unregister').modal('show');
        vm.event.isRegistered = false;
        vm.event.registrants = data.registrants;
        vm.error = [];
      }).
      error(function(data, status, headers, config) {
        vm.error = data.message;
        console.log('vm.error', vm.error);
      });
    };

    vm.duplicateEvent = function() {
      $state.go('events.duplicate', {
        eventId: vm.event._id
      });
    };

    vm.openDeleteEvent = function() {
      angular.element('#modal-delete-event').modal('show');
    };

    vm.confirmDeleteEvent = function(shouldDelete) {
      var element = angular.element('#modal-delete-event');
      element.bind('hidden.bs.modal', function () {
        if (shouldDelete) vm.remove();
      });
      element.modal('hide');
    };

    // Save Event
    function save(isValid) {
      vm.error = [];
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.eventForm');
        return false;
      }
      var dateError = false;
      var dateErrors = {};
      if (!vm.event.dates || vm.event.dates.length === 0) {
        vm.error.push('Must have at least one date');
        dateError = true;
      } else if (vm.event.dates.length > 0) {
        for (var i = 0; i < vm.event.dates.length; i++) {
          if (!vm.event.dates[i].date || !vm.event.dates[i].startTime || !vm.event.dates[i].endTime) {
            //vm.error.push('Must fill in date and start/end times');
            if(!vm.event.dates[i].date) vm.form.eventForm['date-'+i].$setValidity('required', false);
            if(!vm.event.dates[i].startTime) vm.form.eventForm['startTime-'+i].$setValidity('required', false);
            if(!vm.event.dates[i].endTime) vm.form.eventForm['endTime-'+i].$setValidity('required', false);
            dateError = true;
          }
        }
      }
      if (dateError) return false;

      if (!vm.event.resources) {
        vm.event.resources = {
          resourcesLinks: vm.resourceLinks
        };
      } else if (!vm.event.resources.resourcesLinks) {
        vm.event.resources.resourcesLinks = vm.resourceLinks;
      }

      // TODO: move create/update logic to service
      if (vm.event._id) {
        vm.event.$update(successCallback, errorCallback);
      } else {
        vm.event.$save(successCallback, errorCallback);
      }

      function successCallback(res) {
        var eventId = res._id;

        function goToView(eventId) {
          $state.go('events.view', {
            eventId: eventId
          });
        }

        var uploadFeaturedImage = function (eventId, featuredImageCallback) {
          if (vm.featuredImageUploader.queue.length > 0) {
            vm.featuredImageUploader.onSuccessItem = function (fileItem, response, status, headers) {
              vm.featuredImageUploader.removeFromQueue(fileItem);
              featuredImageCallback();
            };

            vm.featuredImageUploader.onErrorItem = function (fileItem, response, status, headers) {
              featuredImageCallback(response.message);
            };

            vm.featuredImageUploader.onBeforeUploadItem = function(item) {
              item.url = 'api/events/' + eventId + '/upload-featured-image';
            };
            vm.featuredImageUploader.uploadAll();
          } else {
            featuredImageCallback();
          }
        };

        var uploadResourceFiles = function (eventId, resourceFileCallback) {
          if (vm.resourceFilesUploader.queue.length > 0) {
            vm.resourceFilesUploader.onSuccessItem = function (fileItem, response, status, headers) {
              vm.resourceFilesUploader.removeFromQueue(fileItem);
              resourceFileCallback();
            };

            vm.resourceFilesUploader.onErrorItem = function (fileItem, response, status, headers) {
              resourceFileCallback(response.message);
            };

            vm.resourceFilesUploader.onBeforeUploadItem = function(item) {
              item.url = 'api/events/' + eventId + '/upload-resources';
            };
            vm.resourceFilesUploader.uploadAll();
          } else {
            resourceFileCallback();
          }
        };

        $timeout(function (){
          uploadFeaturedImage(eventId, function(uploadFeaturedImageError) {
            if (uploadFeaturedImageError) vm.error.push(uploadFeaturedImageError);
            $timeout(function (){
              uploadResourceFiles(eventId, function(uploadResourceFilesError) {
                if (uploadResourceFilesError) vm.error.push(uploadResourceFilesError);

                if (vm.error && vm.error.length > 0) {
                  vm.valid = false;
                } else {
                  vm.error = [];
                  $timeout(function (){
                    goToView(eventId);
                  }, 1000);
                }
              });
            }, 500);
          });
        }, 500);
      }

      function errorCallback(res) {
        vm.error = res.data.message;
        vm.valid = false;
      }
    }
  }
}());
