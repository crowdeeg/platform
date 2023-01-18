import { Tabular } from "meteor/aldeed:tabular";
import { Data, Tasks, Assignments, Patients} from '/collections';

TabularTables = {};
Meteor.isClient && Template.registerHelper('TabularTables',TabularTables);

TabularTables.Data = new Tabular.Table({
    name: "Data",
    collection: Data,
    columns: [
        {data: "path", title: "Path"},
        {data: "metadata.wfdbdesc.Length", title: "Length",
          render:function(val){
            return val.split(" ")[0];
          }},
        {data: "_id", title: "Patient #",
          render:function(val){
            //let patient_id = Data.findOne({_id:val}).patient;
            //return Patients.findOne({_id:patient_id}).id;
            const data = Data.find({_id: val}).fetch();
            let patientNum = "";
            //Note there will only be one element for forEach is not a big deal
            data.forEach((d)=> {
              patientNum = d.patientDoc().id;
            })
            return patientNum;
          }},
        {data: "_id", title: "# Assignments", 
          render:function(val){
            if(val){
              const data = Data.find({_id: val}).fetch();
              let numAssignments = 0;
              data.forEach((d) => {
                numAssignments = d.numAssignments()
              })
              return numAssignments;
            }
          }},
          {data: "_id", title: "# Assignments Completed", 
          render:function(val){
            const data = Data.find({_id: val}).fetch();
            let numAssignmentsCompleted = 0;
            data.forEach((d) => {
              numAssignmentsCompleted = d.numAssignmentsCompleted()
            })
            return numAssignmentsCompleted;
          }},
          {data: "_id", title: "Assignees", 
          render:function(val){
            const data = Data.find({_id: val}).fetch();
            let assignees = [];
            data.forEach((d) => {
              assignees = d.assigneeNames()
            })
            return assignees;
          }},
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
