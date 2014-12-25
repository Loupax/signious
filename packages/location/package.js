Package.describe({
  summary: "An object that represents Geolocation data"
});

Package.on_use(function (api, where) {
  api.add_files('location.js', ['client', 'server']);
  api.export('Location');
});

/*Package.on_test(function (api) {
  api.use('foo');

  api.add_files('foo_tests.js', ['client', 'server']);
});*/