Handlebars.registerHelper('topAvailableDiscussionId', function(sign){
    var result = SignsCollection.find({
        discussion_root_sign_id: sign.discussion_root_sign_id,
        $or: [{'is_deleted': true, poster_id: Meteor.userId()}, {is_private:false}]
    }, {limit: 1}).fetch().pop();
    return (result && result._id !== sign._id)?result._id:'';
});