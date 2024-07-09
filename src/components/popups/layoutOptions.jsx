import React, { Component } from "react";
import SVG from "../svg/xButtonSvg";
import Draggable from "react-draggable";
import { Dagre, Circle, Cola, Grid } from "../layoutInterface/layoutInterfaces";
import {
  circleOptions,
  gridOptions,
  colaOptions,
  dagreOptions,
} from "../layoutInterface/layoutOptions";
import { resetEdgeBends } from "../utils/utils";
class LayoutOptions extends Component {
  state = { optionsObject: dagreOptions, currentLayout: "Dagre" };

  componentDidUpdate() {}

  componentDidMount() {
    document.addEventListener("click", this.handleClose);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.handleClose);
  }
  handleClose = (e) => {
    if (e.target === this.myRef) this.props.onHandleClose();
  };

  getRenderLayout = (layoutType) => {
    switch (layoutType) {
      case "Dagre":
        return (
          <Dagre
            options={this.state.optionsObject}
            updateOptions={this.updateOptionObject}
          />
        );
      case "Circular":
        return (
          <Circle
            options={this.state.optionsObject}
            updateOptions={this.updateOptionObject}
          />
        );
      case "Grid":
        return (
          <Grid
            options={this.state.optionsObject}
            updateOptions={this.updateOptionObject}
          />
        );
      case "Cola":
        return (
          <Cola
            options={this.state.optionsObject}
            updateOptions={this.updateOptionObject}
          />
        );
      default:
        console.log("default case");
        console.log(layoutType);
        break;
    }
  };
  updateOptionObject = (optionsObject) => {
    this.setState({ optionsObject });
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
        <Draggable cancel=".mainContent">
          <div
            style={{
              margin: "auto",
              textAlign: "center",
              background: "white",
              // width: this.getDynamicWidth(data) + 100,
              width: 450,
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
              <b style={{ fontSize: 18 }}>
                {this.props.layoutType} Layout Options
              </b>
            </div>
            <div>
              <b>Select Layout Options:</b>
            </div>
            <div
              style={{ borderTop: "1px solid lightgrey" }}
              id="layoutRadioButtons"
            >
              <input
                type="radio"
                id="Dagre"
                name="layouts"
                value="Dagre"
                defaultChecked
                onClick={(e) => {
                  this.setState({
                    currentLayout: e.target.value,
                    optionsObject: dagreOptions,
                  });
                }}
              />
              <label htmlFor="Dagre">Dagre</label>
              <input
                type="radio"
                id="Circular"
                name="layouts"
                value="Circular"
                onClick={(e) => {
                  this.setState({
                    currentLayout: e.target.value,
                    optionsObject: circleOptions,
                  });
                }}
              />
              <label htmlFor="Circular">Circular</label>
              <input
                type="radio"
                id="Cola"
                name="layouts"
                value="Cola"
                onClick={(e) => {
                  this.setState({
                    currentLayout: e.target.value,
                    optionsObject: colaOptions,
                  });
                }}
              />
              <label htmlFor="Cola">Cola</label>
              <input
                type="radio"
                id="Grid"
                name="layouts"
                value="Grid"
                onClick={(e) => {
                  this.setState({
                    currentLayout: e.target.value,
                    optionsObject: gridOptions,
                  });
                }}
              />
              <label htmlFor="Grid">Grid</label>
            </div>
            <ul
              className="mainContent"
              style={{
                textAlign: "left",
                height: 330,
                padding: 10,
                margin: "auto",
                borderBottom: "1px solid lightgrey",
              }}
            >
              {this.getRenderLayout(this.state.currentLayout)}
            </ul>
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
                  let cy = this.props.currentCyto;
                  let layout = null;
                  //if no selected elements, apply to whole graph
                  if (!this.props.selectedNodes) {
                    layout = cy.layout(this.state.optionsObject);
                  } else {
                    //else apply to selected
                    layout = this.props.selectedNodes.layout(
                      this.state.optionsObject
                    );
                  }
                  resetEdgeBends(cy);
                  layout.run();
                  //cy.resize();
                  cy.fit(50);

                  this.props.onHandleClose();
                }}
              >
                Submit
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
                Close
              </button>
            </div>
          </div>
        </Draggable>
      </div>
    );
  }
}

export default LayoutOptions;
