import {
  toggleSingleName,
  toggleSingleTaxPeriod,
  toggleSingleTin,
  removeBend,
  resetEdgeBends,
} from "../../components/utils/utils";

console.log("utility");
const graphUtility = function(G) {
  G.trapezoidTopHeavy = "-1 -1 -0.5 1 0.5 1 1 -1";
  G.trapezoidBottomHeavy = "-1 1 -0.5 -1 0.5 -1 1 1";
  G.rhomboidReverse = "-1 1 -0.5 -1 1 -1 0.5 1";

  G.nodeToCyNode = function(v) {
    var cyNode = {};

    cyNode.position = { x: v.x, y: v.y };
    cyNode.data = {};
    cyNode.data.id = v.id;
    cyNode.data.label = v.label;
    if (v.data["nodeType"] === "NODE") {
      cyNode.data.label = v.data["tin"];

      /*if (v.data["isRealTaxPeriod"] === true) 
        cyNode.data.label += "\n" + v.data["year"];
      else
        cyNode.data.label += "*";
      */
      cyNode.data.label += "\n" + v.data["year"];

      if (v.data["isRealTaxPeriod"] === "false") cyNode.data.label += "*";

      cyNode.data.parent = "parent" + v.id;
    }
    cyNode.data.type = v.type;
    cyNode.data.nodeType = v.data["nodeType"];
    cyNode.data.year = v.data["year"];
    cyNode.data.hasRTF = v.data["hasRTF"];
    cyNode.data.mft = v.data["mft"];
    cyNode.data.isRealTaxPeriod = v.data["isRealTaxPeriod"];
    G.cyNodeSetDefault(cyNode);
    G.cyNodeSetShape(cyNode, v.type);
    G.cyNodeSetColor(cyNode, v);

    // set flags to show/hide TIN and Tax Year and name
    cyNode.data.showTinFlag = true;
    cyNode.data.showTaxPeriodFlag = true;
    cyNode.data.showNameFlag = true;
    cyNode.data.taxYear = v.data["year"];
    cyNode.data.title = v.label;
    //console.log(cyNode);
    return cyNode;
  };

  // G.createParentNode = function(node) {
  //   var parentNode = {};
  //   parentNode.data = {};
  //   parentNode.data.id = "parent" + node.id;
  //   parentNode.data.label = node.label;
  //   parentNode.data.labelContent = node.label;
  //   parentNode.data.hasRTF = false;
  //   //parentNode.data.parent = node.id;

  //   G.cyNodeSetDefault(parentNode);
  //   G.cyNodeSetShape(parentNode, node.type);
  //   G.cyNodeSetColor(parentNode, node);
  //   parentNode.data.borderColor = "#FFFFFF";
  //   parentNode.data.borderWidth = 0;
  //   parentNode.data.backgroundColor = "#FFFFFF";

  //   return parentNode;
  // };

  // Using the flags from v, set the color of cyNode
  G.cyNodeSetColor = function(cyNode, v) {
    if (v.data["nodeType"] === G.NODE_TYPE_GROUP) {
      cyNode.data.backgroundColor = G.FILLCOLOR_GROUP;
      cyNode.data.borderWidth = G.GROUP_NODE_BORDER_THICKNESS;
    } else if (
      v.data["nodeType"] === "ADDRESS" ||
      v.data["nodeType"] === "PREPARER"
    ) {
      cyNode.data.backgroundColor = "#FFFFFF";
    } else {
      // mark if initial
      if (v.flags.hasOwnProperty("initialNode") && v.flags["initialNode"]) {
        cyNode.data.borderWidth = G.INITIAL_NODE_BORDER_THICKNESS;
        cyNode.data.borderColor = G.BLACK;
      } else {
        cyNode.data.borderWidth = G.DEFAULT_NODE_BORDER_THICKNESS;
        cyNode.data.borderColor = G.BLACK;
      }

      if (v.flags.hasOwnProperty("flagForeign") && v.flags["flagForeign"]) {
        cyNode.data.backgroundColor = G.FILLCOLOR_FOREIGN;
      }
      if (v.flags.hasOwnProperty("flagItin") && v.flags["flagItin"]) {
        cyNode.data.backgroundColor = G.FILLCOLOR_ITIN;
      }
      if (v.flags.hasOwnProperty("flagHaven") && v.flags["flagHaven"]) {
        cyNode.data.backgroundColor = G.FILLCOLOR_HAVEN;
      }
      if (v.flags.hasOwnProperty("highTpiLimit") && v.flags["highTpiLimit"]) {
        cyNode.data.backgroundColor = G.FILLCOLOR_HIGHTPI;
      }
      if (
        v.flags.hasOwnProperty("highAssetLimit") &&
        v.flags["highAssetLimit"]
      ) {
        cyNode.data.backgroundColor = G.FILLCOLOR_HIGHASSETS;
      }
      if (v.flags.hasOwnProperty("flagShelter") && v.flags["flagShelter"]) {
        cyNode.data.backgroundColor = G.FILLCOLOR_SHELTER;
        //cyNode.data.contentColor = '#000000';
      }
      if (v.flags.hasOwnProperty("flagForm5500") && v.flags["flagForm5500"]) {
        cyNode.data.borderColor = "#0000FF";
      }

      // since Haven is midway through and the color can still be changed after,
      // only update the font color and border color at the end
      if (cyNode.data.backgroundColor === G.FILLCOLOR_HAVEN) {
        // cyNode.data.contentColor = G.WHITE;
        // if it's an initial node, need a contrasting border color
        if (v.flags.hasOwnProperty("initialNode") && v.flags["initialNode"]) {
          cyNode.data.borderColor = G.LINECOLOR_HAVEN;
        }
      }
    }
  };

  G.cyNodeSetShape = function(cyNode, type) {
    //console.log("cyNodeSetShape type: " + type);
    //console.log(cyNode);

    var backgroundImage = "data:image/svg+xml;utf8,";
    if (type === "GROUP") {
      cyNode.data.shape = "octagon";
    } else if (type === "ADDRESS") {
      cyNode.data.shape = "triangle";
    } else if (type === "PREPARER") {
      // make it circle
      cyNode.data.shape = "ellipse";
      cyNode.data.height = 50;
      cyNode.data.width = 50;
    } else {
      if (type === "CORPORATION") {
        cyNode.data.shape = "polygon";
        cyNode.data.poly = G.trapezoidBottomHeavy;
        backgroundImage += encodeURIComponent(G.svg1120);
      } else if (type === "INDIVIDUAL") {
        cyNode.data.shape = "roundrectangle";
        backgroundImage += encodeURIComponent(G.svg1040);
      } else if (type === "PARTNERSHIP") {
        cyNode.data.shape = "ellipse";
        backgroundImage += encodeURIComponent(G.svg1065);
      } else if (type === "TRUST") {
        cyNode.data.shape = "diamond";
        cyNode.data.height = 50;
        backgroundImage += encodeURIComponent(G.svg1041);
      } else if (type === "SCORPORATION") {
        cyNode.data.shape = "rectangle";
        backgroundImage += encodeURIComponent(G.svg1120S);
      } else if (type === "OTHER1120") {
        cyNode.data.shape = "hexagon";
      } else if (type === "TEGE") {
        cyNode.data.shape = "polygon";
        cyNode.data.poly = G.trapezoidTopHeavy;
      }
      //else (type === "UNKNOWN"){
      else {
        cyNode.data.shape = "polygon";
        cyNode.data.poly = G.rhomboidReverse;
        cyNode.data.width = 120;
      }
    }

    cyNode.data.backgroundImage = backgroundImage;
  };

  G.cyNodeSetDefault = function(cyNode) {
    cyNode.data.width = 90;
    cyNode.data.height = 35;
    cyNode.data.shape = "star";
    cyNode.data.poly = "0 0";
    cyNode.data.contentColor = "#000000";
    cyNode.data.backgroundColor = "#D3D3D3";
    cyNode.data.borderColor = "#000000";
    cyNode.data.borderWidth = G.DEFAULT_NODE_BORDER_THICKNESS;
  };

  G.cyEdgeSetColor = function(cyEdge, edge) {
    var edgeType = edge.edgeType;
    // default
    // color is the text color?
    // line-color is the line color
    cyEdge.data.lineColor = "black";
    cyEdge.data.color = G.BLACK;

    if (edgeType === "K1") {
      if (edge.data["negative"] === "true") {
        cyEdge.data.lineColor = "red";
      }
    } else if (edgeType === "CASE") {
      cyEdge.data.color = "orange";
      cyEdge.data.lineColor = "orange";
    } else if (edgeType === "GROUP") {
      cyEdge.data.color = "blue";
      cyEdge.data.lineColor = "blue";
    } else if (edgeType === "PARENT") {
      cyEdge.data.color = G.LINK_COLOR_PARENT;
      cyEdge.data.lineColor = G.LINK_COLOR_PARENT;
    }
  };
  G.cyEdgeSetColorByType = function(cyEdge) {
    // default
    // color is the text color?
    // line-color is the line color
    let edgeType = cyEdge.data.linkType;
    cyEdge.data.lineColor = "black";
    cyEdge.data.color = G.BLACK;

    if (edgeType === "K1") {
      if (cyEdge.data["negative"] === "true") {
        cyEdge.data.lineColor = "red";
      }
    } else if (edgeType === "CASE") {
      cyEdge.data.color = "orange";
      cyEdge.data.lineColor = "orange";
    } else if (edgeType === "GROUP") {
      cyEdge.data.color = "blue";
      cyEdge.data.lineColor = "blue";
    } else if (edgeType === "PARENT") {
      cyEdge.data.color = G.LINK_COLOR_PARENT;
      cyEdge.data.lineColor = G.LINK_COLOR_PARENT;
    }
  };

  G.cyEdgeSetStyle = function(cyEdge, edge) {
    var edgeType = edge.edgeType;

    // default is a solid line
    cyEdge.data.lineStyle = "solid";

    // address and preparer nodes are dotted lines
    if (edgeType === "ADDRESS" || edgeType === "PREPARER") {
      cyEdge.data.lineStyle = "dotted";
    } else if (edgeType === "K1" && edge.data["tinPerfection"] === "1") {
      cyEdge.data.lineStyle = "dashed";
    }
  };

  // finds an edge based on the groupin/groupout - currently not meant for individual nodes
  G.findGroupEdge = function(graphId, groupType, sourceId, targetId) {
    for (var e in G.GRAPHS[graphId].E) {
      if (G.GRAPHS[graphId].E.hasOwnProperty(e)) {
        var edge = G.GRAPHS[graphId].E[e];
        if (groupType === "GROUPOUT") {
          if (
            edge.data["sourceId"].substr(1) === sourceId &&
            edge.data["targetId"] === targetId
          ) {
            return G.GRAPHS[graphId].E[e];
          }
        } else {
          if (
            edge.data["sourceId"] === sourceId &&
            edge.data["targetId"].substr(1) === targetId
          ) {
            return G.GRAPHS[graphId].E[e];
          }
        }
      }
    }
  };

  G.findEdge = function(groupType, sourceId, targetId, graphId) {
    for (var e in G.GRAPHS[graphId].E) {
      if (G.GRAPHS[graphId].E.hasOwnProperty(e)) {
        var edge = G.GRAPHS[graphId].E[e];

        if (groupType === "GROUPOUT") {
          if (
            edge.data["sourceId"].substr(1) === sourceId &&
            edge.data[""] === targetId
          ) {
            return e;
          }
        } else {
          if (
            edge.data["sourceId"] === sourceId &&
            edge.data["targetId"] === targetId
          ) {
            return e;
          }
        }
      }
    }
  };

  /*
   * Counts the number of edges that are not connected to an Address or Preparer node
   */
  G.getEntityGroupEdgeCount = function(graphId) {
    var edgeCount = 0;
    for (var e in G.GRAPHS[graphId].E) {
      if (G.GRAPHS[graphId].E.hasOwnProperty(e)) {
        var edge = G.GRAPHS[graphId].E[e];
        if (
          edge.edgeType !== G.LINK_TYPE_ADDRESS &&
          edge.edgeType !== G.LINK_TYPE_PREPARER
        ) {
          edgeCount++;
        }
      }
    }

    return edgeCount;
  };

  // returns list of xtins/tins of all regular nodes on graph
  G.getAllRegularNodesAsString = function(graphId, xtinFlag, xtinOnlyFlag) {
    var allNodes = G.getAllRegularNodes(graphId, 1);
    allNodes = convertToStringArray(allNodes);

    // regular nodes are XTIN_TAXPERIOD
    // need to extract out the XTIN
    var xtinList = [];
    if (xtinOnlyFlag) {
      for (var i = 0; i < allNodes.length; i++) {
        if (xtinOnlyFlag) {
          xtinList.push(allNodes[i].substring(0, 11) + "'");
        }
      }
    } else {
      xtinList = allNodes;
    }
    return xtinList;
  };

  /*
   * xtinFlag:
   * 0 - TIN
   * 1 - XTIN
   */
  G.getAllRegularNodes = function(graphId, xtinFlag) {
    var nodes = G.getAllNodesByType(graphId, "NODE");

    // by default, array comes back as XTins
    if ((xtinFlag = 0)) {
      for (var i = 0; i < nodes.length; i++) {
        nodes[i] = nodes[i].substring(1);
      }
    }

    return nodes;
  };

  G.getAllGroupNodesAsString = function(graphId) {
    var allGroupNodes = G.getAllGroupNodes(graphId);
    allGroupNodes = convertToStringArray(allGroupNodes);
    return allGroupNodes;
  };

  G.getAllGroupNodes = function(graphId) {
    return G.getAllNodesByType(graphId, "GROUP");
  };

  G.getAllAddressNodesAsString = function(graphId) {
    var allAddressNodes = G.getAllAddressNodes(graphId);
    allAddressNodes = convertToStringArray(allAddressNodes);
    return allAddressNodes;
  };

  G.getAllAddressNodes = function(graphId) {
    return G.getAllNodesByType(graphId, G.NODE_TYPE_ADDRESS);
  };

  G.getAllPreparerNodesAsString = function(graphId) {
    var preparerNodes = G.getAllPreparerNodes(graphId);
    preparerNodes = convertToStringArray(preparerNodes);
    return preparerNodes;
  };

  G.getAllPreparerNodes = function(graphId) {
    return G.getAllNodesByType(graphId, G.NODE_TYPE_PREPARER);
  };

  function convertToStringArray(arrayOfNodes) {
    for (var i = 0; i < arrayOfNodes.length; i++) {
      arrayOfNodes[i] = "'" + arrayOfNodes[i] + "'";
    }

    return arrayOfNodes;
  }

  G.getAllNodesByType = function(graphId, nodeType) {
    var xtinList = [];

    for (var nodeId in G.GRAPHS[graphId].V) {
      if (
        G.GRAPHS[graphId].V[nodeId] != null &&
        G.GRAPHS[graphId].V.hasOwnProperty(nodeId)
      ) {
        var regNode = G.GRAPHS[graphId].V[nodeId];

        // check to make sure it's a regular node, not group, address, or preparer
        if (regNode.data.nodeType === nodeType) {
          //nodeId = "'" + nodeId + "'";
          //xtinList.push(nodeId.toString());
          xtinList.push(nodeId);
        }
      }
    }

    return xtinList;
  };

  // before adding a node to the graph, check if it already exists
  G.doesNodeExist = function(graphId, id, nodeType) {
    var nodeExists = false;

    if (nodeType === G.NODE_TYPE_ADDRESS) {
      // address node
      var addressList = G.getAllAddressNodes(graphId);

      for (let i = 0; i < addressList.length; i++) {
        // getAllAddressNodes returns with each address id in single quotes
        if (addressList[i] === id) {
          nodeExists = true;
          break;
        }
      }
    } else if (nodeType === G.NODE_TYPE_PREPARER) {
      var preparerList = G.getAllPreparerNodes(graphId);
      //console.log(preparerList);

      for (let i = 0; i < preparerList.length; i++) {
        if (preparerList[i] === id) {
          nodeExists = true;
          break;
        }
      }
    }

    return nodeExists;
  };

  // use this to show/hide the TIN and tax year
  G.showHideTinTaxYear = function(cyNode) {
    if (cyNode.length > 0) {
      var labelString = "";

      var nodeId = cyNode.data("id");
      var nodeTin = G.getTinFromNodeId(nodeId);
      var taxPeriod = G.getTaxPeriodFromNodeId(nodeId);
      //only engage if not a group node
      if (nodeId.indexOf("GROUP") === -1) {
        if (cyNode.data("showTinFlag") === true) {
          //console.log("show tin flag true");

          labelString += nodeTin;
        }

        /*if (cyNode.data("isRealTaxPeriod")) {
      // add a line break to separate TIN and Tax Year
      if (labelString.length > 0) {
        labelString += "\n";
      }
      
      if (cyNode.data("showTaxPeriodFlag") === true) {
        console.log("show tax period flag true");
        labelString += taxPeriod;
      }
    }
    else labelString += "*";*/
        if (cyNode.data("showTaxPeriodFlag")) {
          if (labelString.length > 0) {
            labelString += "\n";
          }

          labelString += taxPeriod;
          //console.log(cyNode.data("isRealTaxPeriod"));
          if (cyNode.data("isRealTaxPeriod") === "false") {
            labelString += "*";
          }
        }

        cyNode.data("label", labelString);
      }
    }
  };

  /*
   * Flag for whether or not TIN is displayed
   * true = show
   * hide = hide
   */
  G.setShowHideTinFlag = function(cyNode, isShown) {
    cyNode.data("showTinFlag", isShown);
  };

  G.setShowHideTaxPeriodFlag = function(cyNode, isShown) {
    cyNode.data("showTaxPeriodFlag", isShown);
  };

  G.setShowHideNameFlag = function(cyNode, isShown) {
    cyNode.data("showNameFlag", isShown);
  };
  G.setShowHideLabelFlag = function(cyNode, label) {
    cyNode.data("label", label);
  };

  G.groupNodeSelector = "node[nodeType = 'GROUP']";
  G.addressNodeSelector = "node[nodeType = 'ADDRESS']";
  G.preparerNodeSelector = "node[nodeType = 'PREPARER']";
  G.entityNodeSelector =
    "node[nodeType != 'GROUP'][nodeType != 'ADDRESS'][nodeType != 'PREPARER']";
  G.linkSelector = "edge";

  G.attachContext = function(cy, graphId) {
    //console.log("attachContext");
    var options = {
      menuItems: [
        //layout
        // {
        //   id: "applyLayout",
        //   content: "Apply Layout to Selected",
        //   tooltipText: "Apply Layout to Selected",
        //   selector: "node",
        //   onClickFunction: function(event) {
        //     // G.handleChangeLayout(cy.$(":selected"));
        //     console.log(event.target);
        //   },
        //   disabled: false,
        //   show: true,
        //   coreAsWell: false,
        // },

        /*  ****EDGE BENDING****
         the default option initBendPointsAutomatically in edgeBendDefaults is set to false (graphMain.js)
          its only turned on once an edge has been created. The plugin adds the cyedgebendeditingWeights array
          to the edge's data object, which we can target here. The point is to only display "Remove Bends" after a bend
          has been created, and not before.
          */

        {
          id: "Remove-Bends",
          content: "Remove Bends",
          selector: "edge[cyedgebendeditingWeights]",

          onClickFunction: function(event) {
            var node = event.target;

            if (node.data("cyedgebendeditingDistances")) {
              // let instance = cy.edgeEditing("get");
              // let initPoints = instance.initBendPoints(node);
              // instance.deleteSelectedBendPoint(node, 0);
              // let segmentPoints = instance.getSegmentPoints(node);
              // console.log(initPoints);
              // console.log(segmentPoints);
              // // removeBend(node, instance, segmentPoints.length);
              // console.log(instance);

              resetEdgeBends(cy);
            }
          },
          hasTrailingDivider: true,
        },
        {
          id: "move-edge-label",
          content: "Move edge label here",
          tooltipText: "Move the edge label to clicked location on edge",
          selector: " edge[linkType = 'K1']",
          onClickFunction: function(event) {
            /**
             * What we are doing is converting the relative positions along the edge to percentages
             * After each move, the percentages are converted back into pixels
             */
            var target = event.target || event.cyTarget;
            var pos = event.position;
            var targetNode = target.targetEndpoint();
            var sourceNode = target.sourceEndpoint();
            //calc x percent
            let xLength = Math.abs(targetNode.x - sourceNode.x);
            let xRelative = Math.abs(pos.x - sourceNode.x);
            let xPercent = xRelative / xLength;
            target.data("xPercent", xPercent);
            //calc y percent
            let yLength = Math.abs(targetNode.y - sourceNode.y);
            let yRelative = Math.abs(pos.y - sourceNode.y);
            let yPercent = yRelative / yLength;
            target.data("yPercent", yPercent);
            cy.resize();
          },

          hasTrailingDivider: true,
        },

        // group nodes
        {
          id: "getGroupDetails",
          content: "Get Group Details",
          tooltipText: "Get Group Details",
          selector: G.groupNodeSelector,
          onClickFunction: function(event) {
            var node = event.target;
            G.getGroupDetailInfo(graphId, node, cy);
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "replaceGroupWithAllNodes",
          content: "Replace With All Nodes",
          tooltipText: "Replace With All Nodes",
          selector: G.groupNodeSelector,
          onClickFunction: function(event) {
            var node = event.target;
            G.replaceWithAllNodes(graphId, node, cy);
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        // address nodes
        {
          id: "getAddressDetails",
          content: "Get Address Details",
          tooltipText: "Get Address Details",
          selector: G.addressNodeSelector,
          onClickFunction: function(event) {
            //console.log("get preparer detail");
            var node = event.target;
            G.showNodeDetails(graphId, node.data("id"), G.TIN_TYPE_ADDRESS, cy);
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        // preparer nodes
        {
          id: "getPreparerDetails",
          content: "Get Preparer Details",
          tooltipText: "Get Preparer Details",
          selector: G.preparerNodeSelector,
          onClickFunction: function(event) {
            //console.log("get address detail");
            var node = event.target;
            G.showNodeDetails(
              graphId,
              node.data("id"),
              G.TIN_TYPE_PREPARER,
              cy
            );
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        // general entity nodes
        {
          id: "getNodeInfo",
          content: "Get Node Info",
          tooltipText: "Get Node Info",
          selector: G.entityNodeSelector,
          onClickFunction: function(event) {
            var node = event.target;
            G.setUpNodeInfo(graphId, node.data("id"));
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "getRTF",
          content: "RTF Data",
          tooltipText: "RTF Data",
          selector: G.entityNodeSelector + "[?hasRTF]",
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            //if right clicking on a node not selected, will only send through the node that has been clicked on
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  G.setUpRtf(graphId, selectedNode[i].data("id"));
                }
              }
            } else {
              //if no selected nodes, just send on node that was clicked on
              G.setUpRtf(graphId, node.data("id"));
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "newGraphFromNode",
          content: "New Graph...",
          tooltipText: "New Graph...",
          selector: G.entityNodeSelector,
          onClickFunction: function(event) {
            var node = event.target;
            G.newGraphFromNode(node.data("id"));
            //	YK1.newGraphSetup(node.data("id"),graphId, newGraphCallback);
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "createPayeeList",
          content: "Get Payee Details",
          tooltipText: "Get Payee Details",
          selector: G.entityNodeSelector,
          onClickFunction: function(event) {
            let selectedNode = cy.$(":selected");
            // if (nodeId.indexOf("GROUP") > -1) {
            //   alert("No data available for Group nodes");
            //   return;
            // }
            // if (selectedNode.length === 1) {
            //   G.getGroupDetailInfo(graphId, selectedNode[0], cy, true);
            // } else {
            //   alert("Please Select a Node");
            // }

            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                // must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  G.getGroupDetailInfo(graphId, selectedNode[i], cy, true);
                } else {
                  alert("No data available for Group nodes");
                }
              }
            } else {
              //if no selected nodes, just send on node that was clicked on
              G.getGroupDetailInfo(graphId, event.target, cy, true);
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "zoomSelected",
          content: "Zoom Selected",
          tooltipText: "Zoom Selected",
          selector: "node",
          onClickFunction: function(event) {
            let node = event.target;
            let selectedNodes = cy.$(":selected");
            if (selectedNodes.length === 0) cy.fit(node);
            else cy.fit(selectedNodes);
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "deleteNode",
          content: "Delete Node",
          tooltipText: "Delete Node",
          selector: "node",
          onClickFunction: function(event) {
            //console.log("delete node");
            // check if there is a selection
            // if no selection (selectedNodes == 0), then go straight for the single delete
            var selectedNodes = cy.elements(":selected");
            if (selectedNodes.length > 1) {
              G.deleteNodes(graphId, cy);
            } else {
              var node = event.target;
              G.deleteAttachedGroupNodes(graphId, cy, node.data("id"));
              G.deleteNode(graphId, node.data("id"), cy);
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "getAddressNode",
          content: "Show Address Nodes",
          tooltipText: "Show Address Nodes",
          selector: G.entityNodeSelector,
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            //if right clicking on a node not selected, will only send through the node that has been clicked on
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  G.showAddressNode(graphId, selectedNode[i], 1, cy);
                }
              }
            } else {
              //if no selected nodes, just send on node that was clicked on
              G.showAddressNode(graphId, node, 1, cy);
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "getPreparerNode",
          content: "Show Preparer Nodes",
          tooltipText: "Show Preparer Nodes",
          selector: G.entityNodeSelector,
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            //if right clicking on a node not selected, will only send through the node that has been clicked on
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  G.showPreparerNode(graphId, selectedNode[i], 1, cy);
                }
              }
            } else {
              //if no selected nodes, just send on node that was clicked on
              G.showPreparerNode(graphId, node, 1, cy);
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "expandGraph",
          content: "Expand Graph",
          tooltipText: "Expand Graph",
          selector: G.entityNodeSelector,
          onClickFunction: function(event) {
            let node = event.target;
            let selectedNodes = cy.$(":selected").nodes();
            if (selectedNodes.length > 1) {
              let selectedNodeArray = [];
              //reform into array
              for (let i = 0; i < selectedNodes.length; i++) {
                selectedNodeArray.push(selectedNodes[i].data("id"));
              }
              G.expandGraphFromNode(selectedNodeArray);
            } else {
              G.expandGraphFromNode(node.data("id"));
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        // links
        {
          // Get Link Info should only be available between two entity nodes
          // a dotted edge goes between and address/preparer node to an entity
          id: "getLinkInfo",
          content: "Get Link Info",
          tooltipText: "Get Link Info",
          selector: "edge[linkType = 'K1']",
          onClickFunction: function(event) {
            var edge = event.target;
            //let target = edge.data("target");
            G.setUpLinkInfo(edge);
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          // Get Link Info should only be available between two entity nodes
          // a dotted edge goes between and address/preparer node to an entity
          id: "getK1Info",
          content: "Get K1 Info",
          tooltipText: "Get Link Info",
          selector: "edge[lineStyle != 'dotted'][linkType = 'K1']",
          onClickFunction: function(event) {
            var edge = event.target;
            G.setUpRtfForLink(graphId, edge, cy);
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "hideTin",
          content: "Hide TIN",
          tooltipText: "Hide TIN",
          selector: G.entityNodeSelector + "[?showTinFlag]", // entity, not group, address, preparer
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            var nodeId = node.data("id");
            var cyNode = cy.$("#" + nodeId);
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  toggleSingleTin(selectedNode[i], graphId, false);
                  G.setShowHideTinFlag(selectedNode[i], false);
                }
              }
            } else {
              toggleSingleTin(cyNode, graphId, false);
              G.setShowHideTinFlag(cyNode, false);
              console.log(cyNode);
              console.log(cyNode.classes());
            }
            G.GRAPHS[graphId].showTins = false;
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "showTin",
          content: "Show TIN",
          tooltipText: "Show TIN",
          selector: G.entityNodeSelector + "[!showTinFlag]", // entity, not group, address, preparer
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            var nodeId = node.data("id");
            var cyNode = cy.$("#" + nodeId);
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  toggleSingleTin(selectedNode[i], graphId, true);
                  G.setShowHideTinFlag(selectedNode[i], true);
                }
              }
            } else {
              toggleSingleTin(cyNode, graphId, true);
              G.setShowHideTinFlag(cyNode, true);
            }
            G.GRAPHS[graphId].showTins = true;
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "hideTaxPeriod",
          content: "Hide Tax Period",
          tooltipText: "Hide Tax Period",
          selector: G.entityNodeSelector + "[?showTaxPeriodFlag]", // entity, not group, address, preparer
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            var nodeId = node.data("id");
            var cyNode = cy.$("#" + nodeId);
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  toggleSingleTaxPeriod(selectedNode[i], graphId, false);
                  G.setShowHideTaxPeriodFlag(selectedNode[i], false);
                }
              }
            } else {
              toggleSingleTaxPeriod(cyNode, graphId, false);
              G.setShowHideTaxPeriodFlag(cyNode, false);
              console.log(cyNode);
              console.log(cyNode.classes());
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "showTaxPeriod",
          content: "Show Tax Period",
          tooltipText: "Show Tax Period",
          selector: G.entityNodeSelector + "[!showTaxPeriodFlag]", // entity, not group, address, preparer
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            var nodeId = node.data("id");
            var cyNode = cy.$("#" + nodeId);
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  toggleSingleTaxPeriod(selectedNode[i], graphId, true);
                  G.setShowHideTaxPeriodFlag(selectedNode[i], true);
                }
              }
            } else {
              toggleSingleTaxPeriod(cyNode, graphId, true);
              G.setShowHideTaxPeriodFlag(cyNode, true);
            }
            G.GRAPHS[graphId].showTaxPeriods = true;
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "hideName",
          content: "Hide Name",
          tooltipText: "Hide Name",
          selector: G.entityNodeSelector + "[?showNameFlag]", // entity, not group, address, preparer
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            var nodeId = node.data("id");
            var cyNode = cy.$("#" + nodeId);
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  toggleSingleName(selectedNode[i], graphId, false);
                  G.setShowHideNameFlag(selectedNode[i], false);
                }
              }
            } else {
              toggleSingleName(cyNode, graphId, false);
              G.setShowHideNameFlag(cyNode, false);
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
        {
          id: "showName",
          content: "Show Name",
          tooltipText: "Show Name",
          selector: G.entityNodeSelector + "[!showNameFlag]", // entity, not group, address, preparer
          onClickFunction: function(event) {
            var node = event.target;
            let selectedNode = cy.$(":selected");
            var nodeId = node.data("id");
            var cyNode = cy.$("#" + nodeId);
            if (selectedNode.length > 1) {
              for (let i = 0; i < selectedNode.length; i++) {
                //must not be a group node
                if (selectedNode[i].data("id").indexOf("GROUP") === -1) {
                  toggleSingleName(selectedNode[i], graphId, true);
                  G.setShowHideNameFlag(selectedNode[i], true);
                }
              }
            } else {
              toggleSingleName(cyNode, graphId, true);
              G.setShowHideNameFlag(cyNode, true);
            }
          },
          disabled: false,
          show: true,
          coreAsWell: false,
        },
      ],
    };

    cy.contextMenus(options);
    //return options;
  };

  return G;
};
export default graphUtility;
