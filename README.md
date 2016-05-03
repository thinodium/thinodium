# Thinodium

[![Build Status](https://travis-ci.org/hiddentao/thinodium.svg?branch=master)](http://travis-ci.org/hiddentao/thinodium)

A "thin ODM" which is less opinionated and tries to give you query flexibility 
whilst still providing helpful document handling.

Features:

* Allows you to handle connections yourself
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

**Basic**

Let's first create a database connection and get a model instance that will 
allow us to work with the `User` table.

```js
// thinodium instance
const thinodium = require('thinodium');

// create the connection
const db = yield thinodium.connect('rethinkdb');

// create the model
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

Both `get()` and `insert()` return `Thinodium.Document` instances. These internally call 
through to the methods prefixed with `raw` - methods which you can also use 
directly if you do not wish to deal with `Document`s. These are 
documented in the [API docs](https://hiddentao.github.io/thinodium).

**Document customization**

We can add virtual fields and additional methods to `Document`s:

```js
// create the model
const model = db.createModel('User', {
  methods: {
    padName: function(str) {
      this.name += str;
    } 
  },
  virtuals: {
    fullName: {
      get: function() {
        return this.name + ' smith';
      }
    }
  }
});

// initialise the model (this creates the db table and indexes)
yield model.init();

// insert a new user
let user = yield model.insert({
  name: 'john'
});

console.log(user2.fullName); /* mark smith */

user.padName('test');

console.log(user2.fullName); /* marktest smith */
```

**Schema validation**

Schema validation is performed by [simple-nosql-schema](https://github.com/hiddentao/simple-nosql-schema).

```js
// create the model
const model = thinodium.createModel('rethink', db, 'User', {
  schema: {
    age: {
      type: Number,
      required: true,
    },
  }
});

// initialise the model (this creates the db table and indexes)
yield model.init();

// insert a new user
let user1 = yield model.insert({ name: 'john', }); /* throws Error since age is missing */ 

let user2 = yield model.insert({
  name: 'john',
  age: 23,
});
user2.age = 'test';

yield user2.save();  /* throws Error since age must be a number */
```

Check out [the docs](https://hiddentao.github.io/thinodium) for more information.

## Building

To run the tests:

    $ npm install
    $ npm test

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/hiddentao/thinodium/blob/master/CONTRIBUTING.md).

## License

MIT - see [LICENSE.md](https://github.com/hiddentao/thinodium/blob/master/LICENSE.md)


