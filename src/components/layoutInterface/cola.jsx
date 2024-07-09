import React from "react";
import YK1 from "../../js/yk1/yk1";
let isIE11 = YK1.msieversion();

const Cola = props => {
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
              <div>Edge Length:</div>
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
                {props.options.edgeLength
                  ? props.options.edgeLength
                  : "Not Set"}
              </div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.edgeLength}
                  min="1"
                  max="100"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      edgeLength: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Edge Symmetric Difference:</div>
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
                {props.options.edgeSymDiffLength
                  ? props.options.edgeSymDiffLength
                  : "Not Set"}
              </div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.edgeSymDiffLength}
                  min="1"
                  max="100"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      edgeSymDiffLength: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Jaccard Edge Length:</div>
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
                {props.options.edgeJaccardLength
                  ? props.options.edgeJaccardLength
                  : "Not Set"}
              </div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.edgeJaccardLength}
                  min="1"
                  max="100"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      edgeJaccardLength: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Convergence Threshold:</div>
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
                {props.options.convergenceThreshold}
              </div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.convergenceThreshold}
                  min="1"
                  max="100"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      convergenceThreshold: parseInt(e.target.value)
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

export default Cola;
