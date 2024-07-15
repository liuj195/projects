import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

/**********************
 *        USAGE
 * Send in "id" prop
 * window.openPopup matches id against list in public/yk1SuiteExternalData
 * sets span's innerHTML to text found in list
 *
 **********************************/

const ToolTip = props => {
  let fullScreenIcon = props.id === "FullScreen" ? { right: 20, top: 8 } : null;
  let width = props.width ? props.width : null;
  return (
    <React.Fragment>
      {
        <FontAwesomeIcon
          className="fa-sm"
          icon={faInfoCircle}
          onMouseOver={() => {
            window.openPopup(props.id);
          }}
          onMouseOut={() => {
            document.getElementById(props.id).style.visibility = "hidden";
          }}
        />
      }
      <span
        id={props.id}
        style={{
          ...fullScreenIcon,
          position: "absolute",
          visibility: "hidden",
          background: "#303030",
          color: "white",
          padding: 10,
          borderRadius: 11,
          width,
          //maxWidth: 250,
          textAlign: "left",
          zIndex: 1
        }}
      />
    </React.Fragment>
  );
};

export default ToolTip;
