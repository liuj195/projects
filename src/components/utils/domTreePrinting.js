import { toggleAllNames, toggleAllLinkAmounts, detectIE } from "./utils";
import YK1 from "../../js/yk1/yk1";

export const createNodeShapeSVGS = (node) => {
  let type = node.data("type");
  //switch
  switch (type) {
    case "INDIVIDUAL":
      createIndividual(node);
      return;
    case "UNKNOWN":
      createUnknown(node);
      return;
    case "GROUP":
      createGroupNode(node);
      return;
    case "TRUST":
      createTrustNode(node);
      return;
    case "PARTNERSHIP":
      createPartnership(node);
      return;
    case "CORPORATION":
      createCorporation(node);
      return;
    case "TEGE":
      createTege(node);
      return;
    case "SCORPORATION":
      createSCorporation(node);
      return;
    case "OTHER1120":
      createOther(node);
      return;
    case "ADDRESS":
      createAddress(node);
      return;
    case "PREPARER":
      createPreparer(node);
      return;
    default:
      console.log(type);
      return;
  }
};
const createEdge = (edge) => {
  let isIe = detectIE();
  //allpts takes the form [xstart,ystart,x,y,x,y,xend,yend]
  let pointsArray = edge.rscratch("allpts");
  //gets furthest left, furthest right, top most and bottom most points [left,top,right,bottom] used for svg dimensions
  let startingEndingPoints = getStartEndPoint(pointsArray);
  if (pointsArray.length >= 4) {
    //set starting x/y
    let pathString = "M" + pointsArray[0] + " " + pointsArray[1];
    for (let i = 2; i < pointsArray.length; i = i + 2) {
      pathString =
        pathString + " L" + pointsArray[i] + " " + pointsArray[i + 1];
    }
    let positionX = startingEndingPoints[0];
    let positionY = startingEndingPoints[1];
    //parentDiv is a specific component (nodeHtmlLabel) that positions each element
    let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
      .children[3];
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let svgNS = svg.namespaceURI;
    //pathString = "M1885 -20 L400 130 Z";
    //create svg arrow
    let marker = createMarkerArrow(edge.data("lineColor"));

    // let borderWidth = edge.data("borderWidth");
    svg.style.position = "absolute";
    svg.classList.add("DOM_SVG");
    svg.style.top = positionY;
    svg.style.left = positionX;
    svg.style.overflow = "visible";
    svg.style.width = startingEndingPoints[2] - startingEndingPoints[0];
    svg.style.height = startingEndingPoints[3] - startingEndingPoints[1];
    svg.appendChild(marker);

    let path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathString);
    path.setAttribute("marker-end", "url(#" + edge.data("lineColor") + ")");
    //reverse sign to translate back
    positionX = positionX * -1;
    positionY = positionY * -1;
    if (isIe) {
      positionX = "50%";
      positionY = "50%";
    }
    path.setAttribute(
      "transform",
      "translate(" + positionX + "," + positionY + ")"
    );

    let strokeWidth = edge.data("width");
    if (strokeWidth > 2) {
      strokeWidth = strokeWidth * 0.4;
    }
    path.setAttribute("stroke-width", strokeWidth);
    path.setAttribute("fill", "none");
    //path.setAttribute("stroke-width", 10);
    path.setAttribute("stroke", edge.data("lineColor"));
    svg.appendChild(path);
    parentDiv.appendChild(svg);
  } else {
    return;
  }
};

//creates svg arrow
const createMarkerArrow = (color, svgNS) => {
  let marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
  marker.setAttribute("id", color);
  marker.setAttribute("markerWidth", "10");
  marker.setAttribute("markerHeight", "10");
  marker.setAttribute("refX", "4");
  marker.setAttribute("refY", "4");
  marker.setAttribute("orient", "auto");
  marker.setAttribute("stroke", color);

  let arrowPath = document.createElementNS(svgNS, "path");
  arrowPath.setAttribute("d", "M0,1 L8,4 0,8");
  arrowPath.setAttribute("fill", color);
  marker.appendChild(arrowPath);
  return marker;
};
//points come in array form [x,y,x,y]
const getStartEndPoint = (points) => {
  let startingEndingPoints = [0, 0, 0, 0];
  //finds extremes  [left,top,right,bottom]
  for (let i = 0; i < points.length; i++) {
    //x's are even y's are odd
    let isOdd = i % 2;
    if (isOdd) {
      //first pass, set intial valuse
      if (startingEndingPoints[1] === 0) {
        startingEndingPoints[1] = points[i];
        startingEndingPoints[3] = points[i];
      } else {
        if (points[i] < startingEndingPoints[1]) {
          startingEndingPoints[1] = points[i];
        }
        if (points[i] > startingEndingPoints[3]) {
          startingEndingPoints[3] = points[i];
        }
      }
    } else {
      //first pass, set intial valuse
      if (startingEndingPoints[0] === 0) {
        startingEndingPoints[0] = points[i];
        startingEndingPoints[2] = points[i];
      } else {
        if (points[i] < startingEndingPoints[0]) {
          startingEndingPoints[0] = points[i];
        }
        if (points[i] > startingEndingPoints[2]) {
          startingEndingPoints[2] = points[i];
        }
      }
    }
  }
  return startingEndingPoints;
};
const createPreparer = (node) => {
  let personIMG = document.createElement("img");
  //node.position("x") + 77, node.position("y") + 38)
  personIMG.setAttribute("src", "person.svg");
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  personIMG.style.position = "absolute";
  personIMG.classList.add("DOM_SVG");
  personIMG.style.left = node.position("x") - 45 + "px";
  personIMG.style.top = node.position("y") - 30 + "px";
  parentDiv.appendChild(personIMG);
};
const createAddress = (node) => {
  let buildingIMG = document.createElement("img");
  //node.position("x") + 77, node.position("y") + 38)
  console.log(node.data("height"));
  console.log(node.data());
  buildingIMG.setAttribute("src", "building.svg");
  buildingIMG.setAttribute("height", node.data("hgith"));
  buildingIMG.setAttribute("width", node.data("width"));
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  buildingIMG.style.position = "absolute";
  buildingIMG.classList.add("DOM_SVG");
  buildingIMG.style.left = node.position("x") - 45 + "px";
  buildingIMG.style.top = node.position("y") - 30 + "px";
  parentDiv.appendChild(buildingIMG);
};
const createTege = (node) => {
  let svg = createSVG(node.position("x") + 37, node.position("y") + 38);
  let svgNS = svg.namespaceURI;
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let polygon = document.createElementNS(svgNS, "path");
  polygon.setAttribute("d", "M32,10 L190,10 L160,70 L62,70z");
  polygon.setAttribute("fill", node.data("backgroundColor"));
  polygon.setAttribute("stroke", "black");
  polygon.setAttribute("stroke-width", node.data("borderWidth"));
  svg.appendChild(polygon);
  parentDiv.appendChild(svg);
};
const createCorporation = (node) => {
  let svg = createSVG(node.position("x") + 37, node.position("y") + 38);
  let svgNS = svg.namespaceURI;
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let polygon = document.createElementNS(svgNS, "path");
  polygon.setAttribute("d", "M62,10 L160,10 L190,70 L32,70z");
  polygon.setAttribute("fill", node.data("backgroundColor"));
  polygon.setAttribute("stroke", "black");
  polygon.setAttribute("stroke-width", node.data("borderWidth"));
  svg.appendChild(polygon);
  parentDiv.appendChild(svg);
};

const createOther = (node) => {
  let svg = createSVG(node.position("x"), node.position("y"));
  let svgNS = svg.namespaceURI;
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let hexagon = document.createElementNS(svgNS, "path");
  hexagon.setAttribute("d", "M22,10 L140,10 L165,40 L140,70 L22,70 L0,40z");
  hexagon.setAttribute("transform", "translate(65,38)");
  hexagon.setAttribute("fill", node.data("backgroundColor"));
  hexagon.setAttribute("stroke", "black");
  hexagon.setAttribute("stroke-width", node.data("borderWidth"));
  svg.appendChild(hexagon);
  parentDiv.appendChild(svg);
};
const createSCorporation = (node) => {
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let svg = createSVG(node.position("x") + 77, node.position("y") + 50);
  let svgNS = svg.namespaceURI;
  let rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("width", node.data("width") + 55);

  rect.setAttribute("height", node.data("height") + 20);
  rect.setAttribute("fill", node.data("backgroundColor"));
  rect.setAttribute("stroke", "black");
  rect.setAttribute("stroke-width", node.data("borderWidth"));
  svg.appendChild(rect);
  parentDiv.appendChild(svg);
};
const createPartnership = (node) => {
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let svg = createSVG(node.position("x") + 50, node.position("y") + 38);
  let ellipse = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "ellipse"
  );
  ellipse.setAttribute("fill", node.data("backgroundColor"));
  ellipse.setAttribute("stroke", "black");
  ellipse.setAttribute("stroke-width", node.data("borderWidth"));
  ellipse.setAttribute("cx", 100);
  ellipse.setAttribute("cy", 40);
  ellipse.setAttribute("rx", node.data("width") * 0.75);
  ellipse.setAttribute("ry", node.data("width") * 0.38);
  svg.appendChild(ellipse);
  parentDiv.appendChild(svg);
};
const createTrustNode = (node) => {
  let isIe = detectIE();
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let svg = null;

  if (isIe) {
    svg = createSVG(node.position("x") + 82, node.position("y") + 25);
  } else {
    svg = createSVG(node.position("x") + 82, node.position("y") + 25);
  }
  let polygon = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polygon"
  );
  polygon.setAttribute("fill", node.data("backgroundColor"));
  polygon.setAttribute("stroke", "black");
  polygon.setAttribute("stroke-width", node.data("borderWidth"));
  polygon.setAttribute("points", "10,50, 63,10, 120,50, 63,90 ");
  svg.appendChild(polygon);
  parentDiv.appendChild(svg);
};
const createGroupNode = (node) => {
  let svg = createSVG(node.position("x"), node.position("y"));
  let svgNS = svg.namespaceURI;
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let octagon = document.createElementNS(svgNS, "path");
  octagon.setAttribute(
    "d",
    "M22,10 L75,10 L100,30 L100,50 L75,70 L22,70 L0,50 L0,30z"
  );
  octagon.setAttribute("transform", "translate(100,38)");
  octagon.setAttribute("fill", node.data("backgroundColor"));
  octagon.setAttribute("stroke", "black");
  octagon.setAttribute("stroke-width", node.data("borderWidth"));

  svg.appendChild(octagon);
  parentDiv.appendChild(svg);
};
const createUnknown = (node) => {
  let isIe = detectIE();
  let xval = 49;
  let width = node.data("width") + 20;
  if (isIe) {
    xval = 50;
    width = width - 25;
  }
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let svg = createSVG(node.position("x") + 77, node.position("y") + 38);
  svg.style.width = node.data("width") + 220;
  let svgNS = svg.namespaceURI;
  let rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("transform", "skewX(-36)");
  rect.setAttribute("width", width);
  rect.setAttribute("x", xval);
  rect.setAttribute("y", 10);
  rect.setAttribute("height", node.data("height") + 20);
  rect.setAttribute("fill", node.data("backgroundColor"));
  rect.setAttribute("stroke", "black");
  rect.setAttribute("stroke-width", node.data("borderWidth"));
  svg.appendChild(rect);
  parentDiv.appendChild(svg);
};
const createIndividual = (node) => {
  let parentDiv = document.getElementsByTagName("canvas")[0].parentElement
    .children[3];
  let svg = createSVG(node.position("x") + 77, node.position("y") + 38);
  let svgNS = svg.namespaceURI;
  let rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("width", node.data("width") + 35);
  rect.setAttribute("x", 10);
  rect.setAttribute("y", 10);
  rect.setAttribute("height", node.data("height") + 20);
  rect.setAttribute("fill", node.data("backgroundColor"));
  rect.setAttribute("stroke", "black");
  rect.setAttribute("stroke-width", node.data("borderWidth"));
  rect.setAttribute("rx", 6);
  svg.appendChild(rect);
  parentDiv.appendChild(svg);
};
const createSVG = (x, y) => {
  let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.position = "absolute";
  svg.classList.add("DOM_SVG");
  svg.style.transform =
    "translate(-50%, -50%) translate(" + x + "px, " + y + "px)";
  svg.style.zIndex = -1;
  return svg;
};
export const positionNodeDivs = (node, cy) => {
  //address and prep nodes need something like - 50 on y posisition
  let nodeDiv = document.getElementById(node.data("id"));
  let nodeType = node.data("type");
  let yDistance = nodeType === "ADDRESS" || nodeType === "PREPARER" ? 50 : 40;
  let yPos = node.position("y") - yDistance;
  if (node.data("type") === "TRUST") {
    //trust diamond svg shapes need a bit more room
    yPos = yPos - 10;
  }
  if (nodeDiv) {
    nodeDiv.style.transform =
      "translate(-50%, -50%) translate(" +
      node.position("x") +
      "px, " +
      yPos +
      "px)";
  }
};
export const positionEdgeDivs = (graphId, cyEdges) => {
  //edges on each render
  cyEdges.forEach((edge) => {
    let edgeDiv = document.getElementById(edge.data("id"));
    let labelText = YK1.getLabelFromYk1Graph(edge, cyEdges);

    if (YK1.GRAPHS[graphId] && !YK1.GRAPHS[graphId].edgeLabels) labelText = "";
    //only on certain edges
    if (
      labelText !== undefined &&
      labelText !== "Case SSN" &&
      labelText !== "Parent/Sub"
    ) {
      const pos_edge = edge.midpoint();
      if (
        typeof edge.data("xPercent") === "undefined" ||
        edge.data("xPercent") === "null"
      ) {
        let ypos = pos_edge.y + 22;
        let xpos = pos_edge.x + 55;

        //transform is needed for positioning
        if (edgeDiv) {
          edgeDiv.style.transform =
            "translate(-50%, -50%) translate(" + xpos + "px, " + ypos + "px)";
        }
      }
    }
  });
};
export const createNodeDivs = (cyNodes, graphId, cy) => {
  cyNodes.forEach((node) => {
    let title = node.data("title");
    if (!title) {
      //for address and preparer nodes whom dont have a title attribute
      title = node.data("label");
    }
    if (title.indexOf("GROUP") === -1) {
      //bypass group nodes, they do not have these titles above the node
      //create text divs
      let didAppend = doAppend(node.data("id"), "NODE", title);
      if (didAppend) {
        positionNodeDivs(node, cy);
      }
    }
    //create and position node shapes
    createNodeShapeSVGS(node);
  });
  //toggle canvas node names OFF
  toggleAllNames(cy, graphId, false);
};
//this appends the divs where the text is located for edges and nodes
export const addEdgeDivs = (graphId, cyEdges, cy) => {
  let edgesObject = YK1.buildCyEdgeArray(graphId);
  cyEdges.forEach((edge) => {
    let title = YK1.getLabelFromYk1Graph(edge, edgesObject);
    title = title && title.indexOf("~") > 0 ? title : null;
    //create k1 edge divs where text will be located
    doAppend(edge.data("id"), "EDGE", title);
    //create actual edges
    createEdge(edge);
  });
  positionEdgeDivs(graphId, cyEdges);
  toggleAllLinkAmounts(cy, graphId, false);
};
const doAppend = (eleId, eleType, eleTitle) => {
  let elementExists = document.getElementById(eleId);
  if (!elementExists) {
    let color = eleType === "EDGE" ? "blue" : "black";
    let mainDiv = document.getElementsByTagName("canvas")[0].parentElement
      .children[3];
    let divToAppend = document.createElement("div");

    divToAppend.style.position = "absolute";
    divToAppend.style.color = color;
    if ((eleType = "EDGE")) {
      divToAppend.style.lineHeight = "13px";
      divToAppend.style.fontSize = "14px";
    }
    divToAppend.style.fontWeight = "bold";
    divToAppend.style.textAlign = "center";
    divToAppend.id = eleId;
    if (eleTitle) {
      eleTitle = eleTitle.replace(/\n/g, "<br />");
      divToAppend.innerHTML = eleTitle;
    }
    mainDiv.appendChild(divToAppend);
    return true;
  } else {
    return false;
  }
};
export const removeElementDivs = (cy, graphId) => {
  let elements = cy.elements();
  for (let i = 0; i < elements.length; i++) {
    let id = elements[i].data("id");
    let type = elements[i].data("type");
    let elementDiv = document.getElementById(id);
    // if (elementDiv && type !== "ADDRESS") {
    //   elementDiv.parentElement.removeChild(elementDiv);
    // }
    if (elementDiv) {
      elementDiv.parentElement.removeChild(elementDiv);
    }
  }
  let domSVGS = document.getElementsByClassName("DOM_SVG");
  for (let i = domSVGS.length - 1; i >= 0; i--) {
    let parentElement = domSVGS[i].parentElement;
    if (parentElement) {
      parentElement.removeChild(domSVGS[i]);
    }
  }
  //toggle canvas node names ON
  toggleAllNames(cy, graphId, true);
  toggleAllLinkAmounts(cy, graphId, true);
};
