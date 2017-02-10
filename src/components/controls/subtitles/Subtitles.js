import React from 'react';
import Icon from './../../icon/Icon';

var VideoSelectItem = React.createClass({
    render(){
        return (
            <div
              className="display-table-row"
                onClick={() => this.props.onClickHandle(this.props.value)}>
              {
                this.props.isActive
                ? <span className="display-table-cell icon-tick"/>
                : <span>{' '}</span>
              }
              <span className="display-table-cell">{this.props.label}</span>
            </div>
        )
    }
})

var SubtitleTracks = React.createClass({

    propTypes: {
        copyKeys: React.PropTypes.object,
        toggleFullscreen: React.PropTypes.func
    },

    onSubtitleTrackChange(index) {
        this.props.handleTrackChange(index)
    },

    renderSubtitleControls(qualityOptions,selectedSubTrackIndex){
        return qualityOptions.map((item,index) => {
           return <VideoSelectItem
                    isActive={item.value===selectedSubTrackIndex}
                    key={index}
                    onClickHandle={this.onSubtitleTrackChange}
                    {...item}/>
        })
    },

    /**
     * As controls receive all props for extensibility, we do a quick
     * check and make sure only the props we care about have changed.
     * @param  {object} nextProps The next props from parent
     * @return {boolean}          Whether we re-render or not
     */
    prepareOptionsToSelect(subtitleTracks){
        let updatedSubtitleTracks = subtitleTracks.map(item => {
            return ({
                label: item.lang,
                value: item.index,
                ...item
            })
        })
        updatedSubtitleTracks.push({
            label: 'Off',
            value: -1
        })
        return updatedSubtitleTracks
    },

    render () {
        let subtitleTracks = this.prepareOptionsToSelect(this.props.subtitleTracks);
        if(subtitleTracks.length > 1) {
          return (
            <div className="video-settings video__control" >
                <button
                    className="video-settings__inner">
                    <i className="fa fa-cog" aria-hidden="true"></i>
                </button>
                <div className="video-settings__content">
                  {this.renderSubtitleControls(subtitleTracks,this.props.currentTextTrackIndex)}
                </div>
            </div>
          )
        } else {
          return null
        }
    }
})

export default SubtitleTracks