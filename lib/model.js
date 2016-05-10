"use strict";

const _ = require('lodash'),
  EventEmitter = require('eventemitter3'),
  Q = require('bluebird'),
  schemaBuilder = require('simple-nosql-schema');

const Document = require('./document');


/**
 * Represents a db model/collection.
 */
class Model extends EventEmitter {
  /**
   * Construct this model instance.
   * 
   * @param  {Object} db  Database connection object.
   * @param  {String} name Table name.
   * @param  {Object} [cfg] Configuration
   * @param  {String} [cfg.pk] Name of primary key field (if not `id`)
   * @param  {Object} [cfg.schema] Table schema definition (used to create a schema validator)
   * @param  {Object} [cfg.virtuals] Virtual fields to add to `Document` instances.
   * @param  {Object} [cfg.methods] Methods to add to `Document` instances.
   */
  constructor (db, name, cfg) {
    super();

    this._db = db;

    this._name = name;

    this._cfg = cfg || {};
    
    if (this._cfg.schema) {
      this._schema = schemaBuilder(this._cfg.schema);
    }

    _.each(this._cfg.modelMethods || {}, (m, k) => {
      this[k] = _.bind(m, this);
    });

    // add event hooks to asynchronous internal methods
    let self = this;
    ['rawGet', 'rawUpdate', 'rawRemove', 'rawInsert'].forEach(function(method) {
      let originalMethod = self[method];

      self[method] = function() {
        let args = _.toArray(arguments);

        self.emit.apply(self, [`before:${method}`].concat(args));

        return originalMethod.apply(self, args)
          .then((result) => {
            self.emit(`after:${method}`, 'success', result);

            return result;
          })
          .catch((err) => {
            self.emit(`after:${method}`, 'error', err);

            throw err;
          });
      };
    });
  }

  get db () {
    return this._db;
  }

  get name () {
    return this._name;
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
    return this.rawGet(id)
      .then((rawDoc) => {
        return this.wrapRaw(rawDoc);
      });
  }



  /** 
   * Get all documents.
   *
   * @param {*} id Primary key value of document.
   * 
   * @return {Promise} resolves to `Document` if exists, `null` otherwise.
   */
  getAll () {
    return this.rawGetAll()
      .then((docs) => {
        return this.wrapRaw(docs);
      });
  }



  /** 
   * Insert document.
   *
   * @param {Object} attrs Attributes of the new document.
   * 
   * @return {Promise} resolves to `Document`.
   */
  insert (attrs) {
    return this.rawInsert(attrs)
      .then((rawDoc) => {
        return this.wrapRaw(rawDoc);
      });
  }



  /**
   * Get native query object for running a generic query against the db model.
   * @return {Object}
   */
  rawQry () {
    throw new Error('Not yet implemented');
  }


  /** 
   * Get document by id.
   *
   * @param {*} id Primary key value of document.
   * 
   * @return {Promise} resolves to `Document` if exists, `null` otherwise.
   */
  rawGet (id) {
    return Q.reject(new Error('Not yet implemented'));
  } 


  /** 
   * Get all documents.
   *
   * @return {Promise} resolves to array of `Document`s.
   */
  rawGetAll () {
    return Q.reject(new Error('Not yet implemented'));
  } 




  /**
   * Insert new record.
   * @param {Object} rawDoc raw data of record.
   * @return {Promise} resolves to a `Document`.
   */
  rawInsert (rawDoc) {
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
  rawUpdate (id, changes, document) {
    return Q.reject(new Error('Not yet implemented'));
  }

  /**
   * Remove record with given id.
   * @param {*} id Primary key value.
   * @return {Promise}
   */
  rawRemove (id) {
    return Q.reject(new Error('Not yet implemented'));
  }



  /**
   * Wrap and return raw query result documents in `Document` instances.
   * @param  {Array|Object} [result] The resulting raw documents.
   * @return {Array|Document}
   */
  wrapRaw (result) {
    if (result) {
      if (_.isArray(result)) {
        return _.map(result, (doc) => {
          if (doc) {
            return this._wrapRawDoc(doc);
          } else {
            return doc;
          }
        });
      } else {
        return this._wrapRawDoc(result);
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
  _wrapRawDoc (doc) {
    if (doc) {
      doc = new Document(this, doc);

      _.each(_.get(this._cfg, 'docMethods', {}), (method, key) => {
        doc[key] = _.bind(method, doc);
      });

      _.each(_.get(this._cfg, 'docVirtuals', {}), (cfg, key) => {
        doc.addVirtual(key, cfg);
      });
    }

    return doc;
  }
}


module.exports = Model;



