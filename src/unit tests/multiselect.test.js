import React from "react";
import MultiSelect from "../components/multiselect/multiselect";
import renderer from "react-test-renderer";

test("Multiselect renders with list of years and empty function", () => {
  const options = [
    { value: "2016", label: "2016" },
    { value: "2015", label: "2015" },
    { value: "2014", label: "2014" },
    { value: "2013", label: "2013" },
    { value: "2012", label: "2012" },
    { value: "2011", label: "2011" },
    { value: "2010", label: "2010" }
  ];
  const fakeFunction = function() {};
  const component = renderer.create(
    <MultiSelect onMultiselectChange={fakeFunction} selectedOption={options} />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
