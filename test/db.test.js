"use strict";

var _ = require('lodash'),
  Q = require('bluebird'),
  Schema = require('sjv')({}).constructor;



var utils = require('./utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  sinon = utils.sinon;

var Thinodium = utils.Thinodium,
  Database = Thinodium.Database;


var test = utils.createTest(module);




test['basic'] = {
  'construction': function*() {
    let db = new Database;
  },
};


test['connect'] = {
  beforeEach: function*() {
    this.db = new Database();

    this.mocker.stub(this.db, '_connect', (options) => {
      return Q.resolve(123);
    });
  },
  'default': function*() {
    let db = this.db;

    yield db.connect('blah');

    db._connect.should.have.been.calledWith('blah');
    db.isConnected.should.be.true;
    db.connection.should.eql(123);
  },
  'fails if already connected': function*() {
    let db = this.db;

    yield db.connect();

    db.connect().should.be.rejectedWith('Already connected');
  },
};




test['disconnect'] = {
 beforeEach: function*() {
   this.db = new Database();

   this.mocker.stub(this.db, '_disconnect', () => {
     return Q.resolve();
   });
 },
 'default': function*() {
    let db = this.db;

    db._connection = 123;

    yield db.disconnect();

    db._disconnect.should.have.been.calledWith(123);
    db.isConnected.should.be.false;
    expect(db.connection).to.be.null;
  },
  'fails if not connected': function*() {
    let db = this.db;

    db.disconnect().should.be.rejectedWith('Not connected');
  },
};



test['model'] = {
  beforeEach: function*() {
    this.db = new Database();
  },
  'calls through to _model': function*() {
    let db = this.db;

    db._connection = 123;

    let model = {
      init: this.mocker.spy(() => {
        return Q.resolve();
      }),
    };

    this.mocker.stub(db, '_model', () => {
      return model;
    });

    db.model('test').should.eventually.eql(model);

    model.init.should.have.been.calldeOnce;
  },
};
