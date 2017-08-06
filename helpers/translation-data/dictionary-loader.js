'use strict';

const request = require('request-promise');

function get(translationKey) {
  const keys = translationKey.split('.');
  let value = this._dictionary;
  let depth = 0;
  keys.forEach((key) => {
    if (!value) {
      return;
    }
    depth += 1;
    value = value[key];
  });

  return {
    value,
    depth
  };
}

function isPartiallyLocated(key) {
  const rootPropertyName = key.split('.')[0];
  return !!this._dictionary[rootPropertyName];
}

exports.load = (dicNames, opts) => {
  const promises = dicNames.map(dicName => {
    return request({
      method: 'GET',
      uri: `${opts.protocol}://${opts.hostname}/${opts.path}i18n.frontend.${dicName}.en-ie.json`,
      json: true
    }).then(dictionary => {
      return {
        _dictionary: dictionary,
        get: get,
        name: dicName,
        isPartiallyLocated
      };
    });
  });

  return Promise.all(promises);
};
