'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  fs = require('fs'),
  mongoose = require('mongoose'),
  Expedition = mongoose.model('Expedition'),
  ProtocolOysterMeasurement = mongoose.model('ProtocolOysterMeasurement'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  UploadRemote = require(path.resolve('./modules/forms/server/controllers/upload-remote.server.controller')),
  _ = require('lodash'),
  multer = require('multer'),
  config = require(path.resolve('./config/config')),
  moment = require('moment');

var emptyString = function(string) {
  if (!string || string === null || string === '') {
    return true;
  } else {
    return false;
  }
};

var checkRole = function(role, user) {
  var roleIndex = _.findIndex(user.roles, function(r) {
    return r === role;
  });
  return (roleIndex > -1) ? true : false;
};

var validateOysterMeasurement = function(oysterMeasurement, successCallback, errorCallback) {
  var errorMessages = [];

  if (!oysterMeasurement.depthOfOysterCage || !oysterMeasurement.depthOfOysterCage.submergedDepthofCageM ||
    oysterMeasurement.depthOfOysterCage.submergedDepthofCageM < 0) {
    errorMessages.push('Submerged depth of oyster cage is required');
  }

  if (!oysterMeasurement.conditionOfOysterCage) {
    errorMessages.push('Cage Condition photo is required');
    errorMessages.push('Bioaccumulation on cage is required');
  } else {
    if (!oysterMeasurement.conditionOfOysterCage.oysterCagePhoto ||
      oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path === undefined ||
      oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path === '') {
      errorMessages.push('Photo of oyster cage is required');
    }
    if (emptyString(oysterMeasurement.conditionOfOysterCage.bioaccumulationOnCage)) {
      errorMessages.push('Bioaccumulation on cage is required');
    }
  }

  if (!oysterMeasurement.measuringOysterGrowth || !oysterMeasurement.measuringOysterGrowth.substrateShells ||
    oysterMeasurement.measuringOysterGrowth.substrateShells.length < 0) {
    errorMessages.push('Substrate shell measurements are required');
  } else {
    var oneSuccessfulSubstrateShell = false;

    var allOystersMeasured = function(substrateShell) {
      var filledOutCount = 0;
      for (var k = 0; k < substrateShell.measurements.length; k++) {
        if (substrateShell.measurements[k].sizeOfLiveOysterMM !== null) {
          filledOutCount++;
        }
      }
      return substrateShell.totalNumberOfLiveOystersOnShell === filledOutCount;
    };

    for (var j = 0; j < oysterMeasurement.measuringOysterGrowth.substrateShells.length; j++) {
      var substrateShell = oysterMeasurement.measuringOysterGrowth.substrateShells[j];

      if (substrateShell.totalNumberOfLiveOystersOnShell > 0 && allOystersMeasured(substrateShell)) {
        oneSuccessfulSubstrateShell = true;
      } else if (substrateShell.totalNumberOfLiveOystersOnShell === undefined || substrateShell.totalNumberOfLiveOystersOnShell <= 1) {

      } else {
        var shellNumber = 1+j;
        if (substrateShell.totalNumberOfLiveOystersOnShell < 0) {
          errorMessages.push('The total number of live oysters on Substrate Shell #' + shellNumber + ' must be a positive number');
        } else {
          if (!allOystersMeasured(substrateShell)) {
            errorMessages.push('The number of measurements must be equal to the total number of live oysters on Substrate Shell #' + shellNumber);
          }
        }
      }
    }

    if (!oneSuccessfulSubstrateShell) {
      errorMessages.push('There must be at least one substrate shell');
    }
  }
  if (oysterMeasurement.minimumSizeOfAllLiveOysters < 0) {
    errorMessages.push('The minimum size of all live oysters must be positive');
  }
  if (oysterMeasurement.maximumSizeOfAllLiveOysters < 0) {
    errorMessages.push('The maximum size of all live oysters must be positive');
  }
  if (oysterMeasurement.averageSizeOfAllLiveOysters < 0) {
    errorMessages.push('The average size of all live oysters must be positive');
  }
  if (oysterMeasurement.totalNumberOfAllLiveOysters < 0) {
    errorMessages.push('The total number of all live oysters must be positive');
  }

  if (errorMessages.length > 0) {
    errorCallback(errorMessages);
  } else {
    successCallback(oysterMeasurement);
  }
};

/**
 * Create a protocol oyster oysterMeasurement
 */
exports.create = function (req, res) {
  validateOysterMeasurement(req.body,
  function(oysterMeasurementJSON) {
    var oysterMeasurement = new ProtocolOysterMeasurement(oysterMeasurementJSON);
    oysterMeasurement.collectionTime = moment(req.body.collectionTime, 'YYYY-MM-DDTHH:mm:ss.SSSZ').startOf('minute').toDate();
    oysterMeasurement.scribeMember = req.user;

    oysterMeasurement.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.json(oysterMeasurement);
      }
    });
  }, function(errorMessages) {
    return res.status(400).send({
      message: errorMessages
    });
  });
};

/**
 * Show the current protocol oyster measurement
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var oysterMeasurement = req.oysterMeasurement ? req.oysterMeasurement.toJSON() : {};

  res.json(oysterMeasurement);
};

exports.validate = function (req, res) {
  var oysterMeasurement = req.body;
  validateOysterMeasurement(oysterMeasurement,
  function(oysterMeasurementJSON) {
    res.json({
      oysterMeasurement: oysterMeasurement,
      successful: true
    });
  }, function(errorMessages) {
    res.json({
      oysterMeasurement: oysterMeasurement,
      errors: errorMessages
    });
  });
};

exports.incrementalSave = function (req, res) {
  var oysterMeasurement = req.oysterMeasurement;

  if (oysterMeasurement) {
    oysterMeasurement = _.extend(oysterMeasurement, req.body);
    oysterMeasurement.collectionTime = moment(req.body.collectionTime,
      'YYYY-MM-DDTHH:mm:ss.SSSZ').startOf('minute').toDate();
    oysterMeasurement.scribeMember = req.user;
    for (var i = 0; i < req.body.measuringOysterGrowth.substrateShells.length; i++) {
      if (req.body.measuringOysterGrowth.substrateShells[i].setDate) {
        oysterMeasurement.measuringOysterGrowth.substrateShells[i].setDate =
          moment(req.body.measuringOysterGrowth.substrateShells[i].setDate,
            'YYYY-MM-DD').startOf('day').toDate();
      }
    }

    // remove base64 text
    var pattern = /^data:image\/[a-z]*;base64,/i;
    if (oysterMeasurement.conditionOfOysterCage && oysterMeasurement.conditionOfOysterCage.oysterCagePhoto &&
    oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path &&
    pattern.test(oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path)) {
      oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path = '';
    }
    if (oysterMeasurement.measuringOysterGrowth && oysterMeasurement.measuringOysterGrowth.substrateShells &&
    oysterMeasurement.measuringOysterGrowth.substrateShells.length > 0) {
      for (var j = 0; j < oysterMeasurement.measuringOysterGrowth.substrateShells.length; j++) {
        if (oysterMeasurement.measuringOysterGrowth.substrateShells[j].outerSidePhoto &&
        oysterMeasurement.measuringOysterGrowth.substrateShells[j].outerSidePhoto.path &&
        pattern.test(oysterMeasurement.measuringOysterGrowth.substrateShells[j].outerSidePhoto.path)) {
          oysterMeasurement.measuringOysterGrowth.substrateShells[j].outerSidePhoto.path = '';
        }
        if (oysterMeasurement.measuringOysterGrowth.substrateShells[j].innerSidePhoto &&
        oysterMeasurement.measuringOysterGrowth.substrateShells[j].innerSidePhoto.path &&
        pattern.test(oysterMeasurement.measuringOysterGrowth.substrateShells[j].innerSidePhoto.path)) {
          oysterMeasurement.measuringOysterGrowth.substrateShells[j].innerSidePhoto.path = '';
        }
      }
    }

    oysterMeasurement.save(function (err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        validateOysterMeasurement(oysterMeasurement,
        function(oysterMeasurementJSON) {
          res.json({
            oysterMeasurement: oysterMeasurement,
            successful: true
          });
        }, function(errorMessages) {
          res.json({
            oysterMeasurement: oysterMeasurement,
            errors: errorMessages
          });
        });
      }
    });
  } else {
    return res.status(400).send({
      message: 'Protocol oyster measurement not found'
    });
  }
};

/**
 * Update a protocol oyster measurement
 */
exports.updateInternal = function (oysterMeasurmentReq, oysterMeasurementBody, user, validate, successCallback, errorCallback) {
  var save = function(oysterMeasurementJSON) {
    var oysterMeasurement = oysterMeasurmentReq;

    if (oysterMeasurement) {
      oysterMeasurement = _.extend(oysterMeasurement, oysterMeasurementJSON);
      oysterMeasurement.collectionTime = moment(oysterMeasurementBody.collectionTime,
        'YYYY-MM-DDTHH:mm:ss.SSSZ').startOf('minute').toDate();
      oysterMeasurement.scribeMember = user;
      for (var i = 0; i < oysterMeasurementBody.measuringOysterGrowth.substrateShells.length; i++) {
        if (oysterMeasurementBody.measuringOysterGrowth.substrateShells[i].setDate) {
          oysterMeasurement.measuringOysterGrowth.substrateShells[i].setDate =
            moment(oysterMeasurementBody.measuringOysterGrowth.substrateShells[i].setDate,
              'YYYY-MM-DD').startOf('day').toDate();
        }
      }
      oysterMeasurement.submitted = new Date();

      // remove base64 text
      var pattern = /^data:image\/[a-z]*;base64,/i;
      if (oysterMeasurement.conditionOfOysterCage && oysterMeasurement.conditionOfOysterCage.oysterCagePhoto &&
      oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path &&
      pattern.test(oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path)) {
        oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path = '';
      }
      if (oysterMeasurement.measuringOysterGrowth && oysterMeasurement.measuringOysterGrowth.substrateShells &&
      oysterMeasurement.measuringOysterGrowth.substrateShells.length > 0) {
        for (var j = 0; j < oysterMeasurement.measuringOysterGrowth.substrateShells.length; j++) {
          if (oysterMeasurement.measuringOysterGrowth.substrateShells[j].outerSidePhoto &&
          oysterMeasurement.measuringOysterGrowth.substrateShells[j].outerSidePhoto.path &&
          pattern.test(oysterMeasurement.measuringOysterGrowth.substrateShells[j].outerSidePhoto.path)) {
            oysterMeasurement.measuringOysterGrowth.substrateShells[j].outerSidePhoto.path = '';
          }
          if (oysterMeasurement.measuringOysterGrowth.substrateShells[j].innerSidePhoto &&
          oysterMeasurement.measuringOysterGrowth.substrateShells[j].innerSidePhoto.path &&
          pattern.test(oysterMeasurement.measuringOysterGrowth.substrateShells[j].innerSidePhoto.path)) {
            oysterMeasurement.measuringOysterGrowth.substrateShells[j].innerSidePhoto.path = '';
          }
        }
      }

      oysterMeasurement.save(function (err) {
        if (err) {
          errorCallback(errorHandler.getErrorMessage(err));
        } else {
          successCallback(oysterMeasurement);
        }
      });
    } else {
      errorCallback('Protocol oyster measurement not found');
    }
  };

  if (validate) {
    validateOysterMeasurement(oysterMeasurementBody,
      function(oysterMeasurementJSON) {
        save(oysterMeasurementJSON);
      }, function(errorMessages) {
        errorCallback(errorMessages);
      });
  } else {
    save(oysterMeasurementBody);
  }
};

exports.update = function (req, res) {
  var oysterMeasurementBody = req.body;
  oysterMeasurementBody.status = 'submitted';

  exports.updateInternal(req.oysterMeasurement, oysterMeasurementBody, req.user, true,
  function(oysterMeasurement) {
    res.json(oysterMeasurement);
  }, function(errorMessage) {
    return res.status(400).send({
      message: errorMessage
    });
  });
};

/**
 * Delete a protocol oyster measurement
 */
var deleteInternal = function(oysterMeasurement, successCallback, errorCallback) {
  var filesToDelete = [];
  if (oysterMeasurement) {
    if (oysterMeasurement.conditionOfOysterCage && oysterMeasurement.conditionOfOysterCage.oysterCagePhoto &&
    oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path) {
      filesToDelete.push(oysterMeasurement.conditionOfOysterCage.oysterCagePhoto.path);
    }
    for (var i = 0; i < oysterMeasurement.measuringOysterGrowth.substrateShells.length; i++) {
      if (oysterMeasurement.measuringOysterGrowth && oysterMeasurement.measuringOysterGrowth.substrateShells[i]) {
        if (oysterMeasurement.measuringOysterGrowth.substrateShells[i].outerSidePhoto &&
        oysterMeasurement.measuringOysterGrowth.substrateShells[i].outerSidePhoto.path) {
          filesToDelete.push(oysterMeasurement.measuringOysterGrowth.substrateShells[i].outerSidePhoto.path);
        }
        if (oysterMeasurement.measuringOysterGrowth.substrateShells[i].innerSidePhoto &&
        oysterMeasurement.measuringOysterGrowth.substrateShells[i].innerSidePhoto.path) {
          filesToDelete.push(oysterMeasurement.measuringOysterGrowth.substrateShells[i].innerSidePhoto.path);
        }
      }
    }
  }

  var uploadRemote = new UploadRemote();
  uploadRemote.deleteRemote(filesToDelete,
  function() {
    oysterMeasurement.remove(function (err) {
      if (err) {
        errorCallback(errorHandler.getErrorMessage(err));
      } else {
        successCallback(oysterMeasurement);
      }
    });
  }, function(err) {
    errorCallback(err);
  });
};

exports.delete = function (req, res) {
  var oysterMeasurement = req.oysterMeasurement;

  deleteInternal(oysterMeasurement,
  function(oysterMeasurement) {
    res.json(oysterMeasurement);
  }, function (err) {
    return res.status(400).send({
      message: errorHandler.getErrorMessage(err)
    });
  });
};

var uploadFileSuccess = function(oysterMeasurement, res) {
  oysterMeasurement.save(function (saveError) {
    if (saveError) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(saveError)
      });
    } else {
      res.json(oysterMeasurement);
    }
  });
};

var uploadFileError = function(oysterMeasurement, errorMessage, res) {
  deleteInternal(oysterMeasurement,
  function(oysterMeasurement) {
    return res.status(400).send({
      message: errorMessage
    });
  }, function(err) {
    return res.status(400).send({
      message: err
    });
  });
};

/**
 * Upload images to protocol oyster measurement
 */
exports.uploadOysterCageConditionPicture = function (req, res) {
  var oysterMeasurement = req.oysterMeasurement;
  var upload = multer(config.uploads.oysterCageConditionUpload).single('newOysterCageConditionPicture');
  var oysterCageConditionUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = oysterCageConditionUploadFileFilter;

  if (oysterMeasurement) {
    if (oysterMeasurement.status === 'incomplete' || oysterMeasurement.status === 'returned' ||
    (checkRole('team lead', req.user) && oysterMeasurement.status === 'submitted')) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          return res.status(400).send({
            message: 'Error occurred while uploading oyster cage condition picture'
          });
        } else {
          var uploadRemote = new UploadRemote();
          uploadRemote.uploadLocalAndRemote(req, res, upload, config.uploads.oysterCageConditionUpload,
          function (fileInfo) {
            if (!oysterMeasurement.conditionOfOysterCage) {
              oysterMeasurement.conditionOfOysterCage = {
                oysterCagePhoto: {}
              };
            }
            oysterMeasurement.conditionOfOysterCage.oysterCagePhoto = fileInfo;

            uploadFileSuccess(oysterMeasurement, res);
          }, function (errorMessage) {
            uploadFileError(oysterMeasurement, errorMessage, res);
          });
        }
      });
    } else {
      res.json({
        status: oysterMeasurement.status,
        scribe: oysterMeasurement.scribeMember.displayName
      });
    }
  } else {
    res.status(400).send({
      message: 'Oyster measurement does not exist'
    });
  }
};

exports.uploadOuterSubstratePicture = function (req, res) {
  var oysterMeasurement = req.oysterMeasurement;
  var substrateIndex = req.substrateIndex;
  var upload = multer(config.uploads.outerSubstrateUpload).single('newOuterSubstratePicture');
  var outerSubstrateUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = outerSubstrateUploadFileFilter;

  if (oysterMeasurement) {
    if (oysterMeasurement.status === 'incomplete' || oysterMeasurement.status === 'returned' ||
    (checkRole('team lead', req.user) && oysterMeasurement.status === 'submitted')) {
      if (substrateIndex && oysterMeasurement.measuringOysterGrowth.substrateShells[substrateIndex]) {
        var uploadRemote = new UploadRemote();
        uploadRemote.uploadLocalAndRemote(req, res, upload, config.uploads.outerSubstrateUpload,
        function (fileInfo) {
          oysterMeasurement.measuringOysterGrowth.substrateShells[substrateIndex].outerSidePhoto = fileInfo;

          uploadFileSuccess(oysterMeasurement, res);
        }, function(errorMessage) {
          uploadFileError(oysterMeasurement, errorMessage, res);
        });
      } else {
        return res.status(400).send({
          message: 'Substrate for oyster measurement does not exist'
        });
      }
    } else {
      res.json({
        status: oysterMeasurement.status,
        scribe: oysterMeasurement.scribeMember.displayName
      });
    }
  } else {
    res.status(400).send({
      message: 'Oyster measurement does not exist'
    });
  }
};

exports.uploadInnerSubstratePicture = function (req, res) {
  var oysterMeasurement = req.oysterMeasurement;
  var substrateIndex = req.substrateIndex;
  var upload = multer(config.uploads.innerSubstrateUpload).single('newInnerSubstratePicture');
  var innerSubstrateUploadFileFilter = require(path.resolve('./config/lib/multer')).imageUploadFileFilter;

  // Filtering to upload only images
  upload.fileFilter = innerSubstrateUploadFileFilter;

  if (oysterMeasurement) {
    if (oysterMeasurement.status === 'incomplete' || oysterMeasurement.status === 'returned' ||
    (checkRole('team lead', req.user) && oysterMeasurement.status === 'submitted')) {
      if (substrateIndex && oysterMeasurement.measuringOysterGrowth.substrateShells[substrateIndex]) {
        var uploadRemote = new UploadRemote();
        uploadRemote.uploadLocalAndRemote(req, res, upload, config.uploads.innerSubstrateUpload,
        function(fileInfo) {
          oysterMeasurement.measuringOysterGrowth.substrateShells[substrateIndex].innerSidePhoto = fileInfo;

          uploadFileSuccess(oysterMeasurement, res);
        }, function(errorMessage) {
          uploadFileError(oysterMeasurement, errorMessage, res);
        });
      } else {
        return res.status(400).send({
          message: 'Substrate for oyster measurement does not exist'
        });
      }
    } else {
      res.json({
        status: oysterMeasurement.status,
        scribe: oysterMeasurement.scribeMember.displayName
      });
    }
  } else {
    res.status(400).send({
      message: 'Oyster measurement does not exist'
    });
  }
};

/**
 * List of protocol oyster measurement
 */
// exports.list = function(req, res) {
//   ProtocolOysterMeasurement.find().sort('-created').populate('user', 'displayName').exec(function(err, oysterMeasurement) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       res.json(oysterMeasurement);
//     }
//   });
// };

/**
 * Protocol Oyster Measurement middleware
 */
exports.oysterMeasurementByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Protocol Oyster Measurement is invalid'
    });
  }

  ProtocolOysterMeasurement.findById(id).populate('teamLead', 'displayName username').populate('scribeMember', 'displayName username')
  .exec(function (err, oysterMeasurement) {
    if (err) {
      return next(err);
    } else if (!oysterMeasurement) {
      return res.status(400).send({
        message: 'No Protocol Oyster Measurement with that identifier has been found'
      });
    }
    req.oysterMeasurement = oysterMeasurement;
    next();
  });
};

exports.substrateIndexByID = function (req, res, next, id) {
  req.substrateIndex = id;
  next();
};

exports.previousOysterMeasurement = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Protocol Oyster Measurement is invalid'
    });
  }

  Expedition.findOne({ 'protocols.oysterMeasurement': id }).populate('protocols.oysterMeasurement')
  .exec(function(err, expedition) {
    if (err) {
      return next(err);
    } else if (!expedition) {
      return res.status(404).send({
        message: 'No protocol with that identifier has been found associated with an expedition'
      });
    }

    Expedition.find({ 'station': expedition.station, 'status': 'published', '_id': { $ne: expedition._id } })
    .populate('protocols.oysterMeasurement').sort('-published').exec(function (err, previousPublished) {
      if (err) {
        return res.status(404).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else if (!previousPublished) {
        Expedition.find({ 'station': expedition.station, 'team': expedition.team, '_id': { $ne: expedition._id } })
        .populate('protocols.oysterMeasurement').sort('-monitoringStartDate').exec(function (err, previousTeams) {
          if (err) {
            return res.status(404).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            req.oysterMeasurement = (previousTeams && previousTeams.length > 0) ?
              previousTeams[0].protocols.oysterMeasurement : null;
            next();
          }
        });
      } else {
        req.oysterMeasurement = (previousPublished && previousPublished.length > 0) ?
          previousPublished[0].protocols.oysterMeasurement : null;
        next();
      }
    });
  });
};
