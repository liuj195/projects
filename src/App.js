import React, { Component } from "react";
import NavigationBar from "./components/navbar/navigationbar";
import DisclaimerPopup from "./components/popups/disclaimerpopup";
import ResponsiveTabs from "./components/tabs/responsivetabs";
import SearchTabs from "./components/tabs/searchtabs";
import Yk1GraphContent from "./components/tabs/yk1GraphContent";
import BotPanelInterface from "./components/panelinterfaces/botpanelinterface";
import Yk1Interface from "./components/panelinterfaces/yk1panelinterface";
import TstPanelInterface from "./components/panelinterfaces/tstpanelinterface";
import DashboardInterface from "./components/panelinterfaces/dashboard";
import YK1 from "./js/yk1/yk1";
import Math from "./js/utilityJS/math_utilities";
import RTFtab from "./components/tabs/rtftab";
import loadGraph from "./js/yk1/loadGraph";
import CompareGraphTab from "./components/tabs/compareGraphs";
import CompareGraphPopup from "./components/popups/compareGraphPopup";
import ModalWindowControl from "./components/popups/nodeDetails";
import Loading from "./components/popups/loading";
import ToolTip from "./components/tooltips/tooltips";
import LegendTab from "./components/tabs/legendTab";
import { connect } from "react-redux";
import NodeLinkInfo from "./components/popups/nodeAndLinkInfo";
import ReactDOM from "react-dom";
import { GenericModal } from "./components/popups/genericModal";
import ErrorDialogue from "./components/popups/errorDialogue";
import LogoutModal from "./components/popups/logOut";
import SoftLogout from "./components/popups/softLogOut";

// import { Prompt } from "react-router";

class App extends Component {
  state = {
    logOut: false,
    softLogout: false,
    nodeLinkInfo: {},
    showNodeLinkPopup: false,
    isyK1Tab: false,
    displayLoading: false,
    nodeDetailsData: {},
    graphArray: [],
    disclaimer: false,
    selectedKey: 0,
    currentTab: {},
    nodeDetailsPopUp: false,
    compareGraphPopup: false,
    currentGraphKey: null,
    currentCyto: null,
    yk1MultiOptions: [],
    tabKey: 11,
    subTabSelectedKey: 0,
    tabList: [{ name: "Search", tabKey: 10 }],
    isLegend: false,
  };

  //iterator to bypass setstate since setstate is async
  globalIndex = 11;
  constructor(props) {
    super(props);
    let hrefSplit = window.location.href.split("username=");
    let id = this.props.seid;
    let flags = this.props.flags;
    let version = this.props.version;
    if (id === "") {
      id = hrefSplit[1] ? hrefSplit[1] : "";
    }

    YK1.setToken(this.props.token);
    YK1.setSessionID(this.props.sessionId);

    const user = {
      userID: id,
      // access: ["yK1", "TST", "BoT"]
    };
    if (!flags) {
      user.access = ["yK1", "TST", "BoT"];
    }
    if (flags) user.access = this.getSuite(flags);
    if (YK1.isDev) user.access = ["yK1", "TST", "BoT"];
    if (version) console.log(version);
    //local host seems to set flags = 'success' so for localhost i'm going allow all suites
    //remove flags==='success' for dev/test deploys, use only for local environment
    if (flags === "Success") user.access = ["yK1", "TST", "BoT"];
    // console.log(flags);
    // console.log(user.access);
    /***
     * Lines below are to figure out how many tabs are being displayed
     * Math.trunc definition below is to makie IE happy
     */
    let width = window.innerWidth;
    width = width - 117; // adjust width for search and showmore buttons before calculation
    let totalTabs = Math.trunc(width / 217 + 1); //one added for search tab
    this.state.visibleTabs = totalTabs;
    this.state.user = user;
    //Start Soft Timer in index.js
  }

  componentDidMount() {
    if (!window.history.state)
      window.history.pushState({ page: 1 }, "Main Page", "");

    //set callbacks in YK1 and inital states
    YK1.download = this.download;
    YK1.handleLogout = this.handleLogout;
    YK1.handleGenericModal = this.handleGenericModal;
    YK1.handleErrorDialogue = this.handleErrorDialgue;
    YK1.createRTFtab = this.handleAddRTF;
    YK1.showLoader = this.showLoader;
    YK1.closeLoader = this.closeLoader;
    YK1.detailsModalCallback = this.detailsModalCallback;
    YK1.nodeAndLinkInfoCallback = this.nodeAndLinkInfoCallback;
    YK1.handleSoftLogout = this.handleSoftLogout;
    //here we can call ajax and get multiSelect Values instead of using below values
    YK1.getTaxYears(this.initTaxYears);
  }
  handleLogout = () => {
    // ReactDOM.render(<LogoutModal />, document.getElementById("root"));
    this.setState({ logOut: true });
  };
  handleSoftLogout = () => {
    this.setState({ softLogout: !this.state.softLogout });
  };
  closeSoftLogPrompt = () => {
    this.setState({ softLogout: !this.state.softLogout }, () => {
      YK1.getTaxYears(this.initTaxYears);
    });
  };
  download = (text, name, type) => {
    var a = document.createElement("a");
    let root = document.getElementById("root");
    root.appendChild(a);

    if (window.navigator.msSaveOrOpenBlob) {
      // IE10+
      text = text.join();
      var file = new Blob([text], { type: type });
      window.navigator.msSaveOrOpenBlob(file, name);
    } else {
      // Others
      var file = new Blob([text], { type: type });
      var url = URL.createObjectURL(file);
      a.href = url;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(url);
    }
    root.removeChild(a);
  };
  handleGenericModal = (dataObj, type, warning, count) => {
    //check if data contains error message
    //it it does not, pass along for regular processesing
    /** PASS ALONG DATA */
    console.log(dataObj);
    if (warning !== "COUNT_WARNING") {
      let { graphId, data, sourceNodeXtin, cy, taxYear } = dataObj;
      if (type === "Address")
        YK1.createAddressNodes(
          graphId,
          data.addressList,
          sourceNodeXtin,
          cy,
          taxYear
        );
      if (type === "Preparer")
        YK1.createPreparerNodes(
          graphId,
          data.preparerList,
          sourceNodeXtin,
          cy,
          taxYear
        );
    } else {
      //else create modal
      //render modal with data
      let popup = document.createElement("div");
      document.body.appendChild(popup);
      popup.setAttribute("id", "modalPopup");
      //GenericModal
      ReactDOM.render(
        <GenericModal data={dataObj} type={type} count={count} />,
        document.getElementById("modalPopup")
      );
    }
  };

  handleErrorDialgue = (status, msg, headerMsg) => {
    let popup = document.createElement("div");
    document.body.appendChild(popup);
    popup.setAttribute("id", "modalPopup");
    //GenericModal
    ReactDOM.render(
      <ErrorDialogue status={status} msg={msg} headerMsg={headerMsg} />,
      document.getElementById("modalPopup")
    );
  };
  //defines search tab
  getSearchTab = () => {
    let DashboardTab = {
      name: "Dashboard",
      tabContent: <DashboardInterface />,
    };
    let TSTtab = {
      name: "TST",
      tabContent: <TstPanelInterface onhandleXLSXtab={this.handleXLSXtab} />,
    };
    let BoTtab = {
      name: "BoT",
      tabContent: <BotPanelInterface />,
    };
    let YK1tab = {
      name: "yK1",
      tabContent: <Yk1Interface onAddTab={this.handleAddTab} />,
    };
    let searchTab = {
      name: "Search",
      tabContent: (
        <SearchTabs
          subTabSelectedKey={this.state.subTabSelectedKey}
          nextGraphId={this.state.nextGraphId}
          user={this.state.user}
          onSubTabChange={this.handleSubTabChange}
          YK1tab={YK1tab}
          BoTtab={BoTtab}
          TSTtab={TSTtab}
          DashboardTab={DashboardTab}
        />
      ),
    };
    return searchTab;
  };

  getSuite = (flags) => {
    let access = [];
    flags = flags.split("");
    if (flags[2] === "1") access.push("yK1");
    //if (flags[1] === "1") access.push("TST");
    //if (flags[0] === "1") access.push("BoT");

    //for GitLab issue 429;
    if (flags[1] === "2") access.push("TST");
    if (flags[0] === "2") access.push("BoT");
    return access;
  };

  /** *************************************
   *
   *          YK1 TAX YEAR INIT
   *
   ***************************************/

  initTaxYears = (taxYears) => {
    let { tabList, yk1MultiOptions } = this.state;
    tabList[0] = this.getSearchTab();
    for (var i in taxYears) {
      if (taxYears[i].comments !== null) {
        yk1MultiOptions.push({
          value: taxYears[i].taxYear,
          label: taxYears[i].taxYear + " - " + taxYears[i].comments,
        });
      } else {
        yk1MultiOptions.push({
          value: taxYears[i].taxYear,
          label: taxYears[i].taxYear,
        });
      }
    }
    this.props.updateMultiselect(yk1MultiOptions);
  };

  /**********************************
   *
   * Tab and Navigation Controls
   *
   *********************************/
  handleCloseAllTabs = () => {
    let tabList = this.state.tabList;
    //reset to only search tab
    tabList = [tabList[0]];
    let graphArray = [];
    this.setState({ tabList, selectedKey: 0, graphArray });
    this.checkTabName(tabList[0]);
  };
  // Sets focus on newly created tab
  handleSelectedKey = () => {
    let tabList = this.state.tabList;
    let selectedKey = tabList.length - 1;
    this.setState({ selectedKey });
  };
  handleSetSelectedKey = (selectedKey) => {
    this.setState({ selectedKey });
  };

  /**
   * handleTabFocus checks if current tab is visible on the nav bar. If its not, then its spliced to the second
   * position (directly after search) and sets focus on it.
   * tabNumber is the current tab
   * this.state.visibleTabs is the # of tabs displayed across the navigation bar (not including tabs in dropdown)
   */

  handleTabFocus = (tab) => {
    // console.log("focus tab");
    // let { tabList } = this.state;
    // if (tab >= this.state.visibleTabs) {
    //   this.setState({ selectedKey: 1 });
    //   let focusedTab = tabList[tab];
    //   tabList.splice(tab, 1);
    //   tabList.splice(1, 0, focusedTab);
    //   this.setState({ tabList });
    // }
  };

  //handleAddTab pushes a new tab to tabList for rerendering
  handleAddTab = (formData) => {
    //prime graph/load up data
    this.showLoader();
    loadGraph(formData, this.globalIndex, this.callbackAddTab);
  };
  //handle remaing async computing for handleAddTab
  callbackAddTab = (formData, data, myObject) => {
    let graphId = -1;
    // copied directly from yk1Controller.getGraphHandler()
    if (data.entityList === null || data.entityList.length === 0) {
      // no data returned
      YK1.ungraphableTins.push({
        tin: myObject.tin,
        tinType: myObject.tinType,
        taxYear: myObject.taxYear,
      });
      // TODO really, somewhere, there should be a pop up that will display this info
      return;
    } else {
      // data returned, create graph
      this.globalIndex = this.globalIndex + 1;
      graphId = this.globalIndex;
      //console.log("App.js->myObject: " + JSON.stringify(myObject));
      let { tin, taxYear } = myObject;
      YK1.addGraph(
        graphId,
        taxYear,
        tin,
        myObject.limitType,
        myObject.limitValue,
        myObject.limitDirection
      );
      YK1.getNodes(graphId, data.entityList);
      YK1.getEdges(graphId, data.linkList, myObject.taxYear);
    }
    let tinName = formData.tins.split("\n");
    if (tinName.length === 1) {
      tinName = tinName[0].split(",");
    }
    if (tinName.length > 1) {
      tinName = tinName[0] + ",...";
    }
    let name = " yK1 " + tinName + " " + formData.taxYears;
    let cytoDiv = document.createElement("div");
    let initSpan = document.createElement("span");
    cytoDiv.appendChild(initSpan);
    cytoDiv.setAttribute("id", "cy");
    let cyto = YK1.loadCyto(graphId, cytoDiv, true, false);

    //add graphs to graphArray for compare graph use
    let { graphArray } = this.state;
    graphArray.push({ cyto: cyto, graphId: graphId, cytoDiv: cytoDiv });
    this.setState({ graphArray });
    this.appendTabToList(name, cytoDiv, cyto, graphId);
    //closes open popups
    this.handleCloseNewGraph();
  };
  appendTabToList = (name, cytoDiv, cyto, thisGraphId) => {
    let { tabList } = this.state;
    let tab = {
      name: name,
      tabKey: thisGraphId,
      tabContent: (
        <Yk1GraphContent
          onAddTab={this.handleAddTab}
          yk1MultiOptions={this.state.yk1MultiOptions}
          cyto={cyto}
          cytoDiv={cytoDiv}
          graphId={thisGraphId}
          loadCurrentCyto={this.handleLoadCyto}
        />
      ),
    };
    tabList.push(tab);
    this.setState({ tabList, currentGraphKey: thisGraphId }, () => {
      this.handleSelectedKey();
    });
    this.closeLoader();
    this.checkTabName(tab);
  };

  // checkTabName checks tab names to see if they match the yk1 pattern.
  // this is done on tab closes and on new tabs
  checkTabName = (tab) => {
    //isLegend
    if (tab) {
      if (tab.tabKey) {
        //only graphs have tabkey
        this.setState({ isyK1Tab: true });
      } else {
        this.setState({ isyK1Tab: false });
      }
      this.setState({ currentTab: tab });
    }
  };

  //removes tab and graph from respective lists and rerenders.
  handleTabClose = (tab) => {
    YK1.showLoader();
    window.setTimeout(function() {
      YK1.closeLoader();
    }, 1200);
    let tabList = [...this.state.tabList];
    let { graphArray } = this.state;
    let index = tabList.indexOf(tab);
    let nextTab = tabList[index + 1];
    let tabToClose = tabList[index];
    let tabToCloseGraphId = tabToClose.tabKey;
    //remove closed tab from graph array
    graphArray = graphArray.filter((item) => {
      return item.graphId !== tabToCloseGraphId;
    });

    YK1.removeGraph(tabToClose.tabKey);
    //remove tab from list
    tabList.splice(index, 1);
    if (tabList.length === index) {
      //last tab closing, set focus on previous tab
      this.setState({ selectedKey: index - 1 });
    }
    if (this.state.selectedKey > index) {
      //if a previous tab is being closed, shift focus to the left (keep focus on current tab)
      this.setState({ selectedKey: index });
    }
    //if tab to the right is being closed, do not adjust view (dont move selected key)
    this.setState({ tabList, graphArray }, () => {
      //setting focus just removes lingering white shadow on previously clicked tab
      let newtab = document.getElementById(`tab-${this.state.selectedKey}`);
      if (newtab) {
        newtab.focus();
      }
    });
    if (nextTab) {
      this.checkTabName(nextTab);
    } else {
      this.checkTabName(tabList[tabList.length - 1]);
    }
    //need to re-load currently selected tab
  };

  //handleMainTabChange checks tab titles when switching between tabs and handles closing
  handleMainTabChange = (tab, shouldClose) => {
    if (shouldClose) {
      this.handleTabClose(tab);
    } else {
      let tabList = this.state.tabList;
      let currentTab = tabList[tab];
      this.handleTabFocus(tab);
      this.checkTabName(currentTab);
      this.setState(
        { selectedKey: tab, currentGraphKey: currentTab.tabKey },
        () => {}
      );
    }
  };

  isRTFtab = (tab) => {
    if (tab.name.indexOf("RTF") >= 0) {
      return true;
    } else return false;
  };
  isTSTTab = (tab) => {
    if (tab.name.indexOf("TST") >= 0) {
      return true;
    } else return false;
  };
  isLegend = (tab) => {
    if (tab.name.indexOf("Legend") >= 0) {
      return true;
    } else return false;
  };
  //subtabs want to switch back to yk1 screen on each input
  //this forces subtab to stay on current tab
  handleSubTabChange = (tab) => {
    // let tabList = this.state.tabList;
    // let navBarControl = this.state.navBarControl;
    // if (tab !== 0) {
    //   navBarControl[2].disabled = true;
    // } else {
    //   navBarControl[2].disabled = false;
    // }
    this.setState({ subTabSelectedKey: tab });
  };

  //pushes legend to tablist
  handleLegendClick = () => {
    let { tabList } = this.state;
    let legend = {
      name: "yK1 Legend",
      tabContent: <LegendTab loadCurrentCyto={this.handleLoadCyto} />,
    };

    tabList.push(legend);
    this.checkTabName(legend);
    this.setState({ tabList, selectedKey: tabList.length - 1 });
  };
  //renders xlsx to html on a new tab
  handleXLSXtab = (htmlString) => {
    let { tabList } = this.state;
    console.log(htmlString);
    let xlsxTab = {
      name: "TST Return Data",
      tabContent: <div dangerouslySetInnerHTML={{ __html: htmlString }} />,
    };
    tabList.push(xlsxTab);
    this.setState({ tabList, selectedKey: tabList.length - 1 });
  };

  /***************************************
   *
   *        GRAPH CONTROL
   *
   ***************************************/

  closeLoader = (status, msg, headerMsg) => {
    this.setState({ displayLoading: false }, () => {
      if (headerMsg) this.handleErrorDialgue(status, msg, headerMsg);
    });
    if (YK1.toggleLoader) YK1.toggleLoader();
  };
  showLoader = () => {
    this.setState({ displayLoading: true });
    if (YK1.toggleLoader && YK1.toggleLoader !== null) YK1.toggleLoader();
  };
  handleCompareGraph = (selections) => {
    let { graphArray, tabList } = this.state;
    // let { tabList } = this.state;
    if (graphArray.length < 2) {
      alert("Must have more than one graph to compare");
    } else {
      this.setState({ compareGraphPopup: true });
    }
    if (selections) {
      let clonedSelectionArray = this.cloneGraphArray(selections);
      let tab = {
        name: "Compare Graphs",
        tabContent: (
          <CompareGraphTab
            graphArray={clonedSelectionArray}
            loadCurrentCyto={this.handleLoadCyto}
          />
        ),
      };
      tabList.push(tab);
      this.setState(
        { tabList, currentGraphKey: null, compareGraphPopup: false },
        () => {
          this.handleSelectedKey();
        }
      );

      this.checkTabName(tab);
    }
  };
  cloneGraphArray = (selections) => {
    let newSelections = selections.map((obj) => {
      let graphId = obj.graphId;
      let initTin = YK1.GRAPHS[graphId].initTin;
      let taxYear = YK1.GRAPHS[graphId].taxYear;
      let numNodes =
        YK1.getAllRegularNodes(graphId, 0).length +
        YK1.getAllGroupNodes(graphId).length;
      let numEdges = YK1.getEntityGroupEdgeCount(graphId);
      let cytoDiv = document.createElement("div");
      let initSpan = document.createElement("span");
      cytoDiv.appendChild(initSpan);
      cytoDiv.setAttribute("id", "cy");
      let cyto = YK1.loadCyto(graphId, cytoDiv, true, false);
      console.log(numNodes);
      return { cyto, cytoDiv, numNodes: numNodes, numEdges, initTin, taxYear };
    });
    return newSelections;
  };
  handleCompareGraphClose = () => {
    this.setState({ compareGraphPopup: false });
  };

  handleCloseNewGraph = () => {
    this.setState({ showNewGraph: false });
  };
  unMountDetailsModal = () => {
    this.setState({
      nodeDetailsPopUp: !this.state.nodeDetailsPopUp,
    });
  };

  nodeAndLinkInfoCallback = (nodeLinkInfo) => {
    this.setState({ nodeLinkInfo }, () => {
      this.setState({ showNodeLinkPopup: true });
    });
    /*
     modalBody.style.width = maxStringWidth + "px";
      //minimum height
    if (HTMLstring.length < 468) {
      console.log("hit");
      modalHeight = "100px";
    }
    */
  };
  //in yk1controller
  detailsModalCallback = (graphId, title, groupType, linkTin, xml) => {
    let cyto = this.state.currentCyto;
    let nodeDetailsData = {
      graphId: graphId,
      title: title,
      groupType: groupType,
      linkTin: linkTin,
      xml: xml,
      cyto: cyto,
    };
    this.setState({
      nodeDetailsPopUp: !this.state.nodeDetailsPopUp,
      nodeDetailsData,
    });
  };

  handleLoadCyto = (cyto) => {
    this.setState({ currentCyto: cyto });
  };

  //renders JSON graph data to new tab
  handleUploadFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    var file = e.target.files[0];
    e.target.value = null;
    let cytoDiv = document.createElement("div");
    let cyto = "";
    cytoDiv.setAttribute("id", "cy");
    //only allow files with .yK1 extension
    if (file && file.name.indexOf(".yK1") > -1) {
      let fileName = file.name.split(".")[0];
      var reader = new FileReader();
      //file = atob(file);
      reader.onload = (e) => {
        this.globalIndex = this.globalIndex + 1;
        let graphId = this.globalIndex;
        var contents = e.target.result;
        cyto = YK1.loadGraphML(contents, graphId, cytoDiv);
        this.appendTabToList(fileName, cytoDiv, cyto, graphId);
      };
      reader.readAsText(file);
      this.handleSelectedKey();
    } else if (file.name.indexOf(".yK1") === -1) {
      alert("Invalid yK1 File");
    }
  };

  /*******************************
   *
   *    RTF CONTROL
   *
   ************************/
  handleAddRTF = (data, graphId, myObject) => {
    let { tabList } = this.state;
    let windowName = this.getRTFWindowName(data, myObject);
    if (windowName) {
      let tab = {
        name: windowName,
        tabContent: <RTFtab data={data} />,
      };
      tabList.push(tab);
      this.setState({ tabList }, () => {
        this.handleSelectedKey();
      });
      this.checkTabName(tab);
    }
  };

  getRTFWindowName = (data, myObject) => {
    let windowName = "";
    if (((data.formList === null) !== data.formList.length) === 0) {
      alert(
        "It appears this TIN has an issue with the RTF data mappings." +
          "Please email the yK1 helpdesk and include the following sentence: \n" +
          "\tRTF issue TIN: " +
          myObject.tin1,
        "RTF DATA ISSUE"
      );
      return null;
    } else {
      if (myObject.tin1 && myObject.tin1.length === 10)
        myObject.tin1 = myObject.tin1.substring(1);
      if (myObject.tin2 && myObject.tin2.length === 10)
        myObject.tin2 = myObject.tin2.substring(1);
      if (myObject.dataSource === "K1") {
        windowName = "K1 Data - " + myObject.tin1 + " to " + myObject.tin2;
      } else {
        windowName = "BRTF Data for " + myObject.tin1;

        if (myObject.dataSource === "1040") {
          windowName = "IRTF Data for " + myObject.tin1;
        }
      }
    }
    return windowName;
  };
  /*******************************
   *
   *    DISCLAIMER CONTROL
   *
   ************************/

  // toggleDisclaimer sets flag to unmount disclaimer page
  toggleDiscaimer = () => {
    let disclaimer = this.state.disclaimer;
    this.setState({ disclaimer: !disclaimer });
  };

  render() {
    let searchTab = this.getSearchTab();
    let tabList = this.state.tabList;
    tabList[0] = searchTab;

    return (
      <div>
        {/* <Prompt when={console.log("helo")} message="Are you sure?" /> */}

        {this.state.showNodeLinkPopup ? (
          <NodeLinkInfo
            data={this.state.nodeLinkInfo}
            onExit={() => {
              this.setState({ showNodeLinkPopup: false });
            }}
          />
        ) : null}
        {this.state.displayLoading ? <Loading /> : null}
        {this.state.nodeDetailsPopUp ? (
          <ModalWindowControl
            nodeDetailsData={this.state.nodeDetailsData}
            unMountDetailsModal={this.unMountDetailsModal}
          />
        ) : null}
        {this.state.compareGraphPopup ? (
          <CompareGraphPopup
            graphArray={this.state.graphArray}
            onClose={this.handleCompareGraphClose}
            compareGraph={this.handleCompareGraph}
          />
        ) : null}

        {this.state.disclaimer ? (
          <DisclaimerPopup onAcceptClick={this.toggleDiscaimer} />
        ) : null}
        {this.state.logOut ? <LogoutModal /> : null}
        <NavigationBar
          closeAllTabs={this.handleCloseAllTabs}
          isyK1Tab={this.state.isyK1Tab}
          onCompareGraph={this.handleCompareGraph}
          selectedKey={this.state.selectedKey}
          graphId={this.state.currentGraphKey}
          onChangeLayout={this.handleChangeLayout}
          currentCyto={this.state.currentCyto}
          onUpload={this.handleUploadFile}
          currentTab={this.state.currentTab}
          // navBarControl={this.state.navBarControl}
          user={this.state.user}
          onLegendClick={this.handleLegendClick}
        />
        {this.state.tabList && this.props.yk1MultiOptions.length ? (
          <ResponsiveTabs
            onTabClose={this.handleTabClose}
            onSetSelectedKey={this.handleSetSelectedKey}
            onMainTabChange={this.handleMainTabChange}
            tabList={tabList}
            selectedKey={this.state.selectedKey}
          />
        ) : null}
        {this.state.softLogout ? (
          <SoftLogout onClosePrompt={this.closeSoftLogPrompt} />
        ) : null}

        <span
          style={{ position: "absolute", top: 56, left: 68, color: "white" }}
        >
          <ToolTip id="searchButton" />
        </span>
        <div id="forCyto" />
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    yk1MultiOptions: state.yk1State.multiselectOptions,
  };
};
// const mapActionsToProps = {
//   onUpdateUser: updateUser
// };
const mapDispatchToProps = (dispatch) => ({
  updateMultiselect: (multiselectOptions) =>
    dispatch({
      type: "initMultiSelect",
      payload: { multiselectOptions: multiselectOptions },
    }),
});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
