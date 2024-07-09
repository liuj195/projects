import {
  botTypeSelect,
  botTinTaxChange,
  botMFTChange,
  botExaminationChange,
  botOptimizedInputValues,
  botClear
} from "../actions/botActions";

import { BoTStateImport } from "../../js/panelInterfaces/panelInterfaces";

let botState = JSON.parse(JSON.stringify(BoTStateImport));

export const botReducer = (state = botState, { type, payload }) => {
  switch (type) {
    case botTypeSelect:
      return Object.assign({}, state, {
        isDisabled: payload.isDisabled,
        optimizedRadioList: payload.optimizedRadioList
      });
    case botTinTaxChange:
      return Object.assign({}, state, {
        tinTaxValue: payload.tinTaxValue
      });
    case botMFTChange:
      return Object.assign({}, state, {
        MFTValue: payload.MFTValue
      });
    case botExaminationChange:
      return Object.assign({}, state, {
        examination: payload.examination
      });
    case botOptimizedInputValues:
      return Object.assign({}, state, {
        optimizedInputValues: payload.optimizedInputValues,
        optimizedValue: payload.optimizedValue
      });
    case botClear:
      let botStateReset = JSON.parse(JSON.stringify(BoTStateImport));
      return Object.assign({}, state, {
        ...botStateReset
      });
    default:
      return state;
  }
};
