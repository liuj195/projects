import React, { Component } from "react";
import YK1 from "../../js/yk1/yk1";
import ReactDataGrid from "react-data-grid";
import { Toolbar, Data } from "react-data-grid-addons";
import XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ToolBarWrapper } from "../hoc/toolbarWrapper";
import TreeViewComp from "../materialUI/treeview";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//<FontAwesomeIcon icon={faArrowRight} />

const DataFieldsBanner = function({ breadCrumbString }) {
  return (
    <div
      style={{
        fontWeight: "bold",
        fontSize: "2rem",
        float: "left",
        marginTop: 7,
        maxWidth: "50%",
      }}
    >
      Data Fields:
      <span style={{ fontWeight: "normal" }}> {breadCrumbString} </span>
    </div>
  );
};

class RTFtab extends Component {
  state = {
    selectedButton: "1065",
    rows: null,
    cols: null,
    filters: {},
    currentForm: 0,
    treeComp: null,
    filterOpen: false,
    breadCrumbString: "Breadcrumb Placeholder..",
  };
  constructor(props) {
    super(props);
    this.state.formList = props.data.formList;
    let treeObject = this.formTree();
    this.state.treeObject = treeObject;
  }
  componentDidMount() {
    this.openForm(this.state.currentForm);
  }
  updateBreadCrumb = (breadCrumbString) => {
    let newBreadCrumbString = breadCrumbString.title;
    if (breadCrumbString.parent) {
      newBreadCrumbString = (
        <React.Fragment>
          {breadCrumbString.parent + " "}
          <FontAwesomeIcon icon={faArrowRight} />
          {" " + newBreadCrumbString}
        </React.Fragment>
      );
    }
    this.setState({ breadCrumbString: newBreadCrumbString });
  };
  formTree = () => {
    let { formList } = this.props.data;
    let treeObject = [];
    formList.forEach((item, index) => {
      let isAlphaNumeric = /^[a-z0-9]+$/i;
      if (item.title[0].match(isAlphaNumeric)) {
        //parent node
        treeObject.push({ title: item.title, id: index, children: [] });
      } else {
        //child node
        treeObject[treeObject.length - 1].children.push({
          title: item.title.trim(),
          id: index,
        });
      }
    });
    return treeObject;
  };
  getRows = () => {
    let selectors = Data.Selectors;
    let { rows, filters } = this.state;
    return selectors.getRows({ rows, filters });
  };
  handleFilterChange = (filter) => {
    const newFilters = { ...this.state.filters };
    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }
    this.setState({ filters: newFilters, filterOpen: true });
  };
  openForm = (index) => {
    this.closeFilterOption();
    let formList = this.state.formList;
    var gridCols = [];
    gridCols.push({
      width: 170,
      key: "Field",
      name: "Field",
      resizable: true,
      filterable: true,
    });
    //console.log(document.getElementById("nav" + index));
    var form = formList[index];
    var formYear = form.year;

    for (var i in formYear) {
      gridCols.push({
        key: formYear[i],
        name: formYear[i],
        resizable: true,
        // sortable: true,
        filterable: true,
      });
    }
    let gridData = this.getGridData(form);
    //console.log(gridData);
    // handle the data rows
    this.setState({
      rows: gridData,
      cols: gridCols,
    });
  };
  closeFilterOption = () => {
    //manually traverse to get filter button and click it close on form change
    let filterElements = document.getElementsByClassName("form-group");
    let toolBar = document.getElementsByClassName("tools");
    let filterButton = null;
    if (toolBar.length) {
      filterButton = document.getElementsByClassName("tools")[0].childNodes[0];
    }

    if (filterElements.length) {
      if (filterButton) {
        filterButton.click();
        this.setState({ filterOpen: false });
      }
    }
  };
  customToggleFilter = () => {
    let filterOpen = this.state.filterOpen;

    this.setState({ filterOpen: !filterOpen });
  };
  sortRows = (sortColumn, sortDirection) => {
    let rows = this.state.rows;
    const comparer = (a, b) => {
      if (sortDirection === "ASC") {
        return a[sortColumn] > b[sortColumn] ? 1 : -1;
      } else if (sortDirection === "DESC") {
        return a[sortColumn] < b[sortColumn] ? 1 : -1;
      }
    };
    return sortDirection === "NONE" ? rows : [...rows].sort(comparer);
  };
  getGridData = (form) => {
    let formRowList = form.rowList;
    let formYear = form.year;
    let gridData = [];
    for (var i in formRowList) {
      var rowData = formRowList[i].data;
      var fieldName = formRowList[i].fieldName;
      var dataValues = rowData.split(YK1.DELIMITER);
      // first column is the field name
      var row = {
        Field: fieldName, //.replace(" ", "&nbsp;")
      };
      // remaining columns are values for each year
      for (var j in dataValues) {
        var thisYear = "" + formYear[j];
        row[thisYear] = dataValues[j] === "null" ? "" : dataValues[j].trim();
      }
      // need to push name/value pair
      gridData.push(row);
    }
    return gridData;
  };
  exportToExcel = () => {
    let dataToExport = this.state.formList;
    var wb = XLSX.utils.book_new();
    var date = new Date().toISOString().split("T")[0];
    wb.Props = {
      Title: "yK1 Excel data",
      Subject: "yK1",
      Author: "yK1",
      CreatedDate: date,
    };

    for (let i = 0; i < dataToExport.length; i++) {
      let ws_name = dataToExport[i].title;
      let ws_data = this.getGridData(dataToExport[i]);
      let headers = this.getRowHeaders(ws_data);
      //ws_data = this.reverseRows(ws_data);
      if (wb.SheetNames.indexOf(ws_name) > -1) {
        ws_name = ws_name + i;
      }
      if (ws_name.length > 31) ws_name = ws_name.slice(0, 31);
      wb.SheetNames.push(ws_name);
      //I dont know why but somewhere an undefined column is being added
      ws_data = ws_data.map((obj) => {
        let newObj = {};
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (key !== "undefined") {
              //if its a number, convert it to number using parsefloat
              if (!isNaN(obj[key]) && obj[key].length > 0) {
                obj[key] = parseFloat(obj[key]);
              }
              newObj[key] = obj[key];
            }
          }
        }
        return newObj;
      });
      var ws = XLSX.utils.json_to_sheet(
        ws_data,
        headers ? { header: headers } : null
      );
      wb.Sheets[ws_name] = ws;
    }
    let title = "yK1RTFdata.xlsx";
    var wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    saveAs(
      new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }),
      title
    );
  };
  getRowHeaders = (ws_data) => {
    let headers = [];
    let firstRow = ws_data[0];
    for (let key in firstRow) {
      if (firstRow.hasOwnProperty(key)) {
        if (key && key !== "undefined") headers.push(key);
      }
    }
    headers = headers.reverse();
    return headers;
  };

  s2ab = (s) => {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf); //create uint8array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
    return buf;
  };

  render() {
    let { cols, rows, filters } = this.state;
    const filteredRows = this.getRows(rows, filters);
    let height = window.innerHeight * 0.83;

    const MyToolBar = ToolBarWrapper(
      null,
      null,
      Toolbar,
      null,
      this.exportToExcel,
      null,
      {},
      [],
      true
    );

    return (
      <React.Fragment>
        <div className="usa-grid">
          <div className="usa-width-one-whole" style={{ border: "1px solid" }}>
            <div
              className="usa-width-one-sixth"
              style={{
                borderRight: "1px solid",
                width: "15%",
              }}
            >
              <div
                style={{
                  padding: "13px",
                  borderBottom: "1px solid black",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "2rem",
                }}
              >
                Forms
              </div>
              <div
                style={{
                  height: "100%",
                  marginRight: 0,
                  overflow: "auto",
                }}
              >
                <TreeViewComp
                  updateBreadCrumb={this.updateBreadCrumb}
                  treeObject={this.state.treeObject}
                  openForm={this.openForm}
                  height={height}
                />
              </div>
            </div>
            <div
              className="usa-width-five-sixths"
              id="rtfContainer"
              style={{ width: "85%" }}
            >
              {this.state.rows ? (
                <ReactDataGrid
                  rowHeight={25}
                  columns={cols}
                  rowGetter={(i) => filteredRows[i]}
                  rowsCount={filteredRows.length}
                  toolbar={
                    <MyToolBar
                      enableFilter={true}
                      filterOpen={this.state.filterOpen}
                      customToggleFilter={this.customToggleFilter}
                    >
                      <DataFieldsBanner
                        breadCrumbString={this.state.breadCrumbString}
                      />
                    </MyToolBar>
                  }
                  onAddFilter={(filter) => this.handleFilterChange(filter)}
                  onClearFilters={() => this.setState({ filters: {} })}
                  minHeight={height - 48}
                  // onGridSort={(sortColumn, sortDirection) => {
                  //   let sortedRows = this.sortRows(sortColumn, sortDirection);
                  //   this.setState({ rows: sortedRows });
                  // }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default RTFtab;
