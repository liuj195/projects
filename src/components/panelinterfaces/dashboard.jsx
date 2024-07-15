import React, { Component } from "react";
import Slider from "@material-ui/core/Slider";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import {
  Doughnut,
  Bar,
  Line,
  Radar,
  Pie,
  Bubble,
  Chart,
} from "react-chartjs-2";
import { Container, Row, Col } from "reactstrap";
import geoData2 from "./geoData2";
import { topojson } from "chartjs-chart-geo";
import ChartDataLabels from "chartjs-plugin-datalabels";
import data from "./labels.js";
import {
  data2021,
  data2020,
  data2019,
  data2018,
  data2017,
} from "./liveGeoData/liveGeoData";

//custom plugin to center text inside dougnut
Chart.plugins.register(ChartDataLabels);

Chart.pluginService.register({
  beforeDraw: function(chart) {
    if (chart.config.options.elements.center) {
      // Get ctx from string
      var ctx = chart.chart.ctx;

      // Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || "Arial";
      var txt = centerConfig.text;
      var color = centerConfig.color || "#000";
      var maxFontSize = centerConfig.maxFontSize || 75;
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);
      // Start with a base font of 30px
      ctx.font = "30px " + fontStyle;

      // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      var stringWidth = ctx.measureText(txt).width;
      var elementWidth = chart.innerRadius * 2 - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      var widthRatio = elementWidth / stringWidth;
      var newFontSize = Math.floor(30 * widthRatio);
      var elementHeight = chart.innerRadius * 2;

      // Pick a new font size so it will not be larger than the height of label.
      var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
      var minFontSize = centerConfig.minFontSize;
      var lineHeight = centerConfig.lineHeight || 25;
      var wrapText = false;

      if (minFontSize === undefined) {
        minFontSize = 20;
      }

      if (minFontSize && fontSizeToUse < minFontSize) {
        fontSizeToUse = minFontSize;
        wrapText = true;
      }

      // Set font settings to draw it correctly.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      ctx.font = fontSizeToUse + "px " + fontStyle;
      ctx.fillStyle = color;

      if (!wrapText) {
        ctx.fillText(txt, centerX, centerY);
        return;
      }

      var words = txt.split(" ");
      var line = "";
      var lines = [];

      // Break words up into multiple lines if necessary
      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > elementWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }

      // Move the center up depending on line height and number of lines
      centerY -= (lines.length / 2) * lineHeight;

      for (var n = 0; n < lines.length; n++) {
        ctx.fillText(lines[n], centerX, centerY);
        centerY += lineHeight;
      }
      //Draw text in center
      ctx.fillText(line, centerX, centerY);
    }
  },
});
class DashboardInterface extends Component {
  state = {
    doughnutYear: "2021",
    geoMapYear: "2021",
    geoData: data,
    chart3: {},
    geoChartData: {
      2021: data2021,
      2020: data2020,
      2019: data2019,
      2018: data2018,
      2017: data2017,
    },
    doughnutData: [
      { year: "2021", data: [6901447, 324343, 80622, 16845] },
      { year: "2020", data: [9731308, 470620, 123423, 36863] },
      { year: "2019", data: [9255181, 448246, 119735, 34508] },
      { year: "2018", data: [9953229, 496860, 124737, 34804] },
      { year: "2017", data: [9700083, 494690, 120465, 32737] },
    ],
    tenForty: [
      3307591,
      3421471,
      3258657,
      3300735,
      3305715,
      3271506,
      3443907,
      3360025,
      3572418,
      3405988,
      3208206,
      3401201,
      3330699,
      3309360,
      2971393,
      2908465,
      2172194,
    ],
    tenSixtyFive: [
      16136015,
      17266414,
      19779368,
      21484834,
      23055263,
      22605749,
      25448370,
      26947888,
      28464469,
      29934192,
      29169826,
      28447048,
      27959770,
      28589507,
      26401808,
      28377130,
      11584258,
    ],
    elevenTwentyS: [
      5936242,
      6675161,
      6992268,
      7076921,
      7095663,
      6887813,
      7159491,
      7226768,
      7230856,
      7433668,
      7556377,
      7683043,
      7875966,
      8002760,
      7625720,
      7656722,
      5291899,
    ],
    data2: [
      {
        label: "Series 1",
        data: [[0, 1], [1, 2], [2, 4], [3, 2], [4, 7]],
      },
      {
        label: "Series 2",
        data: [[0, 3], [1, 1], [2, 5], [3, 6], [4, 4]],
      },
    ],
    axes: [
      { primary: true, type: "linear", position: "bottom" },
      { type: "linear", position: "left" },
    ],
  };
  constructor(props) {
    super(props);
    // console.log(props);
    //this.state.msg = props.msg;
    console.log(this.state.elevenTwentyS);
    let cumulative = [];
    for (let i = 0; i < this.state.elevenTwentyS.length; i++) {
      cumulative.push(
        this.state.elevenTwentyS[i] +
          this.state.tenForty[i] +
          this.state.tenSixtyFive[i]
      );
    }
    this.state.cumulative = cumulative;
  }
  getDataSet = () => {
    let { doughnutData, doughnutYear } = this.state;
    let returnArray = [];

    doughnutData.forEach((item) => {
      if (doughnutYear === item.year) {
        returnArray = item.data;
      }
    });

    return [...returnArray];
  };

  componentDidMount() {
    //example 2
    const states2 = topojson.feature(geoData2, geoData2.objects.states)
      .features;

    const chart3 = new Chart(
      document.getElementById("canvas3").getContext("2d"),
      {
        type: "bubbleMap",
        data: {
          labels: data2019.map((d) => d.name),
          datasets: [
            {
              label: "Partnerships",
              outline: states2,
              backgroundColor: "steelblue",
              // data: this.getGeoDataSet(data2),
              data: data2019,
            },
          ],
        },

        options: {
          // title: {
          //   align: "bottom",
          //   display: "false",
          //   text: "K-1 Payer Distribution",
          //   color: "black",
          // },
          legend: {
            display: false,
            //fullWidth: true,

            position: "right",
            labels: {
              boxWidth: 30,
              padding: 5,
              // fontColor: "red",
              // usePointStyle: true,
              // fontSize: 39,
              // generateLabels: function(value) {
              //   // console.log(value);
              //   // console.log(value.legend);
              //   // console.log(value.legend.legendItems);
              //   return value.legend.legendItems;
              //   //return value;
              // },
            },
          },

          plugins: {
            datalabels: {
              align: "top",
              formatter: (v) => {
                return v.description;
              },
              color: "black",
              labels: {
                title: {
                  font: {
                    weight: "bold",
                  },
                },
                // value: {
                //   color: "green",
                // },
              },
            },
          },

          geo: {
            radiusScale: {
              display: false,
              //color: "orange",
            },
            // colorScale: {
            //   display: true,
            // },
          },
        },
      }
    );
    console.log(chart3);
    this.setState({ chart3 });
  }
  valuetext = (value) => {
    return `${value}°C`;
  };

  render() {
    let IRSDivisionLabels = ["3000", "2000", "400", "200"];
    const states2 = topojson.feature(geoData2, geoData2.objects.states)
      .features;
    const marks = [
      {
        value: 2017,
        label: "2017",
      },
      {
        value: 2018,
        label: "2018",
      },
      {
        value: 2019,
        label: "2019",
      },
      {
        value: 2020,
        label: "2020",
      },
      {
        value: 2021,
        label: "2021*",
      },
    ];
    let geoHeight = null;
    if (document.getElementsByClassName("geoMapDiv")[0]) {
      geoHeight = document.getElementsByClassName("geoMapDiv")[0].clientHeight;
      console.log(geoHeight);
    }
    return (
      <div
        className="use-bootstrap"
        style={{ margin: 230, marginTop: 0, marginBottom: 0 }}
      >
        <Container style={{ padding: 0, margin: 0, display: "inline" }}>
          <h3 style={{ textAlign: "center", margin: 0 }}>yK1 Statistics</h3>

          <Row>
            <Col
              xs="6"
              style={{
                border: "1px solid darkgrey",
                borderTop: "none",
                borderLeft: "none",
              }}
            >
              <ul style={{ paddingTop: 30 }}>
                <li>
                  Number of yK1 Application Suite users:{" "}
                  <span style={{ fontWeight: "bold" }}>4665</span>
                </li>
                <li>yK1 Data Sets Available: TY2005 -{">"} TY2021 </li>
                <li>
                  Asterisk (<b>&#42;</b>) indicates partial year, through
                  09/02/22
                </li>
              </ul>
            </Col>
            <Col
              xs="6"
              style={{
                border: "1px solid darkgrey",
                borderTop: "none",
                borderRight: "none",
              }}
            >
              <div style={{ height: 255, width: "90%" }}>
                {/* 1120S = 67;
              1065 = 65
              1040 = 66 */}
                <Bar
                  data={{
                    datasets: [
                      {
                        label: "1120S",
                        borderColor: "red",
                        backgroundColor: "rgba(100, 100, 200, 0)",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        type: "line",
                        data: this.state.elevenTwentyS,
                      },
                      {
                        label: "1040",
                        borderColor: "green",
                        backgroundColor: "rgba(100, 100, 200, 0)",
                        pointHighlightStroke: "rgba(151,187,205,1)",
                        type: "line",
                        data: this.state.tenForty,
                      },
                      {
                        label: "1065",
                        borderColor: "blue",
                        backgroundColor: "rgba(100, 100, 200, 0)",
                        pointHighlightStroke: "rgba(151,187,205,1)",
                        type: "line",
                        data: this.state.tenSixtyFive,
                      },
                      {
                        label: "Cumulative",
                        backgroundColor: "rgb(138,43,226,.3)",
                        data: this.state.cumulative,
                      },
                    ],
                    labels: [
                      "2005",
                      "2006",
                      "2007",
                      "2008",
                      "2009",
                      "2010",
                      "2011",
                      "2012",
                      "2013",
                      "2014",
                      "2015",
                      "2016",
                      "2017",
                      "2018",
                      "2019",
                      "2020",
                      "2021*",
                    ],
                  }}
                  // width={100}
                  // height={100}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    title: {
                      display: "true",
                      text: "K1-Trends",
                    },
                    plugins: {
                      datalabels: {
                        display: false,
                      },
                    },
                    scales: {
                      yAxes: [
                        {
                          display: true,
                          ticks: {
                            //suggestedMin: 4000000, // minimum will be 0, unless there is a lower value.
                            // OR //
                            beginAtZero: true, // minimum value will be 0.
                            // suggestedMax: 17000000,
                          },
                        },
                      ],
                    },
                  }}
                />
              </div>
            </Col>
          </Row>

          <Row>
            <Col
              xs="6"
              style={{
                border: "1px solid darkgrey",
                borderBottom: "none",
                borderLeft: "none",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  paddingTop: 10,
                  fontWeight: "bold",
                  color: "grey",
                  fontSize: 13,
                  fontFamily:
                    "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                }}
              >
                K-1 Payer Distribution
              </div>
              <div className="geoMapDiv">
                <canvas id="canvas3" />
              </div>
              <div>
                <Slider
                  orientation="horizontal"
                  defaultValue={2021}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  getAriaValueText={this.valuetext}
                  max={2021}
                  min={2017}
                  step={1}
                  marks={marks}
                  onChangeCommitted={(event, value) => {
                    let dataSet = this.state.geoChartData[value];
                    console.log(dataSet);
                    let chart3 = this.state.chart3;

                    chart3.data.datasets = [
                      {
                        label: "Partnerships",
                        outline: states2,
                        backgroundColor: "steelblue",
                        data: dataSet,
                      },
                    ];
                    chart3.update();
                  }}
                />
              </div>
            </Col>
            <Col
              xs="6"
              style={{
                border: "1px solid darkgrey",
                borderBottom: "none",
                borderRight: "none",
              }}
            >
              <div>
                <Doughnut
                  data={{
                    labels: ["< 5", "6-15", "16-50", "> 50"],
                    datasets: [
                      {
                        label: "My First dataset",
                        backgroundColor: [
                          "rgba(255, 99, 132)",
                          "rgba(54, 162, 235)",
                          "rgba(255, 206, 86)",
                          "rgba(75, 192, 192)",
                        ],
                        borderColor: "Black",
                        data: this.getDataSet(),
                      },
                    ],
                  }}
                  // height={}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,

                    plugins: {
                      datalabels: {
                        display: false,
                        // align: "top",
                        // formatter: (v) => {
                        //   return v.description;
                        // },
                        color: "black",
                        labels: {
                          title: {
                            font: {
                              weight: "bold",
                            },
                          },
                          // value: {
                          //   color: "green",
                          // },
                        },
                      },
                    },
                    elements: {
                      center: {
                        text: this.state.doughnutYear,
                        color: "#FF6384", // Default is #000000
                        fontStyle: "Arial", // Default is Arial
                        sidePadding: 20, // Default is 20 (as a percentage)
                        minFontSize: 25, // Default is 20 (in px), set to false and text will not wrap.
                        lineHeight: 25, // Default is 25 (in px), used for when text wraps
                      },
                    },
                    //textDirection: "ltr",
                    //display: false,
                    title: {
                      display: "true",
                      text: "Number of Investors in Pass Through Entity",
                    },
                  }}
                />
              </div>
              <div style={{ paddingTop: 25 }}>
                <Slider
                  orientation="horizontal"
                  defaultValue={2021}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  getAriaValueText={this.valuetext}
                  max={2021}
                  min={2017}
                  step={1}
                  marks={marks}
                  onChangeCommitted={(event, value) => {
                    let doughnutYear = value.toString();
                    this.setState({ doughnutYear });
                  }}
                />
              </div>
            </Col>
          </Row>

          <div style={{ position: "absolute", top: 0, right: 0 }}>
            yK1 Version {window.yk1Version}
          </div>

          <div style={{ position: "absolute", top: 20, right: 0 }}>
            <a
              style={{ color: "#007bff" }}
              onClick={() => {
                window.open(
                  "https://yk1.web.irs.gov/yk1/SupplementalFiles/release_notes.pdf"
                );
              }}
            >
              Release Notes
            </a>
          </div>
        </Container>
      </div>
    );
  }
}

export default DashboardInterface;
