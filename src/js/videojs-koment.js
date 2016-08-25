/**
 * ! videojs-koment - v1.0.0 - 2016-02-15
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license.
 * @file videojs-koment.js
 **/
import videojs from 'video.js'
import xhr from 'xhr'
import KomentButton from './component/control-bar/track-controls/koment-button'
import KomentNewButton from './component/control-bar/track-controls/koment-new-button'
import KomentTrackDisplay from './tracks/koment-track-display'

const Component = videojs.getComponent('Component')

export const TRACK_ID = 'koment_track'
export const COMMENT_SHOW_TIME = 5
/**
 * Initialize the plugin.
 * @param options (optional) {object} configuration for the plugin
 */
class Koment extends Component {
    constructor (player, options) {
        super(player, options)

        const defaults = {
            label: 'Koment',
            language: 'fr'
        }

        this.text_track = videojs.mergeOptions(defaults, options, {
            default: true,
            kind: this.kind_,
            id: TRACK_ID,
            cues: [],
            mode: 'showing'
        })

        let data = {
            json: true,
            uri: this.options_.url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        xhr(data, (err, res) => {
            if (err) {
                throw new Error(err.message)
            }
            //const addedTrack = player.addRemoteTextTrack(this.text_track).track
            const addedTrack = player.addTextTrack(this.text_track.kind, this.text_track.label, this.text_track.language)
            addedTrack.default = true

            const listCues = res.body || []
            listCues.forEach((cue) => {
                addedTrack.addCue(new VTTCue(cue.timecode, cue.timecode + COMMENT_SHOW_TIME, cue.text))
            })


        })

    }

    /**
     * Create the component's DOM element
     *
     * @return {Element}
     * @method createEl
     */
    createEl () {
        return super.createEl('div', {
            className: 'vjs-koment-bar',
            dir: 'ltr'
        }, {
            // The control bar is a group, so it can contain menuitems
            role: 'group'
        })
    }

}

Koment.prototype.kind_ = 'metadata'
Koment.prototype.options_ = {
    url: 'https://afr-api-v1-staging.herokuapp.com/api/videos/c1ee3b32-0bf8-4873-b173-09dc055b7bfe/comments',
    children: {
        'komentButton': {},
        //'komentNewButton': {}
    }
}

// register the plugin
videojs.options.children = videojs.options.children.concat(['koment', 'komentTrackDisplay'])

Component.registerComponent('Koment', Koment)

export default Koment