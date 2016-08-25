import window from 'global/window';
import QUnit from 'qunit';
import komentMaker from '../src/js/videojs-koment';
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
    'komentMaker takes a player and returns a koment',
    function (assert) {
        let koment = komentMaker(playerProxy(), {});

        assert.equal(typeof koment, 'object', 'koment is an object');
    }
);


QUnit.test(
    'triger koment',
    function (assert) {
        let xhr = this.sandbox.useFakeXMLHttpRequest();
        let requests = this.requests = [];

        let player = playerProxy();

        let koment = komentMaker(player, {});

        player.currentSrc = function () {
            return 'http://vjs.zencdn.net/v/oceans.mp4';
        };

        player.trigger('loadstart');

        assert.equal(requests.length(), 0, 'new currentItem is 0');

        player.trigger('firstplay');

        assert.equal(requests.length(), 1, 'new currentItem is 1');
    }
);
