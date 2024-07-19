import React from "react";
import Select from "react-select";
//import makeAnimated from "react-select/lib/animated";
import makeAnimated from "react-select/animated";

const insertAddAll = (multiselectOptions) => {
  //splice select all to top of list after each change
  //select all gets filtered out (I believe) at a later time, so it should never be in multiselectOptions at this point
  multiselectOptions = multiselectOptions.filter((item) => {
    return item.value !== "selectAll";
  });
  multiselectOptions.splice(0, 0, {
    value: "selectAll",
    label: "Select All Tax Years",
  });
  return multiselectOptions;
};
const checkSelectAll = (e) => {
  let isSelected = false;
  e.forEach((item) => {
    if (item.value === "selectAll") isSelected = true;
  });
  return isSelected;
};
const MultiSelect = ({
  selectedOption,
  onMultiselectChange,
  multiselectOptions,
}) => {
  let options = insertAddAll(multiselectOptions);
  return (
    <Select
      components={makeAnimated()}
      value={selectedOption}
      onChange={(e) => {
        let selectAll = checkSelectAll(e);
        if (selectAll) {
          //send in all options minus select all
          let filteredOptions = multiselectOptions.filter(
            (item) => item.value !== "selectAll"
          );
          onMultiselectChange(filteredOptions);
        } else {
          onMultiselectChange(e);
        }
      }}
      options={options}
      isMulti={true}
      closeMenuOnSelect={false}
      blurInputOnSelect={false}
      placeholder="Select Tax Year"
    />
  );
};
export default MultiSelect;

MultiSelect.propTypes = {
  //  onMultiselectChange: PropTypes.func.isRequired,
  //selectedOption: PropTypes.array.isRequired
};
