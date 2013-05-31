json-path [![Build Status](https://travis-ci.org/flitbit/json-path.png)](http://travis-ci.org/flitbit/json-path)
=========

JSON-Path utility (XPath for JSON) for nodejs and modern browsers.

You may be looking for the prior work [found here](http://goessner.net/articles/JsonPath/). This implementation is a new JSON-Path syntax building on [JSON Pointer (RFC 6901)](http://tools.ietf.org/html/rfc6901) in order to ensure that any valid JSON pointer is also valid JSON-Path.

## Basics

JSON-Path takes a specially formatted *path* statement and applies it to an object graph in order to *select* results. The results are returned as an array of data that matches the path.

Most paths start out looking like a JSON Pointer...

```javascript
// From: http://goessner.net/articles/JsonPath/
var data = {
  store: {
    book: [
      { category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95
      },
      { category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        price: 12.99
      },
      { category: "fiction",
        author: "Herman Melville",
        title: "Moby Dick",
        isbn: "0-553-21311-3",
        price: 8.99
      },
      { category: "fiction",
        author: "J. R. R. Tolkien",
        title: "The Lord of the Rings",
        isbn: "0-395-19395-8",
        price: 22.99
      }
    ],
    bicycle: {
      color: "red",
      price: 19.95
    }
  }
};
```

The pointer `/store/book/0` refers to the first book in the array of books (the one by Nigen Rees).

**Differentiator**

The thing that makes JSON-Path different from JSON-Pointer is that you can do more than reference a single thing. Instead, you are able to `select` the things out of a structure, such as:

`/store/book[*]/price`
```javascript
[8.95, 12.99, 8.99, 22.99]
```

In the preceding example, the path `/store/book[*]/price` has three distinct statements:

Statement | Meaning
--- | ---
`/store/book` | Get the book property from store. This is similar to `data.store.book` in javascript.
`*` | Select any element (or property).
`/price` | Select the price property.