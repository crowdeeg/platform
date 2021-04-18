import { Patients, Data, Tasks, Assignments, Annotations, Preferences } from '/collections';

const userAccounts = {
    'ADMIN': {
        username: 'Admin User',
        email: 'admin@example.com',
        password: 'changeme1234',
        roles: {
            '__global_roles__': [ 'admin' ],
        },
    },
    'TEST': {
        username: 'Test User',
        email: 'test@example.com',
        password: 'test',
        roles: {
            '__global_roles__': [ 'tester' ],
        },
    },
}
const rootUser = userAccounts['ADMIN'];
const testUser = userAccounts['TEST'];

const recordingPaths = [
    '/physionet/edfx/SC4001E0-PSG.edf'
];

Meteor.startup(() => {
    for (let userName in userAccounts) {
        const user = userAccounts[userName];
        const userDoc = Accounts.findUserByEmail(user.email);
        if (userDoc) {
            user._id = userDoc._id;
        }
        else {
            user._id = Accounts.createUser({
                username: user.username,
                email: user.email,
                password: user.password,
            });
            if (user.roles) {
                for (var group in user.roles) {
                    Roles.addUsersToRoles(user._id, user.roles[group], group);
                }
            }
            console.log('Created user account "' + user.username + '", "' + user.email + '" (' + user._id + ')');
        }
    }

    const taskName = 'Sleep Staging (Physionet EDFX)';
    let task = Tasks.findOne({ name: taskName });
    let taskId;
    if (task) {
        taskId = task._id;
    }
    if (!task) {
        taskId = Tasks.insert({
            name: taskName,
            allowedDataTypes: ['EDF'],
            annotator: 'EDF',
            annotatorConfig: {
                defaultMontage: 'Show all Signals',
                channelsDisplayed: {
                    'Show all Signals': [
                        '0', // EEG Fpz-Cz
                        '1', // EEG Pz-Oz
                        'EOG=2', // EOG horizontal
                        'Resp=3', // Resp oro-nasal
                        'EMG=4', // EMG submental
                        'Temp=5', // Temp rectal
                    ],
                    'EEG + EOG + Chin EMG': [
                        '0', // EEG Fpz-Cz
                        '1', // EEG Pz-Oz
                        'EOG=2', // EOG horizontal
                        'EMG=4', // EMG submental
                    ],
                },
                channelGains: {
                    "Show all Signals": [
                        1,
                        1,
                        0.8,
                        0.10737418240000006,
                        1009.7419586828951,
                        2.44140625
                    ],
                    "EEG + EOG + Chin EMG": [
                        1.5625,
                        2.44140625,
                        0.5120000000000001,
                        1009.741958682895
                    ]
                },
                staticFrequencyFiltersByDataModality: {
                    'EEG': { highpass: 0.3, lowpass: 35 },
                    'EOG': { highpass: 0.3, lowpass: 35 },
                    'EMG': { highpass: 10, lowpass: 100 },
                    'RESP': { highpass: 0.01, lowpass: 15 },
                },
                frequencyFilters: [{
                    title: 'Notch',
                    type: 'notch',
                    options: [
                        {
                            name: '60 Hz',
                            value: 60,
                        },
                        {
                            name: '50 Hz',
                            value: 50,
                        },
                        {
                            name: 'off',
                            value: undefined,
                            default: true,
                        },
                    ],
                }],
                targetSamplingRate: 32,
                useHighPrecisionSampling: false,
                startTime: 0,
                windowSizeInSeconds: 30,
                preloadEntireRecording: false,
                showReferenceLines: true,
                showSleepStageButtons: true,
                showChannelGainAdjustmentButtons: false,
                showBackToLastActiveWindowButton: false,
                showInputPanelContainer: false,
                showBookmarkCurrentPageButton: false,
                showFastForwardButton: false,
                showFastBackwardButton: false,
                graph: {
                    height: 530,
                    enableMouseTracking: true,
                },
                features: {
                    order: [],
                    options: {}
                }
            }
        });
        task = Tasks.findOne(taskId);
        console.log('Created Task "' + taskName + '" (' + taskId + ')');
    }

    recordingPaths.forEach((recordingPath) => {
    	const recordingPathParts = recordingPath.split('/');
        const recordingFilename = recordingPathParts[recordingPathParts.length - 1];
        let data = Data.findOne({
            name: recordingFilename,
            type: 'EDF',
            path: recordingPath,
        });
        if (data) return;
        let patientNumber = recordingFilename.split('-')[0];
        patientNumber = '' + patientNumber;
        let patient = Patients.findOne({
            id: patientNumber,
        });
        let patientId;
        if (patient) {
            patientId = patient._id;
            console.log('Patient #' + patientNumber + ' (' + patientId + ') already exists. Re-using patient ...');                
        }
        else {
            patientId = Patients.insert({
                id: patientNumber,
            });
            console.log('Created Patient #' + patientNumber + ' (' + patientId + ')');
        }
        console.log(recordingFilename, patientNumber);
        const metadataEDF = Meteor.call('get.edf.metadata', recordingPath);
        const metadata = {
            wfdbdesc: metadataEDF,
        };
        const dataId = Data.insert({
            name: recordingFilename,
            type: 'EDF',
            patient: patientId,
            path: recordingPath,
            metadata: metadata,
        });
        data = Data.findOne(dataId);
        console.log('Created Data "' + recordingPath + '" (' + dataId + ')');
        console.log(metadata.wfdbdesc.Groups[0]);
    });

    recordingPaths.forEach((recordingPath) => {
        const recordingPathParts = recordingPath.split('/');
        const recordingFilename = recordingPathParts[recordingPathParts.length - 1];
        let data = Data.findOne({
            name: recordingFilename,
            type: 'EDF',
            path: recordingPath,
        });
        if (!data) return;

        assignment = Assignments.findOne({
            users: testUser._id,
            task: taskId,
            data: data._id,
        });
        if (!assignment) {
            const assignmentId = Assignments.insert({
                users: [ testUser._id ],
                task: taskId,
                data: data._id,
                status: 'Pending',
            });
            console.log('Created Assignment for Task "' + task.name + '", User "' + testUser.email + '" and Data "' + data.name + '" (' + assignmentId + ')');
        }
    });
});
