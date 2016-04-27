"use strict";

const _ = require('lodash'),
  Q = require('bluebird');



/**
 * Represents a document within a model.
 *
 * (Based on version in `hiddentao/robe` NPM package).
 */
class Document {
  /**
   * Constructor.
   *
   * @param  {Model} model The associated model.
   * @param  {Object} doc The raw document.
   */
  constructor (model, doc) {
    doc = doc || {};

    Object.defineProperties(this, {
      __model: {
        enumerable: false,
        writable: false,
        value: model
      },
      __newDoc: {
        enumerable: false,
        writable: true,
        value: {}
      },
      __keyConfig: {
        enumerable: false,
        writable: true,
        value: {}
      },
      __marked: {
        enumerable: false,
        writable: true,
        value: {}
      },
      // can store any extra data that's not intended for persistence
      __extra: {
        enumerable: false,
        writable: true,
        value: {}
      },
    });

    this._resetProperties(doc);
  }

  /**
   * Reset original properties to given doc.
   * @private
   */
  _resetProperties (doc) {
    Object.defineProperty(this, '__doc', {
      enumerable: false,
      writable: true,
      value: doc
    });

    this.__newDoc = {};
    this.__marked = {};

    // from doc
    for (let key in this.__doc) {
      if (this.__model.pk !== key) {
        this._defineProperty(key);
      }
    }

    // set id
    this._defineProperty('id', {
      realKey: this.__model.pk,
      readOnly: true,
    });

    // delete any extraneous properties
    Object.keys(this).forEach((key) => {
      let keyConfig = _.get(this.__keyConfig, key, {});

      // if id or virtual or a function then skip
      if ('id' === key || keyConfig.virtual || _.isFunction(this[key])) {
        return;
      }

      if (!this.__doc.hasOwnProperty(key)) {
        delete this[key];
      }
    });
  }


  _defineProperty (key, options) {
    options = _.extend({
      realKey: key,
      readOnly: false,
    }, options);

    this.__keyConfig[key] = options;

    // if property not yet defined
    if (!Object.getOwnPropertyDescriptor(this, key)) {
      // ...then define it!
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get: function() {
          return _.has(this.__newDoc, options.realKey) 
            ? this.__newDoc[options.realKey] 
            : this.__doc[options.realKey];
        },
        set: function(val) {
          if (options.readOnly) {
            throw new Error(`Cannot modify ${key}: read-only`);
          }

          this.__newDoc[options.realKey] = val;
        }
      });
    }
  }


  /**
   * Add a virtual field definition.
   *
   * Virtual fields get included when converting to JSON representation.
   * 
   * @param {String} key    Accessor name.
   * @param {Object} config Field configuration
   * @param {Object} config.get Field getter
   * @param {Object} [config.set] Field setter
   */
  addVirtual(key, config) {
    this.__keyConfig[key] = {
      virtual: true,
      config: config,
    };

    Object.defineProperty(this, key, {
      enumerable: true,
      configurable: true,
      get: _.bind(config.get, this),
      set: config.set ? _.bind(config.set, this) : function() {
        throw new Error(`Cannot set ${key}: read-only virtual`);
      }
    });
  }


  /**
   * Mark a property as having changed.
   *
   * This is useful if you a change a value within a non-scalar (e.g. `object`) 
   * property or an array.
   * 
   * @param  {Array} ...keys Properties to mark as having changed.
   * @return {[type]}     [description]
   */
  markChanged () {
    let args = _.toArray(arguments);

    for (let arg of args) {
      this.__marked[arg] = true;
    }
  }


  /**
   * Get JSON representation of this doc.
   * @return {Object}
   */
  toJSON () {
    let ret = {};

    Object.keys(this).forEach((key) => {
      // if it's not a function (virtuals are ok!)
      if (!_.isFunction(this[key])) {
        ret[key] = this[key];
      }
    });

    return ret;
  }


  /**
   * Get changed properties.
   * @return {Object}
   */
  changes () {
    let ret = {};

    Object.keys(this).forEach((key) => {      
      let keyConfig = _.get(this.__keyConfig, key, {});

      // if id or virtual or a function then skip
      if ('id' === key || keyConfig.virtual || _.isFunction(this[key])) {
        return;
      }

      if ( (this.__doc[key] !== this[key]) 
              || this.__marked[key] ) {
        ret[key] = this[key];
      }
    });

    return ret;
  }


  /**
   * Reset all changes made to this doc.
   *
   * This will remove newly added properties and revert pre-existing ones 
   * to their original values.
   */
  reset () {
    Object.keys(this).forEach((key) => {
      let keyConfig = _.get(this.__keyConfig, key, {});

      // if virtual or a function then skip
      if (keyConfig.virtual || _.isFunction(this[key])) {
        return;
      }

      // if it's an original property
      if (this.__doc.hasOwnProperty(key)) {
        delete this.__newDoc[key];
      }
      // if it's a newly added one
      else {
        delete this[key];
      }
    });

    // reset marked properties
    this.__marked = {};
  }



  /**
   * Persist changes made to this document.
   * @return {Promise}
   */
  save () {
    return Q.try(() => {
      let changes = this.changes();

      // set actual key names where needed
      _.each(this.__keyConfig, function(options, keyName) {
        // if it's virtual then skip
        if (options.virtual) {
          return;
        }

        if (undefined !== changes[keyName] && options.realKey !== keyName) {
          changes[options.realKey] = changes[keyName];

          delete changes[keyName];
        }
      });

      return this.__model._update(this.id, changes, this)
        .then(() => {
          // reset properties
          let newDoc = this.toJSON();

          delete newDoc.id;
          newDoc[this.__model.pk] = this.id;

          this._resetProperties(newDoc);
        });
    });
  }



  /**
   * Remove this document from the model.
   * @return {Promise}
   */
  remove () {
    return this.__model._remove(this.id);
  }



  /**
   * Reload this document from the model.
   * @return {Promise}
   */
  reload () {
    return this.__model._get(this.id)
      .then((doc) => {
        this._resetProperties(doc);
      });
  }
}





module.exports = Document;

