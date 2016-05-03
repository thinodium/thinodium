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
    let m = new Model(2, 'table');

    m.db.should.eql(2);
    m.name.should.eql('table');
    expect(m.schema).to.be.undefined;
    m.pk.should.eql('id');
  },
  'with pk': function*() {
    let m = new Model(2, 'table', { pk: 'test' });

    m.pk.should.eql('test');
  },
  'with schema': function*() {
    let m = new Model(2, 'table', { 
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

  this.mocker.stub(m, 'wrapRaw', (rawDoc) => {
    return rawDoc ? '[' + rawDoc + ']' : 'none';
  });

  this.mocker.stub(m, 'rawGet', (id) => {
    return Q.resolve(0 < id ?  'test'  : null);
  });

  m.get(1).should.eventually.eql('[test]');
  m.get(-1).should.eventually.eql('none');
};



test['insert'] = function*() {
  let m = new Model(2);

  this.mocker.stub(m, 'wrapRaw', (rawDoc) => {
    return rawDoc ? '[' + rawDoc + ']' : 'none';
  });

  this.mocker.stub(m, 'rawInsert', (attrs) => {
    return Q.resolve(234);
  });

  m.insert({
    name: 'john'
  }).should.eventually.eql('[234]');

  m.rawInsert.should.have.been.calledWith({
    name: 'john'
  });
};



test['fixture methods'] = {
  beforeEach: function*() {
    this.m = new Model(2);
  },
  'init': function*() {
    this.m.init().should.eventually.be.undefined;
  },
  'rawQry': function*() {
    expect(() => {
      this.m.rawQry();
    }).to.throw('Not yet implemented');
  },
  'rawGet': function*() {
    this.m.rawGet().should.eventually.be.rejectedWith('Not yet implemented')
  },
  'rawUpdate': function*() {
    this.m.rawUpdate().should.eventually.be.rejectedWith('Not yet implemented')
  },
  'rawInsert': function*() {
    this.m.rawInsert().should.eventually.be.rejectedWith('Not yet implemented')
  },
  'rawRemove': function*() {
    this.m.rawRemove().should.eventually.be.rejectedWith('Not yet implemented')
  },
};



test['wrapRaw'] = function*() {
  let m = new Model();

  this.mocker.stub(m, '_wrapRawDoc', (doc) => {
    return '[' + doc + ']';
  });

  expect(m.wrapRaw(null)).to.eql(null);
  m.wrapRaw(2).should.eql('[2]');
  m.wrapRaw([2,null,3,undefined,5]).should.eql([
    '[2]', null, '[3]', undefined, '[5]',
  ]);
};




test['wrap doc'] = {
  'empty': function*() {
    let m = new Model();

    expect(m._wrapRawDoc()).to.be.undefined;
    expect(m._wrapRawDoc(null)).to.be.null;
  },
  'doc': function*() {
    let m = new Model();

    let d = m._wrapRawDoc({
      id: 123,
      name: 'john',
    });

    d.should.be.instanceof(Document);
    d.id.should.eql(123);
    d.name.should.eql('john');
  },
  'adds methods': function*() {
    let m = new Model(null, 'table', {
      docMethods: {
        getName: function() {
          return this.name;
        }
      }
    });

    let d = m._wrapRawDoc({
      id: 123,
      name: 'john',
    });

    d.getName().should.eql('john');
  },
  'adds virtuals': function*() {
    let m = new Model(null, 'table', {
      docVirtuals: {
        nickname: {
          get: function() {
            return `lil' ${this.name}`;
          }
        }
      }
    });

    let d = m._wrapRawDoc({
      id: 123,
      name: 'john',
    });

    d.nickname.should.eql('lil\' john');    
  },
};




test['events'] = {
  beforeEach: function*() {
    class TestModel extends Model {}

    ['rawInsert', 'rawRemove', 'rawUpdate', 'rawGet'].forEach((method) => {
      TestModel.prototype[method] = function() {
        if (this.shouldThrow) {
          return Q.reject(new Error(`${method} throw`));
        } else {
          return Q.resolve(`${method} result`);
        }
      };
    });

    this.TestModel = TestModel;
  },
};

['rawInsert', 'rawRemove', 'rawUpdate', 'rawGet'].forEach((method) => {
  test['events'][method] = {
    'entry': function*() {
      let m = new (this.TestModel);

      let spy = this.mocker.spy();

      m.on(`before:${method}`, spy);

      m[method](123);

      spy.should.have.been.calledWith(123);
    },
    'exit - ok': function*() {
      let m = new (this.TestModel);

      let spy = this.mocker.spy();

      m.on(`after:${method}`, spy);

      let res = yield m[method](123);

      res.should.eql(`${method} result`);

      spy.should.have.been.calledWith('success', `${method} result`);
    },
    'exit - error': function*() {
      let m = new (this.TestModel);
      m.shouldThrow = true;

      let spy = this.mocker.spy();

      m.on(`after:${method}`, spy);

      try {
        yield m[method](123);
        throw new Error('unexpected');
      } catch (err) {
        err.message.should.eql(`${method} throw`);
      }

      spy.should.have.been.calledWith('error');

      _.get(spy.getCall(0), 'args.1').should.be.instanceof(Error);
    },
  };
});





