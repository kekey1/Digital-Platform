'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Teams Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin', 'team lead'],
    allows: [{
      resources: '/api/teams/members/csv',
      permissions: '*'
    }, {
      resources: '/api/teams/members/validate/csv',
      permissions: '*'
    }, {
      resources: '/api/teams/members',
      permissions: '*'
    }, {
      resources: '/api/teams/members/:memberId/remind',
      permissions: '*'
    }, {
      resources: '/api/teams/members/:memberId',
      permissions: '*'
    }, {
      resources: '/api/teams/:teamId/members/:memberId',
      permissions: '*'
    }, {
      resources: '/api/teams',
      permissions: '*'
    }, {
      resources: '/api/teams/:teamId',
      permissions: '*'
    }]
  }, {
    roles: ['team member'],
    allows: [{
      resources: '/api/teams/members',
      permissions: ['get']
    }, {
      resources: '/api/teams/members/:memberId',
      permissions: ['get']
    }, {
      resources: '/api/teams/:teamId/members/:memberId',
      permissions: ['get']
    }, {
      resources: '/api/teams',
      permissions: ['get']
    }, {
      resources: '/api/teams/:teamId',
      permissions: ['get']
    }]
  }, {
    roles: ['user', 'partner', 'team lead pending', 'team member pending'],
    allows: [{
      resources: '/api/teams/members',
      permissions: ['get']
    }, {
      resources: '/api/teams/members/:memberId',
      permissions: ['get']
    }, {
      resources: '/api/teams/:teamId/members/:memberId',
      permissions: ['get']
    }, {
      resources: '/api/teams',
      permissions: ['get']
    }, {
      resources: '/api/teams/:teamId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Teams Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

  // If an team is being processed and the current user created it then allow any manipulation
  if (req.team && req.user && req.team.teamLead && req.team.teamLead.id === req.user.id) {
    return next();
  }

  // Check for user roles
  acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function (err, isAllowed) {
    if (err) {
      // An authorization error occurred
      return res.status(500).send('Unexpected authorization error');
    } else {
      if (isAllowed) {
        // Access granted! Invoke next middleware
        return next();
      } else {
        return res.status(403).json({
          message: 'User is not authorized'
        });
      }
    }
  });
};
