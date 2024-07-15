import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";

const DisclaimerPopup = ({ onAcceptClick }) => {
  const element = (
    <div className="modal">
      <div className="disclaimerDiv">
        <h3 style={{ textAlign: "center" }}>DISCLAIMER</h3>
        <p>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum
        </p>
        <div style={{ textAlign: "center" }}>
          <button type="button" onClick={onAcceptClick}>
            Accept
          </button>
          <button type="button">Decline</button>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(
    element,
    document.getElementById("disclaimerDiv")
  );
};

export default DisclaimerPopup;

DisclaimerPopup.propTypes = {
  onAcceptClick: PropTypes.func.isRequired
};
