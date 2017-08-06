const XMLWriter = require('xml-writer');

module.exports = function toXliff(translations) {
  const xml = new XMLWriter();

  xml.startDocument('1.0', 'UTF-8')
    .startElement('xliff')
    .writeAttribute('version', '1.1')
    .startElement('file')
    .writeAttribute('source-language', 'en')
    .writeAttribute('target-language', 'default')
    .writeAttribute('datatype', 'x-javaresourcebundle')
    .startElement('header')
    .endElement()
    .startElement('body');

  translations.forEach((translation, index) => {
    xml.startElement('trans-unit');
    xml.writeAttribute('id', index);

    xml.startElement('source')
      .writeAttribute('xml:lang', 'en')
      .writeCData(translation.key)
      .endCData()
      .endElement();

    xml.startElement('target')
      .writeAttribute('xml:lang', 'default')
      .writeCData(translation.newValue)
      .endCData()
      .endElement();

    xml.endElement();
  });

  xml.endElement();
  xml.endElement();
  xml.endElement();
  xml.endDocument();

  return xml.toString();
};
