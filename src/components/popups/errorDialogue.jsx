import React, { Component } from "react";
import YK1 from "../../js/yk1/yk1";
import SVG from "../svg/xButtonSvg";

class ErrorDialogue extends Component {
  state = {
    modalWidth: 378,
    gridWidth: 350,
  };
  constructor(props) {
    super(props);
    // console.log(props);
    this.state.msg = props.msg;
  }
  closeModal = () => {
    let modalPopup = document.getElementById("modalPopup");
    modalPopup.parentNode.removeChild(modalPopup);
  };

  render() {
    // let statusCodeHeading =
    //   this.props.status &&
    //   this.props.status === 204 &&
    //   this.props.msg instanceof Array
    //     ? "yK1 has no data for these tins and tax periods"
    //     : null;
    let headerMessage = this.props.headerMsg ? this.props.headerMsg : null;
    return (
      <div
        ref={(ele) => {
          this.myRef = ele;
        }}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          height: window.innerHeight,
          width: window.innerWidth,
          position: "absolute",
          paddingTop: "10%",
          zIndex: 99,
          top: 0,
        }}
      >
        <div
          style={{
            margin: "auto",
            textAlign: "center",
            background: "white",
            // width: this.getDynamicWidth(data) + 100,
            width: this.state.modalWidth,
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
            <SVG
              onClearText={this.closeModal}
              styleObj={{
                float: "right",
                border: "1px solid grey",
                borderRadius: 3,
                color: "grey",
                position: "relative",
              }}
            />
            <b style={{ fontSize: 18 }}>yK1 Alert</b>
          </div>
          <div style={{ fontWeight: "bold" }}>{headerMessage}</div>
          <div style={{ whiteSpace: "pre-line" }}>
            {this.state.msg ? this.state.msg : null}
          </div>

          <div style={{ borderBottom: "1px solid grey" }} />
          <div style={{ textAlign: "center", padding: 5 }}>
            <button
              className="btn btn-lg text-center"
              type="submit"
              style={{
                padding: 10,
                backgroundColor: "black",
                color: "white",
                borderRadius: "7px",
              }}
              onClick={this.closeModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorDialogue;
