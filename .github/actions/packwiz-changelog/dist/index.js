import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@iarna/toml/lib/parser.js
var require_parser = __commonJS({
  "node_modules/@iarna/toml/lib/parser.js"(exports2, module2) {
    "use strict";
    var ParserEND = 1114112;
    var ParserError = class _ParserError extends Error {
      /* istanbul ignore next */
      constructor(msg, filename, linenumber) {
        super("[ParserError] " + msg, filename, linenumber);
        this.name = "ParserError";
        this.code = "ParserError";
        if (Error.captureStackTrace) Error.captureStackTrace(this, _ParserError);
      }
    };
    var State = class {
      constructor(parser) {
        this.parser = parser;
        this.buf = "";
        this.returned = null;
        this.result = null;
        this.resultTable = null;
        this.resultArr = null;
      }
    };
    var Parser = class {
      constructor() {
        this.pos = 0;
        this.col = 0;
        this.line = 0;
        this.obj = {};
        this.ctx = this.obj;
        this.stack = [];
        this._buf = "";
        this.char = null;
        this.ii = 0;
        this.state = new State(this.parseStart);
      }
      parse(str) {
        if (str.length === 0 || str.length == null) return;
        this._buf = String(str);
        this.ii = -1;
        this.char = -1;
        let getNext;
        while (getNext === false || this.nextChar()) {
          getNext = this.runOne();
        }
        this._buf = null;
      }
      nextChar() {
        if (this.char === 10) {
          ++this.line;
          this.col = -1;
        }
        ++this.ii;
        this.char = this._buf.codePointAt(this.ii);
        ++this.pos;
        ++this.col;
        return this.haveBuffer();
      }
      haveBuffer() {
        return this.ii < this._buf.length;
      }
      runOne() {
        return this.state.parser.call(this, this.state.returned);
      }
      finish() {
        this.char = ParserEND;
        let last;
        do {
          last = this.state.parser;
          this.runOne();
        } while (this.state.parser !== last);
        this.ctx = null;
        this.state = null;
        this._buf = null;
        return this.obj;
      }
      next(fn) {
        if (typeof fn !== "function") throw new ParserError("Tried to set state to non-existent state: " + JSON.stringify(fn));
        this.state.parser = fn;
      }
      goto(fn) {
        this.next(fn);
        return this.runOne();
      }
      call(fn, returnWith) {
        if (returnWith) this.next(returnWith);
        this.stack.push(this.state);
        this.state = new State(fn);
      }
      callNow(fn, returnWith) {
        this.call(fn, returnWith);
        return this.runOne();
      }
      return(value) {
        if (this.stack.length === 0) throw this.error(new ParserError("Stack underflow"));
        if (value === void 0) value = this.state.buf;
        this.state = this.stack.pop();
        this.state.returned = value;
      }
      returnNow(value) {
        this.return(value);
        return this.runOne();
      }
      consume() {
        if (this.char === ParserEND) throw this.error(new ParserError("Unexpected end-of-buffer"));
        this.state.buf += this._buf[this.ii];
      }
      error(err) {
        err.line = this.line;
        err.col = this.col;
        err.pos = this.pos;
        return err;
      }
      /* istanbul ignore next */
      parseStart() {
        throw new ParserError("Must declare a parseStart method");
      }
    };
    Parser.END = ParserEND;
    Parser.Error = ParserError;
    module2.exports = Parser;
  }
});

// node_modules/@iarna/toml/lib/create-datetime.js
var require_create_datetime = __commonJS({
  "node_modules/@iarna/toml/lib/create-datetime.js"(exports2, module2) {
    "use strict";
    module2.exports = (value) => {
      const date = new Date(value);
      if (isNaN(date)) {
        throw new TypeError("Invalid Datetime");
      } else {
        return date;
      }
    };
  }
});

// node_modules/@iarna/toml/lib/format-num.js
var require_format_num = __commonJS({
  "node_modules/@iarna/toml/lib/format-num.js"(exports2, module2) {
    "use strict";
    module2.exports = (d, num) => {
      num = String(num);
      while (num.length < d) num = "0" + num;
      return num;
    };
  }
});

// node_modules/@iarna/toml/lib/create-datetime-float.js
var require_create_datetime_float = __commonJS({
  "node_modules/@iarna/toml/lib/create-datetime-float.js"(exports2, module2) {
    "use strict";
    var f = require_format_num();
    var FloatingDateTime = class extends Date {
      constructor(value) {
        super(value + "Z");
        this.isFloating = true;
      }
      toISOString() {
        const date = `${this.getUTCFullYear()}-${f(2, this.getUTCMonth() + 1)}-${f(2, this.getUTCDate())}`;
        const time = `${f(2, this.getUTCHours())}:${f(2, this.getUTCMinutes())}:${f(2, this.getUTCSeconds())}.${f(3, this.getUTCMilliseconds())}`;
        return `${date}T${time}`;
      }
    };
    module2.exports = (value) => {
      const date = new FloatingDateTime(value);
      if (isNaN(date)) {
        throw new TypeError("Invalid Datetime");
      } else {
        return date;
      }
    };
  }
});

// node_modules/@iarna/toml/lib/create-date.js
var require_create_date = __commonJS({
  "node_modules/@iarna/toml/lib/create-date.js"(exports2, module2) {
    "use strict";
    var f = require_format_num();
    var DateTime = global.Date;
    var Date2 = class extends DateTime {
      constructor(value) {
        super(value);
        this.isDate = true;
      }
      toISOString() {
        return `${this.getUTCFullYear()}-${f(2, this.getUTCMonth() + 1)}-${f(2, this.getUTCDate())}`;
      }
    };
    module2.exports = (value) => {
      const date = new Date2(value);
      if (isNaN(date)) {
        throw new TypeError("Invalid Datetime");
      } else {
        return date;
      }
    };
  }
});

// node_modules/@iarna/toml/lib/create-time.js
var require_create_time = __commonJS({
  "node_modules/@iarna/toml/lib/create-time.js"(exports2, module2) {
    "use strict";
    var f = require_format_num();
    var Time = class extends Date {
      constructor(value) {
        super(`0000-01-01T${value}Z`);
        this.isTime = true;
      }
      toISOString() {
        return `${f(2, this.getUTCHours())}:${f(2, this.getUTCMinutes())}:${f(2, this.getUTCSeconds())}.${f(3, this.getUTCMilliseconds())}`;
      }
    };
    module2.exports = (value) => {
      const date = new Time(value);
      if (isNaN(date)) {
        throw new TypeError("Invalid Datetime");
      } else {
        return date;
      }
    };
  }
});

// node_modules/@iarna/toml/lib/toml-parser.js
var require_toml_parser = __commonJS({
  "node_modules/@iarna/toml/lib/toml-parser.js"(exports, module) {
    "use strict";
    module.exports = makeParserClass(require_parser());
    module.exports.makeParserClass = makeParserClass;
    var TomlError = class _TomlError extends Error {
      constructor(msg) {
        super(msg);
        this.name = "TomlError";
        if (Error.captureStackTrace) Error.captureStackTrace(this, _TomlError);
        this.fromTOML = true;
        this.wrapped = null;
      }
    };
    TomlError.wrap = (err) => {
      const terr = new TomlError(err.message);
      terr.code = err.code;
      terr.wrapped = err;
      return terr;
    };
    module.exports.TomlError = TomlError;
    var createDateTime = require_create_datetime();
    var createDateTimeFloat = require_create_datetime_float();
    var createDate = require_create_date();
    var createTime = require_create_time();
    var CTRL_I = 9;
    var CTRL_J = 10;
    var CTRL_M = 13;
    var CTRL_CHAR_BOUNDARY = 31;
    var CHAR_SP = 32;
    var CHAR_QUOT = 34;
    var CHAR_NUM = 35;
    var CHAR_APOS = 39;
    var CHAR_PLUS = 43;
    var CHAR_COMMA = 44;
    var CHAR_HYPHEN = 45;
    var CHAR_PERIOD = 46;
    var CHAR_0 = 48;
    var CHAR_1 = 49;
    var CHAR_7 = 55;
    var CHAR_9 = 57;
    var CHAR_COLON = 58;
    var CHAR_EQUALS = 61;
    var CHAR_A = 65;
    var CHAR_E = 69;
    var CHAR_F = 70;
    var CHAR_T = 84;
    var CHAR_U = 85;
    var CHAR_Z = 90;
    var CHAR_LOWBAR = 95;
    var CHAR_a = 97;
    var CHAR_b = 98;
    var CHAR_e = 101;
    var CHAR_f = 102;
    var CHAR_i = 105;
    var CHAR_l = 108;
    var CHAR_n = 110;
    var CHAR_o = 111;
    var CHAR_r = 114;
    var CHAR_s = 115;
    var CHAR_t = 116;
    var CHAR_u = 117;
    var CHAR_x = 120;
    var CHAR_z = 122;
    var CHAR_LCUB = 123;
    var CHAR_RCUB = 125;
    var CHAR_LSQB = 91;
    var CHAR_BSOL = 92;
    var CHAR_RSQB = 93;
    var CHAR_DEL = 127;
    var SURROGATE_FIRST = 55296;
    var SURROGATE_LAST = 57343;
    var escapes = {
      [CHAR_b]: "\b",
      [CHAR_t]: "	",
      [CHAR_n]: "\n",
      [CHAR_f]: "\f",
      [CHAR_r]: "\r",
      [CHAR_QUOT]: '"',
      [CHAR_BSOL]: "\\"
    };
    function isDigit(cp) {
      return cp >= CHAR_0 && cp <= CHAR_9;
    }
    function isHexit(cp) {
      return cp >= CHAR_A && cp <= CHAR_F || cp >= CHAR_a && cp <= CHAR_f || cp >= CHAR_0 && cp <= CHAR_9;
    }
    function isBit(cp) {
      return cp === CHAR_1 || cp === CHAR_0;
    }
    function isOctit(cp) {
      return cp >= CHAR_0 && cp <= CHAR_7;
    }
    function isAlphaNumQuoteHyphen(cp) {
      return cp >= CHAR_A && cp <= CHAR_Z || cp >= CHAR_a && cp <= CHAR_z || cp >= CHAR_0 && cp <= CHAR_9 || cp === CHAR_APOS || cp === CHAR_QUOT || cp === CHAR_LOWBAR || cp === CHAR_HYPHEN;
    }
    function isAlphaNumHyphen(cp) {
      return cp >= CHAR_A && cp <= CHAR_Z || cp >= CHAR_a && cp <= CHAR_z || cp >= CHAR_0 && cp <= CHAR_9 || cp === CHAR_LOWBAR || cp === CHAR_HYPHEN;
    }
    var _type = /* @__PURE__ */ Symbol("type");
    var _declared = /* @__PURE__ */ Symbol("declared");
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var defineProperty = Object.defineProperty;
    var descriptor = { configurable: true, enumerable: true, writable: true, value: void 0 };
    function hasKey(obj, key) {
      if (hasOwnProperty.call(obj, key)) return true;
      if (key === "__proto__") defineProperty(obj, "__proto__", descriptor);
      return false;
    }
    var INLINE_TABLE = /* @__PURE__ */ Symbol("inline-table");
    function InlineTable() {
      return Object.defineProperties({}, {
        [_type]: { value: INLINE_TABLE }
      });
    }
    function isInlineTable(obj) {
      if (obj === null || typeof obj !== "object") return false;
      return obj[_type] === INLINE_TABLE;
    }
    var TABLE = /* @__PURE__ */ Symbol("table");
    function Table() {
      return Object.defineProperties({}, {
        [_type]: { value: TABLE },
        [_declared]: { value: false, writable: true }
      });
    }
    function isTable(obj) {
      if (obj === null || typeof obj !== "object") return false;
      return obj[_type] === TABLE;
    }
    var _contentType = /* @__PURE__ */ Symbol("content-type");
    var INLINE_LIST = /* @__PURE__ */ Symbol("inline-list");
    function InlineList(type) {
      return Object.defineProperties([], {
        [_type]: { value: INLINE_LIST },
        [_contentType]: { value: type }
      });
    }
    function isInlineList(obj) {
      if (obj === null || typeof obj !== "object") return false;
      return obj[_type] === INLINE_LIST;
    }
    var LIST = /* @__PURE__ */ Symbol("list");
    function List() {
      return Object.defineProperties([], {
        [_type]: { value: LIST }
      });
    }
    function isList(obj) {
      if (obj === null || typeof obj !== "object") return false;
      return obj[_type] === LIST;
    }
    var _custom;
    try {
      const utilInspect = eval("require('util').inspect");
      _custom = utilInspect.custom;
    } catch (_) {
    }
    var _inspect = _custom || "inspect";
    var BoxedBigInt = class {
      constructor(value) {
        try {
          this.value = global.BigInt.asIntN(64, value);
        } catch (_) {
          this.value = null;
        }
        Object.defineProperty(this, _type, { value: INTEGER });
      }
      isNaN() {
        return this.value === null;
      }
      /* istanbul ignore next */
      toString() {
        return String(this.value);
      }
      /* istanbul ignore next */
      [_inspect]() {
        return `[BigInt: ${this.toString()}]}`;
      }
      valueOf() {
        return this.value;
      }
    };
    var INTEGER = /* @__PURE__ */ Symbol("integer");
    function Integer(value) {
      let num = Number(value);
      if (Object.is(num, -0)) num = 0;
      if (global.BigInt && !Number.isSafeInteger(num)) {
        return new BoxedBigInt(value);
      } else {
        return Object.defineProperties(new Number(num), {
          isNaN: { value: function() {
            return isNaN(this);
          } },
          [_type]: { value: INTEGER },
          [_inspect]: { value: () => `[Integer: ${value}]` }
        });
      }
    }
    function isInteger(obj) {
      if (obj === null || typeof obj !== "object") return false;
      return obj[_type] === INTEGER;
    }
    var FLOAT = /* @__PURE__ */ Symbol("float");
    function Float(value) {
      return Object.defineProperties(new Number(value), {
        [_type]: { value: FLOAT },
        [_inspect]: { value: () => `[Float: ${value}]` }
      });
    }
    function isFloat(obj) {
      if (obj === null || typeof obj !== "object") return false;
      return obj[_type] === FLOAT;
    }
    function tomlType(value) {
      const type = typeof value;
      if (type === "object") {
        if (value === null) return "null";
        if (value instanceof Date) return "datetime";
        if (_type in value) {
          switch (value[_type]) {
            case INLINE_TABLE:
              return "inline-table";
            case INLINE_LIST:
              return "inline-list";
            /* istanbul ignore next */
            case TABLE:
              return "table";
            /* istanbul ignore next */
            case LIST:
              return "list";
            case FLOAT:
              return "float";
            case INTEGER:
              return "integer";
          }
        }
      }
      return type;
    }
    function makeParserClass(Parser) {
      class TOMLParser extends Parser {
        constructor() {
          super();
          this.ctx = this.obj = Table();
        }
        /* MATCH HELPER */
        atEndOfWord() {
          return this.char === CHAR_NUM || this.char === CTRL_I || this.char === CHAR_SP || this.atEndOfLine();
        }
        atEndOfLine() {
          return this.char === Parser.END || this.char === CTRL_J || this.char === CTRL_M;
        }
        parseStart() {
          if (this.char === Parser.END) {
            return null;
          } else if (this.char === CHAR_LSQB) {
            return this.call(this.parseTableOrList);
          } else if (this.char === CHAR_NUM) {
            return this.call(this.parseComment);
          } else if (this.char === CTRL_J || this.char === CHAR_SP || this.char === CTRL_I || this.char === CTRL_M) {
            return null;
          } else if (isAlphaNumQuoteHyphen(this.char)) {
            return this.callNow(this.parseAssignStatement);
          } else {
            throw this.error(new TomlError(`Unknown character "${this.char}"`));
          }
        }
        // HELPER, this strips any whitespace and comments to the end of the line
        // then RETURNS. Last state in a production.
        parseWhitespaceToEOL() {
          if (this.char === CHAR_SP || this.char === CTRL_I || this.char === CTRL_M) {
            return null;
          } else if (this.char === CHAR_NUM) {
            return this.goto(this.parseComment);
          } else if (this.char === Parser.END || this.char === CTRL_J) {
            return this.return();
          } else {
            throw this.error(new TomlError("Unexpected character, expected only whitespace or comments till end of line"));
          }
        }
        /* ASSIGNMENT: key = value */
        parseAssignStatement() {
          return this.callNow(this.parseAssign, this.recordAssignStatement);
        }
        recordAssignStatement(kv) {
          let target = this.ctx;
          let finalKey = kv.key.pop();
          for (let kw of kv.key) {
            if (hasKey(target, kw) && (!isTable(target[kw]) || target[kw][_declared])) {
              throw this.error(new TomlError("Can't redefine existing key"));
            }
            target = target[kw] = target[kw] || Table();
          }
          if (hasKey(target, finalKey)) {
            throw this.error(new TomlError("Can't redefine existing key"));
          }
          if (isInteger(kv.value) || isFloat(kv.value)) {
            target[finalKey] = kv.value.valueOf();
          } else {
            target[finalKey] = kv.value;
          }
          return this.goto(this.parseWhitespaceToEOL);
        }
        /* ASSSIGNMENT expression, key = value possibly inside an inline table */
        parseAssign() {
          return this.callNow(this.parseKeyword, this.recordAssignKeyword);
        }
        recordAssignKeyword(key) {
          if (this.state.resultTable) {
            this.state.resultTable.push(key);
          } else {
            this.state.resultTable = [key];
          }
          return this.goto(this.parseAssignKeywordPreDot);
        }
        parseAssignKeywordPreDot() {
          if (this.char === CHAR_PERIOD) {
            return this.next(this.parseAssignKeywordPostDot);
          } else if (this.char !== CHAR_SP && this.char !== CTRL_I) {
            return this.goto(this.parseAssignEqual);
          }
        }
        parseAssignKeywordPostDot() {
          if (this.char !== CHAR_SP && this.char !== CTRL_I) {
            return this.callNow(this.parseKeyword, this.recordAssignKeyword);
          }
        }
        parseAssignEqual() {
          if (this.char === CHAR_EQUALS) {
            return this.next(this.parseAssignPreValue);
          } else {
            throw this.error(new TomlError('Invalid character, expected "="'));
          }
        }
        parseAssignPreValue() {
          if (this.char === CHAR_SP || this.char === CTRL_I) {
            return null;
          } else {
            return this.callNow(this.parseValue, this.recordAssignValue);
          }
        }
        recordAssignValue(value) {
          return this.returnNow({ key: this.state.resultTable, value });
        }
        /* COMMENTS: #...eol */
        parseComment() {
          do {
            if (this.char === Parser.END || this.char === CTRL_J) {
              return this.return();
            }
          } while (this.nextChar());
        }
        /* TABLES AND LISTS, [foo] and [[foo]] */
        parseTableOrList() {
          if (this.char === CHAR_LSQB) {
            this.next(this.parseList);
          } else {
            return this.goto(this.parseTable);
          }
        }
        /* TABLE [foo.bar.baz] */
        parseTable() {
          this.ctx = this.obj;
          return this.goto(this.parseTableNext);
        }
        parseTableNext() {
          if (this.char === CHAR_SP || this.char === CTRL_I) {
            return null;
          } else {
            return this.callNow(this.parseKeyword, this.parseTableMore);
          }
        }
        parseTableMore(keyword) {
          if (this.char === CHAR_SP || this.char === CTRL_I) {
            return null;
          } else if (this.char === CHAR_RSQB) {
            if (hasKey(this.ctx, keyword) && (!isTable(this.ctx[keyword]) || this.ctx[keyword][_declared])) {
              throw this.error(new TomlError("Can't redefine existing key"));
            } else {
              this.ctx = this.ctx[keyword] = this.ctx[keyword] || Table();
              this.ctx[_declared] = true;
            }
            return this.next(this.parseWhitespaceToEOL);
          } else if (this.char === CHAR_PERIOD) {
            if (!hasKey(this.ctx, keyword)) {
              this.ctx = this.ctx[keyword] = Table();
            } else if (isTable(this.ctx[keyword])) {
              this.ctx = this.ctx[keyword];
            } else if (isList(this.ctx[keyword])) {
              this.ctx = this.ctx[keyword][this.ctx[keyword].length - 1];
            } else {
              throw this.error(new TomlError("Can't redefine existing key"));
            }
            return this.next(this.parseTableNext);
          } else {
            throw this.error(new TomlError("Unexpected character, expected whitespace, . or ]"));
          }
        }
        /* LIST [[a.b.c]] */
        parseList() {
          this.ctx = this.obj;
          return this.goto(this.parseListNext);
        }
        parseListNext() {
          if (this.char === CHAR_SP || this.char === CTRL_I) {
            return null;
          } else {
            return this.callNow(this.parseKeyword, this.parseListMore);
          }
        }
        parseListMore(keyword) {
          if (this.char === CHAR_SP || this.char === CTRL_I) {
            return null;
          } else if (this.char === CHAR_RSQB) {
            if (!hasKey(this.ctx, keyword)) {
              this.ctx[keyword] = List();
            }
            if (isInlineList(this.ctx[keyword])) {
              throw this.error(new TomlError("Can't extend an inline array"));
            } else if (isList(this.ctx[keyword])) {
              const next = Table();
              this.ctx[keyword].push(next);
              this.ctx = next;
            } else {
              throw this.error(new TomlError("Can't redefine an existing key"));
            }
            return this.next(this.parseListEnd);
          } else if (this.char === CHAR_PERIOD) {
            if (!hasKey(this.ctx, keyword)) {
              this.ctx = this.ctx[keyword] = Table();
            } else if (isInlineList(this.ctx[keyword])) {
              throw this.error(new TomlError("Can't extend an inline array"));
            } else if (isInlineTable(this.ctx[keyword])) {
              throw this.error(new TomlError("Can't extend an inline table"));
            } else if (isList(this.ctx[keyword])) {
              this.ctx = this.ctx[keyword][this.ctx[keyword].length - 1];
            } else if (isTable(this.ctx[keyword])) {
              this.ctx = this.ctx[keyword];
            } else {
              throw this.error(new TomlError("Can't redefine an existing key"));
            }
            return this.next(this.parseListNext);
          } else {
            throw this.error(new TomlError("Unexpected character, expected whitespace, . or ]"));
          }
        }
        parseListEnd(keyword) {
          if (this.char === CHAR_RSQB) {
            return this.next(this.parseWhitespaceToEOL);
          } else {
            throw this.error(new TomlError("Unexpected character, expected whitespace, . or ]"));
          }
        }
        /* VALUE string, number, boolean, inline list, inline object */
        parseValue() {
          if (this.char === Parser.END) {
            throw this.error(new TomlError("Key without value"));
          } else if (this.char === CHAR_QUOT) {
            return this.next(this.parseDoubleString);
          }
          if (this.char === CHAR_APOS) {
            return this.next(this.parseSingleString);
          } else if (this.char === CHAR_HYPHEN || this.char === CHAR_PLUS) {
            return this.goto(this.parseNumberSign);
          } else if (this.char === CHAR_i) {
            return this.next(this.parseInf);
          } else if (this.char === CHAR_n) {
            return this.next(this.parseNan);
          } else if (isDigit(this.char)) {
            return this.goto(this.parseNumberOrDateTime);
          } else if (this.char === CHAR_t || this.char === CHAR_f) {
            return this.goto(this.parseBoolean);
          } else if (this.char === CHAR_LSQB) {
            return this.call(this.parseInlineList, this.recordValue);
          } else if (this.char === CHAR_LCUB) {
            return this.call(this.parseInlineTable, this.recordValue);
          } else {
            throw this.error(new TomlError("Unexpected character, expecting string, number, datetime, boolean, inline array or inline table"));
          }
        }
        recordValue(value) {
          return this.returnNow(value);
        }
        parseInf() {
          if (this.char === CHAR_n) {
            return this.next(this.parseInf2);
          } else {
            throw this.error(new TomlError('Unexpected character, expected "inf", "+inf" or "-inf"'));
          }
        }
        parseInf2() {
          if (this.char === CHAR_f) {
            if (this.state.buf === "-") {
              return this.return(-Infinity);
            } else {
              return this.return(Infinity);
            }
          } else {
            throw this.error(new TomlError('Unexpected character, expected "inf", "+inf" or "-inf"'));
          }
        }
        parseNan() {
          if (this.char === CHAR_a) {
            return this.next(this.parseNan2);
          } else {
            throw this.error(new TomlError('Unexpected character, expected "nan"'));
          }
        }
        parseNan2() {
          if (this.char === CHAR_n) {
            return this.return(NaN);
          } else {
            throw this.error(new TomlError('Unexpected character, expected "nan"'));
          }
        }
        /* KEYS, barewords or basic, literal, or dotted */
        parseKeyword() {
          if (this.char === CHAR_QUOT) {
            return this.next(this.parseBasicString);
          } else if (this.char === CHAR_APOS) {
            return this.next(this.parseLiteralString);
          } else {
            return this.goto(this.parseBareKey);
          }
        }
        /* KEYS: barewords */
        parseBareKey() {
          do {
            if (this.char === Parser.END) {
              throw this.error(new TomlError("Key ended without value"));
            } else if (isAlphaNumHyphen(this.char)) {
              this.consume();
            } else if (this.state.buf.length === 0) {
              throw this.error(new TomlError("Empty bare keys are not allowed"));
            } else {
              return this.returnNow();
            }
          } while (this.nextChar());
        }
        /* STRINGS, single quoted (literal) */
        parseSingleString() {
          if (this.char === CHAR_APOS) {
            return this.next(this.parseLiteralMultiStringMaybe);
          } else {
            return this.goto(this.parseLiteralString);
          }
        }
        parseLiteralString() {
          do {
            if (this.char === CHAR_APOS) {
              return this.return();
            } else if (this.atEndOfLine()) {
              throw this.error(new TomlError("Unterminated string"));
            } else if (this.char === CHAR_DEL || this.char <= CTRL_CHAR_BOUNDARY && this.char !== CTRL_I) {
              throw this.errorControlCharInString();
            } else {
              this.consume();
            }
          } while (this.nextChar());
        }
        parseLiteralMultiStringMaybe() {
          if (this.char === CHAR_APOS) {
            return this.next(this.parseLiteralMultiString);
          } else {
            return this.returnNow();
          }
        }
        parseLiteralMultiString() {
          if (this.char === CTRL_M) {
            return null;
          } else if (this.char === CTRL_J) {
            return this.next(this.parseLiteralMultiStringContent);
          } else {
            return this.goto(this.parseLiteralMultiStringContent);
          }
        }
        parseLiteralMultiStringContent() {
          do {
            if (this.char === CHAR_APOS) {
              return this.next(this.parseLiteralMultiEnd);
            } else if (this.char === Parser.END) {
              throw this.error(new TomlError("Unterminated multi-line string"));
            } else if (this.char === CHAR_DEL || this.char <= CTRL_CHAR_BOUNDARY && this.char !== CTRL_I && this.char !== CTRL_J && this.char !== CTRL_M) {
              throw this.errorControlCharInString();
            } else {
              this.consume();
            }
          } while (this.nextChar());
        }
        parseLiteralMultiEnd() {
          if (this.char === CHAR_APOS) {
            return this.next(this.parseLiteralMultiEnd2);
          } else {
            this.state.buf += "'";
            return this.goto(this.parseLiteralMultiStringContent);
          }
        }
        parseLiteralMultiEnd2() {
          if (this.char === CHAR_APOS) {
            return this.return();
          } else {
            this.state.buf += "''";
            return this.goto(this.parseLiteralMultiStringContent);
          }
        }
        /* STRINGS double quoted */
        parseDoubleString() {
          if (this.char === CHAR_QUOT) {
            return this.next(this.parseMultiStringMaybe);
          } else {
            return this.goto(this.parseBasicString);
          }
        }
        parseBasicString() {
          do {
            if (this.char === CHAR_BSOL) {
              return this.call(this.parseEscape, this.recordEscapeReplacement);
            } else if (this.char === CHAR_QUOT) {
              return this.return();
            } else if (this.atEndOfLine()) {
              throw this.error(new TomlError("Unterminated string"));
            } else if (this.char === CHAR_DEL || this.char <= CTRL_CHAR_BOUNDARY && this.char !== CTRL_I) {
              throw this.errorControlCharInString();
            } else {
              this.consume();
            }
          } while (this.nextChar());
        }
        recordEscapeReplacement(replacement) {
          this.state.buf += replacement;
          return this.goto(this.parseBasicString);
        }
        parseMultiStringMaybe() {
          if (this.char === CHAR_QUOT) {
            return this.next(this.parseMultiString);
          } else {
            return this.returnNow();
          }
        }
        parseMultiString() {
          if (this.char === CTRL_M) {
            return null;
          } else if (this.char === CTRL_J) {
            return this.next(this.parseMultiStringContent);
          } else {
            return this.goto(this.parseMultiStringContent);
          }
        }
        parseMultiStringContent() {
          do {
            if (this.char === CHAR_BSOL) {
              return this.call(this.parseMultiEscape, this.recordMultiEscapeReplacement);
            } else if (this.char === CHAR_QUOT) {
              return this.next(this.parseMultiEnd);
            } else if (this.char === Parser.END) {
              throw this.error(new TomlError("Unterminated multi-line string"));
            } else if (this.char === CHAR_DEL || this.char <= CTRL_CHAR_BOUNDARY && this.char !== CTRL_I && this.char !== CTRL_J && this.char !== CTRL_M) {
              throw this.errorControlCharInString();
            } else {
              this.consume();
            }
          } while (this.nextChar());
        }
        errorControlCharInString() {
          let displayCode = "\\u00";
          if (this.char < 16) {
            displayCode += "0";
          }
          displayCode += this.char.toString(16);
          return this.error(new TomlError(`Control characters (codes < 0x1f and 0x7f) are not allowed in strings, use ${displayCode} instead`));
        }
        recordMultiEscapeReplacement(replacement) {
          this.state.buf += replacement;
          return this.goto(this.parseMultiStringContent);
        }
        parseMultiEnd() {
          if (this.char === CHAR_QUOT) {
            return this.next(this.parseMultiEnd2);
          } else {
            this.state.buf += '"';
            return this.goto(this.parseMultiStringContent);
          }
        }
        parseMultiEnd2() {
          if (this.char === CHAR_QUOT) {
            return this.return();
          } else {
            this.state.buf += '""';
            return this.goto(this.parseMultiStringContent);
          }
        }
        parseMultiEscape() {
          if (this.char === CTRL_M || this.char === CTRL_J) {
            return this.next(this.parseMultiTrim);
          } else if (this.char === CHAR_SP || this.char === CTRL_I) {
            return this.next(this.parsePreMultiTrim);
          } else {
            return this.goto(this.parseEscape);
          }
        }
        parsePreMultiTrim() {
          if (this.char === CHAR_SP || this.char === CTRL_I) {
            return null;
          } else if (this.char === CTRL_M || this.char === CTRL_J) {
            return this.next(this.parseMultiTrim);
          } else {
            throw this.error(new TomlError("Can't escape whitespace"));
          }
        }
        parseMultiTrim() {
          if (this.char === CTRL_J || this.char === CHAR_SP || this.char === CTRL_I || this.char === CTRL_M) {
            return null;
          } else {
            return this.returnNow();
          }
        }
        parseEscape() {
          if (this.char in escapes) {
            return this.return(escapes[this.char]);
          } else if (this.char === CHAR_u) {
            return this.call(this.parseSmallUnicode, this.parseUnicodeReturn);
          } else if (this.char === CHAR_U) {
            return this.call(this.parseLargeUnicode, this.parseUnicodeReturn);
          } else {
            throw this.error(new TomlError("Unknown escape character: " + this.char));
          }
        }
        parseUnicodeReturn(char) {
          try {
            const codePoint = parseInt(char, 16);
            if (codePoint >= SURROGATE_FIRST && codePoint <= SURROGATE_LAST) {
              throw this.error(new TomlError("Invalid unicode, character in range 0xD800 - 0xDFFF is reserved"));
            }
            return this.returnNow(String.fromCodePoint(codePoint));
          } catch (err) {
            throw this.error(TomlError.wrap(err));
          }
        }
        parseSmallUnicode() {
          if (!isHexit(this.char)) {
            throw this.error(new TomlError("Invalid character in unicode sequence, expected hex"));
          } else {
            this.consume();
            if (this.state.buf.length >= 4) return this.return();
          }
        }
        parseLargeUnicode() {
          if (!isHexit(this.char)) {
            throw this.error(new TomlError("Invalid character in unicode sequence, expected hex"));
          } else {
            this.consume();
            if (this.state.buf.length >= 8) return this.return();
          }
        }
        /* NUMBERS */
        parseNumberSign() {
          this.consume();
          return this.next(this.parseMaybeSignedInfOrNan);
        }
        parseMaybeSignedInfOrNan() {
          if (this.char === CHAR_i) {
            return this.next(this.parseInf);
          } else if (this.char === CHAR_n) {
            return this.next(this.parseNan);
          } else {
            return this.callNow(this.parseNoUnder, this.parseNumberIntegerStart);
          }
        }
        parseNumberIntegerStart() {
          if (this.char === CHAR_0) {
            this.consume();
            return this.next(this.parseNumberIntegerExponentOrDecimal);
          } else {
            return this.goto(this.parseNumberInteger);
          }
        }
        parseNumberIntegerExponentOrDecimal() {
          if (this.char === CHAR_PERIOD) {
            this.consume();
            return this.call(this.parseNoUnder, this.parseNumberFloat);
          } else if (this.char === CHAR_E || this.char === CHAR_e) {
            this.consume();
            return this.next(this.parseNumberExponentSign);
          } else {
            return this.returnNow(Integer(this.state.buf));
          }
        }
        parseNumberInteger() {
          if (isDigit(this.char)) {
            this.consume();
          } else if (this.char === CHAR_LOWBAR) {
            return this.call(this.parseNoUnder);
          } else if (this.char === CHAR_E || this.char === CHAR_e) {
            this.consume();
            return this.next(this.parseNumberExponentSign);
          } else if (this.char === CHAR_PERIOD) {
            this.consume();
            return this.call(this.parseNoUnder, this.parseNumberFloat);
          } else {
            const result = Integer(this.state.buf);
            if (result.isNaN()) {
              throw this.error(new TomlError("Invalid number"));
            } else {
              return this.returnNow(result);
            }
          }
        }
        parseNoUnder() {
          if (this.char === CHAR_LOWBAR || this.char === CHAR_PERIOD || this.char === CHAR_E || this.char === CHAR_e) {
            throw this.error(new TomlError("Unexpected character, expected digit"));
          } else if (this.atEndOfWord()) {
            throw this.error(new TomlError("Incomplete number"));
          }
          return this.returnNow();
        }
        parseNoUnderHexOctBinLiteral() {
          if (this.char === CHAR_LOWBAR || this.char === CHAR_PERIOD) {
            throw this.error(new TomlError("Unexpected character, expected digit"));
          } else if (this.atEndOfWord()) {
            throw this.error(new TomlError("Incomplete number"));
          }
          return this.returnNow();
        }
        parseNumberFloat() {
          if (this.char === CHAR_LOWBAR) {
            return this.call(this.parseNoUnder, this.parseNumberFloat);
          } else if (isDigit(this.char)) {
            this.consume();
          } else if (this.char === CHAR_E || this.char === CHAR_e) {
            this.consume();
            return this.next(this.parseNumberExponentSign);
          } else {
            return this.returnNow(Float(this.state.buf));
          }
        }
        parseNumberExponentSign() {
          if (isDigit(this.char)) {
            return this.goto(this.parseNumberExponent);
          } else if (this.char === CHAR_HYPHEN || this.char === CHAR_PLUS) {
            this.consume();
            this.call(this.parseNoUnder, this.parseNumberExponent);
          } else {
            throw this.error(new TomlError("Unexpected character, expected -, + or digit"));
          }
        }
        parseNumberExponent() {
          if (isDigit(this.char)) {
            this.consume();
          } else if (this.char === CHAR_LOWBAR) {
            return this.call(this.parseNoUnder);
          } else {
            return this.returnNow(Float(this.state.buf));
          }
        }
        /* NUMBERS or DATETIMES  */
        parseNumberOrDateTime() {
          if (this.char === CHAR_0) {
            this.consume();
            return this.next(this.parseNumberBaseOrDateTime);
          } else {
            return this.goto(this.parseNumberOrDateTimeOnly);
          }
        }
        parseNumberOrDateTimeOnly() {
          if (this.char === CHAR_LOWBAR) {
            return this.call(this.parseNoUnder, this.parseNumberInteger);
          } else if (isDigit(this.char)) {
            this.consume();
            if (this.state.buf.length > 4) this.next(this.parseNumberInteger);
          } else if (this.char === CHAR_E || this.char === CHAR_e) {
            this.consume();
            return this.next(this.parseNumberExponentSign);
          } else if (this.char === CHAR_PERIOD) {
            this.consume();
            return this.call(this.parseNoUnder, this.parseNumberFloat);
          } else if (this.char === CHAR_HYPHEN) {
            return this.goto(this.parseDateTime);
          } else if (this.char === CHAR_COLON) {
            return this.goto(this.parseOnlyTimeHour);
          } else {
            return this.returnNow(Integer(this.state.buf));
          }
        }
        parseDateTimeOnly() {
          if (this.state.buf.length < 4) {
            if (isDigit(this.char)) {
              return this.consume();
            } else if (this.char === CHAR_COLON) {
              return this.goto(this.parseOnlyTimeHour);
            } else {
              throw this.error(new TomlError("Expected digit while parsing year part of a date"));
            }
          } else {
            if (this.char === CHAR_HYPHEN) {
              return this.goto(this.parseDateTime);
            } else {
              throw this.error(new TomlError("Expected hyphen (-) while parsing year part of date"));
            }
          }
        }
        parseNumberBaseOrDateTime() {
          if (this.char === CHAR_b) {
            this.consume();
            return this.call(this.parseNoUnderHexOctBinLiteral, this.parseIntegerBin);
          } else if (this.char === CHAR_o) {
            this.consume();
            return this.call(this.parseNoUnderHexOctBinLiteral, this.parseIntegerOct);
          } else if (this.char === CHAR_x) {
            this.consume();
            return this.call(this.parseNoUnderHexOctBinLiteral, this.parseIntegerHex);
          } else if (this.char === CHAR_PERIOD) {
            return this.goto(this.parseNumberInteger);
          } else if (isDigit(this.char)) {
            return this.goto(this.parseDateTimeOnly);
          } else {
            return this.returnNow(Integer(this.state.buf));
          }
        }
        parseIntegerHex() {
          if (isHexit(this.char)) {
            this.consume();
          } else if (this.char === CHAR_LOWBAR) {
            return this.call(this.parseNoUnderHexOctBinLiteral);
          } else {
            const result = Integer(this.state.buf);
            if (result.isNaN()) {
              throw this.error(new TomlError("Invalid number"));
            } else {
              return this.returnNow(result);
            }
          }
        }
        parseIntegerOct() {
          if (isOctit(this.char)) {
            this.consume();
          } else if (this.char === CHAR_LOWBAR) {
            return this.call(this.parseNoUnderHexOctBinLiteral);
          } else {
            const result = Integer(this.state.buf);
            if (result.isNaN()) {
              throw this.error(new TomlError("Invalid number"));
            } else {
              return this.returnNow(result);
            }
          }
        }
        parseIntegerBin() {
          if (isBit(this.char)) {
            this.consume();
          } else if (this.char === CHAR_LOWBAR) {
            return this.call(this.parseNoUnderHexOctBinLiteral);
          } else {
            const result = Integer(this.state.buf);
            if (result.isNaN()) {
              throw this.error(new TomlError("Invalid number"));
            } else {
              return this.returnNow(result);
            }
          }
        }
        /* DATETIME */
        parseDateTime() {
          if (this.state.buf.length < 4) {
            throw this.error(new TomlError("Years less than 1000 must be zero padded to four characters"));
          }
          this.state.result = this.state.buf;
          this.state.buf = "";
          return this.next(this.parseDateMonth);
        }
        parseDateMonth() {
          if (this.char === CHAR_HYPHEN) {
            if (this.state.buf.length < 2) {
              throw this.error(new TomlError("Months less than 10 must be zero padded to two characters"));
            }
            this.state.result += "-" + this.state.buf;
            this.state.buf = "";
            return this.next(this.parseDateDay);
          } else if (isDigit(this.char)) {
            this.consume();
          } else {
            throw this.error(new TomlError("Incomplete datetime"));
          }
        }
        parseDateDay() {
          if (this.char === CHAR_T || this.char === CHAR_SP) {
            if (this.state.buf.length < 2) {
              throw this.error(new TomlError("Days less than 10 must be zero padded to two characters"));
            }
            this.state.result += "-" + this.state.buf;
            this.state.buf = "";
            return this.next(this.parseStartTimeHour);
          } else if (this.atEndOfWord()) {
            return this.returnNow(createDate(this.state.result + "-" + this.state.buf));
          } else if (isDigit(this.char)) {
            this.consume();
          } else {
            throw this.error(new TomlError("Incomplete datetime"));
          }
        }
        parseStartTimeHour() {
          if (this.atEndOfWord()) {
            return this.returnNow(createDate(this.state.result));
          } else {
            return this.goto(this.parseTimeHour);
          }
        }
        parseTimeHour() {
          if (this.char === CHAR_COLON) {
            if (this.state.buf.length < 2) {
              throw this.error(new TomlError("Hours less than 10 must be zero padded to two characters"));
            }
            this.state.result += "T" + this.state.buf;
            this.state.buf = "";
            return this.next(this.parseTimeMin);
          } else if (isDigit(this.char)) {
            this.consume();
          } else {
            throw this.error(new TomlError("Incomplete datetime"));
          }
        }
        parseTimeMin() {
          if (this.state.buf.length < 2 && isDigit(this.char)) {
            this.consume();
          } else if (this.state.buf.length === 2 && this.char === CHAR_COLON) {
            this.state.result += ":" + this.state.buf;
            this.state.buf = "";
            return this.next(this.parseTimeSec);
          } else {
            throw this.error(new TomlError("Incomplete datetime"));
          }
        }
        parseTimeSec() {
          if (isDigit(this.char)) {
            this.consume();
            if (this.state.buf.length === 2) {
              this.state.result += ":" + this.state.buf;
              this.state.buf = "";
              return this.next(this.parseTimeZoneOrFraction);
            }
          } else {
            throw this.error(new TomlError("Incomplete datetime"));
          }
        }
        parseOnlyTimeHour() {
          if (this.char === CHAR_COLON) {
            if (this.state.buf.length < 2) {
              throw this.error(new TomlError("Hours less than 10 must be zero padded to two characters"));
            }
            this.state.result = this.state.buf;
            this.state.buf = "";
            return this.next(this.parseOnlyTimeMin);
          } else {
            throw this.error(new TomlError("Incomplete time"));
          }
        }
        parseOnlyTimeMin() {
          if (this.state.buf.length < 2 && isDigit(this.char)) {
            this.consume();
          } else if (this.state.buf.length === 2 && this.char === CHAR_COLON) {
            this.state.result += ":" + this.state.buf;
            this.state.buf = "";
            return this.next(this.parseOnlyTimeSec);
          } else {
            throw this.error(new TomlError("Incomplete time"));
          }
        }
        parseOnlyTimeSec() {
          if (isDigit(this.char)) {
            this.consume();
            if (this.state.buf.length === 2) {
              return this.next(this.parseOnlyTimeFractionMaybe);
            }
          } else {
            throw this.error(new TomlError("Incomplete time"));
          }
        }
        parseOnlyTimeFractionMaybe() {
          this.state.result += ":" + this.state.buf;
          if (this.char === CHAR_PERIOD) {
            this.state.buf = "";
            this.next(this.parseOnlyTimeFraction);
          } else {
            return this.return(createTime(this.state.result));
          }
        }
        parseOnlyTimeFraction() {
          if (isDigit(this.char)) {
            this.consume();
          } else if (this.atEndOfWord()) {
            if (this.state.buf.length === 0) throw this.error(new TomlError("Expected digit in milliseconds"));
            return this.returnNow(createTime(this.state.result + "." + this.state.buf));
          } else {
            throw this.error(new TomlError("Unexpected character in datetime, expected period (.), minus (-), plus (+) or Z"));
          }
        }
        parseTimeZoneOrFraction() {
          if (this.char === CHAR_PERIOD) {
            this.consume();
            this.next(this.parseDateTimeFraction);
          } else if (this.char === CHAR_HYPHEN || this.char === CHAR_PLUS) {
            this.consume();
            this.next(this.parseTimeZoneHour);
          } else if (this.char === CHAR_Z) {
            this.consume();
            return this.return(createDateTime(this.state.result + this.state.buf));
          } else if (this.atEndOfWord()) {
            return this.returnNow(createDateTimeFloat(this.state.result + this.state.buf));
          } else {
            throw this.error(new TomlError("Unexpected character in datetime, expected period (.), minus (-), plus (+) or Z"));
          }
        }
        parseDateTimeFraction() {
          if (isDigit(this.char)) {
            this.consume();
          } else if (this.state.buf.length === 1) {
            throw this.error(new TomlError("Expected digit in milliseconds"));
          } else if (this.char === CHAR_HYPHEN || this.char === CHAR_PLUS) {
            this.consume();
            this.next(this.parseTimeZoneHour);
          } else if (this.char === CHAR_Z) {
            this.consume();
            return this.return(createDateTime(this.state.result + this.state.buf));
          } else if (this.atEndOfWord()) {
            return this.returnNow(createDateTimeFloat(this.state.result + this.state.buf));
          } else {
            throw this.error(new TomlError("Unexpected character in datetime, expected period (.), minus (-), plus (+) or Z"));
          }
        }
        parseTimeZoneHour() {
          if (isDigit(this.char)) {
            this.consume();
            if (/\d\d$/.test(this.state.buf)) return this.next(this.parseTimeZoneSep);
          } else {
            throw this.error(new TomlError("Unexpected character in datetime, expected digit"));
          }
        }
        parseTimeZoneSep() {
          if (this.char === CHAR_COLON) {
            this.consume();
            this.next(this.parseTimeZoneMin);
          } else {
            throw this.error(new TomlError("Unexpected character in datetime, expected colon"));
          }
        }
        parseTimeZoneMin() {
          if (isDigit(this.char)) {
            this.consume();
            if (/\d\d$/.test(this.state.buf)) return this.return(createDateTime(this.state.result + this.state.buf));
          } else {
            throw this.error(new TomlError("Unexpected character in datetime, expected digit"));
          }
        }
        /* BOOLEAN */
        parseBoolean() {
          if (this.char === CHAR_t) {
            this.consume();
            return this.next(this.parseTrue_r);
          } else if (this.char === CHAR_f) {
            this.consume();
            return this.next(this.parseFalse_a);
          }
        }
        parseTrue_r() {
          if (this.char === CHAR_r) {
            this.consume();
            return this.next(this.parseTrue_u);
          } else {
            throw this.error(new TomlError("Invalid boolean, expected true or false"));
          }
        }
        parseTrue_u() {
          if (this.char === CHAR_u) {
            this.consume();
            return this.next(this.parseTrue_e);
          } else {
            throw this.error(new TomlError("Invalid boolean, expected true or false"));
          }
        }
        parseTrue_e() {
          if (this.char === CHAR_e) {
            return this.return(true);
          } else {
            throw this.error(new TomlError("Invalid boolean, expected true or false"));
          }
        }
        parseFalse_a() {
          if (this.char === CHAR_a) {
            this.consume();
            return this.next(this.parseFalse_l);
          } else {
            throw this.error(new TomlError("Invalid boolean, expected true or false"));
          }
        }
        parseFalse_l() {
          if (this.char === CHAR_l) {
            this.consume();
            return this.next(this.parseFalse_s);
          } else {
            throw this.error(new TomlError("Invalid boolean, expected true or false"));
          }
        }
        parseFalse_s() {
          if (this.char === CHAR_s) {
            this.consume();
            return this.next(this.parseFalse_e);
          } else {
            throw this.error(new TomlError("Invalid boolean, expected true or false"));
          }
        }
        parseFalse_e() {
          if (this.char === CHAR_e) {
            return this.return(false);
          } else {
            throw this.error(new TomlError("Invalid boolean, expected true or false"));
          }
        }
        /* INLINE LISTS */
        parseInlineList() {
          if (this.char === CHAR_SP || this.char === CTRL_I || this.char === CTRL_M || this.char === CTRL_J) {
            return null;
          } else if (this.char === Parser.END) {
            throw this.error(new TomlError("Unterminated inline array"));
          } else if (this.char === CHAR_NUM) {
            return this.call(this.parseComment);
          } else if (this.char === CHAR_RSQB) {
            return this.return(this.state.resultArr || InlineList());
          } else {
            return this.callNow(this.parseValue, this.recordInlineListValue);
          }
        }
        recordInlineListValue(value) {
          if (this.state.resultArr) {
            const listType = this.state.resultArr[_contentType];
            const valueType = tomlType(value);
            if (listType !== valueType) {
              throw this.error(new TomlError(`Inline lists must be a single type, not a mix of ${listType} and ${valueType}`));
            }
          } else {
            this.state.resultArr = InlineList(tomlType(value));
          }
          if (isFloat(value) || isInteger(value)) {
            this.state.resultArr.push(value.valueOf());
          } else {
            this.state.resultArr.push(value);
          }
          return this.goto(this.parseInlineListNext);
        }
        parseInlineListNext() {
          if (this.char === CHAR_SP || this.char === CTRL_I || this.char === CTRL_M || this.char === CTRL_J) {
            return null;
          } else if (this.char === CHAR_NUM) {
            return this.call(this.parseComment);
          } else if (this.char === CHAR_COMMA) {
            return this.next(this.parseInlineList);
          } else if (this.char === CHAR_RSQB) {
            return this.goto(this.parseInlineList);
          } else {
            throw this.error(new TomlError("Invalid character, expected whitespace, comma (,) or close bracket (])"));
          }
        }
        /* INLINE TABLE */
        parseInlineTable() {
          if (this.char === CHAR_SP || this.char === CTRL_I) {
            return null;
          } else if (this.char === Parser.END || this.char === CHAR_NUM || this.char === CTRL_J || this.char === CTRL_M) {
            throw this.error(new TomlError("Unterminated inline array"));
          } else if (this.char === CHAR_RCUB) {
            return this.return(this.state.resultTable || InlineTable());
          } else {
            if (!this.state.resultTable) this.state.resultTable = InlineTable();
            return this.callNow(this.parseAssign, this.recordInlineTableValue);
          }
        }
        recordInlineTableValue(kv) {
          let target = this.state.resultTable;
          let finalKey = kv.key.pop();
          for (let kw of kv.key) {
            if (hasKey(target, kw) && (!isTable(target[kw]) || target[kw][_declared])) {
              throw this.error(new TomlError("Can't redefine existing key"));
            }
            target = target[kw] = target[kw] || Table();
          }
          if (hasKey(target, finalKey)) {
            throw this.error(new TomlError("Can't redefine existing key"));
          }
          if (isInteger(kv.value) || isFloat(kv.value)) {
            target[finalKey] = kv.value.valueOf();
          } else {
            target[finalKey] = kv.value;
          }
          return this.goto(this.parseInlineTableNext);
        }
        parseInlineTableNext() {
          if (this.char === CHAR_SP || this.char === CTRL_I) {
            return null;
          } else if (this.char === Parser.END || this.char === CHAR_NUM || this.char === CTRL_J || this.char === CTRL_M) {
            throw this.error(new TomlError("Unterminated inline array"));
          } else if (this.char === CHAR_COMMA) {
            return this.next(this.parseInlineTable);
          } else if (this.char === CHAR_RCUB) {
            return this.goto(this.parseInlineTable);
          } else {
            throw this.error(new TomlError("Invalid character, expected whitespace, comma (,) or close bracket (])"));
          }
        }
      }
      return TOMLParser;
    }
  }
});

// node_modules/@iarna/toml/parse-pretty-error.js
var require_parse_pretty_error = __commonJS({
  "node_modules/@iarna/toml/parse-pretty-error.js"(exports2, module2) {
    "use strict";
    module2.exports = prettyError;
    function prettyError(err, buf) {
      if (err.pos == null || err.line == null) return err;
      let msg = err.message;
      msg += ` at row ${err.line + 1}, col ${err.col + 1}, pos ${err.pos}:
`;
      if (buf && buf.split) {
        const lines = buf.split(/\n/);
        const lineNumWidth = String(Math.min(lines.length, err.line + 3)).length;
        let linePadding = " ";
        while (linePadding.length < lineNumWidth) linePadding += " ";
        for (let ii = Math.max(0, err.line - 1); ii < Math.min(lines.length, err.line + 2); ++ii) {
          let lineNum = String(ii + 1);
          if (lineNum.length < lineNumWidth) lineNum = " " + lineNum;
          if (err.line === ii) {
            msg += lineNum + "> " + lines[ii] + "\n";
            msg += linePadding + "  ";
            for (let hh = 0; hh < err.col; ++hh) {
              msg += " ";
            }
            msg += "^\n";
          } else {
            msg += lineNum + ": " + lines[ii] + "\n";
          }
        }
      }
      err.message = msg + "\n";
      return err;
    }
  }
});

// node_modules/@iarna/toml/parse-string.js
var require_parse_string = __commonJS({
  "node_modules/@iarna/toml/parse-string.js"(exports2, module2) {
    "use strict";
    module2.exports = parseString;
    var TOMLParser = require_toml_parser();
    var prettyError = require_parse_pretty_error();
    function parseString(str) {
      if (global.Buffer && global.Buffer.isBuffer(str)) {
        str = str.toString("utf8");
      }
      const parser = new TOMLParser();
      try {
        parser.parse(str);
        return parser.finish();
      } catch (err) {
        throw prettyError(err, str);
      }
    }
  }
});

// node_modules/@iarna/toml/parse-async.js
var require_parse_async = __commonJS({
  "node_modules/@iarna/toml/parse-async.js"(exports2, module2) {
    "use strict";
    module2.exports = parseAsync;
    var TOMLParser = require_toml_parser();
    var prettyError = require_parse_pretty_error();
    function parseAsync(str, opts) {
      if (!opts) opts = {};
      const index = 0;
      const blocksize = opts.blocksize || 40960;
      const parser = new TOMLParser();
      return new Promise((resolve, reject) => {
        setImmediate(parseAsyncNext, index, blocksize, resolve, reject);
      });
      function parseAsyncNext(index2, blocksize2, resolve, reject) {
        if (index2 >= str.length) {
          try {
            return resolve(parser.finish());
          } catch (err) {
            return reject(prettyError(err, str));
          }
        }
        try {
          parser.parse(str.slice(index2, index2 + blocksize2));
          setImmediate(parseAsyncNext, index2 + blocksize2, blocksize2, resolve, reject);
        } catch (err) {
          reject(prettyError(err, str));
        }
      }
    }
  }
});

// node_modules/@iarna/toml/parse-stream.js
var require_parse_stream = __commonJS({
  "node_modules/@iarna/toml/parse-stream.js"(exports2, module2) {
    "use strict";
    module2.exports = parseStream;
    var stream = __require("stream");
    var TOMLParser = require_toml_parser();
    function parseStream(stm) {
      if (stm) {
        return parseReadable(stm);
      } else {
        return parseTransform(stm);
      }
    }
    function parseReadable(stm) {
      const parser = new TOMLParser();
      stm.setEncoding("utf8");
      return new Promise((resolve, reject) => {
        let readable;
        let ended = false;
        let errored = false;
        function finish() {
          ended = true;
          if (readable) return;
          try {
            resolve(parser.finish());
          } catch (err) {
            reject(err);
          }
        }
        function error(err) {
          errored = true;
          reject(err);
        }
        stm.once("end", finish);
        stm.once("error", error);
        readNext();
        function readNext() {
          readable = true;
          let data;
          while ((data = stm.read()) !== null) {
            try {
              parser.parse(data);
            } catch (err) {
              return error(err);
            }
          }
          readable = false;
          if (ended) return finish();
          if (errored) return;
          stm.once("readable", readNext);
        }
      });
    }
    function parseTransform() {
      const parser = new TOMLParser();
      return new stream.Transform({
        objectMode: true,
        transform(chunk, encoding, cb) {
          try {
            parser.parse(chunk.toString(encoding));
          } catch (err) {
            this.emit("error", err);
          }
          cb();
        },
        flush(cb) {
          try {
            this.push(parser.finish());
          } catch (err) {
            this.emit("error", err);
          }
          cb();
        }
      });
    }
  }
});

// node_modules/@iarna/toml/parse.js
var require_parse = __commonJS({
  "node_modules/@iarna/toml/parse.js"(exports2, module2) {
    "use strict";
    module2.exports = require_parse_string();
    module2.exports.async = require_parse_async();
    module2.exports.stream = require_parse_stream();
    module2.exports.prettyError = require_parse_pretty_error();
  }
});

// node_modules/@iarna/toml/stringify.js
var require_stringify = __commonJS({
  "node_modules/@iarna/toml/stringify.js"(exports2, module2) {
    "use strict";
    module2.exports = stringify;
    module2.exports.value = stringifyInline;
    function stringify(obj) {
      if (obj === null) throw typeError("null");
      if (obj === void 0) throw typeError("undefined");
      if (typeof obj !== "object") throw typeError(typeof obj);
      if (typeof obj.toJSON === "function") obj = obj.toJSON();
      if (obj == null) return null;
      const type = tomlType2(obj);
      if (type !== "table") throw typeError(type);
      return stringifyObject("", "", obj);
    }
    function typeError(type) {
      return new Error("Can only stringify objects, not " + type);
    }
    function arrayOneTypeError() {
      return new Error("Array values can't have mixed types");
    }
    function getInlineKeys(obj) {
      return Object.keys(obj).filter((key) => isInline(obj[key]));
    }
    function getComplexKeys(obj) {
      return Object.keys(obj).filter((key) => !isInline(obj[key]));
    }
    function toJSON(obj) {
      let nobj = Array.isArray(obj) ? [] : Object.prototype.hasOwnProperty.call(obj, "__proto__") ? { ["__proto__"]: void 0 } : {};
      for (let prop of Object.keys(obj)) {
        if (obj[prop] && typeof obj[prop].toJSON === "function" && !("toISOString" in obj[prop])) {
          nobj[prop] = obj[prop].toJSON();
        } else {
          nobj[prop] = obj[prop];
        }
      }
      return nobj;
    }
    function stringifyObject(prefix, indent, obj) {
      obj = toJSON(obj);
      var inlineKeys;
      var complexKeys;
      inlineKeys = getInlineKeys(obj);
      complexKeys = getComplexKeys(obj);
      var result = [];
      var inlineIndent = indent || "";
      inlineKeys.forEach((key) => {
        var type = tomlType2(obj[key]);
        if (type !== "undefined" && type !== "null") {
          result.push(inlineIndent + stringifyKey(key) + " = " + stringifyAnyInline(obj[key], true));
        }
      });
      if (result.length > 0) result.push("");
      var complexIndent = prefix && inlineKeys.length > 0 ? indent + "  " : "";
      complexKeys.forEach((key) => {
        result.push(stringifyComplex(prefix, complexIndent, key, obj[key]));
      });
      return result.join("\n");
    }
    function isInline(value) {
      switch (tomlType2(value)) {
        case "undefined":
        case "null":
        case "integer":
        case "nan":
        case "float":
        case "boolean":
        case "string":
        case "datetime":
          return true;
        case "array":
          return value.length === 0 || tomlType2(value[0]) !== "table";
        case "table":
          return Object.keys(value).length === 0;
        /* istanbul ignore next */
        default:
          return false;
      }
    }
    function tomlType2(value) {
      if (value === void 0) {
        return "undefined";
      } else if (value === null) {
        return "null";
      } else if (typeof value === "bigint" || Number.isInteger(value) && !Object.is(value, -0)) {
        return "integer";
      } else if (typeof value === "number") {
        return "float";
      } else if (typeof value === "boolean") {
        return "boolean";
      } else if (typeof value === "string") {
        return "string";
      } else if ("toISOString" in value) {
        return isNaN(value) ? "undefined" : "datetime";
      } else if (Array.isArray(value)) {
        return "array";
      } else {
        return "table";
      }
    }
    function stringifyKey(key) {
      var keyStr = String(key);
      if (/^[-A-Za-z0-9_]+$/.test(keyStr)) {
        return keyStr;
      } else {
        return stringifyBasicString(keyStr);
      }
    }
    function stringifyBasicString(str) {
      return '"' + escapeString(str).replace(/"/g, '\\"') + '"';
    }
    function stringifyLiteralString(str) {
      return "'" + str + "'";
    }
    function numpad(num, str) {
      while (str.length < num) str = "0" + str;
      return str;
    }
    function escapeString(str) {
      return str.replace(/\\/g, "\\\\").replace(/[\b]/g, "\\b").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\f/g, "\\f").replace(/\r/g, "\\r").replace(/([\u0000-\u001f\u007f])/, (c) => "\\u" + numpad(4, c.codePointAt(0).toString(16)));
    }
    function stringifyMultilineString(str) {
      let escaped = str.split(/\n/).map((str2) => {
        return escapeString(str2).replace(/"(?="")/g, '\\"');
      }).join("\n");
      if (escaped.slice(-1) === '"') escaped += "\\\n";
      return '"""\n' + escaped + '"""';
    }
    function stringifyAnyInline(value, multilineOk) {
      let type = tomlType2(value);
      if (type === "string") {
        if (multilineOk && /\n/.test(value)) {
          type = "string-multiline";
        } else if (!/[\b\t\n\f\r']/.test(value) && /"/.test(value)) {
          type = "string-literal";
        }
      }
      return stringifyInline(value, type);
    }
    function stringifyInline(value, type) {
      if (!type) type = tomlType2(value);
      switch (type) {
        case "string-multiline":
          return stringifyMultilineString(value);
        case "string":
          return stringifyBasicString(value);
        case "string-literal":
          return stringifyLiteralString(value);
        case "integer":
          return stringifyInteger(value);
        case "float":
          return stringifyFloat(value);
        case "boolean":
          return stringifyBoolean(value);
        case "datetime":
          return stringifyDatetime(value);
        case "array":
          return stringifyInlineArray(value.filter((_) => tomlType2(_) !== "null" && tomlType2(_) !== "undefined" && tomlType2(_) !== "nan"));
        case "table":
          return stringifyInlineTable(value);
        /* istanbul ignore next */
        default:
          throw typeError(type);
      }
    }
    function stringifyInteger(value) {
      return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, "_");
    }
    function stringifyFloat(value) {
      if (value === Infinity) {
        return "inf";
      } else if (value === -Infinity) {
        return "-inf";
      } else if (Object.is(value, NaN)) {
        return "nan";
      } else if (Object.is(value, -0)) {
        return "-0.0";
      }
      var chunks = String(value).split(".");
      var int = chunks[0];
      var dec = chunks[1] || 0;
      return stringifyInteger(int) + "." + dec;
    }
    function stringifyBoolean(value) {
      return String(value);
    }
    function stringifyDatetime(value) {
      return value.toISOString();
    }
    function isNumber(type) {
      return type === "float" || type === "integer";
    }
    function arrayType(values) {
      var contentType = tomlType2(values[0]);
      if (values.every((_) => tomlType2(_) === contentType)) return contentType;
      if (values.every((_) => isNumber(tomlType2(_)))) return "float";
      return "mixed";
    }
    function validateArray(values) {
      const type = arrayType(values);
      if (type === "mixed") {
        throw arrayOneTypeError();
      }
      return type;
    }
    function stringifyInlineArray(values) {
      values = toJSON(values);
      const type = validateArray(values);
      var result = "[";
      var stringified = values.map((_) => stringifyInline(_, type));
      if (stringified.join(", ").length > 60 || /\n/.test(stringified)) {
        result += "\n  " + stringified.join(",\n  ") + "\n";
      } else {
        result += " " + stringified.join(", ") + (stringified.length > 0 ? " " : "");
      }
      return result + "]";
    }
    function stringifyInlineTable(value) {
      value = toJSON(value);
      var result = [];
      Object.keys(value).forEach((key) => {
        result.push(stringifyKey(key) + " = " + stringifyAnyInline(value[key], false));
      });
      return "{ " + result.join(", ") + (result.length > 0 ? " " : "") + "}";
    }
    function stringifyComplex(prefix, indent, key, value) {
      var valueType = tomlType2(value);
      if (valueType === "array") {
        return stringifyArrayOfTables(prefix, indent, key, value);
      } else if (valueType === "table") {
        return stringifyComplexTable(prefix, indent, key, value);
      } else {
        throw typeError(valueType);
      }
    }
    function stringifyArrayOfTables(prefix, indent, key, values) {
      values = toJSON(values);
      validateArray(values);
      var firstValueType = tomlType2(values[0]);
      if (firstValueType !== "table") throw typeError(firstValueType);
      var fullKey = prefix + stringifyKey(key);
      var result = "";
      values.forEach((table) => {
        if (result.length > 0) result += "\n";
        result += indent + "[[" + fullKey + "]]\n";
        result += stringifyObject(fullKey + ".", indent, table);
      });
      return result;
    }
    function stringifyComplexTable(prefix, indent, key, value) {
      var fullKey = prefix + stringifyKey(key);
      var result = "";
      if (getInlineKeys(value).length > 0) {
        result += indent + "[" + fullKey + "]\n";
      }
      return result + stringifyObject(fullKey + ".", indent, value);
    }
  }
});

// node_modules/@iarna/toml/toml.js
var require_toml = __commonJS({
  "node_modules/@iarna/toml/toml.js"(exports2) {
    "use strict";
    exports2.parse = require_parse();
    exports2.stringify = require_stringify();
  }
});

// node_modules/picomatch/lib/constants.js
var require_constants = __commonJS({
  "node_modules/picomatch/lib/constants.js"(exports2, module2) {
    "use strict";
    var WIN_SLASH = "\\\\/";
    var WIN_NO_SLASH = `[^${WIN_SLASH}]`;
    var DEFAULT_MAX_EXTGLOB_RECURSION = 0;
    var DOT_LITERAL = "\\.";
    var PLUS_LITERAL = "\\+";
    var QMARK_LITERAL = "\\?";
    var SLASH_LITERAL = "\\/";
    var ONE_CHAR = "(?=.)";
    var QMARK = "[^/]";
    var END_ANCHOR = `(?:${SLASH_LITERAL}|$)`;
    var START_ANCHOR = `(?:^|${SLASH_LITERAL})`;
    var DOTS_SLASH = `${DOT_LITERAL}{1,2}${END_ANCHOR}`;
    var NO_DOT = `(?!${DOT_LITERAL})`;
    var NO_DOTS = `(?!${START_ANCHOR}${DOTS_SLASH})`;
    var NO_DOT_SLASH = `(?!${DOT_LITERAL}{0,1}${END_ANCHOR})`;
    var NO_DOTS_SLASH = `(?!${DOTS_SLASH})`;
    var QMARK_NO_DOT = `[^.${SLASH_LITERAL}]`;
    var STAR = `${QMARK}*?`;
    var SEP = "/";
    var POSIX_CHARS = {
      DOT_LITERAL,
      PLUS_LITERAL,
      QMARK_LITERAL,
      SLASH_LITERAL,
      ONE_CHAR,
      QMARK,
      END_ANCHOR,
      DOTS_SLASH,
      NO_DOT,
      NO_DOTS,
      NO_DOT_SLASH,
      NO_DOTS_SLASH,
      QMARK_NO_DOT,
      STAR,
      START_ANCHOR,
      SEP
    };
    var WINDOWS_CHARS = {
      ...POSIX_CHARS,
      SLASH_LITERAL: `[${WIN_SLASH}]`,
      QMARK: WIN_NO_SLASH,
      STAR: `${WIN_NO_SLASH}*?`,
      DOTS_SLASH: `${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$)`,
      NO_DOT: `(?!${DOT_LITERAL})`,
      NO_DOTS: `(?!(?:^|[${WIN_SLASH}])${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      NO_DOT_SLASH: `(?!${DOT_LITERAL}{0,1}(?:[${WIN_SLASH}]|$))`,
      NO_DOTS_SLASH: `(?!${DOT_LITERAL}{1,2}(?:[${WIN_SLASH}]|$))`,
      QMARK_NO_DOT: `[^.${WIN_SLASH}]`,
      START_ANCHOR: `(?:^|[${WIN_SLASH}])`,
      END_ANCHOR: `(?:[${WIN_SLASH}]|$)`,
      SEP: "\\"
    };
    var POSIX_REGEX_SOURCE = {
      __proto__: null,
      alnum: "a-zA-Z0-9",
      alpha: "a-zA-Z",
      ascii: "\\x00-\\x7F",
      blank: " \\t",
      cntrl: "\\x00-\\x1F\\x7F",
      digit: "0-9",
      graph: "\\x21-\\x7E",
      lower: "a-z",
      print: "\\x20-\\x7E ",
      punct: "\\-!\"#$%&'()\\*+,./:;<=>?@[\\]^_`{|}~",
      space: " \\t\\r\\n\\v\\f",
      upper: "A-Z",
      word: "A-Za-z0-9_",
      xdigit: "A-Fa-f0-9"
    };
    module2.exports = {
      DEFAULT_MAX_EXTGLOB_RECURSION,
      MAX_LENGTH: 1024 * 64,
      POSIX_REGEX_SOURCE,
      // regular expressions
      REGEX_BACKSLASH: /\\(?![*+?^${}(|)[\]])/g,
      REGEX_NON_SPECIAL_CHARS: /^[^@![\].,$*+?^{}()|\\/]+/,
      REGEX_SPECIAL_CHARS: /[-*+?.^${}(|)[\]]/,
      REGEX_SPECIAL_CHARS_BACKREF: /(\\?)((\W)(\3*))/g,
      REGEX_SPECIAL_CHARS_GLOBAL: /([-*+?.^${}(|)[\]])/g,
      REGEX_REMOVE_BACKSLASH: /(?:\[.*?[^\\]\]|\\(?=.))/g,
      // Replace globs with equivalent patterns to reduce parsing time.
      REPLACEMENTS: {
        __proto__: null,
        "***": "*",
        "**/**": "**",
        "**/**/**": "**"
      },
      // Digits
      CHAR_0: 48,
      /* 0 */
      CHAR_9: 57,
      /* 9 */
      // Alphabet chars.
      CHAR_UPPERCASE_A: 65,
      /* A */
      CHAR_LOWERCASE_A: 97,
      /* a */
      CHAR_UPPERCASE_Z: 90,
      /* Z */
      CHAR_LOWERCASE_Z: 122,
      /* z */
      CHAR_LEFT_PARENTHESES: 40,
      /* ( */
      CHAR_RIGHT_PARENTHESES: 41,
      /* ) */
      CHAR_ASTERISK: 42,
      /* * */
      // Non-alphabetic chars.
      CHAR_AMPERSAND: 38,
      /* & */
      CHAR_AT: 64,
      /* @ */
      CHAR_BACKWARD_SLASH: 92,
      /* \ */
      CHAR_CARRIAGE_RETURN: 13,
      /* \r */
      CHAR_CIRCUMFLEX_ACCENT: 94,
      /* ^ */
      CHAR_COLON: 58,
      /* : */
      CHAR_COMMA: 44,
      /* , */
      CHAR_DOT: 46,
      /* . */
      CHAR_DOUBLE_QUOTE: 34,
      /* " */
      CHAR_EQUAL: 61,
      /* = */
      CHAR_EXCLAMATION_MARK: 33,
      /* ! */
      CHAR_FORM_FEED: 12,
      /* \f */
      CHAR_FORWARD_SLASH: 47,
      /* / */
      CHAR_GRAVE_ACCENT: 96,
      /* ` */
      CHAR_HASH: 35,
      /* # */
      CHAR_HYPHEN_MINUS: 45,
      /* - */
      CHAR_LEFT_ANGLE_BRACKET: 60,
      /* < */
      CHAR_LEFT_CURLY_BRACE: 123,
      /* { */
      CHAR_LEFT_SQUARE_BRACKET: 91,
      /* [ */
      CHAR_LINE_FEED: 10,
      /* \n */
      CHAR_NO_BREAK_SPACE: 160,
      /* \u00A0 */
      CHAR_PERCENT: 37,
      /* % */
      CHAR_PLUS: 43,
      /* + */
      CHAR_QUESTION_MARK: 63,
      /* ? */
      CHAR_RIGHT_ANGLE_BRACKET: 62,
      /* > */
      CHAR_RIGHT_CURLY_BRACE: 125,
      /* } */
      CHAR_RIGHT_SQUARE_BRACKET: 93,
      /* ] */
      CHAR_SEMICOLON: 59,
      /* ; */
      CHAR_SINGLE_QUOTE: 39,
      /* ' */
      CHAR_SPACE: 32,
      /*   */
      CHAR_TAB: 9,
      /* \t */
      CHAR_UNDERSCORE: 95,
      /* _ */
      CHAR_VERTICAL_LINE: 124,
      /* | */
      CHAR_ZERO_WIDTH_NOBREAK_SPACE: 65279,
      /* \uFEFF */
      /**
       * Create EXTGLOB_CHARS
       */
      extglobChars(chars) {
        return {
          "!": { type: "negate", open: "(?:(?!(?:", close: `))${chars.STAR})` },
          "?": { type: "qmark", open: "(?:", close: ")?" },
          "+": { type: "plus", open: "(?:", close: ")+" },
          "*": { type: "star", open: "(?:", close: ")*" },
          "@": { type: "at", open: "(?:", close: ")" }
        };
      },
      /**
       * Create GLOB_CHARS
       */
      globChars(win32) {
        return win32 === true ? WINDOWS_CHARS : POSIX_CHARS;
      }
    };
  }
});

// node_modules/picomatch/lib/utils.js
var require_utils = __commonJS({
  "node_modules/picomatch/lib/utils.js"(exports2) {
    "use strict";
    var {
      REGEX_BACKSLASH,
      REGEX_REMOVE_BACKSLASH,
      REGEX_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_GLOBAL
    } = require_constants();
    exports2.isObject = (val) => val !== null && typeof val === "object" && !Array.isArray(val);
    exports2.hasRegexChars = (str) => REGEX_SPECIAL_CHARS.test(str);
    exports2.isRegexChar = (str) => str.length === 1 && exports2.hasRegexChars(str);
    exports2.escapeRegex = (str) => str.replace(REGEX_SPECIAL_CHARS_GLOBAL, "\\$1");
    exports2.toPosixSlashes = (str) => str.replace(REGEX_BACKSLASH, "/");
    exports2.isWindows = () => {
      if (typeof navigator !== "undefined" && navigator.platform) {
        const platform = navigator.platform.toLowerCase();
        return platform === "win32" || platform === "windows";
      }
      if (typeof process !== "undefined" && process.platform) {
        return process.platform === "win32";
      }
      return false;
    };
    exports2.removeBackslashes = (str) => {
      return str.replace(REGEX_REMOVE_BACKSLASH, (match) => {
        return match === "\\" ? "" : match;
      });
    };
    exports2.escapeLast = (input2, char, lastIdx) => {
      const idx = input2.lastIndexOf(char, lastIdx);
      if (idx === -1) return input2;
      if (input2[idx - 1] === "\\") return exports2.escapeLast(input2, char, idx - 1);
      return `${input2.slice(0, idx)}\\${input2.slice(idx)}`;
    };
    exports2.removePrefix = (input2, state = {}) => {
      let output2 = input2;
      if (output2.startsWith("./")) {
        output2 = output2.slice(2);
        state.prefix = "./";
      }
      return output2;
    };
    exports2.wrapOutput = (input2, state = {}, options = {}) => {
      const prepend = options.contains ? "" : "^";
      const append = options.contains ? "" : "$";
      let output2 = `${prepend}(?:${input2})${append}`;
      if (state.negated === true) {
        output2 = `(?:^(?!${output2}).*$)`;
      }
      return output2;
    };
    exports2.basename = (path3, { windows } = {}) => {
      const segs = path3.split(windows ? /[\\/]/ : "/");
      const last = segs[segs.length - 1];
      if (last === "") {
        return segs[segs.length - 2];
      }
      return last;
    };
  }
});

// node_modules/picomatch/lib/scan.js
var require_scan = __commonJS({
  "node_modules/picomatch/lib/scan.js"(exports2, module2) {
    "use strict";
    var utils = require_utils();
    var {
      CHAR_ASTERISK,
      /* * */
      CHAR_AT,
      /* @ */
      CHAR_BACKWARD_SLASH,
      /* \ */
      CHAR_COMMA: CHAR_COMMA2,
      /* , */
      CHAR_DOT,
      /* . */
      CHAR_EXCLAMATION_MARK,
      /* ! */
      CHAR_FORWARD_SLASH,
      /* / */
      CHAR_LEFT_CURLY_BRACE,
      /* { */
      CHAR_LEFT_PARENTHESES,
      /* ( */
      CHAR_LEFT_SQUARE_BRACKET,
      /* [ */
      CHAR_PLUS: CHAR_PLUS2,
      /* + */
      CHAR_QUESTION_MARK,
      /* ? */
      CHAR_RIGHT_CURLY_BRACE,
      /* } */
      CHAR_RIGHT_PARENTHESES,
      /* ) */
      CHAR_RIGHT_SQUARE_BRACKET
      /* ] */
    } = require_constants();
    var isPathSeparator = (code) => {
      return code === CHAR_FORWARD_SLASH || code === CHAR_BACKWARD_SLASH;
    };
    var depth = (token) => {
      if (token.isPrefix !== true) {
        token.depth = token.isGlobstar ? Infinity : 1;
      }
    };
    var scan = (input2, options) => {
      const opts = options || {};
      const length = input2.length - 1;
      const scanToEnd = opts.parts === true || opts.tokens === true || opts.scanToEnd === true;
      const slashes = [];
      const tokens = [];
      const parts = [];
      let str = input2;
      let index = -1;
      let start = 0;
      let lastIndex = 0;
      let isBrace = false;
      let isBracket = false;
      let isGlob = false;
      let isExtglob = false;
      let isGlobstar = false;
      let braceEscaped = false;
      let backslashes = false;
      let negated = false;
      let negatedExtglob = false;
      let finished = false;
      let braces = 0;
      let prev;
      let code;
      let token = { value: "", depth: 0, isGlob: false };
      const eos = () => index >= length;
      const peek = () => str.charCodeAt(index + 1);
      const advance = () => {
        prev = code;
        return str.charCodeAt(++index);
      };
      while (index < length) {
        code = advance();
        let next;
        if (code === CHAR_BACKWARD_SLASH) {
          backslashes = token.backslashes = true;
          code = advance();
          if (code === CHAR_LEFT_CURLY_BRACE) {
            braceEscaped = true;
          }
          continue;
        }
        if (braceEscaped === true || code === CHAR_LEFT_CURLY_BRACE) {
          braces++;
          while (eos() !== true && (code = advance())) {
            if (code === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (code === CHAR_LEFT_CURLY_BRACE) {
              braces++;
              continue;
            }
            if (braceEscaped !== true && code === CHAR_DOT && (code = advance()) === CHAR_DOT) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (braceEscaped !== true && code === CHAR_COMMA2) {
              isBrace = token.isBrace = true;
              isGlob = token.isGlob = true;
              finished = true;
              if (scanToEnd === true) {
                continue;
              }
              break;
            }
            if (code === CHAR_RIGHT_CURLY_BRACE) {
              braces--;
              if (braces === 0) {
                braceEscaped = false;
                isBrace = token.isBrace = true;
                finished = true;
                break;
              }
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_FORWARD_SLASH) {
          slashes.push(index);
          tokens.push(token);
          token = { value: "", depth: 0, isGlob: false };
          if (finished === true) continue;
          if (prev === CHAR_DOT && index === start + 1) {
            start += 2;
            continue;
          }
          lastIndex = index + 1;
          continue;
        }
        if (opts.noext !== true) {
          const isExtglobChar = code === CHAR_PLUS2 || code === CHAR_AT || code === CHAR_ASTERISK || code === CHAR_QUESTION_MARK || code === CHAR_EXCLAMATION_MARK;
          if (isExtglobChar === true && peek() === CHAR_LEFT_PARENTHESES) {
            isGlob = token.isGlob = true;
            isExtglob = token.isExtglob = true;
            finished = true;
            if (code === CHAR_EXCLAMATION_MARK && index === start) {
              negatedExtglob = true;
            }
            if (scanToEnd === true) {
              let parens = 0;
              while (eos() !== true && (code = advance())) {
                if (code === CHAR_BACKWARD_SLASH) {
                  backslashes = token.backslashes = true;
                  advance();
                  continue;
                }
                if (code === CHAR_LEFT_PARENTHESES) {
                  parens++;
                  continue;
                }
                if (code === CHAR_RIGHT_PARENTHESES && --parens === 0) {
                  finished = true;
                  break;
                }
              }
              continue;
            }
            break;
          }
        }
        if (code === CHAR_ASTERISK) {
          if (prev === CHAR_ASTERISK) isGlobstar = token.isGlobstar = true;
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_QUESTION_MARK) {
          isGlob = token.isGlob = true;
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (code === CHAR_LEFT_SQUARE_BRACKET) {
          while (eos() !== true && (next = advance())) {
            if (next === CHAR_BACKWARD_SLASH) {
              backslashes = token.backslashes = true;
              advance();
              continue;
            }
            if (next === CHAR_RIGHT_SQUARE_BRACKET) {
              isBracket = token.isBracket = true;
              isGlob = token.isGlob = true;
              finished = true;
              break;
            }
          }
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
        if (opts.nonegate !== true && code === CHAR_EXCLAMATION_MARK && index === start) {
          negated = token.negated = true;
          start++;
          continue;
        }
        if (opts.noparen !== true && code === CHAR_LEFT_PARENTHESES) {
          isGlob = token.isGlob = true;
          if (scanToEnd === true) {
            let parens = 1;
            while (eos() !== true && (code = advance())) {
              if (code === CHAR_BACKWARD_SLASH) {
                backslashes = token.backslashes = true;
                advance();
                continue;
              }
              if (code === CHAR_LEFT_PARENTHESES) {
                parens++;
                continue;
              }
              if (code === CHAR_RIGHT_PARENTHESES && --parens === 0) {
                finished = true;
                break;
              }
            }
            continue;
          }
          break;
        }
        if (isGlob === true) {
          finished = true;
          if (scanToEnd === true) {
            continue;
          }
          break;
        }
      }
      if (opts.noext === true) {
        isExtglob = false;
        isGlob = false;
      }
      let base = str;
      let prefix = "";
      let glob = "";
      if (start > 0) {
        prefix = str.slice(0, start);
        str = str.slice(start);
        lastIndex -= start;
      }
      if (base && isGlob === true && lastIndex > 0) {
        base = str.slice(0, lastIndex);
        glob = str.slice(lastIndex);
      } else if (isGlob === true) {
        base = "";
        glob = str;
      } else {
        base = str;
      }
      if (base && base !== "" && base !== "/" && base !== str) {
        if (isPathSeparator(base.charCodeAt(base.length - 1))) {
          base = base.slice(0, -1);
        }
      }
      if (opts.unescape === true) {
        if (glob) glob = utils.removeBackslashes(glob);
        if (base && backslashes === true) {
          base = utils.removeBackslashes(base);
        }
      }
      const state = {
        prefix,
        input: input2,
        start,
        base,
        glob,
        isBrace,
        isBracket,
        isGlob,
        isExtglob,
        isGlobstar,
        negated,
        negatedExtglob
      };
      if (opts.tokens === true) {
        state.maxDepth = 0;
        if (!isPathSeparator(code)) {
          tokens.push(token);
        }
        state.tokens = tokens;
      }
      if (opts.parts === true || opts.tokens === true) {
        let prevIndex;
        for (let idx = 0; idx < slashes.length; idx++) {
          const n2 = prevIndex !== void 0 ? prevIndex + 1 : start;
          const i = slashes[idx];
          const value2 = input2.slice(n2, i);
          if (opts.tokens) {
            if (idx === 0 && start !== 0) {
              tokens[idx].isPrefix = true;
              tokens[idx].value = prefix;
            } else {
              tokens[idx].value = value2;
            }
            depth(tokens[idx]);
            state.maxDepth += tokens[idx].depth;
          }
          if (i >= start) {
            parts.push(value2);
            prevIndex = i;
          }
        }
        const n = prevIndex !== void 0 ? prevIndex + 1 : start;
        const value = input2.slice(n);
        parts.push(value);
        if (opts.tokens && prevIndex && prevIndex + 1 < input2.length) {
          tokens[tokens.length - 1].value = value;
          depth(tokens[tokens.length - 1]);
          state.maxDepth += tokens[tokens.length - 1].depth;
        }
        state.slashes = slashes;
        state.parts = parts;
      }
      return state;
    };
    module2.exports = scan;
  }
});

// node_modules/picomatch/lib/parse.js
var require_parse2 = __commonJS({
  "node_modules/picomatch/lib/parse.js"(exports2, module2) {
    "use strict";
    var constants = require_constants();
    var utils = require_utils();
    var {
      MAX_LENGTH,
      POSIX_REGEX_SOURCE,
      REGEX_NON_SPECIAL_CHARS,
      REGEX_SPECIAL_CHARS_BACKREF,
      REPLACEMENTS
    } = constants;
    var expandRange = (args, options) => {
      if (typeof options.expandRange === "function") {
        return options.expandRange(...args, options);
      }
      args.sort();
      const value = `[${args.join("-")}]`;
      try {
        new RegExp(value);
      } catch (ex) {
        return args.map((v) => utils.escapeRegex(v)).join("..");
      }
      return value;
    };
    var syntaxError = (type, char) => {
      return `Missing ${type}: "${char}" - use "\\\\${char}" to match literal characters`;
    };
    var splitTopLevel = (input2) => {
      const parts = [];
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let value = "";
      let escaped = false;
      for (const ch of input2) {
        if (escaped === true) {
          value += ch;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          value += ch;
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          value += ch;
          continue;
        }
        if (quote === 0) {
          if (ch === "[") {
            bracket++;
          } else if (ch === "]" && bracket > 0) {
            bracket--;
          } else if (bracket === 0) {
            if (ch === "(") {
              paren++;
            } else if (ch === ")" && paren > 0) {
              paren--;
            } else if (ch === "|" && paren === 0) {
              parts.push(value);
              value = "";
              continue;
            }
          }
        }
        value += ch;
      }
      parts.push(value);
      return parts;
    };
    var isPlainBranch = (branch) => {
      let escaped = false;
      for (const ch of branch) {
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (/[?*+@!()[\]{}]/.test(ch)) {
          return false;
        }
      }
      return true;
    };
    var normalizeSimpleBranch = (branch) => {
      let value = branch.trim();
      let changed = true;
      while (changed === true) {
        changed = false;
        if (/^@\([^\\()[\]{}|]+\)$/.test(value)) {
          value = value.slice(2, -1);
          changed = true;
        }
      }
      if (!isPlainBranch(value)) {
        return;
      }
      return value.replace(/\\(.)/g, "$1");
    };
    var hasRepeatedCharPrefixOverlap = (branches) => {
      const values = branches.map(normalizeSimpleBranch).filter(Boolean);
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          const a = values[i];
          const b = values[j];
          const char = a[0];
          if (!char || a !== char.repeat(a.length) || b !== char.repeat(b.length)) {
            continue;
          }
          if (a === b || a.startsWith(b) || b.startsWith(a)) {
            return true;
          }
        }
      }
      return false;
    };
    var parseRepeatedExtglob = (pattern, requireEnd = true) => {
      if (pattern[0] !== "+" && pattern[0] !== "*" || pattern[1] !== "(") {
        return;
      }
      let bracket = 0;
      let paren = 0;
      let quote = 0;
      let escaped = false;
      for (let i = 1; i < pattern.length; i++) {
        const ch = pattern[i];
        if (escaped === true) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === '"') {
          quote = quote === 1 ? 0 : 1;
          continue;
        }
        if (quote === 1) {
          continue;
        }
        if (ch === "[") {
          bracket++;
          continue;
        }
        if (ch === "]" && bracket > 0) {
          bracket--;
          continue;
        }
        if (bracket > 0) {
          continue;
        }
        if (ch === "(") {
          paren++;
          continue;
        }
        if (ch === ")") {
          paren--;
          if (paren === 0) {
            if (requireEnd === true && i !== pattern.length - 1) {
              return;
            }
            return {
              type: pattern[0],
              body: pattern.slice(2, i),
              end: i
            };
          }
        }
      }
    };
    var buildCharClassStar = (chars) => {
      const source = chars.length === 1 ? utils.escapeRegex(chars[0]) : `[${chars.map((ch) => utils.escapeRegex(ch)).join("")}]`;
      return `${source}*`;
    };
    var getStarExtglobSequenceChars = (pattern) => {
      let index = 0;
      const chars = [];
      while (index < pattern.length) {
        const match = parseRepeatedExtglob(pattern.slice(index), false);
        if (!match || match.type !== "*") {
          return;
        }
        const branches = splitTopLevel(match.body).map((branch2) => branch2.trim());
        if (branches.length !== 1) {
          return;
        }
        const branch = normalizeSimpleBranch(branches[0]);
        if (!branch || branch.length !== 1) {
          return;
        }
        chars.push(branch);
        index += match.end + 1;
      }
      if (chars.length < 1) {
        return;
      }
      return chars;
    };
    var repeatedExtglobRecursion = (pattern) => {
      let depth = 0;
      let value = pattern.trim();
      let match = parseRepeatedExtglob(value);
      while (match) {
        depth++;
        value = match.body.trim();
        match = parseRepeatedExtglob(value);
      }
      return depth;
    };
    var analyzeRepeatedExtglob = (body, options) => {
      if (options.maxExtglobRecursion === false) {
        return { risky: false };
      }
      const max = typeof options.maxExtglobRecursion === "number" ? options.maxExtglobRecursion : constants.DEFAULT_MAX_EXTGLOB_RECURSION;
      const branches = splitTopLevel(body).map((branch) => branch.trim());
      if (branches.length > 1) {
        if (branches.some((branch) => branch === "") || branches.some((branch) => /^[*?]+$/.test(branch)) || hasRepeatedCharPrefixOverlap(branches)) {
          return { risky: true };
        }
      }
      const safeChars = [];
      let sawStarSequence = false;
      let combinable = true;
      for (const branch of branches) {
        const chars = getStarExtglobSequenceChars(branch);
        if (chars) {
          sawStarSequence = true;
          safeChars.push(...chars);
          continue;
        }
        const literal = normalizeSimpleBranch(branch);
        if (literal && literal.length === 1) {
          safeChars.push(literal);
          continue;
        }
        combinable = false;
        if (repeatedExtglobRecursion(branch) > max) {
          return { risky: true };
        }
      }
      if (sawStarSequence) {
        return combinable ? { risky: true, safeOutput: buildCharClassStar([...new Set(safeChars)]) } : { risky: true };
      }
      return { risky: false };
    };
    var parse = (input2, options) => {
      if (typeof input2 !== "string") {
        throw new TypeError("Expected a string");
      }
      input2 = REPLACEMENTS[input2] || input2;
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      let len = input2.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      const bos = { type: "bos", value: "", output: opts.prepend || "" };
      const tokens = [bos];
      const capture = opts.capture ? "" : "?:";
      const PLATFORM_CHARS = constants.globChars(opts.windows);
      const EXTGLOB_CHARS = constants.extglobChars(PLATFORM_CHARS);
      const {
        DOT_LITERAL,
        PLUS_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOT_SLASH,
        NO_DOTS_SLASH,
        QMARK,
        QMARK_NO_DOT,
        STAR,
        START_ANCHOR
      } = PLATFORM_CHARS;
      const globstar = (opts2) => {
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const nodot = opts.dot ? "" : NO_DOT;
      const qmarkNoDot = opts.dot ? QMARK : QMARK_NO_DOT;
      let star = opts.bash === true ? globstar(opts) : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      if (typeof opts.noext === "boolean") {
        opts.noextglob = opts.noext;
      }
      const state = {
        input: input2,
        index: -1,
        start: 0,
        dot: opts.dot === true,
        consumed: "",
        output: "",
        prefix: "",
        backtrack: false,
        negated: false,
        brackets: 0,
        braces: 0,
        parens: 0,
        quotes: 0,
        globstar: false,
        tokens
      };
      input2 = utils.removePrefix(input2, state);
      len = input2.length;
      const extglobs = [];
      const braces = [];
      const stack = [];
      let prev = bos;
      let value;
      const eos = () => state.index === len - 1;
      const peek = state.peek = (n = 1) => input2[state.index + n];
      const advance = state.advance = () => input2[++state.index] || "";
      const remaining = () => input2.slice(state.index + 1);
      const consume = (value2 = "", num = 0) => {
        state.consumed += value2;
        state.index += num;
      };
      const append = (token) => {
        state.output += token.output != null ? token.output : token.value;
        consume(token.value);
      };
      const negate = () => {
        let count = 1;
        while (peek() === "!" && (peek(2) !== "(" || peek(3) === "?")) {
          advance();
          state.start++;
          count++;
        }
        if (count % 2 === 0) {
          return false;
        }
        state.negated = true;
        state.start++;
        return true;
      };
      const increment = (type) => {
        state[type]++;
        stack.push(type);
      };
      const decrement = (type) => {
        state[type]--;
        stack.pop();
      };
      const push = (tok) => {
        if (prev.type === "globstar") {
          const isBrace = state.braces > 0 && (tok.type === "comma" || tok.type === "brace");
          const isExtglob = tok.extglob === true || extglobs.length && (tok.type === "pipe" || tok.type === "paren");
          if (tok.type !== "slash" && tok.type !== "paren" && !isBrace && !isExtglob) {
            state.output = state.output.slice(0, -prev.output.length);
            prev.type = "star";
            prev.value = "*";
            prev.output = star;
            state.output += prev.output;
          }
        }
        if (extglobs.length && tok.type !== "paren") {
          extglobs[extglobs.length - 1].inner += tok.value;
        }
        if (tok.value || tok.output) append(tok);
        if (prev && prev.type === "text" && tok.type === "text") {
          prev.output = (prev.output || prev.value) + tok.value;
          prev.value += tok.value;
          return;
        }
        tok.prev = prev;
        tokens.push(tok);
        prev = tok;
      };
      const extglobOpen = (type, value2) => {
        const token = { ...EXTGLOB_CHARS[value2], conditions: 1, inner: "" };
        token.prev = prev;
        token.parens = state.parens;
        token.output = state.output;
        token.startIndex = state.index;
        token.tokensIndex = tokens.length;
        const output2 = (opts.capture ? "(" : "") + token.open;
        increment("parens");
        push({ type, value: value2, output: state.output ? "" : ONE_CHAR });
        push({ type: "paren", extglob: true, value: advance(), output: output2 });
        extglobs.push(token);
      };
      const extglobClose = (token) => {
        const literal = input2.slice(token.startIndex, state.index + 1);
        const body = input2.slice(token.startIndex + 2, state.index);
        const analysis = analyzeRepeatedExtglob(body, opts);
        if ((token.type === "plus" || token.type === "star") && analysis.risky) {
          const safeOutput = analysis.safeOutput ? (token.output ? "" : ONE_CHAR) + (opts.capture ? `(${analysis.safeOutput})` : analysis.safeOutput) : void 0;
          const open = tokens[token.tokensIndex];
          open.type = "text";
          open.value = literal;
          open.output = safeOutput || utils.escapeRegex(literal);
          for (let i = token.tokensIndex + 1; i < tokens.length; i++) {
            tokens[i].value = "";
            tokens[i].output = "";
            delete tokens[i].suffix;
          }
          state.output = token.output + open.output;
          state.backtrack = true;
          push({ type: "paren", extglob: true, value, output: "" });
          decrement("parens");
          return;
        }
        let output2 = token.close + (opts.capture ? ")" : "");
        let rest;
        if (token.type === "negate") {
          let extglobStar = star;
          if (token.inner && token.inner.length > 1 && token.inner.includes("/")) {
            extglobStar = globstar(opts);
          }
          if (extglobStar !== star || eos() || /^\)+$/.test(remaining())) {
            output2 = token.close = `)$))${extglobStar}`;
          }
          if (token.inner.includes("*") && (rest = remaining()) && /^\.[^\\/.]+$/.test(rest)) {
            const expression = parse(rest, { ...options, fastpaths: false }).output;
            output2 = token.close = `)${expression})${extglobStar})`;
          }
          if (token.prev.type === "bos") {
            state.negatedExtglob = true;
          }
        }
        push({ type: "paren", extglob: true, value, output: output2 });
        decrement("parens");
      };
      if (opts.fastpaths !== false && !/(^[*!]|[/()[\]{}"])/.test(input2)) {
        let backslashes = false;
        let output2 = input2.replace(REGEX_SPECIAL_CHARS_BACKREF, (m, esc, chars, first, rest, index) => {
          if (first === "\\") {
            backslashes = true;
            return m;
          }
          if (first === "?") {
            if (esc) {
              return esc + first + (rest ? QMARK.repeat(rest.length) : "");
            }
            if (index === 0) {
              return qmarkNoDot + (rest ? QMARK.repeat(rest.length) : "");
            }
            return QMARK.repeat(chars.length);
          }
          if (first === ".") {
            return DOT_LITERAL.repeat(chars.length);
          }
          if (first === "*") {
            if (esc) {
              return esc + first + (rest ? star : "");
            }
            return star;
          }
          return esc ? m : `\\${m}`;
        });
        if (backslashes === true) {
          if (opts.unescape === true) {
            output2 = output2.replace(/\\/g, "");
          } else {
            output2 = output2.replace(/\\+/g, (m) => {
              return m.length % 2 === 0 ? "\\\\" : m ? "\\" : "";
            });
          }
        }
        if (output2 === input2 && opts.contains === true) {
          state.output = input2;
          return state;
        }
        state.output = utils.wrapOutput(output2, state, options);
        return state;
      }
      while (!eos()) {
        value = advance();
        if (value === "\0") {
          continue;
        }
        if (value === "\\") {
          const next = peek();
          if (next === "/" && opts.bash !== true) {
            continue;
          }
          if (next === "." || next === ";") {
            continue;
          }
          if (!next) {
            value += "\\";
            push({ type: "text", value });
            continue;
          }
          const match = /^\\+/.exec(remaining());
          let slashes = 0;
          if (match && match[0].length > 2) {
            slashes = match[0].length;
            state.index += slashes;
            if (slashes % 2 !== 0) {
              value += "\\";
            }
          }
          if (opts.unescape === true) {
            value = advance();
          } else {
            value += advance();
          }
          if (state.brackets === 0) {
            push({ type: "text", value });
            continue;
          }
        }
        if (state.brackets > 0 && (value !== "]" || prev.value === "[" || prev.value === "[^")) {
          if (opts.posix !== false && value === ":") {
            const inner = prev.value.slice(1);
            if (inner.includes("[")) {
              prev.posix = true;
              if (inner.includes(":")) {
                const idx = prev.value.lastIndexOf("[");
                const pre = prev.value.slice(0, idx);
                const rest2 = prev.value.slice(idx + 2);
                const posix = POSIX_REGEX_SOURCE[rest2];
                if (posix) {
                  prev.value = pre + posix;
                  state.backtrack = true;
                  advance();
                  if (!bos.output && tokens.indexOf(prev) === 1) {
                    bos.output = ONE_CHAR;
                  }
                  continue;
                }
              }
            }
          }
          if (value === "[" && peek() !== ":" || value === "-" && peek() === "]") {
            value = `\\${value}`;
          }
          if (value === "]" && (prev.value === "[" || prev.value === "[^")) {
            value = `\\${value}`;
          }
          if (opts.posix === true && value === "!" && prev.value === "[") {
            value = "^";
          }
          prev.value += value;
          append({ value });
          continue;
        }
        if (state.quotes === 1 && value !== '"') {
          value = utils.escapeRegex(value);
          prev.value += value;
          append({ value });
          continue;
        }
        if (value === '"') {
          state.quotes = state.quotes === 1 ? 0 : 1;
          if (opts.keepQuotes === true) {
            push({ type: "text", value });
          }
          continue;
        }
        if (value === "(") {
          increment("parens");
          push({ type: "paren", value });
          continue;
        }
        if (value === ")") {
          if (state.parens === 0 && opts.strictBrackets === true) {
            throw new SyntaxError(syntaxError("opening", "("));
          }
          const extglob = extglobs[extglobs.length - 1];
          if (extglob && state.parens === extglob.parens + 1) {
            extglobClose(extglobs.pop());
            continue;
          }
          push({ type: "paren", value, output: state.parens ? ")" : "\\)" });
          decrement("parens");
          continue;
        }
        if (value === "[") {
          if (opts.nobracket === true || !remaining().includes("]")) {
            if (opts.nobracket !== true && opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("closing", "]"));
            }
            value = `\\${value}`;
          } else {
            increment("brackets");
          }
          push({ type: "bracket", value });
          continue;
        }
        if (value === "]") {
          if (opts.nobracket === true || prev && prev.type === "bracket" && prev.value.length === 1) {
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          if (state.brackets === 0) {
            if (opts.strictBrackets === true) {
              throw new SyntaxError(syntaxError("opening", "["));
            }
            push({ type: "text", value, output: `\\${value}` });
            continue;
          }
          decrement("brackets");
          const prevValue = prev.value.slice(1);
          if (prev.posix !== true && prevValue[0] === "^" && !prevValue.includes("/")) {
            value = `/${value}`;
          }
          prev.value += value;
          append({ value });
          if (opts.literalBrackets === false || utils.hasRegexChars(prevValue)) {
            continue;
          }
          const escaped = utils.escapeRegex(prev.value);
          state.output = state.output.slice(0, -prev.value.length);
          if (opts.literalBrackets === true) {
            state.output += escaped;
            prev.value = escaped;
            continue;
          }
          prev.value = `(${capture}${escaped}|${prev.value})`;
          state.output += prev.value;
          continue;
        }
        if (value === "{" && opts.nobrace !== true) {
          increment("braces");
          const open = {
            type: "brace",
            value,
            output: "(",
            outputIndex: state.output.length,
            tokensIndex: state.tokens.length
          };
          braces.push(open);
          push(open);
          continue;
        }
        if (value === "}") {
          const brace = braces[braces.length - 1];
          if (opts.nobrace === true || !brace) {
            push({ type: "text", value, output: value });
            continue;
          }
          let output2 = ")";
          if (brace.dots === true) {
            const arr = tokens.slice();
            const range = [];
            for (let i = arr.length - 1; i >= 0; i--) {
              tokens.pop();
              if (arr[i].type === "brace") {
                break;
              }
              if (arr[i].type !== "dots") {
                range.unshift(arr[i].value);
              }
            }
            output2 = expandRange(range, opts);
            state.backtrack = true;
          }
          if (brace.comma !== true && brace.dots !== true) {
            const out = state.output.slice(0, brace.outputIndex);
            const toks = state.tokens.slice(brace.tokensIndex);
            brace.value = brace.output = "\\{";
            value = output2 = "\\}";
            state.output = out;
            for (const t of toks) {
              state.output += t.output || t.value;
            }
          }
          push({ type: "brace", value, output: output2 });
          decrement("braces");
          braces.pop();
          continue;
        }
        if (value === "|") {
          if (extglobs.length > 0) {
            extglobs[extglobs.length - 1].conditions++;
          }
          push({ type: "text", value });
          continue;
        }
        if (value === ",") {
          let output2 = value;
          const brace = braces[braces.length - 1];
          if (brace && stack[stack.length - 1] === "braces") {
            brace.comma = true;
            output2 = "|";
          }
          push({ type: "comma", value, output: output2 });
          continue;
        }
        if (value === "/") {
          if (prev.type === "dot" && state.index === state.start + 1) {
            state.start = state.index + 1;
            state.consumed = "";
            state.output = "";
            tokens.pop();
            prev = bos;
            continue;
          }
          push({ type: "slash", value, output: SLASH_LITERAL });
          continue;
        }
        if (value === ".") {
          if (state.braces > 0 && prev.type === "dot") {
            if (prev.value === ".") prev.output = DOT_LITERAL;
            const brace = braces[braces.length - 1];
            prev.type = "dots";
            prev.output += value;
            prev.value += value;
            brace.dots = true;
            continue;
          }
          if (state.braces + state.parens === 0 && prev.type !== "bos" && prev.type !== "slash") {
            push({ type: "text", value, output: DOT_LITERAL });
            continue;
          }
          push({ type: "dot", value, output: DOT_LITERAL });
          continue;
        }
        if (value === "?") {
          const isGroup = prev && prev.value === "(";
          if (!isGroup && opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("qmark", value);
            continue;
          }
          if (prev && prev.type === "paren") {
            const next = peek();
            let output2 = value;
            if (prev.value === "(" && !/[!=<:]/.test(next) || next === "<" && !/<([!=]|\w+>)/.test(remaining())) {
              output2 = `\\${value}`;
            }
            push({ type: "text", value, output: output2 });
            continue;
          }
          if (opts.dot !== true && (prev.type === "slash" || prev.type === "bos")) {
            push({ type: "qmark", value, output: QMARK_NO_DOT });
            continue;
          }
          push({ type: "qmark", value, output: QMARK });
          continue;
        }
        if (value === "!") {
          if (opts.noextglob !== true && peek() === "(") {
            if (peek(2) !== "?" || !/[!=<:]/.test(peek(3))) {
              extglobOpen("negate", value);
              continue;
            }
          }
          if (opts.nonegate !== true && state.index === 0) {
            negate();
            continue;
          }
        }
        if (value === "+") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            extglobOpen("plus", value);
            continue;
          }
          if (prev && prev.value === "(" || opts.regex === false) {
            push({ type: "plus", value, output: PLUS_LITERAL });
            continue;
          }
          if (prev && (prev.type === "bracket" || prev.type === "paren" || prev.type === "brace") || state.parens > 0) {
            push({ type: "plus", value });
            continue;
          }
          push({ type: "plus", value: PLUS_LITERAL });
          continue;
        }
        if (value === "@") {
          if (opts.noextglob !== true && peek() === "(" && peek(2) !== "?") {
            push({ type: "at", extglob: true, value, output: "" });
            continue;
          }
          push({ type: "text", value });
          continue;
        }
        if (value !== "*") {
          if (value === "$" || value === "^") {
            value = `\\${value}`;
          }
          const match = REGEX_NON_SPECIAL_CHARS.exec(remaining());
          if (match) {
            value += match[0];
            state.index += match[0].length;
          }
          push({ type: "text", value });
          continue;
        }
        if (prev && (prev.type === "globstar" || prev.star === true)) {
          prev.type = "star";
          prev.star = true;
          prev.value += value;
          prev.output = star;
          state.backtrack = true;
          state.globstar = true;
          consume(value);
          continue;
        }
        let rest = remaining();
        if (opts.noextglob !== true && /^\([^?]/.test(rest)) {
          extglobOpen("star", value);
          continue;
        }
        if (prev.type === "star") {
          if (opts.noglobstar === true) {
            consume(value);
            continue;
          }
          const prior = prev.prev;
          const before = prior.prev;
          const isStart = prior.type === "slash" || prior.type === "bos";
          const afterStar = before && (before.type === "star" || before.type === "globstar");
          if (opts.bash === true && (!isStart || rest[0] && rest[0] !== "/")) {
            push({ type: "star", value, output: "" });
            continue;
          }
          const isBrace = state.braces > 0 && (prior.type === "comma" || prior.type === "brace");
          const isExtglob = extglobs.length && (prior.type === "pipe" || prior.type === "paren");
          if (!isStart && prior.type !== "paren" && !isBrace && !isExtglob) {
            push({ type: "star", value, output: "" });
            continue;
          }
          while (rest.slice(0, 3) === "/**") {
            const after = input2[state.index + 4];
            if (after && after !== "/") {
              break;
            }
            rest = rest.slice(3);
            consume("/**", 3);
          }
          const isEnd = eos() || state.parens > 0 && rest === ")".repeat(state.parens) && !extglobs.some((extglob) => extglob.type === "negate");
          if (prior.type === "bos" && eos()) {
            prev.type = "globstar";
            prev.value += value;
            prev.output = globstar(opts);
            state.output = prev.output;
            state.globstar = true;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && !afterStar && isEnd) {
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = globstar(opts) + (opts.strictSlashes ? ")" : "|$)");
            prev.value += value;
            state.globstar = true;
            state.output += prior.output + prev.output;
            consume(value);
            continue;
          }
          if (prior.type === "slash" && prior.prev.type !== "bos" && rest[0] === "/") {
            const end = rest[1] !== void 0 ? "|$" : "";
            state.output = state.output.slice(0, -(prior.output + prev.output).length);
            prior.output = `(?:${prior.output}`;
            prev.type = "globstar";
            prev.output = `${globstar(opts)}${SLASH_LITERAL}|${SLASH_LITERAL}${end})`;
            prev.value += value;
            state.output += prior.output + prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          if (prior.type === "bos" && rest[0] === "/") {
            prev.type = "globstar";
            prev.value += value;
            prev.output = `(?:^|${SLASH_LITERAL}|${globstar(opts)}${SLASH_LITERAL})`;
            state.output = prev.output;
            state.globstar = true;
            consume(value + advance());
            push({ type: "slash", value: "/", output: "" });
            continue;
          }
          state.output = state.output.slice(0, -prev.output.length);
          prev.type = "globstar";
          prev.output = globstar(opts);
          prev.value += value;
          state.output += prev.output;
          state.globstar = true;
          consume(value);
          continue;
        }
        const token = { type: "star", value, output: star };
        if (opts.bash === true) {
          token.output = ".*?";
          if (prev.type === "bos" || prev.type === "slash") {
            token.output = nodot + token.output;
          }
          push(token);
          continue;
        }
        if (prev && (prev.type === "bracket" || prev.type === "paren") && opts.regex === true) {
          token.output = value;
          push(token);
          continue;
        }
        if (state.index === state.start || prev.type === "slash" || prev.type === "dot") {
          if (prev.type === "dot") {
            state.output += NO_DOT_SLASH;
            prev.output += NO_DOT_SLASH;
          } else if (opts.dot === true) {
            state.output += NO_DOTS_SLASH;
            prev.output += NO_DOTS_SLASH;
          } else {
            state.output += nodot;
            prev.output += nodot;
          }
          if (peek() !== "*") {
            state.output += ONE_CHAR;
            prev.output += ONE_CHAR;
          }
        }
        push(token);
      }
      while (state.brackets > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "]"));
        state.output = utils.escapeLast(state.output, "[");
        decrement("brackets");
      }
      while (state.parens > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", ")"));
        state.output = utils.escapeLast(state.output, "(");
        decrement("parens");
      }
      while (state.braces > 0) {
        if (opts.strictBrackets === true) throw new SyntaxError(syntaxError("closing", "}"));
        state.output = utils.escapeLast(state.output, "{");
        decrement("braces");
      }
      if (opts.strictSlashes !== true && (prev.type === "star" || prev.type === "bracket")) {
        push({ type: "maybe_slash", value: "", output: `${SLASH_LITERAL}?` });
      }
      if (state.backtrack === true) {
        state.output = "";
        for (const token of state.tokens) {
          state.output += token.output != null ? token.output : token.value;
          if (token.suffix) {
            state.output += token.suffix;
          }
        }
      }
      return state;
    };
    parse.fastpaths = (input2, options) => {
      const opts = { ...options };
      const max = typeof opts.maxLength === "number" ? Math.min(MAX_LENGTH, opts.maxLength) : MAX_LENGTH;
      const len = input2.length;
      if (len > max) {
        throw new SyntaxError(`Input length: ${len}, exceeds maximum allowed length: ${max}`);
      }
      input2 = REPLACEMENTS[input2] || input2;
      const {
        DOT_LITERAL,
        SLASH_LITERAL,
        ONE_CHAR,
        DOTS_SLASH,
        NO_DOT,
        NO_DOTS,
        NO_DOTS_SLASH,
        STAR,
        START_ANCHOR
      } = constants.globChars(opts.windows);
      const nodot = opts.dot ? NO_DOTS : NO_DOT;
      const slashDot = opts.dot ? NO_DOTS_SLASH : NO_DOT;
      const capture = opts.capture ? "" : "?:";
      const state = { negated: false, prefix: "" };
      let star = opts.bash === true ? ".*?" : STAR;
      if (opts.capture) {
        star = `(${star})`;
      }
      const globstar = (opts2) => {
        if (opts2.noglobstar === true) return star;
        return `(${capture}(?:(?!${START_ANCHOR}${opts2.dot ? DOTS_SLASH : DOT_LITERAL}).)*?)`;
      };
      const create = (str) => {
        switch (str) {
          case "*":
            return `${nodot}${ONE_CHAR}${star}`;
          case ".*":
            return `${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*.*":
            return `${nodot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "*/*":
            return `${nodot}${star}${SLASH_LITERAL}${ONE_CHAR}${slashDot}${star}`;
          case "**":
            return nodot + globstar(opts);
          case "**/*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${ONE_CHAR}${star}`;
          case "**/*.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${slashDot}${star}${DOT_LITERAL}${ONE_CHAR}${star}`;
          case "**/.*":
            return `(?:${nodot}${globstar(opts)}${SLASH_LITERAL})?${DOT_LITERAL}${ONE_CHAR}${star}`;
          default: {
            const match = /^(.*?)\.(\w+)$/.exec(str);
            if (!match) return;
            const source2 = create(match[1]);
            if (!source2) return;
            return source2 + DOT_LITERAL + match[2];
          }
        }
      };
      const output2 = utils.removePrefix(input2, state);
      let source = create(output2);
      if (source && opts.strictSlashes !== true) {
        source += `${SLASH_LITERAL}?`;
      }
      return source;
    };
    module2.exports = parse;
  }
});

// node_modules/picomatch/lib/picomatch.js
var require_picomatch = __commonJS({
  "node_modules/picomatch/lib/picomatch.js"(exports2, module2) {
    "use strict";
    var scan = require_scan();
    var parse = require_parse2();
    var utils = require_utils();
    var constants = require_constants();
    var isObject = (val) => val && typeof val === "object" && !Array.isArray(val);
    var picomatch2 = (glob, options, returnState = false) => {
      if (Array.isArray(glob)) {
        const fns = glob.map((input2) => picomatch2(input2, options, returnState));
        const arrayMatcher = (str) => {
          for (const isMatch of fns) {
            const state2 = isMatch(str);
            if (state2) return state2;
          }
          return false;
        };
        return arrayMatcher;
      }
      const isState = isObject(glob) && glob.tokens && glob.input;
      if (glob === "" || typeof glob !== "string" && !isState) {
        throw new TypeError("Expected pattern to be a non-empty string");
      }
      const opts = options || {};
      const posix = opts.windows;
      const regex = isState ? picomatch2.compileRe(glob, options) : picomatch2.makeRe(glob, options, false, true);
      const state = regex.state;
      delete regex.state;
      let isIgnored = () => false;
      if (opts.ignore) {
        const ignoreOpts = { ...options, ignore: null, onMatch: null, onResult: null };
        isIgnored = picomatch2(opts.ignore, ignoreOpts, returnState);
      }
      const matcher = (input2, returnObject = false) => {
        const { isMatch, match, output: output2 } = picomatch2.test(input2, regex, options, { glob, posix });
        const result = { glob, state, regex, posix, input: input2, output: output2, match, isMatch };
        if (typeof opts.onResult === "function") {
          opts.onResult(result);
        }
        if (isMatch === false) {
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (isIgnored(input2)) {
          if (typeof opts.onIgnore === "function") {
            opts.onIgnore(result);
          }
          result.isMatch = false;
          return returnObject ? result : false;
        }
        if (typeof opts.onMatch === "function") {
          opts.onMatch(result);
        }
        return returnObject ? result : true;
      };
      if (returnState) {
        matcher.state = state;
      }
      return matcher;
    };
    picomatch2.test = (input2, regex, options, { glob, posix } = {}) => {
      if (typeof input2 !== "string") {
        throw new TypeError("Expected input to be a string");
      }
      if (input2 === "") {
        return { isMatch: false, output: "" };
      }
      const opts = options || {};
      const format = opts.format || (posix ? utils.toPosixSlashes : null);
      let match = input2 === glob;
      let output2 = match && format ? format(input2) : input2;
      if (match === false) {
        output2 = format ? format(input2) : input2;
        match = output2 === glob;
      }
      if (match === false || opts.capture === true) {
        if (opts.matchBase === true || opts.basename === true) {
          match = picomatch2.matchBase(input2, regex, options, posix);
        } else {
          match = regex.exec(output2);
        }
      }
      return { isMatch: Boolean(match), match, output: output2 };
    };
    picomatch2.matchBase = (input2, glob, options, posix = options && options.windows) => {
      const regex = glob instanceof RegExp ? glob : picomatch2.makeRe(glob, options);
      return regex.test(utils.basename(input2, { windows: posix }));
    };
    picomatch2.isMatch = (str, patterns, options) => picomatch2(patterns, options)(str);
    picomatch2.parse = (pattern, options) => {
      if (Array.isArray(pattern)) return pattern.map((p) => picomatch2.parse(p, options));
      return parse(pattern, { ...options, fastpaths: false });
    };
    picomatch2.scan = (input2, options) => scan(input2, options);
    picomatch2.compileRe = (state, options, returnOutput = false, returnState = false) => {
      if (returnOutput === true) {
        return state.output;
      }
      const opts = options || {};
      const prepend = opts.contains ? "" : "^";
      const append = opts.contains ? "" : "$";
      let source = `${prepend}(?:${state.output})${append}`;
      if (state && state.negated === true) {
        source = `^(?!${source}).*$`;
      }
      const regex = picomatch2.toRegex(source, options);
      if (returnState === true) {
        regex.state = state;
      }
      return regex;
    };
    picomatch2.makeRe = (input2, options = {}, returnOutput = false, returnState = false) => {
      if (!input2 || typeof input2 !== "string") {
        throw new TypeError("Expected a non-empty string");
      }
      let parsed = { negated: false, fastpaths: true };
      if (options.fastpaths !== false && (input2[0] === "." || input2[0] === "*")) {
        parsed.output = parse.fastpaths(input2, options);
      }
      if (!parsed.output) {
        parsed = parse(input2, options);
      }
      return picomatch2.compileRe(parsed, options, returnOutput, returnState);
    };
    picomatch2.toRegex = (source, options) => {
      try {
        const opts = options || {};
        return new RegExp(source, opts.flags || (opts.nocase ? "i" : ""));
      } catch (err) {
        if (options && options.debug === true) throw err;
        return /$^/;
      }
    };
    picomatch2.constants = constants;
    module2.exports = picomatch2;
  }
});

// node_modules/picomatch/index.js
var require_picomatch2 = __commonJS({
  "node_modules/picomatch/index.js"(exports2, module2) {
    "use strict";
    var pico = require_picomatch();
    var utils = require_utils();
    function picomatch2(glob, options, returnState = false) {
      if (options && (options.windows === null || options.windows === void 0)) {
        options = { ...options, windows: utils.isWindows() };
      }
      return pico(glob, options, returnState);
    }
    Object.assign(picomatch2, pico);
    module2.exports = picomatch2;
  }
});

// src/index.js
import fs from "node:fs/promises";
import path2 from "node:path";

// src/config.js
import path from "node:path";
function input(name, fallback = "") {
  return process.env[`INPUT_${name.replaceAll(" ", "_").toUpperCase()}`]?.trim() || fallback;
}
function boolean(name, fallback) {
  const value = input(name, String(fallback));
  if (!["true", "false"].includes(value)) throw new Error(`${name} must be true or false`);
  return value === "true";
}
function integer(name, fallback, max) {
  const value = input(name, String(fallback));
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > max) {
    throw new Error(`${name} must be an integer between 1 and ${max}`);
  }
  return Number(value);
}
function ids(name) {
  const values = [...new Set(input(name).split(/[\s,]+/).filter(Boolean))];
  if (values.length > 100 || values.some((value) => !/^\d{17,20}$/.test(value))) {
    throw new Error(`${name} must contain at most 100 numeric Discord IDs`);
  }
  return values;
}
function httpUrl(value, label) {
  if (!value) return "";
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be an HTTP(S) URL`);
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error(`${label} must be an HTTP(S) URL without credentials`);
  }
  if (url.href.length > 512) throw new Error(`${label} must not exceed 512 characters`);
  return url.href;
}
function customLinks() {
  let links;
  try {
    links = JSON.parse(input("custom-links", "[]"));
  } catch {
    throw new Error("custom-links must be a JSON array");
  }
  if (!Array.isArray(links) || links.length > 2) throw new Error("custom-links must contain at most two links");
  return links.map((item) => {
    if (!item || typeof item.label !== "string" || !item.label.trim() || item.label.length > 80 || typeof item.url !== "string" || !item.url) {
      throw new Error("Each custom link needs a label (1\u201380 characters) and an HTTP(S) url");
    }
    return { label: item.label, url: httpUrl(item.url, "custom-links url") };
  });
}
function getConfig(workspace) {
  const packDirectory = input("pack-directory", ".");
  const absolute = path.resolve(workspace, packDirectory);
  const relative = path.relative(workspace, absolute);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error("pack-directory must be inside the repository");
  }
  const color = input("color", "5865F2").replace(/^#/, "");
  if (!/^[a-f\d]{6}$/i.test(color)) throw new Error("color must be a six-digit hex color");
  return {
    packDirectory: relative.split(path.sep).join("/"),
    webhookUrl: input("webhook-url"),
    changelogUrl: httpUrl(input("changelog-url"), "changelog-url"),
    avatarUrl: httpUrl(input("avatar-url"), "avatar-url"),
    imageUrl: httpUrl(input("image-url"), "image-url"),
    title: input("title"),
    description: input("description"),
    username: input("username").slice(0, 80),
    buttons: boolean("buttons", true),
    customLinks: customLinks(),
    color: parseInt(color, 16),
    roles: ids("mention-roles"),
    users: ids("mention-users"),
    everyone: boolean("mention-everyone", false),
    includeCommits: boolean("include-commits", true),
    includeFiles: boolean("include-files", true),
    includePackInfo: boolean("include-pack-info", true),
    excludePaths: input("exclude-paths").split(/\r?\n/).map((x) => x.trim()).filter(Boolean),
    maxCommits: integer("max-commits", 10, 50),
    maxItems: integer("max-items", 50, 200),
    maxMessages: integer("max-messages", 5, 10),
    dryRun: boolean("dry-run", false),
    failOnError: boolean("fail-on-error", true)
  };
}

// src/git.js
import { execFile } from "node:child_process";
import { promisify } from "node:util";
var exec = promisify(execFile);
var SHA = /^[a-f\d]{40}(?:[a-f\d]{24})?$/i;
var isZero = (sha) => /^0+$/.test(sha || "");
var Git = class {
  constructor(workspace) {
    this.workspace = workspace;
  }
  async run(...args) {
    const { stdout } = await exec("git", args, {
      cwd: this.workspace,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
    });
    return stdout;
  }
  async ensure(sha) {
    if (!SHA.test(sha)) throw new Error("Push event contains an invalid commit SHA");
    try {
      await this.run("cat-file", "-e", `${sha}^{commit}`);
    } catch {
      try {
        await this.run("fetch", "--no-tags", "--depth=1", "origin", sha);
      } catch {
        throw new Error(`Commit ${sha} is unavailable. Use actions/checkout with fetch-depth: 0. A force-pushed old commit may no longer be fetchable.`);
      }
    }
  }
  async file(sha, name) {
    return this.run("show", `${sha}:${name}`);
  }
  async files(sha) {
    return (await this.run("ls-tree", "-r", "--name-only", "-z", sha)).split("\0").filter(Boolean);
  }
  async changes(before, after) {
    if (!before) return (await this.files(after)).map((file) => ({ status: "A", file }));
    const tokens = (await this.run("diff", "--no-renames", "--name-status", "-z", before, after, "--")).split("\0");
    const changes = [];
    for (let i = 0; i < tokens.length - 1; i += 2) changes.push({ status: tokens[i], file: tokens[i + 1] });
    return changes;
  }
  async commits(before, after, limit) {
    const range = before ? `${before}..${after}` : after;
    const raw = await this.run("log", `--max-count=${limit}`, "--format=%H%x00%an%x00%s%x00", range, "--");
    const parts = raw.split("\0");
    const commits = [];
    for (let i = 0; i + 2 < parts.length; i += 3) {
      commits.push({ sha: parts[i].trim(), author: parts[i + 1], subject: parts[i + 2] });
    }
    return commits;
  }
};

// src/packwiz.js
var import_toml = __toESM(require_toml(), 1);
var import_picomatch = __toESM(require_picomatch2(), 1);
function parseToml(text, file) {
  try {
    return import_toml.default.parse(text);
  } catch {
    throw new Error(`Invalid TOML in ${file}`);
  }
}
function modFromToml(text, file) {
  const data = parseToml(text, file);
  const mr = data.update?.modrinth;
  const cf = data.update?.curseforge;
  const identity = mr?.["mod-id"] ? `modrinth:${mr["mod-id"]}` : cf?.["project-id"] ? `curseforge:${cf["project-id"]}` : `path:${file}`;
  const source = mr?.["mod-id"] ? `https://modrinth.com/mod/${encodeURIComponent(mr["mod-id"])}` : cf?.["project-id"] ? `https://www.curseforge.com/projects/${encodeURIComponent(cf["project-id"])}` : "";
  return {
    file,
    identity,
    source,
    name: String(data.name || file.split("/").at(-1).replace(/\.pw\.toml$/, "")),
    filename: String(data.filename || ""),
    version: String(mr?.version || cf?.["file-id"] || ""),
    side: String(data.side || "both"),
    optional: data.option?.optional === true,
    data
  };
}
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
async function analyze(git, before, after, config) {
  const prefix = config.packDirectory ? `${config.packDirectory}/` : "";
  const packPath = `${prefix}pack.toml`;
  let packText;
  try {
    packText = await git.file(after, packPath);
  } catch {
    throw new Error(`Cannot read ${packPath} at the pushed commit. Is this a packwiz repository?`);
  }
  const pack = parseToml(packText, packPath);
  const excluded = config.excludePaths.length ? (0, import_picomatch.default)(config.excludePaths, { dot: true }) : () => false;
  const changes = (await git.changes(before, after)).filter(({ file }) => file.startsWith(prefix) && !excluded(file));
  const oldMods = [];
  const newMods = [];
  const files = [];
  for (const change of changes) {
    if (!change.file.endsWith(".pw.toml")) {
      if (change.file !== `${prefix}${pack.index?.file || "index.toml"}`) files.push(change);
      continue;
    }
    if (before && change.status !== "A") oldMods.push(modFromToml(await git.file(before, change.file), change.file));
    if (change.status !== "D") newMods.push(modFromToml(await git.file(after, change.file), change.file));
  }
  const added = [], removed = [], updated = [];
  const used = /* @__PURE__ */ new Set();
  for (const old of oldMods) {
    let index = newMods.findIndex((mod2, i) => !used.has(i) && mod2.identity === old.identity && mod2.file === old.file);
    if (index < 0) index = newMods.findIndex((mod2, i) => !used.has(i) && mod2.identity === old.identity);
    if (index < 0) {
      removed.push(old);
      continue;
    }
    used.add(index);
    const mod = newMods[index];
    if (stable(mod.data) !== stable(old.data) || old.file !== mod.file) updated.push({ ...mod, previous: old });
  }
  newMods.forEach((mod, index) => {
    if (!used.has(index)) added.push(mod);
  });
  for (const list of [added, removed, updated]) list.sort((a, b) => a.name.localeCompare(b.name));
  return { pack, added, removed, updated, files };
}

// src/discord.js
function truncate(value, max) {
  const text = String(value);
  if (text.length <= max) return text;
  let end = max - 1;
  if (/[\uD800-\uDBFF]/.test(text[end - 1] || "")) end--;
  return `${text.slice(0, end)}\u2026`;
}
function escape(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/([`*_~|[\]()<>])/g, "\\$1").replace(/[\r\n]+/g, " ");
}
function link(label, url) {
  return `[${escape(label)}](${url.replace(/[()<>\s\\]/g, (char) => encodeURIComponent(char))})`;
}
function blob(context, sha, file) {
  return `${context.repoUrl}/blob/${sha}/${file.split("/").map(encodeURIComponent).join("/")}`;
}
function modLine(mod, context, removed = false) {
  const label = truncate(mod.name, 160);
  const url = mod.source || blob(context, removed ? context.before : context.after, mod.file);
  const badges = [
    mod.side !== "both" ? escape(mod.side) : "",
    mod.optional ? "optional" : ""
  ].filter(Boolean);
  let detail = "";
  if (mod.previous) {
    const old = mod.previous.filename || mod.previous.version;
    const current = mod.filename || mod.version;
    detail = old !== current ? ` \u2014 ${escape(truncate(old, 100))} \u2192 ${escape(truncate(current, 100))}` : " \u2014 metadata/configuration changed";
  }
  return `\u2022 ${link(label, url)}${badges.length ? ` (${badges.join(", ")})` : ""}${detail}`;
}
function section(title, lines, maxItems) {
  if (!lines.length) return [];
  const limited = lines.slice(0, maxItems);
  if (lines.length > maxItems) limited.push(`\u2026and ${lines.length - maxItems} more (see changelog).`);
  return [`**${title} (${lines.length})**`, ...limited, ""];
}
function buildMessages(report, commits, context, config) {
  const { pack, added, removed, updated, files } = report;
  const title = truncate(config.title || `${pack.name || "Packwiz"} \u2022 ${context.branch}`, 256);
  const navigation = [
    { label: "Commit", url: `${context.repoUrl}/commit/${context.after}` },
    { label: "Changelog", url: config.changelogUrl || context.compareUrl },
    { label: context.isTag ? "Tag" : "Branch", url: `${context.repoUrl}/tree/${encodeURIComponent(context.branch)}` },
    ...config.customLinks
  ];
  if (navigation.some((item) => item.url.length > 512)) throw new Error("A navigation URL exceeds Discord\u2019s 512-character button URL limit");
  const mentionText = [
    ...config.roles.map((id) => `<@&${id}>`),
    ...config.users.map((id) => `<@${id}>`),
    config.everyone ? "@everyone" : ""
  ].filter(Boolean).join(" ");
  if (mentionText.length > 2e3) throw new Error("Configured mentions exceed Discord\u2019s 2,000-character content limit");
  const heading = (index) => `## ${escape(index === 0 ? title : truncate(`${title} (continued)`, 256))}`;
  const pageLimit = Math.min(3500, 3800 - Math.max(heading(0).length, heading(1).length) - mentionText.length);
  const lines = [];
  if (config.description) lines.push(truncate(config.description, 1500), "");
  lines.push(`**${added.length} added \xB7 ${removed.length} removed \xB7 ${updated.length} updated**`);
  lines.push(`Pushed by ${link(context.actor, `${context.serverUrl}/${encodeURIComponent(context.actor)}`)}${context.forced ? " \u2022 **Force push**" : ""}${context.created ? " \u2022 New ref" : ""}`, "");
  if (config.includePackInfo) {
    const versions = Object.entries(pack.versions || {}).map(([key, value]) => `${escape(key)} ${escape(value)}`);
    const info = [pack.version ? `Pack ${escape(pack.version)}` : "", ...versions].filter(Boolean).join(" \u2022 ");
    if (info) lines.push(truncate(info, 1e3), "");
  }
  lines.push(...section("Added mods", added.map((mod) => modLine(mod, context)), config.maxItems));
  lines.push(...section("Removed mods", removed.map((mod) => modLine(mod, context, true)), config.maxItems));
  lines.push(...section("Updated mods", updated.map((mod) => modLine(mod, context)), config.maxItems));
  if (config.includeFiles) lines.push(...section("Other pack changes", files.map(({ file, status }) => `\u2022 ${status === "A" ? "Added" : status === "D" ? "Removed" : "Changed"} ${link(truncate(file, 200), blob(context, status === "D" ? context.before : context.after, file))}`), config.maxItems));
  if (config.includeCommits) {
    lines.push(...section("Commits", commits.slice(0, config.maxCommits).map((commit) => `\u2022 ${link(commit.sha.slice(0, 7), `${context.repoUrl}/commit/${commit.sha}`)} ${escape(truncate(commit.subject, 250))} \u2014 ${escape(truncate(commit.author, 80))}`), config.maxCommits));
    if (commits.length > config.maxCommits) lines.push("More commits are available in the changelog.", "");
  }
  if (!added.length && !removed.length && !updated.length && !files.length) {
    lines.push("No pack changes detected in the selected directory.");
  }
  const pages = [];
  let page = "";
  for (const raw of lines) {
    const line = truncate(raw, Math.min(1500, pageLimit - 1));
    if (page && page.length + line.length + 1 > pageLimit) {
      pages.push(page.trim());
      page = "";
    }
    page += `${line}
`;
  }
  if (page.trim()) pages.push(page.trim());
  const clipped = pages.length > config.maxMessages;
  const visible = pages.slice(0, config.maxMessages);
  if (clipped) visible[visible.length - 1] += "\n\n**Report truncated \u2014 view the changelog for all changes.**";
  return visible.map((description, index) => ({
    ...config.username ? { username: config.username } : {},
    ...config.avatarUrl ? { avatar_url: config.avatarUrl } : {},
    flags: 32768,
    allowed_mentions: index === 0 ? { parse: config.everyone ? ["everyone"] : [], roles: config.roles, users: config.users } : { parse: [], roles: [], users: [] },
    components: [{
      type: 17,
      accent_color: config.color,
      components: [
        ...config.imageUrl ? [{
          type: 12,
          items: [{ media: { url: config.imageUrl }, description: "Pack artwork" }]
        }] : [],
        { type: 10, content: `${heading(index)}${index === 0 && mentionText ? `
${mentionText}` : ""}` },
        { type: 10, content: description },
        { type: 14, divider: true, spacing: 1 },
        { type: 10, content: `-# Packwiz changelog \u2022 ${index + 1}/${visible.length}` },
        ...config.buttons ? [{
          type: 1,
          components: navigation.map((item) => ({ type: 2, style: 5, label: item.label, url: item.url }))
        }] : []
      ]
    }]
  }));
}
function validateWebhook(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("A valid Discord webhook-url is required");
  }
  if (url.protocol !== "https:" || !["discord.com", "canary.discord.com", "ptb.discord.com", "discordapp.com"].includes(url.hostname) || url.port || url.username || url.password || !/^\/api(?:\/v\d+)?\/webhooks\/\d+\/[\w-]+\/?$/.test(url.pathname)) {
    throw new Error("webhook-url must be an HTTPS Discord webhook URL");
  }
  url.searchParams.set("wait", "true");
  url.searchParams.set("with_components", "true");
  return url;
}
async function sendMessages(webhookUrl, messages, { fetcher = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  const url = validateWebhook(webhookUrl);
  for (const payload of messages) {
    for (let attempt = 0; attempt < 5; attempt++) {
      let response;
      try {
        response = await fetcher(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(2e4),
          redirect: "error"
        });
      } catch {
        throw new Error("Discord request failed or timed out; delivery is uncertain. Check Discord before rerunning.");
      }
      if (response.ok) {
        await response.text();
        break;
      }
      if ((response.status === 429 || response.status >= 500) && attempt < 4) {
        let body = {};
        try {
          body = await response.json();
        } catch {
        }
        const seconds = Number(body.retry_after ?? response.headers.get("retry-after") ?? 2 ** attempt);
        await sleep(Math.min(60, Math.max(1, Number.isFinite(seconds) ? seconds : 2 ** attempt)) * 1e3);
        continue;
      }
      throw new Error(`Discord rejected the notification (HTTP ${response.status}). Check webhook permissions and configuration.`);
    }
  }
}

// src/index.js
function commandEscape(text) {
  return String(text).replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A");
}
async function output(name, value) {
  if (process.env.GITHUB_OUTPUT) await fs.appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}
`);
}
async function main() {
  const secret = input("webhook-url");
  if (secret) console.log(`::add-mask::${commandEscape(secret)}`);
  const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
  const config = getConfig(workspace);
  if (process.env.GITHUB_EVENT_NAME !== "push") throw new Error("This action supports GitHub push events only");
  const event = JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
  if (event.deleted || isZero(event.after)) {
    console.log("Deleted ref: no pack snapshot to report.");
    for (const name of ["added", "removed", "updated", "messages"]) await output(name, 0);
    return;
  }
  const git = new Git(workspace);
  const before = isZero(event.before) ? null : event.before;
  await git.ensure(event.after);
  if (before) await git.ensure(before);
  const serverUrl = (process.env.GITHUB_SERVER_URL || "https://github.com").replace(/\/$/, "");
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository || !/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error("GITHUB_REPOSITORY is missing or invalid");
  const repoUrl = `${serverUrl}/${repository}`;
  const context = {
    serverUrl,
    repoUrl,
    before,
    after: event.after,
    compareUrl: before ? `${repoUrl}/compare/${before}..${event.after}` : `${repoUrl}/commit/${event.after}`,
    branch: (event.ref || "").replace(/^refs\/(?:heads|tags)\//, ""),
    isTag: (event.ref || "").startsWith("refs/tags/"),
    actor: event.sender?.login || process.env.GITHUB_ACTOR || "unknown",
    forced: Boolean(event.forced),
    created: Boolean(event.created),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  const report = await analyze(git, before, event.after, config);
  const commits = config.includeCommits ? await git.commits(before, event.after, config.maxCommits + 1) : [];
  const messages = buildMessages(report, commits, context, config);
  if (config.dryRun) {
    const preview = path2.join(workspace, "discord-preview.json");
    await fs.writeFile(preview, `${JSON.stringify(messages, null, 2)}
`, { mode: 384 });
    await output("preview-path", preview);
    console.log("Dry run: payloads written to discord-preview.json; no webhook called.");
  } else {
    await sendMessages(config.webhookUrl, messages);
  }
  for (const name of ["added", "removed", "updated"]) await output(name, report[name].length);
  await output("messages", messages.length);
  console.log(`Packwiz: ${report.added.length} added, ${report.removed.length} removed, ${report.updated.length} updated; ${messages.length} message(s).`);
}
main().catch((error) => {
  const fail = input("fail-on-error", "true") !== "false";
  const message = error.code || error.cmd ? "Git operation failed. Check checkout history, repository access, and pack-directory." : error.message;
  console.log(`::${fail ? "error" : "warning"}::${commandEscape(message)}`);
  if (fail) process.exitCode = 1;
});
