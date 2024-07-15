import React from "react";
import YK1 from "../../js/yk1/yk1";
let isIE11 = YK1.msieversion();

const Circle = props => {
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
              <div>Node Separation:</div>
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
              <div className="usa-width-one-third">{props.options.nodeSep}</div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.nodeSep}
                  min="0"
                  max="1000"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      nodeSep: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Edge Separation:</div>
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
              <div className="usa-width-one-third">{props.options.edgeSep}</div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.edgeSep}
                  min="0"
                  max="1000"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      edgeSep: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Rank Separation:</div>
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
              <div className="usa-width-one-third">{props.options.rankSep}</div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.rankSep}
                  min="0"
                  max="1000"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      rankSep: parseInt(e.target.value)
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Sweep:</div>
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
              <div className="usa-width-one-third">{props.options.sweep}</div>
              <div className="usa-width-two-thirds">
                <input
                  type="range"
                  name="interfaceSlider"
                  value={props.options.sweep}
                  min="1"
                  max="100"
                  onChange={e => {
                    props.updateOptions({
                      ...copyOptions,
                      sweep: parseInt(e.target.value)
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

export default Circle;
