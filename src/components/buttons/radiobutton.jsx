import React from "react";
import PropTypes from "prop-types";
import ToolTip from "../tooltips/tooltips";

const RadioButton = ({ id, name, checked, style, onChange, label }) => {
  return (
    <li style={style}>
      <input
        checked={checked}
        onChange={onChange}
        id={id}
        type="radio"
        value={id}
        name={name}
      />
      <label htmlFor={id}>
        {label} <ToolTip id={getToolTipName(label)} width={150} />{" "}
      </label>
    </li>
  );
};
const getToolTipName = name => {
  name = name.split(" ")[0];
  return name + "toolTip";
};
export default RadioButton;

RadioButton.propTypes = {
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired
};
