import React, { Component } from "react";

class LogoutModal extends Component {
  render() {
    return (
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          height: window.innerHeight,
          width: window.innerWidth,
          position: "absolute",
          paddingTop: "10%",
          zIndex: 99,
        }}
      >
        <div
          style={{
            margin: "auto",
            textAlign: "center",
            background: "white",
            width: 378,
            height: "auto",
            border: "1px solid grey",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              borderBottom: "1px solid grey",
              textAlign: "center",
              padding: 5,
              borderTopLeftRadius: 5,
              borderTopRightRadius: 5,
              background: "lightgrey",
            }}
          >
            <b style={{ fontSize: 18 }}>yK1 ALERT</b>
          </div>

          <div style={{ borderBottom: "1px solid grey" }} />
          <h4>All users must re-authenticate after 12 hours</h4>
          <div style={{ textAlign: "center", padding: 5 }}>
            <button
              className="btn btn-lg text-center"
              type="submit"
              style={{
                padding: 10,
                backgroundColor: "#2e8540",
                color: "white",
                borderRadius: "7px",
              }}
              onClick={() => {
                window.location = window.yk1URL;
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default LogoutModal;
