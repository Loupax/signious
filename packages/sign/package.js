Package.describe({
  summary: "A Sign is the basic data structure of signious."
});

Package.on_use(function (api, where) {
  api.add_files('sign.next.js', ['client', 'server']);
  api.add_files([
      'methods.next.js',
      'publications/nearby_signs_publications.next.js',
      'publications/public_sign_publication.next.js'
  ], ['server']);
  api.use(['location', 'session', 'deps','mquandalle:harmony@1.3.79']);
  api.export(['Sign','SignsCollection', 'SignsCollection']);
});