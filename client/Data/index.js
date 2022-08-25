import { Data, Tasks, Assignments, EDFFile, Patients } from '/collections';
import moment from 'moment';
import { MaterializeModal } from '/client/Modals/modal.js'

// double dictionary for task inference
let taskDictionary = {};
let dataDictionary = {};

let renderDate = (dateValue) => {
    if (dateValue instanceof Date) {
        return moment(dateValue).format('YYYY-MM-DD hh:mm');
    } else {
        return 'Never';
    }
}

let getSignalNameSet = (fileMetadata) => {
    let set = new Set();
    fileMetadata.Groups.forEach(element => {
        Object.keys(element.SignalsByName).forEach(element => {
            set.add(element);
        })
    });
    return set;
}

let assembleTaskObj = (signalNameSet, source, file) => {
    if (source === "Other") {
        // Create a task displaying all channels.
        let taskDocument = {
            name: "edf annotation from template: " + file,
            allowedDataTypes: ["EDF"],
            annotator: "EDF",
            annotatorConfig: {
              defaultMontage: source, 
              channelsDisplayed: {
                "Other": {
                    "Other": Array.from(signalNameSet).map(element => {
                        return "'" + element + "'";
                    })
                }
              },
              channelGains: {
                    "Other": new Array(signalNameSet.size).fill(1)
              }, 
              staticFrequencyFiltersByDataModality: {
                "'F4-A1'": { highpass: 0.3, lowpass: 35 },
                "'C4-A1'": { highpass: 0.3, lowpass: 35 },
                "'O2-A1'": { highpass: 0.3, lowpass: 35 },
                "'Chin1-Chin2'": { highpass: 10, lowpass: 100 },
                "'LOC-O2'": { highpass: 0.3, lowpass: 35 },
                "'ECG'": { highpass: 0.3, lowpass: 70 },
                "'Leg/L'": { highpass: 10, lowpass: 100 },
                "'Leg/R'": { highpass: 10, lowpass: 100 },
                "'Snore'": { highpass: 10, lowpass: 100 },
                "'Airflow'": { highpass: 0.01, lowpass: 15 },
                "Nasal Pressure": { highpass: 0.01, lowpass: 15 },
                "'Thor'": { highpass: 0.01, lowpass: 15 },
                "'Abdo'": { highpass: 0.01, lowpass: 15 },

                "'EEG'": { highpass: 0.3, lowpass: 35 },
                "'EOG'": { highpass: 0.3, lowpass: 35 },
                "'EMG'": { highpass: 10, lowpass: 100 },
                "'RESP'": { highpass: 0.01, lowpass: 15 },

                "'A1'": { highpass: 0.3, lowpass: 35 },
                "'A2'": { highpass: 0.3, lowpass: 35 },

                "'ROC'": { highpass: 0.3, lowpass: 35 },

                "'Chin 2'": { highpass: 10, lowpass: 100 },

                "'eeg-ch1 - eeg-ch2'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch4 - eeg-ch2'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch1'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch4'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch1-eeg-ch4'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch4-eeg-ch3'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch2'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch3'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch2'": { highpass: 0.3, lowpass: 35 },
                "'eeg-ch3'": { highpass: 0.3, lowpass: 35 },
                "'ppg-ch2'": { highpass: 0.1, lowpass: 5 },
                "'Temp'": { highpass: 10, lowpass: 100 },
                "'light'": { highpass: 10, lowpass: 100 },
                "'ENMO'": { highpass: 10, lowpass: 100 },
                "'z - angle'": { highpass: 10, lowpass: 100 },
              }, //
              frequencyFilters: [
                {
                  title: "Notch",
                  type: "notch",
                  options: [
                    {
                      name: "60 Hz",
                      value: 60,
                    },
                    {
                      name: "50 Hz",
                      value: 50,
                    },
                    {
                      name: "off",
                      value: undefined,
                      default: true,
                    },
                  ],
                },
              ],
              targetSamplingRate: 32,
              useHighPrecisionSampling: false,
              startTime: 0,
              windowSizeInSeconds: 30,
              preloadEntireRecording: false,
              showReferenceLines: false,
              showSleepStageButtons: false,
              showChannelGainAdjustmentButtons: false,
              showBackToLastActiveWindowButton: false,
              showInputPanelContainer: false,
              showBookmarkCurrentPageButton: false,
              showFastForwardButton: true,
              showFastBackwardButton: true,
              graph: {
                height: 530,
                enableMouseTracking: true,
              },
              features: {
                order: ["sleep_spindle", "k_complex", "rem", "vertex_wave"],
                options: {},
              },
            },
          }
        return taskDocument;

    }
}


Template.Data.events({
    'click .btn.download': function() {
        $(Template.instance().find('table.reactive-table')).table2csv();
    },
    'click .btn.upload': function() {
        const files = document.getElementById("File");
        console.log(files.files);

        for (let i = 0; i < files.files.length; i++) {

            const input = files.files[i];
      

        if (input) {
            const reader = new FileReader();
      
            reader.onload = function (e) {
              
                console.log("initiating file upload");
    
                var uploadInstance = EDFFile.insert({
                  file: input,
                  chunkSize: 'dynamic'
                }, false);
        
                uploadInstance.on('end', function(error, fileObj) {
                  if (error) {
                    window.alert('Error during upload: ' + error.reason);
                  } else {
                    window.alert('File "' + fileObj.name + '" successfully uploaded');
                    console.log(uploadInstance.config.fileId);
    
                    const recordingPath = `/uploaded/${uploadInstance.config.fileId}.edf`;

                    let promise = new Promise((resolve, reject) => {
                        Meteor.call("get.edf.metadata", recordingPath,
                            (error, results) => {
                                if (error) {
                                throw new Error("Cannot get recording metadata\n" + error);
                                }
                                
                                return resolve(results);
                            }
                        );
                    });

                    promise.then(result => {
                        console.log(result);
                        patientId = Patients.insert({
                            id: "Unspecified Patient - " + fileObj.name,
                          });
                        // Data object creation
                        var dataDocument = {
                            name: fileObj.name,
                            type: "EDF",
                            source: "Other",
                            patient: patientId,
                            path: recordingPath,
                            metadata: {wfdbdesc: result},
                        }
          
                        var dataId = Data.insert(dataDocument);
                        console.log(dataId);

                        let signalNameSet = getSignalNameSet(result);
                        let signalNameString = [...signalNameSet].join(' ');

                        dataDictionary[dataId] = signalNameString;

                        let temp = taskDictionary[signalNameString];

                        if (!temp) {
                            let taskDocument = assembleTaskObj(signalNameSet, "Other", fileObj.name);
                            console.log(taskDocument);
                            let taskID = Tasks.insert(taskDocument);
                            console.log(taskID);

                            taskDictionary[signalNameString] = taskID
                        } 
                        

                    });
                    
                  }
                });
        
                uploadInstance.start();
              
              
            };
            reader.readAsText(input);
          }}
    },
    'autocompleteselect input.task' (event, template, task) {
        console.log(task);
        template.selectedTask.set(task);
    },
    'autocompleteselect input.assignee' (event, template, user) {
        const selectedAssignees = template.selectedAssignees.get();
        selectedAssignees[user._id] = user;
        template.selectedAssignees.set(selectedAssignees);
    },
    'click .assignees .delete' (event, template) {
        const dataId = $(event.currentTarget).data('id');
        const selectedAssignees = template.selectedAssignees.get();
        delete selectedAssignees[dataId];
        template.selectedAssignees.set(selectedAssignees);
    },
    'click .btn.assign' (event, template) {
        const modalTransitionTimeInMilliSeconds = 300;
        MaterializeModal.form({
            title: '',
            bodyTemplate: 'assignSettingsForm',
            submitLabel: '<i class="fa fa-check left"></i> Preview Assignments',
            closeLabel: '<i class="fa fa-times left"></i> Cancel',
            outDuration: modalTransitionTimeInMilliSeconds,
            callback (error, response) {
                if (error) {
                    alert(error);
                    return;
                }
                if (!response.submit) return;
                const r = response.value;

                const task = template.selectedTask.get();
                const data = Object.values(template.selectedData.get());
                const assigneesDict = template.selectedAssignees.get();
                const assignees = Object.values(template.selectedAssignees.get());

                const assignmentsByAssignee = {};
                assignees.forEach((assignee) => {
                    const assignmentsForAssignee = []
                    data.forEach((d) => {
                        let doAssign = true;
                        if (r.avoidDuplicateAssignmentsForIndividualReaders) {
                            const duplicateAssignment = Assignments.findOne({
                                task: task._id,
                                users: assignee._id,
                                dataFiles: [d._id],
                            });
                            if (duplicateAssignment) {
                                doAssign = false;
                            }
                        }
                        assignmentsForAssignee.push({
                            doAssign: doAssign,
                            data: d,
                        });
                    });
                    assignmentsByAssignee[assignee._id] = assignmentsForAssignee;
                });

                let assignmentsFormatted = '';
                Object.keys(assignmentsByAssignee).forEach((assigneeId) => {
                    const assignee = assigneesDict[assigneeId];
                    const assignments = assignmentsByAssignee[assigneeId];
                    activeAssignments = assignments.filter(a => a.doAssign);
                    assignmentsFormatted += '<b>' + assignee.username + '</b> (' + activeAssignments.length + '):<br><br><ul>';
                    assignments.forEach((assignment) => {
                        const dataPath = assignment.data.pathAndLengthFormatted();
                        if (assignment.doAssign) {
                            assignmentsFormatted += '<li><b>' + dataPath + '</b></li>';
                        }
                        else {
                            assignmentsFormatted += '<li><strike>' + dataPath + '</strike></li>';
                        }
                    });
                    assignmentsFormatted += '</ul>';
                });

                window.setTimeout(function() { MaterializeModal.confirm({
                    title: 'Confirm assignments',
                    message: 'Your selection resulted in the following list of assignments:<br><br>' + assignmentsFormatted,
                    submitLabel: '<i class="fa fa-check left"></i> Create Assignment(s)',
                    closeLabel: '<i class="fa fa-times left"></i> Cancel',
                    outDuration: modalTransitionTimeInMilliSeconds,
                    callback (error, response) {
                        if (error) {
                            alert(error);
                            return;
                        }
                        if (!response.submit) {
                            return;
                        }
                        
                        Object.keys(assignmentsByAssignee).forEach((assigneeId) => {
                            const assignee = assigneesDict[assigneeId];
                            const assignments = assignmentsByAssignee[assigneeId];
                            assignments.forEach((assignment) => {
                                if (!assignment.doAssign) return;
                                Assignments.insert({
                                    users: [ assigneeId ],
                                    task: task._id,
                                    dataFiles: [assignment.data._id],
                                });
                            });
                        });

                        template.selectedTask.set(false);
                        template.selectedData.set({});
                        template.selectedAssignees.set({});

                        window.setTimeout(function() { MaterializeModal.message({
                            title: 'Done!',
                            message: 'Your selected assignments have been created successfully.',
                            outDuration: modalTransitionTimeInMilliSeconds,
                        }); }, modalTransitionTimeInMilliSeconds);
                    },
                }); }, modalTransitionTimeInMilliSeconds);
            },
        });
    },
});

Template.Data.helpers({
    settings() {
        const selectedData = Template.instance().selectedData;
        const data = Data.find({}).fetch();
        data.forEach((d) => {
            d.lengthFormatted = d.lengthFormatted();
            d.lengthInSeconds = d.lengthInSeconds();
            d.createdAt = renderDate(d.createdAt);
            d.updatedAt = renderDate(d.updatedAt);
            d.numAssignmentsNotCompleted = d.numAssignmentsNotCompleted();
            d.numAssignmentsInProgress = d.numAssignmentsInProgress();
            d.numAssignmentsPending = d.numAssignmentsPending();
            d.numAssignmentsCompleted = d.numAssignmentsCompleted();
            d.numAssignments = d.numAssignments();
            d.assigneeNames = d.assigneeNames();
            const patientDoc = d.patientDoc();
            if (patientDoc) {
                d.patientId = patientDoc.id;
                d.patientAge = patientDoc.age;
                d.patientSex = patientDoc.sex;
            }
        });
        fields = [
            {
                key: 'path',
                label: 'Path',
                sortOrder: 1,
                sortDirection: 'asc',
            },
            {
                key: 'lengthFormatted',
                label: 'Length (formatted)',
            },
            {
                key: 'lengthInSeconds',
                label: 'Length [seconds]',
                hidden: true,
            },
            {
                key: 'patientId',
                label: 'Patient #',
                sortOrder: 0,
                sortDirection: 'asc',
            },
            {
                key: 'patientAge',
                label: 'Age',
            },
            {
                key: 'patientSex',
                label: 'Sex',
            },
            {
                key: 'numAssignments',
                label: '# Assignments',
            },
            {
                key: 'numAssignmentsCompleted',
                label: '# Assignments Completed',
            },
            {
                key: 'numAssignmentsNotCompleted',
                label: '# Assignments Not Completed',
                hidden: true,
            },
            {
                key: 'numAssignmentsInProgress',
                label: '# Assignments In Progress',
                hidden: true,
            },
            {
                key: 'numAssignmentsPending',
                label: '# Assignments Pending',
                hidden: true,
            },
            {
                key: 'assigneeNames',
                label: 'Assignees',
            },
            {
                key: 'capturedAt',
                label: 'Captured',
                sortOrder: 2,
                sortDirection: 'asc',
            },
            {
                key: 'createdAt',
                label: 'Created',
                hidden: true,
            },
            {
                key: 'updatedAt',
                label: 'Last Updated',
                hidden: true,
            },
            {
                key: 'selectFn',
                label: 'Selected',
                fn: (value, object, key) => {
                    const inputId = 'select-data-' + object._id;
                    let checkedString = '';
                    if (selectedData.get()[object._id]) {
                        checkedString = ' checked="checked"';
                    }
                    return new Spacebars.SafeString('<input type="checkbox"' + checkedString + ' class="select-data" id="' + inputId + '" data-id="' + object._id + '"><label for="' + inputId + '"></label>');
                }
            },
        ];
        return {
            collection: data,
            showColumnToggles: true,
            showRowCount: true,
            rowsPerPage: 10,
            rowClass: function(data) {
                if (selectedData.get()[data._id]) {
                    return 'selected-data ';
                }
                else if (data.numAssignmentsCompleted > 0) {
                    return 'green lighten-4';
                }
                else if (data.numAssignmentsInProgress > 0) {
                    return 'yellow lighten-4';
                }
                else if (data.numAssignmentsPending > 0) {
                    return 'blue lighten-4';
                }
                return '';
            },
            filters: [
                'filterDataPath',
                'filterPatientId',
                'filterPatientAge',
                'filterNumAssignments',
            ],
            fields: fields,
        };
    },
    filterFieldsDataPath: ['path'],
    filterFieldsPatientId: ['patientId'],
    filterFieldsPatientAge: ['patientAge'],
    filterFieldsNumAssignments: ['numAssignments'],
    data() {
        return Object.values(Template.instance().selectedData.get());
    },
    taskAutocompleteSettings() {
        return {
            limit: Number.MAX_SAFE_INTEGER,
            rules: [
                {
                    collection: Tasks,
                    field: 'name',
                    matchAll: true,
                    template: Template.taskAutocomplete
                }
            ]
        }
    },
    task() {
        return Template.instance().selectedTask.get();
    },
    singleUserAutocompleteSettings() {
        return {
            limit: Number.MAX_SAFE_INTEGER,
            rules: [
                {
                    collection: Meteor.users,
                    field: 'username',
                    matchAll: true,
                    template: Template.userAutocomplete,
                }
            ]
        }
    },
    assignees() {
        return Object.values(Template.instance().selectedAssignees.get());
    },
});

Template.Data.events({
    'change .data .reactive-table tbody input[type="checkbox"].select-data': function (event, template) {
        const target = $(event.target);
        const isSelected = target.is(':checked');
        const dataId = target.data('id');
        const selectedData = template.selectedData.get();
        if (isSelected) {
            const data = Data.findOne(dataId);
            selectedData[dataId] = data;
            
            let signalNameString = dataDictionary[dataId];
            // console.log(signalNameString);
            // console.log(dataDictionary);
            // console.log(dataId);
            if (signalNameString) {
                let taskId = taskDictionary[signalNameString];
                // console.log(taskId);
                // console.log(taskDictionary);
                if (taskId) {
                    const task = Tasks.findOne(taskId);
                    // console.log(task);
                    template.selectedTask.set(task);
                }
            }
            let user = Meteor.user();

            console.log(user);

            let selectedAssignees = template.selectedAssignees.get();
            selectedAssignees[user._id] = user;
            template.selectedAssignees.set(selectedAssignees);

        }
        else {
            delete selectedData[dataId];
        }
        template.selectedData.set(selectedData);
    }
});

Template.Data.onCreated(function() {
    this.selectedTask = new ReactiveVar(false);
    this.selectedData = new ReactiveVar({});
    this.selectedAssignees = new ReactiveVar({});
    
});
