MessageCounters = new Meteor.Collection('messagescounters');
MessageCounters.deny({
    'insert': function(){return true;},
    'update': function(){return true;},
    'remove': function(){return true;}
});
if(Meteor.isServer) {
    Meteor.publish('MessageCounters', function (messageIds) {
        var cursor = SignsCollection.find({discussion_root_sign_id: {$in:messageIds}},{fields:{_id:1, discussion_root_sign_id:1}});
        var child_counters = {};
        var pub = this;
        var handle = cursor.observeChanges({
            added: function(_id, msg){
                var id = msg.discussion_root_sign_id;
                if (child_counters[id] === undefined){
                    child_counters[id] = 0;
                    pub.added('messagescounters', id, {children: child_counters[id]});
                }else {
                    child_counters[id]++;
                    pub.changed('messagescounters', id, {children: child_counters[id]});
                }
            },
            changed: function(id){},
            removed: function(_id, msg){
                var id = msg.discussion_root_sign_id;
                child_counters[id]--;
                pub.changed('messagescounters', id, {children: child_counters[id]});
            }
        });

        this.ready();
        this.onStop(function(){
            handle.stop;
        });
    });
}