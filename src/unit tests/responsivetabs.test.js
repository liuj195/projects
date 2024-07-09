import React from "react";
import ResponsiveTabs from "../components/tabs/responsivetabs";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

test("Navbar renders correctly", () => {
  const renderer = new ShallowRenderer();
  const component = renderer.render(
    <ResponsiveTabs
      onSetSelectedKey={() => {}}
      onMainTabChange={() => {}}
      tabList={[]}
      selectedKey={0}
    />
  );
  expect(component).toMatchSnapshot();
});
