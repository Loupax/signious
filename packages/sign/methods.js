function getHTMLOfURL(url) {
    var Future = Npm.require('fibers/future');
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

function downloadAttachedImages(meta){
    var futures = [];
    var fs = Npm.require('fs');
    var http = Npm.require('http');
    var https = Npm.require('https');
    var Future = Npm.require('fibers/future');

    meta.forEach(function(meta, index, coll){
        if(meta.property && meta.property === 'image') {
            var _id = UploadedFilesCollection.insert({
                'originalFilename': meta.content,
                'mimeType': null
            });
            var filename = [_id, meta.content.split('.').pop()].join('.');
            var path = process.env.PWD + "/server/user-content/" + filename;
            var file = fs.createWriteStream(path);

            var future = new Future();
            futures.push(future);
            (meta.content.indexOf('http:')===0?http:https).get(meta.content, function (response) {
                response.pipe(file);
                response.on('close', function(){future.reject();})
                response.on('end', function(){future.return();})
            });
            meta.content = filename;
        }
        return;
    });
    futures.map(function(future){return future.wait();});
}


Meteor.methods({
    'Sign:DeleteHangingMessages': function(){
        SignsCollection.find({is_deleted: true, poster_id: Meteor.userId()}, {fields:{_id: true, when:true, response_to_sign_id:true, discussion_root_sign_id: true}, order: {when: -1}}).forEach(function(record){
            // Mark the next sign as a head
            var newHead = SignsCollection.find({
                discussion_root_sign_id: record.discussion_root_sign_id,
                when: {$gt: record.when}
            }, {
                sort: {when: 1},
                fields: {_id: 1},
                limit:1
            }).fetch().pop();

            SignsCollection.remove({_id: record._id});

            if (!record.response_to_sign_id && newHead) {
                SignsCollection.update({_id: newHead._id}, {$set:{response_to_sign_id: ''}});
            }
        });
    },
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
        if (urls.length) {
            if(/^(https|http):\/\/.+\.(gif|png|jpg|jpeg)$/i.test(urls[0])){
                var linkedWebpage = {
                    title: undefined,
                    meta: [{property: 'image', content: urls[0]}]
                };
            } else {
                var $ = cheerio.load(getHTMLOfURL(urls[0]).value);
                var linkedWebpage = {
                    title: $('title').text(),
                    meta: []
                };

                var duplicates = [];
                $('meta').filter('[name="keywords"], [name="description"], [property^="og:"], [property^="twitter:"]').each(function (index, meta) {
                    var attrs = meta.attribs;
                    if(attrs.property){
                        var segments = attrs.property.split(':');
                        var prefix = segments.shift()
                        if(['twitter', 'og'].indexOf(prefix)>-1)
                        {
                            attrs.property = segments.join(':');
                        }
                    }
                    // We store the string representations to an array
                    // to make sure we don't add the same property set multiple times
                    var json = JSON.stringify(attrs);
                    if(duplicates.indexOf(json) === -1) {
                        duplicates.push(json);
                        linkedWebpage.meta.push(attrs);
                    }
                });
            }
            linkedWebpage.meta = linkedWebpage.meta.filter(function(meta){
                if(meta.property === 'image'){
                    if(meta.content.indexOf('http://') === 0 || meta.content.indexOf('https://') === 0){
                        return true;
                    }
                    return false;
                }
                return true;
            });
            console.log(linkedWebpage.meta);
            // Download remote images here to avoid 403s
            downloadAttachedImages(linkedWebpage.meta);
        }
        SignsCollection.update(sign_id, {
            $set: {
                linkedWebpage: linkedWebpage
            }
        });
    },
    'Sign:delete': function(sign_id){
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
            is_deleted: false,
            location: Location.prototype.toMongo.call(sign.location),
            direct_message: sign.direct_message,
            response_to_user_id: sign.response_to_user_id,
            response_to_sign_id: sign.response_to_sign_id,
            discussion_root_sign_id: sign.discussion_root_sign_id,
            avatar: Meteor.user()?Meteor.user().profile.avatar:'',
            mentions: mentions
        });

        if (!sign.discussion_root_sign_id) {
            sign.discussion_root_sign_id = _id;
            SignsCollection.find({_id: _id}, {$set:{discussion_root_sign_id: sign.discussion_root_sign_id}});
        }

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