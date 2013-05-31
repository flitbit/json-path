var jpath = require('..')
, expect = require('expect.js')
, data = require('./example-data')

var p = jpath.create("#/store/book[*][@]");

var res = p.resolve(data, function(obj, accum) {
  if (typeof obj.price === 'number' && obj.price < 10)
    accum.push(obj);
  return accum;
});

// Expect the result to have the two books priced under $10...
expect(res).to.contain(data["store"]["book"][0]);
expect(res).to.contain(data["store"]["book"][2]);
expect(res).to.have.length(2);
