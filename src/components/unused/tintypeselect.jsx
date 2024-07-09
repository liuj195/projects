import React, { Component } from "react";
/**
 * This was originally used as a way clients could specifiy a tin type for each Tin
 * As of 11/15/2018 it is not in use.
 */
class TinTypeSelect extends Component {
  state = {};
  render() {
    return (
      <div className="tintypes">
        <input
          type="text"
          onChange={this.props.onChangeTinType}
          value={this.props.value}
        />
        <label>
          <input type="checkbox" name="SSN" />
          SSN
        </label>
        <label htmlFor="EIN">
          <input type="checkbox" name="EIN" />
          EIN
        </label>
        <label htmlFor="Invalid">
          <input type="checkbox" name="Invalid" />
          Invalid
        </label>
        <span
          style={{ fontWeight: "bold", cursor: "default" }}
          onClick={() => this.props.onCloseTinType(this.props.tinType)}
        >
          X
        </span>
      </div>
    );
  }
}

export default TinTypeSelect;
