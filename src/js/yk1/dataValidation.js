const dataValidation = function(Y) {
  Y.msieversion = function() {
    let isIE = false;

    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
      isIE = true;
    }
    return isIE;
  };
  //positive, negative, exactly one decimal point allowed, can go to 2 decimal places
  Y.posNegTwoDecimal = /^[-\d]*\.?[0-9]?[0-9]?$/;

  //digits and decimals
  Y.digitsDecimal = /^\d*\.?\d*$/;

  //digits, spaces, dashes,and empty string
  Y.matchDigitsSpaces = /^[-\s\d]*$/;

  //digits
  Y.matchDigits = /^[\d]*$/;

  //digits and spaces upper and lower case X dashes
  Y.matchDigitsSpacesXx = /^[-xX\s\d]*$/;

  //minimum length validation
  Y.maximumLength = function(value, validLength) {
    let isValid = true;
    let values = value.split("\n");
    values.forEach(item => {
      if (item.length > validLength) isValid = false;
    });
    return isValid;
  };
  //number or decimal is between 0 and 100 and can be decimal. equals 0 or 100 OK
  Y.isPercentage = function(value) {
    let originalValue = value;
    let numDecimals = value.split(".");
    //need to remove non emptys,numbers or decimals
    value = parseFloat(value);
    //allows us to delete the zero placeholder and return an empty string
    if (value.length === 0 || originalValue === "") {
      return "";
    }
    //only numbers between 0 and 100 and can only contain maximum 1 decimal
    if (
      value >= 0 &&
      value <= 100 &&
      numDecimals.length <= 2 &&
      !isNaN(originalValue)
    ) {
      return value;
    }
    if (originalValue === ".") {
      return originalValue;
    }
  };
  //splits at decimal and counts decimal places to see if they are at or below maxDecimal.
  Y.maxDecimalAllowed = function(value, maxDecimal) {
    let afterDecimal = value.split(".");
    let hasDecimal = value.indexOf(".") >= 0 ? true : false;

    if (!hasDecimal || afterDecimal.length === 1) {
      return true;
    } else if (hasDecimal && afterDecimal[1].length <= maxDecimal) {
      return value;
    }
  };
  //exact pattern match yK1 tin input
  // XXXXXXXXX XXXXXX  first character can be either upper or lower case x
  Y.validTinForms = function(input) {
    let inputMatchA = /\d\d\d\d\d\d\d\d\d/;
    let inputMatchB = /X\d\d\d\d\d\d\d\d/;
    let inputMatchC = /x\d\d\d\d\d\d\d\d/;
    if (
      inputMatchA.test(input) ||
      inputMatchB.test(input) ||
      inputMatchC.test(input)
    ) {
      return true;
    }
    console.log("Invalid Form");
    return false;
  };

  //TST validation. Checks tin form, length and also period/year form and length
  Y.tstValidateLengthandForm = function(value) {
    let returnObj = {
      isValid: true,
      err: null
    };

    let values = value.split("\n");
    console.log(value);
    for (let i = 0; i < values.length; i++) {
      let splitValue = values[i].split(" ");

      if (splitValue[0]) {
        //scrub and pad
        //console.log("here");
        let tin = Y.scrubTins(splitValue[0]);
        tin = Y.parseTins(tin);
        tin = tin[0];

        if (tin.length > 9) {
          returnObj.isValid = false;
          returnObj.err = document.defaultView.errorList.tinLength + (i + 1);
          break;
        }
        if (!Y.validTinForms(tin)) {
          returnObj.isValid = false;
          returnObj.err = document.defaultView.errorList.tinForm + (i + 1);
          break;
        }
      } else {
        break;
      }
      if (splitValue[1]) {
        if (
          !Y.isValidTimePeriod(splitValue[1]) &&
          !Y.isValidYear(splitValue[1])
        ) {
          returnObj.isValid = false;
          returnObj.err =
            document.defaultView.errorList.invalidPeriod + (i + 1);
          break;
        }
      } else {
        returnObj.isValid = false;
        returnObj.err = document.defaultView.errorList.invalidPeriod + (i + 1);
        break;
      }
    }
    return returnObj;
  };

  //YK1 validation. Checks tin form and length
  Y.yK1validateLengthandForm = function(values, validLength) {
    let returnObj = {
      isValid: true,
      err: null
    };

    for (let i = 0; i < values.length; i++) {
      let trimmedValue = values[i].trim();
      if (trimmedValue === "") continue;
      if (trimmedValue.length !== validLength) {
        returnObj.isValid = false;
        returnObj.err = document.defaultView.errorList.tinLength + (i + 1);
        break;
      }
      if (!Y.validTinForms(trimmedValue)) {
        returnObj.isValid = false;
        returnObj.err = document.defaultView.errorList.tinForm + (i + 1);
        break;
      }
    }

    return returnObj;
  };

  Y.isValidTimePeriod = function(timePeriod) {
    //substring issue
    console.log(timePeriod);
    //if year just return out
    if (timePeriod.length === 4) return true;
    if (timePeriod.length !== 6) {
      console.log("Invalid timePeriod length");
      return false;
    }
    let year = timePeriod.substring(0, 4);
    let period = timePeriod.substring(4);
    if (Y.isValidYear(year) && Y.isValidPeriod(period)) return true;
    console.log("Invalid timePeriod");
    return false;
  };

  Y.isValidLength = function(item, validLength) {
    if (item.length === validLength) return true;
    console.log("Invalid length");
    return false;
  };

  Y.isValidYear = function(year) {
    let isValid = false;
    //console.log(parseInt(year, 10) === 2015);
    Y.taxYears.forEach(item => {
      if (item.taxYear === year) {
        isValid = true;
      }
    });
    if (!isValid) console.log("Invalid Year");
    return isValid;
  };

  Y.isValidPeriod = function(period) {
    if (parseInt(period) < 13) return true;
    console.log("Invalid Period");
    return false;
  };
  Y.filterDashes = function(array) {
    array = array.split("\n");
    array = array.map(item => {
      return item.replace(/-/g, "");
    });
    array = array.join("\n");
    return array;
  };
  // tinList - String of TINs
  Y.scrubTinsTaxPeriods = function(tinTaxValue) {
    tinTaxValue = tinTaxValue.replace(/ /g, "|"); // replace spaces with new pipe
    tinTaxValue = tinTaxValue.replace(/\t/g, "|"); // replace tabs with pipe
    tinTaxValue = tinTaxValue.replace(/\r/g, "|"); // replace Carriage Feed with pipe
    tinTaxValue = tinTaxValue.replace(/\f/g, "|"); // replace Form Feed with pipe
    tinTaxValue = tinTaxValue.replace(/\n/g, "|"); // replace new line with pipe
    tinTaxValue = tinTaxValue.replace(/\,/g, "|"); // replace comma with pipe
    tinTaxValue = tinTaxValue.replace(/\~/g, "|"); // replace ~ with pipe (TST copy and Paste)
    tinTaxValue = tinTaxValue.replace(/[a-wA-WyzYZ]/g, ""); // remove all lettters but xX

    return tinTaxValue;
  };

  Y.scrubTins = function(tinTaxValue) {
    // javascript replace only works on the first of the occurrence
    tinTaxValue = tinTaxValue.replace(/ /g, "|"); // replace spaces with new pipe
    tinTaxValue = tinTaxValue.replace(/\t/g, "|"); // replace tabs with pipe
    tinTaxValue = tinTaxValue.replace(/\r/g, "|"); // replace Carriage Feed with pipe
    tinTaxValue = tinTaxValue.replace(/\f/g, "|"); // replace Form Feed with pipe
    tinTaxValue = tinTaxValue.replace(/\n/g, "|"); // replace new line with pipe
    tinTaxValue = tinTaxValue.replace(/\,/g, "|"); // replace comma with pipe
    tinTaxValue = tinTaxValue.replace(/\-/g, "|"); // replace dash with pipe
    tinTaxValue = tinTaxValue.replace(/\~/g, "|"); // replace ~ with pipe (TST copy and Paste)
    tinTaxValue = tinTaxValue.replace(/[a-wA-WyzYZ]/g, ""); // remove all lettters but xX

    return tinTaxValue;
  };

  // tins - an array of tins
  Y.parseTins = function(tins) {
    var tmpTinArray = tins.split("|");
    if (tmpTinArray.length === 1) {
      tmpTinArray = tmpTinArray[0].split("\n");
    }
    var tmpTin = "";
    for (var i = 0; i < tmpTinArray.length; i++) {
      tmpTin = tmpTinArray[i];

      if (tmpTin.length > 0) {
        //Add zeros if needed to satisfy length requirement
        tmpTin = Y.padTin(tmpTin);
        //tinArray.push(tmpTin);
        tmpTinArray[i] = tmpTin;
      }
    }

    //return tinArray;
    return tmpTinArray;
  };

  // validate a single TIN
  Y.validateTin = function(tin) {
    if (tin.length > 9) return false;

    //if (tin === "" || )

    return true;
  };

  return Y;
};

export default dataValidation;
