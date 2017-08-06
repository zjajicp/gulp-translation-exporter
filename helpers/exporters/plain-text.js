const camelToText = require('../camel-case-to-text');

module.exports = function plainTextExporter(requests) {
  const formattedText = requests.reduce((acc, nextRequest) => {
    return Object.keys(nextRequest).reduce((accRequest, nextKey) => {
      return `${accRequest}${camelToText.convert(nextKey)}: ${nextRequest[nextKey]}\n`;
    }, `${acc}\n`);
  }, '{noformat}\n');

  return `${formattedText}\n{noformat}`;
};
