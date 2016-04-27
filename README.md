# Thinodium

[![Build Status](https://travis-ci.org/hiddentao/thinodium.svg?branch=master)](http://travis-ci.org/hiddentao/thinodium)

A "thin ODM" which is less opinionated and tries to give you query flexibility 
whilst still providing helpful document handling.

Features:

* Fully pluggable - easy to add support for your NoSQL DB of choice
* Listen to before and after events on internal asynchronous methods
* Work with ODM-style documents or raw Mongo data - the choice is yours
* Schema validation ([simple-nosql-schema](https://github.com/hiddentao/simple-nosql-schema)).

## Installation

**This package requires Node 4 or above**

```bash
$ npm install thinodium
```

This package provides the core infrastructure. To actually access a particular 
database you will need to additionally install one of the following adapters:

* thinodium-rethink - RethinkDB

_NOTE: Please raise a PR if you want me to add your adapter to the above list_.


## Examples

The below examples assume that we're dealing with a RethinkDB database.



## Building

To run the tests:

    $ npm install
    $ npm test

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](https://github.com/hiddentao/thinodium/blob/master/CONTRIBUTING.md).

## License

MIT - see [LICENSE.md](https://github.com/hiddentao/thinodium/blob/master/LICENSE.md)


