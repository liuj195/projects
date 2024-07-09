import React, { useEffect } from "react";
import CheckBox from "../buttons/checkBox";
import YK1 from "../../js/yk1/yk1";
import { detectIE } from "../utils/utils";
import XLSX from "xlsx";
import ToolTip from "../tooltips/tooltips";
import { connect } from "react-redux";
import {
  tstUpdateStoppingRules,
  tstUpdatedateOwnershipTolerance,
  tstUpdateClear,
  tstUpdateWindow,
  tstUpdateGroupNode,
  tstUpdateGraphRule,
  tstUpdateTinTax,
  tstUpdateReport,
  tstUpdateGraphRulesToggler,
  tstUpdateStoppingRuleToggler,
} from "../../redux/actions/tstActions";
import { useIsMount } from "../utils/utils";

const TstPanelInterface = (props) => {
  let {
    reportTypes,
    tinTaxValue,
    windowToggler,
    stoppingRuleToggler,
    stoppingRuleVals,
    graphVal,
    groupNode,
    ownershipTolerance,
    currentRule,
    window,
    currentGraphRule,
    graphRuleToggler,
    onGraphRuleChange,
  } = props.TSTstate;
  const isMount = useIsMount();

  //bit of code for setting focus, works like componentDidMount
  useEffect(
    () => {
      if (isMount) {
        //do nothing on first render
      } else {
        //clicking on radio button sets focus on respective input
        stoppingRuleToggler
          ? adjustmentRef.current.focus()
          : toleranceRef.current.focus();
      }
    },
    [stoppingRuleToggler]
  );
  //refs for transferring focus
  let adjustmentRef = React.createRef();
  let toleranceRef = React.createRef();

  const stoppingRuleValidation = (e) => {
    let stoppingRuleInput = e.target.value;
    //allower user to have an empty input
    if (stoppingRuleInput.length === 0) stoppingRuleInput = "";
    //this is for ownership tolerance when id === 1
    if (
      parseInt(e.target.id) === 1 &&
      (stoppingRuleInput > 100 || stoppingRuleInput < 0)
    ) {
      return;
    }
    //make sure value is numeric
    if (!isNaN(stoppingRuleInput) || stoppingRuleInput === ".") {
      let stoppingRuleInputId = +e.target.id;
      stoppingRuleVals[stoppingRuleInputId] = stoppingRuleInput;
      stoppingRuleVals = stoppingRuleVals;
      props.tstUpdateStoppingRules(stoppingRuleInput, stoppingRuleVals);
    }
  };

  const validateData = (value) => {
    let validate = YK1.tstValidateLengthandForm(value);
    let errBlock = document.getElementById("invalidTinTax");

    if (!validate.isValid) {
      errBlock.style.display = "block";
      errBlock.innerHTML = validate.err;
    } else {
      errBlock.style.display = "none";
      errBlock.innerHTML = null;
    }
    return validate.isValid;
  };

  const handleProduceReportsGraph = () => {};

  const handleProduceReports = () => {
    let cpTinTaxValue = tinTaxValue;
    //filter dashes
    cpTinTaxValue = cpTinTaxValue.replace(/-/g, "");
    console.log(cpTinTaxValue);
    let isValid = validateData(cpTinTaxValue);

    if (!isValid) return;
    // validate form data, etc
    let reportsToRun = [];
    let reportTypesArray = reportTypes.forEach((item) => {
      if (item.checked) {
        reportsToRun.push(item.id);
      }
    });
    if (reportsToRun.length === 0) {
      alert(document.defaultView.errorList.noReports);
      return;
    }
    // make sure there is SOMETHING in the tin/tax period text area
    if (!cpTinTaxValue) {
      alert(document.defaultView.errorList.enterTin);
      return;
    }
    cpTinTaxValue = YK1.scrubTinsTaxPeriods(cpTinTaxValue);
    // Split on pipe. What we should be left with is alternating tin and tax period
    let tinTaxArray = cpTinTaxValue.split("|");
    //filter out empty values
    tinTaxArray = tinTaxArray.filter((item) => {
      return item !== "";
    });
    // there should be a tax period for each TIN so there should be an even number of items in the array
    if (tinTaxArray.length % 2 !== 0) {
      if (tinTaxArray[tinTaxArray.length - 1] === "") {
        tinTaxArray.pop();
      } else {
        alert(document.defaultView.errorList.correspondingPeriod);
      }
    }

    let tempTinTaxPeriod = [];
    let invalidEntries = [];

    for (var i = 0; i < tinTaxArray.length; i += 2) {
      var tin = YK1.padTin(tinTaxArray[i]);
      var taxPeriod = tinTaxArray[i + 1];

      // need to validate the tin
      // check if TIN is greater than 9 digits
      if (!YK1.validateTin(tin)) {
        invalidEntries.push(tin + "|" + taxPeriod);
        continue;
      }

      // need to validate the tax period
      if (taxPeriod.length > 6) {
        invalidEntries.push(tin + "|" + taxPeriod);
        continue;
      }
      let taxYear = taxPeriod.substring(0, 4);
      // TODO note I should not be hardcoding tax years here
      // check if tax years is numeric and within range

      let mostCurrentYear = YK1.taxYears[0].taxYear;
      if (parseInt(taxYear) < 2003 || parseInt(taxYear) > mostCurrentYear) {
        invalidEntries.push(tin + "|" + taxPeriod);
        continue;
      } else if (taxPeriod.length > 6) {
        invalidEntries.push(tin + "|" + taxPeriod);
        continue;
      } else {
        let taxPeriodMonth = "";
        if (taxPeriod.length === 4) {
          taxPeriodMonth = "12";
        } else {
          taxPeriodMonth = taxPeriod.substring(4);
          console.log(taxPeriodMonth);
          if (parseInt(taxPeriodMonth) < 1 || parseInt(taxPeriodMonth) > 12) {
            invalidEntries.push(tin + "|" + taxPeriod);
            continue;
          }
          if (taxPeriodMonth.length === 1) {
            // pad out the tax period
            taxPeriodMonth = "0" + taxPeriodMonth;
          }
        }

        taxPeriod = taxYear + taxPeriodMonth;
      }

      let toleranceVal = 0.0001; // default value
      if (currentRule === "OWNERSHIP") {
        let stoppingRuleValue = stoppingRuleVals[1];
        // TODO eventually need validation here
        if (stoppingRuleValue > 1 || stoppingRuleValue < 0) {
          alert(document.defaultView.errorList.tolerance);
          return;
        }
        //toleranceVal = stoppingRuleValue / 100;
        toleranceVal = stoppingRuleValue;
      } else {
        if (stoppingRuleVals[0] === 0) {
          alert(document.defaultView.errorList.potential);
          return;
        }
        if (taxYear <= 2012) {
          toleranceVal = 7142 / parseFloat(stoppingRuleVals[0]);
        } else {
          toleranceVal = 6313 / parseFloat(stoppingRuleVals[0]);
        }
      }

      //console.log(toleranceVal);
      tempTinTaxPeriod.push([tin + "|" + taxPeriod + "|" + toleranceVal]);
    }

    if (tempTinTaxPeriod.length > 0) {
      var myObject = {};
      myObject.tin = tempTinTaxPeriod.join(YK1.DELIMITER_COMMA);
      //myObject.taxYear = yearsArray;
      //should pull correct string value

      myObject.reportType = reportsToRun.join();

      console.log(myObject);
      callTstProduceReportsService(myObject);
      //BYPASS AUTHENTICATION AND PRODUCE REPORTS
      //to bypass use document.getElement instead of this.upload
      //this.upload.click();
      //document.getElementById("myTSTInput").click();
    }

    if (invalidEntries.length > 0) {
      let alertString = "Please check the entry for:\n";
      for (var i = 0; i < invalidEntries.length; i++) {
        let entry = invalidEntries[i];
        let entryArray = entry.split("|");
        alertString +=
          "TIN: " + entryArray[0] + " Tax Period: " + entryArray[1] + "\n";
      }

      //alert(alertString);
    }
  };

  const callTstProduceReportsService = (myObject) => {
    // test call for now - parameters hardcoded in the middle tier
    var servletParams = JSON.stringify(myObject);

    YK1.showLoader();

    var request = new XMLHttpRequest();
    request.open("POST", "api/tst/GetReportDataRequest", true);
    request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    request.setRequestHeader("X-AUTH-TOKEN", YK1.token);
    request.responseType = "blob";

    request.onload = function(e) {
      if (this.status === 200) {
        var blob = this.response;
        YK1.closeLoader();
        if (blob.size > 0) {
          var fileName = request.getResponseHeader("Filename");
          var noDataList = request.getResponseHeader("NoDataList");

          if (navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, fileName);
          } else {
            var downloadLink = document.createElement("a");
            var contentTypeHeader = request.getResponseHeader("Content-Type");

            downloadLink.href = URL.createObjectURL(
              new Blob([blob], { type: contentTypeHeader })
            );
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
          }

          /*
            NoDataList returned in format "TIN1|TY1,TIN2|TY2,TIN3|TY3,..."
            Need to split first by "," then "|"
            If only one, entry, then no "," and the result is, we get each char as a TIN|TY entry in the alert
          */
          if (noDataList.toLowerCase() !== "none") {
            let noDataArray = [];
            if (noDataList.indexOf(",") > 0) {
              noDataArray = noDataList.split(",");
            } else {
              noDataArray.push(noDataList);
            }

            let alertString = "No data found for: \n";
            for (var i = 0; i < noDataArray.length; i++) {
              let entry = noDataArray[i];
              let entryArray = entry.split("|");

              let reportName;
              switch (entryArray[3]) {
                case YK1.TST_REPORT_TYPE_TERMINALINVESTOR:
                  reportName = "Terminal Investor Report";
                  break;
                case YK1.TST_REPORT_TYPE_KEYSUMMARY:
                  reportName = "Key Case Summary Report";
                  break;
                default:
                  reportName = "Complete Investor Report";
              }

              alertString +=
                "TIN: " +
                entryArray[0] +
                " Tax Period: " +
                entryArray[1] +
                " Report Type: " +
                reportName +
                "\n";
            }
            //alert(alertString);
          }
        }
      } else if (this.status === 204) {
        //YK1.onFail({ status: this.status, msg: xhr.getResponseHeader("NO_CONTENT_MESSAGE") });
        YK1.onFail({
          status: this.status,
          //msg: document.defaultView.errorList.noGraphData,
          // Issue #396
          msg:"No data exists in yK1 for this tax period based on K1 relationships and the stopping rule (either $ or % limit) specified.",
        });
      } else {
        YK1.onFail({ status: this.status, msg: this.statusText });
      }
    };

    request.send(servletParams);
  };

  const tstWebServiceHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    var file = e.target.files[0];
    console.log(file);

    // window.location.href = "http://localhost:3000/testing.xlsx";

    var HTMLstring = "";
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    console.log(props);
    reader.onload = (e) => {
      var data = new Uint8Array(reader.result);
      var wb = XLSX.read(data, { type: "array" });
      HTMLstring = XLSX.write(wb, {
        sheet: "Sheet1",
        type: "binary",
        bookType: "html",
      });
      props.onhandleXLSXtab(HTMLstring);
    };
  };

  const calculateToleranceForPotentialAdj = (potAdj, taxYear) => {
    let tolerance = 0.001;
    if (taxYear <= 2013) {
      tolerance = 7142 / parseFloat(potAdj);
    } else {
      tolerance = 6313 / parseFloat(potAdj);
    }

    console.log(tolerance);
    return tolerance;
  };

  return (
    <div>
      <input
        id="myTSTInput"
        type="file"
        // ref={ref => (this.upload = ref)}
        style={{ display: "none" }}
        onChange={(e) => {
          tstWebServiceHandler(e);
        }}
      />
      <div className="usa-grid">
        <div className="usa-width-one-whole">
          <h3 style={{ fontWeight: "bold", textAlign: "center" }}>
            TST Structure Tool
          </h3>
        </div>
      </div>

      <div className="usa-grid">
        <div className="usa-width-one-whole" style={{ marginRight: 0 }}>
          <span style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px dotted", fontWeight: "bold" }}>
              Tier Reports
            </div>
          </span>
          <div>
            <div
              className="usa-width-one-half"
              style={{ marginRight: 0, minWidth: 245, paddingLeft: "15%" }}
            >
              <label>
                <div style={{ paddingTop: 5 }}>
                  <span style={{ fontWeight: "bold" }}>
                    Taxpayer Information
                  </span>
                  <br />
                  Enter Tin and Tax Period/Tax Year{" "}
                  <ToolTip id="TSTEnterTinTax" width={200}>
                    Enter Tins followed by a space
                    <br /> and a Tax period OR Tax Year
                  </ToolTip>
                </div>
                <textarea
                  className="form-control tstText"
                  name="textarea1"
                  rows="5"
                  value={tinTaxValue}
                  placeholder="E.g. XXXXXXXXXX YYYYMM"
                  onChange={(e) => {
                    // if (
                    //   YK1.matchDigitsSpaces.test(e.target.value) &&
                    //   YK1.maximumLength(e.target.value, 16)
                    // )

                    props.tstUpdateTinTax(e);
                  }}
                  style={{ width: "250px", fontSize: 16 }}
                  autoFocus
                />
              </label>
              <div
                id="invalidTinTax"
                style={{ color: "red", display: "none", position: "absolute" }}
              >
                Invalid Input. Please enter a valid TIN <br />
                and Tax Year combination
              </div>
            </div>
            <div
              className="usa-width-one-half"
              style={{
                marginTop: 36,
                minWidth: 301,
                fontSize: detectIE() ? 15 : null,
                paddingLeft: "15%",
              }}
            >
              <fieldset className="usa-fieldset-inputs usa-sans">
                <ul className="usa-unstyled-list">
                  {reportTypes.map((type, index) => {
                    return (
                      <CheckBox
                        checked={type.checked}
                        onChange={(e) => props.tstUpdateReport(e, reportTypes)}
                        key={index}
                        id={type.id}
                        name={type.name}
                      />
                    );
                  })}
                </ul>
              </fieldset>
            </div>
          </div>
          <div
            className="usa-width-one-whole"
            style={{ textAlign: "center", height: 47 }}
          >
            <br />
            <span style={{ fontWeight: "bold" }}>---Stopping Rules---</span>
            <br />
            <br />
          </div>
          <div className="usa-width-one-whole">
            <div
              className="usa-width-one-half"
              style={{
                paddingTop: 20,
                paddingLeft: "15%",
                marginRight: 0,
                width: "36%",
              }}
            >
              <div
                style={{
                  paddingTop: "4%",
                  paddingRight: 37,
                  float: "left",
                }}
              >
                <input
                  checked={stoppingRuleToggler}
                  id="POTENTIAL"
                  type="radio"
                  name="stoppingRules"
                  value="POTENTIAL"
                  onChange={(e) => {
                    props.tstUpdateStoppingRuleToggler(e, stoppingRuleToggler);
                  }}
                />
                <label htmlFor="POTENTIAL">
                  Potential Adj $ <ToolTip id="tstPotentialAdj" width={200} />
                </label>
              </div>
            </div>
            <div className="usa-width-one-half" style={{ paddingTop: 20 }}>
              <div style={{}}>
                <input
                  type="text"
                  ref={adjustmentRef}
                  style={{
                    width: "150px",
                    height: 44,
                  }}
                  disabled={!stoppingRuleToggler}
                  id="0"
                  value={stoppingRuleVals[0]}
                  onChange={(e) => {
                    if (YK1.matchDigitsSpaces.test(e.target.value))
                      stoppingRuleValidation(e);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole" style={{ paddingTop: 20 }}>
            <span style={{ fontWeight: "bold", paddingLeft: "25%" }}>
              --------OR--------
            </span>
          </div>
          <div className="usa-width-one-whole">
            <div
              className="usa-width-one-half"
              style={{
                paddingTop: 20,
                paddingLeft: "15%",
                marginRight: 0,
                width: "36%",
              }}
            >
              <div
                style={{
                  float: "left",
                  marginTop: 15,
                }}
              >
                <input
                  checked={!stoppingRuleToggler}
                  id="OWNERSHIP"
                  type="radio"
                  name="stoppingRules"
                  value="OWNERSHIP"
                  onChange={(e) => {
                    props.tstUpdateStoppingRuleToggler(e, stoppingRuleToggler);
                  }}
                />
                <label htmlFor="OWNERSHIP">
                  Ownership Tolerance{" "}
                  <ToolTip id="tstOwnershipTol" width={200} />
                </label>
              </div>
            </div>
            <div className="usa-width-one-half">
              <div style={{ paddingTop: 20 }}>
                <input
                  type="text"
                  ref={toleranceRef}
                  style={{ width: "150px", height: 44 }}
                  id="1"
                  value={stoppingRuleVals[1]}
                  onChange={stoppingRuleValidation}
                  disabled={stoppingRuleToggler}
                />
              </div>
              <br />
              <br />
              <br />
              <br />
            </div>
          </div>
        </div>

        {/* <div
          className="usa-width-one-half"
          style={{ minWidth: 330, paddingBottom: 40 }}
        >
          <span style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px dotted", fontWeight: "bold" }}>
              Graph Options
            </div>
          </span>
          <div
            id="overlayDisable"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.1)",
              zIndex: 999,
              position: "absolute",
              width: "50vw",
              height: 350,
              textAlign: "center"
            }}
          />
          <div
            style={{
              borderLeft: "1px dotted",
              paddingLeft: "6%",
              paddingTop: 28
            }}
          >
            <div className="usa-width-one-whole">
              <div className="usa-width-one-half">
                <input
                  checked={!graphRuleToggler}
                  id="numTerminalInvestors"
                  type="radio"
                  name="graphOptions"
                  value="numTerminalInvestors"
                  onChange={e => {
                    props.tstUpdateGraphRulesToggler(e, graphRuleToggler);
                  }}
                />
                <label
                  style={{
                    marginTop: "29px",
                    height: 44
                  }}
                  htmlFor="numTerminalInvestors"
                >
                  Top Number of Terminal Investors
                </label>
              </div>
              <div className="usa-width-one-fourth">
                <textarea
                  style={{
                    width: "75px",
                    marginTop: "17px",
                    height: 44
                  }}
                  id="terminalInvestors"
                  value={graphVal}
                  onChange={e => {
                    let graphRuleInput;
                    if (e.target.value.length === 0) {
                      graphRuleInput = "";
                    } else {
                      graphRuleInput = +e.target.value;
                    }
                    //make sure value is numeric
                    if (!isNaN(graphRuleInput)) {
                      props.tstUpdateGraphRule(e);
                    } else {
                      alert("Invalid Input");
                    }
                  }}
                  disabled={graphRuleToggler}
                />
              </div>
            </div>
            <div className="usa-width-one-whole">
              <div className="usa-width-one-half">
                <input
                  checked={graphRuleToggler}
                  id="percentOwnershipTolerance"
                  type="radio"
                  name="graphOptions"
                  value="percentOwnershipTolerance"
                  onChange={e => {
                    props.tstUpdateGraphRulesToggler(e, graphRuleToggler);
                  }}
                />
                <label
                  style={{
                    marginTop: "29px",
                    height: 44
                  }}
                  htmlFor="percentOwnershipTolerance"
                >
                  Investor Ownership Tolerance (%)
                </label>
              </div>
              <div className="usa-width-one-fourth">
                <textarea
                  style={{
                    width: "75px",
                    marginTop: "17px",
                    height: 44
                  }}
                  id="terminalInvestors"
                  value={ownershipTolerance}
                  onChange={props.tstUpdatedateOwnershipTolerance}
                  disabled={!graphRuleToggler}
                />
              </div>
            </div>

            <div style={{ paddingLeft: 20 }}>
              <input
                checked={groupNode}
                type="checkbox"
                id="GroupNode"
                value="GroupNode"
                onChange={() => {
                  props.tstUpdateGroupNode(groupNode);
                }}
                style={{ marginTop: 22, display: "inline-block" }}
              />

              <label
                htmlFor="GroupNode"
                style={{ marginTop: 0, display: "inline-block" }}
              >
                Include Group Node for Other Investors
              </label>
            </div>

            <div
              className="usa-width-one-whole"
              style={{
                textAlign: "center",
                paddingBottom: "6px"
              }}
            >
              <div className="usa-width-one-whole" style={{ padding: 30 }}>
                <h4> ---Window Select---</h4>
              </div>
            </div>
            <ul className="usa-unstyled-list">
              <div
                className="usa-width-one-half"
                style={{ textAlign: "center" }}
              >
                <RadioButton
                  style={{ display: "inline-block" }}
                  checked={windowToggler}
                  onChange={e => {
                    props.tstUpdateWindow(e, windowToggler);
                  }}
                  id="Single Window"
                  name="windowSelect"
                  value="Single Window"
                  label="Single Window"
                />
              </div>
              <div
                className="usa-width-one-half"
                style={{ textAlign: "center" }}
              >
                <RadioButton
                  style={{ display: "inline-block" }}
                  checked={!windowToggler}
                  onChange={e => {
                    props.tstUpdateWindow(e, windowToggler);
                  }}
                  id="Separate Windows"
                  name="windowSelect"
                  value="Separate Windows"
                  label="Separate Windows"
                />
              </div>
            </ul>
          </div>
        </div> */}
      </div>
      <div style={{ textAlign: "center", height: 80 }}>
        <button
          className="btn btn-lg text-center"
          type="submit"
          style={{ backgroundColor: "#2e8540", color: "white" }}
          onClick={() => {
            handleProduceReports();
          }}
        >
          Produce
          <br />
          Reports
        </button>
        {/* <button
          disabled={true}
          style={{
            backgroundColor: "rgb(46, 133, 64,.5)",
            color: "white"
          }}
          onClick={() => {
            handleProduceReportsGraph();
          }}
          className="btn btn-lg text-center"
          type="submit"
        >
          Produce
          <br />
          Reports & Graph
        </button> */}
        <button
          style={{
            backgroundColor: "#212121",
            color: "white",
          }}
          onClick={props.tstUpdateClear}
          className="btn btn-lg text-center"
          type="submit"
        >
          Reset
          <br />
          Defaults
        </button>
      </div>
    </div>
  );
};
const mapStateToProps = ({ tstState }) => {
  return { TSTstate: tstState };
};
const mapDispatchToProps = (dispatch) => {
  return {
    tstUpdateReport: (e, reportTypes) =>
      dispatch(tstUpdateReport(e, reportTypes)),
    tstUpdateStoppingRules: (stoppingRuleInput, stoppingRuleVals) =>
      dispatch(tstUpdateStoppingRules(stoppingRuleInput, stoppingRuleVals)),
    tstUpdateTinTax: (e) => dispatch(tstUpdateTinTax(e)),
    tstUpdateGraphRulesToggler: (e, graphRuleToggler) =>
      dispatch(tstUpdateGraphRulesToggler(e, graphRuleToggler)),
    tstUpdateGraphRule: (e) => dispatch(tstUpdateGraphRule(e)),
    tstUpdateGroupNode: (groupNode) => dispatch(tstUpdateGroupNode(groupNode)),
    tstUpdateWindow: (e, windowToggler) =>
      dispatch(tstUpdateWindow(e, windowToggler)),
    tstUpdateClear: () => dispatch(tstUpdateClear()),
    tstUpdateStoppingRuleToggler: (e, stoppingRuleToggler) =>
      dispatch(tstUpdateStoppingRuleToggler(e, stoppingRuleToggler)),
    tstUpdatedateOwnershipTolerance: () =>
      dispatch(tstUpdatedateOwnershipTolerance()),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TstPanelInterface);

// TstPanelInterface.propTypes = {
//   tstState: PropTypes.shape({
//     onTSTWindowChange: PropTypes.func.isRequired,
//     onGroupNodeChange: PropTypes.func.isRequired,
//     on eChange: PropTypes.func.isRequired,
//     onToggleGraphRule: PropTypes.func.isRequired,
//     onStoppingRuleToggle: PropTypes.func.isRequired,
//     onStoppingRuleChange: PropTypes.func.isRequired,
//     onTSTTinTaxChange: PropTypes.func.isRequired,
//     groupNode: PropTypes.bool.isRequired,
//     //stoppingRuleInput: PropTypes.string.isRequired,
//     //graphRuleInput: PropTypes.string.isRequired,
//     currentGraphRule: PropTypes.string.isRequired,
//     currentRule: PropTypes.string.isRequired,
//     tinTaxValue: PropTypes.string.isRequired,
//     report: PropTypes.string.isRequired,
//     window: PropTypes.string.isRequired,
//     stoppingRule: PropTypes.shape({
//       type: PropTypes.string.isRequired,
//       value: PropTypes.number.isRequired
//     }).isRequired,
//     windowToggler: PropTypes.bool.isRequired,
//     stoppingRuleToggler: PropTypes.bool.isRequired,
//     graphRuleToggler: PropTypes.bool.isRequired,
//     reportCheckedArray: PropTypes.array.isRequired,
//     stoppingRuleVals: PropTypes.array.isRequired,
//     graphVals: PropTypes.array.isRequired,
//     reportTypes: PropTypes.array.isRequired,
//     windowTypes: PropTypes.array.isRequired
//   })
// };
