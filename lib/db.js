"use strict";

const _ = require('lodash'),
  EventEmitter = require('eventemitter3'),
  Q = require('bluebird');



/**
 * Represents a db model/collection.
 */
class Database extends EventEmitter {
  constructor () {
    super();

    this._connection = null;
  }


  get isConnected () {
    return !!this._connection;
  }


  connect () {
    if (this._connection) {
      return Q.reject(new Error('Already connected'));
    }

    return this._connect.apply(this, arguments)
      .then((db) => {
        this._connection = db;
      });
  }


  disconnect () {
    if (!this._connection) {
      return Q.reject(new Error('Not connected'));
    }

    return this._disconnect(this._connection)
      .then(() => {
        this._connection = null;
      });
  }


  model (name, config) {
    let model = this._model(this._connection, name, config);

    return model.init()
      .then(() => {
        return model;
      })
  }



  /**
   * Get a `Model` instance.
   * @return {Promise}
   */
  _model (connection, name, config) {
    return Q.reject(new Error('Not yet implemented'));
  }



  /**
   * Connect to db.
   *
   * @param {Object} options connection options.
   *
   * @return {Promise} resolve to db connection.
   */
  _connect (options) {
    return Q.reject(new Error('Not yet implemented'));
  };



  /**
   * Disconnect to db.
   *
   * @return {Promise}
   */
  _disconnect (connection) {
    return Q.reject(new Error('Not yet implemented'));
  };

}




module.exports = Database;



