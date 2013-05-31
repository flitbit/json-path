if (typeof require === 'function') {
	var expect = require('expect.js'),
	JsonPath = require('..')
	;
}

describe('JSON-path references resolve all valid JSON Pointers', function() {
	'use strict';

	describe('when working with the example data from the rfc', function() {
		var data = {
			"foo":      ["bar", "baz"],
			"":         0,
			"a/b":      1,
			"c%d":      2,
			"e^f":      3,
			"g|h":      4,
			"i\\j":     5,
			"k\"l":     6,
			" ":        7,
			"m~n":      8
		};

		describe('with a JSON pointer to the root ()', function() {
			var p = JsonPath.create('');

			it('#resolve should resolve to the object itself', function() {
				expect(p.resolve(data)).to.contain(data);
			});
		});

		describe('a URI fragment identfier to the root #', function() {
			var p = JsonPath.create('#');

			it('#resolve should resolve to the object itself', function() {
				expect(p.resolve(data)).to.contain(data);
			});

		});

		describe('with a JSON pointer of (/foo)', function() {
			var p = JsonPath.create('/foo');

			it('#resolve should resolve to data["foo"]', function() {
				expect(p.resolve(data)).to.contain(data["foo"]);
			});

		});

		describe('a URI fragment identifier of (#/foo)', function() {
			var p = JsonPath.create('#/foo');

			it('#resolve should resolve to data["foo"]', function() {
				expect(p.resolve(data)).to.contain(data["foo"]);
			});

		});

		describe('with a JSON pointer of (/foo/0)', function() {
			var p = JsonPath.create('/foo/0');

			it('#resolve should resolve to data.foo[0]', function() {
				expect(p.resolve(data)).to.contain(data.foo[0]);
			});

		});

		describe('a URI fragment identifier of (#/foo/0)', function() {
			var p = JsonPath.create('#/foo/0');

			it('#resolve should resolve to data.foo[0]', function() {
				expect(p.resolve(data)).to.contain(data.foo[0]);
			});

		});

		describe('with a JSON pointer of (/)', function() {
			var p = JsonPath.create('/');

			it('#resolve should resolve to data[""]', function() {
				expect(p.resolve(data)).to.contain(data[""]);
			});

		});

		describe('a URI fragment identifier of (#/)', function() {
			var p = JsonPath.create('#/');

			it('#resolve should resolve to data[""]', function() {
				expect(p.resolve(data)).to.contain(data[""]);
			});


		});

		describe('with a JSON pointer of (/a~1b)', function() {
			var p = JsonPath.create('/a~1b');

			it('#resolve should resolve to data["a/b"]', function() {
				expect(p.resolve(data)).to.contain(data["a/b"]);
			});


		});

		describe('a URI fragment identifier of (#/a~1b)', function() {
			var p = JsonPath.create('#/a~1b');

			it('#resolve should resolve to data["a/b"]', function() {
				expect(p.resolve(data)).to.contain(data["a/b"]);
			});


		});

		describe('with a JSON pointer of (/c%d)', function() {
			var p = JsonPath.create('/c%d');

			it('#resolve should resolve to data["c%d"]', function() {
				expect(p.resolve(data)).to.contain(data["c%d"]);
			});


		});

		describe('a URI fragment identifier of (#/c%25d)', function() {
			var p = JsonPath.create('#/c%25d');

			it('#resolve should resolve to data["c%d"]', function() {
				expect(p.resolve(data)).to.contain(data["c%d"]);
			});


		});

		describe('with a JSON pointer of (/e^f)', function() {
			var p = JsonPath.create('/e^f');

			it('#resolve should resolve to data["e^f"]', function() {
				expect(p.resolve(data)).to.contain(data["e^f"]);
			});


		});

		describe('a URI fragment identifier of (#/e%5Ef)', function() {
			var p = JsonPath.create('#/e%5Ef');

			it('#resolve should resolve to data["e^f"]', function() {
				expect(p.resolve(data)).to.contain(data["e^f"]);
			});


		});

		describe('with a JSON pointer of (/g|h)', function() {
			var p = JsonPath.create('/g|h');

			it('#resolve should resolve to data["g|h"]', function() {
				expect(p.resolve(data)).to.contain(data["g|h"]);
			});


		});

		describe('a URI fragment identifier of (#/g%7Ch)', function() {
			var p = JsonPath.create('#/g%7Ch');

			it('#resolve should resolve to data["g|h"]', function() {
				expect(p.resolve(data)).to.contain(data["g|h"]);
			});


		});

		describe('with a JSON pointer of (/i\\j)', function() {
			var p = JsonPath.create('/i\\j');

			it('#resolve should resolve to data["i\\j"]', function() {
				expect(p.resolve(data)).to.contain(data["i\\j"]);
			});


		});

		describe('a URI fragment identifier of (#/i%5Cj)', function() {
			var p = JsonPath.create('#/i%5Cj');

			it('#resolve should resolve to data["i\\j"]', function() {
				expect(p.resolve(data)).to.contain(data["i\\j"]);
			});


		});

		describe('with a JSON pointer of (/k\"l)', function() {
			var p = JsonPath.create('/k\"l');

			it('#resolve should resolve to data["k\"l"]', function() {
				expect(p.resolve(data)).to.contain(data["k\"l"]);
			});


		});

		describe('a URI fragment identifier of (#/k%22l)', function() {
			var p = JsonPath.create('#/k%22l');

			it('#resolve should resolve to data["k\"l"]', function() {
				expect(p.resolve(data)).to.contain(data["k\"l"]);
			});


		});

		describe('with a JSON pointer of (/ )', function() {
			var p = JsonPath.create('/ ');

			it('#resolve should resolve to data[" "]', function() {
				expect(p.resolve(data)).to.contain(data[" "]);
			});


		});

		describe('a URI fragment identifier of (#/%20)', function() {
			var p = JsonPath.create('#/%20');

			it('#resolve should resolve to data[" "]', function() {
				expect(p.resolve(data)).to.contain(data[" "]);
			});


		});

		describe('with a JSON pointer of (/m~0n)', function() {
			var p = JsonPath.create('/m~0n');

			it('#resolve should resolve to data["m~n"]', function() {
				expect(p.resolve(data)).to.contain(data["m~n"]);
			});
		});

		describe('a URI fragment identifier of (#/m~0n)', function() {
			var p = JsonPath.create('#/m~0n');

			it('#resolve should resolve to data["m~n"]', function() {
				expect(p.resolve(data)).to.contain(data["m~n"]);
			});

		});

		describe('a special array pointer from draft-ietf-appsawg-json-pointer-08 (/foo/-)', function() {
			var p = JsonPath.create('/foo/-');

			it('should not resolve via #resolve', function() {
				expect(p.resolve(data)).to.be.empty();
			});

		});

		describe('an invalid pointer', function() {

			it('should fail to parse', function() {
				expect(function() {
					JsonPath.create('a/');
				}).to.throwError();
			});
		});

		describe('an invalid URI fragment identifier', function() {

			it('should fail to parse', function() {
				expect(function() {
					JsonPath.create('#a');
				}).to.throwError();
			});

		});
	});

	describe('when working with complex data', function() {
		var data = {
			a: 1,
			b: {
				c: 2
			},
			d: {
				e: [{a:3}, {b:4}, {c:5}]
			},
			f: null
		};

		it('#resolve should return an empty array when the requested element is undefined (#/g/h)', function() {
			var p = JsonPath.create('#/g/h');
			var unk = p.resolve(data);
			expect(unk).to.be.empty();
		});

		it('#resolve should return null when the requested element has a null value (#/f)', function() {
			var p = JsonPath.create('#/f');
			var unk = p.resolve(data);
			expect(unk).to.contain(null);
		});
	});
});

	describe('using the data defined in prior JSON-Path work (http://goessner.net/articles/JsonPath/)', function() {
		var data = {
			store:
			{
				book: [
				{
					category: "reference",
					author: "Nigel Rees",
					title: "Sayings of the Century",
					price: 8.95
				},
				{
					category: "fiction",
					author: "Evelyn Waugh",
					title: "Sword of Honour",
					price: 12.99
				},
				{
					category: "fiction",
					author: "Herman Melville",
					title: "Moby Dick",
					isbn: "0-553-21311-3",
					price: 8.99
				},
				{
					category: "fiction",
					author: "J. R. R. Tolkien",
					title: "The Lord of the Rings",
					isbn: "0-395-19395-8",
					price: 22.99
				}
				],
				bicycle:
				{
					color: "red",
					price: 19.95
				}
			}
		};

		describe('the path /store/book[*][/author]', function() {
			it('selects the authors of all books', function() {
				var p = JsonPath.create("/store/book[*][/author]");
				var res = p.resolve(data);
				expect(res).to.contain('Evelyn Waugh');
				expect(res).to.contain('Nigel Rees');
				expect(res).to.contain('Herman Melville');
				expect(res).to.contain('J. R. R. Tolkien');
				expect(res).to.have.length(4);
			});
		});

		describe('the path ../author', function() {
			it('selects the authors of all books', function() {
				var p = JsonPath.create("..#/author");
				var res = p.resolve(data);
				expect(res).to.contain('Evelyn Waugh');
				expect(res).to.contain('Nigel Rees');
				expect(res).to.contain('Herman Melville');
				expect(res).to.contain('J. R. R. Tolkien');
				expect(res).to.have.length(4);
			});
		});

		describe('the path ..#/author', function() {
			it('selects the authors of all books', function() {
				var p = JsonPath.create("..#/author");
				var res = p.resolve(data);
				expect(res).to.contain('Evelyn Waugh');
				expect(res).to.contain('Nigel Rees');
				expect(res).to.contain('Herman Melville');
				expect(res).to.contain('J. R. R. Tolkien');
				expect(res).to.have.length(4);
			});
		});

		describe('the path #/store[*]', function() {
			it('selects the items of the store', function() {
				var p = JsonPath.create("#/store[*]");
				var res = p.resolve(data);
				expect(res).to.contain(data.store.book);
				expect(res).to.contain(data.store.bicycle);
				expect(res).to.have.length(2);
			});
		});

		describe('the path #/store[..#/price]', function() {
			it('selects the prices from all items in the store', function() {
				var p = JsonPath.create("#/store[..#/price]"),
				res = p.resolve(data);
				expect(res).to.contain(8.95);
				expect(res).to.contain(12.99);
				expect(res).to.contain(8.99);
				expect(res).to.contain(22.99);
				expect(res).to.contain(19.95);
				expect(res).to.have.length(5);
			});
		});

		describe('the path ../book[0]', function() {
			it('selects the first book', function() {
				var p = JsonPath.create("../book[0]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][0]);
				expect(res).to.have.length(1);
			});
		});

		describe('the path ../book[1]', function() {
			it('selects the second book', function() {
				var p = JsonPath.create("../book[1]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][1]);
				expect(res).to.have.length(1);
			});
		});

		describe('the path ../book[2]', function() {
			it('selects the third book', function() {
				var p = JsonPath.create("../book[2]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][2]);
				expect(res).to.have.length(1);
			});
		});

		describe('the path ../book[3]', function() {
			it('selects the fourth book', function() {
				var p = JsonPath.create("../book[3]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][3]);
				expect(res).to.have.length(1);
			});
		});

		describe('the path ../book[1, 3]', function() {
			it('selects the second and fourth book', function() {
				var p = JsonPath.create("../book[1, 3]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][1]);
				expect(res).to.contain(data["store"]["book"][3]);
				expect(res).to.have.length(2);
			});
		});

		describe('the path ../book[1..3]', function() {
			it('selects the second thru fourth book', function() {
				var p = JsonPath.create("../book[1..3]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][1]);
				expect(res).to.contain(data["store"]["book"][2]);
				expect(res).to.contain(data["store"]["book"][3]);
				expect(res).to.have.length(3);
			});
		});

		describe('the path /store/book[last]', function() {
			it('selects the last book', function() {
				var p = JsonPath.create("/store/book[last]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][data.store.book.length - 1]);
				expect(res).to.have.length(1);
			});
		});

		describe('the path /store/book[first]', function() {
			it('selects the first book', function() {
				var p = JsonPath.create("/store/book[first]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][0]);
				expect(res).to.have.length(1);
			});
		});

		describe('the path /store/book[first, 2, last]', function() {
			it('selects the first, third, and last book', function() {
				var p = JsonPath.create("/store/book[first, 2, last]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][0]);
				expect(res).to.contain(data["store"]["book"][2]);
				expect(res).to.contain(data["store"]["book"][data.store.book.length - 1]);
				expect(res).to.have.length(3);
			});
		});

		describe('the path /store/book[first(2)]', function() {
			it('selects the first 2 books', function() {
				var p = JsonPath.create("/store/book[first(2)]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][0]);
				expect(res).to.contain(data["store"]["book"][1]);
				expect(res).to.have.length(2);
			});
		});


		describe('the path /store/book[count]', function() {
			it('selects the book count', function() {
				var p = JsonPath.create("/store/book[count]"),
				res = p.resolve(data);
				expect(res).to.contain(data.store.book.length);
				expect(res).to.have.length(1);
			});
		});

		describe('the path /store/book[last(2)]', function() {
			it('selects the last 2 books', function() {
				var p = JsonPath.create("/store/book[last(2)]"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][data.store.book.length - 1]);
				expect(res).to.contain(data["store"]["book"][data.store.book.length - 2]);
				expect(res).to.have.length(2);
			});
		});

		describe('the path /store/book[*]/isbn', function() {
			it('selects the last 2 books', function() {
				var p = JsonPath.create("/store/book[*]/isbn"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][2]["isbn"]);
				expect(res).to.contain(data["store"]["book"][3]["isbn"]);
				expect(res).to.have.length(2);
			});
		});

		describe('the path #/store/book[*]#/isbn', function() {
			it('selects the last 2 books', function() {
				var p = JsonPath.create("#/store/book[*]#/isbn"),
				res = p.resolve(data);
				expect(res).to.contain(data["store"]["book"][2]["isbn"]);
				expect(res).to.contain(data["store"]["book"][3]["isbn"]);
				expect(res).to.have.length(2);
			});
		});

		describe('path with user-supplied selector #/store/book[*][@]', function() {
			it('selects the books with prices greater than ten', function() {
				var p = JsonPath.create("#/store/book[*][@]"),
				res = p.resolve(data, function(obj, accum, sel) {
					if (obj.price && obj.price < 10)
						accum.push(obj);
					return accum;
				});
				expect(res).to.contain(data["store"]["book"][0]);
				expect(res).to.contain(data["store"]["book"][2]);
				expect(res).to.have.length(2);
			});
		});

		describe('path with user-supplied selector #/store/book[*][@gt10]', function() {
			it('selects the books with prices greater than ten', function() {
				var p = JsonPath.create("#/store/book[*][@gt10]"),
				res = p.resolve(data, { gt10: function(obj, accum, sel) {
					if (obj.price && obj.price < 10)
						accum.push(obj);
					return accum;
				}});
				expect(res).to.contain(data["store"]["book"][0]);
				expect(res).to.contain(data["store"]["book"][2]);
				expect(res).to.have.length(2);
			});
		});

		describe('path with user-supplied selector followed by further path #/store/book[*][@gt10]/catagory', function() {
			it('selects the books with prices greater than ten', function() {
				var p = JsonPath.create("#/store/book[*][@gt10]/category"),
				res = p.resolve(data, { gt10: function(obj, accum, sel) {
					if (obj.price && obj.price < 10)
						accum.push(obj);
					return accum;
				}});
				expect(res).to.contain(data["store"]["book"][0].category);
				expect(res).to.contain(data["store"]["book"][2].category);
				expect(res).to.have.length(2);
			});
		});
	});
