import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExpandArrowsAlt,
  faWindowMinimize
} from "@fortawesome/free-solid-svg-icons";
import { detectIE } from "../utils/utils";

class CompareGraphTab extends Component {
  state = {
    isFull: false,
    cyto: null,
    slideToggler: false,
    slideClass: "initSlideClass",
    displaySlider: { display: "none" }
  };
  constructor(props) {
    console.log(props.graphArray);
    super(props);
    this.myRef = React.createRef();
    this.state.height = window.innerHeight * 0.5 - 10;
  }
  componentDidMount() {
    console.log("mounting");
    let graphArray = [...this.props.graphArray];
    let parentWindow = document.getElementById("cyMain");
    let height = window.innerHeight * 0.5;
    height = height * 0.83;
    let width = window.innerWidth * 0.48;
    if (graphArray.length > 2) {
      //splice, send away aeach part
      let doubleRowData = graphArray.splice(2);
      let parentWindow = document.getElementById("cySecondDivArea");
      this.getDoubleRow(doubleRowData, parentWindow, height, width, false);
    } //blank param adds 2 blank lower rows
    else {
      let parentWindow = document.getElementById("cySecondDivArea");
      this.getDoubleRow(null, parentWindow, height, width, true);
    }

    this.getSingleRow(graphArray, parentWindow, height, width);
    this.addListeners();
    this.props.loadCurrentCyto(null);
  }

  componentDidUpdate() {
    console.log("updating");
    if (!this.getFullScreen()) this.adjustGraphHeight(false);
    // this.updateStats();
  }
  componentWillUnmount() {
    console.log("unmounting");
    //need to remove listeners when unmounting so as to not upset react
    document.removeEventListener(
      "webkitfullscreenchange",
      this.exitHandler,
      false
    );
    document.removeEventListener(
      "mozfullscreenchange",
      this.exitHandler,
      false
    );
    document.removeEventListener("fullscreenchange", this.exitHandler, false);
    document.removeEventListener("MSFullscreenChange", this.exitHandler, false);
  }
  addListeners = () => {
    document.addEventListener(
      "webkitfullscreenchange",
      this.exitHandler,
      false
    );
    document.addEventListener("mozfullscreenchange", this.exitHandler, false);
    document.addEventListener("fullscreenchange", this.exitHandler, false);
    document.addEventListener("MSFullscreenChange", this.exitHandler, false);
  };
  setDivTitles = (parent, graphObj) => {
    let subParent = document.createElement("div");
    subParent.style.textAlign = "center";
    subParent.style.position = "absolute";
    subParent.style.width = "100%";
    subParent.style.top = 0;
    parent.appendChild(subParent);
    subParent.innerHTML += "<b>Tin</b>: " + graphObj.initTin;
    subParent.innerHTML += " <b>Tax Year</b>: " + graphObj.taxYear;
    subParent.innerHTML += " <b>Nodes:</b> " + graphObj.numNodes;
    subParent.innerHTML += " <b>Links: </b>" + graphObj.numEdges;
  };
  getSingleRow = (graphArray, parentWindow, height, width) => {
    for (let i = 0; i < graphArray.length; i++) {
      let cytoDiv = graphArray[i].cytoDiv;
      cytoDiv.style.border = "1px solid black";
      cytoDiv.style.height = height + "px";
      cytoDiv.style.width = width + "px";
      cytoDiv.id = "single" + i;
      parentWindow.appendChild(cytoDiv);
      this.setDivTitles(cytoDiv, graphArray[i]);
      /**
       *    if (isNaN(this.props.cyto.width()) || this.props.cyto.width() === 0) {
      this.props.cyto.resize();
      this.props.cyto.fit(50);
    }
       */
      //makes graph resize appropriately onload
      if (
        isNaN(graphArray[i].cyto.width()) ||
        graphArray[i].cyto.width() === 0
      ) {
        graphArray[i].cyto.resize();
        graphArray[i].cyto.fit(20);
      }
    }
  };
  getDoubleRow = (graphArray, parentWindow, height, width, blank) => {
    if (!blank) {
      for (let i = 0; i < graphArray.length; i++) {
        // if (i === 1) {
        //   width = width - 12 - 31;
        //   console.log(width);
        // }
        // console.log(width);
        let cytoDiv = graphArray[i].cytoDiv;
        cytoDiv.style.border = "1px solid black";
        cytoDiv.style.height = height + "px";
        cytoDiv.style.width = width + "px";
        cytoDiv.style.minWidth = width + "px";
        cytoDiv.style.maxWidth = width + "px";
        cytoDiv.id = "double" + i;
        parentWindow.appendChild(cytoDiv);
        this.setDivTitles(cytoDiv, graphArray[i]);
        if (
          isNaN(graphArray[i].cyto.width()) ||
          graphArray[i].cyto.width() === 0
        ) {
          graphArray[i].cyto.resize();
          graphArray[i].cyto.fit(20);
        }
      }
      //adding fourth box makes overall look more uniform
      if (graphArray.length === 1)
        this.addBlankCell(parentWindow, height, width, ["double1"]);
    } else
      this.addBlankCell(parentWindow, height, width, ["double0", "double1"]);
  };
  addBlankCell = (parentWindow, height, width, cellNames) => {
    for (let i = 0; i < cellNames.length; i++) {
      let cytoDiv = document.createElement("div");
      cytoDiv.style.border = "1px solid black";
      cytoDiv.style.height = height + "px";
      cytoDiv.style.width = width + "px";
      cytoDiv.id = cellNames[i];
      parentWindow.appendChild(cytoDiv);
    }
  };
  exitHandler = e => {
    let isFull = this.getFullScreen();
    this.setState({ isFull: isFull });
  };

  updateStats = () => {
    // let id = this.props.graphId;
    // document.getElementById("tinDisplay").innerHTML =
    //   "<b>Tin</b>: " + YK1.GRAPHS[id].initTin;
    // document.getElementById("yearDisplay").innerHTML =
    //   "<b>Tax Year</b>: " + YK1.GRAPHS[id].taxYear;
    // let numNodes =
    //   YK1.getAllRegularNodes(id, 0).length + YK1.getAllGroupNodes(id).length;
    // let numEdges = YK1.getEntityGroupEdgeCount(id);
    // document.getElementById("nodesDisplay").innerHTML =
    //   "<b>Nodes:</b> " + numNodes;
    // document.getElementById("linksDisplay").innerHTML =
    //   "<b>Links: </b>" + numEdges;
  };
  toggleSlider = () => {
    let { displaySlider } = this.state;
    if (displaySlider.display === "none") {
      displaySlider = { display: "block" };
    } else {
      displaySlider = { display: "none" };
    }
    this.setState({ displaySlider });
  };
  closeFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      /* IE/Edge */
      document.msExitFullscreen();
    }
  };
  openFullscreen = () => {
    const elem = this.myRef.current;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE/Edge */
      elem.msRequestFullscreen();
    }
    console.log(window.innerHeight);
    this.adjustGraphHeight(true);
  };

  getFullScreen = () => {
    if (
      document.fullscreenElement ||
      document.msFullscreenElement ||
      document.webkitIsFullScreen ||
      document.fullscreenElement
    ) {
      return true;
    } else {
      return false;
    }
  };
  adjustGraphHeight = isFull => {
    let ieVersion = detectIE();
    let height = window.innerHeight * 0.53 + "px";
    if (!isFull) {
      height = window.innerHeight * 0.41 + "px";
      if (ieVersion) height = window.innerHeight * 0.36 + "px";
    }
    let topDiv1 = document.getElementById("single0");
    let topDiv2 = document.getElementById("single1");
    topDiv1.style.height = height;
    topDiv2.style.height = height;
    let bottomDiv1 = document.getElementById("double0");
    let bottomDiv2 = document.getElementById("double1");
    if (bottomDiv1) bottomDiv1.style.height = height;
    if (bottomDiv2) bottomDiv2.style.height = height;
  };
  render() {
    let fullScreen = this.getFullScreen();
    let buttonStyle = { top: fullScreen ? 6 : 45 };
    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    return (
      <div ref={this.myRef} style={{ backgroundColor: "white" }}>
        <span id="yearDisplay" /> <span id="tinDisplay" />{" "}
        <span id="nodesDisplay" /> <span id="linksDisplay" />
        <div
          id="cyMain"
          style={{
            marginTop: 35,
            display: "flex",
            height: "auto",
            backgroundColor: "white"
          }}
        />
        <div
          id="cySecondDivArea"
          style={{
            display: "flex",
            height: "auto",
            backgroundColor: "white"
          }}
        />
        {!isIE11 && (
          <button
            style={{ position: "absolute", right: 0, ...buttonStyle }}
            onClick={() => {
              if (fullScreen) {
                this.closeFullscreen();
              } else {
                this.openFullscreen();
              }
            }}
          >
            {this.state.isFull ? (
              <FontAwesomeIcon icon={faWindowMinimize} />
            ) : (
              <FontAwesomeIcon icon={faExpandArrowsAlt} />
            )}
          </button>
        )}
        {/* <div className={this.state.slideClass} style={{ textAlign: "center" }}>
          <div
            style={{
              borderBottom: "1px solid grey",
              padding: 5
            }}
          >
            Slide Out Menu
          </div>
          <div style={{ borderBottom: "1px solid grey" }}>Menu Option</div>
          <div style={{ borderBottom: "1px solid grey" }}>Menu Option</div>
          <div style={{ borderBottom: "1px solid grey" }}>Menu Option</div>
        </div> */}
        {/* <button
          style={{ position: "absolute", right: 61, top: 45 }}
          onClick={() => {
            let { slideClass } = this.state;
            if (slideClass === "slideInModal") {
              slideClass = "slideOutModal";
            } else {
              slideClass = "slideInModal";
            }
            this.setState({ slideClass });
            this.toggleSlider();
          }}
        >
          =
        </button> */}
      </div>
    );
  }
}

export default CompareGraphTab;

// Yk1GraphContent.propTypes = {
//   onNextGraphId: PropTypes.func.isRequired,
//   formData: PropTypes.shape({
//     depth: PropTypes.number.isRequired,
//     group: PropTypes.number.isRequired,
//     taxYears: PropTypes.array.isRequired,
//     tins: PropTypes.string.isRequired,
//     type: PropTypes.string.isRequired,
//     window: PropTypes.string.isRequired
//   }).isRequired,
//   currentLayout: PropTypes.string.isRequired,
//   changeGraphId: PropTypes.func.isRequired
// };
