# Galaxy app

This is a modification of `meteor/galaxy-app`, the default and official Galaxy container base image for Meteor applications designed to work with `meteor deploy` command.

### Build
In build stage, `setup.sh`
1. downloads the same version of Node.JS that was used to deploy the Meteor application, which is recorded in `.node_version.txt` inside the code bundle.
2. installs NPM dependencies.
3. runs additional code in `setup.sh` inside the code bundle.

### Run
By default, the run command is `node main.js` in `/app/bundle`. Alternatively, users can overwrite the run command by providing `run.sh` in the code bundle, though the Meteor tool doesn't provide an easy way to do this.

### Build image and push to Docker Hub
Before deploying your CrowdEEG app to Galaxy, you first need to be build it locally and push it to Docker Hub:
1. Log into Docker Hub: `docker login --username crowdeeg`
2. Build the Docker image locally: `docker build -t crowdeeg/platform .`
3. Push the Docker image to Docker Hub: `docker push crowdeeg/platform`
