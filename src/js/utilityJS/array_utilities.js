/**
 * general utitlity functions for array
 */
const arrayUtils = function(U) {
	/*
	 * Given an array, finds a particular key based on the value
	 */
	U.getKeyFromValue = function(myArray, value) {
		for (var key in myArray) {
			if (myArray.hasOwnProperty(key)) {
				if (value === myArray[key].value)
					return key;
			}
		}
	};

	U.getItemArrayIndex = function(myArray, value) {
		var index = -1;

		for (var i in myArray) {
			if (myArray[i] === value)
				index = i;
		}

		return index;
	};
	return U;
}

export default arrayUtils;