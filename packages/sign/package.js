Package.describe({
  summary: "A Sign is the basic data structure of signious."
});

Package.on_use(function (api, where) {
  api.add_files('sign.js', ['client', 'server']);
  api.use('location');
  api.export('Sign');
});

/*Package.on_test(function (api) {
  api.use('foo');

  api.add_files('foo_tests.js', ['client', 'server']);
});*/