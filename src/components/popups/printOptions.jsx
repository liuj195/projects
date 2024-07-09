import React, { Component } from "react";
import YK1 from "../../js/yk1/yk1";
import SVG from "../svg/xButtonSvg";
import Draggable from "react-draggable";
import { printLegend } from "../utils/utils";

class PrintOptions extends Component {
  state = {};
  componentDidMount() {
    document.addEventListener("click", this.handleClose);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.handleClose);
  }
  handleClose = (e) => {
    if (e.target === this.myRef) this.props.onHandleClose();
  };
  printFile = (isFull) => {
    let isLegend =
      this.props.currentTab.name.indexOf("Legend") >= 0 ? true : false;
    this.props.onHandleClose();

    if (this.props.currentCyto && !isLegend) {
      let { currentCyto, graphId } = this.props;
      //in graphmain.js
      YK1.print(currentCyto, graphId, isFull);
    } else if (isLegend) {
      printLegend();
    } else {
      alert("No Graph Selected");
    }
  };

  render() {
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
        }}
      >
        <Draggable cancel=".mainFindByGrid">
          <div
            style={{
              margin: "auto",
              textAlign: "center",
              background: "white",
              // width: this.getDynamicWidth(data) + 100,
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
              <SVG
                onClearText={this.props.onHandleClose}
                styleObj={{
                  float: "right",
                  border: "1px solid grey",
                  borderRadius: 3,
                  color: "grey",
                  position: "relative",
                }}
              />
              <b style={{ fontSize: 18 }}>Print Options</b>
            </div>

            <div style={{ borderBottom: "1px solid grey" }} />
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
                  this.printFile(true);
                }}
              >
                Print Full
              </button>

              <button
                className="btn btn-lg text-center"
                type="submit"
                style={{
                  padding: 10,
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "7px",
                }}
                onClick={() => {
                  this.printFile(false);
                }}
              >
                Print View
              </button>
              <button
                className="btn btn-lg text-center"
                type="submit"
                style={{
                  padding: 10,
                  backgroundColor: "black",
                  color: "white",
                  borderRadius: "7px",
                }}
                onClick={this.props.onHandleClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </Draggable>
      </div>
    );
  }
}

export default PrintOptions;
