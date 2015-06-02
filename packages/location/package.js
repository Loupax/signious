Package.describe({
  summary: "An object that represents Geolocation data"
});

Package.on_use(function (api, where) {
  api.use('mquandalle:harmony@1.3.79');
  api.add_files('location.next.js', ['client', 'server']);
  api.export('Location');
});

/*Package.on_test(function (api) {
  api.use('foo');

  api.add_files('foo_tests.js', ['client', 'server']);
});*/