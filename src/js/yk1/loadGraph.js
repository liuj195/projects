import YK1 from "./yk1";
import $ from "jquery";
import { getGraphFakeData } from "../../js/fakeData/getGraph";
import { getGraphFakeData2 } from "../../js/fakeData/getGraph2";
import { getNodeLinkInfoData } from "../../js/fakeData/getNodeLinkInfo";
import { callbackify } from "util";

console.log("$: " + $);
export default function(formData, graphId, callback) {
  // minimum of 1 tax year, max of...
  // this should really go somewhere else
  //I'll figure that out when I figure out if this function is going somewhere else
  // JY 1/8/2018
  var maxTaxYears = 8;
  var taxYears = formData.taxYears;
  //if (taxYears.length == 0 || taxYears.length > maxTaxYears)
  if (taxYears.length === 0) {
    //alert("Please select at least 1 tax year and no more than " + maxTaxYears + " tax years.");
    alert("No tax years selected");
    return;
  }

  // deal with the tins
  let tinList = [];
  let tinTypeList = [];

  // NO TIN Type
  let tins = formData.tins;
  tins = YK1.scrubTinsTaxPeriods(tins);
  let tinArray = YK1.parseTins(tins);
  if (tinArray.length === 0) {
    alert("Please enter at least one TIN");
    return;
  }

  let tinType = "";
  if (formData.type === "EITHER") {
    tinType = YK1.TIN_TYPE_UNKNOWN;
  } else if (formData.type === "SSN") {
    tinType = YK1.TIN_TYPE_SSN;
  } else if (formData.type === "EIN") {
    tinType = YK1.TIN_TYPE_EIN = "2";
  }

  for (var i = 0; i < tinArray.length; i++) {
    tinList.push(tinArray[i]);
    tinTypeList.push(tinType);
  }

  formData.tinList = tinList.join(YK1.DELIMITER);
  formData.tinTypeList = tinTypeList.join(YK1.DELIMITER);

  /*
   *   FOR BUILD
   *   When need to run against ajax version, use this.authenticateUser
   *   When running offline, use this.getGraphDataOffLine
   *   they should not be uncommented at the same time
   */
  getGraphData(formData, graphId, callback);
  //getGraphDataOffLine(formData, graphId, callback);

  function getGraphData(formData, graphId, callback) {
    //console.log("Getting data");
    //dataLine = "";

    //tintypelist needs to be 0 2 or 5
    let depth = formData.depth;
    let group = formData.group;
    let taxYears = formData.taxYears;
    let tinList = formData.tinList;
    let tinTypeList = formData.tinTypeList;

    var myObject = {};
    myObject.element = formData.element;
    myObject.tin = tinList;
    myObject.taxYear = taxYears;
    myObject.maxTiers = depth;
    myObject.maxNodes = group;
    myObject.tinType = tinTypeList;
    myObject.limitType = formData.limit;
    myObject.limitValue = formData.value;
    myObject.limitDirection = formData.direction;
    myObject.displayGraph = false;

    getGraph(myObject, graphId, callback);
  }

  function getGraph(myObject, graphId, callback) {
    var servletParams = JSON.stringify(myObject);
    var tomcat = "api/yk1/";
    var server = tomcat;
    console.log(myObject);
    $.ajax({
      type: "POST",
      url: server + "getGraph",
      data: servletParams,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-AUTH-TOKEN": YK1.token,
        "X-SESSION-ID": YK1.sessionId,
      },
    }).then(
      function(data, status, xhr) {
        //reset timer
        clearTimeout(window.timerInstance);
        window.softLogout(1500000);
        //located in YK1.js to keep tract of how many ajax calls we are stacking up
        YK1.yearsIteration = YK1.yearsIteration + 1;
        console.log("before");
        console.log(xhr);
        console.log(data);
        console.log(xhr.getResponseHeader("NO_CONTENT_MESSAGE"));
        console.log("after");
        YK1.setToken(xhr.getResponseHeader("X-AUTH-TOKEN"));
        YK1.setSessionID(xhr.getResponseHeader("X-SESSION-ID"));
        if (xhr.status === 200) {
          getGraphHandler(data, myObject, graphId, callback);
        } else {
          let msg =
            "Tin: " + myObject.tin + " Year: " + myObject.taxYear + "\n";
          YK1.noDataFailArray.push(msg);
        }
        //this runs after each ajax call, looking for the last call. If its the last ajax call then alert any 204's
        if (
          YK1.yearsIteration === YK1.numYears &&
          YK1.noDataFailArray.length > 0
        ) {
          let msg = YK1.noDataFailArray;
          // Fix for ticket #410
          // Request response with success but a null value was returned
          // Added 200 status condition and changed null headerMsg
          if (xhr.status === 200) {
            YK1.onFail({
              status: xhr.status,
              msg: msg,
              headerMsg:
                "No data exists in yK1 for this tax period based on K1 relationships",
            });
          } else {
            //onFail is located in yk1WebServices.js
            YK1.onFail({
              status: xhr.status,
              msg: msg,
              headerMsg: xhr.getResponseHeader("errorMessage"),
            });
          }
        }
      },
      function(xhr, status, error) {
        console.log("getGraph Failed");
        YK1.onFail({
          status: xhr.status,
          msg: xhr.statusText,
          headerMsg: xhr.getResponseHeader("errorMessage"),
        });
      }
    );
  }

  // takes the returned node/edge data and draws cytoscape graph
  function getGraphHandler(data, myObject, graphId, callback) {
    callback(formData, data, myObject);
  }

  /*
   *   OFFLINE TESTING FUNCTIONS
   */
  function getGraphDataOffLine(formData, graphId, callback) {
    //window.softLogout();
    // clearTimeout(window.timerInstance);
    // window.softLogout(1000);
    //dataLine = "";
    YK1.yearsIteration = YK1.yearsIteration + 1;
    let depth = formData.depth;
    let group = formData.group;
    let taxYears = formData.taxYears;
    let tinList = formData.tinList;
    let tinTypeList = formData.tinTypeList;
    var myObject = {};
    myObject.element = formData.element;
    myObject.tin = tinList;
    myObject.taxYear = taxYears;
    myObject.maxTiers = depth;
    myObject.maxNodes = group;
    myObject.tinType = tinTypeList;
    myObject.displayGraph = false;

    let msg = "Tin: " + myObject.tin + " Year: " + myObject.taxYear;
    //in yk1.js
    YK1.noDataFailArray.push(msg);
    // console.log(YK1.yearsIteration);
    // console.log(YK1.numYears);

    //  **** uncomment to send error ***
    // if (YK1.yearsIteration === YK1.numYears && YK1.noDataFailArray.length > 0) {
    //   let msg = YK1.noDataFailArray;
    //   console.log(YK1.noDataFailArray);
    //   //onFail is located in yk1WebServices.js
    //   YK1.onFail({ status: 500, msg: msg, headerMsg: "header msg" });
    // }

    //normal graph drawing
    getGraphHandler(getGraphFakeData, myObject, graphId, callback);
  }

  function getGraphOffLine(myObject, graphId, callback) {
    var servletParams = JSON.stringify(myObject);
    /* \\
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
  		  getGraphHandler(data, myObject);
      });*/
    //YK1.onFail({ status: 204, msg: "no content" });
    getGraphHandler(getGraphFakeData, myObject, graphId, callback);
    //callbackFunction(getGraphFakeData2, myObject, graphId);
  }

  /*
   * END OFFLINE TESTING FUNCTIONS
   */
}
