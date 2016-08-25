/**
 * ! videojs-koment - v1.0.0 - 2016-02-15
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license.
 * @file videojs-koment.js
 **/
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _componentControlBarTrackControlsKomentButton = require('./component/control-bar/track-controls/koment-button');

var _componentControlBarTrackControlsKomentButton2 = _interopRequireDefault(_componentControlBarTrackControlsKomentButton);

var Component = _videoJs2['default'].getComponent('Component');

var TRACK_ID = 'koment_track';
exports.TRACK_ID = TRACK_ID;
/**
 * Initialize the plugin.
 * @param options (optional) {object} configuration for the plugin
 */

var Koment = (function (_Component) {
    _inherits(Koment, _Component);

    function Koment(player, options) {
        var _this = this;

        _classCallCheck(this, Koment);

        _get(Object.getPrototypeOf(Koment.prototype), 'constructor', this).call(this, player, options);

        var defaults = {
            label: 'English',
            language: 'en'
        };

        this.text_track = _videoJs2['default'].mergeOptions(defaults, options, {
            'default': true,
            kind: 'metadata',
            id: TRACK_ID,
            cues: []
        });

        var data = {
            json: true,
            uri: this.options_.url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        (0, _xhr2['default'])(data, function (err, res) {
            if (err) {
                throw new Error(err.message);
            }

            var addedTrack = player.addRemoteTextTrack(_this.text_track).track;

            var listCues = res.body || [];
            var i = 0;
            listCues.forEach(function (cue) {
                cue.timecode = i++;
                addedTrack.addCue(new window.VTTCue(cue.timecode, cue.timecode + 1, cue.text));
            });
        });
    }

    return Koment;
})(Component);

Koment.prototype.options_ = {
    url: 'https://afr-api-v1-staging.herokuapp.com/api/videos/c1ee3b32-0bf8-4873-b173-09dc055b7bfe/comments'
};

// register the plugin
_videoJs2['default'].options.children.push('koment');

Component.registerComponent('Koment', Koment);

exports['default'] = Koment;