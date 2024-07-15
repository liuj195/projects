// /**
//  * Tin Type Select button for populating tin Types input into text area
//  */

// <div className="text-center tintypebutton">
// <button
//   style={{ backgroundColor: "#d6d7d9" }}
//   className="btn"
//   onClick={() => this.handleTinTypeSelect()}
// >
//   Tin Type Select
// </button>
// </div>

// /**
//  * Used along with Tin Type Select button to populate tin types
//  */
// <div className="col-sm-3" style={{ marginTop: "5%", marginLeft: "4%" }}>
//   {this.state.tinTypes.map((types, index) => (
//     <TinTypeSelect
//       tinType={types}
//       key={index}
//       value={types}
//       onCloseTinType={this.handleCloseTinType}
//       onChangeTinType={this.handleChangeTinType}
//     />
//   ))}
//   <div className="text-center">
//     <br />
//     <button
//       className="btn"
//       style={{ backgroundColor: "#d6d7d9" }}
//       onClick={this.handleAddTinType}
//     >
//       Add Tin
//     </button>
//   </div>
// </div>;

// /**
//  * handler for populating tin types
//  */
// handleTinTypeSelect() {
//     let value = this.state.value;
//     console.log(value);
//     let tinTypes = value.split("\n");
//     this.setState({ tinTypes });
//   }
