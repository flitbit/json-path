var util = require('util')
;

var operations = [
{ op: 'eq', kind: 'binary', human: 'equal' },
{ op: 'neq', kind: 'binary', human: 'not equal' },
{ op: 'gt', kind: 'binary', human: 'greater than' },
{ op: 'gte', kind: 'binary', human: 'greater than or equal' },
{ op: 'lt', kind: 'binary', human: 'less than' },
{ op: 'lte', kind: 'binary', human: 'less than or equal' },
{ op: 're', kind: 'binary', human: 'regular expression' },
{ op: 'btw', kind: 'tertiary', human: 'between' },
{ op: 'in', kind: 'binary', human: 'in' },
{ op: 'not', kind: 'unary', human: 'not' },
{ op: 'and', kind: 'binary', human: 'and' },
{ op: 'or', kind: 'binary', human: 'or' }
];

function isWhitespace(ch) {
	return ch === 'u0009' || ch === ' ' || ch === 'u00A0';
}

function isLetter(ch) {
	return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
}

function isDecimalDigit(ch) {
	return (ch >= '0' && ch <= '9');
}

function parseExpression()

function Expression(input, cursor) {
	this._input = input;
	this._length = (input) ? input.length : 0;
	this._cursor = cursor || 0;
}

Object.defineProperties(Expression.prototype, {

	nextChar: {
		value: function() {
			var ch = 'x00'
			;
			if (this._cursor < this._length) {
				ch = this._input.charAt(this._cursor);
				this._cursor ++;
			}
			return ch;
		},
		enumerable: true
	},

	peekChar: {
		value: function() {
			return (this._cursor < this._length)
			? this._input.charAt(this._cursor)
			: 'x00'
			;
		},
		enumerable: true
	},

	skipWhitespace: {
		value: function() {
			var ch;
			while(this._cursor < this._length) {
				if (!isWhitespace(this._input.charAt(this._cursor))) {
					break;
				}
				this._cursor++;
			}
		},
		enumerable: true
	},

	scanPointer: {
		value: function() {
			var ch = this.peekChar();

		}
	}

});

Object.defineProperties(Expression, {

	isWhitespace : {
		value: isWhitespace,
		enumerable: true
	},

	isLetter: {
		value: isLetter,
		enumerable: true
	},

	isDecimalDigit: {
		value: isDecimalDigit,
		enumerable: true
	},

});



