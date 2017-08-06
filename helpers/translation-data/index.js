const dictionaryLoader = require('./dictionary-loader.js');

const findBestMatchingDictionary = (dictionaries, translationKey) =>
  dictionaries.map(dic => Object.assign({ dictionaryName: dic.name }, dic.get(translationKey)))
    .filter(result => result.depth)
    .sort((a, b) => b.depth - a.depth)[0];

const mapTranslationsObject = (translationObjects, dictionaries) => {
  return Object.keys(translationObjects).map(translationKey => {
    const result = findBestMatchingDictionary(dictionaries, translationKey);

    const newValue = translationObjects[translationKey];
    const oldValue = result && result.value;

    const mappedObject = {
      key: translationKey,
      newValue,
      dictionary: result && result.dictionaryName
    };

    if (oldValue) {
      mappedObject.oldValue = oldValue;
    }

    return mappedObject;
  }).filter(obj => obj);
};

module.exports.getInfoFromDictionary = (translationsObject, dictionaryNames, config) =>
  (dictionaryLoader.load(dictionaryNames, {
    hostname: config.hostname,
    path: config.path,
    protocol: config.protocol
  }).then(loadedDictionaries => {
    const extendedTranslationObjects = mapTranslationsObject(translationsObject, loadedDictionaries);
    return extendedTranslationObjects;
  }));
