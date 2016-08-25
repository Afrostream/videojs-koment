/**
 * @file koment-button.js
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _videoJs = require('video.js');

var _videoJs2 = _interopRequireDefault(_videoJs);

var _utilsToTitleCase = require('../../../utils/to-title-case');

var _utilsToTitleCase2 = _interopRequireDefault(_utilsToTitleCase);

var _utilsDom = require('../../../utils/dom');

var Dom = _interopRequireWildcard(_utilsDom);

var TextTrackButton = _videoJs2['default'].getComponent('TextTrackButton');
var Component = _videoJs2['default'].getComponent('Component');
var TextTrackMenuItem = _videoJs2['default'].getComponent('TextTrackMenuItem');
var ChaptersTrackMenuItem = _videoJs2['default'].getComponent('ChaptersTrackMenuItem');
var Menu = _videoJs2['default'].getComponent('Menu');

/**
 * The button component for toggling and selecting koment
 * Chapters act much differently than other text tracks
 * Cues are navigation vs. other tracks of alternative languages
 *
 * @param {Object} player  Player object
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready    Ready callback function
 * @extends TextTrackButton
 * @class KomentButton
 */

var KomentButton = (function (_TextTrackButton) {
    _inherits(KomentButton, _TextTrackButton);

    function KomentButton(player, options, ready) {
        _classCallCheck(this, KomentButton);

        _get(Object.getPrototypeOf(KomentButton.prototype), 'constructor', this).call(this, player, options, ready);
        this.el_.setAttribute('aria-label', 'Koment Menu');
    }

    /**
     * Allow sub components to stack CSS class names
     *
     * @return {String} The constructed class name
     * @method buildCSSClass
     */

    _createClass(KomentButton, [{
        key: 'buildCSSClass',
        value: function buildCSSClass() {
            return 'vjs-koment-button ' + _get(Object.getPrototypeOf(KomentButton.prototype), 'buildCSSClass', this).call(this);
        }

        /**
         * Create a menu item for each text track
         *
         * @return {Array} Array of menu items
         * @method createItems
         */
    }, {
        key: 'createItems',
        value: function createItems() {
            var items = [];
            var tracks = this.player_.textTracks();

            if (!tracks) {
                return items;
            }

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];

                if (track.kind === this.kind_) {
                    items.push(new TextTrackMenuItem(this.player_, { track: track }));
                }
            }

            return items;
        }

        /**
         * Handle click on text track
         *
         * @method handleClick
         */
    }, {
        key: 'handleClick',
        value: function handleClick(event) {
            var tracks = this.player_.textTracks();
            _get(Object.getPrototypeOf(KomentButton.prototype), 'handleClick', this).call(this, event);

            if (!tracks) {
                return;
            }

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];

                if (track.kind !== this.kind_) {
                    continue;
                }
                track.mode = this.buttonPressed_ ? 'showing' : 'hidden';
            }
        }

        /**
         * Create menu from chapter buttons
         *
         * @return {Menu} Menu of chapter buttons
         * @method createMenu
         */
    }, {
        key: 'createMenu',
        value: function createMenu() {
            var _this = this;

            var tracks = this.player_.textTracks() || [];
            var komentTrack = undefined;
            var items = this.items || [];

            for (var i = tracks.length - 1; i >= 0; i--) {

                // We will always choose the last track as our komentTrack
                var track = tracks[i];

                if (track.kind === this.kind_) {
                    komentTrack = track;

                    break;
                }
            }

            var menu = this.menu;

            if (menu === undefined) {
                menu = new Menu(this.player_);

                var title = _videoJs2['default'].createEl('li', {
                    className: 'vjs-menu-title',
                    innerHTML: (0, _utilsToTitleCase2['default'])(this.controlText_),
                    tabIndex: -1
                });
                menu.children_.unshift(title);
                Dom.insertElFirst(title, menu.contentEl());
            } else {
                // We will empty out the menu children each time because we want a
                // fresh new menu child list each time
                items.forEach(function (item) {
                    return menu.removeChild(item);
                });
                // Empty out the KomentButton menu items because we no longer need them
                items = [];
            }

            if (komentTrack && (komentTrack.cues === null || komentTrack.cues === undefined)) {
                komentTrack.mode = 'hidden';

                var remoteTextTrackEl = this.player_.remoteTextTrackEls().getTrackElementByTrack_(komentTrack);

                if (remoteTextTrackEl) {
                    remoteTextTrackEl.addEventListener('load', function (event) {
                        return _this.update();
                    });
                }
            }

            if (komentTrack && komentTrack.cues && komentTrack.cues.length > 0) {
                var cues = komentTrack.cues;

                for (var i = 0, l = cues.length; i < l; i++) {
                    var cue = cues[i];
                    var mi = new ChaptersTrackMenuItem(this.player_, {
                        cue: cue,
                        track: komentTrack
                    });

                    items.push(mi);

                    //menu.addChild(mi)
                }
            }

            if (items.length > 0) {
                this.show();
            }
            // Assigning the value of items back to this.items for next iteration
            this.items = items;
            return menu;
        }
    }]);

    return KomentButton;
})(TextTrackButton);

KomentButton.prototype.kind_ = 'metadata';
KomentButton.prototype.controlText_ = 'Koment';

Component.registerComponent('KomentButton', KomentButton);
exports['default'] = KomentButton;
module.exports = exports['default'];