var file;
var formIsSaving = new ReactiveVar(false);
var notificationText = new ReactiveVar();

Template.ProfileEditor.helpers({
    disableOnSave: function(){
        return formIsSaving.get()?'disabled':'';
    },
    notification: function(){
        return notificationText.get();
    }
});

Template.ProfileEditor.events({
    'submit form': function (evt, template) {
        evt.preventDefault();
        formIsSaving.set(true);
        var data = {
            'realname': template.find('[name="profile[realname]"]').value,
            'username': template.find('[name="profile[username]"]').value,
            'bio': template.find('[name="profile[bio]"]').value
        };

        var promises = [];
        if(file){
            promises.push(uploadAvatar(file));
        }else {
            promises.push(new Promise(function(resolve, reject){
                Meteor.call('Profile:update', data, function(err){
                    if(err)
                        reject(err);

                    resolve();
                });
            }));
        }
        Promise.all(promises).then(function(){
            formIsSaving.set(false);
            Router.go('/profile/show');
        }).catch(function(err){
            formIsSaving.set(false);
            notificationText.set(err.details);
        });

    },
    'change #avatar-file': function (evt, template) {
        // Check for the various File API support.
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.
            file = evt.target.files[0];
        }
    }
});

function uploadAvatar(file){
    return new Promise(function(resolve, reject){
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            resolve();
            return false;
        }
        if (!file || !file.type.match('image.*')) {
            evt.target.value = evt.target.defaultValue;
            reject();
            return false;
        }

        var reader = new FileReader();
        var noop = function () {};
        // Closure to capture the file information.
        reader.onerror = noop;
        reader.onprogress = noop;
        reader.onabort = noop;
        reader.onloadstart = noop;
        reader.onload = noop;
        reader.onloadend = function () {
            Meteor.call('File:upload', this.file, this.reader.result, resolve);
        }.bind({reader: reader, file: file});

        reader.readAsDataURL(file);
    });
}