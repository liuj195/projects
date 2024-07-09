/**
 * some general utility functions
 */

const textUtilities = function(Y) {
  /*
   * Takes a number and adds in a comma as a separator
   * For example 1000000 becomes 1,000,000
   */
  Y.formatThousandSeparator = function(data) {
    var parts = data.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };
  Y.scrubChars = function(myString, toScrub, replaceWith) {
    var tins = myString;
    while (tins.search(toScrub) >= 0) {
      tins = myString.replace(toScrub, replaceWith);
    }

    return tins;
  };
  Y.padTin = function(tinToPad) {
    // while (tinToPad.length < 9) {
    //   tinToPad += "0" + tinToPad;
    // }
    while (tinToPad.length < 9) {
      tinToPad = "0" + tinToPad;
    }
    return tinToPad;
  };

  return Y;
};

export default textUtilities;
