import { Random } from "../utilityJS/xorshift128";
import K1Constants from "../yk1/K1Constants";
import jquery from "jquery";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import cola from "cytoscape-cola";
import contextMenus from "cytoscape-context-menus";
import "cytoscape-context-menus/cytoscape-context-menus.css";
import panzoom from "cytoscape-panzoom";
import "../../css/cytoscape.js-panzoom.css";
import "../../css/fontawesome-free-5.8.1-web/css/all.css";
import "../../css/fontawesome-free-5.8.1-web/js/all.js";
import popper from "cytoscape-popper";
import tippy from "tippy.js";
import cyCanvas from "cytoscape-canvas";
import { getCombinedCanvasPNG, detectIE } from "../../components/utils/utils";
import nodeHtmlLabel from "cytoscape-node-html-label";
import edgeBendEditing from "cytoscape-edge-bend-editing";
import edgeEditing from "cytoscape-edge-editing";
import {
  createNodeDivs,
  addEdgeDivs,
  removeElementDivs,
} from "../../components/utils/domTreePrinting";

// Register extensions
cyCanvas(cytoscape);
nodeHtmlLabel(cytoscape);
cytoscape.use(popper);
panzoom(cytoscape);
contextMenus(cytoscape, jquery);
edgeEditing(cytoscape, jquery);

console.log("main");

const graphMain = function(G) {
  let panZoomDefaults = {
    zoomFactor: 0.05, // zoom factor per zoom tick
    zoomDelay: 45, // how many ms between zoom ticks
    minZoom: 0.1, // min zoom level
    maxZoom: 10, // max zoom level
    fitPadding: 50, // padding when fitting
    panSpeed: 10, // how many ms in between pan ticks
    panDistance: 10, // max pan distance per tick
    panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
    panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
    panInactiveArea: 8, // radius of inactive area in pan drag box
    panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
    zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
    fitSelector: undefined, // selector of elements to fit
    animateOnFit: function() {
      // whether to animate on fit
      return false;
    },
    fitAnimationDuration: 1000, // duration of animation on fit

    // icon class names
    sliderHandleIcon: "fa fa-minus",
    zoomInIcon: "fa fa-plus",
    zoomOutIcon: "fa fa-minus",
    resetIcon: "fa fa-expand",
  };
  //default options for edgeBendDefaults
  let edgeBendDefaults = {
    // this function specifies the positions of bend points
    bendPositionsFunction: function(ele) {
      console.log("init edge bend");
      return ele.data("bendPointPositions");
    },
    // whether to initilize bend points on creation of this extension automatically
    initBendPointsAutomatically: false,
    // whether the bend editing operations are undoable (requires cytoscape-undo-redo.js)
    undoable: false,
    // the size of bend shape is obtained by multipling width of edge with this parameter
    bendShapeSizeFactor: 6,
    // whether to start the plugin in the enabled state
    enabled: true,
    // title of add bend point menu item (User may need to adjust width of menu items according to length of this option)
    addBendMenuItemTitle: "Add Bend Point",
    // title of remove bend point menu item (User may need to adjust width of menu items according to length of this option)
    removeBendMenuItemTitle: "Remove Bend Point",
    // whether the bend point can be moved by arrow keys
    moveSelectedBendPointsOnKeyEvents: function() {
      return true;
    },
  };

  G.R = new Random(Math.floor(10000000 * Math.random()));
  G.DEBUG = false;
  G.GRAPHS = [];
  G.GRAPHS[0] = null;
  G.ACTIVE_GRAPH = 0;
  G.V = null;
  G.E = null;
  G.taxYear = null;
  G.nextIndex = 0;
  G.compareIndex = 0;

  // users can draw the same graph (tin/tax year) but if they have two, we'll diff
  // based on the index
  G.init = function(
    limitType,
    limitValue,
    limitDirection,
    taxYear,
    initTin,
    graphId
  ) {
    G.GRAPHS[graphId] = new G.Graph(graphId);
    G.GRAPHS[graphId].E = [];
    G.GRAPHS[graphId].V = [];
    G.GRAPHS[graphId].taxYear = taxYear;
    G.GRAPHS[graphId].initTin = initTin;
    G.GRAPHS[graphId].limitType = limitType;
    G.GRAPHS[graphId].limitValue = limitValue;
    G.GRAPHS[graphId].limitDirection = limitDirection;
    // G.GRAPHS[i].id = initTin + "|" + taxYear;
    G.GRAPHS[graphId].openGraphs = 0;
    G.GRAPHS[graphId].id = graphId;
  };

  G.clear = function() {
    G.V = [];
    G.E = [];
    G.NUM_NODES = 0;
    G.SELECT_VERTEX = null;
    G.taxYear = null;
  };
  G.addGraph = function(
    graphId,
    taxYear,
    initTin,
    limitType,
    limitValue,
    limitDirection
  ) {
    G.init(limitType, limitValue, limitDirection, taxYear, initTin, graphId);
  };

  G.addCompareGraphs = function() {
    var index = G.compareIndex++;

    return index;
  };

  G.setTaxYear = function(taxYear) {
    G.taxYear = taxYear;
    G.GRAPHS[0].taxYear = taxYear;
  };

  G.buildCyNodeArray = function(graphId) {
    var cyNodes = [];
    for (var nodeId in G.GRAPHS[graphId].V) {
      if (
        G.GRAPHS[graphId].V[nodeId] != null &&
        G.GRAPHS[graphId].V.hasOwnProperty(nodeId)
      ) {
        // if (G.GRAPHS[graphId].V[nodeId].data["nodeType"] === "NODE") {
        //   cyNodes.push(G.createParentNode(G.GRAPHS[graphId].V[nodeId]));
        // }

        cyNodes.push(G.nodeToCyNode(G.GRAPHS[graphId].V[nodeId]));
      }
    }

    return cyNodes;
  };

  G.buildCyEdgeArray = function(graphId) {
    var currentGraph = G.GRAPHS[graphId];
    if (currentGraph) {
      var cyEdges = [];
      for (var i = 0; i < currentGraph.E.length; i++) {
        cyEdges[i] = {};
        cyEdges[i].data = {};
        cyEdges[i].data.source = currentGraph.E[i].a;
        cyEdges[i].data.target = currentGraph.E[i].b;

        // edge color
        G.cyEdgeSetColor(cyEdges[i], currentGraph.E[i]);

        // edge style (solid, dotted, etc)
        G.cyEdgeSetStyle(cyEdges[i], currentGraph.E[i]);
        // TODO

        if (
          currentGraph.E[i].data["linkType"] !== null &&
          currentGraph.E[i].data["linkType"] !== "GROUP"
        ) {
          cyEdges[i].data.label = currentGraph.E[i].data["label"];
        }
        // set edge thickness
        cyEdges[i].data.width = currentGraph.E[i].data["thickness"];

        if (
          currentGraph.E[i].data["linkType"] ===
            K1Constants.LINK_TYPE_ADDRESS ||
          currentGraph.E[i].data["linkType"] === K1Constants.LINK_TYPE_PREPARER
        ) {
          cyEdges[i].data.width = 1;
        }

        // set tax year
        cyEdges[i].data.taxYear = currentGraph.E[i].data["year"];
        cyEdges[i].data.linkType = currentGraph.E[i].data["linkType"];
        // console.log(cyEdges[i]);
      }
      return cyEdges;
    }
  };

  G.print = async function(cy, graphId, isFull) {
    //begin create DOM structure
    let isIe = detectIE();
    // console.log(isIe);
    console.log(cy);
    console.log(isFull);
    let currentZoom = cy.zoom();
    let currentPan = cy.pan();

    if (isFull) {
      cy.fit(cy.elements(), 50);
    }

    if (!isIe || isIe > 11) {
      addEdgeDivs(graphId, cy.edges(), cy);
      createNodeDivs(cy.nodes(), graphId, cy);
    } else {
      getCombinedCanvasPNG(cy, graphId, isFull);
      return;
    }
    //remove panzoom, context menus, icons
    document.getElementsByClassName("cy-panzoom")[0].style.display = "none";
    document.getElementsByClassName(
      "cy-context-menus-cxt-menu"
    )[0].style.display = "none";
    document.getElementById("fullscreenicon").style.display = "none";

    var mywindow = window.open("", "PRINT");
    mywindow.document.write(
      "<html><head><title>" + document.title + "</title>"
    );
    mywindow.document.write("</head><body >");
    mywindow.document.write("<h1>" + document.title + "</h1>");
    mywindow.document.write(document.getElementById("outerCyDiv").innerHTML);
    mywindow.document.write("</body></html>");
    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/
    //get node in new window

    //set haven node inner texts to white
    let havenNodes = mywindow.document.getElementsByClassName("havenNode");
    for (let i = 0; i < havenNodes.length; i++) {
      havenNodes[i].style.color = "white";
      havenNodes[i].style.fontWeight = "white";
    }
    if (mywindow) {
      setTimeout(function() {
        // need to delay printing because print fires before popup is loaded resulting in a blank screen or missing address/preparer node png images
        mywindow.print();
        mywindow.close();
      }, 500);
    }

    removeElementDivs(cy, graphId);
    document.getElementsByClassName("cy-panzoom")[0].style.display = "block";
    document.getElementById("fullscreenicon").style.display = "block";
    // document.getElementsByClassName(
    //   "cy-context-menus-cxt-menu"
    // )[0].style.display = "block";

    if (isFull) {
      cy.zoom(currentZoom);
      cy.pan(currentPan);
    }
    return true;
  };
  G.printCallback = function(id, imageData) {
    // open new window with image of the gr aph
    // NOTE not using options right now. default print full graph

    let tin = G.GRAPHS[id].initTin;
    let year = G.GRAPHS[id].taxYear;

    let HTMLstring = "<HTML>\n";
    HTMLstring += "<HEAD>\n";
    HTMLstring += "<TITLE></TITLE>\n";
    HTMLstring +=
      "<style>.imgHolder{position: relative;top:50%} .imgHolder span{position:absolute;}</style>\n";
    HTMLstring += "</HEAD>\n";
    HTMLstring += "<BODY>\n";
    HTMLstring += "<div class='imgHolder'>";
    HTMLstring += "<div>Graph for " + tin + " " + year + "</div>";
    HTMLstring += '<img src="' + imageData + '"height="460px"/></div>';
    HTMLstring += "</BODY>\n";
    HTMLstring += "</HTML>";

    /*
     * These config settings for the new window removes all scrollbar/toolbar/navigation controls from the browser
     * So then, it becomes like another "window"
     */

    let config =
      "toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, " +
      "directories=no, status=no";
    var newWindow = window.open("", "My New Window", config);
    if (newWindow) {
      newWindow.document.write(HTMLstring);
      setTimeout(function() {
        // need to delay printing because print fires before popup is loaded resulting in a blank screen
        newWindow.document.close();
        newWindow.focus();
        newWindow.print();
      }, 300);
    }
  };

  G.resetGraph = function(graphId, cy, layoutName) {
    console.log("resetting");
    var cyNodes = G.buildCyNodeArray(graphId);
    var cyEdges = G.buildCyEdgeArray(graphId);
    cy.elements().remove();

    cy.add({
      nodes: cyNodes,
      edges: cyEdges,
    });
    let layout = cy.elements().layout({
      name: layoutName,
      fit: true,
      nodeSep: 35,
      rankSep: 45,
      edgeSep: 28,
      universalSep: true,
      ranker: "network-simplex",
      padding: 30,
      animate: true,
      animationDuration: 500,
      nodeDimensionsIncludeLabels: true,
    });
    layout.run();
  };
  /**
   * let cyto = G.loadCyto(
      graphId,
      cytoDiv,
      true,
      true,
      handleAddRTF,
      newGraphFromNode,
      expandGraphFromNode
    );
   */
  G.loadCyto = function(graphId, cytoDiv, addContextMenu, setPreset) {
    let layoutName = "dagre";

    if (setPreset) {
      layoutName = "preset";
    }
    var cyNodes = G.buildCyNodeArray(graphId);
    var cyEdges = G.buildCyEdgeArray(graphId);
    cytoscape.use(dagre);
    cytoscape.use(cola);
    let cy = cytoscape({
      //container: document.getElementById("cy"),
      container: cytoDiv,
      boxSelectionEnabled: true,
      autounselectify: false,
      panningEnabled: true,
      layout: {
        name: layoutName,
        fit: true,
        nodeSep: 35,
        rankSep: 45,
        edgeSep: 28,
        universalSep: true,
        ranker: "network-simplex",
        //  padding: 30,
        animate: false,
        animationDuration: 500,
        nodeDimensionsIncludeLabels: true,
      },

      //wheelSensitivity: 1, // Higher sensitivity means more zoom per mousewheel tick (default 1).
      pixelRatio: 2, // This option makes the text clear, but increases render time substantially (default 1).
      minZoom: 0.05, // minZoom determines how far you can zoom out. This value was chosen by experimentation.
      maxZoom: 10, // maxZoom determines how far you can zoom in. This value was chosen by experimentation.

      style: [
        {
          // selector: "node > node",
          selector: "node",
          style: {
            "padding-top": "20px",
            "padding-left": "10px",
            "padding-bottom": "20px",
            "padding-right": "10px",
            content: "data(title)",
            "text-valign": "top",
            "text-halign": "center",
            shape: "data(shape)",
            "shape-polygon-points": "data(poly)",
            width: "data(width)",
            height: "data(height)",
            //'type': 'data(type)',
            "font-family": "sans-serif",
            //other families: Helvetica Arial sans-serif calibri verdana
            "text-opacity": 1,
            // "text-valign": "bottom",
            // "text-halign": "center",
            "text-wrap": "wrap",
            // "background-image": "angle-arrow-down.svg",
            //'text-background-padding': '25px',
            // keep background color for without SVGs, else, comment out
            "background-color": "data(backgroundColor)",
            "border-width": "data(borderWidth)",
            "border-color": "data(borderColor)",
            color: "data(contentColor)",
            "text-margin-y": -3,
            // for SVGs - not working with IE
            /*
            'background-color': '#FFF',
            'background-image-opacity': 1,
            'background-fit': 'fit'*/

            /*** lines below are for demo purposes - gives non-transparent background to nodes  ***/
            "text-background-color": "white",
            "text-background-opacity": 0,
            "text-background-shape": "roundrectangle",
          },
        },
        {
          selector: "edge",
          style: {
            width: "data(width)",
            "target-arrow-shape": "triangle",
            "line-color": "data(lineColor)",
            "line-style": "data(lineStyle)",
            "target-arrow-color": "data(lineColor)",
            // label: "data(label)",
            "text-wrap": "wrap",
            color: "data(color)",
            "source-text-offset": "7",
            //"curve-style": "unbundled-bezier",
            //'control-point-distance': '35px',
            //'control-point-weight': '0.64'
            "curve-style": "segments",
            //"segment-distances": "20 20 20",
            "arrow-scale": "1.2 ",
            "target-endpoint": "outside-to-node-or-label",
            "source-endpoint": "outside-to-node-or-label",
            "control-point-step-size": "80px",
            // "edge-distances": "100"
          },
        },
        {
          selector: "[linkType='K1']",
          style: {
            label: "data(label)",
          },
        },

        {
          selector: "[type='ADDRESS']",
          css: {
            height: 50,
            width: 33,
            content: "data(label)",
            "background-image": "building.png",
            "background-color": "white",
            "border-color": "white",
            shape: "square",
          },
        },
        {
          selector: "[type='PREPARER']",
          css: {
            content: "data(label)",
            "background-image": "person.png",
            // "background-color": "white",
            "border-color": "white",
            shape: "square",
          },
        },
        // {
        //   //selection of group node
        //   selector: "[type='PREPARER']:selected",
        //   css: {
        //     "border-color": "#0000FF",
        //     "border-width": "5px",
        //     "border-style": "dashed"
        //   }
        // },
        // {
        {
          //selection of group node
          selector: "[type='GROUP']",
          css: {
            content: "",
          },
        },
        {
          //selection of node
          selector: " node:selected",
          css: {
            "border-color": "#0000FF",
            "border-width": "5px",
            "border-style": "dashed",
          },
        },
      ],

      elements: {
        nodes: cyNodes,
        edges: cyEdges,
      },
    });

    //presetsfor cytoscape-node-html-label"
    cy.nodes().addClass("cyDefault");

    G.GRAPHS[graphId].showTaxPeriods = true;
    G.GRAPHS[graphId].showTins = true;
    G.GRAPHS[graphId].edgeLabels = true;
    G.configureLabel(cy, graphId, false, false);
    cy.panzoom(panZoomDefaults);
    cy.edgeEditing(edgeBendDefaults);

    //test start

    //instance.initBendPoints(node);
    //instance.deleteSelectedBendPoint(node);

    //test end
    /**
     * selection attribute to right click'd nodes for better user experience
     * "ctxtap" grabs right click events in cytoscape
     */

    cy.on("cxttap", "node", function(e) {
      let selectedElements = cy.elements(":selected");
      let isInSelected = false;
      selectedElements.forEach((ele) => {
        if (ele.data("id") === e.target.data("id")) {
          isInSelected = true;
        }
      });
      if (selectedElements.length <= 1) {
        let nodeId = e.target.data("id");
        cy.$(":selected").json({ selected: false });
        cy.$id(nodeId).json({ selected: true });
      }
      if (selectedElements.length > 1) {
        if (isInSelected) {
          return;
        } else {
          selectedElements.forEach((ele) => {
            let eleId = ele.data("id");
            cy.$id(eleId).json({ selected: false });
          });
          let nodeId = e.target.data("id");
          cy.$id(nodeId).json({ selected: true });
        }
      }
    });

    /**
     * TOOLTIP HOVEROVER FUNCTIONALITY
     */
    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    if (!isIE11) {
      cy.on("mousemove", "cy", function(e) {
        var target = e.target;
        if (target && G.tippyId !== target.data("id")) {
          let tippyA = null;
          let linkType = target.data("linkType");
          if (G.tippyPopup) G.tippyPopup.hide();
          if (target.group() === "edges" && linkType) {
            let text = G.getText(linkType);
            tippyA = G.makeTippy(target, text);
            G.tippyId = target.data("id");
            G.tippyPopup = tippyA;
            G.tippyPopup.show();
          } else if (target.group() === "nodes") {
            if (target.data("label").indexOf("*") > -1) {
              let text = "Guessed Tax Period";
              tippyA = G.makeTippy(target, text);
              G.tippyId = target.data("id");
              G.tippyPopup = tippyA;
              G.tippyPopup.show();
            }
          }
        } else {
          if (G.tippyId) G.tippyPopup.show();
        }
      });
      cy.on("mouseout", "cy", function(e) {
        if (G.tippyPopup) G.tippyPopup.hide();
      });
    }
    /*                                                   */

    /*
     * cytoscape On Tap Function no Longer using
     */

    // cy.on("tap", function(event) {
    //   var target = event.target;
    //   let tippyA = null;
    //   if (target === cy) {
    //   } else if (target.group() === "edges" && target.data("linkType")) {
    //     let text = G.getText(target.data("linkType"));
    //     tippyA = G.makeTippy(target, text);
    //   } else if (target.group() === "nodes") {
    //     if (target.data("label").indexOf("*") > -1) {
    //       let text = "Guessed Tax Period";
    //       tippyA = G.makeTippy(target, text);
    //     }
    //   }
    //   if (tippyA) {
    //     let tippyTimer = setTimeout(() => tippyA.show(), 10);
    //   }
    // });

    /*                                                               */

    //  let labelText = this.getLabelFromYk1Graph(edge, cyEdges);
    // set year in global object
    let nodes = cy.nodes();
    let nodeId = nodes[0].data("id");
    if (nodeId.indexOf("GROUP") === -1) {
      G.GRAPHS[graphId].longTaxYear = G.getTaxPeriodFromNodeId(nodeId);
    } else {
      G.GRAPHS[graphId].longTaxYear = G.getGroupLinkTaxPeriodFromNodeId(nodeId);
    }
    //G.GRAPHS[graphId].cyto = cy;
    return cy;
  };

  G.getLabelDiv = function(
    data,
    currentNodes,
    showTin,
    showTaxPeriod,
    graphId,
    cyto
  ) {
    let dataSplit = [];
    dataSplit = [...data.id.split("_")];
    let nodeStyle = "cy-title__p1 ";
    let orbisIcon = "";
    let k2Icon = "";

    //group nodes
    if (data.nodeType.indexOf("GROUP") > -1) {
      for (let node in currentNodes) {
        if (currentNodes.hasOwnProperty(node)) {
          if (currentNodes[node] && currentNodes[node].id === data.id) {
            dataSplit = currentNodes[node].label.split(" ");
          }
        }
      }
    } else {
      //for GitLab ticket #403
      for (let node in currentNodes) {
        //console.log("CurrentNode: " + JSON.stringify(currentNodes[node]));
        if (currentNodes[node]) {
          //ORBIS INDICATOR
          if (
            currentNodes[node].hasOrbIndicator &&
            currentNodes[node].id === data.id
          ) {
            //console.log("CurrentNode: " + JSON.stringify(currentNodes[node]));
            //console.log("has orbis " + currentNodes[node].hasOrbIndicator);
            //console.log("CurrentNode id: " + currentNodes[node].id + " data id: " + data.id);
            orbisIcon =
              "<svg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns#' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns#' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' xml:space='preserve' width='20px' height='10px' style='shape-rendering:geometricPrecision; image-rendering:optimizeQuality' viewBox='0 0 300 300' id='svg2436'> <path style='fill:none;stroke:#000000;stroke-width:21;stroke-linecap:round' d='M42 327l0 -291' id='path2438'></path><path style='fill:#ff2a2a;stroke:#000000;stroke-width:10;stroke-linejoin:round' d='M49 50c70,30 104,28 178,2 -21,42 -21,74 0,116 -72,25 -101,25 -178,0l0 -118z' id='path2440'></path></svg>";
          }
          //K2 INDICATOR
          else if (
            currentNodes[node].hasK2Indicator &&
            currentNodes[node].id === data.id
          ) {
            k2Icon =
              ' <img src="/k2.svg" alt="image" width="20" height="20" />;';
          }
        }
      }

      //non group nodes,address, preparer and haven nodes
      if (data.backgroundColor === "#000000") {
        nodeStyle = "havenNode";
      }
      //address and preparer nodes return no label info
      if (data.nodeType === "PREPARER" || data.nodeType === "ADDRESS") {
        return "<div></div>";
      }
      //only applies to non group nodes
      dataSplit[0] = dataSplit[0].substring(1);
      //get actual cynode from cytoscape, get classes
      //toggle data based on what classes it has
      if (!showTin) {
        let currentNode = G.getCurrentNode(cyto, data);
        let classList = currentNode ? currentNode.classes() : null;
        classList.forEach((item) => {
          console.log(item);
          if (item === "removeTaxPeriods") {
            dataSplit[1] = "";
          }
        });

        dataSplit[0] = "";
      }
      if (!showTaxPeriod) {
        let currentNode = G.getCurrentNode(cyto, data);
        let classList = currentNode ? currentNode.classes() : null;
        classList.forEach((item) => {
          if (item === "removeTins") {
            dataSplit[0] = "";
          }
        });

        dataSplit[1] = "";
      }
    }

    let returnString =
      "<div class=" +
      nodeStyle +
      '><div style="text-align:center" >' +
      dataSplit[0] +
      "</div><div style='text-align:center'>" +
      dataSplit[1] +
      orbisIcon +
      k2Icon +
      "</div></div>";

    return returnString;
  };

  G.getCurrentNode = function(cyto, data) {
    let currentNode = cyto
      .nodes()
      .filter((node) => data.id === node.data("id"));

    return currentNode;
  };

  /**
   * configureLabel will be passed values automatically when cytoscape updates
   */

  G.configureLabel = function(cyto, graphId) {
    let currentNodes = G.GRAPHS[graphId].V;

    cyto.nodeHtmlLabel([
      {
        query: ".cyDefault",
        // valign: "top",
        // halign: "left",
        // valignBox: "top",
        // halignBox: "left",
        tpl: function(data) {
          let returnDiv = G.getLabelDiv(
            data,
            currentNodes,
            true,
            true,
            graphId,
            cyto
          );
          return returnDiv;
        },
      },

      {
        query: ".removeTins",
        tpl: function(data) {
          let returnDiv = G.getLabelDiv(
            data,
            currentNodes,
            false,
            true,
            graphId,
            cyto
          );
          return returnDiv;
        },
      },
      {
        query: ".removeTaxPeriods",
        tpl: function(data) {
          let returnDiv = G.getLabelDiv(
            data,
            currentNodes,
            true,
            false,
            graphId,
            cyto
          );
          return returnDiv;
        },
      },
      {
        query: ".groupNodeLabels",
        tpl: function(data) {
          return "<div></div>";
        },
      },
    ]);
  };
  G.makeTippy = function(node, text) {
    if (text) {
      return tippy(node.popperRef(), {
        content: function() {
          var div = document.createElement("div");
          div.innerHTML = text;
          return div;
        },
        trigger: "manual",
        arrow: true,
        placement: "bottom",
        hideOnClick: true,
        multiple: false,
        sticky: true,
      });
    }
  };
  G.getText = function(linkType) {
    let text = null;
    if (linkType === "CASE") text = "Case SSN";
    if (linkType === "K1") text = "K1";
    if (linkType === "PARENT") text = "Parent/Sub";
    if (linkType === "GROUP") text = "Group";
    if (linkType === "ADDRESS") text = "Address";
    if (linkType === "PREPARER") text = "Preparer";
    return text;
  };
  G.removeGraph = function(graphId) {
    // set to null, not splice because the graphId can not change
    G.GRAPHS[graphId] = null;
    console.log(G.GRAPHS[graphId]);
  };

  return G;
};

export default graphMain;
