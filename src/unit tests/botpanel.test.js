import React from "react";
import BotPanelInterface from "../components/panelinterfaces/botpanelinterface";
import ShallowRenderer from "react-test-renderer/shallow";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

test("Navbar renders correctly", () => {
  const renderer = new ShallowRenderer();
  const component = renderer.render(
    <BotPanelInterface
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
    />
  );
  expect(component).toMatchSnapshot();
});
