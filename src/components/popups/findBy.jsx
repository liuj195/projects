import React, { Component } from "react";
import YK1 from "../../js/yk1/yk1";
import SVG from "../svg/xButtonSvg";
import Draggable from "react-draggable";
import ReactDataGrid from "react-data-grid";
import { ToolBarWrapper } from "../hoc/toolbarWrapper";
import { Toolbar } from "react-data-grid-addons";
import {
  onRowsSelected,
  onRowsDeselected,
  exportToExcel,
  sortRows,
  getRows,
  handleFilterChange,
} from "../utils/datagrid";

class FindBy extends Component {
  state = {
    names: [],
    tins: [],
    findByOption: null,
    rowCount: null,
    selectedIndexes: [],
    filters: {},
    rowCounter: 0,
    toggleAddGraph: false,
    rows: null,
    filterOpen: false,
    modalWidth: 378,
    gridWidth: 350,
  };
  constructor(props) {
    super(props);
    this.state.findByOption = props.findByOption;
    this.state.cols = [
      {
        key: "name",
        name: props.findByOption,
        resizable: true,
        sortable: true,
        filterable: true,
        width: 272,
      },
    ];
    if (props.findByOption === "Name") {
      this.state.rows = this.getAllNames();
    } else {
      this.state.modalWidth = 450;
      this.state.gridWidth = 440;
      this.state.rows = this.getAllTins();
      this.state.cols = [
        ...this.state.cols,
        {
          key: "period",
          name: "Period",
          resizable: true,
          sortable: true,
          filterable: true,
          width: 90,
        },
      ];
    }
  }
  componentDidMount() {
    document.addEventListener("click", this.handleClose);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.handleClose);
  }

  handleClose = (e) => {
    if (e.target === this.myRef) this.props.onHandleClose();
  };
  customToggleFilter = () => {
    let filterOpen = this.state.filterOpen;
    this.setState({ filterOpen: !filterOpen });
  };
  getAllTins = () => {
    let graphId = this.props.graphId;
    let nodes = YK1.GRAPHS[graphId].V;
    let allTins = [];
    for (let key in nodes) {
      if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
        if (
          nodes[key].TIN &&
          nodes[key].type !== "GROUP" &&
          nodes[key].type !== "ADDRESS" &&
          nodes[key].type !== "PREPARER"
        ) {
          allTins.push({
            id: key,
            name: nodes[key].TIN,
            nodeTin: nodes[key].TIN,
            nodeName: nodes[key].data.name,
            period: nodes[key].data.year,
          });
        }
      }
    }

    allTins.sort(this.sortList);
    return allTins;
  };

  getAllNames = () => {
    let graphId = this.props.graphId;
    let nodes = YK1.GRAPHS[graphId].V;
    let nameObject = [];
    for (let key in nodes) {
      if (nodes.hasOwnProperty(key) && nodes[key] !== null) {
        if (
          nodes[key].TIN &&
          nodes[key].type !== "GROUP" &&
          nodes[key].type !== "ADDRESS" &&
          nodes[key].type !== "PREPARER"
        ) {
          nameObject.push({
            id: key,
            name: nodes[key].data.name,
            nodeTin: nodes[key].TIN,
            nodeName: nodes[key].data.name,
          });
        }
      }
    }

    nameObject.sort(this.sortList);

    return nameObject;
  };

  sortList = (a, b) => {
    let nameA = a.name.toUpperCase();
    let nameB = b.name.toUpperCase();
    if (nameA > nameB) return 1;
    else if (nameA < nameB) return -1;
    else return 0;
  };

  getDynamicWidth = (names) => {
    let maxWidth = 0;
    names.forEach((item) => {
      let stringWidth = YK1.getWidthOfText(item.id);
      if (stringWidth > maxWidth) {
        maxWidth = stringWidth;
      }
    });
    return maxWidth;
  };
  selectNames = () => {
    let { currentCyto } = this.props;
    let { rows } = this.state;
    let names = this.state.selectedIndexes.map((item) => {
      return rows[item].id;
    });
    names.forEach((item) => {
      currentCyto.getElementById(item).select();
    });

    this.props.onHandleClose();
  };
  getFormattedRows = (selectedRows) => {
    let formattedRows = selectedRows.map((row) => {
      let newRow = {};
      if (this.props.findByOption === "Name") {
        newRow = {
          TIN: row.nodeTin,
          Name: row.nodeName,
        };
      } else {
        newRow = {
          TIN: row.nodeTin,
          Name: row.nodeName,
          Period: row.period,
        };
      }

      return newRow;
    });
    return formattedRows;
  };
  render() {
    const MyToolBar = ToolBarWrapper(
      this.state.rows,
      this.props.nodeDetailsData,
      Toolbar,
      this.addSelected,
      exportToExcel,
      this.state.toggleAddGraph,
      {
        addToGraph: "findByAddToGraph",
        exportToExcel: "exportToExcel",
      }
    );
    let { cols, rows, filters } = this.state;
    const filteredRows = getRows(rows, filters);
    const rowText = this.state.selectedIndexes.length === 1 ? "row" : "rows";

    let tin = YK1.GRAPHS[this.props.graphId].initTin;
    let title =
      this.state.findByOption +
      "'s" +
      " for " +
      tin +
      YK1.getTinTypeString(tin) +
      " TY" +
      YK1.GRAPHS[this.props.graphId].longTaxYear;
    return (
      <div
        ref={(ele) => {
          this.myRef = ele;
        }}
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          height: window.innerHeight,
          width: window.innerWidth,
          position: "absolute",
          paddingTop: "10%",
          zIndex: 99,
        }}
      >
        <Draggable cancel=".mainFindByGrid">
          <div
            style={{
              margin: "auto",
              textAlign: "center",
              background: "white",
              // width: this.getDynamicWidth(data) + 100,
              width: this.state.modalWidth,
              height: "auto",
              border: "1px solid grey",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                borderBottom: "1px solid grey",
                textAlign: "center",
                padding: 5,
                borderTopLeftRadius: 5,
                borderTopRightRadius: 5,
                background: "lightgrey",
              }}
            >
              <SVG
                onClearText={this.props.onHandleClose}
                styleObj={{
                  float: "right",
                  border: "1px solid grey",
                  borderRadius: 3,
                  color: "grey",
                  position: "relative",
                }}
              />
              <b style={{ fontSize: 18 }}>
                {" "}
                Find By {this.props.findByOption}{" "}
              </b>
            </div>
            <div>
              <b>Select a node or nodes:</b>
            </div>
            <ul
              className="mainFindByGrid"
              style={{
                textAlign: "left",
                height: 350,
                padding: 0,
                margin: "auto",
                border: "1px solid lightgrey",
              }}
            >
              <div style={{ width: this.state.gridWidth, margin: "auto" }}>
                {this.state.rows ? (
                  <ReactDataGrid
                    rowKey="id"
                    columns={cols}
                    rowGetter={(i) => filteredRows[i]}
                    rowsCount={filteredRows.length}
                    minHeight={300}
                    rowHeight={25}
                    toolbar={
                      <MyToolBar
                        enableFilter={true}
                        filterOpen={this.state.filterOpen}
                        customToggleFilter={this.customToggleFilter}
                      >
                        <span
                          style={{
                            color: "red",
                            float: "right",
                            paddingTop: 7,
                          }}
                        >
                          {rows ? rows.length : null} Rows
                        </span>
                        <span
                          style={{
                            float: "left",
                            paddingTop: 7,
                            marginLeft: -13,
                            paddingRight: 8,
                          }}
                        >
                          {this.state.selectedIndexes.length} {rowText} selected
                        </span>
                      </MyToolBar>
                    }
                    onAddFilter={(filter) => {
                      let filters = handleFilterChange(
                        filter,
                        this.state.filters
                      );
                      this.setState({ filters });
                    }}
                    onClearFilters={() => this.setState({ filters: {} })}
                    rowSelection={{
                      showCheckbox: true,
                      enableShiftSelect: true,
                      onRowsSelected: (rows) => {
                        let returnData = onRowsSelected(
                          rows,
                          this.state.rowCounter,
                          this.state.selectedIndexes,
                          true
                        );
                        this.setState({ ...returnData });
                      },
                      onRowsDeselected: (rows) => {
                        let returnData = onRowsDeselected(
                          rows,
                          this.state.rowCounter,
                          this.state.selectedIndexes
                        );
                        this.setState({ ...returnData });
                      },
                      selectBy: {
                        indexes: this.state.selectedIndexes,
                      },
                    }}
                    onGridSort={(sortColumn, sortDirection) => {
                      let sortedRows = sortRows(
                        sortColumn,
                        sortDirection,
                        this.state.rows
                      );
                      this.setState({ rows: sortedRows });
                    }}
                  />
                ) : null}
              </div>
            </ul>
            <div style={{ borderBottom: "1px solid grey" }} />
            <div style={{ textAlign: "center", padding: 5 }}>
              <button
                className="btn btn-lg text-center"
                type="submit"
                style={{
                  padding: 10,
                  backgroundColor: "#2e8540",
                  color: "white",
                  borderRadius: "7px",
                }}
                onClick={this.selectNames}
              >
                Find
              </button>

              <button
                className="btn btn-lg text-center"
                type="submit"
                style={{
                  padding: 10,
                  backgroundColor: "green",
                  color: "white",
                  borderRadius: "7px",
                }}
                onClick={() => {
                  let { rows, selectedIndexes } = this.state;

                  let selectedRows = selectedIndexes.map((index) => {
                    return rows[index];
                  });
                  let formattedRows = this.getFormattedRows(selectedRows);
                  exportToExcel(formattedRows, { title: title });
                }}
              >
                Export To Excel
              </button>
              <button
                className="btn btn-lg text-center"
                type="submit"
                style={{
                  padding: 10,
                  backgroundColor: "black",
                  color: "white",
                  borderRadius: "7px",
                }}
                onClick={this.props.onHandleClose}
              >
                Close
              </button>
            </div>
          </div>
        </Draggable>
      </div>
    );
  }
}

export default FindBy;
