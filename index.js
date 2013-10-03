/*jshint laxcomma: true*/
/*global global, window, JsonPointer*/

(function (ptr) {
	'use strict';

	var $scope
	, conflict
	, conflictResolution = []
	;
	if (typeof global === 'object' && global) {
		$scope = global;
		conflict = global.JsonPath;
	} else if (typeof window !== 'undefined') {
		$scope = window;
		conflict = window.JsonPath;
	} else {
		$scope = {};
	}
	if (conflict) {
		conflictResolution.push(
			function () {
				if ($scope.JsonPath === JsonPath) {
					$scope.JsonPath = conflict;
					conflict = null;
				}
			});
	}

	if (ptr) {
		conflictResolution.push(
			function (conflictPtr) {
				if (conflictPtr) { ptr = conflictPtr; }
			});
	} else if (!ptr) {
		if (typeof $scope.JsonPointer !== 'undefined') {
			ptr = $scope.JsonPointer;
			conflictResolution.push(
				function (conflictPtr) {
					if (conflictPtr) { ptr = conflictPtr; }
				});
		} else if (typeof require === 'function') {
			ptr = require('json-ptr');
		} else {
			throw new Error('Missing JsonPointer (https://github.com/flitbit/json-ptr).');
		}
	}

	function dbc(requirements, description) {
		requirements = (Array.isArray(requirements)) ? requirements : [requirements];
		var i, disposition;
		for (i = 0; i < requirements.length; i++) {
			var req = requirements[i];
			disposition = (typeof req === 'function') ? req() : (req);
			if (!disposition) {
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
		while (++i < len) {
			j = -1;
			while (++j < clen) {
				if (source[i] === chars[j]) {
					return i;
				}
			}
		}
		return -1;
	}

	function expectSequence(source, cursor, end, sequence) {
		var c = cursor - 1
		, i = -1
		, seqlen = sequence.length
		;
		if (end - cursor < seqlen) {
			throw new Error("Expected `"
				.concat(sequence, "` beginning at character ", cursor, "."));
		}
		while (++c < end && ++i < seqlen) {
			if (source[c] !== sequence[i]) {
				throw new Error("Unexpected character at position "
					.concat(c, " expected `", sequence, "` beginning at position ", cursor, "."));
			}
		}
	}

	function expectMatchingClose(source, cursor, closeCh) {
		var openCh = source[cursor]
		, i = cursor
		, len = source.length
		, stack = []
		;
		stack.push(cursor);
		while (++i < len) {
			if (source[i] === openCh) {stack.push(cursor);
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

	function fromJsonPointer(source, state) {
		var cursor = state.cursor
		, selectors = state.result
		, len = source.length
		, end = seekAny(source, cursor, [']', '[']);
		if (end < cursor) {
			end = len;
		}
		var p = ptr.create(source.substring(cursor, end));
		selectors.push(function (obj, accum) {
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
		expectSequence(source, state.cursor, source.length, expected);
	}

	function pipedSelect(datum, steps, fn) {
		var s = -1
		, data = Array.isArray(datum) ? datum : [datum]
		, slen = steps.length
		, accum
		, i
		, len
		;
		while (++s < slen && data.length) {
			i = -1;
			len = data.length;
			accum = [];
			while (++i < len) {
				accum = steps[s](data[i], accum, fn);
			}
			data = accum;
		}
		return data;
	}

	function descent(obj, steps, accum, fn) {
		accum = accum || [];
		var i = -1
		, keys
		, len
		, data
		;
		if (typeof obj === 'object' && obj !== null) {
			data = pipedSelect(obj, steps, fn);
			if (data.length) {
				accum = accum.concat(data);
			}
			if (!Array.isArray(obj)) {
				keys = Object.keys(obj);
				len = keys.length;
				while (++i < len) {
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
		if (typeof obj === 'object' && obj !== null) {
			if (Array.isArray(obj)) {
				accum = accum.concat(obj);
			} else {
				var i = -1
				, keys = Object.keys(obj)
				, len = keys.length;
				while (++i < len) {
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
		, infix = []
		;
		while (++i < len) {
			ch = expression[i];
			dbc([false], 'Expressions are not implemented in this version.');
			switch (ch) {
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
		state.result.push(function (data, accum, sel) {
			var target;
			if (data) {
				if (n.length === 0 && typeof sel === 'function') {
					target = sel;
				} else if (typeof sel === 'object' && sel) {
					if (!sel[n] && sel.RESOLVER) {
						target = sel.RESOLVER(n);
					} else {
						target = sel[n];
					}
				}
				if (!target) {
					throw new Error("Missing user-supplied function: `"
						.concat((n.length) ? n : '@', "`."));
				}
				return target(data, accum, sel);
			}
			return accum;
		});
		state.cursor = end - 1;
	}

	function parseSelector(source) {
		var state = {
			result: [],
			stack: [],
			cursor: -1,
			offset: 0
		};
		performParse(source, state);
		return state.result;
	}

	function parseTake(source, state) {
		var cursor = state.cursor
		, end = source.indexOf(')', cursor)
		;
		expectSequence(source, cursor, end, 'take(');
		cursor += 5;
		var them = source.slice(cursor, end).split(',')
		, i = -1
		, len = them.length
		, it
		;
		while (++i < len) {
			it = them[i].split('=');
			if (it.length === 1) {
				it = ptr.create(it[0]);
				it = { name: it.path[it.path.length - 1], ptr: it };
			} else if (it.length === 2) {
				it = { name: it[0], ptr: ptr.create(it[1]) };
			} else {
				throw new Error("Invalid `take` expression");
			}
			cursor += them[i].length;
			them[i] = it;
		}
		state.result.push(function (obj, accum) {
			accum = accum || [];
			var it = {}
			, i = -1
			, len = them.length
			;
			while (++i < len) {
				it[them[i].name] = them[i].ptr.get(obj);
			}
			accum.push(it);
			return accum;
		});
		state.cursor = end;
	}

	function expectInteger(source, cursor, end) {
		var c = cursor;
		while (source[c] >= '0' && source[c] <= '9') { c = c + 1; }
		if (c === cursor) {
			throw new Error('Expected an integer at position '
				.concat(c, '.'));
		}
		return c - cursor;
	}

	function parseArrayVerb(source, cursor, end, verb, thems) {
		var index = 1
		, len
		;
		expectSequence(source, cursor, end, verb);
		cursor += (verb.length - 1);
		if (source[cursor + 1] === '(') {
			cursor += 2;
			len = expectInteger(source, cursor, end);
			index = parseInt(source.substring(cursor, cursor + len), 10);
			cursor += len;
			expectSequence(source, cursor, end, ')');
			++cursor;
		}
		thems.push({ kind: verb[0], index: index});
		return cursor;
	}

	function parseSelectByIndex(source, state) {
		var cursor = state.cursor - 1
		, len = source.length
		, end = source.indexOf(']', state.cursor)
		, it = null
		, num = null
		, punct = false
		, thems = []
		;
		if (end < cursor) {
			end = len;
		}
		while (++cursor < end) {
			switch (source[cursor]) {
			case ' ':
				if (num !== null) {
					thems.push({ kind: 'i', index: parseInt(source.substring(num, cursor), 10)});
					num = null;
					punct = true;
				}
				break;
			case ',': {
					if (num !== null) {
						thems.push({ kind: 'i', index: parseInt(source.substring(num, cursor), 10)});
						num = null;
					}
					if (punct) { punct = false; }
				}
				break;
			case '.': {
					expectSequence(source, cursor, end, '..');
					if (num !== null) {
						thems.push({ kind: 's', index: parseInt(source.substring(num, cursor), 10)});
						num = null;
					}
					cursor++;
					if (punct) { punct = false; }
				}
				break;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9': {
					if (punct) {
						throw new Error("Unexpected numeral at position "
							.concat(cursor, " expected punctuation."));
					}
					if (num === null) {
						num = cursor;
					}
				}
				break;
			case 'l': {
					if (punct) {
						throw new Error("Unexpected numeral at position "
							.concat(cursor, " expected punctuation."));
					}
					cursor = parseArrayVerb(source, cursor, end, "last", thems);
				}
				break;
			case 'f': {
					if (punct) {
						throw new Error("Unexpected numeral at position "
							.concat(cursor, " expected punctuation."));
					}
					cursor = parseArrayVerb(source, cursor, end, "first", thems);
				}
				break;
			case 'c': {
					if (punct) {
						throw new Error("Unexpected numeral at position "
							.concat(cursor, " expected punctuation."));
					}
					cursor = parseArrayVerb(source, cursor, end, "count", thems);
					break;
				}
			}
		}
		if (num !== null) {
			thems.push({ kind: 'i', index: parseInt(source.substring(num, cursor), 10)});
		}
		state.result.push(function (obj, accum) {
			accum = accum || [];
			if (Array.isArray(obj)) {
				var i = -1
				, len = thems.length
				, alen = obj.length
				, j, last
				;
				while (++i < len) {
					var it = thems[i];
					switch (it.kind) {
					case 'c':
						accum.push(alen);
						break;
					case 'f': {
							j = -1;
							while (++j < it.index && j < alen) {
								accum.push(obj[j]);
							}
						}
						break;
					case 'l': {
							j = alen;
							last = alen - it.index;
							while (--j >= last && j > 0) {
								accum.push(obj[j]);
							}
						}
						break;
					case 'i':
					case 's': {
							if (it.index < alen) {
								accum.push(obj[it.index]);
								if (it.kind === 's') {
									j = it.index;
									last = (++i < len) ? thems[i].index : alen - 1;
									while (++j <= last) {
										accum.push(obj[j]);
									}
								}
							}
						}
					}
				}
			}
			return accum;
		});
		state.cursor = end - 1;
	}

	function performParse(source, state) {
		dbc([typeof source === "string"], "Selector must be a string.");
		if (source.length === 0) { return []; }
		var len = source.length
		, ch
		;

		while (++state.cursor < len) {
			ch = source[state.cursor];
			switch (ch) {
			case '/':
			case '#': {
					fromJsonPointer(source, state);
				}
				break;
			case '[': {
					state.stack.push(state.cursor);
				}
				break;
			case ']': {
					if (state.stack.length) {
						state.stack.pop();
					} else {
						throw new Error("Unexpected `]` at cursor position ".concat(state.cursor, '.'));
					}
				}
				break;
			case '.': {
					expect(source, state, '..');
					++state.cursor;
					prepareExhaustiveDescent(source, state);
				}
				break;
			case '*': {
					expect(source, state, '*]');
					state.result.push(selectAny);
				}
				break;
			case '{':
			case '!': {
					preparePredicate(source, state);
				}
				break;
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9': {
					parseSelectByIndex(source, state);
				}
				break;
			case 'l': {
					parseSelectByIndex(source, state);
				}
				break;
			case 'f': {
					parseSelectByIndex(source, state);
				}
				break;
			case 'c': {
					parseSelectByIndex(source, state);
				}
				break;
			case 't': {
					parseTake(source, state);
				}
				break;
			case '@': {
					state.cursor += 1;
					parseUserSelector(source, state);
				}
				break;
			default: {
					throw new Error("Unexpected character at position ".concat(state.cursor, ": ", ch, "."));
				}
			}
		}
		dbc([!state.stack.length], function () {
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
	JsonPath.create = function (path) { return new JsonPath(path); };
	JsonPath.resolve = function (data, selector, fn) {
		var path = parseSelector(selector);
		return pipedSelect(data, path, fn);
	};
	JsonPath.noConflict = function (conflictPtr) {
		if (conflictResolution) {
			conflictResolution.forEach(function (it) { it(conflictPtr); });
			conflictResolution = null;
		}
		return JsonPath;
	};

	if (typeof module !== 'undefined' && module && typeof exports === 'object' && exports && module.exports === exports) {
		module.exports = JsonPath; // nodejs
	} else {
		$scope.JsonPath = JsonPath; // other... browser?
	}
}(typeof JsonPointer !== 'undefined' ? JsonPointer : null));
