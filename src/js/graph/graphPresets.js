console.log("presets");

var GRAPH = (function(G) {
  G.initGrid = function(rows, cols) {
    G.NUM_NODES = rows * cols;
    for (var i = 0; i < G.NUM_NODES; i++) {
      G.addNodeDefault(i);
    }
    for (let i = 0; i < rows; i++) {
      for (var j = 0; j < cols; j++) {
        if (j < cols - 1) {
          G.addEdgeDefault(cols * i + j, cols * i + j + 1);
        }
        if (cols * i + j + cols < G.NUM_NODES) {
          G.addEdgeDefault(cols * i + j, cols * i + j + cols);
        }
      }
    }
  };

  G.initTube = function(rows, cols) {
    G.initGrid(rows, cols);
    for (let i = 0; i < G.NUM_NODES; i += cols) {
      G.addEdgeDefault(i, i + cols - 1);
    }
  };

  G.initTorus = function(rows, cols) {
    G.initTube(rows, cols);
    for (let i = G.NUM_NODES - cols; i < G.NUM_NODES; i++) {
      G.addEdgeDefault(i, (i + cols) % G.NUM_NODES);
    }
  };

  G.initPrefAttach = function(N) {
    G.NUM_NODES = N;
    G.addNodeDefault(0);
    G.addNodeDefault(1);
    G.addNodeDefault(2);
    G.addEdgeDefault(0, 1);
    G.addEdgeDefault(0, 2);
    var totalDegree = 4;
    for (let i = 3; i < N; i++) {
      G.addNodeDefault(i);
      var sum = 0;
      var pick = G.R.rand() * totalDegree;
      var toAttachTo = 0;
      for (let j = 0; j < i; j++) {
        if (sum < pick && pick < sum + G.V[j].degree) {
          toAttachTo = j;
          break;
        }
        sum += G.V[j].degree;
      }
      totalDegree += 2;
      G.addEdgeDefault(i, toAttachTo);
    }
  };

  G.initRandom = function(N, avgDegree) {
    G.NUM_NODES = N;
    for (let i = 0; i < G.NUM_NODES; i++) {
      G.addNodeDefault(i);
    }
    for (let i = 0; i < (G.NUM_NODES * avgDegree) / 2; i++) {
      var a = Math.floor(G.R.rand() * G.NUM_NODES);
      var b = Math.floor(G.R.rand() * G.NUM_NODES);
      if (a !== b) {
        G.addEdgeDefault(a, b);
      }
    }
  };

  G.initMockYK1 = function(N) {
    G.NUM_NODES = N;
    G.addNodeDefault(0);
    G.V[0].type = "PARTNERSHIP";
    G.V[0].label = "Alice";
    G.addNodeDefault(1);
    G.V[1].type = "INDIVIDUAL";
    G.V[1].label = "Bob";
    G.addNodeDefault(2);
    G.V[2].type = "CORPORATION";
    G.V[2].label = "Eve";
    G.addEdgeDefault(0, 1);
    G.addEdgeDefault(0, 2);
    var totalDegree = 4;
    for (var i = 3; i < N; i++) {
      G.addNodeDefault(i);
      var typeRand = G.R.rand();
      if (typeRand < 0.2) {
        G.V[i].type = "PARTNERSHIP";
      } else if (typeRand < 0.4) {
        G.V[i].type = "INDIVIDUAL";
      } else if (typeRand < 0.5) {
        G.V[i].type = "CORPORATION";
      } else if (typeRand < 0.6) {
        G.V[i].type = "TRUST";
      } else if (typeRand < 0.7) {
        G.V[i].type = "SCORPORATION";
      } else if (typeRand < 0.8) {
        G.V[i].type = "TEGE";
      } else if (typeRand < 0.9) {
        G.V[i].type = "OTHER1120";
      } else {
        G.V[i].type = "UNKNOWN";
      }

      if (G.R.rand() < 0.1) {
        G.V[i].flags["initialNode"] = true;
      }
      if (G.R.rand() < 0.1) {
        G.V[i].flags["flagForm5500"] = true;
      }
      if (G.R.rand() < 0.1) {
        G.V[i].flags["flagInitial"] = true;
      }
      if (G.R.rand() < 0.1) {
        G.V[i].flags["flagForeign"] = true;
      }
      if (G.R.rand() < 0.1) {
        G.V[i].flags["flagItin"] = true;
      }
      if (G.R.rand() < 0.1) {
        G.V[i].flags["flagHaven"] = true;
      }
      if (G.R.rand() < 0.1) {
        G.V[i].flags["flagShelter"] = true;
      }

      G.V[i].label = G.V[i].type + " " + i;
      var sum = 0;
      var pick = G.R.rand() * totalDegree;
      var toAttachTo = 0;
      for (var j = 0; j < i; j++) {
        if (sum < pick && pick < sum + G.V[j].degree) {
          toAttachTo = j;
          break;
        }
        sum += G.V[j].degree;
      }
      totalDegree += 2;
      G.addEdgeDefault(toAttachTo, i);
      G.E[G.E.length - 1].amount = i * 50 - 300;
    }
    for (let i = 0; i < N; i++) {
      G.V[i].TIN = "999000444";
    }
  };

  return G;
})(GRAPH || {});
