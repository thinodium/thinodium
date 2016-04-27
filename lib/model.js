"use strict";

const _ = require('lodash'),
  Q = require('bluebird'),
  schemaBuilder = require('simple-nosql-schema');

const Document = require('./document');


/**
 * Represents a db model/collection.
 */
class Model {
  constructor (db, cfg) {
    this._db = db;
    this._cfg = cfg;
    this._schema = schemaBuilder(_.get(cfg, 'schema.table', {}));
  }

  get db () {
    return this._db;
  }

  get name () {
    return this._cfg.name;
  }

  get pk () {
    return _.get(this._cfg, 'schema.pk', 'id');
  }

  get schema () {
    return this._schema;
  }

  /**
   * Initialise this model.
   *
   * This is usually where the table/collection is created if it doesn't 
   * already exist.
   * 
   * @return {Promise}
   */
  init () {
    return Q.resolve();
  }

  /** 
   * Get document by id.
   *
   * @param {*} id Primary key value of document.
   * 
   * @return {Promise} resolves to `Document` if exists, `null` otherwise.
   */
  get (id) {
    return this._get(id).then(_.bind(this.wrapDoc, this));
  }



  /**
   * Get native query object for running a generic query against the db model.
   * @return {Object}
   */
  _qry () {
    throw new Error('Not yet implemented');
  }


  /** 
   * Get document by id.
   *
   * @param {*} id Primary key value of document.
   * 
   * @return {Promise} resolves to `Document` if exists, `null` otherwise.
   */
  _get (id) {
    return Q.reject(new Error('Not yet implemented'));
  } 

  /**
   * Insert new record.
   * @param {Object} rawDoc raw data of record.
   * @return {Promise} resolves to a `Document`.
   */
  _insert (rawDoc) {
    return Q.reject(new Error('Not yet implemented'));
  }

  /**
   * Update record with given id.
   *
   * @param {*} id Primary key value.
   * @param {Object} changes The changed data.
   * @param {Document} [document] A document instance associated with this record.
   * @return {Promise}
   */
  _update (id, changes, document) {
    return Q.reject(new Error('Not yet implemented'));
  }

  /**
   * Remove record with given id.
   * @param {*} id Primary key value.
   * @return {Promise}
   */
  _remove (id) {
    return Q.reject(new Error('Not yet implemented'));
  }

  /**
   * Wrap and return raw query result documents in `Document` instances.
   * @param  {Array|Object} [result] The resulting raw documents.
   * @return {Array|Document}
   */
  _wrap (result) {
    if (result) {
      if (_.isArray(result)) {
        return _.map(result, (doc) => {
          if (doc) {
            return this.wrapDoc(doc);
          } else {
            return doc;
          }
        });
      } else {
        return this.wrapDoc(result);
      }
    } else {
      return result;
    }
  }


  /**
   * Wrap given raw document in a `Document` instance.
   * @param  {Object} doc
   * @return {Document}
   */
  wrapDoc (doc) {
    if (doc) {
      doc = new Document(this, doc);

      _.each(_.get(cfg, 'doc.methods', {}), (method, key) => {
        doc[key] = _.bind(method, doc);
      });

      _.each(_.get(cfg, 'schema.virtuals', {}), (cfg, key) => {
        doc.addVirtual(key, cfg);
      });
    }

    return doc;
  }
}


module.exports = Model;



