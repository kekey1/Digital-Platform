'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Organization = mongoose.model('SchoolOrg'),
  Team = mongoose.model('Team'),
  path = require('path'),
  fs = require('fs'),
  mock = require('mock-fs'),
  config = require(path.resolve('./config/config')),
  logger = require(path.resolve('./config/lib/logger')),
  seed = require(path.resolve('./config/lib/seed'));

/**
 * Globals
 */
var organization1, team1, userLeader1, userMemeber1, admin1, organizationFromSeedConfig, teamFromSeedConfig,
  leaderFromSeedConfig, memberFromSeedConfig, adminFromSeedConfig, originalLogConfig;

describe('Configuration Tests:', function () {

  describe('Testing default seedDB', function () {
    before(function(done) {
      User.remove(function(err) {
        should.not.exist(err);

        // organization1 = {
        //   name: 'org_config_test',
        //   organizationType: 'school',
        //   description: 'Organization config test',
        //   streetAddress: '123 Main St',
        //   city: 'Anytown',
        //   state: 'NY',
        //   latitude: 39.765,
        //   longitude: -76.234,
        //   pending: false
        // };
        //
        // team1 = {
        //   name: 'team_config_test'
        // };
        //
        // userLeader1 = {
        //   username: 'leader_config_test',
        //   provider: 'local',
        //   email: 'leader_config_test_@localhost.com',
        //   firstName: 'Teacher',
        //   lastName: 'Local',
        //   displayName: 'Teacher Local',
        //   roles: ['user', 'team lead']
        // };
        //
        // userMemeber1 = {
        //   username: 'member_config_test',
        //   provider: 'local',
        //   email: 'member_config_test_@localhost.com',
        //   firstName: 'Student',
        //   lastName: 'Local',
        //   displayName: 'Student Local',
        //   roles: ['user', 'team member']
        // };

        admin1 = {
          username: 'admin_config_test',
          provider: 'local',
          email: 'admin_config_test_@localhost.com',
          firstName: 'Admin',
          lastName: 'Local',
          displayName: 'Admin Local',
          roles: ['user', 'admin']
        };

        // organizationFromSeedConfig = config.seedDB.options.seedOrganization;
        // teamFromSeedConfig = config.seedDB.options.seedTeam;
        // leaderFromSeedConfig = config.seedDB.options.seedUserLeader;
        // memberFromSeedConfig = config.seedDB.options.seedUserMember;
        adminFromSeedConfig = config.seedDB.options.seedAdmin;

        return done();

      });
    });

    after(function(done) {
      User.remove(function(err) {
        should.not.exist(err);
        return done();
      });
    });

    // it('should have seedDB configuration set for organization', function() {
    //   (typeof organizationFromSeedConfig).should.not.equal('undefined');
    //   should.exist(organizationFromSeedConfig.name);
    // });
    //
    // it('should have seedDB configuration set for team', function() {
    //   (typeof teamFromSeedConfig).should.not.equal('undefined');
    //   should.exist(teamFromSeedConfig.name);
    // });
    //
    // it('should have seedDB configuration set for "team lead" user', function() {
    //   (typeof leaderFromSeedConfig).should.not.equal('undefined');
    //   should.exist(leaderFromSeedConfig.username);
    //   should.exist(leaderFromSeedConfig.email);
    // });
    //
    // it('should have seedDB configuration set for "team member" user', function() {
    //   (typeof memberFromSeedConfig).should.not.equal('undefined');
    //   should.exist(memberFromSeedConfig.username);
    //   should.exist(memberFromSeedConfig.email);
    // });

    it('should have seedDB configuration set for admin user', function() {
      (typeof adminFromSeedConfig).should.not.equal('undefined');
      should.exist(adminFromSeedConfig.username);
      should.exist(adminFromSeedConfig.email);
    });

    // it('should not be an organization to begin with', function(done) {
    //   Organization.find({ name: 'org_config_test' }, function(err, teams) {
    //     should.not.exist(err);
    //     teams.should.be.instanceof(Array).and.have.lengthOf(0);
    //     return done();
    //   });
    // });
    //
    // it('should not be a team user to begin with', function(done) {
    //   Team.find({ name: 'team_config_test' }, function(err, teams) {
    //     should.not.exist(err);
    //     teams.should.be.instanceof(Array).and.have.lengthOf(0);
    //     return done();
    //   });
    // });

    it('should not be an admin user to begin with', function(done) {
      User.find({ username: 'admin' }, function(err, users) {
        should.not.exist(err);
        users.should.be.instanceof(Array).and.have.lengthOf(0);
        return done();
      });
    });

    // it('should not be a "team lead" user to begin with', function(done) {
    //   User.find({ username: 'student' }, function(err, users) {
    //     should.not.exist(err);
    //     users.should.be.instanceof(Array).and.have.lengthOf(0);
    //     return done();
    //   });
    // });
    //
    // it('should not be a "team member" user to begin with', function(done) {
    //   User.find({ username: 'student' }, function(err, users) {
    //     should.not.exist(err);
    //     users.should.be.instanceof(Array).and.have.lengthOf(0);
    //     return done();
    //   });
    // });

    // it('should seed ONLY the admin user account when NODE_ENV is set to "production"', function(done) {
    //
    //   // Save original value
    //   var nodeEnv = process.env.NODE_ENV;
    //   // Set node env ro production environment
    //   process.env.NODE_ENV = 'production';
    //
    //   User.find({ username: adminFromSeedConfig.username }, function(err, users) {
    //
    //     // There shouldn't be any errors
    //     should.not.exist(err);
    //     users.should.be.instanceof(Array).and.have.lengthOf(0);
    //
    //     Organization.find({ name: organizationFromSeedConfig.name }, function(err, organizations) {
    //
    //       // there shouldn't be any errors
    //       should.not.exist(err);
    //       organizations.should.be.instanceof(Array).and.have.lengthOf(0);
    //
    //       seed
    //         .start({ logResults: false })
    //         .then(function() {
    //           User.find({ username: adminFromSeedConfig.username }, function(err, users) {
    //             should.not.exist(err);
    //             users.should.be.instanceof(Array).and.have.lengthOf(1);
    //
    //             var _admin = users.pop();
    //             _admin.username.should.equal(adminFromSeedConfig.username);
    //
    //             Organization.find({ name: organizationFromSeedConfig.name }, function(err, organizations) {
    //               should.not.exist(err);
    //               organizations.should.be.instanceof(Array).and.have.lengthOf(1);
    //
    //               var _organization = organizations.pop();
    //               _organization.name.should.equal(organizationFromSeedConfig.name);
    //               var _adminSchoolOrgId = _admin.schoolOrg.toString();
    //               _adminSchoolOrgId.should.equal(_organization._id.toString());
    //
    //               // Restore original NODE_ENV environment variable
    //               process.env.NODE_ENV = nodeEnv;
    //
    //               User.remove(function(err) {
    //                 should.not.exist(err);
    //                 Organization.remove(function(err) {
    //                   should.not.exist(err);
    //                   return done();
    //                 });
    //               });
    //             });
    //           });
    //         });
    //     });
    //   });
    // });

    // it('should seed admin, organization, team, team lead, and team member accounts when NODE_ENV is set to "test"', function(done) {
    //
    //   // Save original value
    //   var nodeEnv = process.env.NODE_ENV;
    //   // Set node env ro production environment
    //   process.env.NODE_ENV = 'test';
    //
    //   User.find({ username: adminFromSeedConfig.username }, function(err, users) {
    //
    //     // There shouldn't be any errors
    //     should.not.exist(err);
    //     users.should.be.instanceof(Array).and.have.lengthOf(0);
    //
    //     seed
    //       .start({ logResults: false })
    //       .then(function() {
    //         User.find({ username: adminFromSeedConfig.username }, function(err, users) {
    //           should.not.exist(err);
    //           users.should.be.instanceof(Array).and.have.lengthOf(1);
    //
    //           var _admin = users.pop();
    //           _admin.username.should.equal(adminFromSeedConfig.username);
    //
    //           User.find({ username: leaderFromSeedConfig.username }, function(err, users) {
    //
    //             should.not.exist(err);
    //             users.should.be.instanceof(Array).and.have.lengthOf(1);
    //
    //             var _leader = users.pop();
    //             _leader.username.should.equal(leaderFromSeedConfig.username);
    //
    //             User.find({ username: memberFromSeedConfig.username }, function(err, users) {
    //
    //               should.not.exist(err);
    //               users.should.be.instanceof(Array).and.have.lengthOf(1);
    //
    //               var _member = users.pop();
    //               _member.username.should.equal(memberFromSeedConfig.username);
    //
    //               Organization.find({ name: organizationFromSeedConfig.name }, function(err, organizations) {
    //
    //                 should.not.exist(err);
    //                 organizations.should.be.instanceof(Array).and.have.lengthOf(1);
    //
    //                 var _organization = organizations.pop();
    //                 _organization.name.should.equal(organizationFromSeedConfig.name);
    //
    //                 Team.find({ name: teamFromSeedConfig.name }, function(err, teams) {
    //
    //                   should.not.exist(err);
    //                   teams.should.be.instanceof(Array).and.have.lengthOf(1);
    //
    //                   var _team = teams.pop();
    //                   _team.name.should.equal(teamFromSeedConfig.name);
    //
    //                   var _leaderSchoolOrgId = _leader.schoolOrg.toString();
    //                   var _memberSchoolOrgId = _member.schoolOrg.toString();
    //                   _leaderSchoolOrgId.should.equal(_organization._id.toString());
    //                   _memberSchoolOrgId.should.equal(_organization._id.toString());
    //                   var _teamTeamLeadId = _team.teamLead.toString();
    //                   var _teamTeamMemberId = _team.teamMembers[0].toString();
    //                   _teamTeamLeadId.should.equal(_leader._id.toString());
    //                   _teamTeamMemberId.should.equal(_member._id.toString());
    //
    //                   // Restore original NODE_ENV environment variable
    //                   process.env.NODE_ENV = nodeEnv;
    //
    //                   User.remove(function(err) {
    //                     should.not.exist(err);
    //                     Team.remove(function(err) {
    //                       should.not.exist(err);
    //                       Organization.remove(function(err) {
    //                         should.not.exist(err);
    //                         return done();
    //                       });
    //                     });
    //                   });
    //                 });
    //               });
    //             });
    //           });
    //         });
    //       });
    //   });
    // });

  //   it('should seed admin, and "regular" user accounts when NODE_ENV is set to "test" when they already exist', function (done) {
  //
  //     // Save original value
  //     var nodeEnv = process.env.NODE_ENV;
  //     // Set node env ro production environment
  //     process.env.NODE_ENV = 'test';
  //
  //     var _user = new User(userFromSeedConfig);
  //     var _admin = new User(adminFromSeedConfig);
  //
  //     _admin.save(function (err) {
  //       // There shouldn't be any errors
  //       should.not.exist(err);
  //       _user.save(function (err) {
  //         // There shouldn't be any errors
  //         should.not.exist(err);
  //
  //         User.find({ username: { $in: [adminFromSeedConfig.username, userFromSeedConfig.username] } }, function (err, users) {
  //
  //           // There shouldn't be any errors
  //           should.not.exist(err);
  //           users.should.be.instanceof(Array).and.have.lengthOf(2);
  //
  //           seed
  //             .start({ logResults: false })
  //             .then(function () {
  //               User.find({ username: { $in: [adminFromSeedConfig.username, userFromSeedConfig.username] } }, function (err, users) {
  //                 should.not.exist(err);
  //                 users.should.be.instanceof(Array).and.have.lengthOf(2);
  //
  //                 // Restore original NODE_ENV environment variable
  //                 process.env.NODE_ENV = nodeEnv;
  //
  //                 User.remove(function (err) {
  //                   should.not.exist(err);
  //                   return done();
  //                 });
  //               });
  //             });
  //         });
  //       });
  //     });
  //   });
  //
  //   it('should ONLY seed admin user account when NODE_ENV is set to "production" with custom admin', function(done) {
  //
  //     // Save original value
  //     var nodeEnv = process.env.NODE_ENV;
  //     // Set node env ro production environment
  //     process.env.NODE_ENV = 'production';
  //
  //     User.find({ username: admin1.username }, function(err, users) {
  //
  //       // There shouldn't be any errors
  //       should.not.exist(err);
  //       users.should.be.instanceof(Array).and.have.lengthOf(0);
  //
  //       seed
  //         .start({ logResults: false, seedAdmin: admin1 })
  //         .then(function() {
  //           User.find({ username: admin1.username }, function(err, users) {
  //             should.not.exist(err);
  //             users.should.be.instanceof(Array).and.have.lengthOf(1);
  //
  //             var _admin = users.pop();
  //             _admin.username.should.equal(admin1.username);
  //
  //             // Restore original NODE_ENV environment variable
  //             process.env.NODE_ENV = nodeEnv;
  //
  //             User.remove(function(err) {
  //               should.not.exist(err);
  //               return done();
  //             });
  //           });
  //         });
  //     });
  //   });
  //
  //   it('should seed admin, and "regular" user accounts when NODE_ENV is set to "test" with custom options', function(done) {
  //
  //     // Save original value
  //     var nodeEnv = process.env.NODE_ENV;
  //     // Set node env ro production environment
  //     process.env.NODE_ENV = 'test';
  //
  //     User.find({ username: admin1.username }, function(err, users) {
  //
  //       // There shouldn't be any errors
  //       should.not.exist(err);
  //       users.should.be.instanceof(Array).and.have.lengthOf(0);
  //
  //       seed
  //         .start({ logResults: false, seedAdmin: admin1, seedUser: user1 })
  //         .then(function() {
  //           User.find({ username: admin1.username }, function(err, users) {
  //             should.not.exist(err);
  //             users.should.be.instanceof(Array).and.have.lengthOf(1);
  //
  //             var _admin = users.pop();
  //             _admin.username.should.equal(admin1.username);
  //
  //             User.find({ username: user1.username }, function(err, users) {
  //
  //               should.not.exist(err);
  //               users.should.be.instanceof(Array).and.have.lengthOf(1);
  //
  //               var _user = users.pop();
  //               _user.username.should.equal(user1.username);
  //
  //               // Restore original NODE_ENV environment variable
  //               process.env.NODE_ENV = nodeEnv;
  //
  //               User.remove(function(err) {
  //                 should.not.exist(err);
  //                 return done();
  //               });
  //             });
  //           });
  //         });
  //     });
  //   });
  //
  //   it('should NOT seed admin user account if it already exists when NODE_ENV is set to "production"', function(done) {
  //
  //     // Save original value
  //     var nodeEnv = process.env.NODE_ENV;
  //     // Set node env ro production environment
  //     process.env.NODE_ENV = 'production';
  //
  //     var _admin = new User(adminFromSeedConfig);
  //
  //     _admin.save(function(err, user) {
  //       // There shouldn't be any errors
  //       should.not.exist(err);
  //       user.username.should.equal(adminFromSeedConfig.username);
  //
  //       seed
  //         .start({ logResults: false })
  //         .then(function () {
  //           // we don't ever expect to make it here but we don't want to timeout
  //           User.remove(function(err) {
  //             should.not.exist(err);
  //             // force this test to fail since we should never be here
  //             should.exist(undefined);
  //             // Restore original NODE_ENV environment variable
  //             process.env.NODE_ENV = nodeEnv;
  //
  //             return done();
  //           });
  //         })
  //         .catch(function (err) {
  //           should.exist(err);
  //           err.message.should.equal('Failed due to local account already exists: ' + adminFromSeedConfig.username);
  //
  //           // Restore original NODE_ENV environment variable
  //           process.env.NODE_ENV = nodeEnv;
  //
  //           User.remove(function(removeErr) {
  //             should.not.exist(removeErr);
  //
  //             return done();
  //           });
  //         });
  //     });
  //   });
  //
  //   it('should NOT seed "regular" user account if missing email when NODE_ENV set to "test"', function (done) {
  //
  //     // Save original value
  //     var nodeEnv = process.env.NODE_ENV;
  //     // Set node env ro test environment
  //     process.env.NODE_ENV = 'test';
  //
  //     var _user = new User(user1);
  //     _user.email = '';
  //
  //     seed
  //       .start({ logResults: false, seedUser: _user })
  //       .then(function () {
  //         // we don't ever expect to make it here but we don't want to timeout
  //         User.remove(function(err) {
  //           // force this test to fail since we should never be here
  //           should.exist(undefined);
  //           // Restore original NODE_ENV environment variable
  //           process.env.NODE_ENV = nodeEnv;
  //
  //           return done();
  //         });
  //       })
  //       .catch(function (err) {
  //         should.exist(err);
  //         err.message.should.equal('Failed to add local ' + user1.username);
  //
  //         // Restore original NODE_ENV environment variable
  //         process.env.NODE_ENV = nodeEnv;
  //
  //         User.remove(function(removeErr) {
  //           should.not.exist(removeErr);
  //
  //           return done();
  //         });
  //       });
  //   });
  // });
  //
  // describe('Testing Session Secret Configuration', function () {
  //   it('should warn if using default session secret when running in production', function (done) {
  //     var conf = { sessionSecret: 'MEAN' };
  //     // set env to production for this test
  //     process.env.NODE_ENV = 'production';
  //     config.utils.validateSessionSecret(conf, true).should.equal(false);
  //     // set env back to test
  //     process.env.NODE_ENV = 'test';
  //     return done();
  //   });
  //
  //   it('should accept non-default session secret when running in production', function () {
  //     var conf = { sessionSecret: 'super amazing secret' };
  //     // set env to production for this test
  //     process.env.NODE_ENV = 'production';
  //     config.utils.validateSessionSecret(conf, true).should.equal(true);
  //     // set env back to test
  //     process.env.NODE_ENV = 'test';
  //   });
  //
  //   it('should accept default session secret when running in development', function () {
  //     var conf = { sessionSecret: 'MEAN' };
  //     // set env to development for this test
  //     process.env.NODE_ENV = 'development';
  //     config.utils.validateSessionSecret(conf, true).should.equal(true);
  //     // set env back to test
  //     process.env.NODE_ENV = 'test';
  //   });
  //
  //   it('should accept default session secret when running in test', function () {
  //     var conf = { sessionSecret: 'MEAN' };
  //     config.utils.validateSessionSecret(conf, true).should.equal(true);
  //   });
  // });
  //
  // describe('Testing Logger Configuration', function () {
  //
  //   beforeEach(function () {
  //     originalLogConfig = _.clone(config.log, true);
  //     mock();
  //   });
  //
  //   afterEach(function () {
  //     config.log = originalLogConfig;
  //     mock.restore();
  //   });
  //
  //   it('should retrieve the log format from the logger configuration', function () {
  //     config.log = {
  //       format: 'tiny'
  //     };
  //
  //     var format = logger.getFormat();
  //     format.should.be.equal('tiny');
  //   });
  //
  //   it('should retrieve the log options from the logger configuration', function () {
  //     config.log = {
  //       options: {
  //         _test_log_option_: 'testing'
  //       }
  //     };
  //
  //     var options = logger.getOptions();
  //     should.deepEqual(options, config.log.options);
  //   });
  //
  //   it('should verify that a writable stream was created using the logger configuration', function () {
  //     var _dir = process.cwd();
  //     var _filename = 'unit-test-access.log';
  //
  //     config.log = {
  //       options: {
  //         stream: {
  //           directoryPath: _dir,
  //           fileName: _filename
  //         }
  //       }
  //     };
  //
  //     var options = logger.getOptions();
  //     options.stream.writable.should.equal(true);
  //   });
  //
  //   it('should use the default log format of "combined" when an invalid format was provided', function () {
  //     // manually set the config log format to be invalid
  //     config.log = {
  //       format: '_some_invalid_format_'
  //     };
  //
  //     var format = logger.getFormat();
  //     format.should.be.equal('combined');
  //   });
  //
  //   it('should remove the stream option when an invalid filename was supplied for the log stream option', function () {
  //     // manually set the config stream fileName option to an empty string
  //     config.log = {
  //       format: 'combined',
  //       options: {
  //         stream: {
  //           directoryPath: process.cwd(),
  //           fileName: ''
  //         }
  //       }
  //     };
  //
  //     var options = logger.getOptions();
  //     should.not.exist(options.stream);
  //   });
  //
  //   it('should remove the stream option when an invalid directory path was supplied for the log stream option', function () {
  //     // manually set the config stream fileName option to an empty string
  //     config.log = {
  //       format: 'combined',
  //       options: {
  //         stream: {
  //           directoryPath: '',
  //           fileName: 'test.log'
  //         }
  //       }
  //     };
  //
  //     var options = logger.getOptions();
  //     should.not.exist(options.stream);
  //   });
  //
  //   it('should confirm that the log directory is created if it does not already exist', function () {
  //     var _dir = process.cwd() + '/temp-logs';
  //     var _filename = 'unit-test-access.log';
  //
  //     // manually set the config stream fileName option to an empty string
  //     config.log = {
  //       format: 'combined',
  //       options: {
  //         stream: {
  //           directoryPath: _dir,
  //           fileName: _filename
  //         }
  //       }
  //     };
  //
  //     var options = logger.getOptions();
  //     options.stream.writable.should.equal(true);
  //   });
  //
  //   it('should remove the stream option when an invalid filename was supplied for the rotating log stream option', function () {
  //     // enable rotating logs
  //     config.log = {
  //       format: 'combined',
  //       options: {
  //         stream: {
  //           directoryPath: process.cwd(),
  //           rotatingLogs: {
  //             active: true,
  //             fileName: '',
  //             frequency: 'daily',
  //             verbose: false
  //           }
  //         }
  //       }
  //     };
  //
  //     var options = logger.getOptions();
  //     should.not.exist(options.stream);
  //   });
  //
  //   it('should confirm that the rotating log is created using the logger configuration', function () {
  //     var _dir = process.cwd();
  //     var _filename = 'unit-test-rotating-access-%DATE%.log';
  //
  //     // enable rotating logs
  //     config.log = {
  //       format: 'combined',
  //       options: {
  //         stream: {
  //           directoryPath: _dir,
  //           rotatingLogs: {
  //             active: true,
  //             fileName: _filename,
  //             frequency: 'daily',
  //             verbose: false
  //           }
  //         }
  //       }
  //     };
  //
  //     var options = logger.getOptions();
  //     should.exist(options.stream.write);
  //   });
  //
  //   it('should confirm that the rotating log directory is created if it does not already exist', function () {
  //     var _dir = process.cwd() + '/temp-rotating-logs';
  //     var _filename = 'unit-test-rotating-access-%DATE%.log';
  //
  //     // enable rotating logs
  //     config.log = {
  //       format: 'combined',
  //       options: {
  //         stream: {
  //           directoryPath: _dir,
  //           rotatingLogs: {
  //             active: true,
  //             fileName: _filename,
  //             frequency: 'daily',
  //             verbose: false
  //           }
  //         }
  //       }
  //     };
  //
  //     var options = logger.getOptions();
  //     should.exist(options.stream.write);
  //   });
  });
});
