export const tstOwnershipTolerance = "updateTSTOwnershipTolerance";
export const tstclear = "updateTSTClear";
export const tstWindowChange = "updateTSTWindowChange";
export const tstGroupNodeChange = "tstGroupNodeChange";
export const tstGraphRuleChange = "tstGraphRuleChange";
export const tstTinTaxChange = "tstTinTaxChange";
export const tstReportTypeChange = "tstReportTypeChange";
export const tstStoppingRuleChange = "tstStoppingRuleChange";
export const tstGraphRuleToggleChange = "tstGraphRuleToggleChange";
export const tstStoppingRuleToggler = "tstStoppingRuleToggler";

export function tstUpdatedateOwnershipTolerance(e) {
  return {
    type: tstOwnershipTolerance,
    payload: {
      ownershipTolerance: e.target.value
    }
  };
}

export function tstUpdateClear(e) {
  return {
    type: tstclear
  };
}

export function tstUpdateWindow(e, windowToggler) {
  return {
    type: tstWindowChange,
    payload: {
      windowToggler: windowToggler,
      window: e.target.id
    }
  };
}
export function tstUpdateGroupNode(groupNode) {
  return {
    type: tstGroupNodeChange,
    payload: {
      groupNode: !groupNode
    }
  };
}
export function tstUpdateGraphRule(e) {
  return {
    type: tstGraphRuleChange,
    payload: {
      graphVal: e.target.value
    }
  };
}

export function tstUpdateTinTax(e) {
  return {
    type: tstTinTaxChange,
    payload: {
      tinTaxValue: e.target.value
    }
  };
}

export function tstUpdateReport(e, reportTypes) {
  reportTypes.forEach(item => {
    if (item.id === e.target.id) {
      item.checked = !item.checked;
    }
  });
  return {
    type: tstReportTypeChange,
    payload: {
      reportTypes
    }
  };
}
// //this may only be partially implemented
export function tstUpdateStoppingRules(stoppingRuleInput, stoppingRuleVals) {
  return {
    type: tstStoppingRuleChange,
    payload: {
      stoppingRuleInput,
      stoppingRuleVals
    }
  };
}

export function tstUpdateGraphRulesToggler(e, graphRuleToggler) {
  return {
    type: tstGraphRuleToggleChange,
    payload: {
      currentGraphOption: e.target.value,
      graphRuleToggler: !graphRuleToggler
    }
  };
}

export function tstUpdateStoppingRuleToggler(e, stoppingRuleToggler) {
  return {
    type: tstStoppingRuleToggler,
    payload: {
      currentRule: e.target.value,
      stoppingRuleToggler: !stoppingRuleToggler
    }
  };
}
