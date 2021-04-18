# Deploying to Meteor Cloud

This code repository is based on the Meteor web application framework (https://www.meteor.com/) and supports deployments to the Meteor Cloud platform (https://cloud.meteor.com/). Before you deploy your app to Meteor Cloud for the first time, make sure to open `settings.json` and update the environment variables `MAIL_URL`, `MAIL_FROM` and `MAIL_CC_LIST` to reflect your email settings:

```
{
  "galaxy.meteor.com": {
    "env": {
      "NODE_ENV": "production",
      "EDF_DIR": "/edf",
      "MAIL_URL": "smtps://PASSWORD:USERNAME@email-smtp.us-east-1.amazonaws.com:465",
      "MAIL_FROM": "platform@example.com",
      "MAIL_CC_LIST": "user1@example.com,user2@example.com"
    },
    "baseImage": {
      "repository": "crowdeeg/platform",
      "tag": "latest"
    }
  }
}
```

To deploy your app to Meteor Cloud run:

`METEOR_APP_NAME=your-meteor-app-name ./deploy-to-meteor-cloud`

You may choose to deploy your app through other platforms than Meteor Cloud. We provide instructions for deploying your app through AWS Elastic Beanstalk Check out our [here](getting_started_elastic_beanstalk.md)**.
