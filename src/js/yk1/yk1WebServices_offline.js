import $ from "jquery";
import { getGraphFakeData } from "../fakeData/getGraph";
import { getNodeLinkInfoData } from "../fakeData/getNodeLinkInfo";
import { getRtfData } from "../fakeData/getRtf";
import { getAddressNodesData } from "../fakeData/getAddressNodes";
import { getPreparerNodesData } from "../fakeData/getPreparerNodes";
import { getNodeDetailsData } from "../fakeData/getNodeDetails";
import { getGraphGroupNodeFakeData } from "../fakeData/getGroupNodeDetails";
import { getReplaceWithAllNodes } from "../fakeData/getExpandNode";
import { getExpandNodeData } from "../fakeData/getExpandNode";
import { getTaxYearsData } from "../fakeData/getTaxYear";


window.$ = window.jQuery = $;
/**
 * webServiceActions
 *
 * functions that directly call the yk1 web services along with the callback handlers
 *
 */

const yk1WebServices = function(Y) {
  // called when AJAX call fails
  Y.onFail = function({ status, msg, headerMsg, isLogout }) {
    console.log("onFail: " + status + "|" + msg);
    // console.log(window.timeElapsed());
    // if (window.timeElapsed() >= 100000) {
    //   console.log("hit");
    //   Y.handleLogout();
    //   return;
    // }
    if (status === 408 || isLogout) {
      Y.handleLogout();
      //in app.js
      return;
      //204 messages sent as an array are from getGraph where tins have no
    } else if (status === 204) {
      if (msg instanceof Array) {
        msg = formatTins(msg);
      }
    } else {
      //  headerMsg = document.defaultView.errorList.errorMessage + " " + headerMsg;
      headerMsg = document.defaultView.errorList.errorMessage + " " + headerMsg;
    }
    //closeLoader located in app.js
    Y.closeLoader(status, msg, headerMsg);
  };

  function formatTins(msg) {
    let tinString = msg.map((tin) => {
      //iterate over each
      let year = getYear(tin);
      let tins = getTins(tin);
      let returnString = "";
      tins.forEach((singleTin) => {
        returnString =
          returnString + "Tin: " + singleTin + " " + "Year: " + year;
      });

      return returnString;
    });
    return tinString;
  }
  function getTins(tin) {
    let tins = tin.split(" ");
    let tinList = tins[1];
    let splitTins = tinList.split("\t");
    return splitTins;
  }
  function getYear(tin) {
    let tinSplit = tin.split(" ");
    let year = tinSplit[tinSplit.length - 1];
    return year;
  }
  // I did this in case there were multiple servers to remember, for example, if Srikar on his machine has a different url
  // called when AJAX call fails
  function onFail(xhr, testStatus, errorThrown, myObject) {
    //clearInterval(intervalHandle);
    //$("#topStatus").html("");
    //$("#status").html("Cannot connect to server.");
    var responseText = xhr.responseText;

    if (responseText.indexOf("the account is locked") >= 0) {
      alert("Your account is locked. Please contact your YK1 administrator");
    } else if (responseText.indexOf("No data available in Neo4j") >= 0) {
      Y.ungraphableTins.push({
        tin: myObject.tin,
        tinType: myObject.tinType,
        taxYear: myObject.taxYear,
      });
    } else {
      alert(responseText);
    }

    // hide progress bar
    $("#loader")
      .removeClass("show")
      .addClass("hide");
  }

  /**
   * TAX YEAR =======================================================================================
   */
  // logOut() is a placeholder in offline mode. It does nothing here.
  Y.logOut = function() {
    Y.onFail({
      status: 408,
      msg: null,
      headerMsg: "some middle message",
      isLogout: true,
    });
  };

  /**
   * getTaxYears() - Public method
   *
   * Calls the webservice for tax years.
   */

  Y.getTaxYears = function(callback) {
    window.softLogout(10000);
    // Y.onFail({
    //   status: 408,
    //   msg: null,
    //   headerMsg: "some middle message",
    //   isLogout: true,
    // });
    // var serverURL = server + "getTaxYears";
    // //console.log(serverURL);
    // $.ajax({
    //   type: "GET",
    //   //url: "yk1/getTaxYears",
    //   url: serverURL,
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     //'X-SEID': Y.seid,
    //     "X-AUTH-TOKEN": Y.token
    //   },
    //   error: function(xhr, textStatus, errorThrown) {
    //     console.log("error");
    //     onFail(xhr, textStatus, errorThrown);
    //   }
    // }).then(function(data, status, xhr) {
    //   console.log(xhr.getAllResponseHeaders());
    //   console.log(data);
    //   Y.token = xhr.getResponseHeader("X-AUTH-TOKEN");

    // });

    // window.softLogout(1500000);
    // clearTimeout(window.timerInstance);
    // window.softLogout(5000);

    Y.taxYearHandler(getTaxYearsData, callback);
  };

  /**
   * GET GRAPH ======================================================================================
   */

  /**
   * getGraph()
   *
   * servletParams - JSON object for the webservice consisting of the following data:
   * 		tin, taxYear, maxTiers, maxNodes, tinType
   */
  Y.getGraph = function(myObject) {
    var servletParams = JSON.stringify(myObject);

    // $("#loader")
    //   .removeClass("hide")
    //   .addClass("show");

    // $.ajax({
    //   type: "POST",
    //   url: server + "getGraph",
    //   data: servletParams,
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     "X-AUTH-TOKEN": Y.token
    //   },
    //   error: function(xhr, textStatus, errorThrown) {
    //     console.log("error");
    //     onFail(xhr, textStatus, errorThrown, myObject);
    //   }
    // }).then(function(data, status, xhr) {
    //   console.log(xhr.getAllResponseHeaders());
    //   console.log(data);
    //   token = xhr.getResponseHeader("X-AUTH-TOKEN");
    //   Y.getGraphHandler(data, myObject);

    //   // hide progress bar
    //   $("#loader")
    //     .removeClass("show")
    //     .addClass("hide");
    // });

    Y.getGraphHandler(getGraphFakeData, myObject);
    //Y.onFail({ status: "status", msg: "msg" });
  };

  /*
   * GET Expand Graph ===============================================================================
   */
  /*
   * getExpandGraph()
   *
   * servletParams - JSON object for the webservice consisting of the following data:
   * 		sourceNodeXtin, allNodeList, taxYear, minNodes, isforced
   */
  Y.getExpandGraph = function(servletParams, graphId, sourceNodeId, cy) {
    // console.log("expanding graph");
    let json = JSON.parse(servletParams);
    let dataset = getReplaceWithAllNodes;
    if (json.tinList === "EST") {
      //stick in repalcewithallnodes data set
      dataset = getExpandNodeData;
    }
    // console.log(servletParams);
    // $("#loader")
    //   .removeClass("hide")
    //   .addClass("show");
    // $.ajax({
    //   type: "POST",
    //   url: server + "expandGraph",
    //   data: servletParams,
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     "X-AUTH-TOKEN": Y.token
    //   }
    // }).then(function(data, status, xhr) {
    //   console.log(xhr.getAllResponseHeaders());
    //   console.log(data);
    //   token = xhr.getResponseHeader("X-AUTH-TOKEN");
    //   Y.getExpandGraphHandler(graphId, data, sourceNodeId,cy);

    //   // hide progress bar
    //   $("#loader")
    //     .removeClass("show")
    //     .addClass("hide");
    // });

    Y.getExpandGraphHandler(graphId, dataset, sourceNodeId, cy);
  };

  /*
   * GET ADDRESS ====================================================================================
   */
  /*
   * getAddresses()
   *
   * servletParams - JSON object for the webservice consisting of the following data:
   * 		sourceNodeXtin, allNodeList, taxYear, minNodes, isforced
   */
  Y.getAddresses = function(
    servletParams,
    sourceNodeXtin,
    taxYear,
    graphId,
    cy,
    excelExport
  ) {
    // Y.onFail({ status: 204, msg: "msg" });
    // Y.getAddressHandler(
    //   graphId,
    //   getAddressNodesData,
    //   sourceNodeXtin,
    //   taxYear,
    //   cy,
    //   servletParams,
    //   excelExport
    // );
    Y.onFail({
      status: 408,
      msg: null,
      headerMsg: "some middle message",
      isLogout: true,
    });
  };
  /*
   * GET PREPARERS ==================================================================================
   */
  /*
   * getPreparers()
   *
   * servletParams - JSON object for the webservice consisting of the following data:
   * 		sourceNodeXtin, allNodeList, taxYear, minNodes, isforced
   */
  Y.getPreparers = function(
    servletParams,
    sourceNodeXtin,
    taxYear,
    graphId,
    cy,
    excelExport
  ) {
    // Y.onFail({
    //   status: 204,
    //   msg: document.defaultView.errorList.noPreparer,
    // });
    Y.getPreparerHandler(
      graphId,
      getPreparerNodesData,
      sourceNodeXtin,
      taxYear,
      cy,
      servletParams,
      excelExport
    );
  };

  /*
   * GET RTF ========================================================================================
   */
  /*
   * getRtfData()
   *
   * servletParams - JSON object for the webservice consisting of the following data:
   * 		sourceNodeXtin, allNodeList, taxYear, minNodes, isforced
   */
  Y.getRtfData = function(myObject, graphId) {
    // var servletParams = JSON.stringify(myObject);
    // $("#loader")
    //   .removeClass("hide")
    //   .addClass("show");

    // $.ajax({
    //   type: "POST",
    //   url: server + "getRtf",
    //   data: servletParams,
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     "X-AUTH-TOKEN": Y.token
    //   }
    // }).then(function(data, status, xhr) {
    //   console.log(xhr.getAllResponseHeaders());
    //   console.log(data);
    //   token = xhr.getResponseHeader("X-AUTH-TOKEN");
    //   Y.getRtfHandler(data, graphId, myObject);

    //   // hide progress bar
    //   $("#loader")
    //     .removeClass("show")
    //     .addClass("hide");
    // });
    console.log(Y);
    console.log(getRtfData);
    Y.createRTFtab(getRtfData, graphId, myObject);
    //callback(getRtfData, graphId, myObject);
    //Y.getRtfHandler(getRtfData, graphId, myObject, callback);
  };

  Y.getNodeInfo = function(servletParams) {
    // $("#loader")
    //   .removeClass("hide")
    //   .addClass("show");

    // $.ajax({
    //   type: "POST",
    //   url: server + "getNodeInfo",
    //   data: servletParams,
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     "X-AUTH-TOKEN": Y.token
    //   }
    // }).then(function(data, status, xhr) {
    //   console.log(xhr.getAllResponseHeaders());
    //   console.log(data);
    //   token = xhr.getResponseHeader("X-AUTH-TOKEN");
    //   Y.getNodeInfoHandler(data);

    //   // hide progress bar
    //   $("#loader")
    //     .removeClass("show")
    //     .addClass("hide");
    // });
    Y.getNodeInfoHandler(getNodeLinkInfoData);
  };

  Y.getLinkInfo = function(servletParams) {
    // $("#loader")
    //   .removeClass("hide")
    //   .addClass("show");

    // $.ajax({
    //   type: "POST",
    //   url: server + "getLinkInfo",
    //   data: servletParams,
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     "X-AUTH-TOKEN": Y.token
    //   }
    // }).then(function(data, status, xhr) {
    //   console.log(xhr.getAllResponseHeaders());
    //   console.log(data);
    //   token = xhr.getResponseHeader("X-AUTH-TOKEN");
    //   Y.getLinkInfoHandler(data);

    //   // hide progress bar
    //   $("#loader")
    //     .removeClass("show")
    //     .addClass("hide");
    // });
    Y.getLinkInfoHandler(getNodeLinkInfoData);
  };

  Y.getGroupNodeDetails = function(myObject, linkTin, graphId, cy) {
    console.log(myObject);
    // $("#loader")
    //   .removeClass("hide")
    //   .addClass("show");
    // var servletParams = JSON.stringify(myObject);
    // $.ajax({
    //   type: "POST",
    //   url: server + "getGroupNodeDetails",
    //   data: servletParams,
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //     "X-AUTH-TOKEN": Y.token
    //   }
    // }).then(function(data, status, xhr) {
    //   console.log(xhr.getAllResponseHeaders());
    //   console.log(data);
    //   token = xhr.getResponseHeader("X-AUTH-TOKEN");
    //   Y.showGroupNodeDetailHandler(graphId, data, myObject, linkTin);
    //   // hide progress bar
    //   $("#loader")
    //     .removeClass("show")
    //     .addClass("hide");
    // });
    Y.showGroupNodeDetailHandler(
      graphId,
      getGraphGroupNodeFakeData,
      myObject,
      linkTin,
      cy
    );
  };

  // show node details (address/preprarer)
  Y.getNodeDetails = function(graphId, myObject, tinType, taxYear, nodeId, cy) {
    // $("#loader")
    //   .removeClass("hide")
    //   .addClass("show");

    // var servletParams = JSON.stringify(myObject);

    // $.ajax({
    //   type: "POST",
    //   url: server + "getNodeDetails",
    //   data: servletParams,
    //   headers: {
    //     Accept: "application/json",
    //     //Accept: 'text/xml, application/json',
    //     "Content-Type": "application/json",
    //     //'Content-Type': 'text/xml',
    //     "X-AUTH-TOKEN": Y.token
    //   }
    // }).then(function(data, status, xhr) {
    //   console.log(xhr.getAllResponseHeaders());
    //   console.log(data);
    //   var jsonString = JSON.stringify(data);
    //   token = xhr.getResponseHeader("X-AUTH-TOKEN");
    //   // use normally
    //   Y.showNodeDetailsHandler(
    //     graphId,
    //     data.nodeDetailXml,
    //     tinType,
    //     taxYear,
    //     nodeId,
    //          cy

    //   );

    //   // hide progress bar
    //   $("#loader")
    //     .removeClass("show")
    //     .addClass("hide");
    // });
    Y.showNodeDetailsHandler(
      graphId,
      getNodeDetailsData,
      tinType,
      taxYear,
      nodeId,
      cy
    );
  };

  /*
   * Load up SVG for graph icons
   */
  Y.svg1040 = "";
  Y.svg1041 = "";
  Y.svg1065 = "";
  Y.svg1120 = "";
  Y.svg1120S = "";
  Y.svgFile1040 = "1040.svg";
  Y.svgFile1041 = "1041.svg";
  Y.svgFile1065 = "1065.svg";
  Y.svgFile1120 = "1120.svg";
  Y.svgFile1120S = "1120S.svg";
  Y.svgFilePath = "res/img/";
  Y.loadSvgFiles = function() {
    $.ajax({
      type: "GET",
      url: Y.svgFilePath + Y.svgFile1040,
      headers: { "Content-Type": "image/svg+xml" },
      error: function(xhr, textStatus, errorThrown) {
        console.log("svg error");
      },
    }).then(function(data, status, xhr) {
      //console.log(xhr.getAllResponseHeaders());
      //console.log(xhr);
      Y.svg1040 = xhr.responseText; // this is the string I want to encode!
    });

    $.ajax({
      type: "GET",
      url: Y.svgFilePath + Y.svgFile1041,
      headers: { "Content-Type": "image/svg+xml" },
      error: function(xhr, textStatus, errorThrown) {
        console.log("svg error");
      },
    }).then(function(data, status, xhr) {
      //console.log(xhr.getAllResponseHeaders());
      //console.log(xhr);
      Y.svg1041 = xhr.responseText; // this is the string I want to encode!
    });

    $.ajax({
      type: "GET",
      url: Y.svgFilePath + Y.svgFile1065,
      headers: { "Content-Type": "image/svg+xml" },
      error: function(xhr, textStatus, errorThrown) {
        console.log("svg error");
      },
    }).then(function(data, status, xhr) {
      //console.log(xhr.getAllResponseHeaders());
      //console.log(xhr);
      Y.svg1065 = xhr.responseText; // this is the string I want to encode!
    });
    /*
		$.ajax({
      		type : "GET",
      		url: Y.svgFilePath + Y.svgFile1020,
      		headers: { 'Content-Type': 'image/svg+xml' },
      	    error: function(xhr, textStatus, errorThrown){
      	    	console.log("svg error");  	       
      	    }
      	}).then(function(data, status, xhr) {
      		  //console.log(xhr.getAllResponseHeaders());
      		  //console.log(xhr);
      		  Y.svg1020 = xhr.responseText; // this is the string I want to encode!
      	});

		$.ajax({
      		type : "GET",
      		url: Y.svgFilePath + Y.svgFile1020S,
      		headers: { 'Content-Type': 'image/svg+xml' },
      	    error: function(xhr, textStatus, errorThrown){
      	    	console.log("svg error");  	       
      	    }
      	}).then(function(data, status, xhr) {
      		  //console.log(xhr.getAllResponseHeaders());
      		  //console.log(xhr);
      		  Y.svg1020S = xhr.responseText; // this is the string I want to encode!
      	});*/
  };

  return Y;
};

export default yk1WebServices;
