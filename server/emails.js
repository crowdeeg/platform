const mailCCList = (process.env.MAIL_CC_LIST || '').split(',').map(m => m.trim());
const emailSender = process.env.MAIL_FROM;
const platformName = 'crowdEEG';
const subjectPrefix = platformName;

PrettyEmail.options = {
    from: emailSender,
    logoUrl: 'https://s3.amazonaws.com/crowdeeg-media/email/logo.png',
    companyName: platformName,
    companyUrl: process.env.ROOT_URL,
    companyAddress: '',
    companyTelephone: '',
    companyEmail: '',
    siteName: platformName,
};

PrettyEmail.style = {
    fontFamily: 'Helvetica',
    fontColor: '#232323',
    buttonColor: '#FFFFFF',
    buttonBgColor: '#0921a5',
    // preheader: value of style attribute for (pre-header) subject line
}

sendEmail = (type, options) => {
    options.subject = options.subject || '';
    if (subjectPrefix && !options.subject.startsWith(subjectPrefix)) {
        options.subject = subjectPrefix + ': ' + options.subject;
    }
    options.message = options.message || '';
    if (options.message !== '') {
        options.message = '<div style="text-align: center">' + options.message + '<div>';
    }
    if (!options.to) {
        options.to = [];
    }
    if (!Array.isArray(options.to)) {
        options.to = [ options.to ];
    }
    options.to = [...new Set(options.to)];
    if (!Meteor.isProduction && options.to.length > 0) {
        options.message += '<div style="color: #FF0000; border: 2px solid #FF0000; padding: 20px; margin-top: 20px; text-align: center">IN PRODUCTION MODE, THIS EMAIL WOULD\'VE BEEN SENT TO:<br>' + options.to.join('<br>') + '</div>';
        options.to = [];
    }
    mailCCList.forEach(m => options.to.push(m));
    options.to = [...new Set(options.to)];
    options.headingSmall = options.headingSmall || options.heading;
    options.heading = PrettyEmail.options.companyName;
    PrettyEmail.send(type, options);
};

Meteor.methods({
    sendEmail(type, options) {
        if (!Roles.userIsInRole(this.userId, 'admin')) return;
        sendEmail(type, options);
    },
});
