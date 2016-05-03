"use strict";

const ADAPTERS = {};

exports.connect = function(adapter, options) {
  try {
    ADAPTERS[adapter] = require(`thinodium-${adapter}`);    
  } catch (err) {
    ADAPTERS[adapter] = require(adapter);
  }

  let db = new (ADAPTERS[adapter].Database);

  db.connect(options)

  return ADAPTERS[adapter].connect(options);
}






class Thinodium {
  constructor() {
    this.
  }

  loadAdapter (typeName, moduleNameOrObject) {
    if (typeof moduleNameOrObject === 'string') {
      moduleNameOrObject = require(moduleNameOrObject);
    }

    this.ADAPTERS[typeName] = moduleNameOrObject;    
  }

  create (typeName, db, tableName, cfg) {
    let Model = this.ADAPTERS[typeName].Model;

    return new Model(db, tableName, cfg);
  }
}


Thinodium.Model = require('./lib/model');
Thinodium.Document = require('./lib/document');


module.exports = Thinodium;
