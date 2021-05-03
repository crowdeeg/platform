Here are a few errors and solutions that were encountered while setting up CrowdEEG for the first time.

#### For Windows users: 

For Windows users I recommend completing all steps in a single shell (Cygwin, Windows Subsystem for Linux, etc). Swapping between different shells may cause unnecessary errors.
​
#### Error (Improper wfdb installation):
Error encountered while running the "make install" command on Windows 10 using Git Bash.
```sh
gcc  -Wno-implicit -Wformat  -g -O -DWFDB_MAJOR=10 -DWFDB_MINOR=6 -DWFDB_RELEASE=2 -DMSDOS -DNOVALUES_H -DNOMKSTEMP  -I/usr/local/include ann2rr.c -o ann2rr -L/usr/local/bin -lwfdb
ann2rr.c:30:10: fatal error: wfdb/wfdb.h: No such file or directory
 #include <wfdb/wfdb.h>
          ^~~~~~~~~~~~~
compilation terminated.
make[1]: *** [Makefile:306: ann2rr] Error 1
make[1]: Leaving directory 'C:/Users/ppate/wfdb/app'
make: *** [Makefile:297: install] Error 2
```
​
Error encountered while running the _up_ file on Windows Subsystem for Linux using Ubuntu.
```sh
=> Started proxy.
=> Meteor 2.2 is available. Update this project with 'meteor update'.
W20210429-11:18:38.786(-4)? (STDERR) The `stylus` package has been deprecated.
W20210429-11:18:38.935(-4)? (STDERR)
W20210429-11:18:38.935(-4)? (STDERR) To continue using the last supported version
W20210429-11:18:38.936(-4)? (STDERR) of this package, pin your package version to
W20210429-11:18:38.936(-4)? (STDERR) 2.513.14 (`meteor add stylus@=2.513.14`).
I20210429-11:18:40.215(-4)? Patient #SC4001E0 (xesyqragDjFySS5nD) already exists. Re-using patient ...
I20210429-11:18:40.216(-4)? SC4001E0-PSG.edf SC4001E0
W20210429-11:18:40.427(-4)? (STDERR)
W20210429-11:18:40.428(-4)? (STDERR) /home/parthp/.meteor/packages/promise/.0.11.2.u1du0j.r5q3k++os+web.browser+web.browser.legacy+web.cordova/npm/node_modules/meteor-promise/promise_server.js:218
W20210429-11:18:40.428(-4)? (STDERR)       throw error;
W20210429-11:18:40.429(-4)? (STDERR)       ^
W20210429-11:18:40.431(-4)? (STDERR) errorClass [Error]: Command failed: WFDB="/mnt/c/Users/ppate/Desktop/CrowdEEG/platform/galaxy-app/edf//physionet/edfx/" wfdbdesc "SC4001E0-PSG.edf"
W20210429-11:18:40.434(-4)? (STDERR) /bin/sh: 1: wfdbdesc: not found
W20210429-11:18:40.435(-4)? (STDERR)  [wfdb.wfdbdesc.command.failed]
W20210429-11:18:40.436(-4)? (STDERR)     at Object.wfdbdesc (server/EDFBackend.js:49:13)
W20210429-11:18:40.437(-4)? (STDERR)     at MethodInvocation.get.edf.metadata (server/EDFBackend.js:324:35)
W20210429-11:18:40.438(-4)? (STDERR)     at maybeAuditArgumentChecks (packages/ddp-server/livedata_server.js:1771:12)
W20210429-11:18:40.438(-4)? (STDERR)     at packages/ddp-server/livedata_server.js:1689:15
W20210429-11:18:40.439(-4)? (STDERR)     at Meteor.EnvironmentVariable.EVp.withValue (packages/meteor.js:1234:12)
W20210429-11:18:40.440(-4)? (STDERR)     at packages/ddp-server/livedata_server.js:1687:36
W20210429-11:18:40.461(-4)? (STDERR)     at new Promise (<anonymous>)
W20210429-11:18:40.462(-4)? (STDERR)     at Server.applyAsync (packages/ddp-server/livedata_server.js:1686:12)
W20210429-11:18:40.464(-4)? (STDERR)     at Server.apply (packages/ddp-server/livedata_server.js:1625:26)
W20210429-11:18:40.465(-4)? (STDERR)     at Server.call (packages/ddp-server/livedata_server.js:1607:17)
W20210429-11:18:40.466(-4)? (STDERR)     at server/dataInitialization/basicDemo.js:173:36
W20210429-11:18:40.466(-4)? (STDERR)     at Array.forEach (<anonymous>)
W20210429-11:18:40.467(-4)? (STDERR)     at server/dataInitialization/basicDemo.js:147:20
W20210429-11:18:40.470(-4)? (STDERR)     at Function.time (/mnt/c/Users/ppate/Desktop/CrowdEEG/platform/.meteor/local/build/programs/server/profile.js:273:30)
W20210429-11:18:40.499(-4)? (STDERR)     at /mnt/c/Users/ppate/Desktop/CrowdEEG/platform/.meteor/local/build/programs/server/boot.js:415:15
W20210429-11:18:40.513(-4)? (STDERR)     at /mnt/c/Users/ppate/Desktop/CrowdEEG/platform/.meteor/local/build/programs/server/boot.js:465:7
W20210429-11:18:40.514(-4)? (STDERR)  => awaited here:
W20210429-11:18:40.514(-4)? (STDERR)     at Promise.await (/home/parthp/.meteor/packages/promise/.0.11.2.u1du0j.r5q3k++os+web.browser+web.browser.legacy+web.cordova/npm/node_modules/meteor-promise/promise_server.js:60:12)
W20210429-11:18:40.516(-4)? (STDERR)     at Server.apply (packages/ddp-server/livedata_server.js:1638:22)
W20210429-11:18:40.517(-4)? (STDERR)     at Server.call (packages/ddp-server/livedata_server.js:1607:17)
W20210429-11:18:40.517(-4)? (STDERR)     at server/dataInitialization/basicDemo.js:173:36
W20210429-11:18:40.520(-4)? (STDERR)     at Array.forEach (<anonymous>)
W20210429-11:18:40.577(-4)? (STDERR)     at server/dataInitialization/basicDemo.js:147:20
W20210429-11:18:40.580(-4)? (STDERR)     at Function.time (/mnt/c/Users/ppate/Desktop/CrowdEEG/platform/.meteor/local/build/programs/server/profile.js:273:30)
W20210429-11:18:40.590(-4)? (STDERR)     at /mnt/c/Users/ppate/Desktop/CrowdEEG/platform/.meteor/local/build/programs/server/boot.js:415:15
W20210429-11:18:40.591(-4)? (STDERR)     at /mnt/c/Users/ppate/Desktop/CrowdEEG/platform/.meteor/local/build/programs/server/boot.js:465:7
W20210429-11:18:40.593(-4)? (STDERR)     at Function.run (/mnt/c/Users/ppate/Desktop/CrowdEEG/platform/.meteor/local/build/programs/server/profile.js:280:14)
W20210429-11:18:40.595(-4)? (STDERR)     at /mnt/c/Users/ppate/Desktop/CrowdEEG/platform/.meteor/local/build/programs/server/boot.js:463:13 {
W20210429-11:18:40.612(-4)? (STDERR)   isClientSafe: true,
W20210429-11:18:40.616(-4)? (STDERR)   error: 'wfdb.wfdbdesc.command.failed',
W20210429-11:18:40.617(-4)? (STDERR)   reason: 'Command failed: WFDB="/mnt/c/Users/ppate/Desktop/CrowdEEG/platform/galaxy-app/edf//physionet/edfx/" wfdbdesc "SC4001E0-PSG.edf"\n' +
W20210429-11:18:40.621(-4)? (STDERR)     '/bin/sh: 1: wfdbdesc: not found\n',
W20210429-11:18:40.648(-4)? (STDERR)   details: undefined,
W20210429-11:18:40.649(-4)? (STDERR)   errorType: 'Meteor.Error'
W20210429-11:18:40.669(-4)? (STDERR) }
=> Exited with code: 1
=> Your application is crashing. Waiting for file change.
```
​
#### Solution: 
Whichever shell you select use it for everything regarding CrowdEEG
##### Windows Subsystem for Linux (Ubuntu)
Follow this link. Complete the instructions any time before calling the ```./configure && make install``` command. Instead of the ```make install``` command you will be prompted to use the ```sudo make install ``` command.
https://christophep.wordpress.com/2018/11/10/installing-wsl-ubuntu-bash-gcc-g-on-windows-10/
​
##### Cygwin
Follow this link and instructions from subheading "Cygwin/64 build and install (excluding WAVE)"
it will guilde you through the ```./configure && make install``` steps of the setup.
https://archive.physionet.org/physiotools/wfdb-windows-quick-start.shtml
​
---
​
#### Error (Mongo exit code null):
When running the commands in the _up_ file using Windows subsystem for Linux (version 1). Ubuntu 20.04
```sh
=> Started proxy.
Unexpected mongo exit code null. Restarting.
Unexpected mongo exit code null. Restarting.
=> Meteor 2.2 is available. Update this project with 'meteor update'.
Unexpected mongo exit code null. Restarting.
Unexpected mongo exit code null. Restarting.
Unexpected mongo exit code null. Restarting.
Can`t start Mongo server.
```
​
#### Solution:
- you have to install the ZIP for windows here (https://www.mongodb.com/try/download/community),
​
- run the _mongo.exe_ file, copy the mongo url from the command prompt (e.g. mongodb://127.0.0.1:27017/?compressors=disabled&gssapiServiceName=mongodb).
​
- Then, shut down the mongo command prompt window, and run _mongo.exe_ from the command prompt (so cd into wherever you unzipped the zip file /bin/)  using the command ```mongo "mongodb://127.0.0.1:27017/?compressors=zlib&gssapiServiceName=mongodb"``` notice I changed compressors=disabled to compressors=zlib, that's why we had to run it, copy the link and rerun it after this modification. This link "mongodb://127.0.0.1:27017/?compressors=zlib&gssapiServiceName=mongodb"  is the mongo URL.
​
- add this ```MONGO_URL='the url copied'``` to the .environment  file in the base directory of the code, and run ```env $(cat .environment | xargs) meteor``` instead of ```./up```
​
​

#### For Mac OS users: 

Install Meteor on your computer. This is the web framework used for this project.
Install the Physionet WFDB command-line interface on your computer (instructions here). This is used to extract biosignal data from EEG files.
```sh
-tar xfz wfdb-10.6.2.tar.gz
-cd wfdb-10.6.2
-./configure
- make
-sudo make install
-make check
​
-alias ./edf /edf
```
​
#### Error 
- I got an error that caused the installation to fail because it could not create a database folder in a particular location. If that happens,you would manually need to locate the folder and then create it.
#### Solution
```sh
    -sudo mkdir <absolute path to the error folder> 
    -sudo chmod 755 <absolute path to the error folder>
```
​
​
Create a file called .environment in the project root with the following contents: 
EDF_DIR="/absolute/path/to/crowdeeg/platform/galaxy-app/edf"
This file is used by the ./up command to set the correct environment variables for the web application and the environment variable EDF_DIR tells the web app where to find the EDF files.
```sh
- meteor npm install --save @babel/runtime
./up
```
Run the ./up (command) in your terminal to start the web server locally.
#### Error encountered
W20210429-10:48:17.945(-4)? (STDERR) The `stylus` package has been deprecated.
W20210429-10:48:18.025(-4)? (STDERR) 
W20210429-10:48:18.025(-4)? (STDERR) To continue using the last supported version
W20210429-10:48:18.025(-4)? (STDERR) of this package, pin your package version to
W20210429-10:48:18.026(-4)? (STDERR) 2.513.14 (`meteor add stylus@=2.513.14`).
I20210429-10:48:18.424(-4)? Patient #SC4001E0 (DLskokaXmMTzLa94o) already exists. Re-using patient ...
I20210429-10:48:18.425(-4)? SC4001E0-PSG.edf SC4001E0
W20210429-10:48:18.557(-4)? (STDERR) 
W20210429-10:48:18.557(-4)? (STDERR) /Users/prakharsharma/.meteor/packages/promise/.0.11.2.cvynt8.js8ni++os+web.browser+web.browser.legacy+web.cordova/npm/node_modules/meteor-promise/promise_server.js:218
W20210429-10:48:18.558(-4)? (STDERR)       throw error;
W20210429-10:48:18.558(-4)? (STDERR)       ^
W20210429-10:48:18.559(-4)? (STDERR) errorClass [Error]: Command failed: WFDB="/Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/galaxy-app/edf/physionet/edfx/" wfdbdesc "SC4001E0-PSG.edf"
W20210429-10:48:18.559(-4)? (STDERR) init: can't open SC4001E0-PSG.edf
W20210429-10:48:18.560(-4)? (STDERR)  [wfdb.wfdbdesc.command.failed]
W20210429-10:48:18.560(-4)? (STDERR)     at Object.wfdbdesc (server/EDFBackend.js:50:13)
W20210429-10:48:18.560(-4)? (STDERR)     at MethodInvocation.get.edf.metadata (server/EDFBackend.js:325:35)
W20210429-10:48:18.560(-4)? (STDERR)     at maybeAuditArgumentChecks (packages/ddp-server/livedata_server.js:1771:12)
W20210429-10:48:18.560(-4)? (STDERR)     at packages/ddp-server/livedata_server.js:1689:15
W20210429-10:48:18.560(-4)? (STDERR)     at Meteor.EnvironmentVariable.EVp.withValue (packages/meteor.js:1234:12)
W20210429-10:48:18.560(-4)? (STDERR)     at packages/ddp-server/livedata_server.js:1687:36
W20210429-10:48:18.561(-4)? (STDERR)     at new Promise (<anonymous>)
W20210429-10:48:18.561(-4)? (STDERR)     at Server.applyAsync (packages/ddp-server/livedata_server.js:1686:12)
W20210429-10:48:18.561(-4)? (STDERR)     at Server.apply (packages/ddp-server/livedata_server.js:1625:26)
W20210429-10:48:18.561(-4)? (STDERR)     at Server.call (packages/ddp-server/livedata_server.js:1607:17)
W20210429-10:48:18.561(-4)? (STDERR)     at server/dataInitialization/basicDemo.js:173:36
W20210429-10:48:18.561(-4)? (STDERR)     at Array.forEach (<anonymous>)
W20210429-10:48:18.561(-4)? (STDERR)     at server/dataInitialization/basicDemo.js:147:20
W20210429-10:48:18.561(-4)? (STDERR)     at Function.time (/Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/.meteor/local/build/programs/server/profile.js:273:30)
W20210429-10:48:18.561(-4)? (STDERR)     at /Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/.meteor/local/build/programs/server/boot.js:415:15
W20210429-10:48:18.562(-4)? (STDERR)     at /Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/.meteor/local/build/programs/server/boot.js:465:7
W20210429-10:48:18.562(-4)? (STDERR)  => awaited here:
W20210429-10:48:18.562(-4)? (STDERR)     at Promise.await (/Users/prakharsharma/.meteor/packages/promise/.0.11.2.cvynt8.js8ni++os+web.browser+web.browser.legacy+web.cordova/npm/node_modules/meteor-promise/promise_server.js:60:12)
W20210429-10:48:18.562(-4)? (STDERR)     at Server.apply (packages/ddp-server/livedata_server.js:1638:22)
W20210429-10:48:18.562(-4)? (STDERR)     at Server.call (packages/ddp-server/livedata_server.js:1607:17)
W20210429-10:48:18.562(-4)? (STDERR)     at server/dataInitialization/basicDemo.js:173:36
W20210429-10:48:18.562(-4)? (STDERR)     at Array.forEach (<anonymous>)
W20210429-10:48:18.562(-4)? (STDERR)     at server/dataInitialization/basicDemo.js:147:20
W20210429-10:48:18.562(-4)? (STDERR)     at Function.time (/Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/.meteor/local/build/programs/server/profile.js:273:30)
W20210429-10:48:18.562(-4)? (STDERR)     at /Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/.meteor/local/build/programs/server/boot.js:415:15
W20210429-10:48:18.563(-4)? (STDERR)     at /Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/.meteor/local/build/programs/server/boot.js:465:7
W20210429-10:48:18.563(-4)? (STDERR)     at Function.run (/Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/.meteor/local/build/programs/server/profile.js:280:14)
W20210429-10:48:18.563(-4)? (STDERR)     at /Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/.meteor/local/build/programs/server/boot.js:463:13 {
W20210429-10:48:18.563(-4)? (STDERR)   isClientSafe: true,
W20210429-10:48:18.563(-4)? (STDERR)   error: 'wfdb.wfdbdesc.command.failed',
W20210429-10:48:18.563(-4)? (STDERR)   reason: 'Command failed: WFDB="/Users/prakharsharma/Desktop/Sunnybrook/CrowdEeg/platform/galaxy-app/edf/physionet/edfx/" wfdbdesc "SC4001E0-PSG.edf"\n' +
W20210429-10:48:18.563(-4)? (STDERR)     "init: can't open SC4001E0-PSG.edf\n",
W20210429-10:48:18.563(-4)? (STDERR)   details: undefined,
W20210429-10:48:18.563(-4)? (STDERR)   errorType: 'Meteor.Error'
W20210429-10:48:18.563(-4)? (STDERR) }
​
#### Solution 
The above could be happening becasue there exists \r in the downloaded code that is not read by unix. We will convert it to unix using the following.
You would need to install : dos2unix
I personally use Brew to install this:
```sh
-brew install dos2unix # Installs dos2unix Mac
-find . -type f -exec dos2unix {} \;
```
You would also need to go to the following CrowdEeg/platform/galaxy-app/edf/physionet/edfx/:
and ensure that tou have "SC4001E0-PSG.edf" and not "SC4001E0-PSG.edf  " or "SC4001E0-PSG  .edf"f