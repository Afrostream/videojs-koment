'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _videojsKoment = require('./videojs-koment');

var _videojsKoment2 = _interopRequireDefault(_videojsKoment);

/**
 * The video.js playlist plugin. Invokes the playlist-maker to create a
 * playlist function on the specific player.
 *
 * @param {Array} list
 */
var plugin = function plugin(options) {
  (0, _videojsKoment2['default'])(this, options);
};

_videoJs2['default'].plugin('koment', plugin);

exports['default'] = plugin;
module.exports = exports['default'];