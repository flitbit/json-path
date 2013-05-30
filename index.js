;(function(undefined) {
	"use strict";

	var $scope
	, conflict, conflictResolution = [];
	if (typeof global == 'object' && global) {
		$scope = global;
		conflict = global.JsonPath;
	} else if (typeof window !== 'undefined'){
		$scope = window;
		conflict = window.JsonPath;
	} else {
		$scope = {};
	}
	if (conflict) {
		conflictResolution.push(
			function() {
				if ($scope.JsonPath === JsonPath) {
					$scope.JsonPath = conflict;
					conflict = undefined;
				}
			});
	}
	if (typeof $scope.JsonPointer === 'undefined' && typeof require === 'function') {
		$scope.JsonPointer = require('json-ptr');
	}

	function dbc(requirements, description) {
		requirements = (Array.isArray(requirements)) ? requirements : [requirements];
		var i, disposition;
		for(i = 0; i < requirements.length; i++) {
			var req = requirements[i];
			disposition = (typeof req === 'function') ? req() : (req);
			if(!disposition) {
				description = description || 'Failed contract requirement:'.concat(req);
				throw new Error((typeof description === 'function') ? description() : description);
			}
		}
	}

	function seekAny(source, cursor, chars) {
		chars = (Array.isArray(chars)) ? chars : [chars];
		var i = cursor
		, j
		, len = source.length
		, clen = chars.length;
		while(++i < len) {
			j = -1;
			while(++j < clen) {
				if (source[i] === chars[j])
					return i;
			}
		}
		return -1;
	}

	function expectMatchingClose(source, cursor, closeCh) { 
		var openCh = source[cursor]
		, i = cursor
		, len = source.length
		, stack = []
		;
		stack.push(cursor);
		while(++i < len) {
			if (source[i] === openCh) {
				stack.push(cursor);
			} else if (source[i] === closeCh) {
				stack.pop();
				if (stack.length === 0) {
					break;
				}
			}
		}
		if (stack.length) { 
			throw new Error(
				'Expected `'.concat(source[0], '` to have a matching `', closeCh, '`.')
				);
		}
		return i;
	}

	function fromJsonPointer (source, state) {
		var cursor = state.cursor
		, selectors = state.result
		, len = source.length
		, end = seekAny(source, cursor, [']', '[']);
		if (end < cursor) {
			end = len;
		}
		var p = $scope.JsonPointer.create(source.substring(cursor, end));
		selectors.push(function(obj, accum) {
			accum = accum || [];
			var it = p.get(obj);
			if (typeof it !== 'undefined') {
				accum.push(it);
			}
			return accum;
		});
		state.cursor = end - 1;
	}

	function expect(source, state, expected) {
		dbc([source.indexOf(expected, state.cursor) == state.cursor], function() {
			return "Expected `".concat(expected, '` at position ', state.cursor, '.');
		});
	}

	function pipedSelect(datum, steps, fn) {
		var s = -1
		, data = Array.isArray(datum) ? datum : [datum]
		, slen = steps.length
		, accum
		, i
		, len
		;
		while(++s < slen && data.length) {
			i = -1;
			len = data.length;
			accum = [];
			while(++i < len) {
				accum = steps[s](data[i], accum, fn);
			}
			data = accum;
		}
		return data;
	}

	function descent(obj, steps, accum, fn) {
		accum = accum || [];
		var i = -1
		, len
		, data
		;
		if (typeof obj === 'object' && obj != null) {
			data = pipedSelect(obj, steps, fn);
			if (data.length) {
				accum = accum.concat(data);
			}
			if (!Array.isArray(obj)) {
				var keys = Object.keys(obj)
				, len = keys.length;
				while(++i < len) {
					accum = descent(obj[keys[i]], steps, accum, fn);
				}
			}
		}
		return accum;
	}

	function prepareExhaustiveDescent(source, state) {
		var res = state.result
		, lift = [];
		state.result = lift;
		res.push(function (obj, _, fn) {
			return descent(obj, lift, _, fn);
		});
		performParse(source, state);
		state.result = res;
	}

	function selectAny(obj, accum) {
		accum = accum || [];
		if (typeof obj === 'object' && obj != null) {
			if (Array.isArray(obj)) {
				accum = accum.concat(obj);
			} else {
				var i = -1
				, keys = Object.keys(obj)
				, len = keys.length;
				while(++i < len) {
					accum.push(obj[keys[i]]);
				}
			}
		}
		return accum;
	}

	function compilePredicate(expression, invert, offset) {
		var i = -1
		, len = expression.length
		, ch
		, variables = {}
		, la
		, v
		, infix = [];
		;
		while(++i < len) {
			ch = expression[i]; 
			dbc([false], 'Expressions are not implemented in this version.');
			switch(ch) {
				case '#': {
					la = expression.indexOf(' ', i);
					if (la < i) {
						la = len;
					}
					v = expression.substring(i, la);
					if (!variables[v]) {
						variables[v] = ptr.create(v);
					}
					infix.push({kind: 'v', ref: variables[v]});
					i = la;
					break;
				}
			}
		}
	}

	function preparePredicate(source, state) {
		var invert = source[state.cursor] === '!';
		if (invert) {
			state.cursor ++;
		}
		expect(source, state, '{');
		var end = expectMatchingClose(source, state.cursor, '}')
		, expression = source.substring(state.cursor + 1, end)
		;
		state.result.push(compilePredicate(expression, invert, state.offset));
		state.cursor = end;
	}

	function parseUserSelector(source, state) {
		var cursor = state.cursor
		, selectors = state.result
		, len = source.length
		, end = source.indexOf(']', cursor);
		if (end < cursor) {
			end = len;
		}
		var n = source.substring(cursor, end);
		state.result.push(function(data, accum, sel) {
			if (data) {
				dbc([sel, typeof sel[n] === "function"], function() {
					return "Missing user-supplied function: `".concat(n, "`.");
				});
				return sel[n](data, accum, sel);
			}
			return accum;
		});
		state.cursor = end - 1;
	}

	function parseSelector (source) {
		var state = {
			result: [],
			stack: [],
			cursor: -1,
			offset: 0
		};
		performParse(source, state);
		return state.result;
	}

	function parseSelectByIndex(source, state) {
		var cursor = state.cursor
		, selectors = state.result
		, i = -1
		, len = source.length
		, end = source.indexOf(']', cursor)
		, it
		, last
		, thems = []
		if (end < cursor) {
			end = len;
		}
		var n = source.substring(cursor, end).split(',');
		len = n.length
		while(++i < len) {
			it = n[i].replace(/(^\s+|\s+$)/g, '');
			if (it === 'last') {
				thems.push(it);
				last = true;
			} else {
				thems.push(parseInt(it));
			}
		}
		selectors.push(function(obj, accum) {
			accum = accum || [];
			if (Array.isArray(obj)) {
				var i = -1;
				while(++i < len) {
					if (last || thems[i] === 'last') {
						accum.push(obj[obj.length-1]);
					} else {
						accum.push(obj[thems[i]]);
					}
				}
			}
			return accum;
		});
		state.cursor = end - 1;
	}

	function performParse(source, state) {
		dbc([typeof source === "string"], "Selector must be a string.");
		if (source.length === 0) return [];
		var len = source.length
		, ch
		;

		while(++state.cursor < len) {
			ch = source[state.cursor];
			switch(ch) {
				case '/':
				case '#': {
					fromJsonPointer(source, state);
					break;
				}
				case '[': {
					state.stack.push(state.cursor);
					break;
				}
				case ']': {
					dbc([state.stack.length], function() {
						return "Unexpected `]` at cursor position ".concat(state.cursor, '.');
					});
					state.stack.pop();
					break;
				}
				case '.': {
					expect(source, state, '..');
					++state.cursor;
					prepareExhaustiveDescent(source, state);
					break;
				}
				case '*': {
					expect(source, state, '*]');
					state.result.push(selectAny);
					break;
				}
				case '{':
				case '!': {
					preparePredicate(source, state);
					break;
				}
				case '0': case '1': case '2': case '3': case '4':
				case '5': case '6': case '7': case '8': case '9': {
					parseSelectByIndex(source, state);
					break;
				}
				case 'l': {
					expect(source, state, 'last');
					parseSelectByIndex(source, state);
					break;
				}
				case '@': {
					expect(source, state, '@');
					state.cursor += 1;
					parseUserSelector(source,state);
					break;
				}
				default: {
					throw new Error("Unexpected character at position ".concat(state.cursor, ": ", ch, "."));
				}
			}
		}
		dbc([!state.stack.length], function() {
			return "Unexpected end; unclosed scope beginning at cursor position ".concat(state.stack.pop(), '.');
		});
	}

	function executeSelectors(obj, sel, fn) {
		return pipedSelect(obj, sel, fn);
	}

	function JsonPath(selector) {
		Object.defineProperties(this, {
			selectors: {
				value: parseSelector(selector),
				enumerable: true
			},
			resolve: {
				value: function (data, fn) {
					return pipedSelect(data, this.selectors, fn);
				},
				enumerable: true
			}
		});
	}

	JsonPath.parseSelector = parseSelector;
	JsonPath.executeSelectors = executeSelectors;
	JsonPath.create = function(path) { return new JsonPath(path); }
	JsonPath.resolve = function(data, selector, fn) {
		var path = parseSelector(selector);
		return pipedSelect(data, path, fn);
	}

	if (typeof module != 'undefined' && module && typeof exports == 'object' && exports && module.exports === exports) {
		module.exports = JsonPath; // nodejs
	} else {
		$scope.JsonPath = JsonPath; // other... browser?
	}
}());