(function () {
  'use strict';

  angular
    .module('metrics')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {

    //Menus.addMenuItem('topbar', {
    //  title: 'Metrics',
    //  state: 'metrics.dashboard',
    //  roles: ['admin'],
    //  icon: 'glyphicon glyphicon-equalizer',
    //  position: 5   
    //});

  }
})();
