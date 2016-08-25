import videojs from 'video.js'
import comments from './videojs-comments'

/**
 * The video.js playlist plugin. Invokes the playlist-maker to create a
 * playlist function on the specific player.
 *
 * @param {Array} list
 */
const plugin = function (options) {
    comments(this, options)
}

videojs.plugin('comments', plugin)

export default plugin
