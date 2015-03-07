/**
 * Created by loupax on 3/7/15.
 */
Handlebars.registerHelper('FormatMessage', function (message){
    var text     = message.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");;
    (message.mentions || []).forEach(function(mention, index){
        var n = '@'+mention.username;
        text = text.replace(n, '<a href="#">'+n+'</a>');
    });
    return new Handlebars.SafeString(text);
});
