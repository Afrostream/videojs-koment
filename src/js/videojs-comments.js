/**
 * ! videojs-comments - v1.0.0 - 2016-02-15
 * Copyright (c) 2015 benjipott
 * Licensed under the Apache-2.0 license.
 * @file videojs-comments.js
 **/
import videojs from 'video.js'
import xhr from 'xhr'
import CommentsButton from './component/control-bar/track-controls/comments-button'

const Component = videojs.getComponent('Component')

export const TRACK_ID = 'comments_track'
/**
 * Initialize the plugin.
 * @param options (optional) {object} configuration for the plugin
 */
class Comments extends Component {
    constructor (player, options) {
        super(player, options)

        const defaults = {
            label: 'English',
            language: 'en'
        }

        this.text_track = videojs.mergeOptions(defaults, options, {
            default: true,
            kind: 'metadata',
            id: TRACK_ID,
            cues: []
        })

        let data = {
            json: true,
            uri: this.options_.url,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        xhr(data, (err, res) => {
            if (err) {
                throw new Error(err.message);
            }

            const addedTrack = player.addRemoteTextTrack(this.text_track).track

            const listCues = res.body || []
            let i = 0
            listCues.forEach((cue) => {
                cue.timecode = i++
                addedTrack.addCue(new window.VTTCue(cue.timecode, cue.timecode + 1, cue.text))
            })


        })

    }
}

Comments.prototype.options_ = {
    url: 'https://afr-api-v1-staging.herokuapp.com/api/videos/c1ee3b32-0bf8-4873-b173-09dc055b7bfe/comments'
}

// register the plugin
videojs.options.children.push('comments')

Component.registerComponent('Comments', Comments)

export default Comments