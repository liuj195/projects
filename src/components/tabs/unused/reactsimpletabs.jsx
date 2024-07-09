import React, { Component } from "react";

import { Tabs } from "react-simpletabs";

class SimpleTabs extends Component {
  state = {};
  render() {
    return (
      <Tabs>
        <Tabs.Panel title="Tab #1">
          <h2>Content #1 here</h2>
        </Tabs.Panel>
        <Tabs.Panel title="Tab #2">
          <h2>Content #2 here</h2>
        </Tabs.Panel>
        <Tabs.Panel title="Tab #3">
          <h2>Content #3 here</h2>
        </Tabs.Panel>
      </Tabs>
    );
  }
}

export default SimpleTabs;
