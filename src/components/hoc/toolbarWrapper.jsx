import React, { Component } from "react";

export const ToolBarWrapper = (
  rows,
  nodeDetailsData,
  Toolbar,
  addSelected,
  exportToExcel,
  toggleAddGraph,
  addedClasses = {},
  selectedIndexes = [],
  isRTF = false
) => {
  return class extends Component {
    state = {
      filterOpen: null,
    };
    constructor(props) {
      super(props);
      this.state.filterOpen = this.props.filterOpen;
    }
    render() {
      const newOnToggleFilter = () => {
        //since we are "hacking" this component, need to call onToggleFilter prop to initiate filter toggle
        this.props.onToggleFilter();
        this.props.customToggleFilter();
      };

      let addColor = toggleAddGraph ? "green" : "grey";
      let filterText = this.state.filterOpen ? "Remove Filter" : "Filter Rows";

      return (
        <Toolbar
          {...this.props}
          filterRowsButtonText={filterText}
          onToggleFilter={newOnToggleFilter}
        >
          {this.props.children}
          {addSelected ? (
            <button
              type="button"
              className={`btn addGraphButton ${addedClasses.addToGraph}`}
              style={{ backgroundColor: addColor }}
              onClick={addSelected}
              ref={(addBtn) => {
                this.addBtn = addBtn;
              }}
            >
              Add To Graph
            </button>
          ) : null}
          <button
            style={{ backgroundColor: "green" }}
            type="button"
            className={`btn excelButton ${addedClasses.exportToExcel}`}
            onClick={() => {
              if (selectedIndexes.length === 0 && isRTF === false) {
                alert("Please select at least 1 row");
              } else if (!isRTF) {
                //for non rtf grids
                let selectedRows = selectedIndexes.map((index) => {
                  return rows[index];
                });
                exportToExcel(selectedRows, nodeDetailsData);
              } else {
                //for rtf grid
                exportToExcel(rows, nodeDetailsData);
              }
            }}
          >
            Export To Excel
          </button>
        </Toolbar>
      );
    }
  };
};
