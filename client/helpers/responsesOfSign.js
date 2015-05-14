/**
 * Created by loupax on 3/8/15.
 */
Handlebars.registerHelper('responsesOfSign', function (sign){
    return AccessibleSigns.find({
        discussion_root_sign_id: sign._id
    },{
        sort:{
            when:1
        }
    });
});