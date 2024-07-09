import React from "react";
const SVG = props => {
  let style = props.styleObj
    ? { position: "absolute", ...props.styleObj }
    : { position: "absolute" };
  style = { ...style, height: 21 };
  let className = props.classNameProp ? props.classNameProp : "css-19bqh2r";
  return (
    <svg
      onClick={props.onClearText}
      width="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={style}
    >
      <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z" />
    </svg>
  );
};

export default SVG;
