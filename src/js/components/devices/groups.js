import React from 'react';
var AppStore = require('../../stores/app-store');
var AppActions = require('../../actions/app-actions');
import SearchInput from 'react-search-input';

// material ui
var mui = require('material-ui');
var List = mui.List;
var ListItem = mui.ListItem;
var FontIcon = mui.FontIcon;
var Dialog = mui.Dialog;
var TextField = mui.TextField;
var FlatButton = mui.FlatButton;
var RaisedButton = mui.RaisedButton;
var Table = mui.Table;
var TableHeaderColumn = mui.TableHeaderColumn;
var TableHeader = mui.TableHeader;
var TableRowColumn = mui.TableRowColumn;
var TableRow = mui.TableRow;
var TableBody = mui.TableBody;
import Subheader from 'material-ui/lib/Subheader';


var tmpDevices = [];
var selectedDevices = [];

var Groups = React.createClass({
  getInitialState: function() {
    return {
      errorText1:'',
      openDialog: false,
      showDeviceList: false,
      newGroup: '',
      invalid: true,
      selectedDevices: []
    };
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    if (nextState.selectedDevices !== this.state.selectedDevices) {
      return false;
    } else {
      return true;
    }
  },
  _changeGroup: function(id) {
    AppActions.selectGroup(id);
  },
  _createGroupHandler: function() {
    var selected = [];
    if (this.state.selectedDevices.length) {
      for (var i=0; i<this.state.selectedDevices.length; i++) {
        selected.push(tmpDevices[this.state.selectedDevices[i]]);
      }
    }
    var newGroup = {
      name: this.state.newGroup,
      devices: [],
      type: 'public'
    };
 
    AppActions.addToGroup(newGroup, selected);
    this.setState({openDialog: false, showDeviceList: false, invalid: true});
  },
  dialogToggle: function() {
    this.setState({openDialog: !this.state.openDialog, showDeviceList: false, newGroup: '' });
  },
  validateName: function(e) {
    var newName = e.target.value;
    this.setState({newGroup: newName});
    var invalid = newName ? false : true;
    var errorText = null;
    for (var i=0;i<this.props.groups.length; i++) {
      if (this.props.groups[i].name.toLowerCase() === newName.toLowerCase()) {
        invalid = true;
        errorText = "A group with this name already exists";
      }
    }
    this.setState({errorText1: errorText, invalid: invalid});
  },

  _getGroupNames: function(list) {
    /* TODO - move or tidy as it is dupliacte */
    var nameList = [];
    for (var i=0; i<list.length; i++) {
      for(var x = 0; x<this.props.groups.length; x++) {
        if(list[i] === this.props.groups[x].id) {
          nameList.push(this.props.groups[x].name);
        }
      }
    }

    return nameList;
  },

  searchUpdated: function(term) {
    this.setState({searchTerm: term}); // needed to force re-render
  },

  showDeviceList: function() {
    this.setState({showDeviceList: true});
  },

  _onRowSelection: function(array) {
    var selected = [];
    if (array === "all") {
      for (var i=0;i<tmpDevices.length;i++) {
        selected.push(i);  
      }
    } else if (array === "none") {
      selected = [];
    } else {
      selected = array;
    }
    this.setState({selectedDevices: selected});
  },

  render: function() {
    var createBtn = (
      <FontIcon className="material-icons">add</FontIcon>
    );
    var createActions = [
      <div style={{marginRight:"10", display:"inline-block"}}>
        <FlatButton
          label="Cancel"
          onClick={this.dialogToggle} />
      </div>,
      <RaisedButton
        label="Create group"
        primary={true}
        onClick={this._createGroupHandler}
        disabled={this.state.invalid} />
    ];

    if (this.refs.search && this.props.allDevices) {
      var filters = ['name'];
      tmpDevices = this.props.allDevices.filter(this.refs.search.filter(filters));
    }

    var deviceList = tmpDevices.map(function(device, index) {
      return (
        <TableRow key={index}>
          <TableRowColumn>
            {device.name}
          </TableRowColumn>
          <TableRowColumn>
            {device.device_type}
          </TableRowColumn>
           <TableRowColumn>
            {this._getGroupNames(device.groups).join(', ')}
          </TableRowColumn>
        </TableRow>
      );
    },this);

    return (
      <div>
        <List>
          <Subheader>Groups</Subheader>
          {this.props.groups.map(function(group) {
            if (group.type==='public') {
              var isSelected = group.id===this.props.selectedGroup.id ? {backgroundColor: "#e7e7e7"} : {backgroundColor: "transparent"};
              var boundClick = this._changeGroup.bind(null, group.id);
              var groupLabel = (
                  <span>{group.name}<span className='float-right length'>{group.devices.length}</span></span>
              );
              return (
                <ListItem 
                  key={group.id} 
                  primaryText={groupLabel}
                  style={isSelected}
                  onClick={boundClick} />
              )
            }
          }, this)}
           <ListItem 
            leftIcon={createBtn}
            primaryText="Create a group"
            onClick={this.dialogToggle} />
        </List>

        <Dialog
          ref="createGroup"
          title="Create a new group"
          actions={createActions}
          open={this.state.openDialog}
          autoDetectWindowHeight={true} autoScrollBodyContent={true} modal={true}
          bodyClassName="heightTransition"
          bodyStyle={{maxHeight:"50vh"}}
          titleStyle={{paddingBottom: "15"}}
          >  

          <div className={this.state.showDeviceList ? "absoluteTextfieldButton top-right margin-right" : "absoluteTextfieldButton" }>
            <TextField
              ref="customGroup"
              className="float-left"
              hintText="Name your group"
              floatingLabelText="Name your group"
              value={this.state.newGroup}
              onChange={this.validateName}
              errorStyle={{color: "rgb(171, 16, 0)"}}
              errorText={this.state.errorText1} />

            <div className={this.state.showDeviceList ? "hidden" : "float-left margin-left-small"}>
              <RaisedButton disabled={this.state.invalid} style={{marginTop:"26"}} label="Next" secondary={true} onClick={this.showDeviceList}/>
            </div>
       
          </div>

          <div className={this.state.showDeviceList===true ? "dialogTableContainer" : "dialogTableContainer zero"}>
            <div className="fixedSearch">
              <span>Select devices to include in the new group:</span>
              <SearchInput className="search top-right" ref='search' onChange={this.searchUpdated} placeholder="Search devices" style={{margin:"10"}} />
            </div>
            <Table
              multiSelectable={true}
              className={deviceList.length ? null : "hidden"}
              onRowSelection={this._onRowSelection}>
              <TableHeader>
                <TableRow>
                  <TableHeaderColumn>Name</TableHeaderColumn>
                  <TableHeaderColumn>Device type</TableHeaderColumn>
                  <TableHeaderColumn>Group</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody
                deselectOnClickaway={false}
                showRowHover={true}>
                {deviceList}
              </TableBody>
            </Table>
            <p className={deviceList.length ? "hidden" : "italic muted"}>
              No devices match the search term
            </p>
          </div>
        </Dialog>

      </div>
    );
  }
});


module.exports = Groups;