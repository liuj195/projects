import React from "react";
import YK1 from "../../js/yk1/yk1";

const highCount = (nodeType, count) => {
  /**message =
      nodeType +
      " node count exceeds limit for file/graph\n" +
      nodeType +
      " Node Count: " +
      count; */
  return (
    <React.Fragment>
      {nodeType} node count is {count}. This exceeds the graph limit
      <br />
      <br />
      <div style={{ textAlign: "left" }}>
        <div style={{ paddingLeft: 50 }}>
          -Click Export for an Excel file of all the {nodeType}s.
        </div>
        <div style={{ paddingLeft: 50 }}>
          -Click Cancel to cancel this request.
        </div>
      </div>
      <br />
    </React.Fragment>
  );
};

const lowCount = (nodeType, count) => {
  return (
    <React.Fragment>
      {nodeType} node count is {count}, this will clutter the graph.
      <br />
      <br />
      <div style={{ textAlign: "left" }}>
        <div style={{ paddingLeft: 50 }}>-Click Graph to graph anyways.</div>
        <div style={{ paddingLeft: 50 }}>
          -Click Export for an Excel file of all the {nodeType}s.
        </div>
        <div style={{ paddingLeft: 50 }}>
          -Click Cancel to cancel this request.
        </div>
      </div>
      <br />
    </React.Fragment>
  );
};

const mediumCount = (nodeType, count) => {
  return (
    <React.Fragment>
      {nodeType} node count is {count}.<br />
      Would you like an Excel file instead?
      <br />
      <br />
      <div style={{ textAlign: "left" }}>
        <div style={{ paddingLeft: 50 }}>-Click Graph to graph anyways.</div>
        <div style={{ paddingLeft: 50 }}>
          -Click Export for an Excel file of all the {nodeType}s.
        </div>
        <div style={{ paddingLeft: 50 }}>
          -Click Cancel to cancel this request.
        </div>
      </div>
      <br />
    </React.Fragment>
  );
};

export const GenericModal = (props) => {
  /**
  NODE_FILE_LIMIT = 1000;
  NODE_GRAPH_LIMIT = 50;
  NODE_WARNING_LEVEL = 20;
  **/
  console.log("here");
  const closeModal = () => {
    let modalPopup = document.getElementById("modalPopup");
    modalPopup.parentNode.removeChild(modalPopup);
  };
  let { graphId, servletParams, sourceNodeXtin, taxYear, cy } = props.data;
  let nodeType = props.type;
  let count = props.count;
  //let count = data.length;
  let message = null;
  if (count > 1000) {
    message = highCount(nodeType, count);
  }
  if (count > 50 && count < 1000) {
    message = mediumCount(nodeType, count);
  }
  if (count < 50 && count > 20) {
    message = lowCount(nodeType, count);
  }

  return (
    <div
      style={{
        top: 0,
        left: 0,
        zIndex: 2,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: window.innerHeight,
        width: window.innerWidth,
        position: "absolute",
      }}
    >
      <div
        style={{
          top: "25%",
          position: "relative",
          margin: "auto",
          textAlign: "center",
          background: "white",
          width: 420,
          height: "auto",
          border: "1px solid grey",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            borderBottom: "1px solid lightgrey",
            padding: "3px",
          }}
        >
          Warning
        </div>
        <div style={{ padding: 5 }}>{message}</div>
        <div
          style={{
            textAlign: "center",
            padding: 5,
            borderTop: "1px solid lightgrey",
          }}
        >
          <button
            disabled={count > 1000 ? true : false}
            className="btn btn-lg text-center"
            type="submit"
            style={{
              backgroundColor: count > 1000 ? "grey" : "#2e8540",
              color: "white",
              borderRadius: "7px",
            }}
            onClick={() => {
              //re call address/prep nodes with isForced set to true
              servletParams = JSON.parse(servletParams);
              servletParams.isForced = true;
              servletParams = JSON.stringify(servletParams);
              if (nodeType === "Address") {
                YK1.getAddresses(
                  servletParams,
                  sourceNodeXtin,
                  taxYear,
                  graphId,
                  cy
                );
              } else if (nodeType === "Preparer") {
                YK1.getPreparers(servletParams, null, taxYear, graphId, cy);
              }
              closeModal();
            }}
          >
            Graph
          </button>
          <button
            className="btn btn-lg text-center"
            type="submit"
            style={{
              backgroundColor: "#2e8540",
              color: "white",
              borderRadius: "7px",
            }}
            onClick={() => {
              //re call address/prep nodes with isForced and send result to excel
              //send to excel
              servletParams = JSON.parse(servletParams);
              servletParams.isForced = true;
              servletParams = JSON.stringify(servletParams);
              if (nodeType === "Address") {
                YK1.getAddresses(
                  servletParams,
                  sourceNodeXtin,
                  taxYear,
                  graphId,
                  cy,
                  true
                );
              } else if (nodeType === "Preparer") {
                YK1.getPreparers(
                  servletParams,
                  null,
                  taxYear,
                  graphId,
                  cy,
                  true
                );
              }
              closeModal();
            }}
          >
            Export
          </button>
          <button
            className="btn btn-lg text-center"
            type="submit"
            style={{
              backgroundColor: "black",
              color: "white",
              borderRadius: "7px",
            }}
            onClick={() => {
              closeModal();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
