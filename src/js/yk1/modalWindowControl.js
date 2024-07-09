import $ from "jquery";
import "jsgrid";
import "jsgrid/dist/jsgrid-theme.min.css";
import "jsgrid/dist/jsgrid.min.css";

const modalWindowcontrol = function(Y) {
  const modalBody = document.getElementById("graphmodal-content");
  const element = document.getElementById("graphInfoModal");
  const midLevelDiv = document.getElementById("midLevelDiv");
  console.log(modalBody);

  let selectedDetailItems = [];
  let nodeDetailsCols = [];
  let nodeDetailsArray = [];

  window.addEventListener("click", function(e) {
    if (e.target == element) {
      //reset div for next jsgrid
      element.style.display = "none";
      console.log($("#graphmodal-content"));
      midLevelDiv.style.visibility = "hidden";
      //reset items
      selectedDetailItems = [];
    }
  });

  Y.selectItem = function(item) {
    //console.log(item);
    selectedDetailItems.push(item);
    //console.log(selectedDetailItems);
  };

  // When item unselected, removes from list
  Y.unselectItem = function(item) {
    selectedDetailItems = $.grep(selectedDetailItems, function(i) {
      return i !== item;
    });
  };

  // used by group node detail, address detail, preparer detail
  Y.loadNodeDetailsWindow = function(
    graphId,
    title,
    groupType,
    nodeId,
    xml,
    cyto
  ) {
    let modalBody = document.getElementById("graphmodal-content");
    let element = document.getElementById("graphInfoModal");
    let midLevelDiv = document.getElementById("midLevelDiv");

    element.addEventListener("click", function(e) {
      if (e.target == element) {
        //reset div for next jsgrid
        element.style.display = "none";
        console.log($("#graphmodal-content"));
        midLevelDiv.style.visibility = "hidden";
        //reset items
        selectedDetailItems = [];
      }
    });
    let rowCount = 0;
    nodeDetailsCols = [];
    nodeDetailsArray = [];
    var xmlDoc = $.parseXML(xml);
    let $xml = $(xmlDoc);

    // translated this section from the Flex code:
    // class: GraphWindow
    // function: loadNodeDetailsWindow

    $xml.find("Columns").each(function() {
      $(this)
        .find("Col")
        .each(function() {
          var columnName = $(this)
            .find("name")
            .text()
            .trim();
          var columnType = $(this)
            .find("type")
            .text()
            .trim();
          var columnWidth = $(this)
            .find("width")
            .text()
            .trim();
          let column = {
            name: columnName,
            type: columnType,
            width: columnWidth,
          };

          nodeDetailsCols.push(column);
        });
    });

    $xml.find("Row").each(function() {
      rowCount += 1;
      let rowArray = $(this).find("Col");
      let rowObject = {};
      for (let i = 0; i < rowArray.length; i++) {
        let key = nodeDetailsCols[i].name;
        rowObject[key] = rowArray[i].textContent;
      }
      nodeDetailsArray.push(rowObject);
    });
    //console.log(nodeDetailsArray);
    // const closeBtn = document.querySelector(".close");

    // closeBtn.addEventListener("click", closeModal);
    nodeDetailsCols.unshift({
      itemTemplate: function(value, item) {
        return $("<input>")
          .attr("type", "checkbox")
          .prop("checked", $.inArray(item, selectedDetailItems) > -1)
          .on("change", function() {
            $(this).is(":checked") ? Y.selectItem(item) : Y.unselectItem(item);
          });
      },
      width: 30,
      align: "center",
    });
    console.log(rowCount);
    console.log("here");
    // console.log(nodeDetailsArray);
    // console.log(nodeDetailsCols);
    let formedForCSVData = formedForCSV(nodeDetailsArray, nodeDetailsCols);
    //if row count is over 10k then need to download
    if (rowCount > 10000) {
      let confirmed = window.confirm(
        "Row count exceeds 10,000 maximum, would you like to download?"
      );
      if (confirmed) {
        let fileName = "yK1data.csv";
        if (title.indexOf("Address") > -1) fileName = "address_list.csv";
        if (title.indexOf("Preparer") > -1) fileName = "preparer_list.csv";
        console.log(formedForCSVData);
        console.log("Downloading for IE11");
        Y.download(formedForCSVData, fileName, "text/plain");
      }
    } else {
      element.style.display = "block";
      midLevelDiv.innerHTML = "";
      midLevelDiv.style.maxHeight = "44px";
      midLevelDiv.style.visibility = "visible";

      let addButton = document.createElement("input");
      addButton.type = "button";
      addButton.value = "Add Selected to Graph";
      addButton.style.fontSize = "15px";
      addButton.style.backgroundColor = "#2e8540";
      addButton.onclick = function() {
        addSelectedItemsToGraph(
          graphId,
          nodeId,
          groupType,
          title,
          selectedDetailItems,
          cyto
        );
        element.style.display = "none";
        midLevelDiv.style.visibility = "hidden";
        selectedDetailItems = []; //reset list of items
      };

      let selectButton = document.createElement("input");
      selectButton.type = "button";
      selectButton.value = "Select All/Clear All";
      selectButton.style.fontSize = "15px";
      selectButton.style.marginLeft = "5px";
      selectButton.style.backgroundColor = "#212121";
      selectButton.onclick = function(e) {
        //check and uncheck all checkboxes
        e.stopPropagation();
        var aa = document.querySelectorAll("input[type=checkbox]");
        if (aa[0].checked === false) {
          for (var i = 0; i < aa.length; i++) {
            aa[i].checked = true;
            selectedDetailItems = nodeDetailsArray;
          }
        } else {
          for (var i = 0; i < aa.length; i++) {
            aa[i].checked = false;
            selectedDetailItems = [];
          }
        }
      };
      let rowCountSpan = document.createElement("span");
      rowCountSpan.style.color = "red";
      rowCountSpan.style.float = "right";
      rowCountSpan.innerHTML = rowCount + " Rows";
      rowCountSpan.style.padding = "10px";
      rowCountSpan.style.fontWeight = "bold";

      midLevelDiv.appendChild(selectButton);
      midLevelDiv.appendChild(addButton);
      //midLevelDiv.appendChild(filterButton);
      midLevelDiv.appendChild(rowCountSpan);
      /**
     *  data: nodeDetailsArray, // data
      fields: nodeDetailsCols 
     */

      $("#graphmodal-content").jsGrid({
        // check flex for what this was set to
        width: "1200px",
        height: "500px",
        filtering: false,
        inserting: false,
        editing: false,
        sorting: true,
        paging: true,
        pageSize: 18,

        controller: {
          loadData: function(filter) {
            //console.log("rtf filter");
            return $.grep(nodeDetailsArray, function(row) {
              return filterRows(filter, row);
            });
          },
          insertItem: $.noop,
          updateItem: $.noop,
          deleteItem: $.noop,
        },
        data: nodeDetailsArray, // data
        fields: nodeDetailsCols, // columns name/type
      });
      //hides filter row on initial render
      document.getElementsByClassName("jsgrid-filter-row")[0].style.display =
        "none";
      //close
      function closeModal() {
        element.style.display = "none";
      }
      //click outside modal
    }
  };

  Y.selectAllDetails = function() {
    if ($("#detailWindowAll")[0].checked) {
      window.alert("Select All");
    } else {
      window.alert("Clear All");
    }
  };
  function formedForCSV(data, headers) {
    let returnData = [];
    let tempHeaders = [];
    data.forEach((item) => {
      let row = [];
      for (let key in item) {
        if (item.hasOwnProperty(key)) {
          row.push(item[key]);
        }
      }
      returnData.push(row + "\n");
    });
    headers.forEach((item) => {
      if (item.name) {
        tempHeaders.push(item.name);
      }
    });
    tempHeaders.unshift("");
    tempHeaders.push("\n");
    returnData.unshift(tempHeaders);
    return returnData;
  }
  function filterRows(filter, node) {
    //console.log(node);
    var filterMatch = [];

    for (var i in filter) {
      //console.log(i);
      if (filter.hasOwnProperty(i)) {
        // if filter field is empty or field matches filter
        if (
          filter[i] == "" ||
          node[i].toUpperCase().indexOf(filter[i].toUpperCase()) > -1
        ) {
          filterMatch.push(true);
        } else {
          filterMatch.push(false);
        }
      }
    }

    //console.log(filterMatch);

    var matchesFilter = true;
    for (var i = 0; i < filterMatch.length; i++) {
      matchesFilter = filterMatch[i] && matchesFilter ? true : false;
    }
    //console.log("matchesFilter: " + matchesFilter);

    return matchesFilter;
  }

  let addSelectedItemsToGraph = function(
    graphId,
    nodeId,
    groupType,
    title,
    selectedDetailItems,
    cy
  ) {
    let linkType = Y.LINK_TYPE_K1;

    var taxPeriod;
    if (selectedDetailItems.length === 0) return;
    // groupType is numeric, GROUP_NODE_TYPE_XXX is not
    if (groupType == Y.GROUP_NODE_TYPE_ADDRESS) {
      linkType = Y.LINK_TYPE_ADDRESS;
      taxPeriod = Y.GRAPHS[graphId].V[nodeId].data["taxPeriod"];
    } else if (groupType == Y.GROUP_NODE_TYPE_PREPARER) {
      linkType = Y.LINK_TYPE_PREPARER;
      taxPeriod = Y.GRAPHS[graphId].V[nodeId].data["taxPeriod"];
    } else {
      //taxPeriod = Y.getTaxPeriodFromNodeId(nodeId);
      taxPeriod = Y.getGroupLinkTaxPeriodFromNodeId(nodeId);
      if (
        groupType == Y.GROUP_NODE_TYPE_PAYER ||
        groupType == Y.GROUP_NODE_TYPE_PAYEE
      ) {
        linkType = Y.LINK_TYPE_K1;
      }
      if (
        groupType == Y.GROUP_NODE_TYPE_SUB ||
        groupType == Y.GROUP_NODE_TYPE_PARENT
      ) {
        linkType = Y.LINK_TYPE_PARENT;
      }
      if (groupType == Y.GROUP_NODE_TYPE_CASESSN) {
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

      if (queryNode[2] == Y.LINK_TYPE_K1 || queryNode[2] == Y.LINK_TYPE_CASE) {
        nodeType = Y.getTinTypeFromK1(queryNode[1]); // see Flex. graphProcessor.getTinTypeFromK1(querynode[1])
      } else {
        nodeType = queryNode[1];
      }

      // look for illegal values
      if (
        nodeType == Y.TIN_TYPE_GROUP ||
        nodeType == Y.TIN_TYPE_ADDRESS ||
        nodeType == Y.TIN_TYPE_PREPARER
      ) {
        continue;
      }
      if (nodeTin == "000000000" || nodeTin == "999999999") {
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
  /*
   * getStyledElement
   * Used by both getNodeInfo and getLinkInfo
   * formats and displays the xml string that is returned
   */
  Y.getStyledElement = function(xml) {
    let xmlDoc = $.parseXML(xml);
    let $xml = $(xmlDoc);
    let title = $xml.find("Title").text();
    let maxStringWidth = Y.getWidthOfText(title);
    // open new window with image of the graph
    // NOTE not using options right now. default print full graph
    let HTMLstring = "<HTML>\n";
    HTMLstring += "<HEAD>\n";
    HTMLstring += "<TITLE>" + title + "</TITLE>\n";
    HTMLstring += "</HEAD>\n";
    HTMLstring += "<BODY>\n";
    HTMLstring += "<div style='text-align:center;'><b>" + title + "</b></div>";
    // translated this section from the Flex code:
    // class: GraphWindow
    // function: getStyledElement
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

        if (label.length == 0) {
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

          if (color != null && color.length > 0 && color != "DEFAULT") {
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
            var formattedData = Y.formatThousandSeparator(data);
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

    // open new window with node info

    /*
     * These config settings for the new window removes all scrollbar/toolbar/navigation controls from the browser
     * So then, it becomes like another "window"
     */

    //set modal width 10 extra for padding
    let modalHeight = "auto";
    //minimum height
    if (HTMLstring.length < 468) {
      //console.log("hit");
      modalHeight = "100px";
    }
    maxStringWidth += 30;
    //minimum width
    if (maxStringWidth < 200) {
      maxStringWidth = 200;
    }
    let modalBody = document.getElementById("graphmodal-content");
    let element = document.getElementById("graphInfoModal");
    let midLevelDiv = document.getElementById("midLevelDiv");
    element.addEventListener("click", function(e) {
      if (e.target == element) {
        //reset div for next jsgrid
        element.style.display = "none";
        //console.log($("#graphmodal-content"));
        midLevelDiv.style.visibility = "hidden";
        //reset items
        selectedDetailItems = [];
      }
    });

    //console.log(modalBody);
    modalBody.style.width = maxStringWidth + "px";
    modalBody.style.height = modalHeight;

    //const closeBtn = document.querySelector(".close");
    modalBody.innerHTML = HTMLstring;
    element.style.display = "block";

    // closeBtn.addEventListener("click", closeModal);

    //close
    function closeModal() {
      element.style.display = "none";
    }
    //click outside modal
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
  return Y;
};

export default modalWindowcontrol;
