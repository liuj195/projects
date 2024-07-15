import React, { Component } from "react";
import YK1 from "../../js/yk1/yk1";
import MultiSelectBase from "../multiselect/multiSelectBase";
import CheckBoxBase from "../buttons/checkBoxBase";
import SVG from "../svg/xButtonSvg";
import Draggable from "react-draggable";
class ExpandGraph extends Component {
  state = { hops: 2, nodes: 10,
    selectedLimitTypeOption: [],
    selectedLimitDirOption: [],
    limitValue: 0.30,
    checked: false
  };

  limitTypeOptions = [
    { value: "PctKeyCase", label: "Percent to/from Start"},
    { value: "PctDirect", label: "Percent of Each K-1"},
    { value: "DollarAmt", label: "Dollars of Each K-1"}
  ]

  limitDirOptions = [
    { value: "Incoming", label: "Incoming K-1s" },
    { value: "Outgoing", label: "Outgoing K-1s" },
    { value: "Both", label: "In & Out From Any Node" }
  ]

  limitTypeDefaultValues = [
    { id: "PctKeyCase", value: 0.30},
    { id: "PctDirect", value: 0.05 },
    { id: "DollarAmt", value: 10000 }
  ]
  componentDidMount() {
    document.addEventListener("click", this.handleClose);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.handleClose);
  }
  handleClose = (e) => {
    if (e.target === this.myRef) this.props.onHandleClose();
  };
  getTin = () => {
    let { graphId, node } = this.props;
    let currentNode = YK1.GRAPHS[graphId].V[node];
    if (currentNode) {
      let tin = currentNode.TIN;
      return tin;
    } else if (Array.isArray(node)) {
      let tempNodes = [...node];
      let filterParents = tempNodes.filter((v, i, a) => {
        console.log(v);
        return v.indexOf("parent") === -1;
      });
      let nodes = filterParents.map((node) => {
        return node.split("_")[0];
      });
      nodes = nodes.join("\n");
      console.log(nodes);
      return nodes;
    } else {
      alert("No Node Selected");
    }
  };
  handleHopsChange = (e) => {
    let hops = +e.target.value;
    this.setState({ hops });
  };
  handleNodeChange = (e) => {
    let nodes;
    //allow users delete all values an have empty input
    if (e.target.value.length === 0) {
      nodes = "";
    } else {
      nodes = +e.target.value;
    }
    //make sure input is numeric
    if (!isNaN(nodes)) {
      if (nodes > 100) {
        alert("No values greater than 100");
        nodes = 100;
      }
      this.setState({ nodes });
    }
  };

  setDefaultLimitSelect = () => {
    let limitType = this.limitTypeOptions[0];
    let limitDir = this.limitDirOptions[0];
    let limitVal = this.limitTypeDefaultValues[0].value;

    this.setState({ selectedLimitTypeOption: limitType });
    this.setState({ selectedLimitDirOption: limitDir });
    this.setState({ limitValue: limitVal });
  };

  handleCheckedChange = (e) => {
    this.setState({checked: !this.state.checked});

    if (e.target.checked === false) {
      //comment the following three lines if persistent limit values are required
      //when Use Traversal Parameters checkbox is unchecked
      this.limitTypeDefaultValues[0].value = 0.30;
      this.limitTypeDefaultValues[1].value = 0.05;
      this.limitTypeDefaultValues[2].value = 10000;
    } else {
      // pre-populate limit type and limit direction dropdowns with default values
      this.setDefaultLimitSelect();

    }
  }

  handleLimitTypeChange = (e) => {
    let limitType = e.value;
    let limitValue;

    if (limitType === this.limitTypeDefaultValues[0].id){
      //set limit type selected
      this.setState({ selectedLimitTypeOption: this.limitTypeOptions[0] });
      //access recent percent key case value
      limitValue = this.limitTypeDefaultValues[0].value;
      this.setState({limitValue});
    } else if (limitType === this.limitTypeDefaultValues[1].id) {
      this.setState({ selectedLimitTypeOption: this.limitTypeOptions[1] });
      //access recent Percent Direct value
      limitValue = this.limitTypeDefaultValues[1].value;
      this.setState({limitValue});
    } else {
      this.setState({ selectedLimitTypeOption: this.limitTypeOptions[2] });
      //access recent dollar amount value
      limitValue = this.limitTypeDefaultValues[2].value;
      this.setState({limitValue});
    }
  }

  handleLimitDirChange = (e) => {
    let limitDir = e.value;

    if (limitDir === this.limitDirOptions[0].value){
      this.setState({ selectedLimitDirOption: this.limitDirOptions[0] });
    } else if (limitDir === this.limitDirOptions[1].value) {
      this.setState({ selectedLimitDirOption: this.limitDirOptions[1] });
    } else {
      this.setState({ selectedLimitDirOption: this.limitDirOptions[2] });
    }
  }

  handleLimitValueMouseOut = (e) => {
    let limitType = this.state.selectedLimitTypeOption.value;
    let limitValue = e.target.value;

    if (limitType === this.limitTypeOptions[0].value || limitType === this.limitTypeOptions[1].value) {
      if (limitValue <= 0 || limitValue > 1) {
        alert("Warning: Percent must be between 0 and 1!");
        return;
      }
    } else {
      if (limitValue <= 0) {
        alert("Warning: Dollar amount must be greater than 0!");
        return;
      }
    }
  }

  handleLimitValueChange = (e) => {
      let limitType = this.state.selectedLimitTypeOption.value;
      let limitValue = e.target.value;

      if (typeof limitType === "undefined") { //if no type is selected initially
        limitType = this.limitTypeOptions[0].value; //set limit type to first option
      }

      if (limitType === this.limitTypeOptions[0].value || limitType === this.limitTypeOptions[1].value) {
        let value = YK1.isPercentage(limitValue);

        if (value || value === 0 || value === "") {
          if (YK1.maxDecimalAllowed(limitValue, 3)) {
            this.setState({limitValue});
          }
        }

        if (limitType === this.limitTypeOptions[0].value) {
          //retain new percent key case value
          this.limitTypeDefaultValues[0].value = limitValue;
        } else {
          //retain new Percent Direct value
          this.limitTypeDefaultValues[1].value = limitValue;
        }
      } else {//Dollar Amount
        if (limitValue.length === 0 || isNaN(limitValue)) {
          limitValue = "";
        } else {
          this.setState({limitValue});
        }

        //retain new dollar amount value
        this.limitTypeDefaultValues[2].value = limitValue;
      }
  }


  render() {
    let tin = this.getTin();
    let { hops, nodes,
      limitValue, checked } = this.state;
    return (
      <div
        style={{
          top: 0,
          left: 0,
          zIndex: 2,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          height: window.innerHeight,
          width: window.innerWidth,
          position: "absolute",
        }}
        ref={(ele) => {
          this.myRef = ele;
        }}
      >
        {" "}
        <Draggable cancel=".cancelDraggable">
          <div
            style={{
              top: "25%",
              position: "relative",
              margin: "auto",
              textAlign: "center",
              background: "white",
              width: 420,
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
              <span>
                <SVG
                  onClearText={this.props.onHandleClose}
                  styleObj={{
                    float: "right",
                    position: "relative",
                    color: "grey",
                    border: "1px solid grey",
                    borderRadius: 3,
                  }}
                />
              </span>
              <div>
                <b style={{ fontSize: 18 }}>Expand Graph for {tin} </b>
              </div>
            </div>
            <div className="cancelDraggable" style={{ padding: 10 }}>
              Expand Graph Options:
            </div>
            <div
              style={{
                border: "1px solid grey",
                height: "auto",
                padding: "15px",
                float: "none",
                margin: "auto",
                width: "97%",
              }}
              className="cancelDraggable"
            >
              <div
                className="usa-width-one-half"
                style={{ textAlign: "left", padding: 5 }}
              >
                <label htmlFor="interfaceSlider">Number of Hops:</label>
              </div>
              <div className="usa-width-one-half" style={{ margin: 0 }}>
                <span style={{ float: "left" }}> {hops}</span>
                <input
                  type="range"
                  name="interfaceSlider"
                  value={hops}
                  min="0"
                  max="10"
                  onChange={this.handleHopsChange}
                  style={{
                    width: "80%",
                    marginLeft: "10%",
                    marginTop: "-12px",
                  }}
                />
              </div>
              <br />
              <br />
              <div
                className="usa-width-one-half"
                style={{ textAlign: "left", padding: 5 }}
              >
                <label htmlFor="nodeInput"> Group Node Threshold: </label>
              </div>
              <div
                className="usa-width-one-half"
                style={{ margin: 0, paddingBottom: 10 }}
              >
                <textarea
                  style={{
                    width: 75,
                    height: 44,
                  }}
                  value={nodes}
                  // placeholder="Enter Tin(s)"
                  onChange={this.handleNodeChange}
                />
              </div>
              <div className="usa-width-one-whole"
                style={{
                  textAlign: "left",
                  paddingBottom: "10px",
                  paddingTop:"10px"
                }}
              >
                <CheckBoxBase
                  style={{ display: "inline-block", height: 0}}
                  defaultChecked={this.state.checked}
                  onChange={this.handleCheckedChange}
                  name="Use Traversal Parameters"
                  label="Use Traversal Parameters"
                />
            </div>
            { checked && (
              <div className="usa-width-one-whole">
                <div className="usa-width-one-half"
                style={{ textAlign: "left", marginTop: "5px", paddingLeft: 5 }}>
                  <label>Limit Type:  </label>
                </div>
                <div className="usa-width-one-half" style={{paddingBottom: "5px" }}>
                      <MultiSelectBase
                        multiselectOptions={this.limitTypeOptions}
                        onMultiselectChange={this.handleLimitTypeChange}
                        selectedOption={this.state.selectedLimitTypeOption}
                      />
                </div>
              </div>
            )}
            { checked && (
              <div className="usa-width-one-whole">
                <div className="usa-width-one-half" style={{  textAlign: "left", paddingLeft: 5 }}>
                  <label>Limit Value:   </label>
                </div>

                <div className="usa-width-one-half" style={{paddingBottom: "5px" }}>
                  <input
                    type="text"
                    style={{
                      width: 85,
                      height: 30,
                    }}
                    value={limitValue}
                    onChange={(e) => {
                      this.handleLimitValueChange(e)
                    }}
                    onMouseLeave={this.handleLimitValueMouseOut}
                  />
                </div>
              </div>
            )}
            { checked && (
              <div className="usa-width-one-whole">
                <div className="usa-width-one-half" style={{ textAlign: "left", paddingLeft: 5, paddingBottom: "5px" }}>
                  <label>Limit Direction:   </label>
                </div>
                <div className="usa-width-one-half">
                  <MultiSelectBase
                    multiselectOptions={this.limitDirOptions}
                    onMultiselectChange={this.handleLimitDirChange}
                    selectedOption={this.state.selectedLimitDirOption}
                  />
                </div>
              </div>
            )}
            <br />
            <br />
            <div style={{ textAlign: "center", padding: 5 }}>
              <button
                className="btn btn-lg text-center"
                type="submit"
                style={{
                  padding: 17,
                  backgroundColor: "#2e8540",
                  color: "white",
                  marginRight: "13%",
                  borderRadius: "7px",
                  marginTop: "5px"
                }}
                onClick={() => {
                  this.props.onExpandGraph(this.state.hops, this.state.nodes,this.state.selectedLimitTypeOption.value,this.state.limitValue,this.state.selectedLimitDirOption.value);
                }}
              >
                Draw
              </button>
              <button
                className="btn btn-lg text-center"
                type="submit"
                style={{
                  padding: 17,
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
          </div>
        </Draggable>
      </div>
    );
  }
}

export default ExpandGraph;
