/**
 * webServiceActions
 *
 * functions that directly call the yk1 web services along with the callback handlers
 *
 */

var YK1 = (function(Y) {
  var token;
  var seid;

  // I did this in case there were multiple servers to remember, for example, if Srikar on his machine has a different url
  var judyServer = "http://localhost:3000/";
  var server = judyServer;

  // called when AJAX call fails
  function onFail(jQueryXmlhttpRequest) {
    clearInterval(intervalHandle);
    $("#topStatus").html("");
    $("#status").html("Cannot connect to server.");
  }

  /**
   * TAX YEAR =======================================================================================
   */

  /**
   * getTaxYears() - Public method
   *
   * Calls the webservice for tax years.
   */
  Y.getTaxYears = function() {
    /*$.ajax({
            type : "GET",
            //url: "yk1/getTaxYears",
            url: server + "getTaxYears",
             headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-SEID': seid,
                    }
  
            }).then(function(data, status, xhr) {
              console.log(xhr.getAllResponseHeaders());
              console.log(data);
              token=xhr.getResponseHeader("X-AUTH-TOKEN");
                Y.taxYearHandler(data);
            });*/
    var TY =
      '{"taxYearDataList": [ {"taxYear":"2016","groupNames":["YK1"],"displayComments":"Partial TY2016 data through cycle 44","dataLoadDate":null,"dataLoadCycle":null,"isPartial":true,"cyclDateBrtf":null,"cyclDateIrtf":null,"cyclDateK1":null,"cyclDateTege":null,"cyclDateParSub":null}]}';
    Y.taxYearHandler(JSON.parse(TY));
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
    /*
        $.ajax({
            type : "POST",
            url: server + "getGraph",
            data : servletParams,
            headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-AUTH-TOKEN' : token
                    }
  
            }).then(function(data, status, xhr) {
              console.log(xhr.getAllResponseHeaders());
              console.log(data);
              token=xhr.getResponseHeader("X-AUTH-TOKEN");
              Y.getGraphHandler(data, myObject);
            });*/
    //Y.getGraphHandler(JSON.parse(getGraphFakeData), myObject);
    console.log("getGraph");
    Y.getGraphHandler(getGraphFakeData, myObject);
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
  Y.getExpandGraph = function(servletParams, groupType) {
    // groupType is purely for Robohydra purposes
    $.ajax({
      type: "POST",
      url: server + "expandGraph:" + groupType,
      data: servletParams,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": token
      }
    }).then(function(data, status, xhr) {
      console.log(xhr.getAllResponseHeaders());
      console.log(data);
      token = xhr.getResponseHeader("X-AUTH-TOKEN");
      //alert('Token in Graph Response is '+token);
      Y.getExpandGraphHandler(data);
    });
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
  Y.getAddresses = function(servletParams, sourceNodeXtin, taxYear) {
    //console.log(sourceNodeXtin);

    $.ajax({
      type: "POST",
      url: server + "getAddressNodes",
      data: servletParams,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": token
      }
    }).then(function(data, status, xhr) {
      console.log(xhr.getAllResponseHeaders());
      console.log(data);
      token = xhr.getResponseHeader("X-AUTH-TOKEN");
      Y.getAddressHandler(data, sourceNodeXtin, taxYear);
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
  Y.getPreparers = function(servletParams, sourceNodeXtin, taxYear) {
    $.ajax({
      type: "POST",
      url: server + "getPreparerNodes",
      data: servletParams,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": token
      }
    }).then(function(data, status, xhr) {
      console.log(xhr.getAllResponseHeaders());
      console.log(data);
      token = xhr.getResponseHeader("X-AUTH-TOKEN");
      //alert('Token in Graph Response is '+token);
      Y.getPreparerHandler(data, sourceNodeXtin, taxYear);
    });
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
  Y.getRtfData = function(servletParams) {
    $.ajax({
      type: "POST",
      url: "yk1/getRtf",
      data: servletParams,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": token
      }
    }).then(function(data, status, xhr) {
      console.log(xhr.getAllResponseHeaders());
      console.log(data);
      token = xhr.getResponseHeader("X-AUTH-TOKEN");
      //alert('Token in Graph Response is '+token);
      Y.getRtfHandler(data);
    });
  };

  Y.getNodeInfo = function(servletParams) {
    $.ajax({
      type: "POST",
      url: "yk1/getNodeInfo",
      data: servletParams,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": token
      }
    }).then(function(data, status, xhr) {
      console.log(xhr.getAllResponseHeaders());
      console.log(data);
      token = xhr.getResponseHeader("X-AUTH-TOKEN");
      //alert('Token in Graph Response is '+token);
      Y.getNodeInfoHandler(data);
    });
  };

  Y.getLinkInfo = function(servletParams) {
    $.ajax({
      type: "POST",
      url: "yk1/getLinkInfo",
      data: servletParams,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": token
      }
    }).then(function(data, status, xhr) {
      console.log(xhr.getAllResponseHeaders());
      console.log(data);
      token = xhr.getResponseHeader("X-AUTH-TOKEN");
      //alert('Token in Graph Response is '+token);
      Y.getLinkInfoHandler(data);
    });
  };

  Y.getGroupNodeDetails = function(myObject) {
    var servletParams = JSON.stringify(myObject);
    $.ajax({
      type: "POST",
      url: "yk1/getGroupNodeDetails",
      data: servletParams,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": token
      }
    }).then(function(data, status, xhr) {
      console.log(xhr.getAllResponseHeaders());
      console.log(data);
      token = xhr.getResponseHeader("X-AUTH-TOKEN");
      Y.showGroupNodeDetailHandler(data, myObject);
    });
  };

  // show node details (address/preprarer)
  function getNodeDetails(servletParams, tinType, taxYear, cy) {
    console.log("url: " + server + "getNodeDetails/" + tinType);
    $.ajax({
      type: "POST",
      url: server + "getNodeDetails/" + tinType,
      data: servletParams,
      headers: {
        Accept: "application/json",
        //Accept: 'text/xml, application/json',
        "Content-Type": "application/json",
        //'Content-Type': 'text/xml',
        "X-AUTH-TOKEN": token
      }
    }).then(function(data, status, xhr) {
      console.log(xhr.getAllResponseHeaders());
      console.log(data);
      var jsonString = JSON.stringify(data);
      token = xhr.getResponseHeader("X-AUTH-TOKEN");
      // use normally
      //showNodeDetailsHandler(data.nodeDetailXml, tinType, taxYear);
      // for Robohydra
      showNodeDetailsHandler(data, tinType, taxYear);
    });
  }

  // from the entity node, pull up the list of addresses
  function showAddressNodes(nodeId, minNodes) {}

  return Y;
})(YK1 || {});
