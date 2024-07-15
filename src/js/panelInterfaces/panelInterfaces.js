import YK1 from "../yk1/yk1";

const yK1StateImport = {
  selectedOption: [],
  multiselectOptions: [],
  limitTypeOptions: [
    { value: "PctKeyCase", label: "Percent to/from Start"},
    { value: "PctDirect", label: "Percent of Each K-1"},
    { value: "DollarAmt", label: "Dollars of Each K-1"}
  ],
  limitDirOptions: [
    { value: "Incoming", label: "Incoming K-1s" },
    { value: "Outgoing", label: "Outgoing K-1s" },
    { value: "Both", label: "In & Out From Any Node" }
  ],
  limitTypeDefaultValues: [
    { id: "PctKeyCase", value: 0.30},
    { id: "PctDirect", value: 0.05 },
    { id: "DollarAmt", value: 10000 }
  ],
  selectedLimitTypeOption: "",
  selectedLimitDirOption:"",
  checkedVal: false,
  hops: 2,
  value: "",
  typeSelect: "EITHER",
  window: "SINGLE",
  nodes: 10,
  limitValue:.30,
  tinTypes: [
    { id: "SSN", name: "SSN", checked: false },
    { id: "EIN", name: "EIN", checked: false },
    { id: "EITHER", name: "EITHER", checked: true }
  ],
  windowTypes: [
    { id: "SINGLE", name: "Single Window", checked: true },
    { id: "SEPARATE", name: "Separate Windows", checked: false }
  ]
};

const BoTStateImport = {
  optimizedRadioList: [
    { id: YK1.BOT_ALLOCATE, name: "Allocate", checked: true },
    { id: YK1.BOT_ASSESS_MIN, name: "Assess a minimum of $", checked: false },
    { id: YK1.BOT_WRITE_APPROX, name: "Write approximately", checked: false },
    {
      id: YK1.BOT_MIN_OWNERSHIP,
      name: "Minimum material ownership",
      checked: false
    }
    /*
      { id: "ALLOCATE", checked: true },
      { id: "ASSESS", checked: false },
      { id: "APPROX", checked: false },
      { id: "MINOWN", checked: false }*/
  ],
  optimizedInputValues: [0, 0, 0, 0],
  tinTaxValue: "",
  MFTValue: 0,
  examination: 0,
  optimizedValue: 0,
  currentRadio: "ALLOCATE",
  isDisabled: [false, true, true, true]
};

const tstStateImport = {
  ownershipTolerance: 1,
  graphVal: 10,
  groupNode: false,
  stoppingRuleInput: "",
  graphRuleInput: "",
  currentGraphRule: "INVERTORS",
  currentRule: "POTENTIAL",
  currentGraphOption: "numTerminalInvestors",
  tinTaxValue: "",
  report: YK1.TST_REPORT_TYPE_COMPLETEINVESTOR,
  window: "Single",
  stoppingRule: { type: "POTENTIAL", value: 5000000 },
  windowToggler: true,
  stoppingRuleToggler: true,
  reportCheckedArray: [],
  stoppingRuleVals: [5000000, 0.01],
  graphRuleToggler: false,
  reportTypes: [
    {
      id: YK1.TST_REPORT_TYPE_COMPLETEINVESTOR,
      name: "Complete Investor Listing",
      checked: true
    },
    {
      id: YK1.TST_REPORT_TYPE_TERMINALINVESTOR,
      name: "Terminal Investor Ownership Report",
      checked: true
    },
    {
      id: YK1.TST_REPORT_TYPE_KEYSUMMARY,
      name: "Key Case Summary Report",
      checked: true
    }
  ],
  windowTypes: [
    { id: "Single Window", name: "Single Window", checked: true },
    { id: "Separate Windows", name: "Separate Windows", checked: false }
  ]
};
export { tstStateImport, yK1StateImport, BoTStateImport };
