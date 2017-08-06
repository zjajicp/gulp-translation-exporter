'use strict';

const translationData = require('./helpers/translation-data');
const util = require('gulp-util');
const through2 = require('through2');
const jiraHandler = require('./helpers/jira-handler');
const plainTextExporter = require('./helpers/exporters/plain-text');
const prompter = require('./helpers/prompter');
const camelToText = require('./helpers/camel-case-to-text');
const opener = require('opener');

const notifyUser = (response, jiraConfig) => {
  const ticketId = response.data.key;
  const message = response.type === 'create' ?
    `You have successfully created translation ticket: ${ticketId}` :
    `You have successfully updated the translation ticket: ${ticketId}`;

  console.log(util.colors.green(message));
  opener(`${jiraConfig.webSite}/${jiraConfig.browsePath}/${ticketId}`);
};

const exportToProperTextFormat = (requests, config, file) => {
  const text = (typeof config.customExporter === 'function') ?
    config.customExporter(requests) :
    plainTextExporter(requests);

  if (file.isBuffer()) {
    file.contents = new Buffer(text);
  }
  return text;
};

const getTicketInfo = (ticketDescription) => {
  return prompter.getTicketInfo().then(ticketInfo => {
    return Object.assign({
      description: ticketDescription
    }, ticketInfo);
  });
};

const getCredentials = ticketInfo => prompter.getCredentials()
  .then(credentials => Object.assign(ticketInfo, credentials));

const sendTranslationTicketToJira = (ticketInfoWithCredentials, jiraConfig) => {
  return jiraHandler.sendTranslationRequest(jiraConfig.api, Object.assign({
    priority: jiraConfig.ticketPriority,
    projectKey: jiraConfig.projectKey,
    assigneeName: jiraConfig.ticketAssigneeName,
    agentOptions: jiraConfig.agentOptions
  }, ticketInfoWithCredentials)).catch(response => {
    const UNAUTHORIZED = 401;
    if (response.statusCode === UNAUTHORIZED) {
      return promptForCredentialsAgain(response, ticketInfoWithCredentials, jiraConfig);
    }

    return Promise.reject(response);
  });
};

const promptForCredentialsAgain = (response, ticketInfo, jiraConfig) => {
  console.log(util.colors.red('Wrong username or password. Try again!'));
  return getCredentials(ticketInfo)
    .then(ticketInfoWithCredentials => sendTranslationTicketToJira(ticketInfoWithCredentials, jiraConfig));
};

const getTranslationExporter = config => {
  return function translationExporter(file, encoding, callback) {
    camelToText.defaultOptions = {
      capitalizeFirstLetter: config.capitalizeFirstLetter
    };

    const translations = JSON.parse(file.contents.toString());

    translationData.getInfoFromDictionary(translations, config.dictionaries, {
      protocol: config.protocol,
      hostname: config.hostname,
      path: config.path,
      additionalInfo: config.additionalInfo
    })
      .then(prompter.getAdditionalInfo)
      .then(requests => exportToProperTextFormat(requests, config, file))
      .then(getTicketInfo)
      .then(getCredentials)
      .then(ticketInfoWithCredentials => sendTranslationTicketToJira(ticketInfoWithCredentials, config.jira))
      .then((response) => {
        notifyUser(response, config.jira);
        callback(null, file);
      })
      .catch(err => {
        callback(new util.PluginError('gulp-translation-exporter', err.message));
      });
  };
};

module.exports = function(config) {
  if (typeof config !== 'object') {
    throw new util.PluginError('gulp-translation-exporter', 'You haven\'t specified config object');
  }

  return through2({ objectMode: true }, getTranslationExporter(config));
};
