/**
 * @file to-title-case.js
 *
 * Uppercase the first letter of a string
 *
 * @param  {String} string String to be uppercased
 * @return {String}
 * @private
 * @method toTitleCase
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function toTitleCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

exports["default"] = toTitleCase;
module.exports = exports["default"];