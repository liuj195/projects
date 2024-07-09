import React from "react";
import TstPanelInterface from "../components/panelinterfaces/tstpanelinterface";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

test("Navbar renders correctly", () => {
  const renderer = new ShallowRenderer();
  const component = renderer.render(
    <TstPanelInterface
      tstState={{
        onhandleXLSXtab: () => {},
        onTSTWindowChange: () => {},
        onGroupNodeChange: () => {},
        onGraphRuleChange: () => {},
        onToggleGraphRule: () => {},
        onStoppingRuleToggle: () => {},
        onStoppingRuleChange: () => {},
        onReportChange: () => {},
        onTSTTinTaxChange: () => {},
        groupNode: false,
        stoppingRuleInput: "",
        graphRuleInput: "",
        currentGraphRule: "INVERTORS",
        currentRule: "POTENTIAL",
        tinTaxValue: "",
        report: "COMPLETE",
        window: "Single",
        stoppingRule: { type: "POTENTIAL", value: 5000000 },
        windowToggler: true,
        stoppingRuleToggler: true,
        graphRuleToggler: true,
        reportCheckedArray: [],
        stoppingRuleVals: [0, 0],
        graphVals: [0, 0],
        reportTypes: [
          { id: "COMPLETE", name: "Complete Investor Listing", checked: false },
          {
            id: "TERMINAL",

            name: "Terminal Investor Ownership Report",
            checked: false
          },
          { id: "SUMMARY", name: "Key Case Summary Report", checked: false }
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
