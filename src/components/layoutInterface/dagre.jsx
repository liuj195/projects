import React from "react";
import YK1 from "../../js/yk1/yk1";
import MultiSelectBase from "../multiselect/multiSelectBase";

let isIE11 = YK1.msieversion();
let rankDirection = [
  { value: "TB", label: "Top to Bottom" },
  { value: "BT", label: "Bottom to Top" },
  { value: "LR", label: "Left to Right" },
  { value: "RL", label: "Right to Left" }
];
let ranker = [
  { value: "network-simplex", label: "network-simplex" },
  { value: "tight-tree", label: "tight-tree" },
  { value: "longest-path", label: "longest-path" }
];

const Dagre = props => {
  const getRankDir = () => {
    let selectedOption = rankDirection.filter(item => {
      return item.value === props.options.rankDir;
    });

    return selectedOption;
  };
  const getRanker = () => {
    let selectedOption = ranker.filter(item => {
      return item.value === props.options.ranker;
    });

    return selectedOption;
  };

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
              <div>Spacing Factor:</div>
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
                  step="0.1"
                  min="0"
                  max="10"
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
              <div>Orientation</div>
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
              <div className="usa-width-one-third">{props.options.rankDir}</div>
              <div className="usa-width-two-thirds">
                {props.options ? (
                  <MultiSelectBase
                    multiselectOptions={rankDirection}
                    onMultiselectChange={option => {
                      props.updateOptions({
                        ...copyOptions,
                        rankDir: option.value
                      });
                    }}
                    selectedOption={getRankDir()}
                  />
                ) : null}
              </div>
            </div>
          </div>
          <div className="usa-width-one-whole">
            <div className="usa-width-one-third">
              <div>Ranker Algorithm</div>
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
              <div className="usa-width-one-third">{props.options.ranker}</div>
              <div className="usa-width-two-thirds">
                {props.options ? (
                  <MultiSelectBase
                    multiselectOptions={ranker}
                    onMultiselectChange={option => {
                      props.updateOptions({
                        ...copyOptions,
                        ranker: option.value
                      });
                    }}
                    selectedOption={getRanker()}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dagre;
