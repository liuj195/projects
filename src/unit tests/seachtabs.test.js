import React from "react";
import SearchTabs from "../components/tabs/searchtabs";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

test("Navbar renders correctly", () => {
  const renderer = new ShallowRenderer();
  const component = renderer.render(
    <SearchTabs
      subTabSelectedKey={0}
      nextGraphId={0}
      currentLayout={"some layout"}
      user={{ userID: "abc", access: [] }}
      onSubTabChange={() => {}}
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
      BoTState={{
        onReportChange: () => {},
        onRadioChange: () => {},
        onOptimizedValue: () => {},
        onTinTaxChange: () => {},
        onExaminationChange: () => {},
        onMFTChange: () => {},
        optimizedRadioList: [
          { id: "ALLOCATE", checked: true },
          { id: "ASSESS", checked: false },
          { id: "APPROX", checked: false },
          { id: "MINOWN", checked: false }
        ],
        optimizedInputValues: [0, 0, 0, 0],
        tinTaxValue: "",
        MFTValue: "",
        examination: "",
        optimizedValue: 0,
        currentRadio: "ALLOCATE",
        isDisabled: [false, true, true, true]
      }}
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
