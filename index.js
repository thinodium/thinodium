"use strict";


class Thinodium {
  constructor() {
    this._adapters = {};
  }

  loadAdapter (typeName, moduleNameOrObject) {
    if (typeof moduleNameOrObject === 'string') {
      moduleNameOrObject = require(moduleNameOrObject);
    }

    this._adapters[typeName] = moduleNameOrObject;    
  }

  create (typeName, db, tableName, cfg) {
    let Model = this._adapters[typeName].Model;

    return new Model(db, tableName, cfg);
  }
}


Thinodium.Model = require('./lib/model');
Thinodium.Document = require('./lib/document');


module.exports = Thinodium;
