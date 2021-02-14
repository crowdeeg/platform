#!/bin/sh
if [ -n "$EFS_FILE_SYSTEM_ID" ]; then
    EFS_MOUNT_DIR=/efs_volume
    EC2_AVAILABILITY_ZONE=`curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone`
    EC2_REGION="`echo \"$EC2_AVAILABILITY_ZONE\" | sed -e 's:\([0-9][0-9]*\)[a-z]*\$:\\1:'`"
    mkdir -p $EFS_MOUNT_DIR
    mount -v -t nfs4 -o nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2 $EC2_AVAILABILITY_ZONE.$EFS_FILE_SYSTEM_ID.efs.$EC2_REGION.amazonaws.com:/ $EFS_MOUNT_DIR
fi

node main.js
