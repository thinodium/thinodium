"use strict";

const Q = require('bluebird');


class Database {
  connect () {
    return Q.resolve();
  }

  disconnect () {
    return Q.resolve();
  }
}


class Model {
  init () {
    return Q.resolve();
  }
}


exports.Database = Database;
exports.Model = Model;
