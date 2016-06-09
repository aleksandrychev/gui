import React from 'react';
var GroupDevices = require('../deployments/groupdevices');
var RecentStats = require('./recentstats');
var Time = require('react-time');
var AppActions = require('../../actions/app-actions');

import { Router, Route, Link } from 'react-router';

// material ui
var mui = require('material-ui');
var List = mui.List;
var ListItem = mui.ListItem;
var Divider = mui.Divider;
var FontIcon = mui.FontIcon;

var Recent = React.createClass({
  getInitialState: function() {
    return {
      devices: {} 
    };
  },
  _clickHandle: function(id) {
    var params = {};
    params.id = id;
    params.route="deployments";
    params.open=true;
    this.props.clickHandle(params);
  },
  _formatTime: function(date) {
    return date.replace(' ','T').replace(/ /g, '').replace('UTC','');
  },
  render: function() {
    var recent = this.props.deployments.map(function(deployment, index) {
      if (index<5) {

        var last = (this.props.deployments.length === index+1) || index===4;
        var status = deployment.status === "Failed" ? "warning" : "check";
        var icon = (
          <FontIcon className="material-icons">
            {status}
          </FontIcon>
        );
        return (
          <div onClick={this._clickHandle.bind(null, deployment.id)} className="deployment" key={index}>
            <div className="deploymentInfo">
              <div><div className="progressLabel">Updating to:</div>{deployment.artifact_name}</div>
              <div><div className="progressLabel">Device group:</div><span className="capitalized">{deployment.name}</span></div>
              <div><div className="progressLabel">Started:</div><Time className="progressTime" value={this._formatTime(deployment.created)} format="YYYY-MM-DD HH:mm" /></div>
            </div>
            <RecentStats id={deployment.id} />
          </div>
        )
      }
    }, this);
    return (
      <div>
        <div className="deployments-container">
          <div className="dashboard-header subsection">
            <h3>Recent<span className="dashboard-number">{recent.length}</span></h3>
          </div>
          <div>
            {recent}
          </div>
          <div className={recent.length ? 'hidden' : null}>
            <p className="italic">No recent deployments</p>
          </div>
          <Link to="/deployments" className="float-right">All deployments</Link>
        </div>
      </div>
    );
  }
});

Recent.contextTypes = {
  router: React.PropTypes.object
};

module.exports = Recent;