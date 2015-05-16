/**
 * Created by loupax on 3/8/15.
 */
Handlebars.registerHelper('responsesOfSign', function (sign){

    if(sign.discussion_root_sign_id){
        var cursor = AccessibleSigns.find({
            discussion_root_sign_id: sign.discussion_root_sign_id,
            _id: {$ne: sign._id},
            when: {$gt: sign.when}
        }, {
            sort: {
                when: 1
            }
        });
    }else{
        var cursor = AccessibleSigns.find({
            discussion_root_sign_id: sign._id,
            _id: {$ne: sign._id}
        }, {
            sort: {
                when: 1
            }
        });
    }
    return cursor;


});