let circleOptions = {
  name: "circle",
  nodeSep: 35,
  rankSep: 45,
  edgeSep: 28,
  spacingFactor: 0,
  fit: false, // whether to fit the viewport to the graph
  padding: 30, // the padding on fit
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
  radius: undefined, // the radius of the circle
  startAngle: (3 / 2) * Math.PI, // where nodes start in radians
  sweep: 6, // how many radians should be between the first and last node (defaults to full circle)
  clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
  sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop
  //nodeDimensionsIncludeLabels: true
};

let colaOptions = {
  edgeLength: 1, // sets edge length directly in simulation
  edgeSymDiffLength: 1, // symmetric diff edge length in simulation
  edgeJaccardLength: 1, // jaccard edge length in simulation
  padding: 30,
  name: "cola",
  nodeDimensionsIncludeLabels: true,
  animate: false, // whether to show the layout as it's running
  refresh: 1, // number of ticks per frame; higher is faster but more jerky
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: false, // on every layout reposition of nodes, fit the viewport
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

  // layout event callbacks
  ready: function() {}, // on layoutready
  stop: function() {}, // on layoutstop
  randomize: false, // use random node positions at beginning of layout
  avoidOverlap: true, // if true, prevents overlap of node bounding boxes
  handleDisconnected: true, // if true, avoids disconnected components from overlapping
  convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
  nodeSpacing: function(node) {
    return 10;
  }, // extra spacing around nodes
  flow: undefined, // use DAG/tree flow layout if specified, e.g. { axis: 'y', minSeparation: 30 }
  alignment: undefined, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }
  gapInequalities: undefined, // list of inequality constraints for the gap between the nodes, e.g. [{"axis":"y", "left":node1, "right":node2, "gap":25}]
  // iterations of cola algorithm; uses default values on undefined
  unconstrIter: undefined, // unconstrained initial layout iterations
  userConstIter: undefined, // initial layout iterations with user-specified constraints
  allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

  // infinite layout options
  infinite: false, // overrides all other options for a forces-all-the-time mode
};
let dagreOptions = {
  name: "dagre",
  nodeSep: 100, // the separation between adjacent nodes in the same rank
  edgeSep: 10, // the separation between adjacent edges in the same rank
  rankSep: 50, // the separation between each rank in the layout
  rankDir: "TB", // 'TB' for top to bottom flow, 'LR' for left to right,
  ranker: "network-simplex", // Type of algorithm to assign a rank to each node in the input graph. Possible values: 'network-simplex', 'tight-tree' or 'longest-path'
  minLen: function(edge) {
    return 1;
  }, // number of ranks to keep between the source and target of the edge
  edgeWeight: function(edge) {
    return 1;
  }, // higher weight edges are generally made shorter and straighter than lower weight edges

  // general layout options
  fit: false, // whether to fit to viewport
  padding: 30, // fit padding
  spacingFactor: 1, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
  animate: false, // whether to transition the node positions
  animateFilter: function(node, i) {
    return true;
  }, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  transform: function(node, pos) {
    return pos;
  }, // a function that applies a transform to the final node position
  ready: function() {}, // on layoutready
  stop: function() {}, // on layoutstop
};

let gridOptions = {
  name: "grid",
  nodeDimensionsIncludeLabels: true,
  fit: false, // whether to fit the viewport to the graph
  padding: 30, // padding used on fit
  zoom: undefined,
  pan: undefined,
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
  // avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
  spacingFactor: 0, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
  condense: false, // uses all available space on false, uses minimal space on true
  rows: 3, // force num of rows in the grid
  cols: 4, // force num of columns in the grid
  position: function(node) {}, // returns { row, col } for element
  sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  animateFilter: function(node, i) {
    return true;
  }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
  ready: undefined, // callback on layoutready
  stop: undefined, // callback on layoutstop
  transform: function(node, position) {
    return position;
  }, // transform a given node position. Useful for changing flow direction in discrete layouts
};

export { circleOptions, gridOptions, colaOptions, dagreOptions };
