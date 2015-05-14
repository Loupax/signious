/**
 * Created by loupax on 3/8/15.
 */
Handlebars.registerHelper('responsesOfSign', function (sign){
    if(!sign.discussion_root_sign_id){
        return AccessibleSigns.find({
            discussion_root_sign_id: sign._id,
            when: {$gt: sign.when}
        },{
            sort:{
                when:1
            }
        });
    }else{
        return AccessibleSigns.find({
            discussion_root_sign_id: sign.discussion_root_sign_id,
            when: {$gt: sign.when}
        },{
            sort:{
                when:1
            }
        });
    }
});