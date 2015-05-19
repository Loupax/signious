var Future = Npm.require('fibers/future');
function getHTMLOfURL(url) {
    var fut = new Future();
    var spawn = Npm.require('child_process').spawn;

    var phantom = spawn('phantomjs', [process.env.PWD + '/assets/app/phantom_driver.js.phantom', url]);
    var dataBucket = [];
    var errBucket = [];
    phantom.stdout.on('data', Meteor.bindEnvironment(function (data) {
        dataBucket.push(data.toString());
    }));
    phantom.stderr.on('data', Meteor.bindEnvironment(function (data) {
        errBucket.push(data.toString());
    }));
    phantom.on('exit', Meteor.bindEnvironment(function (code) {
        if (errBucket.length) {
            fut.throw(new Meteor.Error(500, 'Error while running phantomjs' + errBucket.join()));
        } else {
            var doc = dataBucket.join('');
            fut.return(doc.substr(0, doc.indexOf('</html>') + 8));
        }
    }));

    fut.wait();
    return fut;
}


Meteor.methods({
    'Sign:fetch': function(_id){
      var sign = SignsCollection.find({_id: _id}).fetch().pop();
        if(!sign)
            throw new Meteor.Error('404', 'Not found', 'Not found');

        return sign;
    },
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
    'Sign:addURLData': function (sign_id) {
        var sign = SignsCollection.find({_id: sign_id}).fetch()[0];
        var urls = Meteor.call('Sign:scrapeURLs', sign);
        console.log(urls);
        if (urls.length) {
            if(/^(https|http):\/\/.+\.(gif|png|jpg|jpeg)$/i.test(urls[0])){
                var linkedWebpage = {
                    title: undefined,
                    meta: [{property: 'og:image', content: urls[0]}]
                };
            }else {
                var $ = cheerio.load(getHTMLOfURL(urls[0]).value);
                var linkedWebpage = {
                    title: $('title').text(),
                    meta: []
                };

                $('meta').filter('[name="keywords"], [name="description"], [property^="og:"]').each(function (index, meta) {
                    var $meta = $(meta);
                    linkedWebpage.meta.push(meta.attribs);
                });
            }
        }

        SignsCollection.update(sign_id, {
            $set: {
                linkedWebpage: linkedWebpage
            }
        });
    },
    'Sign:delete': function(sign_id){
        //SignsCollection.remove({poster_id: Meteor.userId(), _id: sign_id});
        // Handle orphan messages
        //SignsCollection.update({response_to_sign_id: sign_id}, {$set: {'response_to_sign_id':''}}, {multi: true});
        return SignsCollection.update({poster_id: Meteor.userId(), _id: sign_id}, {$set: {'is_deleted': true}}, {multi: false});
    },
    'Sign:undelete': function(sign_id){
        return SignsCollection.update({poster_id: Meteor.userId(), _id: sign_id}, {$set: {'is_deleted': false}}, {multi: false});
    },
    'Sign:save': function (sign) {

        var mentions = Sign.getMentions(sign);
        var _id = SignsCollection.insert({
            poster_id: sign.poster_id,
            username: sign.username,
            text: sign.text,
            when: sign.when,
            location: Location.prototype.toMongo.call(sign.location),
            direct_message: sign.direct_message,
            response_to_user_id: sign.response_to_user_id,
            response_to_sign_id: sign.response_to_sign_id,
            discussion_root_sign_id: sign.discussion_root_sign_id,
            avatar: Meteor.user()?Meteor.user().profile.avatar:'',
            mentions: mentions
        });

        // Just make an asynchronous call to the route that will scrape the urls inside
        // the sign and add additional info to the record
        HTTP.call('GET',Meteor.absoluteUrl('/scrape/html/' + _id), function () {});
        if(mentions.length) {
            var users = Meteor.users.find({_id: {$in: mentions.map(function(a){return a._id;})}}, {fields: {emails: 1, 'profile.realname': 1, username:1}}).fetch();
            users.forEach(function(user){
                HTTP.call('POST', Meteor.absoluteUrl('/mail_notifier/mention'), {data:{user: user, sign:_.extend(sign, {_id: _id})}}, function(){});
            });
        }
        return _id;
    }

});