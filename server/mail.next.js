Meteor.startup(function () {
    Meteor.Mailgun.config(Meteor.settings.mailgun);
});


// In your server code: define a method that the client can call
Meteor.methods({
    sendEmail: function (mailFields) {
        check([mailFields.to, mailFields.from, mailFields.subject, mailFields.text, mailFields.html], [String]);

        // Let other method calls from the same client start running,
        // without waiting for the email sending to complete.
        this.unblock();

        Meteor.Mailgun.send({
            to: mailFields.to,
            from: mailFields.from,
            subject: mailFields.subject,
            text: mailFields.text,
            html: mailFields.html
        });
    }
});