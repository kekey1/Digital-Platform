'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Unit Schema
 */

//TODO - numberExpectation as array
var UnitSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  color: {
    type: String,
    default: '',
    trim: true
  },
  icon: {
    type: String,
    default: '',
    trim: true
  },
  stageOne: {
    enduringUnderstandings: {
      fieldWork: {
        type: String,
        default: '',
        trim: true
      },
      scienceContent: {
        type: String,
        default: '',
        trim: true
      }
    },
    essentialQuestions: [{
      type: String,
      trim: true,
      default: []
    }],
    acquisition: {
      content: {
        science: {
          type: String
        },
        math: {
          type: String
        },
        field: {
          type: String
        },
      },
      lessons: {
        science: {
          type: String
        },
        math: {
          type: String
        },
        field: {
          type: String
        }
      }
    }
  },
  stageTwo: {
    evidence: {
      expectations: [{
        type: String,
      }],
      scienceAndEngineering: {
        type: String,
        trim: true
      },
      disciplinaryCoreIdeas: {
        type: String,
        trim: true
      },
      crossCuttingConcepts: {
        type: String,
        trim: true
      }
    },
    assessmentEvidence: {
      researchProjects: [{
        type: String
      }],
      extentions: {
        type: String,
        trim: true
      }
    }
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: {
    type: [{
      type: String
    }],
    default: ['admin']
  },
  updated: {
    type: Array
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: ['published'],
    required: true
  }
});

/**
 * Validations
 */
// UnitSchema.path('lessonUpload.title').validate(function(title) {
//   return !!title;
// }, 'Title cannot be blank');

// UnitSchema.path('lessonUpload.unit').validate(function(unit) {
//   return !!unit;
// }, 'Unit cannot be blank');

/**
 * Statics
 */
UnitSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username displayName').exec(cb);
};

UnitSchema.set('versionKey', false); //TODO
mongoose.model('Unit', UnitSchema);
