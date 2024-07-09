import $ from "jquery";
import {
  exportToExcel,
  // addEdgeDiv,
  //removeEdgeDiv,
} from "../../components/utils/utils";

const yk1Controller = function(Y) {
  Y.ungraphableTins = [];
  Y.sourceNodePositiveFlows = [];
  Y.sourceNodeNegativeFlows = [];
  Y.token = "";

  Y.setToken = function(token) {
    Y.token = token;
  };
  Y.setIP = function(userIP) {
    Y.userIP = userIP;
  };
  Y.setSessionID = function(sessionId) {
    Y.sessionId = sessionId;
  };

  //
  /**
   * taxYearHandler()
   *
   * receivedData - JSON response from server
   *
   * Handles the list of tax years returned from the server and creates the set of radio buttons (for now)
   * to select the tax year for the graph
   */
  Y.taxYearHandler = function(data, callback) {
    //console.log("taxYearHandler");
    var taxYearList = data.taxYearDataList;
    //console.log(taxYearList);
    let taxYears = [];
    for (var i in taxYearList) {
      if (taxYearList.hasOwnProperty(i)) {
        // console.log(taxYearList[i]);
        // console.log(taxYears);
        taxYears = getTaxYear(taxYearList[i], taxYears);
      }
    }

    // we want to sort by descending tax year
    taxYears.sort(function(a, b) {
      return parseInt(b.taxYear) - parseInt(a.taxYear);
    });
    //save globally for later reference
    Y.taxYears = taxYears;
    callback(taxYears);
  };

  /**
   * getTaxYear()
   *
   * data - each tax year JSON object returned from the server
   *
   * Maps the JSON tax year object to a javascript object for our tax year array
   */
  function getTaxYear(data, taxYears) {
    var yearObj = {
      taxYear: data.taxYear,
      comments: data.displayComments,
    };
    taxYears.push(yearObj);
    return taxYears;
  }

  /**
   * getGraphHandler()
   *
   * receivedData - JSON response from server
   *
   * Takes the JSON response, transforms it to an array of nodes and edges and draws the graph
   */
  Y.getGraphHandler = function(data, myObject) {
    //data = errorString;
    //console.log(JSON.stringify(data));
    // only add tab if graph has data...

    if (data.entityList === null || data.entityList.length === 0) {
      Y.ungraphableTins.push({
        tin: myObject.tin,
        tinType: myObject.tinType,
        taxYear: myObject.taxYear,
      });
    } else {
      var graphId = Y.addGraph(myObject.taxYear, myObject.tin);
      //console.log("getGraphHandler id:" + graphId);
      Y.getNodes(graphId, data.entityList);
      Y.getEdges(graphId, data.linkList, myObject.taxYear);
    }
  };

  Y.updateStats = function(graphId, divIndex) {
    let tinTitle = Y.getTinTitle(graphId);
    document.getElementById("tinDisplay").innerHTML = "<b>Tin</b>: " + tinTitle;
    document.getElementById("yearDisplay").innerHTML =
      "<b>Tax Year</b>: " + Y.GRAPHS[graphId].taxYear;
    let numNodes =
      Y.getAllRegularNodes(graphId, 0).length +
      Y.getAllGroupNodes(graphId).length;
    let numEdges = Y.getEntityGroupEdgeCount(graphId);
    document.getElementById("nodesDisplay").innerHTML =
      "<b>Nodes:</b> " + numNodes;
    document.getElementById("linksDisplay").innerHTML =
      "<b>Links: </b>" + numEdges;
    //   // for now, only if it's a single graph
    //   if (TAB.isDisplaySingleGraph()) {
    //     document.getElementById("graphTIN").innerHTML = Y.GRAPHS[graphId].initTin;
    //     document.getElementById("graphTaxYear").innerHTML =
    //       Y.GRAPHS[graphId].taxYear;

    //     // Stats
    //     // Number of non address/preparer nodes. Regular nodes and group nodes are included in this count
    //     // Edges are all non-address/preparer edges
    //     var numNodes =
    //       Y.getAllRegularNodes(graphId, 0).length +
    //       Y.getAllGroupNodes(graphId).length;
    //     var numEdges = Y.getEntityGroupEdgeCount(graphId);
    //     document.getElementById("graphNumNodes").innerHTML = numNodes;
    //     document.getElementById("graphNumLinks").innerHTML = numEdges;
    //   } else {
    //     //multi Y...
    //     document.getElementById("graphTIN" + divIndex).innerHTML =
    //       Y.GRAPHS[graphId].initTin;
    //     document.getElementById("graphTaxYear" + divIndex).innerHTML =
    //       Y.GRAPHS[graphId].taxYear;

    //     // Stats
    //     // Number of non address/preparer nodes. Regular nodes and group nodes are included in this count
    //     // Edges are all non-address/preparer edges
    //     var numNodes =
    //       Y.getAllRegularNodes(graphId, 0).length +
    //       Y.getAllGroupNodes(graphId).length;
    //     var numEdges = Y.getEntityGroupEdgeCount(graphId);
    //     document.getElementById("graphNumNodes" + divIndex).innerHTML = numNodes;
    //     document.getElementById("graphNumLinks" + divIndex).innerHTML = numEdges;
    //   }
  };
  Y.getTinTitle = (id) => {
    let tinTitleArray = Y.GRAPHS[id].initTin.split(/\s+/);
    let tinTitle = tinTitleArray[0];
    if (tinTitleArray.length > 1) tinTitle = tinTitle + "...";
    return tinTitle;
  };
  /*
  populates the nodes array that is used to draw the graph
	 */
  Y.getNodes = function(graphId, data) {
    //var graph = GRAPH.GRAPHS[graphId];

    Y.GRAPHS[graphId].NUM_NODES = data.length;

    for (var i = 0; i < data.length; i++) {
      Y.getNode(graphId, data[i]);
    }
  };

  /*
  converts each entity object to a node
  had to mash some of our returned data in to fit with this prototype
  - xtin
  - hardcode the tax year
	 */
  Y.getNode = function(graphId, data) {
    var currentGraph = Y.GRAPHS[graphId];
    //console.log(data);
    var nodeType = "NODE";
    var nodeId;
    var hasRTF = true;
    // set the id
    // for non-group nodes, id is the xtin
    // for group nodes, it is the tin + link tin
    if (data.tinType === "4") {
      nodeId = data.tin;
      nodeType = Y.NODE_TYPE_GROUP;
    } else {
      //nodeId = data.tinType.concat(data.tin);
      nodeId = data.tinType
        .concat(data.tin)
        .concat("_")
        .concat(data.taxPeriod);
    }

    Y.addNodeDefault(graphId, nodeId);
    currentGraph.V[nodeId].id = nodeId;
    currentGraph.V[nodeId].TIN = data.tin;
    currentGraph.V[nodeId].x = data.posX;
    currentGraph.V[nodeId].y = data.posY;

    // determine node shape
    if (data.tinType === "4") {
      currentGraph.V[nodeId].type = Y.NODE_TYPE_GROUP;
      hasRTF = false;
    } else {
      currentGraph.V[nodeId].type = Y.getTypeFromMFT(data);
      //hasRTF = Y.hasRTF(nodeId + " " + Y.hasRTF(data.tinType, data.flags, Y.getTypeFromMFT(data)));
      hasRTF = Y.hasRTF(data.tinType, data.flags, Y.getTypeFromMFT(data));
    }
    currentGraph.V[nodeId].label = data.name;

    // flags
    var flags = data.flags;
    //for GitLab ticket #403

    //ORBIS INDICATOR
    if (flags != null && flags.charAt(7) === "1") {
      //console.log("flag: " + data.flags);
      //console.log("orbis value: " + flags.charAt(7));

      currentGraph.V[nodeId].hasOrbIndicator = true;
    } else {
      currentGraph.V[nodeId].hasOrbIndicator = false;
    }
    //K2 INDICATOR
    if (flags != null && flags.charAt(8) === "1") {
      //console.log("flag: " + data.flags);
      //console.log("orbis value: " + flags.charAt(7));

      currentGraph.V[nodeId].hasK2Indicator = true;
    } else {
      currentGraph.V[nodeId].hasK2Indicator = false;
    }

    //if (isEntityForeign(flags)) { G.V[i].flags["flagInitial"] = true; }
    if (data.isInitial) {
      currentGraph.V[nodeId].flags["initialNode"] = true;
    }
    if (data.tpi >= Y.HIGH_TPI_LIMIT) {
      currentGraph.V[nodeId].flags["highTpiLimit"] = true;
    }
    if (data.assets >= Y.HIGH_ASSET_LIMIT) {
      currentGraph.V[nodeId].flags["highAssetLimit"] = true;
    }
    setFlags(currentGraph, nodeId, flags);

    // set the positiveFlows/negativeFlows
    if (data.positiveFlow != null) {
      Y.sourceNodePositiveFlows[nodeId] = data.positiveFlow;
    }
    if (data.negativeFlow != null) {
      Y.sourceNodeNegativeFlows[nodeId] = data.negativeFlow;
    }

    // save data values
    currentGraph.V[nodeId].data = {
      // web service response data
      tin: data.tin,
      tinType: data.tinType,
      name: data.name,
      dataType: data.type,
      flags: data.flags,
      isInitial: data.isInitial,
      entityType: data.entityType,
      mft: data.mft,
      tpi: data.tpi,
      assets: data.assets,
      linkTin: data.linkTin,
      groupNode: data.groupNode,
      negativeFlow: data.negativeFlow,
      positiveFlow: data.positiveFlow,
      isRealTaxPeriod: data.isRealTaxPeriod,
      taxPeriod: data.taxPeriod,
      // other data that is needed for graph
      hasRTF: hasRTF,
      nodeType: nodeType,
      nodeId: nodeId,
      label: nodeId,
      year: data.taxPeriod === "0" ? "XXXX_XX" : data.taxPeriod,
      //year: taxYear
    };

    // set size, shape, color on our GRAPH.V nodes
    Y.cyNodeSetDefault(currentGraph.V[nodeId]);
    Y.cyNodeSetShape(currentGraph.V[nodeId], currentGraph.V[nodeId].dataType);
    Y.cyNodeSetColor(currentGraph.V[nodeId], currentGraph.V[nodeId]);

    return currentGraph.V[nodeId];
  };

  function setFlags(currentGraph, nodeId, flags) {
    if (Y.isEntityHasForm5500(flags)) {
      currentGraph.V[nodeId].flags["flagForm5500"] = true;
    }
    if (Y.isEntityForeign(flags)) {
      currentGraph.V[nodeId].flags["flagForeign"] = true;
    }
    if (Y.isEntityITin(flags)) {
      currentGraph.V[nodeId].flags["flagItin"] = true;
    }
    if (Y.isEntityHaven(flags)) {
      currentGraph.V[nodeId].flags["flagHaven"] = true;
    }
    if (Y.isEntityShelter(flags)) {
      currentGraph.V[nodeId].flags["flagShelter"] = true;
    }
  }

  /*
   * populates the edges array that is used to draw the graph
   */
  Y.getEdges = function(graphId, data, taxYear) {
    //console.log(data);
    for (var i = 0; i < data.length; i++) {
      Y.getEdge(graphId, data[i], taxYear);
    }

    //return edges;
  };

  Y.getEdge = function(graphId, data, taxYear) {
    //console.log("getEdge: " + data.sourceId + "|" + data.targetId);
    //console.log(data);

    var currentGraph = Y.GRAPHS[graphId];
    Y.addEdgeDefault(graphId, data.sourceId, data.targetId);
    var edgeIndex = currentGraph.E.length - 1;

    currentGraph.E[edgeIndex].amount = data.linkLabel;
    currentGraph.E[edgeIndex].edgeType = data.linkType;

    var label;
    //Calculate % allocations only for K1 Links (1-Payer>M-Payees)
    if (data.linkType === Y.LINK_TYPE_K1) {
      label = Y.calculateAllocationPercentage(data.sourceId, data);
    } else if (
      data.linkType === Y.LINK_TYPE_PARENT ||
      data.linkType === Y.LINK_TYPE_CASE
    ) {
      label = data.linkLabel;
    }

    currentGraph.E[edgeIndex].data = {
      // web service response data
      sourceId: data.sourceId,
      targetId: data.targetId,
      linkType: data.linkType,
      linkLabel: data.linkLabel,
      label: label,
      negative: data.negative,
      thickness: data.thickness,
      tinPerfection: data.tinPerfection,
      positiveFlow: data.positiveFlow,
      negativeFlow: data.negativeFlow,
      k1Count: data.k1Count,
      year: taxYear,
    };
  };

  /*
   *
   * Expand Graph
   *
   */
  Y.getExpandGraphHandler = function(graphId, data, sourceNodeId, cy) {
    //var nodeList = getNodes(data.entityList);
    //find spot for node placement
    let nodeLocator = Y.setNodeLocation(sourceNodeId, cy);
    Y.getExpandGraphNodes(graphId, data.entityList, cy, nodeLocator);
    Y.getExpandGraphEdge(graphId, data.linkList, sourceNodeId, cy);
    Y.updateStats(graphId);
    cy.nodes().addClass("cyDefault");
    let nodes = Y.GRAPHS[graphId].V;
    for (let key in nodes) {
      if (
        nodes.hasOwnProperty(key) &&
        nodes[key] !== null &&
        nodes[key].id.indexOf("GROUP") === -1
      ) {
        var nodeId = nodes[key].id;
        var cyNode = cy.$("#" + nodeId);
        let label = nodes[key].label;
        Y.setShowHideLabelFlag(cyNode, label);
      } else {
        if (nodes[key] !== null) cy.$("#" + nodes[key].id).data("label", "");
      }
    }
    //addEdgeDiv(cy, graphId, false);
    // cy.edges().forEach((item) => {
    //   console.log(item);

    //   if (item.data("target") === "1123123129_201412") {
    //     console.log("HIT");
    //     console.log(item);
    //   }
    // });
    cy.fit();
  };

  Y.getExpandGraphNodes = function(graphId, nodeList, cy, nodeLocator) {
    var nodeType = "NODE";
    var cyNodes = [];
    var taxYear = Y.GRAPHS[graphId].taxYear;

    for (var i = 0; i < nodeList.length; i++) {
      //console.log(nodeList[i]);
      var data = nodeList[i];

      var newNode = Y.getNode(graphId, data, taxYear);
      nodeType = newNode.data["nodeType"];

      cyNodes.push(Y.nodeToCyNode(newNode));
      // if (nodeType == "NODE") {
      //   //console.log("needs parent " + nodeType)
      //   var parentNode = Y.createParentNode(newNode);
      //   cyNodes.push(parentNode);
      // }
    }
    //console.log(cyNodes);
    for (let i = 0; i < cyNodes.length; i++) {
      if (cyNodes[i].data.id.indexOf("parent") !== 1) {
        //on first pass, set initial position. Remaining passes, increment x and y by 10
        Y.nodeLocationHelper.x += 10;
        Y.nodeLocationHelper.y += 10;
        if (nodeLocator.location !== null) {
          Y.nodeLocationHelper.x = nodeLocator.location.x;
          Y.nodeLocationHelper.y = nodeLocator.location.y;
          nodeLocator.location = null;
        }
        //below conditions are to correct cytoscape canvas overflowing window object, not sure why its happeneing
        let x = (Y.nodeLocationHelper.x += 10);
        let y = (Y.nodeLocationHelper.y += 10);
        if (x > window.innerWidth) x = window.innerWidth * 0.95;
        else if (y > window.innerHeight) y = window.innerHeight * 0.95;
        cyNodes[i].position = {
          x: x,
          y: y,
        };
      }
    }
    cy.add(cyNodes);
  };

  Y.getExpandGraphEdge = function(graphId, linkList, sourceNodeId, cy) {
    //console.log('getExpandGraphEdge');
    //console.log(linkList);
    //console.log(GRAPH.V);

    for (var i = 0; i < linkList.length; i++) {
      var data = linkList[i];

      var lineStyle = "solid";
      if (data.linkType === "ADDRESS" || data.linkType === "PREPARER") {
        Y.expandGraphAddAddressPreparerEdge(graphId, data, cy);
      } else {
        //console.log(data.sourceId + "|" + data.targetId);
        //console.log(GRAPH.V[data.targetId]);
        Y.addEdgeDefault(graphId, data.sourceId, data.targetId);
        var edgeIndex = Y.GRAPHS[graphId].E.length - 1;

        Y.GRAPHS[graphId].E[edgeIndex].amount = data.label;
        Y.GRAPHS[graphId].E[edgeIndex].edgeType = data.linkType;

        let edgeColor = "#000000";
        var edgeType = data.linkType;

        if (edgeType === "CASE") {
          edgeColor = "orange";
        } else if (edgeType === "GROUP") {
          edgeColor = "blue";
        }

        var label = "";
        if (data.linkType === Y.LINK_TYPE_K1) {
          label = Y.calculateAllocationPercentage(data.sourceId, data);
        } else if (
          data.linkType === Y.LINK_TYPE_PARENT ||
          data.linkType === Y.LINK_TYPE_CASE
        ) {
          label = data.label;
        }

        var taxYear = Y.getTaxPeriodFromNodeId(data.sourceId);

        Y.GRAPHS[graphId].E[edgeIndex].data = {
          sourceId: data.sourceId,
          targetId: data.targetId,
          linkType: data.linkType,
          linkLabel: data.label,
          negative: data.negative == null ? null : data.negative,
          thickness: data.thickness,
          tinPerfection: data.tinPerfection,
          positiveFlow: data.positiveFlow,
          negativeFlow: data.negativeFlow,
          lineStyle: lineStyle,
          label: label,
          width: "1",
          year: taxYear,
        };
        Y.cyEdgeSetColorByType(Y.GRAPHS[graphId].E[edgeIndex]);
        // Y.cyEdgeSetColor(cyEdges[i],  Y.GRAPHS[graphId].E[edgeIndex]);
        var thisEdge = Y.GRAPHS[graphId].E[edgeIndex];
        cy.add({
          group: "edges",
          data: {
            source: thisEdge.data.sourceId,
            target: thisEdge.data.targetId,
            linkType: data.linkType,
            taxYear: taxYear,
            width: 1,
            lineStyle: thisEdge.data.lineStyle,
            // label: thisEdge.data.label,
            color: thisEdge.data.color,
            lineColor: thisEdge.data.lineColor,
          },
        });
      }
    }
  };

  Y.expandGraphAddAddressPreparerEdge = function(graphId, data, cy) {
    console.log(data);

    // a couple of special cases for address and prepare links
    //console.log("expandGraphAddAddressPreparerEdge");

    // first, dotted line
    var lineStyle = "dotted";

    // second, since our address and preparer tables only have tax years, not tax periods
    // we'll match based on similar tax years
    // the node is always the target
    var sourceId = data.sourceId;
    var targetId = "";

    // first get the tax year, based off the sourceId (address/preparer)
    var taxYear = Y.GRAPHS[graphId].V[sourceId].data["taxPeriod"].substring(
      0,
      4
    );

    var matchedNodeArray = Y.getApproximateMatchNode(
      graphId,
      data.targetId,
      taxYear,
      cy
    );

    for (var i = 0; i < matchedNodeArray.length; i++) {
      targetId = matchedNodeArray[i];

      Y.addEdgeDefault(graphId, sourceId, targetId);
      var edgeIndex = Y.GRAPHS[graphId].E.length - 1;

      Y.GRAPHS[graphId].E[edgeIndex].amount = data.label;
      Y.GRAPHS[graphId].E[edgeIndex].edgeType = data.linkType;

      var edgeColor = "#000000";

      var thisEdge = Y.GRAPHS[graphId].E[edgeIndex];

      thisEdge.data = {
        sourceId: sourceId,
        targetId: targetId,
        linkType: data.linkType,
        linkLabel: data.label,
        negative: data.negative == null ? null : data.negative,
        thickness: data.thickness,
        lineStyle: lineStyle,
        lineColor: edgeColor,
        color: Y.BLUE,
        label: data.label,
        width: "1",
        year: taxYear,
      };

      cy.add({
        group: "edges",
        data: {
          source: thisEdge.data.sourceId,
          target: thisEdge.data.targetId,
          linkType: thisEdge.data.linkType,
          taxYear: taxYear,
          width: 1,
          lineStyle: thisEdge.data.lineStyle,
          label: thisEdge.data.label,
          color: thisEdge.data.color,
          lineColor: thisEdge.data.lineColor,
        },
      });
    }
  };

  /*
   * Start down the process to get Address nodes
   */

  Y.showAllAddressNodes = function(graphId, minNodes, cy) {
    var regularNodes = Y.getAllRegularNodesAsString(graphId, 0, true);
    let taxYear = Y.GRAPHS[graphId].longTaxYear;
    var myObject = new Object();
    myObject.sourceNodeXtin = null;
    myObject.allNodeList = regularNodes.toString();
    myObject.taxYear = taxYear;
    myObject.minNodes = minNodes;
    myObject.isForced = false;
    var servletParams = JSON.stringify(myObject);
    // call REST service
    //probably push a true/false param to getaddress and process it differently
    Y.getAddresses(servletParams, null, taxYear, graphId, cy);
  };

  // Add address nodes section
  // Y.lastAddressNode;
  // Y.lastAddressMinNodes;

  // from the entity node, show the address node
  Y.showAddressNode = function(graphId, node, minNodes, cy) {
    var nodeId = node.data("id");
    Y.lastAddressNode = nodeId;
    Y.lastAddressMinNodes = minNodes;
    Y.showAddressNodesPrep(graphId, nodeId, minNodes, false, cy);
  };

  Y.showAddressNodesPrep = function(graphId, nodeId, minNodes, isForced, cy) {
    if (isForced == null) {
      isForced = false;
    }

    var node = Y.GRAPHS[graphId].V[nodeId];
    var regularNodes = Y.getAllRegularNodesAsString(graphId, 0, true);
    var nodeXTin = Y.getNodeXTinFromNodeId(nodeId);
    var taxYear = Y.getTaxPeriodFromNodeId(nodeId);
    var myObject = new Object();
    myObject.sourceNodeXtin = nodeXTin;
    myObject.allNodeList = regularNodes.toString();
    myObject.taxYear = taxYear;
    myObject.minNodes = minNodes;
    myObject.isForced = false;
    var servletParams = JSON.stringify(myObject);
    // console.log(servletParams);
    // call REST service
    Y.getAddresses(servletParams, nodeId, node.data.year, graphId, cy);
  };

  Y.getAddressHandler = function(
    graphId,
    data,
    sourceNodeXtin,
    taxYear,
    cy,
    servletParams,
    excelExport
  ) {
    let countWarning = data.addressList[0].address;
    let count = data.addressList[0].count;
    if (excelExport) {
      exportToExcel(data.addressList, "AddressList.xlsx");
    } else {
      //defined in app.js
      Y.handleGenericModal(
        {
          graphId,
          data,
          sourceNodeXtin,
          taxYear,
          cy,
          servletParams,
        },
        "Address",
        countWarning,
        count
      );
    }
  };

  // show the specific address node
  Y.createAddressNodes = function(
    graphId,
    addressList,
    sourceNodeXtin,
    cy,
    taxPeriod
  ) {
    let isMulti = false;
    if (!sourceNodeXtin) {
      isMulti = true;
    }
    if (!taxPeriod) {
      taxPeriod = Y.getTaxPeriodFromNodeId(sourceNodeXtin);
    }

    //find spot for node placement
    let nodeLocator = Y.setNodeLocation(sourceNodeXtin, cy);

    for (var i = 0; i < addressList.length; i++) {
      var address = addressList[i];
      if (isMulti) {
        sourceNodeXtin = addressList[i] + "_" + taxPeriod;
      }
      // check if address node exists
      if (!Y.doesNodeExist(graphId, address.address, Y.NODE_TYPE_ADDRESS)) {
        //console.log("address does not exist, ADD!");
        // add the node
        var nodeId = Y.addAddressNode(
          graphId,
          address,
          sourceNodeXtin,
          taxPeriod,
          true,
          cy,
          nodeLocator
        );

        // get list of xtins from return data and add edge
        var xtins = address.xtins;
        for (var j = 0; j < xtins.length; j++) {
          // for each xtin, check if there's a node on the graph it resembles
          // "resembles" xtin and tax year match. we're going to ignore full tax period for now

          var matchingNodes = Y.getApproximateMatchNode(
            graphId,
            xtins[j],
            taxPeriod.substring(0, 4)
          );
          for (var k = 0; k < matchingNodes.length; k++) {
            Y.addAddressEdge(graphId, nodeId, matchingNodes[k], true, cy);
          }
        }
      } else {
        // address node already exists, so we high light it
        //console.log("address already exists");

        nodeId = address.address;

        cy.getElementById(nodeId).select();
      }
    }
    cy.fit();
  };

  // addNow is true/false for whether to add to the cytoscape canvas before function returns
  Y.addAddressNode = function(
    graphId,
    address,
    sourceNodeXtin,
    taxPeriod,
    addNow,
    cy,
    nodeLocator
  ) {
    if (nodeLocator) {
      //on first pass, set initial position. Remaining passes, increment x and y by 10
      Y.nodeLocationHelper.x += 10;
      Y.nodeLocationHelper.y += 10;
      if (nodeLocator.location !== null) {
        Y.nodeLocationHelper.x = nodeLocator.location.x;
        Y.nodeLocationHelper.y = nodeLocator.location.y;
        nodeLocator.location = null;
      }
    }
    var nodeId = address.address;
    Y.addNodeDefault(graphId, nodeId);
    Y.GRAPHS[graphId].V[nodeId].id = nodeId;

    // determine node shape
    Y.GRAPHS[graphId].V[nodeId].type = Y.NODE_TYPE_ADDRESS;
    Y.GRAPHS[graphId].V[nodeId].label =
      "A\n" + address.count + "\n" + address.address;

    //   Y.GRAPHS[graphId].V[nodeId].label = "A\n" + address.count;

    Y.GRAPHS[graphId].V[nodeId].x = address.posX;
    Y.GRAPHS[graphId].V[nodeId].y = address.posY;

    Y.GRAPHS[graphId].V[nodeId].data = {
      address: address.address,
      count: address.count,
      xtins: address.xtins,
      taxPeriod: taxPeriod,
      sourceNodeXtin: sourceNodeXtin,
      nodeType: Y.NODE_TYPE_ADDRESS,
    };

    // set size, shape, color on our Y.V nodes
    Y.cyNodeSetDefault(Y.GRAPHS[graphId].V[nodeId]);
    Y.cyNodeSetShape(
      Y.GRAPHS[graphId].V[nodeId],
      Y.GRAPHS[graphId].V[nodeId].type
    );
    Y.cyNodeSetColor(Y.GRAPHS[graphId].V[nodeId], Y.GRAPHS[graphId].V[nodeId]);

    if (addNow) {
      var cyNode = Y.nodeToCyNode(Y.GRAPHS[graphId].V[nodeId]);
      cy.add({
        group: "nodes",
        data: {
          id: cyNode.data.id,
          label: cyNode.data.label,
          type: cyNode.data.type,
          nodeType: cyNode.data.nodeType,
          year: cyNode.data.taxPeriod,
          width: cyNode.data.width,
          height: cyNode.data.height,
          shape: cyNode.data.shape,
          poly: cyNode.data.poly,
          contentColor: cyNode.data.contentColor,
          backgroundColor: cyNode.data.backgroundColor,
          borderColor: cyNode.data.borderColor,
          borderWidth: cyNode.data.borderWidth,
          color: cyNode.data.contentColor,
        },
        position: { x: Y.nodeLocationHelper.x, y: Y.nodeLocationHelper.y }, // this will need to be changed later on
      });
    }
    return nodeId;
  };

  Y.addAddressEdge = function(graphId, nodeId, sourceNodeXtin, addNow, cy) {
    // add edge
    //console.log(nodeId + "|" + sourceNodeXtin);
    Y.addEdgeDefault(graphId, nodeId, sourceNodeXtin);
    var edgeIndex = Y.GRAPHS[graphId].E.length - 1;
    Y.GRAPHS[graphId].E[edgeIndex].edgeType = Y.LINK_TYPE_ADDRESS;

    // get the tax year from the source node
    var taxPeriod = Y.getTaxPeriodFromNodeId(sourceNodeXtin);

    // we already know it's an Address
    var lineStyle = "dotted";
    var edgeColor = "#000000";

    Y.GRAPHS[graphId].E[edgeIndex].data = {
      sourceId: nodeId,
      targetId: sourceNodeXtin,
      lineStyle: lineStyle,
      lineColor: edgeColor,
      color: Y.BLUE,
      linkType: Y.LINK_TYPE_ADDRESS,
      taxPeriod: taxPeriod,
      label: "",
      width: 1,
      thickness: 1,
    };

    //console.log(Y.GRAPHS[graphId].E[edgeIndex]);
    if (addNow) {
      var thisEdge = Y.GRAPHS[graphId].E[edgeIndex];
      cy.add({
        group: "edges",
        data: {
          source: thisEdge.data.sourceId,
          target: thisEdge.data.targetId,
          linkType: Y.LINK_TYPE_ADDRESS,
          taxYear: taxPeriod,
          width: thisEdge.data.width,
          lineStyle: thisEdge.data.lineStyle,
          label: thisEdge.data.label,
          lineColor: thisEdge.data.lineColor,
          color: thisEdge.data.color,
        },
      });
    }
  };

  //Add Preparer nodes section
  // Y.lastPreparerNode;
  // Y.lastPreparerMinNodes;
  Y.showAllPreparerNodes = function(graphId, minNodes, cy) {
    var regularNodes = Y.getAllRegularNodesAsString(graphId, 0, true);
    let taxYear = Y.GRAPHS[graphId].longTaxYear;
    var myObject = new Object();
    myObject.sourceNodeXtin = null;
    myObject.allNodeList = regularNodes.toString();
    myObject.taxYear = taxYear;
    myObject.minNodes = minNodes;
    myObject.isForced = false;
    var servletParams = JSON.stringify(myObject);
    // call REST service
    //probably push a true/false param to getaddress and process it differently
    Y.getPreparers(servletParams, null, taxYear, graphId, cy);

    // call REST service
  };

  //from the entity node, show the preparer node
  Y.showPreparerNode = function(graphId, node, minNodes, cy) {
    //console.log("showPreparerNode");
    var nodeId = node.data("id");
    Y.showPreparerNodesPrep(graphId, nodeId, minNodes, false, cy);
  };

  Y.showPreparerNodesPrep = function(graphId, nodeId, minNodes, isForced, cy) {
    if (isForced == null) {
      isForced = false;
    }
    var node = Y.GRAPHS[graphId].V[nodeId];
    var regularNodes = Y.getAllRegularNodesAsString(graphId, 0, true);
    var myObject = new Object();
    var xTin = Y.getNodeXTinFromNodeId(nodeId);
    var taxYear = Y.getTaxPeriodFromNodeId(nodeId);
    myObject.sourceNodeXtin = xTin;
    myObject.allNodeList = regularNodes.toString();
    myObject.minNodes = minNodes;
    myObject.isForced = isForced;
    myObject.taxYear = taxYear;

    var servletParams = JSON.stringify(myObject);

    //console.log(servletParams);

    // call REST service
    Y.getPreparers(servletParams, nodeId, node.data.year, graphId, cy);
  };

  Y.getPreparerHandler = function(
    graphId,
    data,
    sourceNodeXtin,
    taxYear,
    cy,
    servletParams,
    excelExport
  ) {
    let countWarning = data.preparerList[0].preparer;
    let count = data.preparerList[0].count;
    if (excelExport) {
      exportToExcel(data.preparerList, "PreparerList.xlsx");
    } else {
      //defined in app.js
      Y.handleGenericModal(
        {
          graphId,
          data,
          sourceNodeXtin,
          taxYear,
          cy,
          servletParams,
        },
        "Preparer",
        countWarning,
        count
      );
    }
  };

  //show the specific preparer node
  Y.createPreparerNodes = function(
    graphId,
    preparerList,
    sourceNodeXtin,
    cy,
    taxPeriod
  ) {
    //console.log("createPreparerNodes");
    //console.log(preparerList);

    let isMulti = false;
    if (!sourceNodeXtin) {
      isMulti = true;
    }

    // XTIN_TAXPERIOD
    // get tax period from the source node
    // var sourceNodeArray = sourceNodeXtin.split("_");
    //let taxPeriod = Y.GRAPHS[graphId].longTaxYear;
    if (!taxPeriod) {
      taxPeriod = Y.getTaxPeriodFromNodeId(sourceNodeXtin);
    }

    //find spot for initial node placement
    let nodeLocator = Y.setNodeLocation(sourceNodeXtin, cy);

    for (var i = 0; i < preparerList.length; i++) {
      var preparer = preparerList[i];
      //console.log(preparer);

      if (isMulti) {
        sourceNodeXtin = preparerList[i] + "_" + taxPeriod;
      }
      if (!Y.doesNodeExist(graphId, preparer.name, Y.NODE_TYPE_PREPARER)) {
        var nodeId = Y.addPreparerNode(
          graphId,
          preparer,
          sourceNodeXtin,
          taxPeriod,
          true,
          cy,
          nodeLocator
        );

        // add edge
        var xtins = preparer.xtins;
        for (var j = 0; j < xtins.length; j++) {
          // for each xtin, check if there's a node on the graph it resembles
          // "resembles" xtin and tax year match. we're going to ignore full tax period for now
          var matchingNodes = Y.getApproximateMatchNode(
            graphId,
            xtins[j],
            taxPeriod.substring(0, 4)
          );

          for (var k = 0; k < matchingNodes.length; k++) {
            Y.addPreparerEdge(graphId, nodeId, matchingNodes[k], true, cy);
          }
        }
      } else {
        // preparer node already exists, so we high light it
        //console.log("preparer already exists");

        var nodeId = preparer.name;

        cy.getElementById(nodeId).select();
      }
    }
    cy.fit();
  };

  Y.addPreparerNode = function(
    graphId,
    preparer,
    sourceNodeXtin,
    taxPeriod,
    addNow,
    cy,
    nodeLocator
  ) {
    //console.log(preparer);
    var nodeId = preparer.name;
    //console.log("preparer nodeId: " + nodeId);

    //on first pass, set initial position. Remaining passes, increment x and y by 10
    if (nodeLocator) {
      Y.nodeLocationHelper.x += 10;
      Y.nodeLocationHelper.y += 10;
      if (nodeLocator.location !== null) {
        Y.nodeLocationHelper.x = nodeLocator.location.x;
        Y.nodeLocationHelper.y = nodeLocator.location.y;
        nodeLocator.location = null;
      }
    }
    Y.addNodeDefault(graphId, nodeId);
    Y.GRAPHS[graphId].V[nodeId].id = nodeId;

    // determine node shape
    Y.GRAPHS[graphId].V[nodeId].type = Y.LINK_TYPE_PREPARER;
    Y.GRAPHS[graphId].V[nodeId].label =
      "P-" +
      preparer.preparerType +
      "\n" +
      preparer.count +
      "\n" +
      preparer.name;

    Y.GRAPHS[graphId].V[nodeId].x = preparer.posX;
    Y.GRAPHS[graphId].V[nodeId].y = preparer.posY;
    // save data values
    Y.GRAPHS[graphId].V[nodeId].data = {
      name: preparer.name,
      count: preparer.count,
      preparerType: preparer.preparerType,
      xtin: preparer.xtin,
      xtins: preparer.xtins,
      taxPeriod: taxPeriod,
      sourceNodeXtin: sourceNodeXtin,
      nodeType: Y.NODE_TYPE_PREPARER,
    };
    // set size, shape, color on our Y.V nodes
    Y.cyNodeSetDefault(Y.GRAPHS[graphId].V[nodeId]);
    Y.cyNodeSetShape(
      Y.GRAPHS[graphId].V[nodeId],
      Y.GRAPHS[graphId].V[nodeId].type
    );
    Y.cyNodeSetColor(Y.GRAPHS[graphId].V[nodeId], Y.GRAPHS[graphId].V[nodeId]);

    if (addNow) {
      var cyNode = Y.nodeToCyNode(Y.GRAPHS[graphId].V[nodeId]);
      cy.add({
        group: "nodes",
        data: {
          id: cyNode.data.id,
          label: cyNode.data.label,
          type: cyNode.data.type,
          nodeType: cyNode.data.nodeType,
          year: cyNode.data.year,
          width: cyNode.data.width,
          height: cyNode.data.height,
          shape: cyNode.data.shape,
          poly: cyNode.data.poly,
          contentColor: cyNode.data.contentColor,
          backgroundColor: cyNode.data.backgroundColor,
          borderColor: cyNode.data.borderColor,
          borderWidth: cyNode.data.borderWidth,
          color: cyNode.data.contentColor,
        },
        position: { x: Y.nodeLocationHelper.x, y: Y.nodeLocationHelper.y },
      });
    }

    return nodeId;
  };

  Y.addPreparerEdge = function(graphId, nodeId, sourceNodeXtin, addNow, cy) {
    Y.addEdgeDefault(graphId, nodeId, sourceNodeXtin);
    var edgeIndex = Y.GRAPHS[graphId].E.length - 1;
    Y.GRAPHS[graphId].E[edgeIndex].edgeType = Y.LINK_TYPE_PREPARER;

    // we already know it's a Preparer
    var lineStyle = "dotted";
    var edgeColor = "#000000";

    // get the tax year from the source node
    var taxPeriod = Y.getTaxPeriodFromNodeId(sourceNodeXtin);

    Y.GRAPHS[graphId].E[edgeIndex].data = {
      sourceId: nodeId,
      targetId: sourceNodeXtin,
      lineStyle: lineStyle,
      lineColor: edgeColor,
      color: Y.BLUE,
      linkType: Y.LINK_TYPE_PREPARER,
      taxYear: taxPeriod,
      label: "",
      width: 1,
      thickness: 1,
    };

    if (addNow) {
      var thisEdge = Y.GRAPHS[graphId].E[edgeIndex];

      cy.add({
        group: "edges",
        data: {
          source: thisEdge.data.sourceId,
          target: thisEdge.data.targetId,
          linkType: Y.LINK_TYPE_PREPARER,
          taxYear: taxPeriod,
          width: thisEdge.data.width,
          lineStyle: thisEdge.data.lineStyle,
          label: thisEdge.data.label,
          lineColor: thisEdge.data.lineColor,
          color: thisEdge.data.color,
        },
      });
    }
  };

  // showNodeDetails - address, preparer
  // address/preparer detail
  Y.showNodeDetails = function(graphId, nodeId, tinType, cy) {
    //console.log(nodeId);
    var name;
    var node = Y.GRAPHS[graphId].V[nodeId];
    if (tinType == Y.TIN_TYPE_ADDRESS) {
      name = node.data["address"];
    } else if (tinType == Y.TIN_TYPE_PREPARER) {
      name = node.data["xtin"];
    }

    var myObject = new Object();
    myObject.name = name;
    myObject.tinType = tinType;
    myObject.taxYear = node.data["taxPeriod"];
    //console.log(myObject);
    //console.log(servletParams);
    Y.getNodeDetails(
      graphId,
      myObject,
      tinType,
      node.data["taxPeriod"],
      nodeId,
      cy
    );
  };

  // new window for address/preparer node details
  Y.showNodeDetailsHandler = function(
    graphId,
    xml,
    tinType,
    taxYear,
    nodeId,
    cy
  ) {
    console.log(taxYear);
    //console.log("showNodeDetailsHandler");
    //console.log(xml);
    var xmlDoc = $.parseXML(xml);
    let $xml = $(xmlDoc);

    var name = $(xml)
      .find("SourceNodeTin")
      .text()
      .trim();
    var title = "";
    var groupType = "";
    if (tinType == Y.TIN_TYPE_ADDRESS) {
      title = "Address detail for " + name + " - TY" + taxYear;
      groupType = Y.GROUP_NODE_TYPE_ADDRESS;
    } else {
      title = "Preparer detail for " + name.substr(1) + " - TY" + taxYear;
      groupType = Y.GROUP_NODE_TYPE_PREPARER;
    }

    Y.detailsModalCallback(
      graphId,
      title,
      groupType,
      nodeId,
      xml.nodeDetailXml,
      cy
    );
    // Y.loadNodeDetailsWindow(
    //   graphId,
    //   title,
    //   groupType,
    //   nodeId,
    //   xml.nodeDetailXml,
    //   cy
    // );
  };

  /*
   * Node Info
   */
  // node info, link info, etc
  Y.setUpNodeInfo = function(graphId, nodeId) {
    var node = Y.GRAPHS[graphId].V[nodeId];
    //console.log(node);
    var myObject = new Object();
    myObject.tin = node.data.tin;
    myObject.taxYear = node.data.year;
    myObject.tinType = node.data.tinType;
    var servletParams = JSON.stringify(myObject);

    //console.log(myObject);
    Y.getNodeInfo(servletParams);
  };

  Y.getNodeInfoHandler = function(data) {
    Y.getStyledElement(data.nodeInfoXml);
  };

  /*
   * Link Info
   */
  Y.setUpLinkInfo = function(edge) {
    //console.log(edge);
    var edgeType = edge.data("linkType");
    if (edgeType === "K1" || edgeType === "PARENT" || edgeType === "CASE") {
      var myObject = new Object();
      myObject.linkType = edgeType;
      myObject.sourceTin = edge.data("source").substring(1, 10);
      myObject.sourceTinType = edge.data("source").substring(0, 1);
      myObject.targetTin = edge.data("target").substring(1, 10);
      myObject.targetTinType = edge.data("target").substring(0, 1);
      myObject.taxYear = edge.data("taxYear");
      var servletParams = JSON.stringify(myObject);

      //console.log(myObject);
      Y.getLinkInfo(servletParams);
    } else {
      alert(
        "Not a K1, PARENT, or CASE type link -> No Link Info\nEdge Type: " +
          edgeType
      );
    }
  };

  Y.getLinkInfoHandler = function(data) {
    Y.getStyledElement(data.linkInfoXml);
  };

  /*
   * Group Detail Info
   * now resembles expand graph
   */

  // Group Detail
  Y.getGroupDetailInfo = function(graphId, cyNode, cy, payee) {
    //console.log(nodeId);
    // need to get the tin type of the other node.
    var nodeId = cyNode.data("id");
    var oppTin;
    var linkType = "";
    var oppositeNodeXtin = Y.getGroupLinkXTinFromNodeId(nodeId);
    var title = cyNode.data("title");
    var groupType = Y.lookUpGroupTypeFromGroupNode(cyNode.data("title"));
    var numberOfNodes = parseInt(title.substring(0, title.indexOf(" ")));

    // Valid relationship types are PAYER, PAYEE, PARENT, SUBSIDIARY, and CASESSN
    if (groupType.indexOf("Payee") >= 0) {
      linkType = "PAYEE";
    } else if (groupType.indexOf("Payer") >= 0) {
      linkType = "PAYER";
    } else if (groupType.indexOf("Subsidiaries") >= 0) {
      linkType = "SUBSIDIARY";
    } else if (groupType.indexOf("CaseSSN") >= 0) {
      linkType = "CASESSN";
    }
    // TODO Are there group PARENT node examples I can test with?
    //parent nodes have been removed (aug 2019)
    else if (groupType.indexOf("") >= 0) {
      linkType = "PARENT";
    } else {
      alert("Unknown link type");
      return;
    }

    //Detached groupNodes will return null opposite node.
    if (oppositeNodeXtin != null) {
      var nodeList = Y.getAllRegularNodesAsString(graphId, 0, false);
      var addressList = Y.getAllAddressNodesAsString(graphId);
      var preparerList = Y.getAllPreparerNodesAsString(graphId);
      var myObject = new Object();
      myObject.tinList = oppositeNodeXtin.substr(1);
      myObject.tinTypeList = oppositeNodeXtin.substring(0, 1);
      myObject.taxYear = Y.getGroupLinkTaxPeriodFromNodeId(nodeId);
      myObject.tiers = 1;
      myObject.nodes = numberOfNodes + 1;
      //myObject.existingNodeList = nodeList == null ? "" : nodeList.toString();
      myObject.existingNodeList = "";
      myObject.addressNodeList =
        addressList == null ? "" : addressList.toString();
      myObject.preparerNodeList =
        preparerList == null ? "" : preparerList.toString();
      myObject.linksToFollow = "";
      myObject.linksToDraw = linkType;
      // issue 387 UI - Group details
      myObject.limitType = "NA";
      myObject.limitValue = "NA";
      myObject.limitDirection = "NA";

      let targetPayees = [];
      let payeeTinTypes = [];
      let tinType = Y.GRAPHS[graphId].V[nodeId].data.tinType;

      Y.GRAPHS[graphId].E.forEach((item) => {
        if (
          item.data.sourceId === nodeId &&
          item.data.targetId.indexOf("GROUP") === -1
        ) {
          payeeTinTypes.push(
            Y.GRAPHS[graphId].V[item.data.targetId].data.tinType
          );
          //targetPayees.push(Y.getTinFromNodeId(item.data.targetId));
          targetPayees.push(Y.GRAPHS[graphId].V[item.data.targetId].id);
        }
      });
      // console.log(targetPayees);
      //length of targetPayees plus one = nodes
      let payeeExistingNodeList = [];
      //remove target payees from the list of nodes so oracle will process those target payees
      nodeList.forEach((v, i, a) => {
        let flag = false;
        targetPayees.forEach((item) => {
          if (item === v.replace(/\'/g, "")) {
            flag = true;
          }
        });
        if (!flag) {
          payeeExistingNodeList.push(v);
        }
        flag = false;
      });
      let hasPayees = true;
      if (payee) {
        if (targetPayees.length === 0) hasPayees = false;
        myObject.linksToDraw = "PAYEE";
        if (nodeId.indexOf("GROUP") === -1) {
          //console.log("not a group node");
          //myObject.nodes = targetPayees.length + 1;
          //Issue#115 -  Dramatically increase the number of nodes because we are quite sure exactly how many there are
          myObject.nodes = 800000; // Issue#115 - increase max nodes to 800,000, should cover it
          //myObject.nodes = 1;
          myObject.tinList = Y.getTinFromNodeId(nodeId);
          myObject.taxYear = Y.getTaxPeriodFromNodeId(nodeId);
          // myObject.tinTypeList = payeeTinTypes.join();
          myObject.tinTypeList = Y.GRAPHS[graphId].V[nodeId].data.tinType;
          // myObject.linksToDraw = nodeId;
          //myObject.existingNodeList = payeeExistingNodeList.join();
          myObject.existingNodeList = "";
        } else {
          //console.log("is a group node");
          myObject.tinList = Y.GRAPHS[graphId].initTin;
        }
      }
      //if payee, must have payees to continue
      // if (!hasPayees) {
      //   alert("No Payees Found");
      //   return;
      // }
      console.log(JSON.stringify(myObject));
      Y.getGroupNodeDetails(myObject, nodeId, graphId, cy, payee);
    }
  };

  // based off of Flex code
  // Class: GraphWindow
  // Function: showGroupNodeDetailHandler
  Y.showGroupNodeDetailHandler = function(
    graphId,
    data,
    myObject,
    linkTin,
    cy
  ) {
    // bypass the part where we write to file for now
    //console.log("showGroupNodeDetailHandler");
    // I need to cobble together a title

    Y.loadGroupNodeDetailsWindow(
      graphId,
      data.groupNodeDetailsXml,
      myObject,
      linkTin,
      cy
    );
  };

  // for group node details
  Y.loadGroupNodeDetailsWindow = function(graphId, xml, myObject, linkTin, cy) {
    //console.log("loadGroupNodeDetailsWindow");
    //var transformed = xmldoc.transformNode(xsl);
    var xmlDoc = $.parseXML(xml);
    let $xml = $(xmlDoc);

    //var title = $xml.find( "Title" ).text();
    var title = "temp title";
    //graphProcessor.getTin(oppositeNode)+graphProcessor.getTinTypeStringFromNode(oppositeNode)+" TY"+graphProcessor.lookupTaxYearFromGraph(graphCanvas.graph);

    var sourceNodeTin = $xml
      .find("SourceNodeTin")
      .text()
      .trim();
    var groupType = Y.lookUpGroupTypeFromGroupNode(sourceNodeTin);
    //get oppNodeTin
    let oppNodeTin = Y.lookupNodeOppositeGroupNode(graphId, linkTin);
    if (groupType.toUpperCase() === "PAYEE") {
      groupType = "Payees";
    } else if (groupType.toUpperCase() === "PAYER") {
      groupType = "Payers";
    } else if (groupType.toUpperCase() === " SUBSIDIARY") {
      groupType = "Subsidiaries";
    }

    //1 determine if its a group node
    //if not a group - get nodes oppNodeTin - whicih will be its own tin not an opposite node
    // pass either oppnodetin or its own tin to be formatted
    // this solves problem 1
    let tinTitle = oppNodeTin;
    // console.log(myObject);
    // console.log(oppNodeTin);
    //let tinType = Y.getTinTypeString(oppNodeTin);
    if (!linkTin.indexOf("GROUP") > -1 || oppNodeTin === null) {
      console.log(linkTin);
      tinTitle = linkTin;
      // tinType = Y.getTinTypeString(linkTin);
    } else {
      tinTitle = tinTitle.slice(1);
    }

    // fix for Gitlab ticket #287
    // tinTitle = tinTitle.split("_")[0];
    tinTitle = tinTitle.split("_")[1];
    // if tin has 10 digits, extract string starts with second position
    if (tinTitle.length === 10) {
      tinTitle = tinTitle.substring(1);
      console.log("tinTitle: " + tinTitle);
    }

    //if group node
    //if payee

    // 2 issues - group node vs payee in getting the tin (group gets opposite node tin)
    // formatting the tin once its obtaine
    // incomming myobject.oppnodetintype is coming null, at least for payees
    if (groupType !== null) {
      title =
        Y.GROUP_DETAIL[groupType + "TITLE"] +
        " for " +
        tinTitle +
        // tinType +
        " TY" +
        myObject.taxYear;
      //continue on into the js files
      Y.detailsModalCallback(graphId, title, groupType, linkTin, xml, cy);
      // Y.loadNodeDetailsWindow(graphId, title, groupType, linkTin, xml, cy);
      //pass back out to app.js function set in global yk1 object
      //Y.detailsModalCallback(graphId, title, groupType, linkTin, xml);
    }
  };

  // note
  // @groupType is included specifically for RoboHydra so I can differentiate the type of expansion it is
  // to be able to get the correct "data" back
  /*
   * @tinList - list of TINs delimited by Y.DELIMITER
   * @tinTypeList - list of tinTypes delimited by Y.DELIMITER
   */
  Y.expandNodes = function(
    graphId,
    tinList,
    tinTypeList,
    hops,
    nodes,
    linksToFollow,
    linksToDraw,
    sourceNodeId,
    taxPeriod,
    cy,
    limitType,
    limitValue,
    limitDirection
  ) {
    console.log("expandNodes");
    var nodeList = Y.getAllRegularNodesAsString(graphId, 0, false);
    var addressList = Y.getAllAddressNodesAsString(graphId);
    var preparerList = Y.getAllPreparerNodesAsString(graphId);

    var myObject = new Object();
    myObject.tinList = tinList;
    myObject.tinTypeList = tinTypeList;
    myObject.taxYear = taxPeriod;
    myObject.tiers = hops;
    myObject.nodes = nodes;
    myObject.existingNodeList = nodeList == null ? "" : nodeList.toString();
    myObject.addressNodeList =
      addressList == null ? "" : addressList.toString();
    myObject.preparerNodeList =
      preparerList == null ? "" : preparerList.toString();
    myObject.linksToFollow =
      linksToFollow == null ? "" : linksToFollow.toString();
    myObject.linksToDraw = linksToDraw == null ? "" : linksToDraw.toString();

    if (
      limitType === "" ||
      typeof limitType === "undefined" ||
      limitType === "NA"
    ) {
      /* Issue #389 UI - Expand graph - pass NA values */
      myObject.limitType = "NA";
      myObject.limitValue = "NA";
      myObject.limitDirection = "NA";
    } else {
      /* Issue #388 UI - New and Expand Graph popups - add new traversal fields */
      myObject.limitType = limitType;
      myObject.limitValue = limitValue;
      myObject.limitDirection = limitDirection;
    }

    var servletParams = JSON.stringify(myObject);
    console.log("serveltparams " + servletParams);
    console.log("graphid " + graphId);
    console.log("sourceNodeId " + sourceNodeId);
    Y.getExpandGraph(servletParams, graphId, sourceNodeId, cy);
  };

  Y.showExpandGraphForm = function(graphId, node) {
    $("#expandGraphSubmit").click(function() {
      Y.getExpandGraphParams(graphId, node);
    });

    $("#expandGraphDiv").popup("show");
  };

  Y.getExpandGraphParams = function(
    graphId,
    nodeList,
    cy,
    expandGraphHops,
    expandGraphMaxNodes,
    limitType,
    limitValue,
    limitDirection
  ) {
    console.log("getExpandGraphParams");
    var taxYear = "";
    //if incoming is multiple nodes
    if (Array.isArray(nodeList)) {
      var tinList = "";
      var tinTypeList = "";

      for (var i = 0; i < nodeList.length; i++) {
        let xtin = Y.getXTinFromNodeId(nodeList[i]);
        let tin = xtin.substr(1);
        let tinType = xtin.substring(0, 1);
        tinList += tin + Y.DELIMITER;
        tinTypeList += tinType + Y.DELIMITER;

        if (taxYear === "") {
          taxYear = Y.getTaxPeriodFromNodeId(nodeList[i]);
        }
        if (taxYear !== Y.getTaxPeriodFromNodeId(nodeList[i])) {
          alert(
            "Please select only entities with the same tax periods to expand node"
          );
          return;
        }
      }

      nodeList = null;
    } else {
      // make sure it's the child node
      if (nodeList.indexOf("parent") !== -1) {
        nodeList = nodeList.substring(5);
      }
      var xtin = Y.getXTinFromNodeId(nodeList);
      tinList = xtin.substr(1);
      tinTypeList = xtin.substring(0, 1);
      taxYear = Y.getTaxPeriodFromNodeId(nodeList);
    }

    // var expandGraphHops = $("#expandGraphMaxHops").val();
    // var expandGraphMaxNodes = $("#expandGraphMaxNodes").val();
    // don't go any further right now since code is not updated
    Y.expandNodes(
      graphId,
      tinList,
      tinTypeList,
      expandGraphHops,
      expandGraphMaxNodes,
      null,
      null,
      nodeList,
      taxYear,
      cy,
      limitType,
      limitValue,
      limitDirection
    );
  };

  /*
   * RTF
   */
  Y.setUpRtf = function(graphId, nodeId) {
    // RTF - tin1 is a TIN

    var tin = Y.getTinFromNodeId(nodeId);
    var myObject = new Object();
    myObject.taxYear = Y.getTaxPeriodFromNodeId(nodeId);
    myObject.tin1 = tin;
    myObject.tin2 = null;
    myObject.dataSource = Y.getNodeDataSource(graphId, nodeId);
    //console.log(myObject);

    Y.getRtfData(myObject, graphId);
  };

  Y.setUpRtfForLink = function(graphId, edge, cy) {
    // K1 - tin1 and tin2 are XTINs
    var myObject = new Object();
    myObject.taxYear = Y.getTaxPeriodFromNodeId(edge.data("source"));
    myObject.tin1 = Y.getXTinFromNodeId(edge.data("source"));
    myObject.tin2 = Y.getXTinFromNodeId(edge.data("target"));
    myObject.dataSource = "K1";
    //console.log(myObject);
    Y.getRtfData(myObject, graphId);
  };

  Y.getRtfHandler = function(data, graphId, myObject) {
    //console.log("getRtfHandler");

    // formList object could come back as a collection of multiple things or just a single object
    if (((data.formList === null) !== data.formList.length) === 0) {
      alert(
        "It appears this TIN has an issue with the RTF data mappings." +
          "Please email the yK1 helpdesk and include the following sentence: \n" +
          "\tRTF issue TIN: " +
          myObject.tin1,
        "RTF DATA ISSUE"
      );
    } else {
      var windowName = "";
      if (myObject.dataSource === "K1") {
        windowName = "K1 Data - " + myObject.tin1 + " to " + myObject.tin2;
      } else {
        windowName = "BRTF Data for " + myObject.tin1;

        if (myObject.dataSource === "1040") {
          windowName = "IRTF Data for " + myObject.tin1;
        }
      }

      Y.createFormLinks(data.formList, windowName);
    }
  };

  /*
   * new graph from node
   */
  Y.newGraphSetup = function(nodeId) {
    //console.log(nodeId);

    // open the search form
    Y.toggleSearchForm();
    // disable the tin type field
    //$("input[name=tinTypeRadio]").attr('disabled', true);
    //$("input[name=tinTypeRadio][value='" + nodeId.substr(0,1) + "']").prop("checked",true);
    // disable the tin field
    $("#tins").attr("disabled", true);
    $("#tins").val(nodeId.substr(1, 9));
  };

  Y.checkForTinsNotGraphable = function() {
    if (Y.ungraphableTins.length > 0) {
      var HTMLstring = "";
      HTMLstring +=
        "<p>The TIN you entered is neither  payee nor a payer, <br>therefore no graph was generated.</p>";
      HTMLstring += "<p><table>";
      HTMLstring += "<tr><th>Tax Year</th><th>TIN</th><th>Tin Type</th></tr>";

      for (var i = 0; i < Y.ungraphableTins.length; i++) {
        var ungraphableTin = Y.ungraphableTins[i];
        HTMLstring += "<tr><td>" + ungraphableTin.taxYear + "</td>";
        HTMLstring += "<td>" + ungraphableTin.tin + "</td>";
        HTMLstring +=
          "<td>" + Y.TIN_TYPE_ID[ungraphableTin.tinType] + "</td></tr>";
      }
      HTMLstring += "</table></p>";
      HTMLstring +=
        "<p><input type='button' onclick='$(\"#ungraphableTins\").popup(\"hide\")' value='Close'></p>";

      $("#ungraphableTins").html(HTMLstring);
      $("#ungraphableTins").popup("show");

      // reset the array
      Y.ungraphableTins = [];
    }
  };

  Y.replaceWithAllNodes = function(graphId, groupNode, cy) {
    var groupNodeTitle = groupNode.data("title");
    var groupNodeTin = groupNode.data("id");
    var groupNodeCount = parseInt(
      groupNodeTitle.substring(0, groupNodeTitle.indexOf(" "))
    );
    if (groupNodeCount > 9999) {
      //Don't allow creation of 10K nodes
      alert(
        groupNodeCount + " nodes are too many to add to the graph.",
        "Too Many Nodes"
      );
    } else if (groupNodeCount > 99) {
      //Confirm is more than 100 nodes will be added
      if (
        window.confirm(
          "Are you sure you want to add " +
            groupNodeCount +
            " nodes to the graph?"
        )
      ) {
        if (groupNodeCount > 999) {
          //Re-Confirm is more than 1000 nodes will be added
          if (
            window.confirm(
              groupNodeCount +
                " is an exceptionally large number of nodes to add to\nthe graph and will take a very long time to generate.\n\n" +
                "Are you really sure you want to add " +
                groupNodeCount +
                " nodes to the graph?\n "
            )
          ) {
            Y.callReplaceWithAllNodes(
              groupNodeTin,
              groupNode,
              groupNodeCount,
              null,
              cy
            );
          }
        } else {
          Y.callReplaceWithAllNodes(
            graphId,
            groupNodeTin,
            groupNode,
            groupNodeCount,
            cy
          );
        }
      }
    } else {
      Y.callReplaceWithAllNodes(
        graphId,
        groupNodeTin,
        groupNode,
        groupNodeCount,
        cy
      );
    }
  };

  Y.callReplaceWithAllNodes = function(
    graphId,
    groupNodeTin,
    groupNode,
    numberOfNodes,
    cy
  ) {
    //console.log("callReplaceWithAllNodes");
    // opposite Node is the linkTin
    var oppositeNode = Y.getGroupLinkXTinFromNodeId(groupNodeTin);
    var label = Y.lookUpGroupTypeFromGroupNode(groupNode.data("title"));

    // Valid relationship types are PAYER, PAYEE, PARENT, SUBSIDIARY, and CASESSN
    var linkType = "";
    if (label.indexOf("Payee") >= 0) {
      linkType = "PAYEE";
    } else if (label.indexOf("Payer") >= 0) {
      linkType = "PAYER";
    } else if (label.indexOf("Subsidiaries") >= 0) {
      linkType = "SUBSIDIARY";
    }
    // TODO Are there group PARENT node examples I can test with?
    else if (label.indexOf("") >= 0) {
      linkType = "";
    } else if (label.indexOf("CaseSSN") >= 0) {
      linkType = "CASESSN";
    } else {
      alert("Unknown link type");
      return;
    }
    let sourceXID = Y.getXIDgivenGroupNodeID(graphId, groupNode);
    var oppNodeTin = oppositeNode.substr(1);

    var taxPeriod = Y.getGroupLinkTaxPeriodFromNodeId(groupNodeTin);
    //Detached groupNodes will return null opposite node.

    if (oppositeNode != null) {
      Y.expandNodes(
        graphId,
        oppNodeTin,
        oppositeNode.substring(0, 1),
        1,
        numberOfNodes + 1,
        linkType,
        null,
        sourceXID,
        taxPeriod,
        cy
      );

      Y.deleteNode(graphId, groupNodeTin, cy);
    }
  };

  Y.deleteNodes = function(graphId, cy) {
    // delete node is one where we want to check for the selection and delete
    // everything in the selection
    var selectedNodes = cy.elements(":selected");
    for (var i = 0; i < selectedNodes.length; i++) {
      // removeEdgeDiv(cy, selectedNodes[i].data("id"));

      Y.deleteAttachedGroupNodes(graphId, cy, selectedNodes[i].data("id"));
      Y.deleteNode(graphId, selectedNodes[i].data("id"), cy);
    }
  };

  //find and delete attached group nodes
  Y.deleteAttachedGroupNodes = function(graphId, cy, nodeId) {
    let edges = cy.edges();
    edges.forEach((item) => {
      //if input node source, check target
      if (item.data("source") === nodeId) {
        if (item.data("target").indexOf("GROUP") !== -1) {
          Y.deleteNode(graphId, item.data("target"), cy);
        }
        //if input node is target, check source
      } else if (item.data("target") === nodeId) {
        if (item.data("source").indexOf("GROUP") !== -1) {
          Y.deleteNode(graphId, item.data("source"), cy);
        }
      }
    });
  };

  Y.deleteNode = function(graphId, nodeId, cy) {
    //console.log("here");
    //console.log("deleteNode: " + nodeId);
    // check to see if it's a group, address, preparer node - these are not compound nodes
    var node = Y.GRAPHS[graphId].V[nodeId];
    // delete from the graph
    var nodeToRemove = cy.getElementById(nodeId);
    if (node != null) {
      //if k1, remove edge
      // removeEdgeDiv(cy, nodeId);
      if (node.data["nodeType"] === Y.NODE_TYPE_NODE) {
        // our main node is the child, so only remove it if it's the child node
        cy.remove(nodeToRemove);
        // delete from our graph object
        Y.removeNodeEdges(graphId, nodeId);
        Y.removeNode(graphId, nodeId);
      } else {
        // for address, preparer, group nodes, just delete
        // remove from graph
        cy.remove(nodeToRemove);
        // delete from our graph object
        Y.removeNodeEdges(graphId, nodeId);
        Y.removeNode(graphId, nodeId);
      }

      // update stats
      Y.updateStats(graphId, 0);
    }
  };

  Y.displayLegend = function() {
    let config =
      "toolbar=no, menubar=no, location=no, directories=no, status=no, height=500, width=1000";

    var newWindow = window.open("Legend.html", "yK1 Expiring", config);
    newWindow.focus();
  };
  Y.getNodeXTinFromNodeId = function(nodeId) {
    return nodeId.substring(0, 10);
  };

  return Y;
};

export default yk1Controller;
