/**
 * @file koment-track-display.js
 */
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

var _globalWindow = require('global/window');

var _globalWindow2 = _interopRequireDefault(_globalWindow);

var Component = _videoJs2['default'].getComponent('Component');

var darkGray = '#222';
var lightGray = '#ccc';
var fontMap = {
    monospace: 'monospace',
    sansSerif: 'sans-serif',
    serif: 'serif',
    monospaceSansSerif: '"Andale Mono", "Lucida Console", monospace',
    monospaceSerif: '"Courier New", monospace',
    proportionalSansSerif: 'sans-serif',
    proportionalSerif: 'serif',
    casual: '"Comic Sans MS", Impact, fantasy',
    script: '"Monotype Corsiva", cursive',
    smallcaps: '"Andale Mono", "Lucida Console", monospace, sans-serif'
};

/**
 * Add cue HTML to display
 *
 * @param {Number} color Hex number for color, like #f0e
 * @param {Number} opacity Value for opacity,0.0 - 1.0
 * @return {RGBAColor} In the form 'rgba(255, 0, 0, 0.3)'
 * @method constructColor
 */
function constructColor(color, opacity) {
    return 'rgba(' +
    // color looks like "#f0e"
    parseInt(color[1] + color[1], 16) + ',' + parseInt(color[2] + color[2], 16) + ',' + parseInt(color[3] + color[3], 16) + ',' + opacity + ')';
}

/**
 * Try to update style
 * Some style changes will throw an error, particularly in IE8. Those should be noops.
 *
 * @param {Element} el The element to be styles
 * @param {CSSProperty} style The CSS property to be styled
 * @param {CSSStyle} rule The actual style to be applied to the property
 * @method tryUpdateStyle
 */
function tryUpdateStyle(el, style, rule) {
    try {
        el.style[style] = rule;
    } catch (e) {

        // Satisfies linter.
        return;
    }
}

/**
 * The component for displaying text track cues
 *
 * @param {Object} player  Main Player
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready    Ready callback function
 * @extends Component
 * @class KomentTrackDisplay
 */

var KomentTrackDisplay = (function (_Component) {
    _inherits(KomentTrackDisplay, _Component);

    function KomentTrackDisplay(player, options, ready) {
        var _this = this;

        _classCallCheck(this, KomentTrackDisplay);

        _get(Object.getPrototypeOf(KomentTrackDisplay.prototype), 'constructor', this).call(this, player, options, ready);

        player.on('loadstart', _videoJs2['default'].bind(this, this.toggleDisplay));
        player.on('texttrackchange', _videoJs2['default'].bind(this, this.updateDisplay));

        var tracks = player.textTracks();

        if (tracks) {
            (function () {
                var changeHandler = _videoJs2['default'].bind(_this, _this.handleTracksChange);

                tracks.addEventListener('change', changeHandler);

                _this.on('dispose', function () {
                    tracks.removeEventListener('change', changeHandler);
                });
            })();
        }

        player.ready(_videoJs2['default'].bind(this, function () {

            player.on('fullscreenchange', _videoJs2['default'].bind(this, this.updateDisplay));

            var trackList = this.player_.textTracks();
            var firstKoment = undefined;

            if (trackList) {
                for (var i = 0; i < trackList.length; i++) {
                    var track = trackList[i];

                    if (track['default']) {
                        if (track.kind === this.kind_ && !firstKoment) {
                            firstKoment = track;
                        }
                    }
                }
                // We want to show the first default track but captions and subtitles
                // take precedence over descriptions.
                // So, display the first default captions or subtitles track
                // and otherwise the first default descriptions track.
                if (firstKoment) {
                    firstKoment.mode = 'showing';
                }
            }
        }));
    }

    /**
     * Toggle display texttracks
     *
     * @method toggleDisplay
     */

    _createClass(KomentTrackDisplay, [{
        key: 'toggleDisplay',
        value: function toggleDisplay() {
            this.show();
        }

        /**
         * Create the component's DOM element
         *
         * @return {Element}
         * @method createEl
         */
    }, {
        key: 'createEl',
        value: function createEl() {
            return _get(Object.getPrototypeOf(KomentTrackDisplay.prototype), 'createEl', this).call(this, 'div', {
                className: 'vjs-koment-track-display'
            }, {
                'aria-live': 'assertive',
                'aria-atomic': 'true'
            });
        }

        /**
         * Clear display texttracks
         *
         * @method clearDisplay
         */
    }, {
        key: 'clearDisplay',
        value: function clearDisplay() {}

        /**
         * Handle text track change
         *
         * @method handleTracksChange
         */
    }, {
        key: 'handleTracksChange',
        value: function handleTracksChange() {
            var tracks = this.player().textTracks();
            var disabled = true;

            // Check whether a track of a different kind is showing
            for (var i = 0, l = tracks.length; i < l; i++) {
                var track = tracks[i];

                if (track.kind === this.kind_ && track.mode === 'showing') {
                    disabled = false;
                    break;
                }
            }

            // If another track is showing, disable this menu button
            if (disabled) {
                this.hide();
            } else {
                this.show();
            }

            this.updateDisplay();
        }

        /**
         * Update display texttracks
         *
         * @method updateDisplay
         */
    }, {
        key: 'updateDisplay',
        value: function updateDisplay() {
            var tracks = this.player_.textTracks();

            this.clearDisplay();

            if (!tracks) {
                return;
            }

            // Track display prioritization model: if multiple tracks are 'showing',
            //  display the first 'subtitles' or 'captions' track which is 'showing',
            //  otherwise display the first 'descriptions' track which is 'showing'

            var komentTrack = null;

            var i = tracks.length;

            var changeHandler = _videoJs2['default'].bind(this, this.handleTracksChange);

            while (i--) {
                var track = tracks[i];

                track.removeEventListener('cuechange', changeHandler);
                if (track.mode === 'showing') {
                    if (track.kind === this.kind_) {
                        track.addEventListener('cuechange', changeHandler);
                        komentTrack = track;
                    }
                }
            }

            if (komentTrack) {
                this.updateForTrack(komentTrack);
            }
        }

        /**
         * Add texttrack to texttrack list
         *
         * @param {TextTrackObject} track Texttrack object to be added to list
         * @method updateForTrack
         */
    }, {
        key: 'updateForTrack',
        value: function updateForTrack(track) {

            if (typeof _globalWindow2['default'].WebVTT !== 'function' || !track.activeCues) {
                return;
            }

            var overrides = this.player_.textTrackSettings.getValues();
            var cues = [];

            for (var _i = 0; _i < track.activeCues.length; _i++) {
                cues.push(track.activeCues[_i]);
            }

            _globalWindow2['default'].WebVTT.processCues(_globalWindow2['default'], cues, this.el_);

            var i = cues.length;
            while (i--) {
                var cue = cues[i];

                if (!cue) {
                    continue;
                }

                var cueDiv = cue.displayState;
                if (overrides.color) {
                    cueDiv.firstChild.style.color = overrides.color;
                }
                if (overrides.textOpacity) {
                    tryUpdateStyle(cueDiv.firstChild, 'color', constructColor(overrides.color || '#fff', overrides.textOpacity));
                }
                if (overrides.backgroundColor) {
                    cueDiv.firstChild.style.backgroundColor = overrides.backgroundColor;
                }
                if (overrides.backgroundOpacity) {
                    tryUpdateStyle(cueDiv.firstChild, 'backgroundColor', constructColor(overrides.backgroundColor || '#000', overrides.backgroundOpacity));
                }
                if (overrides.windowColor) {
                    if (overrides.windowOpacity) {
                        tryUpdateStyle(cueDiv, 'backgroundColor', constructColor(overrides.windowColor, overrides.windowOpacity));
                    } else {
                        cueDiv.style.backgroundColor = overrides.windowColor;
                    }
                }
                if (overrides.edgeStyle) {
                    if (overrides.edgeStyle === 'dropshadow') {
                        cueDiv.firstChild.style.textShadow = '2px 2px 3px ' + darkGray + ', 2px 2px 4px ' + darkGray + ', 2px 2px 5px ' + darkGray;
                    } else if (overrides.edgeStyle === 'raised') {
                        cueDiv.firstChild.style.textShadow = '1px 1px ' + darkGray + ', 2px 2px ' + darkGray + ', 3px 3px ' + darkGray;
                    } else if (overrides.edgeStyle === 'depressed') {
                        cueDiv.firstChild.style.textShadow = '1px 1px ' + lightGray + ', 0 1px ' + lightGray + ', -1px -1px ' + darkGray + ', 0 -1px ' + darkGray;
                    } else if (overrides.edgeStyle === 'uniform') {
                        cueDiv.firstChild.style.textShadow = '0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray + ', 0 0 4px ' + darkGray;
                    }
                }
                if (overrides.fontPercent && overrides.fontPercent !== 1) {
                    var fontSize = _globalWindow2['default'].parseFloat(cueDiv.style.fontSize);

                    cueDiv.style.fontSize = fontSize * overrides.fontPercent + 'px';
                    cueDiv.style.height = 'auto';
                    cueDiv.style.top = 'auto';
                    cueDiv.style.bottom = '2px';
                }
                if (overrides.fontFamily && overrides.fontFamily !== 'default') {
                    if (overrides.fontFamily === 'small-caps') {
                        cueDiv.firstChild.style.fontVariant = 'small-caps';
                    } else {
                        cueDiv.firstChild.style.fontFamily = fontMap[overrides.fontFamily];
                    }
                }
            }
        }
    }]);

    return KomentTrackDisplay;
})(Component);

KomentTrackDisplay.prototype.kind_ = 'metadata';

Component.registerComponent('KomentTrackDisplay', KomentTrackDisplay);
exports['default'] = KomentTrackDisplay;
module.exports = exports['default'];