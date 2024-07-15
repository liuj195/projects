import XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Data } from "react-data-grid-addons";

export const onRowsSelected = (
  rows,
  rowCounter,
  selectedIndexes,
  isFindByModal
) => {
  let toggleAddGraph = true;
  selectedIndexes = selectedIndexes.concat(rows.map((r) => r.rowIdx));
  rowCounter = rowCounter + rows.length;
  //find by does not allow adding/removing from graph
  if (!isFindByModal) {
    let addGraphButton = document.getElementsByClassName("addGraphButton");
    addGraphButton[0].style.display = "none";
  }
  return { rowCounter, selectedIndexes, toggleAddGraph };
};

export const onRowsDeselected = (rows, rowCounter, selectedIndexes) => {
  rowCounter = rowCounter - rows.length;
  let rowIndexes = rows.map((r) => r.rowIdx);
  selectedIndexes = selectedIndexes.filter((i) => rowIndexes.indexOf(i) === -1);
  let toggleAddGraph = true;
  //set state selected indexes, rowcounter
  //if rowcounter ===0 addgraph = false
  if (rowCounter === 0) {
    toggleAddGraph = false;
  }

  return { rowCounter, selectedIndexes, toggleAddGraph };
};

export const exportToExcel = (rows, nodeDetailsData) => {
  let wb = XLSX.utils.book_new();
  let date = new Date().toISOString().split("T")[0];
  wb.Props = {
    Title: "yK1 Excel data",
    Subject: "yK1",
    Author: "yK1",
    CreatedDate: date,
  };
  wb.SheetNames.push("yK1 Data");
  let ws_data = rows;
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
  let ws = XLSX.utils.json_to_sheet(ws_data);
  wb.Sheets["yK1 Data"] = ws;
  let title = nodeDetailsData.title + ".xlsx";
  let wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), title);
};
const s2ab = (s) => {
  var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
  var view = new Uint8Array(buf); //create uint8array as viewer
  for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
  return buf;
};
//
const sortAlphaNum = (a, b) => {
  var aA = a.replace(reA, "");
  var bA = b.replace(reA, "");
  if (aA === bA) {
    var aN = parseInt(a.replace(reN, ""), 10);
    var bN = parseInt(b.replace(reN, ""), 10);
    return aN === bN ? 0 : aN > bN ? 1 : -1;
  } else {
    return aA > bA ? 1 : -1;
  }
};
const convertToString = (alphanum) => {
  let dataPoint = alphanum;
  let returnData = isNaN(dataPoint) ? dataPoint : dataPoint.toString();
  return returnData;
};
let reA = /[^a-zA-Z]/g;
let reN = /[^0-9]/g;
export const sortRows = (sortColumn, sortDirection, rows) => {
  const comparer = (a, b) => {
    if (sortDirection === "ASC") {
      let aA = convertToString(a[sortColumn]).replace(reA, "");
      let bA = convertToString(b[sortColumn]).replace(reA, "");
      if (aA === bA) {
        let aN = parseInt(convertToString(a[sortColumn]).replace(reN, ""), 10);
        let bN = parseInt(convertToString(b[sortColumn]).replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
      } else {
        return aA > bA ? 1 : -1;
      }
      // return a[sortColumn] > b[sortColumn] ? 1 : -1;
    } else if (sortDirection === "DESC") {
      let aA = convertToString(a[sortColumn]).replace(reA, "");
      let bA = convertToString(b[sortColumn]).replace(reA, "");
      if (aA === bA) {
        let aN = parseInt(convertToString(a[sortColumn]).replace(reN, ""), 10);
        let bN = parseInt(convertToString(b[sortColumn]).replace(reN, ""), 10);
        return aN === bN ? 0 : aN < bN ? 1 : -1;
      } else {
        return aA < bA ? 1 : -1;
      }
      // return a[sortColumn] < b[sortColumn] ? 1 : -1;
    }
  };
  return sortDirection === "NONE" ? rows : [...rows].sort(comparer);
};
//

export const getRows = (rows, filters) => {
  let selectors = Data.Selectors;
  //let { rows, filters } = this.state;
  return selectors.getRows({ rows, filters });
};
export const handleFilterChange = (filter, filters) => {
  const newFilters = { ...filters };
  if (filter.filterTerm) {
    newFilters[filter.column.key] = filter;
  } else {
    delete newFilters[filter.column.key];
  }
  //this.setState({ filters: newFilters });
  return newFilters;
};
