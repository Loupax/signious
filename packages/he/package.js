Package.describe({
  name: 'loupax:he',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Meteor wrapper for he, the html encoder. All credit goes to https://github.com/mathiasbynens/he',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/mathiasbynens/he',
  documentation: '.npm/package/node_modules/he/README.md',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Npm.depends({
  'he': '0.5.0' // Where x.x.x is the version, e.g. 0.3.2
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('he.js', ['server']);
  api.addFiles('.npm/package/node_modules/he/he.js', ['client']);
  api.export('he', ['server']);
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('loupax:he');
  api.addFiles('he-tests.js');
});
