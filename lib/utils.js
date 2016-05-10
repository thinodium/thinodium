"use strict";


const _ = require('lodash');



/**
 * Bind generator function to given context.
 * @param  {GeneratorFunction|Function} fn function.
 * @param  {Object} ctx   Desired `this` context.
 * @return {GeneratorFunction|Function}
 */
exports.bind = function(fn, ctx) {
  if (exports.isGen(fn)) {
    return function*() {
      return yield fn.apply(ctx, arguments);
    };
  } else {
    return _.bind(fn, ctx);
  }
};





/** 
 * Get whether given function is a generator function.
 *
 * @param {Function} fn A function.
 *
 * @return {Boolean} true if so; false otherwise.
 */
exports.isGen = function(fn) {
  let constructor = fn.constructor;

  if (!constructor) {
    return false;
  }

  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) {
    return true;
  }

  return ('function' == typeof constructor.prototype.next && 'function' == typeof constructor.prototype.throw);
}



