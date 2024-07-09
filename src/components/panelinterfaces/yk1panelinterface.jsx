import React, {useState, useEffect, useRef} from "react";
import MultiSelect from "../multiselect/multiselect";
import MultiSelectBase from "../multiselect/multiSelectBase";
import RadioButton from "../buttons/radiobutton";
import CheckBox from "../buttons/checkBox";
import SVG from "../svg/xButtonSvg";
import ToolTip from "../tooltips/tooltips";
import YK1 from "../../js/yk1/yk1";
import { connect } from "react-redux";
import {
  yk1UpdateClearText,
  yk1UpdateClearDoc,
  yk1UpdateTinType,
  yk1UpdateMultiselect,
  yk1UpdateLimitTypeSelect,
  yk1UpdateSingleSelect,
  yk1UpdateLimitDirSelect,
  yk1UpdateTextChange,
  yk1UpdateHopsChange,
  yk1UpdateNodeChange,
  yk1UpdateLimitValueChange,
  yk1UpdateWindowChange,
} from "../../redux/actions/yk1Actions";

const Yk1Interface = (props) => {
  let {
    tinTypes,
    windowTypes,
    multiselectOptions,
    limitTypeOptions,
    limitDirOptions,
    limitTypeDefaultValues,
    value,
    selectedOption,
    selectedLimitTypeOption,
    selectedLimitDirOption,
    hops,
    nodes,
    limitValue,
    checkedVal,
    typeSelect,
    window,
  } = props.yk1State;

  //const [checked, setChecked] = useState(false);

  const [checked, setChecked] = useState(() => {
      if (sessionStorage.getItem('checked') === null || sessionStorage.getItem('checked') === 'false' ){
        document.getElementsByClassName('checkbox').checked = false;
        return false;
      } else {
        return sessionStorage.getItem('checked');
      }
  })

  const handleCheckedChange = (e) => {
    setChecked(!checked);
    checkedVal = e.target.checked;
    sessionStorage.setItem('checked', checkedVal);

    if (checkedVal === false) {
      //alert("Warning: Uncheck Use Traversal Parameters will remove all selected parameter options!")
      //comment the following three lines if persistent values are required
      //when Use Traversal Parameters checkbox is unchecked

      limitTypeDefaultValues[0].value = "0.30";
      limitTypeDefaultValues[1].value = "0.05";
      limitTypeDefaultValues[2].value = "10000";
    } else {
      // pre-populate limit type and limit direction dropdowns default values
      props.yk1UpdateSingleSelect(limitTypeOptions, limitDirOptions);
    }
  }

  const updateLimitType = (e) => {
    let limitType = e.value;

    if (limitType === limitTypeDefaultValues[0].id){
      //access recent percent key case value
      limitValue = limitTypeDefaultValues[0].value;
    } else if (limitType === limitTypeDefaultValues[1].id) {
      //access recent Percent Direct value
      limitValue = limitTypeDefaultValues[1].value;
    } else {
      //access recent dollar amount value
      limitValue = limitTypeDefaultValues[2].value;
    }

    props.yk1UpdateLimitTypeSelect(e, limitValue);
  }

  const handleLimitValueMouseOut = (e) => {
    let limitType = selectedLimitTypeOption.value;
    let limitValue = e.target.value;

    if (limitType === limitTypeOptions[0].value || limitType === limitTypeOptions[1].value) {
      if (limitValue <= 0 || limitValue > 1) {
        alert("Warning: Percent must be between 0 and 1!");
        return;
      }
    } else {
      if (limitValue <= 0) {
        alert("Warning: Dollar amount must be greater than 0!");
        return;
      }
    }
  }

  const updateLimitValue = (e) => {
      let limitType = selectedLimitTypeOption.value;
      let limitValue = e.target.value;

      if (typeof limitType === "undefined") { //if no type is selected initially
        limitType = limitTypeOptions[0].value; //set limit type to first option
      }

      if (limitType === limitTypeOptions[0].value || limitType === limitTypeOptions[1].value) {
        let value = YK1.isPercentage(limitValue);

        if (value || value === 0 || value === "") {
          if (YK1.maxDecimalAllowed(limitValue, 3)) {
            props.yk1UpdateLimitValueChange(limitValue);
          }
        }

        if (limitType === limitTypeOptions[0].value) {
          //retain new percent key case value
          limitTypeDefaultValues[0].value = limitValue;
        } else {
          //retain new Percent Direct value
          limitTypeDefaultValues[1].value = limitValue;
        }
      } else {//Dollar Amount
        if (limitValue.length === 0 || isNaN(limitValue)) {
          limitValue = "";
        } else {
          limitValue = +e.target.value;
        }

        props.yk1UpdateLimitValueChange(limitValue);

        //retain new dollar amount value
        limitTypeDefaultValues[2].value = limitValue;
      }
  }

  const validateData = (values) => {
    let validate = YK1.yK1validateLengthandForm(values, 9);
    if (!validate.isValid) {
      let errBlock = document.getElementById("invalidTinTax");
      errBlock.style.display = "block";
      errBlock.innerHTML = validate.err;
    }
    return validate.isValid;
  };

  const handleDrawSubmit = (e) => {
    let limitType;
    let limitVal;
    let limitDir;

    if (checked === false){ // Traversal Parameters is not used
      limitType = 'NA';
      limitVal = "NA";
      limitDir = "NA";
    } else { //Traversal Parameters box is checked
      limitType = selectedLimitTypeOption.value;
      limitVal = limitValue.toString();
      limitDir = selectedLimitDirOption.value;

      // use default value if no option is selected
      if (typeof limitType === "undefined") {
        limitType = limitTypeOptions[0].value;
      }

      if (typeof limitDir === "undefined") {
        limitDir = limitDirOptions[0].value;
      }

      if (limitType === limitTypeOptions[0].value || limitType === limitTypeOptions[1].value) {
        if (limitValue <= 0 || limitValue > 1) {
          alert("Warning: Percent must be between 0 and 1!");
          return;
        }
      } else {
        if(limitValue <= 0) {
          alert("Warning: Dollar amount must be greater than 0!");
          return;
        }

        if (!(/^[1-9]\d*$/.test(limitValue))) {
          alert("Warning: No leading zero for dollar amount");
          return;
        };
      }
    }

    if (selectedOption.length < 1) {
      alert(document.defaultView.errorList.selectTaxYear);
      return;
    } else if (value.length < 1) {
      alert(document.defaultView.errorList.selectTin);
      return;
    } else {
      //scrub
      let filterDashes = YK1.filterDashes(value);
      let checkValues = filterDashes.split("\n");
      if (!validateData(checkValues)) return;

      let tinValues = YK1.scrubTins(filterDashes);
      let tinArray = YK1.parseTins(tinValues);
      //reform
      tinArray = tinArray.filter((item) => {
        return item !== "";
      });

      let years = [];

      if (selectedOption) {
        years = selectedOption.map((item) => {
          return item.value;
        });
      }
      //choppy way to keep tract of the number of async ajax calls we are stacking up here
      YK1.noDataFailArray = [];
      YK1.numYears = years.length;
      YK1.yearsIteration = 0;

      if (window === "SINGLE") {
        tinValues = tinArray.join("\n");
        //create object for each tax year
        for (let i = 0; i < years.length; i++) {
          //create object for Yk1GraphContent instance
          let formData = {
            taxYears: years[i],
            tins: tinValues,
            depth: hops,
            group: nodes,
            type: typeSelect,
            limit: limitType,
            value: limitVal,
            direction: limitDir,
          };
          //instantiate and pass formData object
          props.onAddTab(formData);

          //alert(formData.taxYears + "," + formData.tins + "," + formData.depth + "," + formData.group + "," + formData.type);
          //alert(formData.limit + "," + formData.value + "," + formData.direction);
        }

      } else if (window === "SEPARATE") {
        //create object for each year AND each TIN
        for (let i = 0; i < years.length; i++) {
          // let tinArray = YK1.parseTins(tinValues);

          for (let j = 0; j < tinArray.length; j++) {
            let formData = {
              taxYears: years[i],
              tins: tinArray[j],
              depth: hops,
              group: nodes,
              type: typeSelect,
              limit: limitType,
              value: limitVal,
              direction: limitDir,
            };

            //instantiate and pass formData object
            props.onAddTab(formData);
          }
        }
      }
    }
  };

  const liStyle = {
    paddingLeft: "4%",
    display: "inline-block",
  };
  var isIE11 = YK1.msieversion();

  return (
    <div>
      <div className="usa-grid">
        <div className="usa-width-one-whole">
          <h3 style={{ fontWeight: "bold", textAlign: "center" }}>
            yK1 Search Parameters
          </h3>
        </div>
      </div>

      <div className="usa-grid">
        <div
          className="usa-width-one-half"
          style={{
            marginRight: 0,
            marginLeft: 14,
          }}
        >
          <div className="usa-width-one-whole">
            <span style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px dotted", fontWeight: "bold" }}>
                Tin & Tax Year
              </div>
            </span>
          </div>

          <div className="muliSelect usa-width-one-whole">
            <div
              style={{
                maxWidth: 460,
                paddingTop: 28,
                paddingRight: 20,
                paddingBottom: 20,
              }}
            >
              <MultiSelect
                multiselectOptions={multiselectOptions}
                onMultiselectChange={props.yk1UpdateMultiselect}
                selectedOption={selectedOption}
              />
              <span
                style={{
                  position: "relative",
                  float: "right",
                  bottom: 40,
                  zIndex: 98,
                  right: -15,
                }}
              >
                <ToolTip id="yk1Multi" width={200} />
              </span>
            </div>
          </div>

          <form style={{ textAlign: "center", maxWidth: "442px" }}>
            <div className="usa-width-one-whole" style={{ paddingBottom: 20 }}>
              <ul className="usa-unstyled-list" style={{ width: "100%" }}>
                {tinTypes.map((type, index) => {
                  return (
                    <RadioButton
                      self={type}
                      onChange={(e) => props.yk1UpdateTinType(e, tinTypes)}
                      data={tinTypes}
                      key={index}
                      style={liStyle}
                      id={type.id}
                      name="typeSelect"
                      checked={type.checked}
                      label={type.id}
                    />
                  );
                })}
              </ul>
            </div>

            <div style={{ textAlign: "left" }}>
              Copy Tins Here <ToolTip id="yK1CopyTins" width={200} />
            </div>
            <textarea
              className="form-control"
              id="yk1TextArea"
              name="textarea1"
              rows="5"
              value={value}
              // placeholder="Enter Tin(s)"
              onChange={(e) => {
                // if (
                //   YK1.matchDigitsSpacesXx.test(e.target.value) &&
                //   YK1.maximumLength(e.target.value, 9)
                // )

                props.yk1UpdateTextChange(e);
              }}
              autoFocus
            />
            <SVG
              onClearText={props.yk1UpdateClearText}
              styleObj={{
                float: "right",
                top: -160,
                color: "rgb(204, 204, 204)",
                position: "relative",
              }}
            />
            <div
              id="invalidTinTax"
              style={{
                color: "red",
                display: "none",
                padding: 5,
              }}
            >
              Invalid Input. Please Enter a valid TIN
            </div>
          </form>
        </div>

        <div className="usa-width-one-half">
          <div className="usa-width-one-whole">
            <span style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px dotted", fontWeight: "bold" }}>
                Graph
              </div>
            </span>
          </div>

          <div
            className="usa-width-one-whole"
            style={{
              borderLeft: "1px dotted",
              paddingLeft: "6%",
              paddingTop: 28,
            }}
          >
            <div className="usa-width-one-half" style={{ paddingBottom: 10 }}>
              <label htmlFor="interfaceSlider">
                Number of Hops:
                <ToolTip id="yK1NumHops" width={200} />
              </label>
            </div>
            <div className="usa-width-one-half" style={{ margin: 0 }}>
              <div className="usa-width-one-fourth" style={{ width: 30 }}>
                <span
                  style={{
                    paddingBottom: 2,
                    float: "left",
                    marginTop: isIE11 ? 5 : null,
                    display: "inline-block",
                    paddingRight: 20,
                  }}
                >
                  {hops}
                </span>
              </div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={hops}
                  min="0"
                  max="10"
                  onChange={props.yk1UpdateHopsChange}
                  style={{
                    maxWidth: 250,
                    marginTop: "-5px",
                    display: "inline-block",
                  }}
                />
              </div>
            </div>
            <br /> <br />
            <div className="usa-width-one-whole">
              <div className="usa-width-one-half">
                <div style={{ paddingTop: "1%" }}>
                  <label htmlFor="nodeInput">
                    Group Node Threshold:{" "}
                    <ToolTip id="yK1NodeThreshold" width={200} />
                  </label>
                </div>
              </div>
              <div className="usa-width-one-half" style={{ margin: 0 }}>
                <input
                  type="text"
                  style={{
                    width: 75,
                    height: 30,
                  }}
                  value={nodes}
                  // placeholder="Enter Tin(s)"
                  onChange={props.yk1UpdateNodeChange}
                />
              </div>
            </div>

            <div className="usa-width-one-whole"
                style={{
                  textAlign: "left",
                  paddingBottom: "10px",
                  paddingTop:"10px"
                }}
              >
                <CheckBox
                  style={{ display: "inline-block", height: 0}}
                  checked={checked}
                  onChange={handleCheckedChange}
                  name="Use Traversal Parameters"
                  label="Use Traversal Parameters"
                />
            </div>

            { checked && (
            <div className="usa-width-one-whole">
              <div className="usa-width-one-half">
                <div className="usa-width-three-fourth">
                <label>Limit Type {" "}
                <ToolTip id="yK1LimitType" width={200} />
                </label>
                <div style={{paddingBottom: "5px" }}></div>
                    <MultiSelectBase
                      multiselectOptions={limitTypeOptions}
                      onMultiselectChange={updateLimitType}
                      selectedOption={selectedLimitTypeOption}
                    />
                </div>
              </div>
              <div className="usa-width-one-half" style={{ paddingBottom: 10 }}>
                <label>Limit Value{" "}
                  <ToolTip id="yK1LimitValue" width={200} />
                </label>
                <div style={{paddingBottom: "5px" }}></div>
                <input
                  type="text"
                  style={{
                    width: 125,
                    height: 30,
                  }}
                  value={limitValue}
                  onChange={(e) => {
                    updateLimitValue(e)
                  }}
                  onMouseLeave={handleLimitValueMouseOut}
                />
              </div>
            </div>
            )}
            {checked && (
            <div className="usa-width-one-whole">
              <div className="usa-width-two-Thirds" style={{ marginTop: "5px" }}>
                <label>Limit Direction{" "}
                <ToolTip id="yK1LimitDirection" width={200} />
                </label>
                <div style={{paddingBottom: "5px" }}></div>
                <div className="usa-width-one-half">
                  <MultiSelectBase
                    multiselectOptions={limitDirOptions}
                    onMultiselectChange={props.yk1UpdateLimitDirSelect}
                    selectedOption={selectedLimitDirOption}
                  />
                  </div>
                </div>
            </div>
            )}
            <div
              className="usa-width-one-whole"
              style={{
                textAlign: "center",
                paddingBottom: "6px",
              }}
            >
              <div className="usa-width-one-whole" style={{ padding: 10 }}>
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
                  checked={windowTypes[0].checked}
                  onChange={(e) => {
                    props.yk1UpdateWindowChange(e, windowTypes);
                  }}
                  id={windowTypes[0].id}
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
                  checked={windowTypes[1].checked}
                  onChange={(e) => {
                    props.yk1UpdateWindowChange(e, windowTypes);
                  }}
                  id={windowTypes[1].id}
                  name="windowSelect"
                  value="Separate Windows"
                  label="Separate Windows"
                />
              </div>
            </ul>
          </div>
        </div>
      </div>
      <div>
        <div
          className="usa-width-one-whole"
          style={{ textAlign: "center", paddingRight: "1%" }}
        >
          <div className="usa-width-one-third">&nbsp; </div>
          <div className="usa-width-one-third" style={{ textAlign: "center" }}>
            <div
              className="usa-width-one-half"
              style={{
                margin: 0,

                display: "inline-block",
                textAlign: "right",
              }}
            >
              <button
                style={{
                  backgroundColor: "#2e8540",
                  color: "white",
                  width: 79,
                  paddingTop: 24,
                  paddingBottom: 28,
                }}
                onClick={handleDrawSubmit}
                className="btn btn-md text-center"
                type="submit"
              >
                <div style={{ marginTop: -5, position: "absolute" }}>Draw</div>
              </button>
            </div>
            <div
              className="usa-width-one-half"
              style={{
                margin: 0,

                display: "inline-block",
                textAlign: "left",
              }}
            >
              <button
                style={{
                  backgroundColor: "#212121",
                  color: "white",
                }}
                onClick={()=> {
                  if (checked === true || sessionStorage.getItem('checked') === 'true'){
                    setChecked(false);
                    document.getElementsByClassName('checkbox').checked = false;
                  }
                  props.yk1UpdateClearDoc()
                }}
                className="btn btn-md text-center"
                type="submit"
              >
                Reset <br />
                Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const mapStateToProps = ({ yk1State }, props) => {
  return { yk1State: yk1State };
};
const mapDispatchToProps = (dispatch) => ({
  yk1UpdateNodeChange: (e) => {
    dispatch(yk1UpdateNodeChange(e));
  },
  yk1UpdateWindowChange: (e, windowTypes) => {
    dispatch(yk1UpdateWindowChange(e, windowTypes));
  },
  yk1UpdateHopsChange: (e) => {
    dispatch(yk1UpdateHopsChange(e));
  },
  yk1UpdateTinType: (e, tinTypes) => {
    dispatch(yk1UpdateTinType(e, tinTypes));
  },

  yk1UpdateClearDoc: () => {
    dispatch(yk1UpdateClearDoc());
  },

  yk1UpdateMultiselect: (selectedOption) =>
    dispatch(yk1UpdateMultiselect(selectedOption)),

  yk1UpdateSingleSelect: (limitTypeOptions, limitDirOptions) =>
    dispatch({
      type: "initSingleSelect",
      payload: { limitTypeOptions: limitTypeOptions, limitDirOptions: limitDirOptions}
  }),

  yk1UpdateLimitTypeSelect: (selectedLimitTypeOption, limitValue) =>
    dispatch(yk1UpdateLimitTypeSelect(selectedLimitTypeOption, limitValue)),

  yk1UpdateLimitValueChange: (limitValue) => {
    dispatch(yk1UpdateLimitValueChange(limitValue));
  },

  yk1UpdateLimitDirSelect: (selectedLimitDirOption) =>
    dispatch(yk1UpdateLimitDirSelect(selectedLimitDirOption)),

  yk1UpdateTextChange: (e) => {
    dispatch(yk1UpdateTextChange(e));
  },
  yk1UpdateClearText: () => {
    dispatch(yk1UpdateClearText());
  },
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Yk1Interface);

// Yk1Interface.propTypes = {
//   yK1State: PropTypes.shape({
//     onTinTypeChange: PropTypes.func.isRequired,
//     onAddTab: PropTypes.func.isRequired,
//     onMultiselectChange: PropTypes.func.isRequired,
//     onHopsChange: PropTypes.func.isRequired,
//     onTextChange: PropTypes.func.isRequired,
//     onNodeChange: PropTypes.func.isRequired,
//     onWindowChange: PropTypes.func.isRequired,
//     onHandleClear: PropTypes.func.isRequired,
//     selectedOption: PropTypes.array.isRequired,
//     hops: PropTypes.number.isRequired,
//     value: PropTypes.string.isRequired,
//     typeSelect: PropTypes.string.isRequired,
//     window: PropTypes.string.isRequired,
//     //nodes: PropTypes.number.isRequired,
//     tinTypes: PropTypes.array.isRequired,
//     windowTypes: PropTypes.array.isRequired
//   }).isRequired
// };
