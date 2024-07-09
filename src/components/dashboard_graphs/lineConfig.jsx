import React from "react";
import { Chart } from "react-charts";
import useDemoConfig from "./useDemoConfig";
//import "./styles.css";

export default function LineChart() {
  const {
    data,
    tooltipAlign,
    tooltipAnchor,
    randomizeData,
    Options,
  } = useDemoConfig({
    series: 10,
    show: ["tooltipAlign", "tooltipAnchor"],
  });
  const axes = React.useMemo(
    () => [
      { primary: true, position: "bottom", type: "time" },
      { position: "left", type: "linear" },
    ],
    []
  );

  const tooltip = React.useMemo(
    () => ({
      align: tooltipAlign,
      anchor: tooltipAnchor,
    }),
    [tooltipAlign, tooltipAnchor]
  );
  return (
    <>
      {Options}
      <br />
      <button onClick={randomizeData}>Randomize Data</button>
      <br />
      <br />

      <Chart
        data={data}
        axes={axes}
        primaryCursor
        secondaryCursor
        tooltip={tooltip}
      />
    </>
  );
}
