import React from 'react';
import Icon from './../../icon/Icon';

var VideoSelectItem = React.createClass({
    render(){
        return (
            <div
              className="display-table-row"
                onClick={() => this.props.onClickHandle(this.props.qualityIndex)}>
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

var QualityControls = React.createClass({

    propTypes: {
        copyKeys: React.PropTypes.object,
        toggleFullscreen: React.PropTypes.func
    },

    onQualityChange(index) {
        this.props.handleQualityChange('video',index)
    },

    renderQualityControls(qualityOptions,selectedQuality){
        return qualityOptions.map((item,index) => {
           return <VideoSelectItem
                    isActive={item.value===selectedQuality}
                    key={index}
                    onClickHandle={this.onQualityChange}
                    {...item}/>
        })
    },

    /**
     * As controls receive all props for extensibility, we do a quick
     * check and make sure only the props we care about have changed.
     * @param  {object} nextProps The next props from parent
     * @return {boolean}          Whether we re-render or not
     */
    prepareOptionsToSelect(qualityOptions){
        let updatedQualityOptions = qualityOptions.map(item => {
            return ({
                label: item.bitrate,
                value: item.bitrate,
                ...item
            })
        })
        updatedQualityOptions.push({
            label: 'Auto',
            value: 'auto',
            qualityIndex: -1
        })
        return updatedQualityOptions
    },

    render () {
        let qualityOptions = this.prepareOptionsToSelect(this.props.bitrateOptionsVideo);
        return (
          <div className="video-settings video__control" >
              <button
                  className="video-settings__inner">
                  <i className="fa fa-cog" aria-hidden="true"></i>
              </button>
              <div className="video-settings__content">
                {this.renderQualityControls(qualityOptions,this.props.selectedQuality)}
              </div>
          </div>
        )
    }
})

export default QualityControls