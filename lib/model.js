"use strict";

const _ = require('lodash'),
  Q = require('bluebird'),
  schemaBuilder = require('simple-nosql-schema');

const Document = require('./document');


/**
 * Represents a db model/collection.
 */
class Model {
  /**
   * Construct this model instance.
   * 
   * @param  {Object} db  Database connection object.
   * @param  {Object} [cfg] Configuration
   * @param  {String} [cfg.pk] Name of primary key field (if not `id`)
   * @param  {Object} [cfg.schema] Table schema definition (used to create a schema validator)
   * @param  {Object} [cfg.virtuals] Virtual fields to add to `Document` instances.
   * @param  {Object} [cfg.methods] Methods to add to `Document` instances.
   */
  constructor (db, cfg) {
    this._db = db;
    this._cfg = cfg || {};
    if (this._cfg.schema) {
      this._schema = schemaBuilder(this._cfg.schema);
    }
  }

  get db () {
    return this._db;
  }

  get pk () {
    return _.get(this._cfg, 'pk', 'id');
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
   * @param  {Object} doc Raw document.
   * @return {Document}
   */
  wrapDoc (doc) {
    if (doc) {
      doc = new Document(this, doc);

      _.each(_.get(this._cfg, 'methods', {}), (method, key) => {
        doc[key] = _.bind(method, doc);
      });

      _.each(_.get(this._cfg, 'virtuals', {}), (cfg, key) => {
        doc.addVirtual(key, cfg);
      });
    }

    return doc;
  }
}


module.exports = Model;



