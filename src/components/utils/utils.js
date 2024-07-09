import YK1 from "../../js/yk1/yk1";
import XLSX from "xlsx";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import { useRef, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { removeElementDivs } from "./domTreePrinting";
//Remove bends from all edges
export const resetEdgeBends = (cy) => {
  let edgeCollection = cy.edges();
  for (let i = 0; i < edgeCollection.length; i++) {
    //if edge does not have this data point, it does not have edge bends, will throw error otherwise
    console.log(edgeCollection[i]);

    console.log(edgeCollection[i].style());
    //this call to style will remove bends, but it will make it impossible to re-add bends
    //  edgeCollection[i].style("curve-style", "straight");
    if (edgeCollection[i].data("cyedgebendeditingDistances")) {
      try {
        //edge bending instance
        let instance = cy.edgeEditing("get");
        if (instance) {
          let segmentPoints = instance.getSegmentPoints(edgeCollection[i]);
          removeBend(edgeCollection[i], instance, segmentPoints.length);
        }
      } catch (e) {
        console.trace(e);
      }
    }
  }
};
//segmentPoints come in pairs. EG: 4 means 2 segments, 6 means 3 pairs, 8=4pairs, etc.
export const removeBend = (edge, instance, segmentPointsLength) => {
  if (segmentPointsLength > 2) {
    for (let i = 0; i < segmentPointsLength / 2; i++) {
      //must provide index or else bend plugin will complain. Plugin has its on stack of saved edges
      instance.deleteSelectedBendPoint(edge, 0);
    }
    return;
  }
  instance.deleteSelectedBendPoint(edge, 0);
  return;
};
//custom hook, detects if first render in functional component
export const useIsMount = () => {
  const isMountRef = useRef(true);
  useEffect(() => {
    isMountRef.current = false;
  }, []);
  return isMountRef.current;
};

/**************************************
 *
 * Export to Excel
 *
 **************************************/
export const exportToExcel = (dataToExport, title) => {
  var wb = XLSX.utils.book_new();
  var date = new Date().toISOString().split("T")[0];
  wb.Props = {
    Title: "yK1 Excel data",
    Subject: "yK1",
    Author: "yK1",
    CreatedDate: date,
  };

  let ws_name = title;
  let ws_data = dataToExport;

  //turn xtin array into string.. json_to_sheets doesnt like these nested arrays
  ws_data.forEach((obj) => {
    obj.xtins = obj.xtins.join(",");
  });

  wb.SheetNames.push(ws_name);

  var ws = XLSX.utils.json_to_sheet(ws_data);
  wb.Sheets[ws_name] = ws;

  var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), title);
};
const s2ab = (s) => {
  var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  var view = new Uint8Array(buf); //create uint8array as viewer
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
  return buf;
};

/**********************************
 * Show/Hide functions
 *********************************/

export const toggleAllLinkAmounts = (cyto, graphId, toggle) => {
  if (toggle) {
    YK1.GRAPHS[graphId].edgeLabels = true;
  } else {
    YK1.GRAPHS[graphId].edgeLabels = false;
  }
  cyto.resize();
};

export const toggleAllLabels = (cyto, graphId, toggle) => {
  if (toggle) {
    toggleAllLinkAmounts(cyto, graphId, true);
    toggleAllNames(cyto, graphId, true);
    toggleAllTaxPeriods(cyto, graphId, true);
    toggleAllTins(cyto, graphId, true);
    let nodes = YK1.GRAPHS[graphId].V;
    for (let key in nodes) {
      if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
        var nodeId = nodes[key].id;
        var cyNode = cyto.$("#" + nodeId);
        let label = nodes[key].label;
        YK1.setShowHideLabelFlag(cyNode, label);
        if (cyNode.data("type") === "GROUP") {
          cyNode.removeClass("groupNodeLabels");
        }
      }
    }
  } else {
    toggleAllLinkAmounts(cyto, graphId, false);
    toggleAllNames(cyto, graphId, false);
    toggleAllTaxPeriods(cyto, graphId, false);
    toggleAllTins(cyto, graphId, false);
    let nodes = cyto.nodes();
    nodes.forEach((item) => {
      item.data("label", "");
      if (item.data("type") === "GROUP") {
        item.addClass("groupNodeLabels");
      }
    });
  }
};

// export const toggleLinkLabels = (cyto, graphId, toggle) => {
//   let edges = cyto.edges();
//   if (toggle) {
//     let cyEdges = YK1.buildCyEdgeArray(graphId);
//     cyto.remove(edges);
//     cyto.add(cyEdges);
//   } else {
//     edges.forEach(item => {
//       item.data("label", "");
//     });
//   }
// };
const getNodeTitle = (node, graphId) => {
  let nodes = YK1.GRAPHS[graphId].V;
  let nodeId = node.data("id");
  let title = null;
  if (nodes[nodeId]) {
    console.log(nodes[nodeId]);
    title = nodes[nodeId].data.label;
    if (!title) {
      title = nodes[nodeId].label;
    }
  }
  return title;
};
export const toggleAllNames = (cyto, graphId, toggle) => {
  let cyNodes = cyto.nodes();
  let nodes = YK1.GRAPHS[graphId].V;

  if (toggle) {
    for (let key in nodes) {
      if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
        //get respective cytoscape node
        // cyNode.data('id') === nodes[key].data.address

        //
        let cyNode = cyto.getElementById(nodes[key].id);
        let label = nodes[key].data.name;
        if (
          cyNode.data("nodeType") === "ADDRESS" ||
          cyNode.data("nodeType") === "PREPARER"
        ) {
          label = nodes[key].label;
          cyNode.data("label", label);
          // cyNode = cyto.nodes('[id = "' + nodes[key].data.address + '"]')[0];
        } else {
          cyNode.data("title", label);
        }
      }
    }
  } else {
    cyNodes.forEach((item) => {
      if (
        item.data("nodeType") === "ADDRESS" ||
        item.data("nodeType") === "PREPARER"
      ) {
        item.data("label", "");
      } else {
        item.data("title", "");
      }
      //item.data("showNameFlag", toggle);
    });
  }
};

export const toggleSingleName = (cyNode, graphId, toggle) => {
  let nodes = YK1.GRAPHS[graphId].V;
  for (let key in nodes) {
    if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
      if (nodes[key].id === cyNode.data("id")) {
        if (toggle) cyNode.data("title", nodes[key].data.name);
        else cyNode.data("title", "");
        // YK1.setShowHideNameFlag(cyNode, false);
      }
    }
  }
};

export const toggleAllTaxPeriods = (cyto, graphId, toggle) => {
  let nodes = YK1.GRAPHS[graphId].V;
  for (let key in nodes) {
    if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
      var nodeId = nodes[key].id;
      var cyNode = cyto.$("#" + nodeId);
      YK1.setShowHideTaxPeriodFlag(cyNode, toggle);
      YK1.showHideTinTaxYear(cyto.$("#" + nodeId));
    }
  }
  YK1.GRAPHS[graphId].showTaxPeriods = toggle;
  if (toggle) cyto.nodes().removeClass("removeTaxPeriods");
  else cyto.nodes().addClass("removeTaxPeriods");
};

export const toggleAllTins = (cyto, graphId, toggle) => {
  let nodes = YK1.GRAPHS[graphId].V;
  for (let key in nodes) {
    if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
      var nodeId = nodes[key].id;
      var cyNode = cyto.$("#" + nodeId);
      //cyNode.data("label", nodeId.substr(1));
      YK1.setShowHideTinFlag(cyNode, toggle);
      YK1.showHideTinTaxYear(cyto.$("#" + nodeId));
    }
  }
  YK1.GRAPHS[graphId].showTins = toggle;
  if (toggle) cyto.nodes().removeClass("removeTins");
  else cyto.nodes().addClass("removeTins");
};

export const toggleSingleTaxPeriod = (cyNode, graphId, toggle) => {
  let nodes = YK1.GRAPHS[graphId].V;
  for (let key in nodes) {
    if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
      if (nodes[key].id === cyNode.data("id")) {
        //toggle data
        if (toggle) cyNode.removeClass("removeTaxPeriods");
        else cyNode.addClass("removeTaxPeriods");
        // YK1.setShowHideNameFlag(cyNode, false);
      }
    }
  }
  YK1.GRAPHS[graphId].showTaxPeriods = toggle;
};

export const toggleSingleTin = (cyNode, graphId, toggle) => {
  let nodes = YK1.GRAPHS[graphId].V;
  for (let key in nodes) {
    if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
      if (nodes[key].id === cyNode.data("id")) {
        //toggle data
        if (toggle) cyNode.removeClass("removeTins");
        else cyNode.addClass("removeTins");
      }
    }
  }
  YK1.GRAPHS[graphId].showTins = toggle;
};

/****************************
 *
 * PRINTING FUNCTIONALITY
 *
 ***************************/
export const printLegend = () => {
  let cytoscapeDiv = document.getElementById("legendCy");
  html2canvas(cytoscapeDiv).then(function(canvas) {
    let imageData = canvas.toDataURL("image/png");
    printLegendCallback(imageData);
  });
};
const printLegendCallback = (imageData) => {
  let width = window.innerWidth * 0.9;
  let isIe = detectIE();
  //ie11 and older must use html2canvas
  if (isIe && isIe <= 11) {
    width = window.innerWidth * 0.5;
  }

  console.log(window.innerHeight);
  var HTMLstring = "<HTML>\n";
  HTMLstring += "<HEAD>\n";
  HTMLstring += "<TITLE></TITLE>\n";
  HTMLstring += "<style>.imgHolder span{position:absolute;}</style>\n";
  HTMLstring += "</HEAD>\n";
  HTMLstring += "<BODY>\n";
  HTMLstring += "<div class='imgHolder'>";
  HTMLstring += "<div>LEGEND</div>";
  HTMLstring += '<img src="' + imageData + '"width="' + width + 'px"/></div>';
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

export const getCombinedCanvasPNG = (cyto, id, isFull) => {
  // let cyCanvas = document.querySelector("canvas[data-id=layer2-node]");
  // let bottomLayerCanvas = document.getElementById("drawCanvas");
  // let topLayerCanvas = document.getElementById("topCanvas");

  // let printCanvas = document.createElement("canvas");
  // let printCanvasCtx = printCanvas.getContext("2d");
  // let canvasWidth = cyCanvas.width;
  // let canvasHeight = cyCanvas.height;

  // printCanvas.width = canvasWidth;
  // printCanvas.height = canvasHeight;

  // if (bottomLayerCanvas) {
  //   printCanvasCtx.drawImage(
  //     bottomLayerCanvas,
  //     0,
  //     0,
  //     canvasWidth,
  //     canvasHeight
  //   );
  // }
  // printCanvasCtx.drawImage(cyCanvas, 0, 0, canvasWidth, canvasHeight);
  // if (topLayerCanvas) {
  //   printCanvasCtx.drawImage(topLayerCanvas, 0, 0, canvasWidth, canvasHeight);
  // }
  // let titleText = document.getElementById("cyGraphInfo").textContent;
  // printCanvasCtx.font = "30px Arial";
  // printCanvasCtx.fillText(titleText, 50, 50);

  let cytoscapeDiv = document.getElementById("cy");
  let panzoom = document.getElementsByClassName("cy-panzoom")[0];
  panzoom.style.display = "none";
  let currentZoom = cyto.zoom();
  let currentPan = cyto.pan();
  if (isFull) {
    cyto.fit(cyto.elements(), 50);
    //timeout needed. label plugin needs to catch up with cytoscape fit
    window.setTimeout(function() {
      mergeDown(cytoscapeDiv, isFull, id, cyto, currentZoom, currentPan);
    }, 1000);
  } else {
    mergeDown(cytoscapeDiv, isFull, id, cyto, currentZoom, currentPan);
  }
};
const mergeDown = (cytoscapeDiv, isFull, id, cyto, currentZoom, currentPan) => {
  let isIe = detectIE();
  //ie11 and older must use html2canvas
  if (isIe && isIe <= 11) {
    html2canvas(cytoscapeDiv).then(function(canvas) {
      let imageData = canvas.toDataURL("image/png");
      YK1.printCallback(id, imageData);
      let panzoom = document.getElementsByClassName("cy-panzoom")[0];
      panzoom.style.display = "block";
      if (isFull) {
        cyto.zoom(currentZoom);
        cyto.pan(currentPan);
      }
    });
  } else {
    //chrome and edge can use htmltoimage for better resolution
    function filter(node) {
      // return node.id !== "fullscreenicon" && node.tagName !== "CANVAS";
      return node.id !== "fullscreenicon";
    }
    htmlToImage
      .toSvg(document.getElementById("outerCyDiv"), { filter: filter })
      .then(function(dataUrl) {
        YK1.printCallback(id, dataUrl);
        let panzoom = document.getElementsByClassName("cy-panzoom")[0];
        panzoom.style.display = "block";
        if (isFull) {
          cyto.zoom(currentZoom);
          cyto.pan(currentPan);
        }
        //here need to re toggle titles and edges, and remove created nodes
        removeElementDivs(cyto, id);
      });
  }
};

/**
 * detect IE
 * returns version of IE or false, if browser is not Internet Explorer
 */
export const detectIE = () => {
  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf("MSIE ");
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
  }

  var trident = ua.indexOf("Trident/");
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf("rv:");
    return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
  }

  var edge = ua.indexOf("Edge/");
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
  }

  // other browser
  return false;
};

export const getWidthOfText = (txt) => {
  if (getWidthOfText.c === undefined) {
    getWidthOfText.c = document.createElement("canvas");
    getWidthOfText.ctx = getWidthOfText.c.getContext("2d");
    getWidthOfText.ctx.font = "16pt sans-serif";
  }
  return getWidthOfText.ctx.measureText(txt).width;
};
