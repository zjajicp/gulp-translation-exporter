'use strict';

function toSmall(charCode) {
  return String.fromCharCode(charCode + 32);
}

function toCapital(charCode) {
  return String.fromCharCode(charCode - 32);
}

module.exports.defaultOptions = {};
module.exports.convert = function(camelCaseString, opts) {
  opts = opts || this.defaultOptions;
  const splitter = opts.splitter || ' ';
  let text = '';
  for (let i = 0; i < camelCaseString.length; i++) {
    const charCode = camelCaseString.charCodeAt(i);
    if (i === 0 && opts.capitalizeFirstLetter) {
      text += toCapital(charCode);
    } else if (charCode >= 65 && charCode <= 90) {
      text += splitter + toSmall(charCode);
    } else {
      text += camelCaseString[i];
    }
  }

  return text;
};

