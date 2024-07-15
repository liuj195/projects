import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tabs, { TabPane } from "rc-tabs";
import TabContent from "rc-tabs/lib/TabContent";
import ScrollableInkTabBar from "rc-tabs/lib/ScrollableInkTabBar";
import "../../css/rc-tabs.css";

import { faTimes } from "@fortawesome/free-solid-svg-icons";

class RcTabs extends Component {
  state = {
    tabs: [
      { key: "1", value: "value" },
      { key: "2", value: "value" },
      { key: "3", value: "value" }
    ]
  };
  callback = function(key) {
    console.log(key);
  };
  createElement = tab => {
    return (
      <div>
        {tab.value + "  "}
        <span
          tab={tab}
          id={tab.key}
          onClick={() => this.props.onHandleClick(tab)}
        >
          <FontAwesomeIcon
            icon={faTimes}
            style={{ position: "relative", top: -6, opacity: 0.4 }}
            className="fa-sm"
            id={tab.key}
          />
        </span>
      </div>
    );
  };
  render() {
    return (
      <Tabs
        className="ml-20"
        style={{ width: 900 }}
        defaultActiveKey="1"
        onChange={this.callback}
        renderTabBar={() => <ScrollableInkTabBar />}
        renderTabContent={() => <TabContent />}
      >
        {this.state.tabs.map(tabs => {
          return (
            <TabPane tab={this.createElement(tabs)} key={tabs.key}>
              {tabs.paneData}
            </TabPane>
          );
        })}
      </Tabs>
    );
  }
}

export default RcTabs;
