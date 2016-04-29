# Thinodium

[![Build Status](https://travis-ci.org/hiddentao/thinodium.svg?branch=master)](http://travis-ci.org/hiddentao/thinodium)

A "thin ODM" which is less opinionated and tries to give you query flexibility 
whilst still providing helpful document handling.

Features:

* Add virtual fields to documents
* Fully pluggable - easy to add support for your NoSQL DB of choice
* Listen to before and after events on internal asynchronous methods
* Schema validation ([simple-nosql-schema](https://github.com/hiddentao/simple-nosql-schema)).

## Installation

**This package requires Node 4 or above**

```bash
$ npm install thinodium
```

This package provides the core infrastructure. To actually access a particular 
database you will need to additionally install one of the following adapters:

* [thinodium-rethinkdb](https://github.com/hiddentao/thinodium-rethinkdb) - RethinkDB

_NOTE: Please raise a PR if you want me to add your adapter to the above list_.


## Examples

The below examples assume that we're dealing with a RethinkDB database.

Let's first create a database connection and get a model instance that will 
allow us to work with the `User` table.

```js
// db connection
const db = require('rethinkdbdash')();

// thinodium instance
const thinodium = new (require('thinodium'));

// let's load in the thinodium-rethinkdb module as the adapter
thinodium.loadAdapter('rethink', 'thinodium-rethinkdb');

// create the model
const model = thinodium.createModel('rethink', db, 'User');

// initialise the model (this creates the db table and indexes)
yield model.init();

// insert a new user
let user = yield model.insert({
  name: 'john'
});

// change the name
user.name = 'mark';
yield user.save();

// load user with id
let user2 = yield model.get(user.id);

console.log(user2.name); /* mark */
```

The two available public methods are `get()` and `insert()`. These actually 
call into "internal" methods which only deal with raw db data. These are 
documented in the [API docs](https://hiddentao.github.io/thinodium).

We can add virtual fields to documents:

```js
```


## Building

To run the tests:

    $ npm install
    $ npm test

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/hiddentao/thinodium/blob/master/CONTRIBUTING.md).

## License

MIT - see [LICENSE.md](https://github.com/hiddentao/thinodium/blob/master/LICENSE.md)


