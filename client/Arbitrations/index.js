import { Arbitrations } from '/collections';
import moment from 'moment';

let renderDate = (dateValue) => {
    if (dateValue instanceof Date) {
        return moment(dateValue).format('YYYY-MM-DD hh:mm');
    } else {
        return 'Never';
    }
}

Template.Arbitrations.events({
    'click .btn.download': function() {
        $(Template.instance().find('table.reactive-table')).table2csv();
    }
});

Template.Arbitrations.helpers({
    settings() {
        const arbitrations = Arbitrations.find({}).fetch();
        arbitrations.forEach((arbitration) => {
            arbitration.taskName = arbitration.taskName();
            arbitration.dataPath = arbitration.dataPath();
            arbitration.patientId = arbitration.patientId();
            arbitration.arbiters = arbitration.arbiterNamesPseudonymsLastModifiedAndStatus();
            arbitration.createdAt = renderDate(arbitration.createdAt);
            arbitration.updatedAt = renderDate(arbitration.updatedAt);
            arbitration.currentAssignmentUserNameAndStatus = arbitration.currentAssignmentUserNameAndStatusFormatted();
            arbitration.currentRoundNumber = parseInt(arbitration.currentRoundNumber || 0);
            arbitration.numDaysWaiting = arbitration.numDaysWaiting();
        });
        fields = [
            {
                key: 'arbiters',
                label: 'Adjudicators',
            },
            {
                key: 'patientId',
                label: 'Patient #',
                hidden: true,
            },
            {
                key: 'dataPath',
                label: 'Recording',
                hidden: true,
            },
            {
                key: 'taskName',
                label: 'Task',
                hidden: true,
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
                sortOrder: 1,
                sortDirection: 'asc',
            },
            {
                key: 'currentRoundNumber',
                label: 'Round',
                sortOrder: 2,
                sortDirection: 'asc',
            },
            {
                key: 'numDaysWaiting',
                label: '# Days Waiting',
                sortOrder: 0,
                sortDirection: 'desc',
            },
            {
                key: 'currentAssignmentUserNameAndStatus',
                label: 'Active Adjudicator',
            },
            {
                key: 'remindFn',
                label: '',
                fn: (value, object, key) => {
                    if (object.status === 'Completed' || object.status === 'Cancelled') {
                        return '';
                    }
                    return new Spacebars.SafeString('<button class="btn red lighten-2 remind">Remind</button>');
                }
            },
            {
                key: 'updateFn',
                label: '',
                fn: (value, object, key) => {
                    if (object.status === 'Completed' || object.status === 'Cancelled') {
                        return '';
                    }
                    return new Spacebars.SafeString('<button class="btn update">Next step</button>');
                }
            },
            {
                key: 'cancelFn',
                label: '',
                fn: (value, object, key) => {
                    if (object.status === 'Completed' || object.status === 'Cancelled') {
                        return '';
                    }
                    return new Spacebars.SafeString('<button class="btn grey cancel">Cancel</button>');
                }
            },
        ];
        return {
            collection: arbitrations,
            showColumnToggles: true,
            showRowCount: true,
            rowsPerPage: Math.min(100, arbitrations.length),
            rowClass: function(arbitration) {
                switch (arbitration.status) {
                    case 'Independent Annotation':
                        return 'blue lighten-4';
                    case 'Arbitration of Disagreements':
                        return 'yellow lighten-4';
                    case 'Completed':
                        return 'green lighten-4';
                    default:
                    return ''
                }
            },
            filters: [
                'filterArbiters',
                'filterStatus',
                'filterDataPath',
                'filterCurrentAssignmentUserNameAndStatus',
            ],
            fields: fields,
        };
    },
    filterFieldsArbiters: ['arbiters'],
    filterFieldsStatus: ['status'],
    filterFieldsDataPath: ['dataPath'],
    filterFieldsCurrentAssignmentUserNameAndStatus: ['currentAssignmentUserNameAndStatus'],
});

Template.Arbitrations.events({
    'click .arbitrations .reactive-table tbody tr': function (event) {
        event.preventDefault();
        const target = $(event.target);
        const arbitration = Arbitrations.findOne(this._id);
        if (target.hasClass('update')) {
            arbitration.update();
        }
        else if (target.hasClass('remind')) {
            arbitration.sendReminders();
        }
        else if (target.hasClass('cancel')) {
            arbitration.cancel();
        }
    }
});