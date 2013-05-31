var jpath = require('..')
, expect = require('expect.js')
, data = require('./example-data')

var p = jpath.create("#/store/book[*][@lt10][@format]");

var res = p.resolve(data, {

	lt10: function(obj, accum) {
		if (typeof obj.price === 'number' && obj.price < 10)
			accum.push(obj);
		return accum;
	},

	format: function(obj, accum) {
		accum.push(obj.title.concat(
			": $", obj.price
			));
		return accum;
	}

});

// Expect the result to have formatted strings for
// the twb books priced under $10...
expect(res).to.contain("Sayings of the Century: $8.95");
expect(res).to.contain("Moby Dick: $8.99");
expect(res).to.have.length(2);
