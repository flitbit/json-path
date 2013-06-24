var expect = require('expect.js'),
util       = require('util'),
jpath      = require('..')
;

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

// jpath preamble is $
//   -- path segments are interpreted the same as JSON Pointer,
//      with selector instructions in square brackets [].

// select the root object:
var p = jpath.create("#");
var res = p.resolve(data);
expect(res).to.contain(data);


// select the authors of all books:
p = jpath.parseSelector("#/store/book[*][#/author]");
res = jpath.executeSelectors(data, p);
expect(res).to.contain('Evelyn Waugh');
expect(res).to.contain('Nigel Rees');
expect(res).to.contain('Herman Melville');
expect(res).to.contain('J. R. R. Tolkien');

// select all authors:
p = jpath.parseSelector("[..#/author]");
res = jpath.executeSelectors(data, p);
expect(res).to.contain('Evelyn Waugh');
expect(res).to.contain('Nigel Rees');
expect(res).to.contain('Herman Melville');
expect(res).to.contain('J. R. R. Tolkien');

// select all things in store
p = jpath.parseSelector("#/store[*]");
res = jpath.executeSelectors(data, p);
expect(res).to.contain(data.store.book);
expect(res).to.contain(data.store.bicycle);

// resolved.should.eql(data);

// select the price of everything in the store
p = jpath.parseSelector("#/store[..#/price]");
res = jpath.executeSelectors(data, p);
expect(res).to.contain(8.95);
expect(res).to.contain(12.99);
expect(res).to.contain(8.99);
expect(res).to.contain(22.99);
expect(res).to.contain(19.95);


// select the third book
p = jpath.parseSelector("[..#/book/2]");
res = jpath.executeSelectors(data, p);
expect(res).to.contain(data.store.book[2]);

p = jpath.parseSelector("[..#/book[2]]");
res = jpath.executeSelectors(data, p);
expect(res).to.contain(data.store.book[2]);

// select the last book
p = jpath.parseSelector("[..#/book[last]]");
res = jpath.executeSelectors(data, p);
expect(res).to.contain(data.store.book[3]);

// select the first two books
p = jpath.parseSelector("[..#/book[0,1]]");
res = jpath.executeSelectors(data, p);
expect(res).to.contain(data.store.book[0]);
expect(res).to.contain(data.store.book[1]);

// select books without an isbn
p = jpath.parseSelector("[..#/book[*][#/isbn]]");
res = jpath.executeSelectors(data, p);

// select author and title from any book
p = jpath.parseSelector("..#/book[*][take(/author,/title)]");
res = jpath.executeSelectors(data, p);
expect(res[0]).to.eql({
  author: "Nigel Rees",
  title: "Sayings of the Century"
});
expect(res[1]).to.eql({
  author: "Evelyn Waugh",
  title: "Sword of Honour"
});
expect(res[2]).to.eql({
  author: "Herman Melville",
  title: "Moby Dick"
});
expect(res[3]).to.eql({
  author: "J. R. R. Tolkien",
  title: "The Lord of the Rings"
});

// select title and price as cost from any book
p = jpath.parseSelector("..#/book[*][take(/title,cost=/price)]");
res = jpath.executeSelectors(data, p);
expect(res[0]).to.eql({
  title: "Sayings of the Century",
  cost: 8.95
});
expect(res[1]).to.eql({
  title: "Sword of Honour",
  cost: 12.99
});
expect(res[2]).to.eql({
  title: "Moby Dick",
  cost: 8.99
});
expect(res[3]).to.eql({
  title: "The Lord of the Rings",
  cost: 22.99
});

// select books priced more than 10 via a selector fn
// p = jpath.parseSelector("[..#/book[*][!{#/price < 10 || !exists(#/author)}][@myfn]]");
p = jpath.parseSelector("[..#/book[*][@myfn]]");
res = jpath.executeSelectors(data, p, {
  myfn: function(obj, accum, sel) {
    if (obj.price && obj.price < 10)
      accum.push(obj);
   return accum;
 }
});
expect(res).to.contain(data.store.book[0]);
expect(res).to.contain(data.store.book[2]);

p = jpath.create("[..#/book[*][@myfn][#/category]]");
res = p.resolve(data, {
  myfn: function(obj, accum, sel) {
    if (obj.price && obj.price < 10)
      accum.push(obj);
   return accum;
 }
});
expect(res).to.contain(data.store.book[0].category);
expect(res).to.contain(data.store.book[2].category);

p = jpath.resolve(data, '/store/book[first(2)]');

p = jpath.create("#/store/book[*][@]");
var res = p.resolve(data, function(obj, accum, sel) {
  if (obj.price && obj.price < 10)
    accum.push(obj);
  return accum;
});
expect(res).to.contain(data["store"]["book"][0]);
expect(res).to.contain(data["store"]["book"][2]);
expect(res).to.have.length(2);

// p = jpath.parseSelector("[..#/book[*][{#/price >= 10}]]");
