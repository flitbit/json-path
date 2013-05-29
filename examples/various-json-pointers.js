var expect = require('expect.js'),
jpath = require('..')
;

var obj = {
  a: 1,
  b: {
    c: 2
  },
  d: {
    e: [{a:3}, {b:4}, {c:5}]
  }
};

// JSON Pointers (as strings)

var n = -1
, ub = 1000
, start = process.hrtime();


while(++n < ub) {

  expect(jpath.resolve(obj, "/a")).to.contain(1);
  expect(jpath.resolve(obj, "/b/c")).to.contain(2);
  expect(jpath.resolve(obj, "/d/e/0/a")).to.contain(3);
  expect(jpath.resolve(obj, "/d/e/1/b")).to.contain(4);
  expect(jpath.resolve(obj, "/d/e/2/c")).to.contain(5);

  expect(jpath.resolve(obj, "")).to.contain(obj);
}

// JSON Pointers (as URI fragments)
ub = ub * 2;
n--;
while(++n < ub) {

 expect(jpath.resolve(obj, "#/a")).to.contain(1);
 expect(jpath.resolve(obj, "#/b/c")).to.contain(2);
 expect(jpath.resolve(obj, "#/d/e/0/a")).to.contain(3);
 expect(jpath.resolve(obj, "#/d/e/1/b")).to.contain(4);
 expect(jpath.resolve(obj, "#/d/e/2/c")).to.contain(5);

 expect(jpath.resolve(obj, "#")).to.contain(obj);
}

var complexKeys = {
  "a/b": {
    c: 1
  },
  d: {
    "e/f": 2
  },
  "~1": 3,
  "01": 4
}

expect(jpath.resolve(complexKeys, "/a~1b/c")).to.contain(1);
expect(jpath.resolve(complexKeys, "/d/e~1f")).to.contain(2);
expect(jpath.resolve(complexKeys, "/~01")).to.contain(3);
expect(jpath.resolve(complexKeys, "/01")).to.contain(4);
expect(jpath.resolve(complexKeys, "/a/b/c")).to.be.empty();
expect(jpath.resolve(complexKeys, "/~1")).to.be.empty();

// draft-ietf-appsawg-json-pointer-08 has special array rules
var ary = [ "zero", "one", "two" ];
expect(jpath.resolve(ary, "/01")).to.be.empty();

// Examples from the draft:
var example = {
  "foo": ["bar", "baz"],
  "": 0,
  "a/b": 1,
  "c%d": 2,
  "e^f": 3,
  "g|h": 4,
  "i\\j": 5,
  "k\"l": 6,
  " ": 7,
  "m~n": 8
};

var p = jpath.create('#/foo');
expect(p.resolve(example)).to.contain(example["foo"]);
      
expect(jpath.resolve(example, "")).to.contain(example);
var ans = jpath.resolve(example, "/foo");
expect(ans.length).to.be(1);
expect(ans[0][0]).to.contain("bar");
expect(ans[0][1]).to.contain("baz");
expect(jpath.resolve(example, "/foo/0")).to.contain("bar");
expect(jpath.resolve(example, "/")).to.contain(0);
expect(jpath.resolve(example, "/a~1b")).to.contain(1);
expect(jpath.resolve(example, "/c%d")).to.contain(2);
expect(jpath.resolve(example, "/e^f")).to.contain(3);
expect(jpath.resolve(example, "/g|h")).to.contain(4);
expect(jpath.resolve(example, "/i\\j")).to.contain(5);
expect(jpath.resolve(example, "/k\"l")).to.contain(6);
expect(jpath.resolve(example, "/ ")).to.contain(7);
expect(jpath.resolve(example, "/m~0n")).to.contain(8);

expect(jpath.resolve(example, "#")).to.contain(example);
var ans = jpath.resolve(example, "#/foo");
expect(ans.length).to.be(1);
expect(ans[0][0]).to.contain("bar");
expect(ans[0][1]).to.contain("baz");
expect(jpath.resolve(example, "#/foo/0")).to.contain("bar");
expect(jpath.resolve(example, "#/")).to.contain(0);
expect(jpath.resolve(example, "#/a~1b")).to.contain(1);
expect(jpath.resolve(example, "#/c%25d")).to.contain(2);
expect(jpath.resolve(example, "#/e%5Ef")).to.contain(3);
expect(jpath.resolve(example, "#/g%7Ch")).to.contain(4);
expect(jpath.resolve(example, "#/i%5Cj")).to.contain(5);
expect(jpath.resolve(example, "#/k%22l")).to.contain(6);
expect(jpath.resolve(example, "#/%20")).to.contain(7);
expect(jpath.resolve(example, "#/m~0n")).to.contain(8);

console.log("All tests pass.");