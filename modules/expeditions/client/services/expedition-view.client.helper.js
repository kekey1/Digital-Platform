(function() {
  'use strict';

  angular
    .module('expeditions.services')
    .factory('ExpeditionViewHelper', ExpeditionViewHelper);

  ExpeditionViewHelper.$inject = ['WeatherConditionsService', 'WaterColorsService',
  'WaterFlowService', 'ShorelineTypesService', 'MobileOrganismsService', 'SessileOrganismsService',
  'GarbageExtentsService', 'WindDirectionsService', 'TrueFalsesService', 'WaterTemperatureMethodsService',
  'DissolvedOxygenMethodsService', 'SalinityMethodsService', 'PhMethodsService', 'TurbidityMethodsService',
  'AmmoniaMethodsService', 'NitrateMethodsService', 'WaterTemperatureUnitsService', 'DissolvedOxygenUnitsService',
  'SalinityUnitsService', 'PhUnitsService', 'TurbidityUnitsService', 'AmmoniaUnitsService', 'NitrateUnitsService',
  'lodash', 'moment'];

  function ExpeditionViewHelper(WeatherConditionsService, WaterColorsService,
    WaterFlowService, ShorelineTypesService, MobileOrganismsService, SessileOrganismsService,
    GarbageExtentsService, WindDirectionsService, TrueFalsesService, WaterTemperatureMethodsService,
    DissolvedOxygenMethodsService, SalinityMethodsService, PhMethodsService, TurbidityMethodsService,
    AmmoniaMethodsService, NitrateMethodsService, WaterTemperatureUnitsService, DissolvedOxygenUnitsService,
    SalinityUnitsService, PhUnitsService, TurbidityUnitsService, AmmoniaUnitsService, NitrateUnitsService,
    lodash, moment) {
    var weatherConditions = WeatherConditionsService.query();
    var waterColors = WaterColorsService.query();
    var waterFlows = WaterFlowService.query();
    var shorelineTypes = ShorelineTypesService.query();
    var mobileOrganisms = MobileOrganismsService.query();
    var sessileOrganisms = SessileOrganismsService.query();

    var garbageExtent = GarbageExtentsService.query();
    var windDirection = WindDirectionsService.query();
    var trueFalse = TrueFalsesService.query();

    var waterTemperatureMethods = WaterTemperatureMethodsService.query();
    var dissolvedOxygenMethods = DissolvedOxygenMethodsService.query();
    var salinityMethods = SalinityMethodsService.query();
    var pHMethods = PhMethodsService.query();
    var turbidityMethods = TurbidityMethodsService.query();
    var ammoniaMethods = AmmoniaMethodsService.query();
    var nitratesMethods = NitrateMethodsService.query();

    var waterTemperatureUnits = WaterTemperatureUnitsService.query();
    var dissolvedOxygenUnits = DissolvedOxygenUnitsService.query();
    var salinityUnits = SalinityUnitsService.query();
    var pHUnits = PhUnitsService.query();
    var turbidityUnits = TurbidityUnitsService.query();
    var ammoniaUnits = AmmoniaUnitsService.query();
    var nitratesUnits = NitrateUnitsService.query();


    return {
      getAllWeatherConditions: function() {
        return WeatherConditionsService.query();
      },
      getAllWaterColors: function() {
        return WaterColorsService.query();
      },
      getAllWaterFlows: function() {
        return WaterFlowService.query();
      },
      getAllShorelineTypes: function() {
        return ShorelineTypesService.query();
      },
      getAllGarbageExtent: function() {
        return GarbageExtentsService.query();
      },
      getAllWindDirections: function() {
        return WindDirectionsService.query();
      },
      getAllTrueFalse: function() {
        return TrueFalsesService.query();
      },
      getWeatherCondition: function(value) {
        var index = lodash.findIndex(weatherConditions, function(c) {
          return c.value === value;
        });
        return (index > -1) ? weatherConditions[index].label : '';
      },
      getWaterColors: function(value) {
        var index = lodash.findIndex(waterColors, function(c) {
          return c.value === value;
        });
        return (index > -1) ? waterColors[index].label : '';
      },
      getWaterFlows: function(value) {
        var index = lodash.findIndex(waterFlows, function(f) {
          return f.value === value;
        });
        return (index > -1) ? waterFlows[index].label : '';
      },
      getShorelineTypes: function(value) {
        var index = lodash.findIndex(shorelineTypes, function(t) {
          return t.value === value;
        });
        return (index > -1) ? shorelineTypes[index].label : '';
      },
      getWindDirection: function(value) {
        var index = lodash.findIndex(windDirection, function(t) {
          return t.value === value;
        });
        return (index > -1) ? windDirection[index].label : '';
      },
      getGarbageExtent: function(value) {
        var index = lodash.findIndex(garbageExtent, function(e) {
          return e.value === value;
        });
        return (index > -1) ? garbageExtent[index].label : '';
      },
      getMobileOrganismById: function(organismId) {
        var index = lodash.findIndex(mobileOrganisms, function(m) {
          return organismId === m._id;
        });
        return mobileOrganisms[index];
      },
      getSessileOrganismName: function(value) {
        if (!value) {
          return 'Other';
        } else {
          var index = lodash.findIndex(sessileOrganisms, function(o) {
            return o._id === value;
          });
          return (index > -1) ? sessileOrganisms[index].commonName : '';
        }
      },
      getSessileOrganismPhoto: function(value) {
        if (!value) {
          return '';
        } else {
          var index = lodash.findIndex(sessileOrganisms, function(o) {
            return o._id === value;
          });
          return (index > -1 && sessileOrganisms[index] && sessileOrganisms[index].image) ?
            sessileOrganisms[index].image.path : '';
        }
      },
      getAllWaterTemperatureMethods: function() {
        return WaterTemperatureMethodsService.query();
      },
      getAllDissolvedOxygenMethods: function() {
        return DissolvedOxygenMethodsService.query();
      },
      getAllSalinityMethods: function() {
        return SalinityMethodsService.query();
      },
      getAllPHMethods: function() {
        return PhMethodsService.query();
      },
      getAllTurbidityMethods: function() {
        return TurbidityMethodsService.query();
      },
      getAllAmmoniaMethods: function() {
        return AmmoniaMethodsService.query();
      },
      getAllNitratesMethods: function() {
        return NitrateMethodsService.query();
      },
      getWaterTemperatureMethod: function(value) {
        var index = lodash.findIndex(waterTemperatureMethods, function(c) {
          return c.value === value;
        });
        return (index > -1) ? waterTemperatureMethods[index].label : '';
      },
      getDissolvedOxygenMethod: function(value) {
        var index = lodash.findIndex(dissolvedOxygenMethods, function(c) {
          return c.value === value;
        });
        return (index > -1) ? dissolvedOxygenMethods[index].label : '';
      },
      getSalinityMethod: function(value) {
        var index = lodash.findIndex(salinityMethods, function(c) {
          return c.value === value;
        });
        return (index > -1) ? salinityMethods[index].label : '';
      },
      getPHMethod: function(value) {
        var index = lodash.findIndex(pHMethods, function(c) {
          return c.value === value;
        });
        return (index > -1) ? pHMethods[index].label : '';
      },
      getTurbidityMethod: function(value) {
        var index = lodash.findIndex(turbidityMethods, function(c) {
          return c.value === value;
        });
        return (index > -1) ? turbidityMethods[index].label : '';
      },
      getAmmoniaMethod: function(value) {
        var index = lodash.findIndex(ammoniaMethods, function(c) {
          return c.value === value;
        });
        return (index > -1) ? ammoniaMethods[index].label : '';
      },
      getNitratesMethod: function(value) {
        var index = lodash.findIndex(nitratesMethods, function(c) {
          return c.value === value;
        });
        return (index > -1) ? nitratesMethods[index].label : '';
      },
      getAllWaterTemperatureUnits: function() {
        return WaterTemperatureUnitsService.query();
      },
      getAllDissolvedOxygenUnits: function() {
        return DissolvedOxygenUnitsService.query();
      },
      getAllSalinityUnits: function() {
        return SalinityUnitsService.query();
      },
      getAllPHUnits: function() {
        return PhUnitsService.query();
      },
      getAllTurbidityUnits: function() {
        return TurbidityUnitsService.query();
      },
      getAllAmmoniaUnits: function() {
        return AmmoniaUnitsService.query();
      },
      getAllNitratesUnits: function() {
        return NitrateUnitsService.query();
      },
      getDissolvedOxygenUnit: function(value) {
        var index = lodash.findIndex(dissolvedOxygenUnits, function(c) {
          return c.value === value;
        });
        return (index > -1) ? dissolvedOxygenUnits[index].label : '';
      },
      getSalinityUnit: function(value) {
        var index = lodash.findIndex(salinityUnits, function(c) {
          return c.value === value;
        });
        return (index > -1) ? salinityUnits[index].label : '';
      },
      getPHUnits: function(value) {
        var index = lodash.findIndex(pHUnits, function(c) {
          return c.value === value;
        });
        return (index > -1) ? pHUnits[index].label : '';
      },
      getTurbidityUnit: function(value) {
        var index = lodash.findIndex(turbidityUnits, function(c) {
          return c.value === value;
        });
        return (index > -1) ? turbidityUnits[index].label : '';
      },
      getAmmoniaUnit: function(value) {
        var index = lodash.findIndex(ammoniaUnits, function(c) {
          return c.value === value;
        });
        return (index > -1) ? ammoniaUnits[index].label : '';
      },
      getNitratesUnit: function(value) {
        var index = lodash.findIndex(nitratesUnits, function(c) {
          return c.value === value;
        });
        return (index > -1) ? nitratesUnits[index].label : '';
      },
      getExpeditionDate: function(date) {
        return (date === '1970-01-01T00:00:00.000Z') ? '' :
         moment(date, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('MMMM D, YYYY');
      },
      getExpeditionTimeRange: function(startDate, endDate) {
        return (startDate === '1970-01-01T00:00:00.000Z' || endDate === '1970-01-01T00:00:00.000Z') ? '' :
        moment(startDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('HH:mm')+'-'+
          moment(endDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format('HH:mm');
      },
      getDate: function(date) {
        return (date === '1970-01-01T00:00:00.000Z') ? '' : moment(date).format('MMMM D, YYYY');
      },
      getShortDate: function(date) {
        return (date === '1970-01-01T00:00:00.000Z') ? '' : moment(date).format('M/D/YY');
      },
      getTime: function(date) {
        return (date === '1970-01-01T00:00:00.000Z') ? '' : moment(date).format('h:mma');
      },
      getDateTime: function(date) {
        return (date === '1970-01-01T00:00:00.000Z') ? '' : moment(date).format('MMM D, YYYY, h:mma');
      }
    };
  }
})();
