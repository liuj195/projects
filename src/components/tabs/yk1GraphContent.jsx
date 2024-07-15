import React, { Component } from "react";
import YK1 from "../../js/yk1/yk1";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone, faWindowMinimize } from "@fortawesome/free-solid-svg-icons";
import ExpandGraph from "../popups/expandGraph";
import NewGraph from "../popups/newGraph";
import Loading from "../popups/loading";
import FullScreen from "../utils/fullScreen";
import ToolTip from "../tooltips/tooltips";
import ReactDOM from "react-dom";
import { createNodeDivs } from "../utils/utils";

class Yk1GraphContent extends Component {
  state = {
    displayLoading: false,
    newGraphNode: null,
    showNewGraph: false,
    expandGraphNode: null,
    showExpandGraph: false,
    isFull: false,
    cyto: null,
    slideToggler: false,
    slideClass: "initSlideClass",
    displaySlider: { display: "none" },
    visGraph: null,
  };

  constructor(props) {
    super(props);
    let width = window.innerWidth;
    let height = window.innerHeight * 0.9;
    this.myRef = React.createRef();
    this.myCyRef = React.createRef();
    this.state.height = height;
    this.state.width = width;
    this.state.graphId = props.graphId;
  }

  exitHandler = (e) => {
    let isFull = FullScreen.getFullScreen();
    this.setState({ isFull: isFull });
  };

  componentDidMount() {
    this.mountingProcedure();
    //add delete keydown detection for removal of nodes via keyboard
    document.addEventListener("keydown", this.addKeyboardBindings);
  }
  addKeyboardBindings = (e) => {
    let that = this;
    if (e.key === "Delete") {
      let selectedNodes = that.props.cyto.nodes(":selected");
      for (let i = 0; i < selectedNodes.length; i++) {
        YK1.deleteAttachedGroupNodes(
          that.props.graphId,
          that.props.cyto,
          selectedNodes[i].data("id")
        );
        YK1.deleteNode(
          that.props.graphId,
          selectedNodes[i].data("id"),
          that.props.cyto
        );
      }
    }
  };

  mountingProcedure = () => {
    YK1.newGraphFromNode = this.newGraphFromNode;
    YK1.expandGraphFromNode = this.expandGraphFromNode;
    let { cytoDiv } = this.props;
    cytoDiv.style.height = window.innerHeight * 0.9 - 60 + "px";
    cytoDiv.style.width = window.innerWidth - 20 + "px";
    document.getElementById("cyMain").appendChild(cytoDiv);
    document.addEventListener(
      "webkitfullscreenchange",
      this.exitHandler,
      false
    );
    document.addEventListener("mozfullscreenchange", this.exitHandler, false);
    document.addEventListener("fullscreenchange", this.exitHandler, false);
    document.addEventListener("MSFullscreenChange", this.exitHandler, false);

    this.updateStats();
    //I have no idea why the bug exists but these 2 lines solve it
    // if removed, when using full screen, adjacent tab graphs will become invisible
    cytoDiv.style.position = "relative";
    cytoDiv.style.position = "absolute";
    this.props.loadCurrentCyto(this.props.cyto);
    if (isNaN(this.props.cyto.width()) || this.props.cyto.width() === 0) {
      this.props.cyto.resize();
      this.props.cyto.fit(50);
    }
    /**
     * Lines below are used specifically with cytoscape context menu
     * Remove context menu from document body
     * Attach context menu to cytoscape
     * purpose is to be able to see context menu's in full screen mode
     * otherwise context menu is attached to document.body and not visible in fullscreen
     */

    //attach context menu
    YK1.attachContext(this.props.cyto, this.props.graphId);
    let contextMenu = document.getElementsByClassName(
      "cy-context-menus-cxt-menu"
    )[0];
    if (contextMenu) {
      let outerCyDiv = document.getElementById("outerCyDiv");
      // document.removeChild(contextMenu);
      // document.appendChild(outerCyDiv);
      contextMenu.parentElement.removeChild(contextMenu);
      outerCyDiv.appendChild(contextMenu);
    }

    this.drawCanvas();
    this.removeEdgeLabels();
    this.setPanzoomTooltip();
    //custom scripts, converting cytoscape node titles to DOM nodes
    //this script is injecting DOM nodes into the nodeHtmlLabel component
    // createNodeDivs(this.props.cyto.nodes(), this.props.cyto);
  };

  componentDidUpdate() {
    if (this.state.graphId !== this.props.graphId) {
      //before mounting procedure, remove old cy and context menu,
      //this is for a specific case when closing a tab that your currently on.
      let oldCy = document.getElementById("cy");
      oldCy.parentElement.removeChild(oldCy);

      this.mountingProcedure();
      this.setState({ graphId: this.props.graphId });
    }
    this.updateStats();
  }

  componentWillUnmount() {
    //make sure context menues are closed
    FullScreen.closeContextMenu();
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
    document.removeEventListener("keydown", this.addKeyboardBindings);
  }
  setPanzoomTooltip = () => {
    let panzoomreset = document.getElementsByClassName("cy-panzoom-reset")[0];
    let divEle = document.createElement("div");
    divEle.id = "panzoomFitEle";
    divEle.style.position = "absolute";
    divEle.style.top = "-3px";
    divEle.style.right = "-12px";
    panzoomreset.appendChild(divEle);
    ReactDOM.render(
      <div>
        <ToolTip id="panzoomFit" />
      </div>,
      document.getElementById("panzoomFitEle")
    );
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

  updateStats = () => {
    let id = this.props.graphId;
    let tinTitle = YK1.getTinTitle(id);

    document.getElementById("tinDisplay").innerHTML = "<b>Tin</b>: " + tinTitle;
    document.getElementById("yearDisplay").innerHTML =
      "<b>Tax Year</b>: " + YK1.GRAPHS[id].taxYear;
    let numNodes =
      YK1.getAllRegularNodes(id, 0).length + YK1.getAllGroupNodes(id).length;
    let numEdges = YK1.getEntityGroupEdgeCount(id);
    document.getElementById("nodesDisplay").innerHTML =
      "<b>Nodes:</b> " + numNodes;
    document.getElementById("linksDisplay").innerHTML =
      "<b>Links: </b>" + numEdges;
  };

  expandGraphFromNode = (node) => {
    this.setState({ expandGraphNode: node }, () => {
      this.setState({ showExpandGraph: true });
    });
  };

  newGraphFromNode = (node) => {
    this.setState({ showNewGraph: true, newGraphNode: node });
  };

  handleExpandGraph = (hops, nodes, limitType, limitValue, limitDirection) => {
    let { cyto, graphId } = this.props;
    let expandGraphNode = this.state.expandGraphNode;
    YK1.getExpandGraphParams(graphId, expandGraphNode, cyto, hops, nodes, limitType, limitValue, limitDirection);
    this.handleCloseNewGraph();
  };

  handleCloseNewGraph = () => {
    this.setState({ showExpandGraph: false, showNewGraph: false });
  };

  removeEdgeLabels = () => {
    var k = this.props.cyto.$();
    k.edges().forEach((item) => {
      item.data("label", "");
    });
  };

  drawCanvas = () => {
    let graphId = this.props.graphId;

    let cy = this.props.cyto;
    //bottom layer
    const bottomLayer = cy.cyCanvas({
      zIndex: 0,
    });
    const canvas = bottomLayer.getCanvas();
    canvas.id = "drawCanvas";
    const ctx = canvas.getContext("2d");

    var k = cy.$();
    var j = cy.$();
    //remove labels from canvas
    k.edges().forEach((item) => {
      item.data("label", "");
    });
    //each cytoscape movement
    cy.on("render cyCanvas.resize", (evt) => {
      bottomLayer.resetTransform(ctx);
      bottomLayer.clear(ctx);
      bottomLayer.setTransform(ctx);
      ctx.save();
      ctx.font = "bold 14px sans-serif";
      ctx.fillStyle = "blue";
      // Draw shadows under nodes
      // ctx.fillStyle = "blue";
      // ctx.font = "bold 14px sans-serif";
      let cyEdges = YK1.buildCyEdgeArray(this.state.graphId);
      //edges on each render

      // thisCyto.edges().forEach((edge) => {
      //   if (edge.data("target") === "1123123129_201412") {
      //     console.log("HIT CYTO");
      //     console.log(edge);
      //   }
      // });
      this.props.cyto.edges().forEach((edge) => {
        let labelText = YK1.getLabelFromYk1Graph(edge, cyEdges);

        if (YK1.GRAPHS[graphId] && !YK1.GRAPHS[graphId].edgeLabels)
          labelText = "";
        //only on certain edges
        if (
          labelText &&
          labelText !== undefined &&
          labelText !== "Case SSN" &&
          labelText !== "Parent/Sub"
        ) {
          const pos_edge = edge.midpoint();
          if (
            typeof edge.data("xPercent") === "undefined" ||
            edge.data("xPercent") === "null"
          ) {
            labelText = labelText.split("\n");
            let ypos = pos_edge.y + 10;
            labelText.forEach((text) => {
              //then re-drawing edge
              ctx.beginPath();
              //constant re-drawing causes the edge labels to become "thick" so here we are drawing over everything with a white background
              //ctx.rect(pos_edge.x + 12, ypos - 12, 150, 100);
              //ctx.fillStyle = "white";
              //ctx.fill();
              ctx.font = "bold 14px sans-serif";
              ctx.fillStyle = "blue";
              ctx.fillText(text, pos_edge.x + 12, ypos);
              ypos += 13;
            });
          } else {
            /**
             * For following edge label position as edge moves
             */
            let currentTargetNode = edge.targetEndpoint();
            let currentSourceNode = edge.sourceEndpoint();
            //convert x back to pixels
            let xLength = Math.abs(currentTargetNode.x - currentSourceNode.x);
            let xInPixels = xLength * edge.data("xPercent");
            let xVal = currentSourceNode.x + xInPixels;
            //convert y back to pixels
            let yLength = Math.abs(currentTargetNode.y - currentSourceNode.y);
            let yInPixels = yLength * edge.data("yPercent");
            let yVal = currentSourceNode.y + yInPixels;
            if (currentSourceNode.x > currentTargetNode.x)
              xVal = currentSourceNode.x - xInPixels;
            if (currentSourceNode.y > currentTargetNode.y)
              yVal = currentSourceNode.y - yInPixels;
            let ypos = yVal + 10;
            labelText = labelText.split("\n");
            labelText.forEach((text) => {
              ctx.fillText(text, xVal + 12, ypos);
              ypos += 13;
            });
          }
        }
      });

      ctx.restore();
    });
  };

  //cannot use cytoscape labels because we are going to remove them from the canvas
  //must use labels from yK1's edge data
  getLabelFromYk1Graph = (edge, cyEdges) => {
    let edgeLabel = null;
    let source = edge.data("source");
    let target = edge.data("target");

    cyEdges.forEach((item) => {
      let cySource = item.data.source;
      let cyTarget = item.data.target;
      if (cySource === source && cyTarget === target)
        edgeLabel = item.data.label;
    });
    return edgeLabel;
  };
  render() {
    let { height, width } = this.state;
    height = height - 100;
    width = width - 20;
    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    return (
      <React.Fragment>
        <div
          ref={this.myRef}
          style={{ backgroundColor: "white" }}
          id="outerCyDiv"
        >
          {this.state.isFull && this.state.displayLoading ? <Loading /> : null}
          {this.state.showNewGraph ? (
            <NewGraph
              graphId={this.props.graphId}
              yk1MultiOptions={this.props.yk1MultiOptions}
              node={this.state.newGraphNode}
              onHandleClose={this.handleCloseNewGraph}
              onAddTab={this.props.onAddTab}
            />
          ) : null}

          {this.state.showExpandGraph ? (
            <ExpandGraph
              onExpandGraph={this.handleExpandGraph}
              graphId={this.props.graphId}
              node={this.state.expandGraphNode}
              onHandleClose={this.handleCloseNewGraph}
            />
          ) : null}

          <span id="cyGraphInfo" style={{ backgroundColor: "lightblue" }}>
            <span id="yearDisplay" /> <span id="tinDisplay" />{" "}
            <span id="nodesDisplay" /> <span id="linksDisplay" />
          </span>
          <div
            id="cyMain"
            ref={this.myCyRef}
            style={{
              height: height,
              width: width,
              backgroundColor: "white",
            }}
          />

          {!isIE11 && (
            <React.Fragment>
              <div
                id="fullscreenicon"
                style={{ position: "absolute", right: 0, top: 45, zIndex: 1 }}
              >
                <button
                  style={{ display: "inline-block" }}
                  onClick={() => {
                    let fullScreen = FullScreen.getFullScreen();
                    if (fullScreen) {
                      FullScreen.closeFullscreen();
                    } else {
                      FullScreen.openFullscreen(this.myRef.current);
                    }
                  }}
                >
                  {this.state.isFull ? (
                    <FontAwesomeIcon icon={faWindowMinimize} />
                  ) : (
                    <FontAwesomeIcon icon={faClone} />
                  )}
                </button>
                <div
                  style={{
                    display: "inline-block",
                    float: "right",
                    paddingRight: 5,
                  }}
                >
                  <ToolTip id="FullScreen" />
                </div>
              </div>
              {/* <button
                style={{
                  position: "absolute",
                  right: 58,
                  top: 45,
                  zIndex: 1
                }}
                onClick={() => {
                  this.printToPdf();
                }}
              >
                Save As PDF
              </button> */}
            </React.Fragment>
          )}
          {/* <button
            style={{
              position: "absolute",
              bottom: 10,
              zIndex: 999
            }}
            onClick={() => {
              this.drawCanvas();
            }}
          >
            cyto-canvas demo
          </button> */}
          {/* <div
            className={this.state.slideClass}
            style={{ textAlign: "center" }}
          >
            <div
              style={{
                borderBottom: "1px solid grey",
                padding: 5,
              }}
            >
              Slide Out Menu
            </div>
            <div style={{ borderBottom: "1px solid grey" }}>Menu Option</div>
            <div style={{ borderBottom: "1px solid grey" }}>Menu Option</div>
            <div style={{ borderBottom: "1px solid grey" }}>Menu Option</div>
          </div> */}
          {/* slide out button <button
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
      </React.Fragment>
    );
  }
}

export default Yk1GraphContent;

// Yk1GraphContent.propTypes = {};

// RadioButton.propTypes = {
//   onChange: PropTypes.func.isRequired,
//   name: PropTypes.string.isRequired,
//   checked: PropTypes.bool.isRequired
// };
