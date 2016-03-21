(function () {
  'use strict';

  angular
    .module('units')
    .run(menuConfig);

  menuConfig.$inject = ['Menus'];

  function menuConfig(Menus) {
    // Add the dropdown create item
    Menus.addSubMenuItem('account', 'settings', {
      title: 'Manage Units',
      state: 'units.list',
      roles: ['admin']
    });

    Menus.addSubMenuItem('topbar', 'curriculum', {
      title: 'Units',
      state: 'units.list',
      icon: 'glyphicon glyphicon-cog',
      roles: ['team lead', 'admin'],
      position: 2
    });
  }
})();
