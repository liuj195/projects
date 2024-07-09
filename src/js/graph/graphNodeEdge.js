console.log("nodeedge");

const graphNodeEdge = function(G) {
  G.Graph = function(newId) {
    this.id = newId;
    this.V = [];
    this.E = [];
  };

  G.Node = function(newId) {
    this.id = newId; // This must be unique, or else nodes will overwrite each other in the dictionary.
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.degree = 0;
    this.label = "NO LABEL";
    this.TIN = "NO TIN";
    this.size = 1;
    this.edges = {};
    this.type = "UNKNOWN";
    this.flags = {};
    this.tpi = 0;
    this.totalAssets = 0;
  };

  G.Edge = function(newA, newB) {
    this.a = newA;
    this.b = newB;
    this.amount = 100;
    this.label = "";
  };

  G.addNode = function(graphId, newId) {
    G.GRAPHS[graphId].V[newId] = new G.Node(newId);
  };

  G.addNodeDefault = function(graphId, newId) {
    G.addNode(graphId, newId);
  };

  G.addEdge = function(graphId, newA, newB) {
    var currentGraph = G.GRAPHS[graphId];

    currentGraph.E[currentGraph.E.length] = new G.Edge(newA, newB);
    currentGraph.V[newA].degree++;
    currentGraph.V[newB].degree++;
    currentGraph.V[newA].edges[newB.toString()] = 2; // The source node gets a "2"
    if (!(newA.toString() in currentGraph.V[newB].edges)) {
      currentGraph.V[newB].edges[newA.toString()] = 1; // The target node gets a "1"
    }
  };

  G.addEdgeDefault = function(graphId, newA, newB) {
    G.addEdge(graphId, newA, newB);
  };

  G.removeNode = function(graphId, nodeId) {
    var nodes = G.GRAPHS[graphId].V;
    for (var i in nodes) {
      if (nodes[i] != null && nodes.hasOwnProperty(i)) {
        if (nodeId === nodes[i].id) {
          G.GRAPHS[graphId].V[i] = null;
        }
      }
    }
  };

  /*
   * Given a graphId and a nodeId, remove all the edges around that node
   */
  G.removeNodeEdges = function(graphId, nodeId) {
    var edges = G.GRAPHS[graphId].E;
    var indicesToRemove = [];

    // two step because of arrays and messing with indices
    for (let i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if (edge.a === nodeId || edge.b === nodeId) {
        indicesToRemove.push(i);
      }
    }

    // now the actual remove
    if (indicesToRemove.length > 0) {
      indicesToRemove.reverse();
      for (let i = 0; i < indicesToRemove.length; i++) {
        var indexToRemove = indicesToRemove[i];
        G.GRAPHS[graphId].E.splice(indexToRemove, 1);
      }
    }
  };

  return G;
};

export default graphNodeEdge;
