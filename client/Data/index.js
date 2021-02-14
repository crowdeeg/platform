import { Data, Tasks, Assignments } from '/collections';
import moment from 'moment';
import { MaterializeModal } from '/client/Modals/modal.js'

let renderDate = (dateValue) => {
    if (dateValue instanceof Date) {
        return moment(dateValue).format('YYYY-MM-DD hh:mm');
    } else {
        return 'Never';
    }
}

Template.Data.events({
    'click .btn.download': function() {
        $(Template.instance().find('table.reactive-table')).table2csv();
    },
    'autocompleteselect input.task' (event, template, task) {
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
                                data: d._id,
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
                                    data: assignment.data._id,
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
                    template: Template.userAutocomplete
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
