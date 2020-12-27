"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _parser = require("@babel/parser");

var _utils = require("@kmart/utils");

var _babelPluginMacros = require("babel-plugin-macros");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var convertPalette = function convertPalette(nodes) {
  return nodes.reduce(function (prev, _ref) {
    var key = _ref.key,
        value = _ref.value;
    var name = key.type === 'Identifier' ? (0, _utils.toCssVar)(key.name) : '';
    var result;

    if (value.type === 'ArrayExpression') {
      var elements = value.elements;

      var _elements$map = elements.map(function (item) {
        return item.value;
      }),
          _elements$map2 = _slicedToArray(_elements$map, 2),
          alias = _elements$map2[0],
          opacity = _elements$map2[1];

      result = "rgba(var(--".concat(alias, "), ").concat(opacity, ")");
    } else if (value.type === 'StringLiteral') {
      var _alias = value.value;
      result = "rgb(var(--".concat(_alias, "))");
    }

    if (!!name && !!result) {
      return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, name, result));
    } else {
      return prev;
    }
  }, {});
};

var filterProperties = function filterProperties(props) {
  return props.filter(function (item) {
    return item.type === 'ObjectProperty';
  });
};

var objectToAst = function objectToAst(obj) {
  var result = (0, _parser.parse)("const temp = ".concat(JSON.stringify(obj)));

  if (result) {
    var body = result.program.body[0];

    if (body.type === 'VariableDeclaration') {
      return body.declarations[0].init;
    }
  }
};

var createPalette = function createPalette(_ref2) {
  var references = _ref2.references;
  references["default"].forEach(function (referencePath) {
    var args = referencePath.parentPath.get('arguments');

    if (Array.isArray(args)) {
      var _args = _slicedToArray(args, 1),
          firstArgumentPath = _args[0];

      if (firstArgumentPath.node.type === 'ObjectExpression') {
        var properties = filterProperties(firstArgumentPath.node.properties);
        var palette = convertPalette(properties);
        var paletteInAst = objectToAst(palette);

        if (paletteInAst) {
          firstArgumentPath.parentPath.replaceWith(paletteInAst);
        }
      }
    }
  });
};

var _default = (0, _babelPluginMacros.createMacro)(createPalette);

exports["default"] = _default;
