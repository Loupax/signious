var Future = Npm.require('fibers/future');
function getHTMLOfURL(url) {
    var fut = new Future();
    var spawn = Npm.require('child_process').spawn;

    var phantom = spawn('phantomjs', [process.env.PWD+'/assets/app/phantom_driver.js.phantom',url]);
    var dataBucket = [];
    var errBucket = [];
    phantom.stdout.on('data', Meteor.bindEnvironment(function (data) {
        dataBucket.push(data.toString());
    }));
    phantom.stderr.on('data', Meteor.bindEnvironment(function (data) {
        errBucket.push(data.toString());
    }));
    phantom.on('exit', Meteor.bindEnvironment(function (code) {
        if(errBucket.length){
            fut.throw(new Meteor.Error(500, 'Error while running phantomjs'+ errBucket.join()));
        }else{
            var doc = dataBucket.join('');
            fut.return(doc.substr(0,doc.indexOf('</html>')+8));
        }
    }));


    fut.wait();
    return fut;

}


Meteor.methods({
    'Sign:scrapeURLs': function scrapeURLs(sign) {
        var parsed = Autolinker.link(sign.text, {twitter: false});
        try {
            var $ = cheerio.load('<div>' + parsed + '</div>');
        } catch (e) {
            throw new Meteor.Error(500, e.reason, e.details);
        }
        return $('a').map(function (i, el) {
            return $(el).attr('href');
        });
    },
    'Sign:getCentralPointOfReference': function getCentralPointOfReference(position) {
        return SignsCollection.find({
            'location': {
                $near: {
                    $geometry: (new Location(position)).toMongo(),
                    $maxDistance: 1000
                }
            }
        }, {limit: 1, sort: {when: 1}, fields: {'location': 1}}).fetch().pop();
    },
    'Sign:getAll': function getAll() {
        return SignsCollection.find({}).fetch();
    },
    'Sign:save': function (sign) {
        var urls = Meteor.call('Sign:scrapeURLs', sign);
        if(urls.length) {
            var $ = cheerio.load(getHTMLOfURL(urls[0]).value);
            var pageTitle = $('title').text();
        }
        return SignsCollection.insert({
            poster_id: sign.poster_id,
            username: sign.username,
            text: sign.text,
            when: sign.when,
            location: Location.prototype.toMongo.call(sign.location),
            direct_message: sign.direct_message,
            response_to_user_id: sign.response_to_user_id,
            response_to_sign_id: sign.response_to_sign_id,
            mentions: Sign.getMentions(sign),
            linkedWebpage: {
                title: pageTitle||undefined
            }
        });
    }

});