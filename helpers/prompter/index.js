const camelToText = require('../camel-case-to-text');
const inquirer = require('inquirer');
const util = require('gulp-util');

const printKnownData = (translationObject) => {
  Object.keys(translationObject)
    .filter(key => translationObject[key])
    .forEach(definedKey => console.log(`${camelToText.convert(definedKey)}: ${util.colors.blue(translationObject[definedKey])}`));
};

const printSeparator = () => {
  console.log('\n----------------------------------------------------');
};


const getTranslationsInfoQuestions = (translationObject) => {
  const basicQuestions = Object.keys(translationObject)
    .filter(key => !translationObject[key])
    .map(keyForMissingProperty => {
      return {
        name: keyForMissingProperty,
        message: `${camelToText.convert(keyForMissingProperty)}:`
      };
    });

  const additionalInfo = [
    {
      name: 'codeChangeRequired',
      message: 'Code change required',
      type: 'confirm',
      default: false
    },
    {
      name: 'textPosition',
      message: 'Text position on web site',
      validate(input) {
        return !!input;
      }
    }
  ];
  return [...basicQuestions, ...additionalInfo];
};



module.exports.getAdditionalInfo = (translationObjects) => {
  return new Promise(function(resolve, reject) {
    const extendedTranslationObjects = [];
    (function prompt(index) {
      if (index >= translationObjects.length) {
        resolve(extendedTranslationObjects);
      }

      const translation = translationObjects[index];
      printKnownData(translation);
      const questions = getTranslationsInfoQuestions(translation);

      inquirer.prompt(questions).then(answers => {
        printSeparator();
        extendedTranslationObjects[index] = Object.assign({}, translation, answers);
        prompt(index + 1);
      }).catch(reject);
    }(0));
  });
};

module.exports.getTicketInfo = () => {
  const existingTicketQuestions = [
    {
      name: 'existingTicket',
      type: 'confirm',
      message: 'Does the translation ticket already exist for the current sprint',
      default: false
    }, {
      name: 'existingTicketId',
      type: 'input',
      message: 'Ticket ID',
      when(currentAnswers) {
        return currentAnswers.existingTicket;
      }
    }];

  const newTicketQuestions = [{
    name: 'teamName',
    type: 'input',
    message: 'Your team\'s name',
    filter(teamName) {
      return teamName.toUpperCase(0);
    }
  }, {
    name: 'sprintNumber',
    type: 'input',
    message: 'Current sprint number',
    validate(input) {
      return !!Number(input);
    }
  }].map(question => {
    return Object.assign({
      when(currentAnswers) {
        return !currentAnswers.existingTicket;
      }
    }, question);
  });

  const questions = [...existingTicketQuestions, ...newTicketQuestions].map(question => {
    return Object.assign({
      validate(input) {
        return !!input;
      }
    }, question);
  });
  return inquirer.prompt(questions);
};

module.exports.getCredentials = () => {
  const credentialsQuestions = [{
    name: 'username',
    type: 'input',
    message: 'JIRA username'
  }, {
    name: 'password',
    type: 'password',
    message: 'Your JIRA password'
  }];

  return inquirer.prompt(credentialsQuestions);
};
