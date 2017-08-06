
'use strict';

const exportTranslations = require('./gulp-translation-exporter');
const rename = require('gulp-rename');

const prettify = require('gulp-prettify');
const xliffExporter = require('./gulp-translation-exporter/helpers/exporters/xliff');
const gulp = require(gulp);

const dictionaries = ['site', 'meta', 'layout', 'booking', 'home',
  'transfer', 'transfer-data-new', 'mytrips', 'navitaire', 'farefinder', 'rooms'];
const translationsFile = './client/src/resources/aem/feature-keys.json';
const outputDir = './client/src/resources/aem/requests';

const defaultExporterConfig = {
  dictionaries,
  protocol: 'https',
  hostname: 'sit-aem.ryanair.com',
  path: '/apps/ryanair/',
  jira: {
    webSite: 'https://jira.ryanair.com:8443',
    browsePath: 'browse',
    api: 'https://jira.ryanair.com:8443/rest/api/2',
    projectKey: 'hereGoesJiraProjectName',
    ticketPriority: '2',
    ticketAssigneeName: 'hereGoesTheJiraUserNameOfTheTranslationPerson',
    // the certificate authorities chain is not properly configured on the server
    // therefore the certificate check is disabled
    // the jira is on a domain inside the ryanair network so this is not a big concern
    agentOptions: {
      rejectUnauthorized: false
    }
  },
  capitalizeFirstLetter: true,
  customExporter: undefined
};

  gulp.task('export-translations', () => (gulp.src(translationsFile)
      .pipe(exportTranslations(defaultExporterConfig))
      .pipe(rename('translation-requests.txt'))
      .pipe(gulp.dest(outputDir))
      .on('error', err => {
        console.error(err); // eslint-disable-line no-console
      }))
  );

  gulp.task('export-translations-xliff', () => (gulp.src(translationsFile)
    .pipe(exportTranslations(Object.assign({
      customExporter: xliffExporter
    }, defaultExporterConfig)))
    .pipe(prettify({ indentSize: 2 }))
    .pipe(rename('translation-requests.xml'))
    .pipe(gulp.dest(outputDir))
    .on('error', err => {
      console.error(err); // eslint-disable-line no-console
    }))
  );