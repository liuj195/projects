import React from "react";
import Yk1Interface from "../components/panelinterfaces/yk1panelinterface";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

test("Navbar renders correctly", () => {
  const renderer = new ShallowRenderer();
  const component = renderer.render(
    <Yk1Interface
      yK1State={{
        onTinTypeChange: () => {},
        onAddTab: () => {},
        onMultiselectChange: () => {},
        onHopsChange: () => {},
        onTextChange: () => {},
        onNodeChange: () => {},
        onWindowChange: () => {},
        onHandleClear: () => {},
        selectedOption: [],
        hops: 2,
        value: "",
        typeSelect: "BOTH",
        window: "Single",
        nodes: 10,
        tinTypes: [
          { id: "SSN", checked: false },
          { id: "EIN", checked: false },
          { id: "BOTH", checked: true }
        ],
        windowTypes: [
          { id: "Single Window", checked: true },
          { id: "Separate Windows", checked: false }
        ]
      }}
    />
  );
  expect(component).toMatchSnapshot();
});
