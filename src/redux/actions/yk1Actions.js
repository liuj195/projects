export const yk1ClearText = "updateyk1ClearText";
export const yk1ClearDoc = "updateyk1ClearDoc";
export const yk1TinTypeChange = "updateyk1TinTypeChange";
export const yk1MultiChange = "updateyk1MultiChange";
export const yk1HopsChange = "updateyk1HopsChange";
export const yk1LimitValueChange = "updateyk1LimitValueChange";
export const yk1TextChange = "updateyk1TextChange";
export const yk1NodeChange = "updateyk1NodeChange";
export const yk1ParameterChange = "updateyk1ParameterChange";
export const yk1WindowChange = "updateyk1WindowChange";
export const yk1SelectedOptionChange = "updatedSelectedOption";
export const initSingleSelect = "updateSingleSelect";
export const yk1LimitTypeOptionChange = "updatedLimitTypeOption";
export const yk1LimitDirOptionChange = "updatedLimitDirOption";

//handleClearText
export function yk1UpdateClearText(e) {
  return {
    type: yk1ClearText
  };
}
//handleclear will reset document
export function yk1UpdateClearDoc(e) {
  return {
    type: yk1ClearDoc
  };
}
//handletinTypeChange
export function yk1UpdateTinType(e, tinTypes) {
  let type = e.target;
  let typeSelect = e.target.id;
  tinTypes = tinTypes.map(tinType => {
    if (tinType.id === type.id) {
      // if ID matches, set flag to true
      typeSelect = tinType.id;
      return { id: type.id, checked: true };
    } else {
      //else set everything else to false
      return { id: tinType.id, checked: false };
    }
  });
  return {
    type: yk1TinTypeChange,
    payload: {
      tinTypes: tinTypes,
      typeSelect: typeSelect
    }
  };
}
//handle multiselect change
export function yk1UpdateMultiselect(selectedOption) {
  return {
    type: yk1SelectedOptionChange,
    payload: {
      selectedOption: selectedOption
    }
  };
}

export function yk1UpdateTextChange(e) {
  return {
    type: yk1TextChange,
    payload: {
      value: e.target.value
    }
  };
}
export function yk1UpdateHopsChange(e) {
  return {
    type: yk1HopsChange,
    payload: {
      hops: +e.target.value
    }
  };
}

export function yk1UpdateLimitTypeSelect(selectedLimitTypeOption, limitValue) {
  return {
      type: yk1LimitTypeOptionChange,
      payload: {
        selectedLimitTypeOption: selectedLimitTypeOption,
        limitValue:limitValue
      }
    };
}

export function yk1UpdateLimitDirSelect(selectedLimitDirOption) {
  return {
    type: yk1LimitDirOptionChange,
    payload: {
      selectedLimitDirOption: selectedLimitDirOption
    }
  };
}

export function yk1UpdateLimitValueChange(limitValue) {
   return {
      type: yk1LimitValueChange,
      payload: {
        limitValue: limitValue
      }
    };
}

export function yk1UpdateNodeChange(e) {
  let nodes;
  //allow users delete all values an have empty input

  if (e.target.value.length === 0 || isNaN(+e.target.value)) {
    nodes = "";
  } else {
    nodes = +e.target.value;
  }
  //make sure input is not greater than 100
  if (nodes > 100) {
    alert(document.defaultView.errorList.groupNode);
    nodes = 100;
  }

  return {
    type: yk1NodeChange,
    payload: {
      nodes: nodes
    }
  };
}

export function yk1UpdateWindowChange(e, windowTypes) {
  let window = e.target;

  windowTypes = windowTypes.map(windowType => {
    if (windowType.id === window.id) {
      window = windowType.id;
      return { id: windowType.id, checked: true };
    }
    return { id: windowType.id, checked: false };
  });

  return {
    type: yk1WindowChange,
    payload: {
      windowTypes: windowTypes,
      window: window
    }
  };
}
