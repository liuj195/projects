import YK1 from "../../js/yk1/yk1";
export const botTypeSelect = "updatebotTypeSelect";
export const botTinTaxChange = "updatebotTinTaxChange";
export const botMFTChange = "updatebotMFT";
export const botExaminationChange = "botExaminationChange";
export const botOptimizedInputValues = "optimizedInputValues";
export const botClear = "botClear";

export function botUpdateTypeSelect(event, currentList, isDisabled) {
  let button = event.target;
  let optimizedRadioList = currentList.map(radioButton => {
    if (radioButton.id === button.id) {
      return { id: radioButton.id, name: radioButton.name, checked: true };
    }
    return { id: radioButton.id, name: radioButton.name, checked: false };
  });
  let index = 0;
  optimizedRadioList.forEach((item, ind) => {
    if (button.id === item.id) {
      index = ind;
    }
  });
  isDisabled = isDisabled.map(item => {
    return (item = true);
  });
  isDisabled[index] = false;

  console.log(optimizedRadioList);
  return {
    type: botTypeSelect,
    payload: {
      isDisabled: isDisabled,
      optimizedRadioList: optimizedRadioList
    }
  };
}
// handleTinTaxChange
export function botUpdateTinTaxChange(e) {
  return {
    type: botTinTaxChange,
    payload: {
      tinTaxValue: e.target.value
    }
  };
}
// handleMFTChange
export function botUpdateMFT(e) {
  return {
    type: botMFTChange,
    payload: {
      MFTValue: e.target.value
    }
  };
}
//handleExaminationChange
export function botUpdateExamination(e) {
  return {
    type: botExaminationChange,
    payload: {
      examination: e.target.value
    }
  };
}

//handleOptimziedValue
export function botUpdateOptimizedValue(e, optimizedInputValues) {
  let buttonValue;
  //allow users delete all values an have empty input
  if (e.target.value.length === 0) {
    buttonValue = "";
  } else {
    buttonValue = e.target.value;
  }
  //make sure input is numeric and positive
  if (YK1.digitsDecimal.test(buttonValue)) {
    let button = e.target;
    let buttonId = +button.id;
    console.log(buttonValue);

    optimizedInputValues[buttonId] = buttonValue;
    let optimizedValue = buttonValue;
    if (parseInt(buttonId) === 0 || parseInt(buttonId) === 3) {
      //these 2 are percentages and should not allow numbers greater than 100
      if (buttonValue > 100) optimizedInputValues[buttonId] = 100;
    }
    return {
      type: botOptimizedInputValues,
      payload: {
        optimizedInputValues: optimizedInputValues,
        optimizedValue: optimizedValue
      }
    };
  }
}

export function botUpdateClear() {
  return {
    type: botClear
  };
}
