import bowser from 'bowser';

browser = bowser.getParser(window.navigator.userAgent);

Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL',
});

accountsUIBootstrap3.logoutCallback = function(error) {
    if (error) {
        console.log("Error:" + error);
    }
    Router.go('/');
}

toggleImpersonate = (username) => {
    let user;
    if (Impersonate._active.get()) {
        Impersonate.undo((error) => {
            if (error) {
                console.log(error);
                return;
            }
            console.log('No longer impersonating anyone.');
        });
        return;
    }
    check(username, String);
    user = Meteor.users.findOne({ username: username });
    if (!user) {
        console.log('Could not find user ' + username + '.');
        return;
    }
    Impersonate.do(user._id, (error, userId) => {
        if (error) {
            console.log(error);
            return;
        }
        user = Meteor.users.findOne({ _id: userId });
        console.log('Now impersonating ' + (user.username || user.emails[0].address) + '!');
    });
}

Meteor.startup(() => {
    Meteor.Spinner.options = {
        lines: 13,  // The number of lines to draw
        length: 8,  // The length of each line
        width: 3,  // The line thickness
        radius: 12,  // The radius of the inner circle
        corners: 1,  // Corner roundness (0..1)
        rotate: 0,  // The rotation offset
        direction: 1,  // 1: clockwise, -1: counterclockwise
        color: '#000',  // #rgb or #rrggbb
        speed: 1.2,  // Rounds per second
        trail: 60,  // Afterglow percentage
        shadow: false,  // Whether to render a shadow
        hwaccel: false,  // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9,  // The z-index (defaults to 2000000000)
        top: '50%',  // Top position relative to parent in px
        left: '50%'  // Left position relative to parent in px
    };

    Status.setTemplate('connection_fullscreen');
});

Deps.autorun((c) => {
    try { // May be an error if time is not synced
        UserStatus.startMonitor({
            threshold: 60000,
            interval: 1000,
            idleOnBlur: false,
        });
        c.stop();
    } catch (e) {}
});