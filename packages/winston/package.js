Package.describe({
  name: 'loupax:winston',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: '',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({'winston':'1.0.0'});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('winston.js', ['server']);
  api.export('logger');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('loupax:winston');
  api.addFiles('winston-tests.js');
});
