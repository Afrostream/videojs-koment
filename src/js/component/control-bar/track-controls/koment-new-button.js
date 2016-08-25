/**
 * @file koment-new-button.js
 */
import videojs from 'video.js'
const Button = videojs.getComponent('Button')
const Component = videojs.getComponent('Component')

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
class KomentNewButton extends Button {

    constructor (player, options, ready) {
        super(player, options, ready)
    }

    /**
     * Allow sub components to stack CSS class names
     *
     * @return {String} The constructed class name
     * @method buildCSSClass
     */
    buildCSSClass () {
        return `vjs-koment-button vjs-koment-new-button ${super.buildCSSClass()}`
    }
}

KomentNewButton.prototype.controlText_ = 'Koment New'

Component.registerComponent('KomentNewButton', KomentNewButton)
export default KomentNewButton