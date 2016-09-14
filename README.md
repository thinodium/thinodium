# ![Thinodium](https://hiddentao.github.io/thinodium/img/logo.svg)

[![Build Status](https://travis-ci.org/hiddentao/thinodium.svg?branch=master)](http://travis-ci.org/hiddentao/thinodium)

A "thin ODM" which is less opinionated and tries to give you query flexibility 
whilst still providing helpful document handling.

Features:

* Allows you to handle connections yourself
* Add virtual fields to documents
* Fully pluggable - easy to add support for your NoSQL DB of choice
* Listen to before and after events on internal asynchronous methods
* Schema validation ([simple-nosql-schema](https://github.com/hiddentao/simple-nosql-schema)).

Documentation available at[https://hiddentao.github.io/thinodium/](https://hiddentao.github.io/thinodium/).

## Installation

**This package requires Node 4 or above**

```bash
$ npm install thinodium
```

This package provides the core infrastructure. To actually access a particular 
database you will need to additionally install one of the following adapters:

* [thinodium-rethinkdb](https://github.com/hiddentao/thinodium-rethinkdb) - RethinkDB

_NOTE: Please raise a PR if you want me to add your adapter to the above list_.


## Basic usage

Let's first create a database connection:

```js
// thinodium instance
const Thinodium = require('thinodium');

// create the connection
const db = yield Thinodium.connect('rethinkdb', {
  db: 'mydb',
});
```

Thinodium will try to load an NPM module called `thinodium-rethinkdb` (which 
is our intention in this example). If not 
available it will try to load a module called `rethinkdb`. Once loaded it will 
instantiate a database connection through that module, passing in the second 
parameter to `connect()`.

If we wished to add a custom adapter but not as an NPM module we could simply 
provide its path to `connect()`:

```js
// connect using custom adatper
const db = yield Thinodium.connect('path/to/custom/adapter', {
  db: 'mydb',
});

```

**Models**

Once we have our database connection setup we can access models (i.e. tables) 
within the database:

```js
// get the model
const model = yield db.model('User');

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

Both `get()` and `insert()` return `Thinodium.Document` instances. 
These internally call through to the methods prefixed with `raw` - methods 
which you can also use directly if you do not wish to deal with `Document`s. 
These are documented in the [API docs](https://hiddentao.github.io/thinodium).

**Document customization**

Model documents (each representing a row in the table) can be customized. We 
can add virtual fields and additional methods:

```js
// create the model
const model = yield db.model('User', {
  docMethods: {
    padName: function(str) {
      this.name += str;
    } 
  },
  docVirtuals: {
    fullName: {
      get: function() {
        return this.name + ' smith';
      }
    }
  }
});

// insert a new user
let user = yield model.insert({
  name: 'john'
});

console.log(user2.fullName); /* mark smith */

user.padName('test');

console.log(user2.fullName); /* marktest smith */
```

**Schema validation**

Schema validation is performed by [simple-nosql-schema](https://github.com/hiddentao/simple-nosql-schema), and is used if a schema is provided in the initial model config:

```js
// create the model
const model = yield db.model('User', {
  // tell Thinodium to validate all updates and inserts against the given schema
  schema: {
    age: {
      type: Number,
      required: true,
    },
  }
});

// insert a new user
let user1 = yield model.insert({ name: 'john', }); /* throws Error since age is missing */ 

let user2 = yield model.insert({
  name: 'john',
  age: 23,
});
user2.age = 'test';

yield user2.save();  /* throws Error since age must be a number */
```

Note that schema validation is partial. If the insert or update contains a 
key that is not mentioned within the schema then that key gets passed through 
without any checks. This allows for flexibility - you only need to vaildate 
the parts of a model's schema you're interested in.

## API 

Check out the [API docs](https://hiddentao.github.io/thinodium) for information on supported methods.

## Creating an Adapter

An adapter has to extend the base `Database` and `Model` classes and 
override the necessary internal methods:

```js
"use strict";

const Thinodium = require('thinodium');

class Database extends Thinodium.Database {
  _connect (options) {
    return new Promise((resolve, reject) => {
      // do what's needed for connection here and save into "connection" var
      resolve(connection);      
    });
  }

  _disconnect (connection) {
    return new Promise((resolve, reject) => {
      // disconnect connection
      resolve();
    });
  }

  _model (connection, name, config) {
    return new Model(connection, name, config);
  }
}



class Model extends thinodium.Model {
  rawQry() {
    // return object for doing raw querying
  }

  rawGet (id) {
    return new Promise((resolve, reject) => {
      // fetch doc with given id
      resolve(doc);      
    });
  }

  rawGetAll (id) {
    return new Promise((resolve, reject) => {
      // fetch all docs
      resolve(docs);      
    });
  }

  rawInsert (attrs) {
    return new Promise((resolve, reject) => {
      // insert doc
      resolve(doc);      
    });
  }

  rawUpdate (id, changes, document) {
    return new Promise((resolve, reject) => {
      // update doc
      resolve();
    });
  }

  rawRemove (id) {
    return new Promise((resolve, reject) => {
      // remove doc with id
      resolve();      
    });
  }
}


module.exports = Database;
```



## Building

To run the tests:

    $ npm install
    $ npm test

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/hiddentao/thinodium/blob/master/CONTRIBUTING.md).

## License

MIT - see [LICENSE.md](https://github.com/hiddentao/thinodium/blob/master/LICENSE.md)


