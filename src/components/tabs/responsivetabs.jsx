import React, { Component } from "react";
import Tabs from "react-responsive-tabs";
import PropTypes from "prop-types";
import "react-responsive-tabs/styles.css";
import YK1 from "../../js/yk1/yk1";

class ResponsiveTabs extends Component {
  state = { allowSwitch: true };
  closing = null;
  /**
   * createTabTitle is a custom closing function for react-reponsive-tabs
   * a span is created with a clickable "x" that will close that tab upon clicking
   * This was made because the native closing function did not look very nice.
   */

  componentWillUnmount() {}
  createTabTitle = tab => {
    let tabName = tab.name;
    if (tabName !== "Search") {
      return (
        <div>
          {tabName}
          <span
            tab={tab}
            onClick={() => {
              YK1.showLoader();
              console.log("closing");
              this.closing = true;
              this.props.onTabClose(tab);
            }}
            style={{
              paddingLeft: 5,
              position: "absolute",
              marginTop: "-11px",
              zIndex: 2
            }}
          >
            x
          </span>
        </div>
      );
    } else return tabName;
  };

  /**
   * This layout was provided by react-responsive-tabs
   * getTabs returns an array of tabs to "items" in <Tabs />
   */
  getTabs(data) {
    let tabList = data.tabList;
    return tabList.map((tab, index) => ({
      title: this.createTabTitle(tab),
      getContent: () => tab.tabContent,
      tabClassName: "tab",
      panelClassName: "panel"
    }));
  }

  handleChangeTriggers = tab => {
    if (!this.closing) {
      this.props.onMainTabChange(tab);
    }
    this.closing = null;
  };

  render() {
    let selectedKey = this.props.selectedKey;
    let tabs = this.getTabs(this.props);
    if (selectedKey >= tabs.length) selectedKey = 0;
    return (
      <Tabs
        //allowRemove={true}
        tabsWrapperClass={"topLevelTabs"}
        items={tabs}
        onChange={this.handleChangeTriggers}
        selectedTabKey={selectedKey}
      />
    );
  }
}

export default ResponsiveTabs;
ResponsiveTabs.propTypes = {
  onSetSelectedKey: PropTypes.func.isRequired,
  onMainTabChange: PropTypes.func.isRequired,
  tabList: PropTypes.array.isRequired,
  selectedKey: PropTypes.number.isRequired
};
