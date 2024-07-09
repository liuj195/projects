console.log("input");
const graphInput = function(G) {
  // These functions pertain to loading files from disk
  G.inputEventAdded = false;
  G.outputEventAdded = false;
  G.loadFile = function() {
    if (!G.inputEventAdded) {
      // Add an event listener to the button before programmatically clicking it
      document
        .getElementById("fileInput")
        .addEventListener("change", G.readSingleFile, false);
      G.inputEventAdded = true;
    }
    document.getElementById("fileInput").value = null;
    document.getElementById("fileInput").click(); // Click the hidden button
  };

  G.readSingleFile = function(file, graphId) {
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      var contents = e.target.result;
      G.loadGraphML(contents, graphId);
    };
  };

  G.loadGraphML = function(
    contents,
    graphId,
    cytoDiv,
    handleAddRTF,
    newGraphFromNode,
    expandGraphFromNode
  ) {
    var graphData = JSON.parse(contents);
    var taxYear = graphData.taxYear;

    var initialTin = "";

    G.addGraph(graphId, taxYear, initialTin);
    //console.log(G.GRAPHS[graphId]);
    // load the nodes

    var nodes = graphData.nodes;

    for (let i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.nodeType === G.NODE_TYPE_ADDRESS) {
        G.addAddressNode(
          graphId,
          node,
          node.sourceNodeXtin,
          taxYear,
          false,
          null,
          null
        );
      } else if (node.nodeType === G.NODE_TYPE_PREPARER) {
        G.addPreparerNode(
          graphId,
          node,
          node.sourceNodeXtin,
          taxYear,
          false,
          null,
          null
        );
      } else {
        G.getNode(graphId, node, taxYear);
        // check for initial Tin?
        if (node.isInitial) {
          initialTin = node.tin;
        }
      }
    }

    // go back and set the initialTin
    G.GRAPHS[graphId].initTin = initialTin;

    // load the edges
    //G.getEdges(graphData.edges, taxYear);
    var edges = graphData.edges;
    for (let i = 0; i < edges.length; i++) {
      var edge = edges[i];
      //console.log(edge);
      if (edge.linkType === G.NODE_TYPE_ADDRESS) {
        G.addAddressEdge(graphId, edge.sourceId, edge.targetId, false);
      } else if (edge.linkType === G.NODE_TYPE_PREPARER) {
        //G.addPreparerEdge(graphId, edge, taxYear, false);
        G.addPreparerEdge(graphId, edge.sourceId, edge.targetId, false);
      } else {
        G.getEdge(graphId, edge, taxYear);
      }
    }

    /****
     *
     * COMMENTED OUT LOADCYTO AND DIVID
     */

    // add the tab
    //var divId = TAB.addNewTab(graphId, buttonVal, displayGraph);

    //draw the graph
    /** let cyto = YK1.loadCyto(
      graphId,
      cytoDiv,
      true,
      false,
      this.handleAddRTF,
      this.newGraphFromNode,
      this.expandGraphFromNode
    ); */

    let cyto = G.loadCyto(
      graphId,
      cytoDiv,
      true,
      true,
      handleAddRTF,
      newGraphFromNode,
      expandGraphFromNode
    );
    return cyto;
    //Only need to pass in new cy object to make this run
    //divID is going to be a cytoscape div that is passed in (probably newly created)
  };
  // End disk loading block

  G.saveFile = function(graphId, cy) {
    // currently assuming we're dealing with a single graph window, not compare graph
    // get the active window

    //let cy = G.loadCyto(graphId, "cy", true);

    if (graphId === null || graphId === "") {
      // do nothing. nothing here to save
      console.log("Trying to save graph, no graph id");
      return;
    }

    var nodeList = [];
    var edgeList = [];
    var taxYear = "";

    // write out the non-preparer nodes
    var nodes = cy.$("node");

    for (let i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      //console.log(node);
      var nodeId = node.data("id");
      if (nodeId.indexOf("parent") === -1) {
        // for each node, we want to obtain from cytsocape
        // nodeId
        // x,y position

        nodeId = node.data("id");

        var nodePosX = node.position("x");
        var nodePosY = node.position("y");

        var graphNode = G.GRAPHS[graphId].V[nodeId];

        let data = graphNode.data;

        // set tax year if we haven't already
        if (data.isInitial) {
          taxYear = data["taxPeriod"].substring(0, 4);
        }

        var nodeData;

        if (data["nodeType"] === G.NODE_TYPE_ADDRESS) {
          nodeData = {
            nodeId: nodeId,
            posX: nodePosX,
            posY: nodePosY,
            nodeType: data["nodeType"],
            // original address node data
            address: data["address"],
            count: data["count"],
            xtins: data["xtins"],
            sourceNodeXtin: data["sourceNodeXtin"],
            taxPeriod: data["taxPeriod"],
          };
        } else if (data["nodeType"] === G.NODE_TYPE_PREPARER) {
          nodeData = {
            nodeId: nodeId,
            posX: nodePosX,
            posY: nodePosY,
            nodeType: data["nodeType"],
            // original preparer node data
            name: data["name"],
            count: data["count"],
            preparerType: data["preparerType"],
            xtin: data["xtin"],
            xtins: data["xtins"],
            sourceNodeXtin: data["sourceNodeXtin"],
          };
        } else {
          nodeData = {
            nodeId: nodeId,
            posX: nodePosX,
            posY: nodePosY,
            nodeType: data["nodeType"],
            // original node data
            tin: data["tin"],
            tinType: data["tinType"],
            name: data["name"],
            dataType: data["type"],
            flags: data["flags"],
            isInitial: data["isInitial"],
            entityType: data["entityType"],
            mft: data["mft"],
            tpi: data["tpi"],
            assets: data["assets"],
            linkTin: data["linkTin"],
            groupNode: data["groupNode"],
            negativeFlow: data["negativeFlow"],
            positiveFlow: data["positiveFlow"],
            taxPeriod: data["taxPeriod"],
            isRealTaxPeriod: data["isRealTaxPeriod"],
          };
        }

        nodeList.push(nodeData);
      }
    }

    // write out the edges
    var edges = cy.$("edge[edgeType != 'PREPARER']");
    for (let i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var source = edge.data("source");
      var target = edge.data("target");
      var graphEdgeIndex = G.findEdge(graphId, source, target, graphId);
      let data = G.GRAPHS[graphId].E[graphEdgeIndex].data;

      var edgeData;
      // dotted lines can be both address or preparer
      if (edge.data("lineStyle") === "dotted") {
        edgeData = {
          sourceId: data["sourceId"],
          targetId: data["targetId"],
          linkType: G.GRAPHS[graphId].E[graphEdgeIndex].edgeType, // also known as edgeType
          //sourceNodeXtin: data["sourceNodeXtin"]
        };
      } else {
        edgeData = {
          sourceId: data["sourceId"],
          targetId: data["targetId"],
          linkType: data["linkType"], // also known as edgeType
          linkLabel: data["linkLabel"], // also known as edgeLabel
          negative: data["negative"],
          thickness: data["thickness"],
          tinPerfection: data["tinPerfection"],
          positiveFlow: data["positiveFlow"],
          negativeFlow: data["negativeFlow"],
          k1Count: data["k1Count"],
        };
      }
      edgeList.push(edgeData);
    }

    var graphOut = {
      taxYear: taxYear,
      nodes: nodeList,
      edges: edgeList,
    };

    let dataString = JSON.stringify(graphOut);
    let tin = G.GRAPHS[graphId].initTin;
    let year = G.GRAPHS[graphId].taxYear;
    let splitTINS = tin.split("\t");
    if (splitTINS.length > 2) {
      tin = splitTINS[0] + "_" + splitTINS[1] + "_" + "multi";
    }
    let fileName = "yK1 " + tin + " " + year + ".yK1";

    download(dataString, fileName, "text");
    //solution for chrome to force a prompt asking for file name
    /**
     * download(
      dataString,
      prompt("Filename?", "server.log") || "server.log",
      "text"
    );
     */
    return dataString;
  };

  function download(data, filename, type) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    //base 64 encoding
    //data = btoa(data);
    var file = new Blob([data], { type: type });
    //let base64File = btoa(data);

    if (window.navigator.msSaveOrOpenBlob)
      // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      // Others
      var url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  G.changeActive = function(newActive) {
    G.V = G.GRAPHS[newActive].V;
    G.E = G.GRAPHS[newActive].E;
    G.NUM_NODES = G.V.length;
    G.ACTIVE_GRAPH = newActive;
  };

  ////////////////////////////////////////////////////////////////////////////////
  // Functions below are to support UI buttons
  ////////////////////////////////////////////////////////////////////////////////

  G.uiPresetGrid = function() {
    G.clear();
    G.initGrid(G.presetParamA, G.presetParamB);
    G.loadCyto();
  };
  G.uiPresetTorus = function() {
    G.clear();
    G.initTorus(G.presetParamA, G.presetParamB);
    G.loadCyto();
  };
  G.uiPresetPrefAttach = function() {
    G.clear();
    G.initPrefAttach(G.presetParamC);
    G.loadCyto();
  };
  G.uiPresetRandom = function() {
    G.clear();
    G.initRandom(G.presetParamC, G.presetParamD);
    G.loadCyto();
  };
  G.uiPresetDemo = function() {
    G.clear();
    G.initDemo();
    G.loadCyto();
  };
  G.uiPresetMockG = function() {
    G.clear();
    G.initMockG(G.presetParamC);
    G.loadCyto();
  };

  return G;
};

export default graphInput;
