Handlebars.registerHelper('topAvailableDiscussionId', function(sign){
    var result = SignsCollection.find({
        _id: sign.discussion_root_sign_id,
        is_deleted: false
    }, {limit: 1}).fetch().pop();
    return (result && result._id !== sign._id)?result._id:'';
});