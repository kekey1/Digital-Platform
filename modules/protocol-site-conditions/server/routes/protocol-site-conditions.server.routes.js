'use strict';

/**
 * Module dependencies
 */
var siteConditionsPolicy = require('../policies/protocol-site-conditions.server.policy'),
  siteConditions = require('../controllers/protocol-site-conditions.server.controller');

module.exports = function (app) {
  // Protocol Site Condition collection routes
  app.route('/api/protocol-site-conditions').all(siteConditionsPolicy.isAllowed)
    // .get(siteConditions.list)
    .post(siteConditions.create);

  // Upload Water Condition route
  app.route('/api/protocol-site-conditions/:siteConditionId/upload-water-condition').all(siteConditionsPolicy.isAllowed)
    .post(siteConditions.uploadWaterConditionPicture);

  // Upload Land Condition route
  app.route('/api/protocol-site-conditions/:siteConditionId/upload-land-condition').all(siteConditionsPolicy.isAllowed)
    .post(siteConditions.uploadLandConditionPicture);

  app.route('/api/protocol-site-conditions/:siteConditionId/incremental-save').all(siteConditionsPolicy.isAllowed)
    .post(siteConditions.incrementalSave);

  app.route('/api/protocol-site-conditions/:siteConditionId/validate').all(siteConditionsPolicy.isAllowed)
    .post(siteConditions.validate);

  // Single Protocol Site Condition routes
  app.route('/api/protocol-site-conditions/:siteConditionId').all(siteConditionsPolicy.isAllowed)
    .get(siteConditions.read)
    .put(siteConditions.update)
    .delete(siteConditions.delete);

  // Finish by binding the protocol site condition midleware
  app.param('siteConditionId', siteConditions.siteConditionByID);
};
