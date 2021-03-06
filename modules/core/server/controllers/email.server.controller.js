'use strict';

var path = require('path'),
  fs = require('fs'),
  _ = require('lodash'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  config = require(path.resolve('./config/config')),
  nodemailer = require('nodemailer'),
  ses = require('nodemailer-ses-transport');

var defaultFrom = process.env.MAILER_FROM || 'Billion Oyster Project <bop@fearless.tech>';
var httpTransport = (config.secure && config.secure.ssl === true) ? 'https://' : 'http://';

var transporter = nodemailer.createTransport(ses(config.mailer.options.ses));

var toAddresses = function(to) {
  if (_.isArray(to)) {
    return to.join(', ');
  } else {
    return to;
  }
};

var runTemplate = function(string, data) {
  var compiled = _.template(string);
  return compiled(data);
};


/**
 * Send email
 */
exports.sendEmail = function(to, subject, bodyText, bodyHtml, successCallback, errorCallback) {
  if (to && subject && bodyText && bodyHtml) {
    to = toAddresses(to);

    transporter.sendMail({
      from: defaultFrom,
      to: to,
      subject: subject,
      text: bodyText,
      html: bodyHtml
    }, function(err, info) {
      if (err) errorCallback(err.message);
      successCallback(info);
    });
  } else {
    errorCallback('Must have to address(es), subject, and body');
  }
};

var sendTemplate = function(to, from, subject, bodyTemplate, data, successCallback, errorCallback) {
  if (to && subject && bodyTemplate && data) {
    to = toAddresses(to);

    var textContent = fs.readFileSync(
      path.resolve('./modules/core/server/templates/email-text/' + bodyTemplate + '.txt'), 'binary');

    var htmlContent = fs.readFileSync(
      path.resolve('./modules/core/server/templates/email-html/' + bodyTemplate + '.html'), 'binary');

    var bodyText = runTemplate(textContent, data);
    var bodyHtml = runTemplate(htmlContent, data);

    transporter.sendMail({
      from: defaultFrom,
      replyTo: from,
      to: to,
      subject: subject,
      text: bodyText,
      html: bodyHtml,
      attachments: [{
        filename: 'logo.png',
        path: 'https://s3-us-west-1.amazonaws.com/digital-platform-dev-files/uploads/logo.png',
        cid: 'bop-logo.ee' //same cid value as in the html img src
      }]
    }, function(err, info) {
      if (err) {
        console.log('err', err);
        errorCallback(err.message);
      } else {
        console.log('info', info);
        successCallback(info);
      }
    });
  } else {
    errorCallback('Must have to addresses(es), subject, and body');
  }
};

exports.sendEmailTemplate = function(to, subject, bodyTemplate, data, successCallback, errorCallback) {
  sendTemplate(to, defaultFrom, subject, bodyTemplate, data, successCallback, errorCallback);
};

exports.sendFeedback = function(to, from, subject, data, template, req, res) {
  if (to && from && subject && template && data) {
    sendTemplate(to, from, subject, template, data,
    function(info) {
      return res.status(200).send({
        message: 'Feedback send successfully'
      });
    }, function(errorMessage) {
      return res.status(400).send({
        message: errorMessage
      });
    });
  } else {
    return res.status(400).send({
      message: 'Must have to address, from address, subject, and body'
    });
  }
};

exports.sendBugReport = function(req, res) {
  var data = {
    UserName: req.user.displayName + '<' + req.user.email + '>',
    BrowserDetails: req.headers['user-agent'],
    Location: req.body.location,
    Issue: req.body.issue
  };
  exports.sendFeedback('jira@fearless.jira.com', req.user.email, req.body.subject, data, 'bug_report', req, res);
};

exports.sendGeneralFeedback = function(req, res) {
  var data = {
    FeedbackNote: req.body.message,
    FeedbackName: req.user.displayName,
    FeedbackEmail: req.user.email,
    OrgName: (req.user.schoolOrg) ? req.user.schoolOrg.name : ''
  };
  exports.sendFeedback(defaultFrom, req.user.email, 'BOP General Feedback: ' + req.body.subject, data, 'feedback', req, res);
};

exports.sendHelpQuestion = function(req, res) {
  var data = {
    FeedbackNote: req.body.message,
    FeedbackName: req.user.displayName,
    FeedbackEmail: req.user.email,
    OrgName: (req.user.schoolOrg) ? req.user.schoolOrg.name : ''
  };
  exports.sendFeedback(defaultFrom, req.user.email, 'BOP Help Question: ' + req.body.subject, data, 'feedback', req, res);
};

exports.sendLessonFeedback = function(req, res) {
  var subject = 'Feedback from ' + req.user.displayName + ' about your lesson ' + req.body.lesson.title;
  var data = {
    FirstName: req.body.lesson.user.firstName,
    LessonFeedbackName: req.user.displayName,
    LessonName: req.body.lesson.title,
    LessonFeedbackNote: req.body.message,
    LinkLesson: httpTransport + req.headers.host + '/lessons/' + req.body.lesson._id,
    LinkProfile: httpTransport + req.headers.host + '/settings/profile'
  };
  exports.sendFeedback(req.body.lesson.user.email, req.user.email, subject, data, 'lesson_feedback', req, res);
};

exports.sendUnitFeedback = function(req, res) {
  var subject = 'Feedback from ' + req.user.displayName + ' about your unit ' + req.body.unit.title;
  var data = {
    FirstName: req.body.unit.user.firstName,
    UnitFeedbackName: req.user.displayName,
    UnitName: req.body.unit.title,
    UnitFeedbackNote: req.body.message,
    LinkUnit: httpTransport + req.headers.host + '/units/' + req.body.unit._id,
    LinkProfile: httpTransport + req.headers.host + '/settings/profile'
  };
  exports.sendFeedback(req.body.unit.user.email, req.user.email, subject, data, 'unit_feedback', req, res);
};
