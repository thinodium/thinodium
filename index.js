"use strict";

const ADAPTERS = {};

exports.connect = function(adapter, options) {
  try {
    ADAPTERS[adapter] = require(`thinodium-${adapter}`);    
  } catch (err) {
    ADAPTERS[adapter] = require(adapter);
  }

  let db = new (ADAPTERS[adapter].Database);

  return db.connect(options);
}


exports.Database = require('./lib/db');
exports.Model = require('./lib/model');
exports.Document = require('./lib/document');
