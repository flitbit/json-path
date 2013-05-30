json-path [![Build Status](https://travis-ci.org/flitbit/json-path.png)](http://travis-ci.org/flitbit/json-path)
=========

JSON-Path utility (XPath for JSON) for nodejs and modern browsers.

You may be looking for the prior work [found here](http://goessner.net/articles/JsonPath/). This implementation is a new JSON-Path syntax building on [JSON Pointer (RFC 6901)](http://tools.ietf.org/html/rfc6901) in order to ensure that any valid JSON pointer is also valid JSON-Path.

This is a work in progress with many expressions succeeding, but I've got some performance enhancements and additional testing to complete before I make an NPM package.