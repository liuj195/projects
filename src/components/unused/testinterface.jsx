import React, { Component } from "react";
/**
 * This interface is not in use. It was created for Raul in order to pass
 * selected data to Srikar for testing
 */

class TestInterface extends Component {
  state = {
    value: "Enter Tin(s)"
  };
  handleRadio = e => {
    console.log(e.target.value);
    let radio = e.target.value;
    this.setState({ radio });
  };

  handleSubmit = e => {
    e.preventDefault();
    console.log(this.state.value);
    console.log(typeof this.state.value);
    let tinArray = this.state.value.split("\n");
    console.log(tinArray.length);
    console.log(tinArray);

    alert(" Tin(s): \n" + this.state.value);
  };
  handleHops = e => {
    let hops = e.target.value;
    this.setState({ hops });
  };
  handleChange = e => {
    let value = e.target.value;
    this.setState({ value });
  };
  handleNodes = e => {
    let nodes = e.target.value;
    this.setState({ nodes });
  };
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-sm-4" />
          <div className="mx-auto col-sm-4" style={{ marginTop: 130 }}>
            <ul className="list-inline " style={{ fontSize: 17 }}>
              <li className="text-center" style={{ padding: 20 }}>
                <form onSubmit={this.handleSubmit}>
                  <br />

                  <textarea
                    className="form-control"
                    name="textarea1"
                    style={{ width: 200 }}
                    rows="10"
                    onChange={this.handleChange}
                    value={this.state.value}
                  />
                  <br />
                  <br />
                  <button className="btn btn-lg" type="submit">
                    Submit
                  </button>
                </form>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default TestInterface;
