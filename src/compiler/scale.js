'use strict';
require('../globals');
var util = require('../util'),
  time = require('./time'),
  colorbrewer = require('colorbrewer'),
  interpolate = require('d3-color').interpolateHsl,
  schema = require('../schema/schema');

var scale = module.exports = {};

scale.names = function(props) {
  return util.keys(util.keys(props).reduce(function(a, x) {
    if (props[x] && props[x].scale) a[props[x].scale] = 1;
    return a;
  }, {}));
};

scale.defs = function(names, encoding, layout, stats, opt) {
  opt = opt || {};

  return names.reduce(function(a, name) {
    var scaleDef = {
      name: name,
      type: scale.type(name, encoding)
    };

    scaleDef.domain = scale.domain(scaleDef, encoding, stats, opt);
    scaleDef = scale.range(scaleDef, encoding, layout, stats, opt);

    return (a.push(scaleDef), a);
  }, []);
};

scale.type = function(name, encoding) {

  switch (encoding.type(name)) {
    case N: //fall through
    case O: return 'ordinal';
    case T:
      var timeUnit = encoding.field(name).timeUnit;
      return timeUnit ? time.scale.type(timeUnit, name) : 'time';
    case Q:
      if (encoding.bin(name)) {
        // TODO: revise this
        return name === COLOR ? 'linear' : 'ordinal';
      }
      return encoding.scale(name).type;
  }
};

scale.domain = function (scaleDef, encoding, stats, opt) {
  opt = opt || {};

  var name = scaleDef.name;

  var field = encoding.field(name);

  // special case for temporal scale
  if (encoding.isType(name, T)) {
    var range = time.scale.domain(field.timeUnit, name);
    if (range) return range;
  }

  // For binned, produce fixed stepped domain.
  // TODO(#614): this must be changed in vg2
  if (field.bin) {

    var fieldStat = stats[field.name],
      bins = util.getbins(fieldStat, field.bin.maxbins || schema.MAXBINS_DEFAULT),
      numbins = (bins.stop - bins.start) / bins.step;
    return util.range(numbins).map(function(i) {
      return bins.start + bins.step * i;
    });
  }

  // For stack, use STACKED data.
  // TODO(#412) revise this
  if (name == opt.stack) {
    return {
      data: STACKED,
      field: encoding.fieldRef(name, {
        prefn: (opt.facet ? 'max_' : '') + 'sum_'
      })
    };
  }

  var aggregate = encoding.aggregate(name),
    timeUnit = field.timeUnit;

  // determine useRawDomain value
  var scaleUseRawDomain = encoding.scale(name).useRawDomain,
    useRawDomain = scaleUseRawDomain !== undefined ?
      scaleUseRawDomain : encoding.config('useRawDomain'),
    notCountOrSum = !aggregate || (aggregate !=='count' && aggregate !== 'sum');

  var dataTable = encoding.dataTable();
  if ( useRawDomain && notCountOrSum && (
      // Q always uses non-ordinal scale except when it's binned and thus uses ordinal scale.
      (encoding.isType(name, Q) && !field.bin) ||
      // T uses non-ordinal scale when there's no unit or when the unit is not ordinal.
      (encoding.isType(name, T) && (!timeUnit || !time.isOrdinalFn(timeUnit)))
    )
  ) {
    dataTable = RAW;
  }

  var domain = {
    data: dataTable,
    field: encoding.fieldRef(name)
  };

  // For ordinal scale, add domain's property if provided.
  var sort = scaleDef.type === 'ordinal' && encoding.sort(name);
  if (sort) { domain.sort = sort; }

  return domain;
};


scale.range = function (scaleDef, encoding, layout, stats) {
  var spec = encoding.scale(scaleDef.name),
    field = encoding.field(scaleDef.name),
    timeUnit = field.timeUnit;

  switch (scaleDef.name) {
    case X:
      scaleDef.range = layout.cellWidth ? [0, layout.cellWidth] : 'width';
      if (scaleDef.type === 'ordinal') {
        scaleDef.bandWidth = encoding.bandSize(X, layout.x.useSmallBand);
      } else {
        if (encoding.isType(scaleDef.name,T) && timeUnit === 'year') {
          scaleDef.zero = false;
        } else {
          scaleDef.zero = spec.zero === undefined ? true : spec.zero;
        }

        scaleDef.reverse = spec.reverse;
      }
      scaleDef.round = true;
      if (scaleDef.type === 'time') {
        scaleDef.nice = timeUnit || encoding.config('timeScaleNice');
      }else {
        scaleDef.nice = true;
      }
      break;
    case Y:
      if (scaleDef.type === 'ordinal') {
        scaleDef.range = layout.cellHeight ?
          (field.bin ? [layout.cellHeight, 0] : [0, layout.cellHeight]) :
          'height';
        scaleDef.bandWidth = encoding.bandSize(Y, layout.y.useSmallBand);
      } else {
        scaleDef.range = layout.cellHeight ? [layout.cellHeight, 0] : 'height';
        if (encoding.isType(scaleDef.name,T) && timeUnit === 'year') {
          scaleDef.zero = false;
        } else {
          scaleDef.zero = spec.zero === undefined ? true : spec.zero;
        }

        scaleDef.reverse = spec.reverse;
      }

      scaleDef.round = true;

      if (scaleDef.type === 'time') {
        scaleDef.nice = timeUnit || encoding.config('timeScaleNice');
      }else {
        scaleDef.nice = true;
      }
      break;
    case ROW: // support only ordinal
      scaleDef.bandWidth = layout.cellHeight;
      scaleDef.round = true;
      scaleDef.nice = true;
      break;
    case COL: // support only ordinal
      scaleDef.bandWidth = layout.cellWidth;
      scaleDef.round = true;
      scaleDef.nice = true;
      break;
    case SIZE:
      if (encoding.is('bar')) {
        // FIXME this is definitely incorrect
        // but let's fix it later since bar size is a bad encoding anyway
        scaleDef.range = [3, Math.max(encoding.bandSize(X), encoding.bandSize(Y))];
      } else if (encoding.is(TEXT)) {
        scaleDef.range = [8, 40];
      } else { //point
        var bandSize = Math.min(encoding.bandSize(X), encoding.bandSize(Y)) - 1;
        scaleDef.range = [10, 0.8 * bandSize*bandSize];
      }
      scaleDef.round = true;
      scaleDef.zero = false;
      break;
    case SHAPE:
      scaleDef.range = 'shapes';
      break;
    case COLOR:
      scaleDef.range = scale.color(scaleDef, encoding, stats);
      if (scaleDef.type !== 'ordinal') scaleDef.zero = false;
      break;
    default:
      throw new Error('Unknown encoding name: '+ scaleDef.name);
  }

  // FIXME(kanitw): Jul 29, 2015 - consolidate this with above
  switch (scaleDef.name) {
    case ROW:
    case COL:
      scaleDef.padding = encoding.config('cellPadding');
      scaleDef.outerPadding = 0;
      break;
    case X:
    case Y:
      if (scaleDef.type === 'ordinal') { //&& !s.bandWidth
        scaleDef.points = true;
        scaleDef.padding = encoding.field(scaleDef.name).band.padding;
      }
  }

  return scaleDef;
};

scale.color = function(s, encoding, stats) {
  var colorScale = encoding.scale(COLOR),
    range = colorScale.range,
    cardinality = encoding.cardinality(COLOR, stats),
    type = encoding.type(COLOR);

  if (range === undefined) {
    var ordinalPalette = colorScale.ordinalPalette,
      quantitativeRange = colorScale.quantitativeRange;

    if (s.type === 'ordinal') {
      if (type === N) {
        // use categorical color scale
        if (cardinality <= 10) {
          range = colorScale.c10palette;
        } else {
          range = colorScale.c20palette;
        }
        return scale.color.palette(range, cardinality, type);
      } else {
        if (ordinalPalette) {
          return scale.color.palette(ordinalPalette, cardinality, type);
        }
        return scale.color.interpolate(quantitativeRange[0], quantitativeRange[1], cardinality);
      }
    } else { //time or quantitative
      return [quantitativeRange[0], quantitativeRange[1]];
    }
  }
};

scale.color.palette = function(range, cardinality, type) {
  // FIXME(kanitw): Jul 29, 2015 - check range is string
  switch (range) {
    case 'category10k':
      // tableau's category 10, ordered by perceptual kernel study results
      // https://github.com/uwdata/perceptual-kernels
      return ['#2ca02c', '#e377c2', '#7f7f7f', '#17becf', '#8c564b', '#d62728', '#bcbd22', '#9467bd', '#ff7f0e', '#1f77b4'];

    // d3/tableau category10/20/20b/20c
    case 'category10':
      return ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

    case 'category20':
      return ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

    case 'category20b':
      return ['#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939', '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39', '#e7ba52', '#e7cb94', '#843c39', '#ad494a', '#d6616b', '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'];

    case 'category20c':
      return ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d', '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476', '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc', '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'];
  }

  // TODO add our own set of custom ordinal color palette

  if (range in colorbrewer) {
    var palette = colorbrewer[range];

    // if cardinality pre-defined, use it.
    if (cardinality in palette) return palette[cardinality];

    // if not, use the highest cardinality one for nominal
    if (type === N) {
      return palette[Math.max.apply(null, util.keys(palette))];
    }

    // otherwise, interpolate
    var ps = cardinality < 3 ? 3 : Math.max.apply(null, util.keys(palette)),
      from = 0 , to = ps - 1;
    // FIXME add config for from / to

    return scale.color.interpolate(palette[ps][from], palette[ps][to], cardinality);
  }

  return range;
};

scale.color.interpolate = function (start, end, cardinality) {

  var interpolator = interpolate(start, end);
  return util.range(cardinality).map(function(i) { return interpolator(i*1.0/(cardinality-1)); });
};
