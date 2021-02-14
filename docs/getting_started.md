<h2>Setup Instructions</h2>
<h4>To run crowdEEG</h4>

* git clone this repository
* Install the aws cli. Follow this [link](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html#cliv2-mac-install-confirm) for installation and this [link](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) for configuring (basically running `aws configure`).
* run the following
    ```
    brew services stop mongodb
    brew uninstall mongodb
    brew tap mongodb/brew
    brew install mongodb-community
    brew services start mongodb-community
    cd /absolute/path/to/crowdEEG
    meteor npm install
    ./run
    ```

    At this point you should see an empty crowdEEG running on your localhost. So how do we get some data in there?

<h4>Loading Data</h4>
<h5>Installing AWS Elastic Beanstalk</h5>

* Follow the instructions [here](https://github.com/aws/aws-elastic-beanstalk-cli-setup).
    The steps for MacOS with Zsh are basically:
    Install XCode from the App Store, install [brew](https://brew.sh) if you do not have it.
    ```
    brew install zlib openssl readline
    CFLAGS="-I$(brew --prefix openssl)/include -I$(brew --prefix readline)/include -I$(xcrun --show-sdk-path)/usr/include" LDFLAGS="-L$(brew --prefix openssl)/lib -L$(brew --prefix readline)/lib -L$(brew --prefix zlib)/lib"
    git clone https://github.com/aws/aws-elastic-beanstalk-cli-setup.git
    ./aws-elastic-beanstalk-cli-setup/scripts/bundled_installer
    ```
    If `./aws-elastic-beanstalk-cli-setup/scripts/bundled_installer` is giving you the erorr `Makefile:588: *** multiple target patterns.  Stop.`, then do the following:
    Install [python 3.7](https://www.python.org/downloads/mac-osx/) (3.7.3 tested, other 3.7 versions should be fine as well). Double check your version after installation by running `python3`. If the version is correct, you can leave the shell by typing `quit()`. After than, run
    ```
    pip3 install wheel
    python3 scripts/ebcli_installer.py
    echo 'export PATH="/Users/<YOUR USERNAME>/.ebcli-virtual-env/executables:$PATH"' >> ~/.zshenv && source ~/.zshenv
    ```
    If you are using bash just change the `zshenv` to `bash_profile` in the last step.

* At this point, running `eb` should work. However, if you are getting errors regarding certain python libraries not being installed, here's why. The installation of `eb` works by having a script called `eb` in `/Users/<USERNAME>/.ebcli-virtual-env/executables`, which activates a python 3 virtual environment created during the installation located in `/Users/<USERNAME>/.ebcli-virtual-env/bin` and calls the `eb` script in `/Users/<USERNAME>/.ebcli-virtual-env/bin`. This virtual environment should have all the required libraries installed. So what is the problem? There are two potential issues:
  * open the `eb` script in `/Users/<USERNAME>/.ebcli-virtual-env/bin`. If the very first line is something like `#!/Library/Frameworks/Python.framework/Versions/3.7/bin/python3`, replace it with `#!/Users/<USERNAME>/.ebcli-virtual-env/bin/python3`. This will make sure the script runs in the virtual environment which has all the requird libraries.
  * run `where eb` if the output contains more than one row like below
    ```
    /Library/Frameworks/Python.framework/Versions/3.7/bin/eb
    /Users/<USERNAME>/.ebcli-virtual-env/executables/eb
    ```
    Remove/delete all `eb` scripts that are not in the `/Users/<USERNAME>/.ebcli-virtual-env/` folder.

  Fixing these issues should allow you to just run the `eb` command and print its command options.

<h5>Running AWS Elastic Beanstalk & Getting Data</h5>

* Let's create a `config.yml`
    ```
    cd /path/to/crowdEEG/
    mkdir .elasticbeanstalk
    cd .elasticbeanstalk
    nano config.yml
    ```
    paste the following into `config.yml`
    ```
    branch-defaults:
      master:
        environment: crowdeeg-production
    environment-defaults:
      crowdeeg-development:
        branch: null
        repository: null
    global:
      application_name: crowdeeg
      default_ec2_keyname: aws-eb-crowdcurio
      default_platform: arn:aws:elasticbeanstalk:us-east-1::platform/Docker running on
        64bit Amazon Linux/2.9.2
      default_region: us-east-1
      instance_profile: null
      platform_name: null
      platform_version: null
      profile: eb-cli
      sc: git
      workspace_type: Application
      ```
* Then we will create a file to hold the aws credentials
    ```
    nano ~/.aws/config
    ```
    and paste the following in the document.
    ```
    [profile eb-cli]
    aws_access_key_id = (for your IAM user)
    aws_secret_access_key = (for your IAM user)
    ```
  
* Next, get a copy of the ssh private key file and place the file in `~/.ssh`
  Change the access code with `sudo chmod 600 ~/.ssh/<key_file_name>`
* Now run `eb ssh`, note the IP address connected to and copy it. Quit the ssh session with `exit`
    To copy the edf files from the AWS server to your computer, do the following
    ```
    mkdir -p /absolute/path/to/crowdEEG/edf_files
    ```
    You may now place EDF files into `/absolute/path/to/crowdEEG/edf_files`. These will be available to the crowdEEG web app.

* The way crowdEEG works is that the meteor web server has an environment variable in the `.environment` file pointing to some local directory which has binary biosignal files in [.edf format](https://en.wikipedia.org/wiki/European_Data_Format), one of the standard open-source formats for medical time series data.
  Create a file called `.environment` in the `crowdEEG` folder and paste the following content
    ```
    EDF_DIR="/absolute/path/to/crowdEEG/edf_files"
    MAIL_URL="smtps://XXXXXXXX:XXXXXXXXX@email-smtp.us-east-1.amazonaws.com:465"
    MAIL_FROM="SOME EMAIL ADDRESS AVAILABLE VIA ABOVE SMTP ENDPOINT"
    MAIL_CC_LIST="YOUR OWN EMAIL ADDRESS"
    ```

* Install [WFDB](https://archive.physionet.org/physiotools/wfdb-darwin-quick-start.shtml). It is an open-source library used by CrowdEEG to read segments of biosignal data from EDF files.

* Then run `./up` in one terminal and `./import-latest-production-db` in another. We can now create a new user.

<h4>Creating a User</h4>

* (Run the last step above if you have not) crowdEEG should be running now at `http://localhost:3000`. Go there and create a new user. Then in another terminal tab run the following:

    ```
    meteor shell
    var userEmail = 'your.user@email.com';
    var user = Accounts.findUserByEmail(userEmail);
    Package['alanning:roles'].Roles.addUsersToRoles(user._id, [ 'admin' ], '__global_roles__');
    .exit
    ```
    The `userEmail` should be the email you used to create an account. Please use a valid email. The above code makes your user an admin.
* Go to `http://localhost:3000/assign`. Assign a task to yourself by choosing:
  * Task: Type “sleep staging”, then select from list
  * Add a single recording
  * Add reader: search for your own user name
  * Click okay on all the pop-up dialogs

  ![Assigning Task](images/assign_task.png)

* If successful you should get an email from the email address configured under `MAIL_FROM` above. You can now click on “crowdEEG” on the left side of the navigation bar to get back to your own task list. And there you should see a new task under Pending called Anonymous Patient (#XXXXXX).
* Click on it and the task will become "started".
    ![Task Started](images/task_started.png)



<h2>Miscellaneous Notes</h2>

<h4>Useful Meteor Commands</h4>
<h5>meteor shell</h5>

Opens a shell in your terminal where you can run meteor code while your app is running.

<h5>meteor mongo</h5>

Opens a shell where you can interact with the mongo database. If you prefer a GUI interface, a good and free option is [Robo 3T](https://robomongo.org/) (note that Studio 3T is not free).

<h5>meteor reset</h5>

Resets the project's mongo database. Be very careful when using this!

