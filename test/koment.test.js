import window from 'global/window';
import QUnit from 'qunit';
import metricsMaker from '../src/js/videojs-koment';
import playerProxy from './player-proxy';

QUnit.module('koment', {

    beforeEach() {
        this.oldTimeout = window.setTimeout;
        window.setTimeout = Function.prototype;
    },

    afterEach() {
        window.setTimeout = this.oldTimeout;
    }
});

QUnit.test(
    'metricsMaker takes a player and returns a koment',
    function (assert) {
        let koment = metricsMaker(playerProxy(), {});

        assert.equal(typeof koment, 'object', 'koment is an object');
    }
);


QUnit.test(
    'triger koment',
    function (assert) {
        let xhr = this.sandbox.useFakeXMLHttpRequest();
        let requests = this.requests = [];

        let player = playerProxy();

        let koment = metricsMaker(player, {});

        player.currentSrc = function () {
            return 'http://vjs.zencdn.net/v/oceans.mp4';
        };

        player.trigger('loadstart');

        assert.equal(requests.length(), 0, 'new currentItem is 0');

        player.trigger('firstplay');

        assert.equal(requests.length(), 1, 'new currentItem is 1');
    }
);
