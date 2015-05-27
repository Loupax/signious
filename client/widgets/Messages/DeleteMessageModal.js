Template.DeleteMessageModal.events({
    'click .js-delete-message': function(evt, template){
        var message = Session.get('MessageBeingDeleted');
        Session.set('MessageBeingDeleted', undefined);
        $('.message-id-'+message._id).slideUp('fast', function(){
            Meteor.call('Sign:delete', message._id);
        });
    },
    'click .js-cancel-deletion': function(){
        Session.set('MessageBeingDeleted', undefined);
    }
});