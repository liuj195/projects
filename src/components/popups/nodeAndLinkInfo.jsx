import React, { Component } from "react";
import SVG from "../svg/xButtonSvg";
import Draggable from "react-draggable";

class NodeLinkInfo extends Component {
  componentDidMount() {
    let displayElement = document.getElementById("nodeLinkDiv");
    displayElement.innerHTML = this.props.data.HTMLstring;
    document.addEventListener("click", this.closePopup);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.closePopup);
  }
  closePopup = e => {
    if (this.myRef === e.target) this.props.onExit();
  };
  render() {
    return (
      <div
        ref={ele => {
          this.myRef = ele;
        }}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          height: window.innerHeight,
          width: window.innerWidth,
          position: "absolute",
          paddingTop: "10%",
          zIndex: 99,
          overflow: "hidden"
        }}
      >
        {/* </div> <Draggable bounds={{ left: null, top: null, right: null, bottom: 250 }}> */}
        <Draggable>
          <div
            id="innerDivWindow"
            style={{
              margin: "auto",
              textAlign: "center",
              background: "white",
              // width: this.getDynamicWidth(data) + 100,
              width: 300,
              height: "auto",
              border: "1px solid grey",
              borderRadius: 8
            }}
          >
            <div
              style={{
                borderBottom: "1px solid grey",
                textAlign: "center",
                padding: 5,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                background: "lightgrey"
              }}
            >
              <SVG
                onClearText={this.props.onExit}
                styleObj={{
                  float: "right",
                  border: "1px solid grey",
                  borderRadius: 3,
                  color: "grey",
                  position: "relative"
                }}
              />
              <b style={{ fontSize: 18 }}> {this.props.data.title} </b>
            </div>
            <div
              id="nodeLinkDiv"
              style={{ maxHeight: 400, overflow: "auto" }}
            />
          </div>
        </Draggable>
      </div>
    );
  }
}

export default NodeLinkInfo;
