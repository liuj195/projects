import {
  tstOwnershipTolerance,
  tstclear,
  tstWindowChange,
  tstGroupNodeChange,
  tstGraphRuleChange,
  tstTinTaxChange,
  tstReportTypeChange,
  tstStoppingRuleChange,
  tstGraphRuleToggleChange,
  tstStoppingRuleToggler
} from "../actions/tstActions";

import { tstStateImport } from "../../js/panelInterfaces/panelInterfaces";

//deep clone the import - *NOTE* this method does not import infinity, NaN or undefined values
let tstState = JSON.parse(JSON.stringify(tstStateImport));

export const tstReducer = (state = tstState, { type, payload }) => {
  switch (type) {
    case tstOwnershipTolerance:
      return Object.assign({}, state, {
        ownershipTolerance: payload.ownershipTolerance
      });
    case tstclear:
      let tstState = JSON.parse(JSON.stringify(tstStateImport));
      return Object.assign({}, state, {
        ...tstState
      });
    case tstWindowChange:
      return Object.assign({}, state, {
        windowToggler: payload.windowToggler,
        window: payload.window
      });
    case tstGroupNodeChange:
      return Object.assign({}, state, {
        groupNode: payload.groupNode
      });
    case tstGraphRuleChange:
      return Object.assign({}, state, {
        graphVal: payload.graphVal
      });
    case tstTinTaxChange:
      return Object.assign({}, state, {
        tinTaxValue: payload.tinTaxValue
      });
    case tstReportTypeChange:
      return Object.assign({}, state, {
        reportTypes: payload.reportTypes
      });
    case tstStoppingRuleChange:
      return Object.assign({}, state, {
        stoppingRuleInput: payload.stoppingRuleInput,
        stoppingRuleVals: payload.stoppingRuleVals
      });
    case tstGraphRuleToggleChange:
      return Object.assign({}, state, {
        currentGraphOption: payload.currentGraphOption,
        graphRuleToggler: payload.graphRuleToggler
      });
    case tstStoppingRuleToggler:
      return Object.assign({}, state, {
        currentRule: payload.currentRule,
        stoppingRuleToggler: payload.stoppingRuleToggler
      });
    default:
      return state;
  }
};
