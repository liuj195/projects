import React from "react";
import Tabs from "react-responsive-tabs";
import "react-responsive-tabs/styles.css";

const SearchTabs = ({
  user,
  onSubTabChange,
  subTabSelectedKey,
  BoTtab,
  YK1tab,
  TSTtab,
  DashboardTab,
}) => {
  let access = user.access;
  const getValidatedTabs = () => {
    let accessArray = [];
    let graphQueryTab = { name: "Graph Query" };

    if (access.indexOf("yK1") > -1) {
      accessArray.push(YK1tab);
    }
    if (access.indexOf("TST") > -1) accessArray.push(TSTtab);
    if (access.indexOf("BoT") > -1) accessArray.push(BoTtab);
    if (access.indexOf("Graph Query") > -1) accessArray.push(graphQueryTab);
    accessArray.push(DashboardTab);
    return accessArray;
  };
  /**
   * getTabs returns an array of tabs to "items" in <Tabs />
   */
  const getTabs = () => {
    let validatedTabs = getValidatedTabs();
    return validatedTabs.map((subTab, index) => ({
      title: subTab.name,
      getContent: () => subTab.tabContent,
      /* Optional parameters */
      key: index,
      tabClassName: "tab",
      panelClassName: "panel",
    }));
  };

  return (
    <Tabs
      items={getTabs()}
      tabsWrapperClass={"subTabs"}
      onChange={onSubTabChange}
      selectedTabKey={subTabSelectedKey}
    />
  );
};

export default SearchTabs;

// SearchTabs.propTypes = {
//   user: PropTypes.shape({
//     userID: PropTypes.string.isRequired,
//     access: PropTypes.array.isRequired
//   }),
//   onSubTabChange: PropTypes.func.isRequired,
//   yK1State: PropTypes.object.isRequired,
//   BoTState: PropTypes.object.isRequired,
//   tstState: PropTypes.object.isRequired
// };
// SearchTabs.defaultProps = {
//   user: undefined
// };
