/**
 * Created by loupax on 3/8/15.
 */
Handlebars.registerHelper('responsesOfSign', function (sign){
    return SignsCollection.find({
        response_to_sign_id: sign._id
    });
});