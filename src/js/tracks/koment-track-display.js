/**
 * @file koment-track-display.js
 */
import videojs from 'video.js'


const Component = videojs.getComponent('Component')
import window from 'global/window'

const darkGray = '#222'
const lightGray = '#ccc'
const fontMap = {
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
}

/**
 * Add cue HTML to display
 *
 * @param {Number} color Hex number for color, like #f0e
 * @param {Number} opacity Value for opacity,0.0 - 1.0
 * @return {RGBAColor} In the form 'rgba(255, 0, 0, 0.3)'
 * @method constructColor
 */
function constructColor (color, opacity) {
    return 'rgba(' +
        // color looks like "#f0e"
        parseInt(color[1] + color[1], 16) + ',' +
        parseInt(color[2] + color[2], 16) + ',' +
        parseInt(color[3] + color[3], 16) + ',' +
        opacity + ')'
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
function tryUpdateStyle (el, style, rule) {
    try {
        el.style[style] = rule
    } catch (e) {

        // Satisfies linter.
        return
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
class KomentTrackDisplay extends Component {

    constructor (player, options, ready) {
        super(player, options, ready)

        player.on('loadstart', videojs.bind(this, this.toggleDisplay))
        player.on('texttrackchange', videojs.bind(this, this.updateDisplay))

        const tracks = player.textTracks()

        if (tracks) {
            const changeHandler = videojs.bind(this, this.handleTracksChange)

            tracks.addEventListener('change', changeHandler)

            this.on('dispose', function () {
                tracks.removeEventListener('change', changeHandler)
            })
        }

        player.ready(videojs.bind(this, function () {

            player.on('fullscreenchange', videojs.bind(this, this.updateDisplay))

            const trackList = this.player_.textTracks()
            let firstKoment

            if (trackList) {
                for (let i = 0; i < trackList.length; i++) {
                    const track = trackList[i]

                    if (track.default) {
                        if (track.kind === this.kind_ && !firstKoment) {
                            firstKoment = track
                        }
                    }
                }
                // We want to show the first default track but captions and subtitles
                // take precedence over descriptions.
                // So, display the first default captions or subtitles track
                // and otherwise the first default descriptions track.
                if (firstKoment) {
                    firstKoment.mode = 'showing'
                }
            }
        }))
    }

    /**
     * Toggle display texttracks
     *
     * @method toggleDisplay
     */
    toggleDisplay () {
        this.show()
    }

    /**
     * Create the component's DOM element
     *
     * @return {Element}
     * @method createEl
     */
    createEl () {
        return super.createEl('div', {
            className: 'vjs-koment-track-display'
        }, {
            'aria-live': 'assertive',
            'aria-atomic': 'true'
        })
    }

    /**
     * Clear display texttracks
     *
     * @method clearDisplay
     */
    clearDisplay () {
    }


    /**
     * Handle text track change
     *
     * @method handleTracksChange
     */
    handleTracksChange () {
        const tracks = this.player().textTracks()
        let disabled = true

        // Check whether a track of a different kind is showing
        for (let i = 0, l = tracks.length; i < l; i++) {
            const track = tracks[i]

            if (track.kind === this.kind_ && track.mode === 'showing') {
                disabled = false
                break
            }
        }

        // If another track is showing, disable this menu button
        if (disabled) {
            this.hide()
        } else {
            this.show()
        }

        this.updateDisplay()
    }


    /**
     * Update display texttracks
     *
     * @method updateDisplay
     */
    updateDisplay () {
        const tracks = this.player_.textTracks()

        this.clearDisplay()

        if (!tracks) {
            return
        }

        // Track display prioritization model: if multiple tracks are 'showing',
        //  display the first 'subtitles' or 'captions' track which is 'showing',
        //  otherwise display the first 'descriptions' track which is 'showing'

        let komentTrack = null

        let i = tracks.length

        const changeHandler = videojs.bind(this, this.handleTracksChange)


        while (i--) {
            const track = tracks[i]

            track.removeEventListener('cuechange', changeHandler)
            if (track.mode === 'showing') {
                if (track.kind === this.kind_) {
                    track.addEventListener('cuechange', changeHandler)
                    komentTrack = track
                }
            }
        }

        if (komentTrack) {
            this.updateForTrack(komentTrack)
        }
    }

    /**
     * Add texttrack to texttrack list
     *
     * @param {TextTrackObject} track Texttrack object to be added to list
     * @method updateForTrack
     */
    updateForTrack (track) {

        if (typeof window.WebVTT !== 'function' || !track.activeCues) {
            return
        }

        const overrides = this.player_.textTrackSettings.getValues()
        const cues = []

        for (let i = 0; i < track.activeCues.length; i++) {
            cues.push(track.activeCues[i])
        }

        window.WebVTT.processCues(window, cues, this.el_)

        let i = cues.length
        while (i--) {
            const cue = cues[i]

            if (!cue) {
                continue
            }

            const cueDiv = cue.displayState
            if (overrides.color) {
                cueDiv.firstChild.style.color = overrides.color
            }
            if (overrides.textOpacity) {
                tryUpdateStyle(cueDiv.firstChild,
                    'color',
                    constructColor(overrides.color || '#fff',
                        overrides.textOpacity))
            }
            if (overrides.backgroundColor) {
                cueDiv.firstChild.style.backgroundColor = overrides.backgroundColor
            }
            if (overrides.backgroundOpacity) {
                tryUpdateStyle(cueDiv.firstChild,
                    'backgroundColor',
                    constructColor(overrides.backgroundColor || '#000',
                        overrides.backgroundOpacity))
            }
            if (overrides.windowColor) {
                if (overrides.windowOpacity) {
                    tryUpdateStyle(cueDiv,
                        'backgroundColor',
                        constructColor(overrides.windowColor, overrides.windowOpacity))
                } else {
                    cueDiv.style.backgroundColor = overrides.windowColor
                }
            }
            if (overrides.edgeStyle) {
                if (overrides.edgeStyle === 'dropshadow') {
                    cueDiv.firstChild.style.textShadow = `2px 2px 3px ${darkGray}, 2px 2px 4px ${darkGray}, 2px 2px 5px ${darkGray}`
                } else if (overrides.edgeStyle === 'raised') {
                    cueDiv.firstChild.style.textShadow = `1px 1px ${darkGray}, 2px 2px ${darkGray}, 3px 3px ${darkGray}`
                } else if (overrides.edgeStyle === 'depressed') {
                    cueDiv.firstChild.style.textShadow = `1px 1px ${lightGray}, 0 1px ${lightGray}, -1px -1px ${darkGray}, 0 -1px ${darkGray}`
                } else if (overrides.edgeStyle === 'uniform') {
                    cueDiv.firstChild.style.textShadow = `0 0 4px ${darkGray}, 0 0 4px ${darkGray}, 0 0 4px ${darkGray}, 0 0 4px ${darkGray}`
                }
            }
            if (overrides.fontPercent && overrides.fontPercent !== 1) {
                const fontSize = window.parseFloat(cueDiv.style.fontSize)

                cueDiv.style.fontSize = (fontSize * overrides.fontPercent) + 'px'
                cueDiv.style.height = 'auto'
                cueDiv.style.top = 'auto'
                cueDiv.style.bottom = '2px'
            }
            if (overrides.fontFamily && overrides.fontFamily !== 'default') {
                if (overrides.fontFamily === 'small-caps') {
                    cueDiv.firstChild.style.fontVariant = 'small-caps'
                } else {
                    cueDiv.firstChild.style.fontFamily = fontMap[overrides.fontFamily]
                }
            }
        }
    }

}

KomentTrackDisplay.prototype.kind_ = 'metadata'

Component.registerComponent('KomentTrackDisplay', KomentTrackDisplay)
export default KomentTrackDisplay