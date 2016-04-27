"use strict";

var _ = require('lodash'),
  Q = require('bluebird'),
  Schema = require('simple-nosql-schema')({}).constructor;



var utils = require('./utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  sinon = utils.sinon;

var Thinodium = utils.Thinodium,
  Document = Thinodium.Document,
  Model = Thinodium.Model;


var test = utils.createTest(module);




test['basic'] = {
  'construction': function*() {
    let m = new Model(2);

    m.db.should.eql(2);
    expect(m.schema).to.be.undefined;
    m.pk.should.eql('id');
  },
  'with pk': function*() {
    let m = new Model(2, { pk: 'test' });

    m.pk.should.eql('test');
  },
  'with schema': function*() {
    let m = new Model(2, { 
      schema: {
        name: {
          type: String,
          required: true,
        },
      },
    });

    m.schema.should.be.instanceof(Schema);
  },
};


test['get'] = function*() {
  let m = new Model(2);

  this.mocker.stub(m, 'wrapDoc', (rawDoc) => {
    return rawDoc ? '[' + rawDoc + ']' : 'none';
  });

  this.mocker.stub(m, '_get', (id) => {
    return Q.resolve(0 < id ?  'test'  : null);
  });

  m.get(1).should.eventually.eql('[test]');
  m.get(-1).should.eventually.eql('none');
};



test['fixture methods'] = {
  beforeEach: function*() {
    this.m = new Model(2);
  },
  'init': function*() {
    this.m.init().should.eventually.be.undefined;
  },
  '_qry': function*() {
    expect(() => {
      this.m._qry();
    }).to.throw('Not yet implemented');
  },
  '_get': function*() {
    this.m._get().should.eventually.be.rejectedWith('Not yet implemented')
  },
  '_update': function*() {
    this.m._update().should.eventually.be.rejectedWith('Not yet implemented')
  },
  '_insert': function*() {
    this.m._insert().should.eventually.be.rejectedWith('Not yet implemented')
  },
  '_remove': function*() {
    this.m._remove().should.eventually.be.rejectedWith('Not yet implemented')
  },
};



test['_wrap'] = function*() {
  let m = new Model();

  this.mocker.stub(m, 'wrapDoc', (doc) => {
    return '[' + doc + ']';
  });

  expect(m._wrap(null)).to.eql(null);
  m._wrap(2).should.eql('[2]');
  m._wrap([2,null,3,undefined,5]).should.eql([
    '[2]', null, '[3]', undefined, '[5]',
  ]);
};




test['wrap doc'] = {
  'empty': function*() {
    let m = new Model();

    expect(m.wrapDoc()).to.be.undefined;
    expect(m.wrapDoc(null)).to.be.null;
  },
  'doc': function*() {
    let m = new Model();

    let d = m.wrapDoc({
      id: 123,
      name: 'john',
    });

    d.should.be.instanceof(Document);
    d.id.should.eql(123);
    d.name.should.eql('john');
  },
  'adds methods': function*() {
    let m = new Model(null, {
      methods: {
        getName: function() {
          return this.name;
        }
      }
    });

    let d = m.wrapDoc({
      id: 123,
      name: 'john',
    });

    d.getName().should.eql('john');
  },
  'adds virtuals': function*() {
    let m = new Model(null, {
      virtuals: {
        nickname: {
          get: function() {
            return `lil' ${this.name}`;
          }
        }
      }
    });

    let d = m.wrapDoc({
      id: 123,
      name: 'john',
    });

    d.nickname.should.eql('lil\' john');    
  },
};



