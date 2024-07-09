import React from "react";
import PropTypes from "prop-types";

const CheckBoxBase = ({ id, name, checked, style, onChange }) => {
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
        {name}
      </label>
      <br />
    </li>
  );
};

export default CheckBoxBase;

CheckBoxBase.propType = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired
};
