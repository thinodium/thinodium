"use strict";

var _ = require('lodash'),
  Q = require('bluebird');


var utils = require('./utils'),
  assert = utils.assert,
  expect = utils.expect,
  should = utils.should,
  sinon = utils.sinon;

var Thinodium = utils.Thinodium,
  Document = Thinodium.Document;


var test = utils.createTest(module);




test['simple'] = {
  beforeEach: function*() {
    this.d = new Document({
      pk: '_id',
    }, {
      _id: 123,
      name: 'john',
    });
  },
  'get keys': function*() {
    this.d.name.should.eql('john');
    this.d.id.should.eql(123);
  },
  'toJSON()': function*() {
    this.d.toJSON().should.eql({
      name: 'john',
      id: 123,
    });
  },
  'changes()': function*() {
    this.d.changes().should.eql({});
  },
};




test['extra data'] = function*() {
  let d = new Document({
    pk: '_id',
  }, {
    _id: 123,
    name: 'john',
  });

  d.__extra.key1 = 123;
};





test['change props'] = {
  beforeEach: function() {
    var d = this.d = new Document({
      pk: '_id',
    }, {
      _id: 456,
      name: 'john',
      age: 23,
      father: 'eric',
      hasKids: true
    });

    d.id.should.eql(456);
    d.name.should.eql('john');
    d.age.should.eql(23);
    d.father.should.eql('eric');
    d.hasKids.should.be.true;

    d.name = 'tim';
    d.mother = 'mary';
    d.father = null;
  },

  'updated getters': function*() {
    this.d.name.should.eql('tim');
    this.d.mother.should.eql('mary');
    should.equal(this.d.father, null);
  },

  'toJSON()': function*() {
    this.d.toJSON().should.eql({
      id: 456,
      name: 'tim',
      mother: 'mary',
      father: null,
      age: 23,
      hasKids: true
    });
  },

  'toJSON() - skips methods': function*() {
    this.d.method1 = function() {};

    this.d.toJSON().should.eql({
      id: 456,
      name: 'tim',
      mother: 'mary',
      father: null,
      age: 23,
      hasKids: true
    });
  },

  'changes()': function*() {
    this.d.changes().should.eql({
      name: 'tim',
      mother: 'mary',
      father: null
    });
  },

  'changes() - skips methods': function*() {
    this.d.method1 = function() {};

    this.d.changes().should.eql({
      name: 'tim',
      mother: 'mary',
      father: null
    });
  },

  'reset()': function*() {
    this.d.reset();

    this.d.changes().should.eql({});
    this.d.name.should.eql('john');
    expect(this.d.mother).to.be.defined;

    this.d.toJSON().should.eql({
      name: 'john',
      age: 23,
      father: 'eric',
      hasKids: true
    })
  },

  'reset() - preserves methods': function*() {
    this.d.method1 = function() {
      return 'test';
    };

    this.d.reset();

    this.d.method1().should.eql('test');
  },

  'markChanged()': function*() {
    var d = new Document(123, {
      name: 'john',
      age: 23,
      father: 'eric',
      hasKids: true
    });

    d.markChanged('name', 'age', 'father');
    d.father = 'mike';

    d.changes().should.eql({
      name: 'john',
      age: 23,
      father: 'mike',
    });

    d.reset();

    d.changes().should.eql({});
  },
};



test['save'] = {
  beforeEach: function*() {
    var m = this.m = {
      pk: '_id',
      rawUpdate: this.mocker.spy(function() {
        return Q.resolve();
      }),
    }

    var d = this.d = new Document(m, {
      _id: 456,
      name: 'john',
      age: 23,
      father: 'eric',
      hasKids: true
    });
  },

  'calls through to model': function*() {
    let doc = this.d;

    doc.dead = 12;
    doc.farmer = true;

    yield doc.save();

    this.m.rawUpdate.should.have.been.calledOnce;
    this.m.rawUpdate.should.have.been.calledWithExactly(doc.id, {
      dead: 12,
      farmer: true,
    }, this.d);
  },

  'resets instance once updated': function*() {
    let doc = this.d;

    doc.dead = 12;
    doc.farmer = true;

    yield doc.save();

    doc.toJSON().should.eql({
      id: doc.id,
      name: 'john',
      age: 23,
      dead: 12,
      farmer: true,
      father: 'eric',
      hasKids: true,
    });

    doc.changes().should.eql({});
  }

};




test['remove'] = {
  beforeEach: function*() {
    var m = this.m = {
      pk: '_id',
      rawRemove: this.mocker.spy(function() {
        return Q.resolve();
      }),
    }

    var d = this.d = new Document(m, {
      _id: 456,
      name: 'john',
      age: 23,
      father: 'eric',
      hasKids: true
    });
  },

  'calls through to collection': function*() {
    let doc = this.d;

    yield doc.remove();

    this.m.rawRemove.should.have.been.calledOnce;
    this.m.rawRemove.should.have.been.calledWithExactly(doc.id);
  },
};





test['reload'] = {
  beforeEach: function*() {
    var m = this.m = {
      pk: '_id',
      rawGet: this.mocker.spy(function() {
        return Q.resolve({
          _id: 456,
          name: 'sam',
          age: 25,
          father: 'tim',
          hasKids: false
        });
      }),
    }

    var d = this.d = new Document(m, {
      _id: 456,
      name: 'john',
      age: 23,
      father: 'eric',
      hasKids: true
    });  
  },

  'calls through to collection in raw mode': function*() {
    let doc = this.d;

    yield doc.reload();

    this.m.rawGet.should.have.been.calledOnce;
    this.m.rawGet.should.have.been.calledWithExactly(doc.id);
  },

  'reloads data': function*() {
    let doc = this.d;

    doc.name = 'Bucky';

    doc.changes().should.eql({
      name: 'Bucky'
    });

    yield doc.reload();

    doc.changes().should.eql({});

    doc.name.should.eql('sam');
    doc.hasKids.should.be.false;
  },

  'preserves methods': function*() {
    let doc = this.d;

    doc.method1 = function() {
      return 'test';
    };

    yield doc.reload();

    doc.method1().should.eql('test');
  },
};



test['virtuals'] = {
  beforeEach: function*() {
    this.d = new Document({
      pk: '_id',
    }, {
      _id: 123,
      name: 'john',
    });
  },
  'can add': function*() {
    let doc = this.d;

    doc.addVirtual('url', {
      get: function() {
        return `/path/${this.name}`;
      }
    });

    doc.url.should.eql(`/path/${doc.name}`);
  },
  'no setter by default': function*() {
    let doc = this.d;

    doc.addVirtual('url', {
      get: function() {
        return `/path/${this.name}`;
      }
    });

    expect(() => {
      doc.url = 'test';
    }).to.throw(`Cannot set url: read-only virtual`);
  },
  'add setter': function*() {
    let doc = this.d;

    doc.addVirtual('url', {
      get: function() {
        return `/path/${this.name}`;
      },
      set: function(val) {
        this.name = val;
      }
    });

    doc.url = 'test';

    doc.name.should.eql('test');
  },
  'included in toJSON': function*() {
    let doc = this.d;

    doc.addVirtual('url', {
      get: function() {
        return `/path/${this.name}`;
      },
    });

    doc.toJSON().should.eql({
      id: 123,
      name: 'john',
      url: '/path/john',
    });
  }
};

