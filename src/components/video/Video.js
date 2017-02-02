import React from 'react';
import Overlay from './overlay/Overlay';
import Controls from './../controls/Controls';
import Seek from './../controls/seek/Seek';
import Play from './../controls/play/Play';
import Mute from './../controls/mute/Mute';
import Fullscreen from './../controls/fullscreen/Fullscreen';
import Time from './../controls/time/Time';
import HD from './../controls/hd/HD';
import Subtitle from './../controls/subtitles/Subtitles';
import throttle from 'lodash.throttle';
import copy from './../../assets/copy';
import { MediaPlayer } from 'dashjs';

var EVENTS = [
    'onAbort',
    'onCanPlay',
    'onCanPlayThrough',
    'onDurationChange',
    'onEmptied',
    'onEncrypted',
    'onEnded',
    'onError',
    'onLoadedData',
    'onLoadedMetadata',
    'onLoadStart',
    'onPause',
    'onPlay',
    'onPlaying',
    'onProgress',
    'onRateChange',
    'onSeeked',
    'onSeeking',
    'onStalled',
    'onSuspend',
    'onTimeUpdate',
    'onVolumeChange',
    'onWaiting'
];

var Video = React.createClass({

    propTypes: {
        // Non-standard props
        copyKeys: React.PropTypes.object,
        children: React.PropTypes.node,
        className: React.PropTypes.string,

        // HTML5 Video standard attributes
        url: React.PropTypes.string.isRequired,
        autoPlay: React.PropTypes.bool,
        muted: React.PropTypes.bool,
        controls: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            copyKeys: copy
        };
    },

    getInitialState() {
        // Set state from props and always use these
        // to check state of video as they will update
        // on the video events. Changing this state however will not
        // change the video. The API methods must be used.
        return {
            networkState: 0,
            paused: !this.props.autoPlay,
            muted: !!this.props.muted,
            volume: 1,
            playbackRate: 1,
            error: false,
            loading: false,
            bitrateOptionsAudio: [],
            bitrateOptionsVideo: [],
            subtitleTracks: [],
            currentTextTrackIndex: -1,
            initialBitrateForVideo: -1
        };
    },

    /**
     * Creates a throttle update method.
     * @return {undefined}
     */
    componentWillMount() {
        this._updateStateFromVideo = throttle(this.updateStateFromVideo, 100);
        // Set up all React media events and call method
        // on props if provided.
        this.mediaEventProps = EVENTS.reduce((p, c) => {
            p[c] = (e) => {
                if (c in this.props && typeof this.props[c] === 'function') {
                    // A prop exists for this mediaEvent, call it.
                    this.props[c](e);
                }
                this._updateStateFromVideo();
            };
            return p;
        }, {});
    },

    /**
     * Bind eventlisteners not supported by React's synthetic events
     * https://facebook.github.io/react/docs/events.html
     * @return {undefined}
     */
    componentDidMount() {
        const url = this.props.url;
        this.player = MediaPlayer().create();
        this.player.initialize(this.videoEl, url, true);
        this.videoEl.children[this.videoEl.children.length - 1]
            .addEventListener('error', this._updateStateFromVideo);
        this.player.on(MediaPlayer.events.STREAM_INITIALIZED, this.getDefaultConditionsFromPlayer)
    },

    getDefaultConditionsFromPlayer(){
        let bitrateOptionsVideo = this.player.getBitrateInfoListFor('video')
        let bitrateOptionsAudio = this.player.getBitrateInfoListFor('audio')
        let subtitleTracks = this.player.getTracksFor('fragmentedText') 
        let currentTextTrackIndex = this.player.getCurrentTrackFor('fragmentedText')
        let initialBitrateForVideo = this.player.getInitialBitrateFor('video')
        this.setState({
          bitrateOptionsAudio,
          bitrateOptionsVideo,
          subtitleTracks, 
          currentTextTrackIndex,
          initialBitrateForVideo
        })
    },

    getMediaPlayerInstance(){
        return this.player
    },

    /**
     * Removes event listeners bound outside of React's synthetic events
     * @return {undefined}
     */
    componentWillUnmount() {
        // Remove event listener from video.
        this.videoEl.children[this.videoEl.children.length - 1]
            .removeEventListener('error', this._updateStateFromVideo);
        // Cancel the throttled function from being called once
        // the video has been unmounted.
        // https://github.com/mderrick/react-html5video/issues/35
        this._updateStateFromVideo.cancel();
    },

    onDoubleClick (e) {
      e.preventDefault()
      e.stopPropagation()
      this.toggleFullscreen()
    },

    /**
     * Toggles the video to play and pause.
     * @return {undefined}
     */
    togglePlay() {
        if (this.state.paused) {
            this.play();
        } else {
            this.pause();
        }
    },

    /**
     * Toggles the video to mute and unmute.
     * @return {undefined}
     */
    toggleMute() {
        if (this.state.muted) {
            this.unmute();
        } else {
            this.mute();
        }
    },

    /**
     * Loads video.
     * @return {undefined}
     */
    load() {
        this.videoEl.load();
    },

    /**
     * Sets the video to fullscreen.
     * toggle the video to fullscreen and window.
     * @return {undefined}
     */
     toggleFullscreen() {
      const ce = this.videoContainer;
      if (!document.fullscreenElement &&    // alternative standard method
          !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
          if (ce.requestFullscreen) {
              ce.requestFullscreen();
          } else if (ce.msRequestFullscreen) {
              ce.msRequestFullscreen();
          } else if (ce.mozRequestFullScreen) {
              ce.mozRequestFullScreen();
          } else if (ce.webkitRequestFullscreen) {
              ce.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
          }
      } else {
          if (document.exitFullscreen) {
              document.exitFullscreen();
          } else if (document.msExitFullscreen) {
              document.msExitFullscreen();
          } else if (document.mozCancelFullScreen) {
              document.mozCancelFullScreen();
          } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen();
          }
      }
    },

    /**
     * Plays the video.
     * @return {undefined}
     */
    play() {
        this.videoEl.play();
    },

    /**
     * Pauses the video.
     * @return {undefined}
     */
    pause() {
        this.videoEl.pause();
    },

    /**
     * Unmutes video.
     * @return {undefined}
     */
    unmute() {
        this.videoEl.muted = false;
    },

    /**
     * Mutes the video.
     * @return {undefined}
     */
    mute() {
        this.videoEl.muted = true;
    },

    /**
     * Seeks the video timeline.
     * @param  {number} time The value in seconds to seek to
     * @param  {bool}   forceUpdate Forces a state update without waiting for
     *                              throttled event.
     * @return {undefined}
     */
    seek(time, forceUpdate) {
        this.videoEl.currentTime = time;
        // In some use cases, we wish not to wait for `onSeeked` or `onSeeking`
        // throttled event to update state so we force it. This is because
        // this method is often triggered when dragging a bar and can feel janky.
        // See https://github.com/mderrick/react-html5video/issues/43
        if (forceUpdate) {
            this.updateStateFromVideo();
        }
    },

    /**
     * Sets the video volume.
     * @param  {number} volume The volume level between 0 and 1.
     * @param  {bool}   forceUpdate Forces a state update without waiting for
     *                              throttled event.
     * @return {undefined}
     */
    setVolume(volume, forceUpdate) {
        this.videoEl.volume = volume;
        // In some use cases, we wish not to wait for `onVolumeChange`
        // throttled event to update state so we force it. This is because
        // this method is often triggered when dragging a bar and can feel janky.
        // See https://github.com/mderrick/react-html5video/issues/43
        if (forceUpdate) {
            this.updateStateFromVideo();
        }
    },

    /**
     * Sets the video playback rate.
     * @param  {number} rate The playback rate (default 1.0).
     * @return {undefined}
     */
    setPlaybackRate(rate) {
        this.videoEl.playbackRate = rate;
        this.updateStateFromVideo();
    },

    /**
     * Updates the React component state from the DOM video properties.
     * This is where the magic happens.
     * @return {undefined}
     */
    updateStateFromVideo() {
        this.setState({
            // Standard video properties
            duration: this.videoEl.duration,
            currentTime: this.videoEl.currentTime,
            buffered: this.videoEl.buffered,
            paused: this.videoEl.paused,
            muted: this.videoEl.muted,
            volume: this.videoEl.volume,
            playbackRate: this.videoEl.playbackRate,
            readyState: this.videoEl.readyState,

            // Non-standard state computed from properties
            percentageBuffered: this.videoEl.buffered.length && this.videoEl.buffered.end(this.videoEl.buffered.length - 1) / this.videoEl.duration * 100,
            percentagePlayed: this.videoEl.currentTime / this.videoEl.duration * 100,
            error: this.videoEl.networkState === this.videoEl.NETWORK_NO_SOURCE,
            loading: this.videoEl.readyState < this.videoEl.HAVE_ENOUGH_DATA
        });
    },

    /**
     * Returns everything but 'source' nodes from children
     * and extends props so all children have access to Video API and state.
     * If there are no controls provided, returns default Controls.
     * @return {Array.<ReactElement>} An array of components.
     */
    renderControls() {
        var extendedProps = Object.assign({
            // The public methods that all controls should be able to
            // use.
            togglePlay: this.togglePlay,
            toggleMute: this.toggleMute,
            play: this.play,
            pause: this.pause,
            mute: this.mute,
            unmute: this.unmute,
            seek: this.seek,
            toggleFullscreen: this.toggleFullscreen,
            setVolume: this.setVolume,
            onDoubleClick:this.onDoubleClick,
            fullscreen: this.fullscreen,
            setPlaybackRate: this.setPlaybackRate,
            bitrateOptionsAudio: this.state.bitrateOptionsAudio,
            bitrateOptionsVideo: this.state.bitrateOptionsVideo,
            handleQualityChange: this.handleQualityChange,
            subtitleTracks: this.state.subtitleTracks,
            handleTrackChange: this.handleTrackChange,
            initialBitrateForVideo: this.state.initialBitrateForVideo,
            currentTextTrackIndex: this.state.currentTextTrackIndex
        }, this.state, {copyKeys: this.props.copyKeys});

        var controls = React.Children.map(this.props.children, (child) => {
            if (child.type === 'source' || child.type==='track') {
                return void 0;
            }
            return React.cloneElement(child, extendedProps);
        });

        if (!controls.length) {
            controls = (
                <div>
                    <Overlay {...extendedProps} />
                    <Controls {...extendedProps} />
                </div>
            );
        }
        return controls;
    },

    /**
     * Sets player current quality index 
     * @return {undefined}
     */
    handleQualityChange(type,index) {
      if(index === -1){
        this.player.setAutoSwitchQuality(true)
      } else {      
        this.player.setAutoSwitchQuality(false)
        this.player.setQualityFor(type,index)
        this.setState({
          initialBitrateForVideo: this.state.bitrateOptionsVideo[index].bitrate
        })
      }
    },

    /**
     * Sets player current text track 
     * @return {undefined}
     */
    handleTrackChange(index){
      this.player.setTextTrack(index)
    },

    /**
     * Returns video 'source' nodes from children.
     * @return {Array.<ReactElement>} An array of components.
     */
    renderSources() {
        return React.Children.map(this.props.children, (child) => {
            if (child.type !== 'source' && child.type !== 'track') {
                return void 0;
            }
            return child;
        });
    },

    /**
     * Gets the video class name based on its state
     * @return {string} Class string
     */
    getVideoClassName() {
        var {className} = this.props;
        var classString = 'video';

        if (this.state.error) {
            classString += ' video--error';
        } else if (this.state.loading) {
            classString += ' video--loading';
        } else if (this.state.paused) {
            classString += ' video--paused';
        } else {
            classString += ' video--playing';
        }

        if (this.state.focused) {
            classString += ' video--focused';
        }
        if (className) {
            classString += ' ' + className;
        }
        return classString;
    },

    /**
     * Sets state to show focused class on video player.
     * @return {undefined}
     */
    onFocus() {
        this.setState({
            focused: true
        });
    },

    /**
     * Sets state to not be focused to remove class form video
     * player.
     * @return {undefined}
     */
    onBlur() {
        this.setState({
            focused: false
        });
    },

    render() {
        // If controls prop is provided remove it
        // and use our own controls.
        // Leave `copyKeys` here even though not used
        // as per issue #36.
        var {controls, copyKeys, style, ...otherProps} = this.props;
        return (
            <div className={this.getVideoClassName()}
                tabIndex="0"
                ref={(vc) => {
                    this.videoContainer = vc;
                }}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                style={style}>
                <video
                    {...otherProps}
                    className="video__el"
                    ref={(el) => {
                        this.videoEl = el;
                    }}
                    //  We have throttled `_updateStateFromVideo` so listen to
                    //  every available Media event that React allows and
                    //  infer the Video state in that method from the Video properties.
                    {...this.mediaEventProps}>
                        {this.renderSources()}
                </video>
                {controls ? this.renderControls() : ''}
            </div>
        );
    }
});

export {Video as default, Controls, Seek, Play, Mute, Fullscreen, Time, Overlay,HD,Subtitle};
