(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":3}],2:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],4:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":1,"trim":5}],5:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],6:[function(require,module,exports){
"use strict";
var window = require("global/window")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    if(typeof options.callback === "undefined"){
        throw new Error("callback argument missing")
    }

    var called = false
    var callback = function cbOnce(err, response, body){
        if(!called){
            called = true
            options.callback(err, response, body)
        }
    }

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else {
            body = xhr.responseText || getXml(xhr)
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        return callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        return callback(err, response, response.body)
    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function getXml(xhr) {
    if (xhr.responseType === "document") {
        return xhr.responseXML
    }
    var firefoxBugTakenEffect = xhr.status === 204 && xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror"
    if (xhr.responseType === "" && !firefoxBugTakenEffect) {
        return xhr.responseXML
    }

    return null
}

function noop() {}

},{"global/window":2,"is-function":3,"parse-headers":4,"xtend":7}],7:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],8:[function(require,module,exports){
(function (global){
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

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../../utils/dom":12,"../../../utils/to-title-case":13}],9:[function(require,module,exports){
(function (global){
/**
 * @file koment-new-button.js
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

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

var _videoJs2 = _interopRequireDefault(_videoJs);

var Button = _videoJs2['default'].getComponent('Button');
var Component = _videoJs2['default'].getComponent('Component');

/**
 * The button component for toggling and selecting koment
 * Chapters act much differently than other text tracks
 * Cues are navigation vs. other tracks of alternative languages
 *
 * @param {Object} player  Player object
 * @param {Object=} options Object of option names and values
 * @param {Function=} ready    Ready callback function
 * @extends TextTrackButton
 * @class KomentNewButton
 */

var KomentNewButton = (function (_Button) {
  _inherits(KomentNewButton, _Button);

  function KomentNewButton(player, options, ready) {
    _classCallCheck(this, KomentNewButton);

    _get(Object.getPrototypeOf(KomentNewButton.prototype), 'constructor', this).call(this, player, options, ready);
  }

  /**
   * Allow sub components to stack CSS class names
   *
   * @return {String} The constructed class name
   * @method buildCSSClass
   */

  _createClass(KomentNewButton, [{
    key: 'buildCSSClass',
    value: function buildCSSClass() {
      return 'vjs-koment-button vjs-koment-new-button ' + _get(Object.getPrototypeOf(KomentNewButton.prototype), 'buildCSSClass', this).call(this);
    }
  }]);

  return KomentNewButton;
})(Button);

KomentNewButton.prototype.controlText_ = 'Koment New';

Component.registerComponent('KomentNewButton', KomentNewButton);
exports['default'] = KomentNewButton;
module.exports = exports['default'];

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./videojs-koment":14}],11:[function(require,module,exports){
(function (global){
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

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"global/window":2}],12:[function(require,module,exports){
/**
 * Insert an element as the first child node of another
 *
 * @param  {Element} child   Element to insert
 * @param  {Element} parent Element to insert child into
 * @private
 * @function insertElFirst
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.insertElFirst = insertElFirst;

function insertElFirst(child, parent) {
    if (parent.firstChild) {
        parent.insertBefore(child, parent.firstChild);
    } else {
        parent.appendChild(child);
    }
}

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
(function (global){
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

var _videoJs = (typeof window !== "undefined" ? window['videojs'] : typeof global !== "undefined" ? global['videojs'] : null);

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
                addedTrack.addCue(new VTTCue(cue.timecode, cue.timecode + COMMENT_SHOW_TIME, '<c.koment>' + cue.text + '</c.koment>'));
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

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./component/control-bar/track-controls/koment-button":8,"./component/control-bar/track-controls/koment-new-button":9,"./tracks/koment-track-display":11,"xhr":6}]},{},[10]);
