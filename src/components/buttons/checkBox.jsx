import React from "react";
import PropTypes from "prop-types";
import ToolTip from "../tooltips/tooltips";

const CheckBox = ({ id, name, checked, style, onChange }) => {
  return (
    <li style={style}>
      <input
        checked={checked}
        onChange={onChange}
        id={id}
        type="checkbox"
        value={name}
        name={name}
      />
      <label style={{ display: "inline-block" }} htmlFor={id}>
        {name} <ToolTip id={getToolTipName(name)} width={200} />
      </label>
      <br />
    </li>
  );
};
const getToolTipName = name => {
  name = name.split(" ")[0];
  return name;
};
export default CheckBox;

CheckBox.propType = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};
