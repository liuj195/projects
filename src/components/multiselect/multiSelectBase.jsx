import React from "react";
import Select from "react-select";
//import makeAnimated from "react-select/lib/animated";
import makeAnimated from "react-select/animated";

const MultiSelectBase = ({
  selectedOption,
  onMultiselectChange,
  multiselectOptions
}) => {
  return (
    <Select
      components={makeAnimated()}
      value={selectedOption}
      onChange={e => {
        onMultiselectChange(e);
      }}
      options={multiselectOptions}
      isMulti={false}
      closeMenuOnSelect={true}
      blurInputOnSelect={false}
    />
  );
};
export default MultiSelectBase;
