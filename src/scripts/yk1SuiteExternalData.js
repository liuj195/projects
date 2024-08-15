/***
 * GLOBALLY AVAILABLE
 **/

window.routes = {
  dataDictionary: "/yk1/SupplementalFiles/Data_dictionary_yK1.zip",
  userGuide: "/yk1/SupplementalFiles/yk1_Training_Guide.zip",
  logOut: "https://yk1dev.web.irs.gov/yk1/",
};
window.toolTips = {
  // YK1
  FullScreen: "Toggle FullScreen",
  SSNtoolTip: "Process the TINs entered as Social Security numbers only",
  EINtoolTip:
    "Process the TINs entered as Employer Identification numbers only",
  EITHERtoolTip:
    "Process the TINs entered as Social Security numbers and Employer Identification numbers ",
  yK1CopyTins:
    "Enter one or more TIN's in the scroll area. Use CTRL-V to paste from clipboard. All entered TINS will be graphed if they exist in yK1",
  yK1NumHops:
    "Enter number of links to expand from the starting node(TIN). For e.g. two hops will show direct links to or from initial TIN to other TINs and then show the next set of direct links to or from those TINs to other TINs",
  yK1NodeThreshold:
    "The number of payers or payees above which the nodes are collapsed into a single 'GROUP' node",
  yk1Multi: "Select one or more Tax Years for which graphs should be drawn",
  SeparatetoolTip: "Include each graph in a separate window",
  SingletoolTip: "Include all graphs in a single window",

  // TST
  TSTEnterTinTax: "Enter TIN followed by either Tax Period or Tax Year",
  tstOwnershipTol:
    "Stop trace when ownership percentage of top tier drops below this percentage. Input a value between 0 and 1",
  tstPotentialAdj:
    "Potential Audit Adjustment at the pass-through entity level. Trace will stop when allocation drops below IRM requirements",
  Complete: "Detailed listing of each path in outline format",
  Terminal:
    "Summary of the ultimate non pass-through partners in descending level of ownership",
  Key:
    "One-line count summary of various attributes of top tier entity's ownership structure",

  // TST GREYED OUT TOOLTIPS
  TopNumber:
    "A graph of the N largest ultimate owners and the tiers used to accomplish their ownership",
  InvesterOwnership:
    "A graph of all ultimate owners who hold more than N% and the tiers used to accomplish their ownership",
  IncludeGroup: "Add a Group node to Tiers presented in the Graph",

  // BOT
  botTinTax: "Enter TIN followed by either Tax Period of Tax Year",
  botMFT:
    "Eliminate insignificant paths below this percent of an ultimate owner's total percentage of ownership",
  botExamination:
    "The Audit Adjustment at the pass-through entity-level. Trace will stop when allocation drops below IRM requirements",
  AllocatetoolTip: "Prune graph so only N% of adjustment is allocated",
  AssesstoolTip:
    "Prune graph of investors receiving less than $N allocation of adjustment",
  MinimumtoolTip:
    "Prune graph of all investors owning less than N% of top tier",
  WritetoolTip:
    "Prune graph so no more than N examination reports are written to allocate adjustment",

  // search
  searchButton: "yK1/TST/BoT Tab Area",

  // panzoom
  panzoomFit: "Fit to Screen",

  //layouts
  cola:
    "The cola layout uses a <br />force-directed physics simulation with <br />several sophisticated constraints",
  grid: "The grid layout puts nodes in a <br />well-spaced grid",
  circle: "The circle layout puts nodes in <br />a circle",
  dagre:
    "The Dagre layout for DAGs and <br />trees. It organises the graph in <br />a hierarchy",
};

window.releaseNotes = {
  currentRelease: "20190419_v.013",
};

window.openPopup = function(id) {
  let element = document.getElementById(id);
  element.style.visibility = "visible";
  //cheating way to insert page breaks
  id = id.replace(/\n/g, "<br />");
  element.innerHTML = window.toolTips[id];
};

//yk1Multi yk1MultiWindow ykSingleWindow tstOwnershipTol tstPotentialAdj

//tst interface
// Complete
// Terminal
//  Key

//botTinTax botMFT botExamination
//bot interface
//Allocate Assess Minimum Write
