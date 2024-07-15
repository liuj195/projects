import React, { Component } from "react";

class Magnifier extends Component {
  state = {
    height: null,
    zoom: 2,
    radius: 200,
    isActive: true,
    widthScale: null,
    heightScale: null
  };
  constructor(props) {
    super(props);
    let main = document.getElementsByTagName("canvas")[2];
    this.state.height = main.style.height;
    let width = props.html2Canvas.width;
    let height = props.html2Canvas.height;
    let widthScale = width / window.innerWidth;
    let heightScale = height / window.innerHeight;
    this.state.widthScale = widthScale;
    this.state.heightScale = heightScale;
  }
  componentDidMount() {
    let magnifierDiv = document.getElementById("magnifierDiv");
    magnifierDiv.appendChild(this.props.html2Canvas);
  }

  toggleRadius = e => {
    this.setState({ radius: e.target.value });
  };
  toggleZoom = e => {
    this.setState({ zoom: e.target.value });
  };

  magnifierMouseOut = e => {
    let zoom = document.getElementById("zoom");
    zoom.style.display = "none";
  };
  magnifierMouseMove = e => {
    let radius = this.state.radius;
    let main = document.getElementById("magniferCanvas");
    let zoom = document.getElementById("zoom");
    zoom.style.cursor = "none";
    let zoomCtx = zoom.getContext("2d");
    zoomCtx.fillStyle = "white";
    zoomCtx.fillRect(0, 0, zoom.width, zoom.height);

    zoomCtx.drawImage(
      main,
      e.pageX * this.state.widthScale - 30,
      e.pageY * this.state.heightScale - 60,
      radius,
      radius,
      0,
      0,
      radius * this.state.zoom,
      radius * this.state.zoom
    );
    zoom.style.top = e.pageY - radius + "px";
    zoom.style.left = e.pageX - radius / 2 + "px";
  };
  render() {
    return (
      <div>
        <div
          className="usa-grid"
          style={{
            top: 0,
            width: "100% !important",
            height: 95,
            zIndex: 2,
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0.4)"
          }}
        />

        <div
          className="usa-grid "
          id="magnifierDiv"
          style={{
            padding: 20,
            paddingTop: 6,
            top: 95,
            width: "100% !important",
            height: this.state.height,
            zIndex: 2,
            position: "absolute",
            backgroundColor: "rgba(0, 0, 0, 0)"
          }}
          onMouseMove={e => {
            if (e.pageY > 200) {
              if (this.state.isActive) this.magnifierMouseMove(e);
              else {
                let zoom = document.getElementById("zoom");
                zoom.style.cursor = "none";
                zoom.style.display = "block";
                this.setState({ isActive: true });
              }
            } else {
              if (!this.state.isActive) return;
              else {
                let zoom = document.getElementById("zoom");
                zoom.style.display = "none";
                zoom.style.cursor = "pointer";
                this.setState({ isActive: false });
              }
            }
          }}
        >
          <canvas
            id="zoom"
            width={this.state.radius}
            height={this.state.radius}
            style={{ position: "absolute", top: 0, left: 0 }}
          />

          <div
            style={{
              position: "absolute",
              backgroundColor: "white",
              left: "40%"
            }}
          >
            <div
              style={{
                border: "2px solid grey"
              }}
            >
              <div style={{ padding: 10, textAlign: "center" }}>
                Magnifier Options
              </div>

              <div
                style={{
                  display: "inline-block",
                  textAlign: "left",
                  padding: 5
                }}
              >
                <span>Zoom:</span>
              </div>
              <div style={{ display: "inline-block", margin: 0 }}>
                <input
                  type="range"
                  name="zoomSlider"
                  value={this.state.zoom}
                  min="1"
                  max="5"
                  step=".1"
                  onChange={this.toggleZoom}
                  style={{
                    marginLeft: "10%",
                    marginTop: "-12px",
                    width: 100
                  }}
                />
              </div>
              <div
                style={{
                  display: "inline-block",
                  width: 15,
                  padding: 10,
                  paddingRight: 25
                }}
              >
                <label htmlFor="zoomSlider">{this.state.zoom}</label>
              </div>

              <div
                style={{
                  display: "inline-block",
                  textAlign: "left",
                  padding: 5
                }}
              >
                <label htmlFor="radiusSlider">Radius: </label>
              </div>
              <div
                style={{
                  display: "inline-block",
                  margin: 0,
                  paddingBottom: 10
                }}
              >
                <input
                  type="range"
                  name="radiusSlider"
                  value={this.state.radius}
                  min="100"
                  max="400"
                  onChange={this.toggleRadius}
                  style={{
                    marginLeft: "10%",
                    marginTop: "-12px",
                    width: 100
                  }}
                />
              </div>
              <div style={{ display: "inline-block", padding: 10 }}>
                <label htmlFor="radiusSlider">{this.state.radius}</label>
              </div>
            </div>
          </div>
          <button
            style={{
              right: 0,
              top: 2,
              backgroundColor: "red",
              position: "absolute",
              height: 40
            }}
            onClick={() => this.props.exitMagnifier()}
          >
            Exit Magnifier
          </button>
        </div>
      </div>
    );
  }
}

export default Magnifier;
