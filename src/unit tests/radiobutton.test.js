import React from "react";
import RadioButton from "../components/buttons/radiobutton";
import renderer from "react-test-renderer";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

test("RadioButton renders correctly", () => {
  const fakeFunction = function() {};
  const component = renderer.create(
    <RadioButton
      onChange={fakeFunction}
      style={{ display: "inline-block" }}
      id="Single Window"
      name="windowSelect"
      value="Single Window"
      checked={true}
    />
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
