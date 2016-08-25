import videojs from 'video.js'
import koment from './videojs-koment'

/**
 * The video.js playlist plugin. Invokes the playlist-maker to create a
 * playlist function on the specific player.
 *
 * @param {Array} list
 */
const plugin = function (options) {
    koment(this, options)
}

videojs.plugin('koment', plugin)

export default plugin
