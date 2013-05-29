if (typeof require === 'function') {
	var expect = require('expect.js'),
	jpath = require('..')
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

		describe('with a JSON pointer to the root ``', function() {
			var p = jpath.create('');

			it('#get should resolve to the object itself', function() {
				expect(p.resolve(data)).to.eql(data);
			});
		});

		describe('a URI fragment identfier to the root #', function() {
			var p = jpath.create('#');

			it('#get should resolve to the object itself', function() {
				expect(p.resolve(data)).to.equal(data);
			});

		});

		describe('with a JSON pointer of `/foo`', function() {
			var p = jpath.create('/foo');

			it('#get should resolve to data["foo"]', function() {
				expect(p.resolve(data)).to.equal(data["foo"]);
			});

		});

		describe('a URI fragment identifier of `#/foo`', function() {
			var p = jpath.create('#/foo');

			it('#get should resolve to data["foo"]', function() {
				expect(p.resolve(data)).to.equal(data["foo"]);
			});

		});

		describe('with a JSON pointer of `/foo/0`', function() {
			var p = jpath.create('/foo/0');

			it('#get should resolve to data.foo[0]', function() {
				expect(p.resolve(data)).to.equal(data.foo[0]);
			});

		});

		describe('a URI fragment identifier of `#/foo/0`', function() {
			var p = jpath.create('#/foo/0');

			it('#get should resolve to data.foo[0]', function() {
				expect(p.resolve(data)).to.equal(data.foo[0]);
			});

		});

		describe('with a JSON pointer of `/`', function() {
			var p = jpath.create('/');

			it('#get should resolve to data[""]', function() {
				expect(p.resolve(data)).to.equal(data[""]);
			});

		});

		describe('a URI fragment identifier of `#/`', function() {
			var p = jpath.create('#/');

			it('#get should resolve to data[""]', function() {
				expect(p.resolve(data)).to.equal(data[""]);
			});


		});

		describe('with a JSON pointer of `/a~1b`', function() {
			var p = jpath.create('/a~1b');

			it('#get should resolve to data["a/b"]', function() {
				expect(p.resolve(data)).to.equal(data["a/b"]);
			});


		});

		describe('a URI fragment identifier of `#/a~1b`', function() {
			var p = jpath.create('#/a~1b');

			it('#get should resolve to data["a/b"]', function() {
				expect(p.resolve(data)).to.equal(data["a/b"]);
			});


		});

		describe('with a JSON pointer of `/c%d`', function() {
			var p = jpath.create('/c%d');

			it('#get should resolve to data["c%d"]', function() {
				expect(p.resolve(data)).to.equal(data["c%d"]);
			});


		});

		describe('a URI fragment identifier of `#/c%25d`', function() {
			var p = jpath.create('#/c%25d');

			it('#get should resolve to data["c%d"]', function() {
				expect(p.resolve(data)).to.equal(data["c%d"]);
			});


		});

		describe('with a JSON pointer of `/e^f`', function() {
			var p = jpath.create('/e^f');

			it('#get should resolve to data["e^f"]', function() {
				expect(p.resolve(data)).to.equal(data["e^f"]);
			});


		});

		describe('a URI fragment identifier of `#/e%5Ef`', function() {
			var p = jpath.create('#/e%5Ef');

			it('#get should resolve to data["e^f"]', function() {
				expect(p.resolve(data)).to.equal(data["e^f"]);
			});


		});

		describe('with a JSON pointer of `/g|h`', function() {
			var p = jpath.create('/g|h');

			it('#get should resolve to data["g|h"]', function() {
				expect(p.resolve(data)).to.equal(data["g|h"]);
			});


		});

		describe('a URI fragment identifier of `#/g%7Ch`', function() {
			var p = jpath.create('#/g%7Ch');

			it('#get should resolve to data["g|h"]', function() {
				expect(p.resolve(data)).to.equal(data["g|h"]);
			});


		});

		describe('with a JSON pointer of `/i\\j`', function() {
			var p = jpath.create('/i\\j');

			it('#get should resolve to data["i\\j"]', function() {
				expect(p.resolve(data)).to.equal(data["i\\j"]);
			});


		});

		describe('a URI fragment identifier of `#/i%5Cj`', function() {
			var p = jpath.create('#/i%5Cj');

			it('#get should resolve to data["i\\j"]', function() {
				expect(p.resolve(data)).to.equal(data["i\\j"]);
			});


		});

		describe('with a JSON pointer of `/k\"l`', function() {
			var p = jpath.create('/k\"l');

			it('#get should resolve to data["k\"l"]', function() {
				expect(p.resolve(data)).to.equal(data["k\"l"]);
			});


		});

		describe('a URI fragment identifier of `#/k%22l`', function() {
			var p = jpath.create('#/k%22l');

			it('#get should resolve to data["k\"l"]', function() {
				expect(p.resolve(data)).to.equal(data["k\"l"]);
			});


		});

		describe('with a JSON pointer of `/ `', function() {
			var p = jpath.create('/ ');

			it('#get should resolve to data[" "]', function() {
				expect(p.resolve(data)).to.equal(data[" "]);
			});


		});

		describe('a URI fragment identifier of `#/%20`', function() {
			var p = jpath.create('#/%20');

			it('#get should resolve to data[" "]', function() {
				expect(p.resolve(data)).to.equal(data[" "]);
			});


		});

		describe('with a JSON pointer of `/m~0n`', function() {
			var p = jpath.create('/m~0n');

			it('#get should resolve to data["m~n"]', function() {
				expect(p.resolve(data)).to.equal(data["m~n"]);
			});


		});

		describe('a URI fragment identifier of `#/m~0n`', function() {
			var p = jpath.create('#/m~0n');

			it('#get should resolve to data["m~n"]', function() {
				expect(p.resolve(data)).to.equal(data["m~n"]);
			});


		});

		describe('a special array pointer from draft-ietf-appsawg-json-pointer-08 `/foo/-`', function() {
			var p = jpath.create('/foo/-');

			it('should not resolve via #get', function() {
				expect(p.resolve(data)).to.not.be.ok();
			});


		});

		describe('an invalid pointer', function() {

			it('should fail to parse', function() {
				expect(function() {
					jpath.create('a/');
				}).to.throwError();
			});
		});

		describe('an invalid URI fragment identifier', function() {

			it('should fail to parse', function() {
				expect(function() {
					jpath.create('#a');
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

		it('#get should return `undefined` when the requested element is undefined (#/g/h)', function() {
			var p = jpath.create('#/g/h');
			var unk = p.resolve(data);
			expect(unk).to.be.an('undefined');
		});

		it('#get should return null when the requested element has a null value (#/f)', function() {
			var p = jpath.create('#/f');
			var unk = p.resolve(data);
			expect(unk).to.be(null);
		});
	});

});
