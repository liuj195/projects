import React from "react";
import YK1 from "../../js/yk1/yk1";
import FindBy from "../popups/findBy";
import PrintOptions from "../popups/printOptions";
import Menu, { SubMenu, Item as MenuItem, Divider } from "rc-menu";
import "rc-menu/assets/index.css";
import {
  toggleAllLabels,
  toggleAllNames,
  toggleAllTaxPeriods,
  toggleAllTins,
  toggleAllLinkAmounts,
} from "../utils/utils";
import Magnifier from "../popups/magnifier";
import html2canvas from "html2canvas";
import ToolTip from "../tooltips/tooltips";
import LayoutOptions from "../popups/layoutOptions";
import { detectIE } from "../utils/utils";

class NavigationBar extends React.Component {
  state = {
    findByMenu: false,
    printOptions: false,
    findByOption: null,
    zoomRadius: 200,
    zoom: 2,
    radius: 200,
    magnifier: false,
    html2Canvas: null,
    layoutOptionsMenu: false,
    fontSize: "1.6rem",
    selectedNodes: null,
  };
  constructor(props) {
    super(props);
    this.clickRef = React.createRef();
    if (window.innerWidth < 1000) {
      this.state.fontSize = "1.4rem";
    }
    //need to set global so graphUtility context menu can access
    YK1.handleChangeLayout = this.handleChangeLayout;
  }
  closeAllNav = () => {
    //rc-menu makes us click on a specific element to make nav close
    let expanededNavItems = document.getElementsByClassName(
      "rc-menu-submenu-open"
    );
    expanededNavItems[0].children[0].click();
  };
  handleClose = () => {
    this.setState({
      findByMenu: false,
      layoutOptionsMenu: false,
      printOptions: false,
    });
  };

  handleChangeLayout = (selectedNodes) => {
    let currentCyto = this.props.currentCyto;
    if (currentCyto) {
      this.setState({ layoutOptionsMenu: true, selectedNodes }, () => {});
    }
  };
  // handleChangeLayout = layout => {
  //   let currentCyto = this.props.currentCyto;
  //   if (currentCyto) {
  //     switch (layout) {
  //       case "Dagre":
  //         YK1.doDagreLayout(currentCyto);
  //         break;
  //       case "Circular":
  //         YK1.doCircularLayout(currentCyto);
  //         break;
  //       case "Grid":
  //         YK1.doGridLayout(currentCyto);
  //         break;
  //       case "Cola":
  //         YK1.doColaLayout(currentCyto);
  //         break;
  //       default:
  //         console.log("default case");
  //         console.log(layout);
  //         break;
  //     }
  //   }
  // };

  calculateZoomCenterPoint = () => {
    let width = window.innerWidth / 2;
    let height = window.innerHeight / 2;
    return { x: width, y: height };
  };

  handleSaveFile = () => {
    let { currentCyto, graphId } = this.props;
    if (currentCyto) {
      //located in graphinput
      YK1.saveFile(graphId, currentCyto);
    } else alert("No Graph Selected");
  };

  render() {
    let isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    const { user, onUpload, graphId, currentCyto } = this.props;
    const isyK1Tab = this.props.isyK1Tab;
    let isLegend = false;
    if (this.props.currentTab.name) {
      isLegend =
        this.props.currentTab.name.indexOf("Legend") > -1 ? true : false;
    }
    return (
      <header
        className="usa-header usa-header-basic"
        role="banner"
        style={{ fontSize: this.state.fontSize }}
      >
        {/*floating div with title of app*/}

        <div style={{ position: "absolute", left: "50%", top: 12 }}>
          <div
            style={{
              position: "relative",
              left: "-50%",
              color: "white",
              fontWeight: "bold",
              textShadow:
                "-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black",
            }}
          >
            yK1 Application Suite
          </div>
        </div>
        {this.state.layoutOptionsMenu ? (
          <LayoutOptions
            selectedNodes={this.state.selectedNodes}
            currentCyto={currentCyto}
            onHandleClose={this.handleClose}
          />
        ) : null}
        {this.state.magnifier ? (
          <Magnifier
            html2Canvas={this.state.html2Canvas}
            exitMagnifier={() => this.setState({ magnifier: false })}
          />
        ) : null}
        {this.state.findByMenu ? (
          <FindBy
            findByOption={this.state.findByOption}
            graphId={graphId}
            onHandleClose={this.handleClose}
            currentCyto={currentCyto}
          />
        ) : null}
        {this.state.printOptions ? (
          <PrintOptions
            currentTab={this.props.currentTab}
            graphId={graphId}
            onHandleClose={this.handleClose}
            currentCyto={currentCyto}
          />
        ) : null}
        <input
          id="myInput"
          type="file"
          ref={(ele) => (this.upload = ele)}
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files[0]) onUpload(e);
          }}
        />
        <Menu
          mode="horizontal"
          //openAnimation="zoom"
          selectable={false}
          triggerSubMenuAction={"click"}
        >
          <SubMenu
            title={<span className="submenu-title-wrapper">File</span>}
            key="1"
            popupOffset={[0, 2]}
          >
            <MenuItem
              key="1-1"
              onClick={() => {
                this.upload.click();
                this.closeAllNav();
              }}
            >
              Load Graph
            </MenuItem>
            <Divider />
            <MenuItem
              key="1-2"
              onClick={() => {
                this.handleSaveFile();
                this.closeAllNav();
              }}
              disabled={!isyK1Tab}
            >
              Save Graph
            </MenuItem>
            <Divider />
            <MenuItem
              key="1-3"
              onClick={() => {
                this.setState({ printOptions: true });
                this.closeAllNav();
              }}
              disabled={!isyK1Tab && !isLegend}
            >
              Print Graph
            </MenuItem>
          </SubMenu>
          <SubMenu
            title={<span className="submenu-title-wrapper">Tabs</span>}
            key="2"
            popupOffset={[0, 2]}
          >
            <MenuItem
              key="2-1"
              onClick={() => {
                this.closeAllNav();
                this.props.closeAllTabs();
              }}
              disabled={!isyK1Tab}
            >
              Close All
            </MenuItem>
          </SubMenu>
          <SubMenu
            title={<span className="submenu-title-wrapper">Graph</span>}
            key="4"
            popupOffset={[0, 2]}
            disabled={!isyK1Tab}
          >
            <Divider />
            <MenuItem
              key="4-2"
              onClick={(e) => {
                this.handleChangeLayout();
                this.closeAllNav();
              }}
            >
              Layouts
            </MenuItem>
            <Divider />
            <SubMenu
              title={<span className="submenu-title-wrapper">Hide All</span>}
              key="4-3"
              popupOffset={[0, -2]}
            >
              <MenuItem
                key="4-3-1"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllLinkAmounts(currentCyto, graphId, false);
                }}
              >
                Hide All Amounts
              </MenuItem>
              <MenuItem
                key="4-3-2"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllLabels(currentCyto, graphId, false);
                }}
              >
                Hide All Labels
              </MenuItem>
              <MenuItem
                key="4-3-3"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllNames(currentCyto, graphId, false);
                }}
              >
                Hide All Names
              </MenuItem>
              <MenuItem
                key="4-3-4"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllTins(currentCyto, graphId, false);
                }}
              >
                Hide All TINs
              </MenuItem>
              <MenuItem
                key="4-3-5"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllTaxPeriods(currentCyto, graphId, false);
                }}
              >
                Hide All Tax Periods
              </MenuItem>
            </SubMenu>
            <SubMenu
              title={<span className="submenu-title-wrapper">Show All</span>}
              key="4-4"
              popupOffset={[0, -2]}
            >
              <MenuItem
                key="4-4-1"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllLinkAmounts(currentCyto, graphId, true);
                }}
              >
                Show All Amounts
              </MenuItem>
              <MenuItem
                key="4-4-2"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllLabels(currentCyto, graphId, true);
                }}
              >
                Show All Labels
              </MenuItem>
              <MenuItem
                key="4-4-3"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllNames(currentCyto, graphId, true);
                }}
              >
                Show All Names
              </MenuItem>
              <MenuItem
                key="4-4-4"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllTins(currentCyto, graphId, true);
                }}
              >
                Show All TINs
              </MenuItem>
              <MenuItem
                key="4-4-5"
                onClick={() => {
                  this.closeAllNav();
                  toggleAllTaxPeriods(currentCyto, graphId, true);
                }}
              >
                Show All Tax Periods
              </MenuItem>
            </SubMenu>
            <Divider />
            <MenuItem
              key="4-5"
              onClick={() => {
                this.setState({
                  findByMenu: true,
                  findByOption: "TIN",
                });
                this.closeAllNav();
              }}
            >
              Find By TIN
            </MenuItem>
            <MenuItem
              key="4-6"
              onClick={() => {
                this.setState({ findByMenu: true, findByOption: "Name" });
                this.closeAllNav();
              }}
            >
              Find By Name
            </MenuItem>
            <Divider />
            <MenuItem
              key="4-7"
              onClick={() => {
                this.closeAllNav();
                this.props.onCompareGraph();
              }}
            >
              Compare Graphs
            </MenuItem>
            <Divider />
            <MenuItem
              key="4-8"
              onClick={(e) => {
                console.log(e);
                this.props.currentCyto.fit(
                  this.props.currentCyto.$(":selected")
                );
                this.closeAllNav();
              }}
            >
              Zoom Selected
            </MenuItem>
            <MenuItem
              key="4-9"
              onClick={(e) => {
                console.log(e);
                let cy = this.props.currentCyto;
                let currentZoom = cy.zoom();
                let zoomIn = currentZoom * 1.2;
                let renderedPosition = this.calculateZoomCenterPoint();
                cy.zoom({
                  level: zoomIn,
                  renderedPosition,
                });
              }}
            >
              Zoom In
            </MenuItem>

            <MenuItem
              key="4-10"
              onClick={(e) => {
                console.log(e);
                let cy = this.props.currentCyto;
                let currentZoom = cy.zoom();
                let zoomOut = currentZoom * 0.8;
                let renderedPosition = this.calculateZoomCenterPoint();
                cy.zoom({
                  level: zoomOut,
                  renderedPosition,
                });
              }}
            >
              Zoom Out
            </MenuItem>
            <MenuItem
              key="4-11"
              onClick={() => {
                this.props.currentCyto.fit();
                this.closeAllNav();
              }}
            >
              Fit in Window
            </MenuItem>
            <Divider />
            <SubMenu
              title={
                <span className="submenu-title-wrapper">Address Nodes</span>
              }
              key="6"
              popupOffset={[0, -2]}
            >
              <MenuItem
                key="6-1"
                onClick={() => {
                  YK1.showAllAddressNodes(graphId, 1, currentCyto);
                  this.closeAllNav();
                }}
              >
                Show All Address Nodes
              </MenuItem>
              <MenuItem
                key="6-2"
                onClick={() => {
                  YK1.showAllAddressNodes(graphId, 2, currentCyto);
                  this.closeAllNav();
                }}
              >
                Show Common Address Nodes
              </MenuItem>
            </SubMenu>
            <SubMenu
              title={
                <span className="submenu-title-wrapper">Preparer Nodes</span>
              }
              key="7"
              popupOffset={[0, -2]}
            >
              <MenuItem
                key="7-1"
                onClick={() => {
                  YK1.showAllPreparerNodes(graphId, 1, currentCyto);
                  this.closeAllNav();
                }}
              >
                Show All Preparer Nodes
              </MenuItem>
              <MenuItem
                key="7-2"
                onClick={() => {
                  YK1.showAllPreparerNodes(graphId, 2, currentCyto);
                  this.closeAllNav();
                }}
              >
                Show Common Preparer Nodes
              </MenuItem>
            </SubMenu>
            {!isIE11 && <Divider />}

            {/* <MenuItem
              itemIcon={
                this.state.magnifierToggle ? (
                  <FontAwesomeIcon className="fa-sm" icon={faCheckCircle} />
                ) : null
              }
              key="4-12"
              onClick={() => {
                let that = this;
                let cytoscapeDiv = document.getElementById("outerCyDiv");
                html2canvas(cytoscapeDiv).then(function(canvas) {
                  canvas.id = "magniferCanvas";
                  that.setState({ magnifier: true, html2Canvas: canvas });
                });
              }}
            >
              Magnifying Glass
            </MenuItem> */}
          </SubMenu>
          <MenuItem
            title="Welcome"
            key="5"
            popupOffset={[0, 2]}
            style={{ float: "right" }}
          >{`Welcome ${user.userID}`}</MenuItem>
          <SubMenu
            title={<span className="submenu-title-wrapper">Help</span>}
            key="3"
            popupOffset={[0, 2]}
          >
            <MenuItem
              key="3-1"
              onClick={() => {
                this.props.onLegendClick();
                this.closeAllNav();
              }}
            >
              Legend
            </MenuItem>
            <MenuItem
              key="3-2"
              onClick={() => {
                window.open(window.routes.dataDictionary);
                this.closeAllNav();
                //window.location.href = window.routes.dataDictionary;
                // "/yk1/SupplementalFiles/Data_dictionary_yK1.xlsx";
              }}
            >
              Data Dictionary
            </MenuItem>
            <MenuItem
              key="3-3"
              onClick={() => {
                window.open(window.routes.userGuide);
                this.closeAllNav();
                //  "/yk1/SupplementalFiles/yk1_Training_Guide.zip";
              }}
            >
              yK1 User Guide
            </MenuItem>
            <MenuItem
              key="3-4"
              onClick={() => {
                window.location = "mailto:" + window.helpdeskEmail;
                this.closeAllNav();
              }}
            >
              Email yK1 Helpdesk
            </MenuItem>
            <MenuItem
              key="3-5"
              onClick={() => {
                window.open(
                  "https://yk1.web.irs.gov/yk1/SupplementalFiles/release_notes.pdf"
                );
                this.closeAllNav();
              }}
            >
              Release Notes
            </MenuItem>
          </SubMenu>

          <MenuItem
            title="Logout"
            key="6"
            popupOffset={[0, 2]}
            onClick={() => {
              //located in webservices js files
              YK1.logOut();
            }}
          >
            Log Out
          </MenuItem>
        </Menu>
      </header>
    );
  }
}

export default NavigationBar;

// NavigationBar.propTypes = {
//   currentGraph: PropTypes.shape({
//     id: PropTypes.oneOfType([
//       PropTypes.number,
//       PropTypes.string,
//       PropTypes.object
//     ]),
//     graph: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
//   }),
//   onUpload: PropTypes.func.isRequired,
//   navBarControl: PropTypes.array.isRequired,
//   user: PropTypes.shape({
//     userID: PropTypes.string.isRequired,
//     access: PropTypes.array.isRequired
//   }),
//   onLegendClick: PropTypes.func.isRequired
// };

// NavigationBar.defaultProps = {
//   currentGraph: null,
//   user: undefined
// };
