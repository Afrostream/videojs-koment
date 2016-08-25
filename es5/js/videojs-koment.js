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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var _componentControlBarTrackControlsKomentNewButton = require('./component/control-bar/track-controls/koment-new-button');

var _componentControlBarTrackControlsKomentNewButton2 = _interopRequireDefault(_componentControlBarTrackControlsKomentNewButton);

var _tracksKomentTrackDisplay = require('./tracks/koment-track-display');

var _tracksKomentTrackDisplay2 = _interopRequireDefault(_tracksKomentTrackDisplay);

var Component = _videoJs2['default'].getComponent('Component');

var TRACK_ID = 'koment_track';
exports.TRACK_ID = TRACK_ID;
var COMMENT_SHOW_TIME = 5;
exports.COMMENT_SHOW_TIME = COMMENT_SHOW_TIME;
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
            label: 'Koment',
            language: 'fr'
        };

        this.text_track = _videoJs2['default'].mergeOptions(defaults, options, {
            'default': true,
            kind: this.kind_,
            id: TRACK_ID,
            cues: [],
            mode: 'showing'
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
            //const addedTrack = player.addRemoteTextTrack(this.text_track).track
            var addedTrack = player.addTextTrack(_this.text_track.kind, _this.text_track.label, _this.text_track.language);
            addedTrack['default'] = true;

            var listCues = res.body || [];
            listCues.forEach(function (cue) {
                addedTrack.addCue(new VTTCue(cue.timecode, cue.timecode + COMMENT_SHOW_TIME, cue.text));
            });
        });
    }

    /**
     * Create the component's DOM element
     *
     * @return {Element}
     * @method createEl
     */

    _createClass(Koment, [{
        key: 'createEl',
        value: function createEl() {
            return _get(Object.getPrototypeOf(Koment.prototype), 'createEl', this).call(this, 'div', {
                className: 'vjs-koment-bar',
                dir: 'ltr'
            }, {
                // The control bar is a group, so it can contain menuitems
                role: 'group'
            });
        }
    }]);

    return Koment;
})(Component);

Koment.prototype.kind_ = 'metadata';
Koment.prototype.options_ = {
    url: 'https://afr-api-v1-staging.herokuapp.com/api/videos/c1ee3b32-0bf8-4873-b173-09dc055b7bfe/comments',
    children: {
        'komentButton': {}
    }
};

// register the plugin
//'komentNewButton': {}
_videoJs2['default'].options.children = _videoJs2['default'].options.children.concat(['koment', 'komentTrackDisplay']);

Component.registerComponent('Koment', Koment);

exports['default'] = Koment;