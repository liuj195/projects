/**
 *
 */
import $ from "jquery";
const graphProcessor = function(Y) {
  /* given string  filter out dashes */

  //Percentage Label Constants
  const NA_TEXT = "n/a";
  const LT_ONE_PERCENT = "<1";

  Y.addSelectedItemsToGraph = function(
    graphId,
    nodeId,
    groupType,
    title,
    selectedDetailItems,
    cy
  ) {
    let linkType = Y.LINK_TYPE_K1;
    let taxPeriod = Y.GRAPHS[graphId].V[nodeId].data["taxPeriod"];

    if (!taxPeriod) taxPeriod = Y.getGroupLinkTaxPeriodFromNodeId(nodeId);

    if (selectedDetailItems.length === 0) return;
    // groupType is numeric, GROUP_NODE_TYPE_XXX is not
    if (groupType === Y.GROUP_NODE_TYPE_ADDRESS) {
      linkType = Y.LINK_TYPE_ADDRESS;
    } else if (groupType === Y.GROUP_NODE_TYPE_PREPARER) {
      linkType = Y.LINK_TYPE_PREPARER;
    } else {
      if (
        groupType === Y.GROUP_NODE_TYPE_PAYER ||
        groupType === Y.GROUP_NODE_TYPE_PAYEE
      ) {
        linkType = Y.LINK_TYPE_K1;
      }
      if (
        groupType === Y.GROUP_NODE_TYPE_SUB ||
        groupType === Y.GROUP_NODE_TYPE_PARENT
      ) {
        linkType = Y.LINK_TYPE_PARENT;
      }
      if (groupType === Y.GROUP_NODE_TYPE_CASESSN) {
        linkType = Y.LINK_TYPE_CASE;
      }
    }
    var tinColName = Y.GROUP_DETAIL[groupType + "TIN"];
    var tinTypeColName = Y.GROUP_DETAIL[groupType + "TINTYPE"];

    var queryNodes = [];

    for (var i = 0; i < selectedDetailItems.length; i++) {
      var node = selectedDetailItems[i];
      var queryObject = [];
      // address/preparer
      queryObject.push(node[tinColName]);
      queryObject.push(node[tinTypeColName]); // check Flex code, actually an if/else statement for this
      queryObject.push(linkType);
      queryNodes.push(queryObject);
    }

    selectedDetailItems = []; //reset list of items

    // groupType added to pass along for Robohydra purposes
    Y.addNodesToGraph(graphId, queryNodes, nodeId, groupType, taxPeriod, cy);
    return false;
  };

  Y.addNodesToGraph = function(
    graphId,
    nodeList,
    nodeId,
    groupType,
    taxPeriod,
    cy
  ) {
    var tinList = "";
    var tinTypeList = "";
    var queryNode;
    var nodeTin;
    var nodeType;

    for (var i = 0; i < nodeList.length; i++) {
      queryNode = nodeList[i];
      nodeTin = queryNode[0];

      if (
        queryNode[2] === Y.LINK_TYPE_K1 ||
        queryNode[2] === Y.LINK_TYPE_CASE
      ) {
        nodeType = Y.getTinTypeFromK1(queryNode[1]); // see Flex. graphProcessor.getTinTypeFromK1(querynode[1])
      } else {
        nodeType = queryNode[1];
      }

      // look for illegal values
      if (
        nodeType === Y.TIN_TYPE_GROUP ||
        nodeType === Y.TIN_TYPE_ADDRESS ||
        nodeType === Y.TIN_TYPE_PREPARER
      ) {
        continue;
      }
      if (nodeTin === "000000000" || nodeTin === "999999999") {
        continue;
      }

      tinList += nodeTin + Y.DELIMITER;
      tinTypeList += nodeType + Y.DELIMITER;
    }

    Y.expandNodes(
      graphId,
      tinList,
      tinTypeList,
      0,
      0,
      null,
      null,
      nodeId,
      taxPeriod,
      cy
    );
  };

  Y.getTypeFromMFT = function(entity) {
    var mft = parseInt(entity.mft);
    var type;

    switch (mft) {
      case Y.MFT_1040:
        type = "INDIVIDUAL";
        break;
      case Y.MFT_1065:
        type = "PARTNERSHIP";
        break;
      case Y.MFT_1041:
        type = "TRUST";
        break;
      case Y.MFT_1120:
        type = "CORPORATION";
        break;
      case Y.MFT_1120S:
        type = "SCORPORATION";
        break;
      case Y.MFT_1120V:
        type = "OTHER1120";
        break;
      case Y.MFT_990EZ:
      case Y.MFT_990:
      case Y.MFT_5227:
        type = "TEGE";
        break;
      default:
        type = "UNKNOWN";
    }

    return type;
  };

  Y.getNodeDataSource = function(graphId, nodeId) {
    var node = Y.GRAPHS[graphId].V[nodeId];
    var mft = node.data["mft"];
    var dataSource = "";
    mft = parseInt(mft);

    switch (mft) {
      case Y.MFT_1040:
        dataSource = "1040";
        break;
      case Y.MFT_1065:
        dataSource = "1065";
        break;
      case Y.MFT_1041:
        dataSource = "1041";
        break;
      case Y.MFT_1120:
        dataSource = "1120";
        break;
      case Y.MFT_1120S:
        dataSource = "1120S";
        break;
      case Y.MFT_1120V:
        dataSource = "1120VAR";
        break;
      case Y.MFT_990EZ:
      case Y.MFT_990:
      case Y.MFT_5227:
        dataSource = "TEGE";
        break;
      default:
        dataSource = "TEGE5500";
    }

    return dataSource;
  };

  Y.isEntityForeign = function(flags) {
    return flags != null && flags.length > 2 && flags.charAt(2) === "1";
  };

  Y.isEntityITin = function(flags) {
    return flags != null && flags.length > 3 && flags.charAt(3) === "1";
  };

  Y.isEntityHaven = function(flags) {
    return flags != null && flags.length > 4 && flags.charAt(4) === "1";
  };

  Y.isEntityShelter = function(flags) {
    return flags != null && flags.length > 5 && flags.charAt(5) === "1";
  };

  Y.isEntityHasForm5500 = function(flags) {
    return flags != null && flags.charAt(0) === "1";
  };

  Y.isEntityGroupNode = function(tinType) {
    return tinType != null && tinType === Y.TIN_TYPE_GROUP;
  };

  Y.lookUpGroupTypeFromGroupNode = function(groupNodeTin) {
    // and trim, don't forget trim
    return groupNodeTin.substr(groupNodeTin.lastIndexOf(" ") + 1);
  };

  /*
   * Given a group node, find the single entity on the other side of the edge, since
   * group nodes connect to only one node
   */
  Y.lookupNodeOppositeGroupNode = function(graphId, groupNodeTin) {
    var edges = Y.GRAPHS[graphId].E;
    var oppTin = null;
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      if (groupNodeTin === edge.a) {
        oppTin = edge.b;
        break;
      } else if (groupNodeTin === edge.b) {
        oppTin = edge.a;
        break;
      }
    }

    return oppTin;
  };

  /*
   * Given a group nodes label, find the single entity on the other side of the edge, since
   * group nodes connect to only one node
   */
  Y.getXIDfromGroupNodeID = function(graphId, groupNodeId) {
    let edges = Y.GRAPHS[graphId].E;
    let returnId = "";
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].data.sourceId === groupNodeId) {
        returnId = edges[i].data.targetId;
      }
    }
    return returnId;
  };

  /*
   * Same as Y.getXIDfromGroupNodeID but checks against both target and source id's
   */
  Y.getXIDgivenGroupNodeID = function(graphId, groupNodeId) {
    let edges = Y.GRAPHS[graphId].E;
    let returnId = "";
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].data.sourceId === groupNodeId) {
        returnId = edges[i].data.targetId;
      } else if (edges[i].data.targetId === groupNodeId) {
        returnId = edges[i].data.sourceId;
      }
    }
    return returnId;
  };
  // Y.lookupNodeOppositeGroupNodeFromLabel = function(graphId, groupNodeLabel) {
  //   let nodes = Y.GRAPHS[graphId].V;
  //   let groupNodeId = "";
  //   //get tin from label
  //   console.log(groupNodeLabel);
  //   for (let key in nodes) {
  //     if (nodes.hasOwnProperty(key)) {
  //       console.log(nodes[key]);
  //       if (nodes[key].id.indexOf(groupNodeLabel) > -1) {
  //         console.log(nodes[key]);
  //         groupNodeId = nodes[key].TIN;
  //       }
  //     }
  //   }
  //   // let oppTin = Y.getGroupLinkXTinFromNodeId(groupNodeId);
  //   let splitValue = groupNodeLabel + "_";
  //   let oppTin = groupNodeId.split(splitValue)[1];
  //   console.log(oppTin);
  //   return oppTin;
  // };

  /*
   *
   */
  Y.hasRTF = function(tinType, flags, mftType) {
    // individuals
    var irtfInd = false;
    //
    if (
      mftType === "INDIVIDUAL" &&
      flags != null &&
      flags.length > 5 // ||
      //(mftType === "UNKNOWN" && !Y.isEntityHasForm5500(flags))
    ) {
      irtfInd = flags.charAt(6);

      if (irtfInd === 0) return false;
      else return true;
    } else if (mftType === "UNKNOWN" && Y.isEntityHasForm5500(flags)) {
      return false;
    } else {
      return true;
    }
  };

  /**
   * Gets text description of TIN Type (useful for window titles).
   * The default is " (EIN)" and is only changed if "0" or "1" is passed in
   * 	- therefore this works correctly for EINs from K-1s ("3") or BRTF ("2").
   */
  Y.getTinTypeString = function(tinType) {
    var tinTypeString = " (EIN)"; //Default
    if (tinType === Y.TIN_TYPE_SSN) tinTypeString = " (SSN)";
    else if (tinType === Y.TIN_TYPE_INVALID) tinTypeString = " (Invalid)";
    else if (tinType === Y.TIN_TYPE_UNKNOWN) tinTypeString = "";
    return tinTypeString;
  };

  Y.getTinTypeFromK1 = function(k1TinType) {
    // could be passed a null
    if (k1TinType === null) return Y.TIN_TYPE_INVALID;
    // K-1 code 0 = valid SSN
    else if (k1TinType === Y.TIN_TYPE_SSN) return Y.TIN_TYPE_SSN;
    // K-1 code 3 = valid EIN
    else if (k1TinType === Y.TIN_TYPE_K1EIN) return Y.TIN_TYPE_EIN;
    //K-1 code 1 = invalid (default in case of some other value)
    else return Y.TIN_TYPE_INVALID;
  };

  // sourceNodeId and the raw data values from web service
  Y.calculateAllocationPercentage = function(sourceNodeId, link) {
    var positiveFlow;
    var negativeFlow;
    var positivePercentage = 0;
    var negativePercentage = 0;
    var labelOut;

    if (link.positiveFlow != null) {
      positiveFlow = link.positiveFlow;
      if (isNaN(positiveFlow) || positiveFlow === 0) {
        positiveFlow = 0;
      }
      if (Y.sourceNodePositiveFlows[sourceNodeId] != null) {
        positivePercentage = calculatePercentage(
          parseInt(positiveFlow),
          parseInt(Y.sourceNodePositiveFlows[sourceNodeId])
        );
      }
    }

    if (link.negativeFlow != null) {
      negativeFlow = link.negativeFlow;
      if (isNaN(negativeFlow) || negativeFlow === 0) {
        negativeFlow = 0;
      }
      if (Y.sourceNodeNegativeFlows[sourceNodeId] != null) {
        negativePercentage = calculatePercentage(
          parseInt(link.negativeFlow),
          parseInt(Y.sourceNodeNegativeFlows[sourceNodeId])
        );
      }
    }

    //Redundancy check, when link labels are zero, no flow is populated, check total out of source node, if no flows out drop n/a
    if (
      link.label === "0" &&
      positivePercentage === null &&
      negativePercentage === null
    ) {
      if (Y.sourceNodePositiveFlows[sourceNodeId] === 0) {
        positiveFlow = 0;
        positivePercentage = NA_TEXT;
      }
    }
    //console.log(positiveFlow +"|"+ positivePercentage +"|"+ negativeFlow +"|"+ negativePercentage);
    labelOut = createFlowLabel(
      positiveFlow,
      negativeFlow,
      positivePercentage,
      negativePercentage,
      link.k1Count
    );

    if (labelOut === null) {
      //If its not a K1 keep the old link label
      labelOut = link.label;
    }
    return labelOut;
  };

  /**
   *
   * @param numerator Absolute value from an individual link
   * @param denominator Summation of all the link values from a given source node
   * @return Allocation Percentage number (as an absolute value)
   *
   */
  function calculatePercentage(numerator, denominator) {
    var calculatedPercent;
    var calculatedNumber;
    //Prevent errors relating to dividing by zero
    if (denominator != null && denominator !== 0) {
      if (numerator === 0 || numerator === null) {
        calculatedPercent = "0";
      } else {
        //calculate
        calculatedNumber = (Math.abs(numerator) / Math.abs(denominator)) * 100;
        if (calculatedNumber > 0 && Math.round(calculatedNumber) === 0) {
          //special case for demonstrating less than 1% values
          calculatedPercent = LT_ONE_PERCENT;
        } else {
          calculatedPercent = Math.round(calculatedNumber).toString();
        }
      }
    } else {
      //no flows means not applicable to percentages
      calculatedPercent = NA_TEXT;
    }
    return calculatedPercent;
  }
  /**
   * Combines all the values that make up a label, and finalizes the format for display
   * @param positiveFlow Number representing the total postive flows for all K1s on a given link
   * @param negativeFlow Number representing the total negative flows for all K1s on a given link
   * @param percentPositive String of Preformatted positive percent for display
   * @param percentNegative String of Preformatted positive percent for display
   * @param k1Count String representing the number of K1s represented in the link
   * @return String of formatted link label.
   *
   * Per Larry:
   * - If only one amount is present, display only that amount, not the opposing $0
   * - If both lines are zero, display $0
   * - number of K1s should appear on line 3 if there are more than 1 Ks
   */
  function createFlowLabel(
    positiveFlow,
    negativeFlow,
    percentPositive,
    percentNegative,
    k1Count
  ) {
    var labelOut = "";

    if (
      (isNaN(positiveFlow) || positiveFlow === "0") &&
      (isNaN(negativeFlow) || negativeFlow === "0")
    ) {
      labelOut = "$0";
    } else if (positiveFlow === "0" && negativeFlow !== "0") {
      labelOut = writeNegativeFlow(
        Y.formatThousandSeparator(negativeFlow),
        padPercent(percentNegative)
      );
    } else if (positiveFlow !== "0" && negativeFlow === "0") {
      labelOut = writePositiveFlow(positiveFlow, padPercent(percentPositive));
    } else {
      //Positive label goes first traditionally... make sure flow and allocation are listed.
      labelOut = writePositiveFlow(positiveFlow, padPercent(percentPositive));

      //Calculated Negativesc
      if (!isNaN(negativeFlow)) {
        if (labelOut !== "") {
          labelOut = labelOut + "\n";
        }

        labelOut =
          labelOut +
          writeNegativeFlow(negativeFlow, padPercent(percentNegative));
      }
    }

    //Add k1Count if it exists
    if (k1Count != null && k1Count > 1) {
      labelOut = labelOut + "\n# K1s:" + k1Count;
    }
    return labelOut;
  }

  function writePositiveFlow(positiveFlow, percentage) {
    return (
      "+" + Y.formatThousandSeparator(positiveFlow).toString() + percentage
    );
  }

  function writeNegativeFlow(negativeFlow, percentage) {
    return Y.formatThousandSeparator(negativeFlow).toString() + percentage;
  }

  /**
   * Sets up the appropriate label padding so output is consistent
   * @param percent String of the percentage
   * @return String display for percentage
   */
  function padPercent(percent) {
    var i = percent.length;
    var percentOut;
    if (percent === NA_TEXT) {
      //n/a text meaning no flows for a k1 label
      percentOut = " ~ " + percent;
    } else if (percent === LT_ONE_PERCENT) {
      //Less then one percent, has a special character for dealing with <
      percentOut = " ~ " + percent + "%";
    } else if (i === 3) {
      percentOut = " ~" + percent + "%";
    } else if (i === 2) {
      percentOut = " ~ " + percent + "%";
    } else if (i === 1) {
      percentOut = " ~  " + percent + "%";
    }
    return percentOut;
  }

  /*
   * Creates the graph title based on the query tin(s)
   */
  Y.generateGraphTitle = function(tin, tinType, taxYear) {
    var graphTitleTin = tin;
    var titleOut = "Graph for ";
    if (graphTitleTin.indexOf(Y.DELIMITER) > -1) {
      //Multiple tins - Inspect tin list, to determine if there are multiple unique
      var tinList = graphTitleTin.split(Y.DELIMITER);
      var uniqueTinList = [];
      for (var tmpTin in tinList) {
        if (Y.getItemArrayIndex(uniqueTinList, tmpTin) === -1) {
          uniqueTinList.push(tmpTin);
        }
      }
      //Limit title to first tin
      graphTitleTin = graphTitleTin
        .substring(0, graphTitleTin.indexOf(Y.DELIMITER))
        .trim();
      //A10089- Remove yK1 internal prefixes from the TIN in the graph title - Srikar Gottipati on 6/29/2015
      if (graphTitleTin.length > 9) {
        graphTitleTin = graphTitleTin.substring(1);
      }

      if (uniqueTinList.length > 1) {
        //Add et al if there were multiple unique tins
        graphTitleTin = graphTitleTin + " et al.";
      }
    } else {
      //A10089- Remove yK1 internal prefixes from the TIN in the graph title - Srikar Gottipati on 6/29/2015
      if (graphTitleTin.length > 9) {
        graphTitleTin = graphTitleTin.substring(1);
      }
      // Single tin - append tin type to tin if known
      graphTitleTin = graphTitleTin + Y.getTinTypeString(tinType);
    }

    titleOut = titleOut + graphTitleTin + " " + taxYear;
    /*if(taxYearModel.isPartial){
			titleOut = titleOut + " " + taxYearModel.displayComments;
		}*/
    return titleOut;
  };

  /**
   * Gets text description of TIN Type (useful for window titles).
   * The default is " (EIN)" and is only changed if "0" or "1" is passed in
   * 	- therefore this works correctly for EINs from K-1s ("3") or BRTF ("2").
   */
  Y.getTinTypeString = function(tinType) {
    var tinTypeString = " (EIN)"; //Default
    if (tinType === Y.TIN_TYPE_SSN) tinTypeString = " (SSN)";
    else if (tinType === Y.TIN_TYPE_INVALID) tinTypeString = " (Invalid)";
    else if (tinType === Y.TIN_TYPE_UNKNOWN) tinTypeString = "";
    return tinTypeString;
  };

  //pass in node and graph
  //get 8 vectors around node
  //iterate over list of nodes to see if any of them intersect (must build vector for each)
  //set second array with true/false values indicating availability from above iteration
  //ieterate over available spots
  //pass back object with available spot set, along with x and y deltas (not sure what these are yet)
  //if node is null function is calling "gettopleftnode" probably pulling top leftest most node

  //provide x,y and size of square
  Y.createRectangle = function(x, y, size) {
    let halfSize = size * 0.5;
    return {
      left: x - halfSize,
      top: y - halfSize,
      right: x + halfSize,
      bottom: y + halfSize,
    };
  };

  //pass in 2 rectangles objects to see if they intersect
  Y.doesIntersect = function(r1, r2) {
    return !(
      r2.left > r1.right ||
      r2.right < r1.left ||
      r2.top > r1.bottom ||
      r2.bottom < r1.top
    );
  };
  Y.getWidthOfText = function(txt) {
    let tempElement = document.createElement("span");
    document.body.appendChild(tempElement);
    tempElement.innerText = txt;
    let offset = tempElement.offsetWidth;
    //IE11 compatability
    if (!("remove" in Element.prototype)) {
      Element.prototype.remove = function() {
        if (this.parentNode) {
          this.parentNode.removeChild(this);
        }
      };
    }
    tempElement.remove();
    return offset;
  };

  //cannot use cytoscape labels because we are going to remove them from the canvas
  //must use labels from yK1's edge data
  Y.getLabelFromYk1Graph = function(edge, cyEdges) {
    let edgeLabel = null;
    let source = edge.data("source");
    let target = edge.data("target");
    if (cyEdges) {
      cyEdges.forEach((item) => {
        let cySource = item.data.source;
        let cyTarget = item.data.target;
        if (cySource === source && cyTarget === target) {
          edgeLabel = item.data.label;
        }
      });
      return edgeLabel;
    }
  };

  Y.getStyledElement = function(xml) {
    let xmlDoc = $.parseXML(xml);
    let $xml = $(xmlDoc);
    let title = $xml.find("Title").text();

    let maxStringWidth = Y.getWidthOfText(title);
    // open new window with image of the graph
    // NOTE not using options right now. default print full graph
    let HTMLstring = "<HTML>\n";
    // HTMLstring += "<HEAD>\n";
    // HTMLstring += "<TITLE>" + title + "</TITLE>\n";
    // HTMLstring += "</HEAD>\n";
    HTMLstring += "<BODY>\n";
    // HTMLstring += "<div style='text-align:center;'><b>" + title + "</b></div>";
    // translated this section from the Flex code:
    // class: GraphWindow
    // function: getStyledElement
    console.log($xml.find("InfoLine").length);
    if (!$xml.find("InfoLine").length) HTMLstring += "No Data Found";
    $xml.find("InfoLine").each(function() {
      let label = $(this)
        .find("label")
        .text()
        .trim();
      if (label === "SPACER") {
        HTMLstring += "<hr/>";
      } else {
        let data = $(this)
          .find("data")
          .text()
          .trim();
        var isNumber = $(this)
          .find("isNumber")
          .text()
          .trim();

        if (label.length === 0) {
          var layout = $(this)
            .find("Layout")
            .text()
            .trim();
          var color = $(this)
            .find("color")
            .text()
            .trim();

          // if no label, center text on the line
          var style = "";

          //l.percentWidth = 100;
          style += '<span style="';
          style += "font-family: 'Verdana';";
          style += "font-size: '10px';";
          style += "font-weight: 'bold';";

          if (layout != null && layout.length > 0 && layout === "LEFT") {
            style += "text-align: 'left';";
          } else {
            style += "text-align: 'center;'";
          }

          if (color !== null && color.length > 0 && color !== "DEFAULT") {
            style += "color: '" + color + "';";
          }
          let stringWidth = Y.getWidthOfText(data);
          //maxStringWidth
          if (stringWidth > maxStringWidth) {
            maxStringWidth = stringWidth;
          }
          HTMLstring += style;
          HTMLstring += '">' + data + "</span><br>";
        } else {
          // label with data value
          //console.log("label: " + label + "|data: " + data);
          //Add two labels elements in a line.  One for label, one for data
          //var hg:HGroup = new HGroup();
          //hg.percentWidth = 100;

          var style1 = "";
          var style2 = "";

          //var l1:spark.components.Label = new spark.components.Label();
          //l1.percentWidth = 50;
          style1 += "font-family:Verdana;";
          style1 += "font-size:10px;";
          style1 += "font-weight:bold;";
          style1 += "text-align:right;";

          //var l2:spark.components.Label = new spark.components.Label();
          //l2.percentWidth = 50;
          style2 += "font-family:Verdana;";
          style2 += "font-size:10px;";
          style2 += "font-weight:bold;";
          style2 += "text-align:left;";

          var isNum = isNumber.toLowerCase();
          //console.log("isNumber: " + isNum);

          if (isNum === "true") {
            Y.formatThousandSeparator(data);
            //if (data.charAt(0) === "-") {
            if (parseInt(data) < 0) {
              //console.log("negative number");
              style1 += "color:#FF0000;";
            }

            HTMLstring += '<span style="' + style1 + '">';
            HTMLstring += data;
            HTMLstring += "&nbsp;&nbsp;</span>";
            HTMLstring += '<span style="' + style2 + '">';
            HTMLstring += label;
            HTMLstring += "</span><br>";
          } else {
            HTMLstring += '<span style="' + style1 + '">';
            HTMLstring += label;
            HTMLstring += "&nbsp;&nbsp;</span>";
            HTMLstring += '<span style="' + style2 + '">';
            HTMLstring += data;
            HTMLstring += "</span><br>";
          }
        }
      }
    });

    HTMLstring += "</BODY>\n";
    HTMLstring += "</HTML>";

    maxStringWidth += 30;
    //minimum width
    if (maxStringWidth < 200) {
      maxStringWidth = 200;
    }
    let returnObj = { HTMLstring, maxStringWidth, title };
    Y.nodeAndLinkInfoCallback(returnObj);
  };
  Y.getTopLeftNode = function(nodes) {
    let position = {};
    let boundingBox;
    let x = window.innerWidth;
    let y = window.innerHeight;
    for (let i = 1; i < nodes.length; i++) {
      if (nodes[i].position().x < x) {
        if (nodes[i].position().y < y) {
          position.x = nodes[i].position().x;
          position.y = nodes[i].position().y;
          boundingBox = nodes[i].boundingBox();
        }
      }
    }
    return { position, boundingBox };
  };
  Y.setNodeLocation = function(sourceNode, cy) {
    let nodeLocator = {};
    let cyNode = cy.elements("node#" + sourceNode);
    let boundingBox = cyNode.boundingBox();
    let position = cyNode.position();
    let width = boundingBox.w;
    let height = boundingBox.h;
    let spacing = 100;
    let size = 10;
    let availLocations = [];
    let nodes = cy.nodes();
    // console.log(sourceNode);
    // console.log(cy.elements());
    // console.log(cy.elements("node#"));
    // console.log(cyNode);
    // console.log(boundingBox);
    // console.log(position);
    if (!position) {
      //if position cannot be located, top left node
      let topLeftNode = Y.getTopLeftNode(nodes);
      position = topLeftNode.position;
      boundingBox = topLeftNode.boundingBox;
    }

    //create 8 rectangles based on source nodes x/y
    //10 extra to see label
    availLocations[0] = Y.createRectangle(
      position.x,
      position.y + height + spacing + 10,
      size
    );
    availLocations[1] = Y.createRectangle(
      position.x + width + spacing,
      position.y + height + spacing + 10,
      size
    );
    availLocations[2] = Y.createRectangle(
      position.x - (size + spacing),
      position.y + height + spacing + 10,
      size
    );
    availLocations[3] = Y.createRectangle(position.x, position.y - size, size);
    availLocations[4] = Y.createRectangle(
      position.x + width + spacing,
      position.y,
      size
    );
    availLocations[5] = Y.createRectangle(
      position.x - (size + spacing),
      position.y,
      size
    );
    availLocations[6] = Y.createRectangle(
      position.x + width + spacing,
      position.y - (size + spacing),
      size
    );
    availLocations[7] = Y.createRectangle(
      position.x - (size + spacing),
      position.y - (size + spacing),
      size
    );

    //iterate over nodes to check if they intersect
    for (let i = 0; i < nodes.length; i++) {
      let position = nodes[i].position();
      let boundingBox = nodes[i].boundingBox();
      let nodeRect = (position.x, position.y, boundingBox.w);
      for (let k = 0; k < availLocations.length; k++) {
        if (Y.doesIntersect(availLocations[k], nodeRect)) {
          nodeLocator.location = availLocations[k];
          break;
        }
      }
    }
    //reform nodeLocator bounding box back into x,y
    let location = nodeLocator.location;
    let x = location.left + location.right / 2;
    let y = location.top + location.bottom / 2;
    //adjust height and width
    if (x > window.innerWidth) x = window.innerWidth * 0.95;
    if (y > window.innerHeight * 0.8) y = window.innerHeight * 0.6;
    nodeLocator.location = {
      x: x,
      y: y,
    };
    return nodeLocator;
  };

  /*
   * Iteration 1
   * We're going for an approximate match here, just ignore the month part of the tax year
   */
  Y.getApproximateMatchNode = function(graphId, xtin, taxYear) {
    var nodeIdPrefix = xtin + "_" + taxYear;
    var nodeArray = [];

    for (var nodeId in Y.GRAPHS[graphId].V) {
      if (
        Y.GRAPHS[graphId].V[nodeId] != null &&
        Y.GRAPHS[graphId].V.hasOwnProperty(nodeId)
      ) {
        // XTIN_TAXPERIOD is the node id format
        // GROUPID_XTIN_TAXPERIOD is group node and would also match if it were indexOf >= 0
        if (nodeId.indexOf(nodeIdPrefix) === 0) {
          nodeArray.push(nodeId);
        }
      }
    }

    return nodeArray;
  };

  Y.getXTinFromNodeId = function(nodeId) {
    // TIN_TAXPERIOD
    if (nodeId) {
      var nodeIdArray = nodeId.split("_");
      return nodeIdArray[0];
    }
  };
  Y.formedForCSV = function(data) {
    let returnData = [];

    data.forEach((item) => {
      let row = [];
      for (let key in item) {
        if (item.hasOwnProperty(key)) {
          row.push(item[key]);
        }
      }
      returnData.push(row + "\n");
    });
    return returnData;
  };
  Y.getTinFromNodeId = function(nodeId) {
    // TIN_TAXPERIOD
    if (nodeId) {
      var nodeIdArray = nodeId.split("_");
      return nodeIdArray[0].substring(1);
    }
  };

  Y.getTaxPeriodFromNodeId = function(nodeId) {
    // TIN_TAXPERIOD
    if (nodeId) {
      var nodeIdArray = nodeId.split("_");
      return nodeIdArray[1];
    }
  };

  // for group nodes, the id is in the form:
  // GROUPX_XTIN_TAXPERIOD
  // where XTIN_TAXPERIOD is the opposite node's node id
  Y.getGroupLinkXTinFromNodeId = function(nodeId) {
    if (nodeId) {
      var nodeIdArray = nodeId.split("_");
      return nodeIdArray[1];
    }
  };
  Y.getNumNodesFromGroupId = function(nodeId) {
    if (nodeId) {
      var nodeIdArray = nodeId.split("_");
      return nodeIdArray[1];
    }
  };
  Y.getGroupLinkTaxPeriodFromNodeId = function(nodeId) {
    if (nodeId) {
      var nodeIdArray = nodeId.split("_");
      return nodeIdArray[2];
    }
  };

  return Y;
};

export default graphProcessor;
