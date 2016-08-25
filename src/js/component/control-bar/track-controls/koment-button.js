/**
 * @file koment-button.js
 */
import videojs from 'video.js'
import toTitleCase from '../../../utils/to-title-case'
import * as Dom from '../../../utils/dom'


const ControlBar = videojs.getComponent('ControlBar')
const TextTrackButton = videojs.getComponent('TextTrackButton')
const Component = videojs.getComponent('Component')
const TextTrackMenuItem = videojs.getComponent('TextTrackMenuItem')
const ChaptersTrackMenuItem = videojs.getComponent('ChaptersTrackMenuItem')
const Menu = videojs.getComponent('Menu')

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
class KomentButton extends TextTrackButton {

    constructor (player, options, ready) {
        super(player, options, ready)
        this.el_.setAttribute('aria-label', 'Koment Menu')
    }

    /**
     * Allow sub components to stack CSS class names
     *
     * @return {String} The constructed class name
     * @method buildCSSClass
     */
    buildCSSClass () {
        return `vjs-koment-button ${super.buildCSSClass()}`
    }

    /**
     * Create a menu item for each text track
     *
     * @return {Array} Array of menu items
     * @method createItems
     */
    createItems () {
        const items = []
        const tracks = this.player_.textTracks()

        if (!tracks) {
            return items
        }

        for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i]

            if (track.kind === this.kind_) {
                items.push(new TextTrackMenuItem(this.player_, {track}))
            }
        }

        return items
    }

    /**
     * Create menu from chapter buttons
     *
     * @return {Menu} Menu of chapter buttons
     * @method createMenu
     */
    createMenu () {
        const tracks = this.player_.textTracks() || []
        let komentTrack
        let items = this.items || []

        for (let i = tracks.length - 1; i >= 0; i--) {

            // We will always choose the last track as our komentTrack
            const track = tracks[i]

            if (track.kind === this.kind_) {
                komentTrack = track

                break
            }
        }

        let menu = this.menu

        if (menu === undefined) {
            menu = new Menu(this.player_)

            const title = videojs.createEl('li', {
                className: 'vjs-menu-title',
                innerHTML: toTitleCase(this.kind_),
                tabIndex: -1
            })
            menu.children_.unshift(title)
            Dom.insertElFirst(title, menu.contentEl())
        } else {
            // We will empty out the menu children each time because we want a
            // fresh new menu child list each time
            items.forEach(item => menu.removeChild(item))
            // Empty out the KomentButton menu items because we no longer need them
            items = []
        }

        if (komentTrack && (komentTrack.cues === null || komentTrack.cues === undefined)) {
            komentTrack.mode = 'hidden'

            const remoteTextTrackEl = this.player_.remoteTextTrackEls().getTrackElementByTrack_(komentTrack)

            if (remoteTextTrackEl) {
                remoteTextTrackEl.addEventListener('load', (event) => this.update())
            }
        }

        if (komentTrack && komentTrack.cues && komentTrack.cues.length > 0) {
            const cues = komentTrack.cues

            for (let i = 0, l = cues.length; i < l; i++) {
                const cue = cues[i]
                const mi = new ChaptersTrackMenuItem(this.player_, {
                    cue,
                    track: komentTrack
                })

                items.push(mi)

                menu.addChild(mi)
            }
        }

        if (items.length > 0) {
            this.show()
        }
        // Assigning the value of items back to this.items for next iteration
        this.items = items
        return menu
    }
}

KomentButton.prototype.kind_ = 'metadata'
KomentButton.prototype.controlText_ = 'Koment'

ControlBar.prototype.options_.children.push('komentButton')

Component.registerComponent('KomentButton', KomentButton)
export default KomentButton