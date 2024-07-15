import React from "react";
import CheckBox from "../components/buttons/checkbox";
import renderer from "react-test-renderer";

test("CheckBox renders correctly", () => {
  const fakeFunction = function() {};
  const component = renderer.create(
    <CheckBox
      onChange={fakeFunction}
      id={1}
      value="checkboxtest"
      name="checkboxtest"
      defaultChecked={true}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
