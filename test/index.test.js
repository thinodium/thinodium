"use strict";

const _ = require('lodash'),
  path = require('path'),
  Q = require('bluebird');

const utils = require('./utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  sinon = utils.sinon;

const TestAdapter = require('./testAdapter');

const Thinodium = utils.Thinodium;

const test = utils.createTest(module);



test['connect'] = {
  'relative path to adapter': function*() {
    const db = yield Thinodium.connect(path.join(__dirname, 'testAdapter'));

    db.should.be.instanceof(TestAdapter.Database);
  }
};

