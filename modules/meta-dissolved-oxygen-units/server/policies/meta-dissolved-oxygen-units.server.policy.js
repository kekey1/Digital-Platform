'use strict';

/**
 * Module dependencies
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke Meta dissolved oxygen units Permissions
 */
exports.invokeRolesPolicies = function () {
  acl.allow([{
    roles: ['admin'],
    allows: [{
      resources: '/api/dissolved-oxygen-units',
      permissions: '*'
    }, {
      resources: '/api/dissolved-oxygen-units/:dissolvedOxygenUnitId',
      permissions: '*'
    }]
  }, {
    roles: ['user'],
    allows: [{
      resources: '/api/dissolved-oxygen-units',
      permissions: ['get', 'post']
    }, {
      resources: '/api/dissolved-oxygen-units/:dissolvedOxygenUnitId',
      permissions: ['get']
    }]
  }, {
    roles: ['guest'],
    allows: [{
      resources: '/api/dissolved-oxygen-units',
      permissions: ['get']
    }, {
      resources: '/api/dissolved-oxygen-units/:dissolvedOxygenUnitId',
      permissions: ['get']
    }]
  }]);
};

/**
 * Check If Meta dissolved oxygen units Policy Allows
 */
exports.isAllowed = function (req, res, next) {
  var roles = (req.user) ? req.user.roles : ['guest'];

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
