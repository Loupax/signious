Meteor.methods({
    'Sign:unfave': function(sign_id){
        if(Meteor.userId() && Meteor.user().profile.favorites.indexOf(sign_id) > -1) {
            Meteor.users.update({_id: Meteor.userId()}, {$pull: {'profile.favorites': sign_id}});
            SignsCollection.update({_id: sign_id}, {$inc: {'favorites': -1}});
        }
    },
    'Sign:fave': function(sign_id){
        if(Meteor.userId() && Meteor.user().profile.favorites.indexOf(sign_id) === -1) {
            Meteor.users.update({_id: Meteor.userId()}, {$addToSet: {'profile.favorites': sign_id}});
            SignsCollection.update({_id: sign_id}, {$inc: {favorites: 1}});

            this.unblock();
            var sign = SignsCollection.find({_id: sign_id}, {limit: 1}).fetch().pop();
            var user = Meteor.users.find({_id: sign.poster_id}, {limit: 1}).fetch().pop();
            if(sign.poster_id === user._id){
                return;
            }

            var signUrl = Meteor.settings.public.baseUrl+'/' + sign.username + '/sign/' + sign._id;
            Meteor.call('sendEmail', {
                to: user.emails[0].address,
                from: 'notifications@signious.com',
                subject: 'Your message been been favorited on Signious!',
                text: [
                    sign.username + ' favorited your Sign',
                    'You can see the discussion by following this link',
                    signUrl
                ].join('\r\n'),
                html: [
                    '<style type="text/css">*{text-align: center; margin: auto;}</style>',
                    '<h1>' + sign.username + ' favorited your Sign' + '</h1>',
                    '<p>You can see the discussion by following this link</p>',
                    '<a href="' + signUrl + '">' + signUrl + '</a>'
                ].join('')
            });
        }
    },
    'Sign:DeleteHangingMessages': function () {
        SignsCollection.find({is_deleted: true, poster_id: Meteor.userId()}, {
            fields: {
                _id: true,
                when: true,
                response_to_sign_id: true,
                discussion_root_sign_id: true
            }, order: {when: -1}
        }).forEach(function (record) {
            // Mark the next sign as a head
            var newHead = SignsCollection.find({
                discussion_root_sign_id: record.discussion_root_sign_id,
                when: {$gt: record.when}
            }, {
                sort: {when: 1},
                fields: {_id: 1},
                limit: 1
            }).fetch().pop();

            SignsCollection.remove({_id: record._id});

            if (!record.response_to_sign_id && newHead) {
                SignsCollection.update({_id: newHead._id}, {$set: {response_to_sign_id: ''}});
            }
        });
    },
    'Sign:fetch': function (_id) {
        var sign = SignsCollection.find({_id: _id}).fetch().pop();
        if (!sign)
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
            if (URLUtils.isImage(urls[0])) {
                var linkedWebpage = {
                    title: undefined,
                    meta: [{property: 'image', content: urls[0]}]
                };
            } else {
                var webpage = Scraper.create(urls[0]);

                var linkedWebpage = {
                    title: webpage.title(),
                    meta: webpage.getMeta({
                        fixRelativePaths: true,
                        filterSelector: '[name="keywords"], [name="description"], [property^="og:"], [property^="twitter:"]',
                        prunePrefixes: ['twitter', 'og']
                    })
                };

                Scraper.downloadMetadataImages({
                    meta: linkedWebpage.meta,
                    imageCollection:UploadedFilesCollection,
                    imageLocation:process.env.PWD + "/server/user-content/",
                    imageUrl: '/static/resource'
                });
            }
        }
        SignsCollection.update(sign_id, {
            $set: {
                linkedWebpage: linkedWebpage
            }
        });
    },
    'Sign:delete': function (sign_id) {
        return SignsCollection.update({
            poster_id: Meteor.userId(),
            _id: sign_id
        }, {$set: {'is_deleted': true}}, {multi: false});
    },
    'Sign:undelete': function (sign_id) {
        return SignsCollection.update({
            poster_id: Meteor.userId(),
            _id: sign_id
        }, {$set: {'is_deleted': false}}, {multi: false});
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
            is_private: sign.is_private,
            response_to_user_id: sign.response_to_user_id,
            response_to_sign_id: sign.response_to_sign_id,
            discussion_root_sign_id: sign.discussion_root_sign_id,
            avatar: Meteor.user() ? Meteor.user().profile.avatar : '',
            mentions: mentions
        });

        if (!sign.discussion_root_sign_id) {
            sign.discussion_root_sign_id = _id;
            SignsCollection.update({_id: _id}, {$set: {discussion_root_sign_id: sign.discussion_root_sign_id}});
        }

        // Just make an asynchronous call to the route that will scrape the urls inside
        // the sign and add additional info to the record
        HTTP.call('GET', Meteor.absoluteUrl('/scrape/html/' + _id), function () {
        });
        if (mentions.length) {
            var users = Meteor.users.find({
                _id: {
                    $in: mentions.map(function (a) {
                        return a._id;
                    })
                }
            }, {fields: {emails: 1, 'profile.realname': 1, username: 1}}).fetch();
            users.forEach(function (user) {
                HTTP.call('POST', Meteor.absoluteUrl('/mail_notifier/mention'), {
                    data: {
                        user: user,
                        sign: _.extend(sign, {_id: _id})
                    }
                }, function () {
                });
            });
        }
        return _id;
    }

});
