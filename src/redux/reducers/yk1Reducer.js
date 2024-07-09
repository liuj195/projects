import {
  yk1ClearText,
  yk1TinTypeChange,
  yk1HopsChange,
  yk1TextChange,
  yk1NodeChange,
  yk1LimitValueChange,
  yk1WindowChange,
  yk1ClearDoc,
  yk1SelectedOptionChange,
  yk1LimitTypeOptionChange,
  yk1LimitDirOptionChange,
} from "../actions/yk1Actions";

import { yK1StateImport } from "../../js/panelInterfaces/panelInterfaces";

//deep clone the import - *NOTE* this method does not import infinity, NaN or undefined values
let yK1State = JSON.parse(JSON.stringify(yK1StateImport));

export const yk1Reducer = (state = yK1State, { type, payload }) => {
  switch (type) {
    case "initMultiSelect":
      return Object.assign({}, state, {
        multiselectOptions: payload.multiselectOptions,
        selectedOption: [payload.multiselectOptions[0]]
      });
    case "initSingleSelect":
      return Object.assign({}, state, {
        limitTypeOptions: payload.limitTypeOptions,
        selectedLimitTypeOption: [state.limitTypeOptions[0]],
        limitDirOptions: payload.limitDirOptions,
        selectedLimitDirOption: [state.limitDirOptions[0]],
        limitValue:[state.limitTypeDefaultValues[0].value]
      });
    case yk1ClearText:
      return Object.assign({}, state, {
        value: ""
      });
    case yk1ClearDoc:
      let yK1State = JSON.parse(JSON.stringify(yK1StateImport));
      return Object.assign({}, state, {
        ...yK1State,
        multiselectOptions: [...state.multiselectOptions],
        selectedOption: [state.multiselectOptions[0]],
        selectedLimitTypeOption: [state.limitTypeOptions[0]],
        selectedLimitDirOption: [state.limitDirOptions[0]],
        checkedVal: state.checkedVal
      });
    case yk1TinTypeChange:
      return Object.assign({}, state, {
        tinTypes: payload.tinTypes,
        typeSelect: payload.typeSelect
      });
    case yk1SelectedOptionChange:
      console.log(state);
      return Object.assign({}, state, {
        selectedOption: payload.selectedOption
      });
    case yk1LimitTypeOptionChange:
      return Object.assign({}, state, {
        selectedLimitTypeOption: payload.selectedLimitTypeOption,
        limitValue: payload.limitValue,
      });
    case yk1LimitDirOptionChange:
      console.log(state);
      return Object.assign({}, state, {
        selectedLimitDirOption: payload.selectedLimitDirOption
      });
    case yk1LimitValueChange:
        return Object.assign({}, state, {
          limitValue: payload.limitValue
      });
    case yk1TextChange:
      return Object.assign({}, state, {
        value: payload.value
      });
    case yk1HopsChange:
      return Object.assign({}, state, {
        hops: payload.hops
      });
    case yk1NodeChange:
      return Object.assign({}, state, {
        nodes: payload.nodes
      });
    case yk1WindowChange:
      return Object.assign({}, state, {
        windowTypes: payload.windowTypes,
        window: payload.window
      });

    default:
      return state;
  }
};
