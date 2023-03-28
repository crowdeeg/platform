import { Data, Tasks, Assignments, Patients, PreferencesFiles, AlignmentFiles} from '/collections';
import moment from 'moment';
import { MaterializeModal } from '/client/Modals/modal.js'
import { EDFFile } from '/collections';

import { Tabular } from "meteor/aldeed:tabular";
import { $ } from 'meteor/jquery';
import dataTablesBootstrap from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import { connections } from 'mongoose';



// double dictionary for task inference
let taskDictionary = {};
let dataDictionary = {};
let page = 1;
let limit = 10;
let cond = {}
var selectedDataG = new ReactiveVar({});
var selectedAssigneesG = new ReactiveVar({});
var selectedTaskG = new ReactiveVar(false);
var selectedAlignmentG = new ReactiveVar({});

Template.Alignments.events({
  'click .btn.upload': function () {
      const files = document.getElementById("File");
      const folderFiles = document.getElementById("Folder");
  
      let allFilesUnfiltered = Array.from(files.files).concat(Array.from(folderFiles.files).filter(fileObj => fileObj.name.split('.')[1].toLowerCase() === "json"));
      const allFiles = allFilesUnfiltered.filter((file, i) => {
        return allFilesUnfiltered.findIndex((e) => {
          return e.name === file.name;
        }) === i;
      });
  
      console.log(allFiles);
  
      window.alert(`You are uploading ${allFiles.length} file(s), press OK to proceed.\n\nPlease do not close this tab until you are notified that all uploading processes have terminated!`);
  
      let filesSuccessfullyUploaded = 0;
      let filesUploadFailed = "";
      let uploadsEnded = 0;
      let filesSuccessfullyUploadedString = "";
      let overwritePromise = false;
      let overwriteDuplicates = false;
  
      //loading.set(true);
  
      
      for(i=0; i< allFiles.length; i++){
          console.log(allFiles[i]);
          const file = allFiles[i];
          const fileName = file.name;
          var reader = new FileReader();
          reader.onload = function(e){
              const text = e.target.result;
              const data = JSON.parse(text);
              const file1 = data.filename1;
              const file2 = data.filename2;
              const lag = String(data.lag);
              if(!file1 || !file2 || !lag){
                window.alert("Missing information in " + fileName + ". Insert failed!");
                return;
              }
              console.log(data);
              var check = AlignmentFiles.findOne({"filename" : fileName});
              if(check != undefined){
                  overwritePromise = new Promise((oResolve, oReject) => {
                      const modalTransitionTimeInMilliSeconds = 300;
                      MaterializeModal.confirm({
                        title: 'Duplicate File',
                        message: 'Duplicate Files Detected. Overwrite?<br>',
                        submitLabel: '<i class="fa fa-check left"></i> Overwrite All Duplicates',
                        closeLabel: '<i class="fa fa-times left"></i> Ignore Duplicates',
                        outDuration: modalTransitionTimeInMilliSeconds,
                        callback(error, response) {
                          if (error) {
                            alert(error);
                            oReject(error);
                            reject(error);
                            return;
                          }
                          if (!response.submit) {
                            oResolve();
                            return;
                          }

                          overwriteDuplicates = true;
                          oResolve();
                        }
                      });
                  });

                  overwritePromise.then(() => {
                    if (overwriteDuplicates) {
                      try{
                          AlignmentFiles.remove(check._id);
                          AlignmentFiles.insert({"filename": fileName, "file1": file1, "file2": file2, "lag": lag});
                      } catch (err){
                          console.log(err);
                          window.prompt("There has been an error, please try again");
                      }
                    } else {
                      return;
                    }
                  });
              } else {
                console.log(lag);
                AlignmentFiles.insert({"filename": fileName, "file1": file1, "file2": file2, "lag":lag });
              }
          }
          // need this or the onload wont work
          reader.readAsText(file);
      }
      selectedAlignmentG.set({});
  },
  'click .btn.download': function(){
    console.log("hellp");
    var allAlignments = selectedAlignmentG.get();
    if(Object.keys(allAlignments).length < 1){
      window.alert("No Alignments Selected To Download");
    } else {
      Object.values(allAlignments).forEach((item)=>{
        var obj = {
          "filename1" : item.file1,
          "filename2" : item.file2,
          "lag": Number(item.lag)
        }
        console.log(item);
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));
        var downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        let fileName = item.filename;
        downloadAnchorNode.setAttribute("download", fileName);
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      });

    }
  }
});



// CURRENTLY IN THE PREFERENCES INDEX.JS FILE AS IT CANT BE DEFINED HERE FOR SOME REASON

// TabularTables.AlignmentFiles = new Tabular.Table({
//   name: "AlignmentFiles",
//   collection: AlignmentFiles,
//   columns: [
//     {data: "filename", title: "FileName"},
//     {data: "file1", title: "File 1"},
//     {data: "file2", title: "File 2"},
//     {data: "lag", title: "Lag"},
//     {title: "Delete",
//       tmpl: Meteor.isClient && Template.deleteButtonAlignment},
//     {title: "Selected", 
//       tmpl: Meteor.isClient && Template.selectedAlignment}
//     ],
//   initComplete: function() {
//     $('.dataTables_empty').html('processing');
//   },
//   processing: false,
//   skipCount: true,
//   pagingType: 'simple',
//   infoCallback: (settings, start, end, total) => `Total: ${total}, Showing ${start} to ${end} `,
// });


Template.selectedAlignment.helpers({
  id(){
    return this._id;
  },
  isChecked() {
    let selectedData = selectedDataG.get();
    return selectedData[this._id] != null;
  }
});

Template.selectedAlignment.events({
  'change .select-alignment': function (event, template) {
    const target = $(event.target);
    const isSelected = target.is(':checked');
    const id = this._id;
    console.log(this);
    let selectedAlignment = selectedAlignmentG.get();
    //console.log(Template.Data);
    if (isSelected) {
      const alignment = AlignmentFiles.findOne(id);
      console.log(alignment);
      selectedAlignment[id] = alignment;

      let user = Meteor.user();

      console.log(user);

    }
    else {
      delete selectedAlignment[id];
    }
    selectedAlignmentG.set(selectedAlignment);
    console.log(selectedAlignmentG.get());
  }
});

Template.deleteButtonAlignment.events({
  'click .delete-button': function(event,template){
    
    console.log(this);
    console.log(this._id);
    //const dataId = target.data('id');
    const dataId = this._id;
  // since we only have to deal with one collection we can simply do a try/catch without
  // any crazy conditions or checks
    try{
      AlignmentFiles.remove(dataId);
    } catch(err){
      console.log(err);
    }
    
    
  }
});
  
  // Tabular does not do well with parent-child relationships with the ReactiveVars so global variable had to be made
  Template.Alignments.onCreated(function () {
    this.selectedAlignment = selectedAlignmentG;
  });
  
  Template.selectedAlignment.onCreated(function(){
  });