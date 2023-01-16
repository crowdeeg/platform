import { Tabular } from "meteor/aldeed:tabular";
import { Data, Tasks, Assignments, Patients} from '/collections';

TabularTables = {};
Meteor.isClient && Template.registerHelper('TabularTables',TabularTables);

TabularTables.Data = new Tabular.Table({
    name: "Data",
    collection: Data,
    columns: [
        {data: "path", title: "Path"},
        {data: "name", title: "Patient #"},
        {title: "Delete",
        tmpl: Meteor.isClient && Template.deleteButton},
        {title: "Selected", 
        tmpl: Meteor.isClient && Template.selected}
    ],
    initComplete: function() {
        $('.dataTables_empty').html('processing');
    },
    processing: false,
    skipCount: true,
    pagingType: 'simple',
    infoCallback: (settings, start, end) => `Showing ${start} to ${end}`,
});
