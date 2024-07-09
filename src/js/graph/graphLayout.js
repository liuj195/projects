import $ from "jquery";

const graphLayout = function(G) {
  /*
   G.doLayout = function(options) {
     // get the active graph

     var graphId = TAB.activeGraphId;
     var cy = TAB.activeCy;
    
     //I think graphid will be passed in and cy will be the div container passed in (probably always just 'cy')
    
     var layout = cy.layout(options);
     layout.run();
   };
*/

  G.doLayout = function(options, cyto) {
    //ACTIVE TAB IS var cy = GRAPH.loadCyto(graphId, divId, true);
    // get the active graph

    // var graphId = TAB.activeGraphId;
    // var cy = TAB.activeCy;
    console.log("changing layout");

    var layout = cyto.layout(options);

    layout.run();
  };

  G.doColaLayout = function(cyto) {
    console.log("in cola layout");
    var options = {
      name: "cola",
      nodeDimensionsIncludeLabels: true
    };

    G.doLayout(options, cyto);
  };

  G.doCircularLayout = function(cyto) {
    var options = {
      name: "circle",
      nodeSep: 35,
      rankSep: 45,
      edgeSep: 28,
      fit: true, // whether to fit the viewport to the graph
      padding: 30, // the padding on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
      radius: undefined, // the radius of the circle
      startAngle: (3 / 2) * Math.PI, // where nodes start in radians
      sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
      clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
      sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
      animate: false, // whether to transition the node positions
      animationDuration: 500, // duration of animation in ms if enabled
      animationEasing: undefined, // easing of animation if enabled
      ready: undefined, // callback on layoutready
      stop: undefined // callback on layoutstop
      //nodeDimensionsIncludeLabels: true
    };

    G.doLayout(options, cyto);
  };

  G.doDagreLayout = function(cyto) {
    var options = {
      name: "dagre",
      nodeDimensionsIncludeLabels: true
    };

    G.doLayout(options, cyto);
  };

  G.doGridLayout = function(cyto) {
    var options = {
      name: "grid",
      nodeDimensionsIncludeLabels: true,
      fit: true, // whether to fit the viewport to the graph
      // padding: 30, // padding used on fit
      boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      // avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
      spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
      condense: false, // uses all available space on false, uses minimal space on true
      rows: undefined, // force num of rows in the grid
      cols: undefined, // force num of columns in the grid
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
      } // transform a given node position. Useful for changing flow direction in discrete layouts
    };

    G.doLayout(options, cyto);
  };

  G.selectGraphsToCompare = function() {
    // users need to select the graphs to compare
    var HTMLstring = "";
    HTMLstring += "<p><TABLE>";

    var count = 0;
    for (var i = 0; i < G.GRAPHS.length; i++) {
      //console.log(i);
      //console.log(G.GRAPHS[i])
      if (G.GRAPHS[i] != null && G.GRAPHS[i].initTin != null) {
        var graph = G.GRAPHS[i];
        if (count % 2 === 0) {
          HTMLstring +=
            "<TR><TD><input type='checkbox' name='compare' value='" +
            i +
            "' class='pt-checkbox'>" +
            graph.initTin +
            "-" +
            graph.taxYear +
            "</input></TD>";
        } else {
          HTMLstring +=
            "<TD><input type='checkbox' name='compare' value='" +
            i +
            "' class='pt-checkbox'>" +
            graph.initTin +
            "-" +
            graph.taxYear +
            "</input></TD>";
          HTMLstring += "</TR>";
        }
        count++;
      }
    }

    HTMLstring += "</TABLE></p>";

    HTMLstring +=
      '<p><input type="button" class="pt-button" value="Compare Graphs" onclick="GRAPH.validateCompareGraphs()">';
    HTMLstring +=
      '<input type="button" class="pt-button" value="Close" onclick="$(\'#compareGraphsSelection\').popup(\'hide\')"></p>';
    // overlay
    $("#compareGraphsSelection").html(HTMLstring);
    $("#compareGraphsSelection").popup("show");
  };

  G.validateCompareGraphs = function() {
    var $checkedItems = $("input[name=compare]:checked");

    if ($checkedItems.length > 4) {
      alert("Please select no more than 4 graphs to compare");
      return;
    } else if ($checkedItems.length === 1) {
      alert("Please select at least 2 graphs to compare");
      return;
    } else if ($checkedItems.length === 0) {
      alert("No graphs selected to compare");
      return;
    }

    G.compareGraphs();
  };

  // G.compareGraphs = function() {
  //   //console.log("setUpCompareGraphs");
  //   // create the tab
  //   var buttonVal = "Compar  e Graphs";
  //   var graphIdCompare = "compareId" + G.addCompareGraphs();
  //   //console.log(graphIdCompare);

  //   var $checkedItems = $("input[name=compare]:checked")
  //     .map(function() {
  //       return this.value;
  //     })
  //     .get();
  //   var divId = TAB.addNewTab(
  //     graphIdCompare,
  //     buttonVal,
  //     true,
  //     true,
  //     $checkedItems
  //   );

  //   $("#compareGraphsSelection").popup("hide");
  // };

  return G;
};

export default graphLayout;
