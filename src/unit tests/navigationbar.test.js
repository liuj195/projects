import React from "react";
import NavigationBar from "../components/navbar/navigationbar";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

test("Navbar renders correctly", () => {
  const renderer = new ShallowRenderer();
  const component = renderer.render(
    <NavigationBar
      currentGraph={{}}
      onUpload={() => {}}
      navBarControl={[{ name: "File", disabled: false }]}
      user={{ userID: "abc", access: [] }}
      onLegendClick={() => {}}
    />
  );
  expect(component).toMatchSnapshot();
});
