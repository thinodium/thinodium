"use strict";

var _ = require('lodash'),
  Q = require('bluebird');


var utils = require('./utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  sinon = utils.sinon;

var Thinodium = utils.Thinodium;

var test = utils.createTest(module);



test['adapter'] = {
  'load adapter as object': function*() {
    let t = new Thinodium();

    class Model {
      constructor() {
        this.args = _.toArray(arguments);
      }
    }

    t.loadAdapter('test', {
      Model: Model,
    });
  },
  'use adapter': function*() {
    let t = new Thinodium();

    class Model {
      constructor() {
        this.args = _.toArray(arguments);
      }
    }

    t.loadAdapter('test', {
      Model: Model,
    });

    let m = t.createModel('test', 23, 'table2');

    m.should.be.instanceof(Model);
    m.args.should.eql([23, 'table2', undefined]);
  }
};



