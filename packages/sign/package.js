Package.describe({
  summary: "A Sign is the basic data structure of signious."
});

Package.on_use(function (api, where) {
  api.add_files('sign.js', ['client', 'server']);
  api.add_files([
      'methods.js',
      'publications/nearby_signs_publications.js',
      'publications/public_sign_publication.js'
  ], ['server']);
  api.use(['location', 'session', 'deps']);
  api.export(['Sign','SignsCollection', 'AccessibleSigns']);
});