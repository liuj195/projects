import React, { useEffect } from "react";
import RadioButton from "../buttons/radiobutton";
import YK1 from "../../js/yk1/yk1";
import ToolTip from "../tooltips/tooltips";
import { connect } from "react-redux";
import {
  botUpdateTypeSelect,
  botUpdateTinTaxChange,
  botUpdateMFT,
  botUpdateExamination,
  botUpdateOptimizedValue,
  botUpdateClear,
} from "../../redux/actions/botActions";
import { useIsMount } from "../utils/utils";

const BotPanelInterface = (props) => {
  let {
    optimizedRadioList,
    optimizedInputValues,
    isDisabled,
    MFTValue,
    tinTaxValue,
    examination,
  } = props.botState;
  const isMount = useIsMount();
  useEffect(
    () => {
      if (isMount) {
        //do nothing, let focus be set to inital postion
      } else {
        //let focus be set according to what is clicked on
        isDisabled.forEach((item, index) => {
          if (!item) {
            refRoll[index].current.focus();
          }
        });
      }
    },
    [isDisabled]
  );

  //refs for toggling focus on radio button inputs
  let allocate = React.createRef();
  let assess = React.createRef();
  let approx = React.createRef();
  let minimum = React.createRef();
  let refRoll = [allocate, assess, approx, minimum];

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

  const handleProduceReports = () => {
    let cpTinTaxValue = tinTaxValue;
    //filter dashes
    cpTinTaxValue = cpTinTaxValue.replace(/-/g, "");
    //data validation
    if (!validateData(cpTinTaxValue)) return;
    // validate TIN and tax period
    cpTinTaxValue = YK1.scrubTinsTaxPeriods(cpTinTaxValue);
    //validate Investor Reports number
    if (optimizedInputValues[2] > 999) {
      if (!window.confirm(document.defaultView.errorList.investorReport)) {
        return;
      }
    }
    let tinTaxArray = cpTinTaxValue.split("|");
    let tin = tinTaxArray[0];
    let taxPeriod = tinTaxArray[1];
    tin = YK1.padTin(tinTaxArray[0]);
    if (!YK1.validateTin(tin)) {
      alert("Invalid TIN");
      return;
    }
    // TODO need to flesh this out more later

    cpTinTaxValue = tin + "|" + taxPeriod;

    let selectedOptimization = YK1.BOT_ALLOCATE;
    let selectedOptValue = 0;
    // get the options and option value
    for (var i = 0; i < optimizedRadioList.length; i++) {
      if (optimizedRadioList[i].checked) {
        selectedOptimization = optimizedRadioList[i].id;
        if (
          selectedOptimization === YK1.BOT_ALLOCATE ||
          selectedOptimization === YK1.BOT_MIN_OWNERSHIP
        ) {
          selectedOptValue = parseFloat(optimizedInputValues[i]) / 100.0;
        } else {
          selectedOptValue = optimizedInputValues[i];
        }
      }
    }

    let myObject = {};
    myObject.tin = tin;
    myObject.taxYear = taxPeriod;
    myObject.mft = MFTValue;
    myObject.examinationResult = examination;
    myObject.optMethod = selectedOptimization;
    myObject.optValue = selectedOptValue;

    console.log(myObject);
    callBoTProduceReports(myObject);
  };

  const callBoTProduceReports = (myObject) => {
    YK1.showLoader();
    // test call for now - parameters hardcoded in the middle tier
    var servletParams = JSON.stringify(myObject);
    //api/tst/GetBOTReportDataRequest
    var request = new XMLHttpRequest();
    request.open("POST", "api/bot/GetBOTReportDataRequest", true);
    request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
    request.setRequestHeader("X-AUTH-TOKEN", YK1.token);
    request.setRequestHeader("X-FORWARDED-FOR", YK1.userIP);
    request.setRequestHeader("X-SESSION-ID", YK1.sessionId);

    request.responseType = "blob";

    request.onload = function(e) {
      YK1.closeLoader();

      if (this.status === 200) {
        var blob = this.response;
        console.log(blob);
        //console.log(this);
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
            alert(alertString);
          }
        }
      } else if (this.status === 204) {
        console.log(request);

        //YK1.onFail({ status: this.status, msg: xhr.getResponseHeader("NO_CONTENT_MESSAGE") });
        YK1.onFail({
          status: this.status,
          msg: document.defaultView.errorList.noGraphData,
        });
      } else {
        YK1.onFail({ status: this.status, msg: this.statusText });
      }
    };
    request.send(servletParams);
  };

  /*
  const validateTin = tin => {
    if (tin.length > 9) return false;
    return true;
  }

  const validateTaxPeriod = taxPeriod => {
    let year, month;
    if (taxPeriod.length == 4) {
      year = taxPeriod;
      month = 12;
    } else if (taxPeriod.length > 4 &&& taxPeriod.length <= 6{

    }
  }
*/
  return (
    <div>
      <div className="usa-grid">
        <div className="usa-width-one-whole">
          <h3 style={{ fontWeight: "bold", textAlign: "center" }}>
            Build Out Tool
          </h3>
        </div>
      </div>

      <div
        className="usa-grid"
        style={{ paddingRight: "0", paddingLeft: "3rem" }}
      >
        <div
          className="usa-width-one-half  bot-one-half"
          style={{ marginRight: 0 }}
        >
          <div className="usa-width-one-whole">
            <span style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px dotted", fontWeight: "bold" }}>
                Taxpayer Information
              </div>
            </span>
          </div>
          <br />
          <br />

          <div
            className="usa-width-one-half"
            style={{ paddingTop: "28px", paddingBottom: 28 }}
          >
            <label>
              TIN & TAX PERIOD <ToolTip id="botTinTax" width={200} />
              <input
                style={{
                  maxWidth: "250px",
                  minWidth: 226,
                }}
                value={tinTaxValue}
                onChange={(e) => {
                  // if (
                  //   YK1.matchDigitsSpaces.test(e.target.value) &&
                  //   e.target.value.length < 17
                  // )
                  props.botUpdateTinTaxChange(e);
                }}
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

          <div className="usa-width-one-fourth" style={{ paddingTop: "28px" }}>
            <label style={{ position: "absolute" }}>
              Pruning Threshold (%) <ToolTip id="botMFT" width={200} />
              <input
                style={{
                  width: "75px",
                }}
                value={MFTValue}
                onChange={(e) => {
                  let value = YK1.isPercentage(e.target.value);
                  //0 and "" considered false but they are valid input
                  if (value || value === 0 || value === "") {
                    if (YK1.maxDecimalAllowed(e.target.value, 3)) {
                      props.botUpdateMFT(e);
                    }
                  }
                }}
              />
            </label>
          </div>

          <h4
            className="usa-width-one-whole"
            style={{
              textAlign: "center",
              fontWeight: "bold",
              paddingBottom: 28,
            }}
          >
            Build Out Tool Information
          </h4>

          <div className="usa-width-one-third" style={{ paddingTop: 9 }}>
            <span>
              Examination Results $ <ToolTip id="botExamination" width={200} />
            </span>
          </div>
          <div className="usa-width-one-fourth">
            <textarea
              style={{
                width: "145px",
                height: 44,
              }}
              name="RESULTS"
              id="RESULTS"
              onChange={(e) => {
                if (YK1.posNegTwoDecimal.test(e.target.value))
                  props.botUpdateExamination(e);
              }}
              value={examination}
            />
          </div>
        </div>

        <div className="usa-width-one-half " style={{ marginRight: 0 }}>
          <span style={{ textAlign: "center" }}>
            <div style={{ borderBottom: "1px dotted", fontWeight: "bold" }}>
              Optimize Build Out Tool
            </div>
          </span>

          <div
            className="usa-width-one-half"
            style={{
              borderLeft: "1px dotted",
              paddingLeft: "6%",
              marginRight: "0",
            }}
          >
            <ul className="usa-unstyled-list " style={{ marginTop: 17 }}>
              {optimizedRadioList.map((type, index) => {
                return (
                  <div
                    className="usa-width-one-whole botStyledList"
                    key={index}
                  >
                    <RadioButton
                      onChange={(e) => {
                        props.botUpdateTypeSelect(
                          e,
                          optimizedRadioList,
                          isDisabled
                        );
                      }}
                      id={type.id}
                      name="typeSelect"
                      checked={type.checked}
                      label={type.name}
                    />
                  </div>
                );
              })}
            </ul>
          </div>

          <div className="usa-width-one-half">
            <ul
              className="usa-unstyled-list botli"
              style={{ marginTop: "17px" }}
            >
              <div className="usa-width-one-whole">
                <li>
                  <div
                    className="usa-width-one-third"
                    style={{ minWidth: "120px" }}
                  >
                    <input
                      type="text"
                      style={{
                        height: 44,
                      }}
                      disabled={isDisabled[0]}
                      onChange={(e) => {
                        let value = YK1.isPercentage(e.target.value);
                        //0 and "" considered false but they are valid input
                        if (value || value === 0 || value === "") {
                          if (YK1.maxDecimalAllowed(e.target.value, 6)) {
                            props.botUpdateOptimizedValue(
                              e,
                              optimizedInputValues
                            );
                          }
                        }
                      }}
                      id="0"
                      name="allocateInput"
                      value={optimizedInputValues[0]}
                      ref={allocate}
                    />
                  </div>
                  <div className="usa-width-one-half">
                    <span style={{ float: "left" }}>% Examination Results</span>
                  </div>
                </li>
              </div>
              <div className="usa-width-one-whole">
                <li>
                  <div
                    className="usa-width-one-third"
                    style={{ minWidth: "120px" }}
                  >
                    <input
                      type="text"
                      style={{
                        height: 44,
                      }}
                      disabled={isDisabled[1]}
                      id="1"
                      name="assessInput"
                      onChange={(e) => {
                        props.botUpdateOptimizedValue(e, optimizedInputValues);
                      }}
                      value={optimizedInputValues[1]}
                      ref={assess}
                    />
                  </div>
                  <div className="usa-width-one-half">
                    <span style={{ float: "left" }}>Tax Per Investor</span>
                  </div>
                </li>
              </div>
              <div className="usa-width-one-whole">
                <li>
                  <div
                    className="usa-width-one-third"
                    style={{ minWidth: "120px" }}
                  >
                    <input
                      type="text"
                      style={{
                        height: 44,
                      }}
                      id="2"
                      name="approxInput"
                      onChange={(e) => {
                        if (YK1.matchDigits.test(e.target.value))
                          props.botUpdateOptimizedValue(
                            e,
                            optimizedInputValues
                          );
                      }}
                      value={optimizedInputValues[2]}
                      disabled={isDisabled[2]}
                      ref={approx}
                    />
                  </div>
                  <div className="usa-width-one-half">
                    <span style={{ float: "left" }}>Investor Reports</span>
                  </div>
                </li>
              </div>
              <div className="usa-width-one-whole">
                <li>
                  <div
                    className="usa-width-one-third"
                    style={{ minWidth: "120px" }}
                  >
                    <input
                      type="text"
                      style={{
                        height: 44,
                      }}
                      disabled={isDisabled[3]}
                      id="3"
                      name="minimumInput"
                      onChange={(e) => {
                        let value = YK1.isPercentage(e.target.value);
                        //0 and "" considered false but they are valid input
                        if (value || value === 0 || value === "") {
                          if (YK1.maxDecimalAllowed(e.target.value, 6)) {
                            props.botUpdateOptimizedValue(
                              e,
                              optimizedInputValues
                            );
                          }
                        }
                      }}
                      value={optimizedInputValues[3]}
                      ref={minimum}
                    />
                  </div>
                  <div className="usa-width-one-half">
                    <span style={{ float: "left" }}>%</span>
                  </div>
                </li>
              </div>
            </ul>
          </div>
        </div>
        <div className="usa-width-one-whole" style={{ textAlign: "center" }}>
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
            style={{
              backgroundColor: "rgb(46, 133, 64,.5)",
              color: "white"
            }}
            disabled={true}
            onClick={() => {
              handleProduceReports();
            }}
            className="btn btn-lg text-center"
            type="submit"
          >
            Produce
            <br />
            Reports & Graph
          </button> */}
          <span>
            <button
              style={{
                backgroundColor: "#212121",
                color: "white",
              }}
              onClick={props.botUpdateClear}
              className="btn btn-lg text-center"
              type="submit"
            >
              Reset <br />
              Defaults
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = ({ botState }, props) => {
  return { botState: botState };
};
const mapDispatchToProps = (dispatch) => {
  return {
    botUpdateTypeSelect: (e, optimizedRadioList, isDisabled) =>
      dispatch(botUpdateTypeSelect(e, optimizedRadioList, isDisabled)),
    botUpdateTinTaxChange: (e) => dispatch(botUpdateTinTaxChange(e)),
    botUpdateMFT: (e) => dispatch(botUpdateMFT(e)),
    botUpdateExamination: (e) => dispatch(botUpdateExamination(e)),
    botUpdateOptimizedValue: (e, optimizedInputValues) =>
      dispatch(botUpdateOptimizedValue(e, optimizedInputValues)),
    botUpdateClear: () => dispatch(botUpdateClear()),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BotPanelInterface);

// BotPanelInterface.propTypes = {
//   BoTState: PropTypes.shape({
//     onReportChange: PropTypes.func.isRequired,
//     onOptimizedValue: PropTypes.func.isRequired,
//     onTinTaxChange: PropTypes.func.isRequired,
//     onExaminationChange: PropTypes.func.isRequired,
//     onMFTChange: PropTypes.func.isRequired,
//     optimizedRadioList: PropTypes.array.isRequired,
//     optimizedInputValues: PropTypes.array.isRequired,
//     tinTaxValue: PropTypes.string.isRequired,
//     MFTValue: PropTypes.string.isRequired,
//     //examination: PropTypes.string.isRequired,
//     //optimizedValue: PropTypes.number.isRequired,
//     currentRadio: PropTypes.string.isRequired,
//     isDisabled: PropTypes.array.isRequired
//   }).isRequired
// };
