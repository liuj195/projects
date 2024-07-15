import React from "react";
import YK1 from "../../js/yk1/yk1";
let isIE11 = YK1.msieversion();

const Grid = props => {
  let copyOptions = { ...props.options };
  return (
    <div>
      {props.options ? (
        <div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Padding:</div>
              <span
                style={{
                  paddingBottom: 2,
                  float: "left",
                  marginTop: isIE11 ? 5 : null,
                  display: "inline-block",
                  paddingRight: 20
                }}
              ></span>
            </div>
            <div className="usa-width-two-thirds">
              <div className="usa-width-one-third">{props.options.padding}</div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.padding}
                  min="0"
                  max="100"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      padding: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Spacing Factor</div>
              <span
                style={{
                  paddingBottom: 2,
                  float: "left",
                  marginTop: isIE11 ? 5 : null,
                  display: "inline-block",
                  paddingRight: 20
                }}
              ></span>
            </div>
            <div className="usa-width-two-thirds">
              <div className="usa-width-one-third">
                {props.options.spacingFactor}
              </div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.spacingFactor}
                  min="0"
                  max="5"
                  step="0.1"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      spacingFactor: parseFloat(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Number Columns:</div>
              <span
                style={{
                  paddingBottom: 2,
                  float: "left",
                  marginTop: isIE11 ? 5 : null,
                  display: "inline-block",
                  paddingRight: 20
                }}
              ></span>
            </div>
            <div className="usa-width-two-thirds">
              <div className="usa-width-one-third">
                {props.options.cols ? props.options.cols : "Not Set"}
              </div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.cols}
                  min="1"
                  max="10"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      cols: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Number Rows:</div>
              <span
                style={{
                  paddingBottom: 2,
                  float: "left",
                  marginTop: isIE11 ? 5 : null,
                  display: "inline-block",
                  paddingRight: 20
                }}
              ></span>
            </div>
            <div className="usa-width-two-thirds">
              <div className="usa-width-one-third">
                {props.options.rows ? props.options.rows : "Not Set"}
              </div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.rows}
                  min="1"
                  max="10"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      rows: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Grid;
