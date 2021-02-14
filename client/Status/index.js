import { Assignments, Annotations } from '/collections';
import moment from 'moment';

let renderDate = (dateValue) => {
    if (dateValue instanceof Date) {
        return moment(dateValue).format('YYYY-MM-DD hh:mm');
    } else {
        return 'Never';
    }
}

let renderAnnotationsImported = (annotationsImported) => {
    if (annotationsImported) {
        return 'External';
    }
    return 'Internal';
}

let stringifyComplexObject = (object) => {
    if (object === undefined || object === null) {
        return '';
    }
    if (typeof object === 'object') {
        return JSON.stringify(object);
    }
    return object;
}

let separateWithSpacesAndCapitalize = (str) => {
    return str.split('_').map(f => f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()).join(' ');
}

Template.Status.events({
    'click .btn.download': function() {
        $(Template.instance().find('table.reactive-table')).table2csv();
    }
});

Template.Status.helpers({
    settings() {
        const testerIds = Roles.getUsersInRole('tester').fetch().map(user => user._id);
        const assignments = Assignments.find({ users: { $nin: testerIds } }).fetch();
        const annotationFields = {};
        assignments.forEach((assignment) => {
            assignment.taskName = assignment.taskName();
            assignment.patientId = assignment.patientId();
            assignment.dataPath = assignment.dataPath();
            assignment.dataLengthInSeconds = assignment.dataLengthInSeconds();
            assignment.dataLengthFormatted = assignment.dataLengthFormatted();
            assignment.userNames = assignment.userNames();
            assignment.createdAt = renderDate(assignment.createdAt);
            assignment.updatedAt = renderDate(assignment.updatedAt);
            assignment.source = renderAnnotationsImported(assignment.annotationsImported);
            const annotations = Annotations.find({
                assignment: assignment._id,
                data: assignment.data,
                type: { $ne: 'SIGNAL_ANNOTATION' },
            }, { fields: { 'value.metadata': 0 } }).fetch();
            annotations.forEach((annotation) => {
                const annotationKey = '__annotation__' + annotation.type;
                const annotationLabel = separateWithSpacesAndCapitalize(annotation.type);
                annotationFields[annotationKey] = annotationLabel;
                if (assignment[annotationKey] === undefined || assignment[annotationKey] === null) {
                    assignment[annotationKey] = annotation.value;
                }
                else if (Array.isArray(assignment[annotationKey])) {
                    assignment[annotationKey].push(annotation.value);
                }
                else {
                    assignment[annotationKey] = [ assignment[annotationKey] ];
                }
            });
        });
        fields = [
            {
                key: 'userNames',
                label: 'Reader',
            },
            {
                key: 'patientId',
                label: 'Patient #',
            },
            {
                key: 'dataPath',
                label: 'Recording',
                hidden: true,
            },
            {
                key: 'dataLengthInSeconds',
                label: 'Recording Length [seconds]',
                hidden: true,
            },
            {
                key: 'dataLengthFormatted',
                label: 'Recording Length (formatted)',
                hidden: true,
            },
            {
                key: 'taskName',
                label: 'Task',
            },
            {
                key: 'source',
                label: 'Source',
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
                key: 'status',
                label: 'Status',
            },
        ];
        Object.keys(annotationFields).forEach((key) => {
            const label = annotationFields[key];
            fields.push({ key, label, hidden: true, fn: stringifyComplexObject });
        });
        return {
            collection: assignments,
            showColumnToggles: true,
            showRowCount: true,
            rowClass: function(assignment) {
                switch (assignment.status) {
                    case 'Pending':
                        return 'grey lighten-4';
                    case 'In Progress':
                        return 'yellow lighten-4';
                    case 'Completed':
                        return 'green lighten-4';
                    default:
                    return ''
                }
            },
            filters: [
                'filterReader',
                'filterStatus',
                'filterPatientId',
                'filterTaskName',
                'filterSource',
                'filterDataPath',
            ],
            fields: fields,
        };
    },
    filterFieldsReader: ['userNames'],
    filterFieldsStatus: ['status'],
    filterFieldsPatientId: ['patientId'],
    filterFieldsTaskName: ['taskName'],
    filterFieldsSource: ['source'],
    filterFieldsDataPath: ['dataPath'],
})