import React, { Component } from "react";
import YK1 from "../../js/yk1/yk1";

class CompareGraphPopup extends Component {
  state = {
    selections: []
  };
  getTinYearArray = () => {
    let returnArray = [];
    let { graphArray } = this.props;
    graphArray.forEach(item => {
      let tin = YK1.GRAPHS[item.graphId].initTin;
      let taxYear = YK1.GRAPHS[item.graphId].taxYear;
      returnArray.push({ tin: tin, year: taxYear, graphId: item.graphId });
    });
    return returnArray;
  };
  compareGraph = () => {
    let selections = this.state.selections;
    if (selections.length > 4) {
      alert("Graph Limit is 4");
    } else {
      this.props.compareGraph(this.state.selections);
    }
  };
  addRemoveSelection = e => {
    let graphArray = [...this.props.graphArray];
    let selections = [...this.state.selections];

    let flag = false;
    let selection = null;
    //get selection from grapharray
    graphArray.forEach(item => {
      if (+item.graphId === +e.target.id) {
        selection = item;
      }
    });
    if (selections.length) {
      //check selections for selection
      selections.forEach(item => {
        if (+item.graphId === +e.target.id) {
          flag = true;
        }
      });
      //if does not have value, push value, if not, remove
      if (!flag) {
        selections.push(selection);
      } else {
        selections = selections.filter(item => {
          return +item.graphId !== +e.target.id;
        });
      }
    } else {
      selections.push(selection);
    }
    this.setState({ selections });
  };
  render() {
    let tinYearArray = this.getTinYearArray();
    let { onClose } = this.props;
    return (
      <div
        style={{
          zIndex: 2,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          height: "100%",
          width: "100%",
          position: "absolute"
        }}
      >
        <div
          style={{
            top: "25%",
            position: "relative",
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
            <b style={{ fontSize: 18 }}>Select Graphs To Compare</b>
          </div>
          <div>
            <b>Select at least 2 graphs to compare:</b>
          </div>
          <ul
            style={{
              paddingLeft: 2,
              minHeight: "150px",
              listStyleType: "none",
              textAlign: "left",
              overflow: "scroll",
              maxHeight: 350,
              width: 275,
              margin: "auto",
              float: "none",
              border: "1px solid lightgrey"
            }}
          >
            {tinYearArray.map((item, index) => {
              return (
                <li
                  key={index}
                  style={{ display: "inline-block", textAlign: "left" }}
                >
                  <input
                    type="checkbox"
                    id={item.graphId}
                    onClick={this.addRemoveSelection}
                  />
                  Tin:{item.tin} Year:{item.year}
                </li>
              );
            })}
          </ul>
          <div style={{ borderBottom: "1px solid grey" }} />
          <div style={{ textAlign: "center", padding: 5 }}>
            <button
              className="btn btn-lg text-center"
              type="submit"
              style={{
                padding: 17,
                backgroundColor: "#2e8540",
                color: "white",
                marginRight: "13%",
                borderRadius: "7px"
              }}
              onClick={this.compareGraph}
            >
              Compare
            </button>
            <button
              className="btn btn-lg text-center"
              type="submit"
              style={{
                padding: 17,
                backgroundColor: "black",
                color: "white",
                borderRadius: "7px"
              }}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CompareGraphPopup;
