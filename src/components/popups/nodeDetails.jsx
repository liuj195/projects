import React, { Component } from "react";
import YK1 from "../../js/yk1/yk1";
import ReactDataGrid from "react-data-grid";
import $ from "jquery";
import { Toolbar } from "react-data-grid-addons";
import { getWidthOfText } from "../utils/utils";
import { ToolBarWrapper } from "../hoc/toolbarWrapper";
import Draggable from "react-draggable";
import FullScreen from "../utils/fullScreen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faWindowMinimize,
  faClone,
} from "@fortawesome/free-solid-svg-icons";
import {
  onRowsSelected,
  onRowsDeselected,
  exportToExcel,
  sortRows,
  getRows,
  handleFilterChange,
} from "../utils/datagrid";

class ModalWindowControl extends Component {
  state = {
    isFull: false,
    rows: null,
    cols: null,
    rowCount: null,
    selectedIndexes: [],
    filters: {},
    rowCounter: 0,
    toggleAddGraph: false,
    filterOpen: false,
    gridWidth: 0.9,
    linkTin: null,
    selectedRows: [],
  };
  existsArray = [];
  constructor(props) {
    super(props);
    this.fullScreen = React.createRef();
    if (
      props.nodeDetailsData.groupType === "Preparers" ||
      props.nodeDetailsData.groupType === "Addresses"
    ) {
      this.state.gridWidth = window.innerWidth * 0.7;
    } else {
      this.state.gridWidth = window.innerWidth * 0.9;
    }
    console.log(props);
  }

  componentDidMount() {
    this.processInput();
    document.addEventListener(
      "webkitfullscreenchange",
      this.exitHandler,
      false
    );
    document.addEventListener("mozfullscreenchange", this.exitHandler, false);
    document.addEventListener("fullscreenchange", this.exitHandler, false);
    document.addEventListener("MSFullscreenChange", this.exitHandler, false);
    this.setLinkTin();
  }
  componentWillUnmount() {
    //make sure context menues are closed
    FullScreen.closeContextMenu();
    //need to remove listeners when unmounting so as to not upset react
    document.removeEventListener(
      "webkitfullscreenchange",
      this.exitHandler,
      false
    );
    document.removeEventListener(
      "mozfullscreenchange",
      this.exitHandler,
      false
    );
    document.removeEventListener("fullscreenchange", this.exitHandler, false);
    document.removeEventListener("MSFullscreenChange", this.exitHandler, false);
  }
  componentDidUpdate() {
    //Basically if these are uncommented then you will see the first row has the checkbox removed
    // but if you scroll down, the react grid will rerender and the checkbox will re-appear
    // this.setExistsArray();
    // this.removeCheckboxIfExists();
  }
  removeCheckboxIfExists = () => {
    this.existsArray.forEach((item) => {
      if (
        document.querySelectorAll(`div[value="${item}"]`) &&
        document.querySelectorAll(`div[value="${item}"]`).length > 0
      ) {
        document.querySelectorAll(
          `div[value="${item}"]`
        )[0].parentElement.lastChild.firstChild.style.display = "none";
      }
    });
  };
  setExistsArray = () => {
    let { rows } = this.state;
    let { groupType } = this.props.nodeDetailsData;
    rows.forEach((row) => {
      let exists = this.checkIfNodeExists(row);

      if (exists) {
        this.existsArray.push(row[YK1.GROUP_DETAIL[groupType + "TIN"]]);
      }
    });
  };
  setLinkTin = () => {
    let linkTinArray = this.props.nodeDetailsData.linkTin.split("_");
    if (linkTinArray[1]) {
      linkTinArray[1] = linkTinArray[1].substring(1);
    }
    let linkTin = linkTinArray.join("_");
    this.setState({ linkTin });
  };
  exitHandler = (e) => {
    let isFull = FullScreen.getFullScreen();
    this.setState({ isFull: isFull });
  };
  customToggleFilter = () => {
    let filterOpen = this.state.filterOpen;
    this.setState({ filterOpen: !filterOpen });
  };

  addSelected = () => {
    let {
      graphId,
      title,
      groupType,
      linkTin,
      cyto,
    } = this.props.nodeDetailsData;

    let selectedIndexes = this.state.selectedIndexes;
    let rows = this.state.rows;
    let selectedRows = selectedIndexes.map((index) => {
      return rows[index];
    });
    if (selectedRows.length === 0) {
      alert("No selections were made");
      return;
    }
    //in graphProcessor.js
    let checkIfExists = YK1.addSelectedItemsToGraph(
      graphId,
      linkTin,
      groupType,
      title,
      selectedRows,
      cyto
    );
    if (checkIfExists) {
      return;
    }
    this.props.unMountDetailsModal();
  };

  processInput = () => {
    let { title, xml } = this.props.nodeDetailsData;

    let gridCols = [];
    let gridData = [];
    let rowCount = 0;
    var xmlDoc = $.parseXML(xml);
    let $xml = $(xmlDoc);

    // translated this section from the Flex code:
    // class: GraphWindow
    // function: loadNodeDetailsWindow
    let isGroupDetails = true;
    if ($xml.find("Columns").children().length < 10) isGroupDetails = false;
    $xml.find("Columns").each(function() {
      $(this)
        .find("Col")
        .each(function() {
          var columnName = $(this)
            .find("name")
            .text()
            .trim();
          // var columnType = $(this)
          //   .find("type")
          //   .text()
          //   .trim();
          // var columnWidth = $(this)
          //   .find("width")
          //   .text()
          //   .trim();
          let columnNameInPixels = getWidthOfText(columnName);

          let column = {
            key: columnName,
            name: columnName,
            resizable: true,
            sortable: true,
            filterable: true,
            width: isGroupDetails ? columnNameInPixels : null,
          };
          gridCols.push(column);
        });
    });

    $xml.find("Row").each(function() {
      rowCount += 1;
      let rowArray = $(this).find("Col");
      let rowObject = {};
      for (let i = 0; i < rowArray.length; i++) {
        let key = gridCols[i].name;
        rowObject[key] = rowArray[i].textContent;
        // if (rowObject[key] && !isNaN(rowObject[key])) {
        //   rowObject[key] = parseInt(rowObject[key]);
        // }
      }
      gridData.push(rowObject);
    });
    let formedForCSVData = YK1.formedForCSV(gridData, gridCols);
    //if row count is over 10k then need to download

    if (rowCount > 10000) {
      let confirmed = window.confirm(
        "Row count exceeds 10,000 maximum, would you like to download?"
      );
      if (confirmed) {
        let fileName = "yK1data.csv";
        if (title.indexOf("Address") > -1) fileName = "address_list.csv";
        if (title.indexOf("Preparer") > -1) fileName = "preparer_list.csv";
        //located in app.js
        YK1.download(formedForCSVData, fileName, "text/plain");
      }
      this.props.unMountDetailsModal();
    } else {
      this.setState(
        {
          rows: gridData,
          cols: gridCols,
          rowCount: gridData.length,
        },
        () => {}
      );
    }
  };
  formatTitle = () => {
    let { groupType, title, linkTin } = this.props.nodeDetailsData;
    let formattedTitle = title;
    if (groupType === "Preparers" || groupType === "Addresses") {
      formattedTitle = title.split("-");
      formattedTitle = formattedTitle.join(linkTin);
    }
    return formattedTitle;
  };
  noRowsFound = () => {
    alert("No Data Found");
    this.props.unMountDetailsModal();
  };
  checkIfNodeExists = (row) => {
    let exists = false;
    // props = { ...props, extraClasses: ".react-data-grid-backgroundColor" };
    let { groupType } = this.props.nodeDetailsData;
    let tinColName = YK1.GROUP_DETAIL[groupType + "TIN"];

    this.props.nodeDetailsData.cyto.nodes().forEach((cyNode) => {
      let nodeId = YK1.getTinFromNodeId(cyNode.data("id"));
      // console.log(nodeId);
      // console.log(row[tinColName]);

      if (nodeId === row[tinColName]) {
        exists = true;
        // console.log(cyNode);
      }
    });
    return exists;
  };
  RowRenderer = ({ renderBaseRow, ...props }) => {
    return <div>{renderBaseRow(props)}</div>;
  };
  getRowSelection = () => {
    let rowSelectionObj = {
      showCheckbox: true,
      enableShiftSelect: true,
      onRowsSelected: (rows) => {
        let returnData = onRowsSelected(
          rows,
          this.state.rowCounter,
          this.state.selectedIndexes
        );
        let selectedRows = this.state.selectedRows;
        if (rows.length > 1) {
          selectedRows = rows;
        } else {
          selectedRows.push(rows[0]);
        }
        this.setState({ ...returnData, selectedRows });
      },
      onRowsDeselected: (rows) => {
        let returnData = onRowsDeselected(
          rows,
          this.state.rowCounter,
          this.state.selectedIndexes
        );
        let selectedRows = this.state.selectedRows;
        if (rows.length > 1) {
          selectedRows = [];
        } else {
          selectedRows = selectedRows.filter((row) => rows[0].row !== row.row);
        }
        this.setState({ ...returnData, selectedRows });
      },
      selectBy: {
        indexes: this.state.selectedIndexes,
      },
    };
    return rowSelectionObj;
  };
  render() {
    const MyToolBar = ToolBarWrapper(
      this.state.rows,
      this.props.nodeDetailsData,
      Toolbar,
      this.addSelected,
      exportToExcel,
      this.state.toggleAddGraph,
      {},
      this.state.selectedIndexes
    );
    let { cols, rows, filters, gridWidth } = this.state;
    let height = window.innerHeight * 0.7;
    const filteredRows = getRows(rows, filters);
    const rowText = this.state.selectedIndexes.length === 1 ? "row" : "rows";
    let title = this.formatTitle();
    var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
    return (
      <div
        className="usa-grid"
        style={{
          width: "100%",
          height: "100%",
          zIndex: 999,
          position: "absolute",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
      >
        <Draggable cancel=".react-grid-Grid">
          <div
            ref={this.fullScreen}
            className="usa-width-one-whole"
            style={{
              position: "absolute",
              zIndex: 99,
              top: "15%",
              maxWidth: gridWidth,
              left: 0,
              right: 0,
              marginLeft: "auto",
              marginRight: "auto",
              height: this.state.isFull ? "100%" : null,
            }}
          >
            <div
              style={{
                textAlign: "center",
                backgroundColor: "white",
                padding: 10,
                fontWeight: "bold",
              }}
            >
              {title}
            </div>
            {this.state.rows && this.state.rows.length > 0 ? (
              <ReactDataGrid
                rowRenderer={this.RowRenderer}
                ref={(datagrid) => {
                  this.myOpenGrid = datagrid;
                }}
                rowKey="id"
                columns={cols}
                rowGetter={(i) => filteredRows[i]}
                rowsCount={filteredRows.length}
                minHeight={
                  this.state.isFull ? window.innerHeight - 100 : height
                }
                rowHeight={25}
                toolbar={
                  <MyToolBar
                    enableFilter={true}
                    filterOpen={this.state.filterOpen}
                    customToggleFilter={this.customToggleFilter}
                  >
                    <button
                      className="closeIcon"
                      onClick={(e) => {
                        this.props.unMountDetailsModal();
                      }}
                      style={{ float: "right" }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>

                    {!isIE11 && (
                      <button
                        style={{ float: "right" }}
                        onClick={() => {
                          let fullScreen = FullScreen.getFullScreen();
                          if (fullScreen) {
                            FullScreen.closeFullscreen();
                          } else {
                            FullScreen.openFullscreen(this.fullScreen.current);
                          }
                        }}
                      >
                        {this.state.isFull ? (
                          <FontAwesomeIcon icon={faWindowMinimize} />
                        ) : (
                          // "Full Screen"
                          <FontAwesomeIcon icon={faClone} />
                        )}
                      </button>
                    )}

                    <span className="totalRows">
                      {rows ? rows.length : null} Rows
                    </span>
                    <span className="rowsSelected">
                      {this.state.selectedIndexes.length} {rowText} selected
                    </span>
                  </MyToolBar>
                }
                onAddFilter={(filter) => {
                  let filters = handleFilterChange(filter, this.state.filters);
                  this.setState({ filters });
                }}
                onClearFilters={() => this.setState({ filters: {} })}
                rowSelection={this.getRowSelection()}
                onGridSort={(sortColumn, sortDirection) => {
                  let { rows, selectedRows } = this.state;
                  let sortedRows = sortRows(sortColumn, sortDirection, rows);
                  let aferSortIndices = [];

                  if (this.state.rowCounter !== 0) {
                    sortedRows.forEach((sortedRow, index) => {
                      selectedRows.forEach((currentRow) => {
                        console.log(currentRow);
                        console.log(sortedRow);
                        if (currentRow.row === sortedRow) {
                          aferSortIndices.push(index);
                        }
                      });
                    });
                  }
                  let returnData = {
                    rowCounter: this.state.rowCounter,
                    selectedIndexes: aferSortIndices,
                    toggleAddGraph:
                      this.state.selectedIndexes > 0 ? false : true,
                  };

                  this.setState({ rows: sortedRows, ...returnData });
                }}
              />
            ) : this.state.rows && this.state.rows.length === 0 ? (
              this.noRowsFound()
            ) : null}
          </div>
        </Draggable>
      </div>
    );
  }
}

export default ModalWindowControl;
