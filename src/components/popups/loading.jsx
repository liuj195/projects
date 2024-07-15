import React from "react";

const Loading = props => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        textAlign: "center",
        zIndex: 100
      }}
      id="loadingDiv"
    >
      <div style={{ marginTop: "20%" }}>
        <div
          className="loader"
          style={{
            zIndex: 100,
            float: "none",
            margin: "auto",
            top: "50%"
          }}
        />
        <div style={{ float: "none", margin: "auto" }}>Loading...</div>
      </div>
    </div>
  );
};

export default Loading;
