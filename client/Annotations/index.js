import { Data, Tasks, Assignments, Patients, PreferencesFiles, AlignmentFiles, AnnotationFiles} from '/collections';
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
var selectedAnnotationsG = new ReactiveVar({});
var loading = new ReactiveVar(false);


Template.Annotations.events({
    'click .btn.upload': function () {
        const files = document.getElementById("File");
        const folderFiles = document.getElementById("Folder");
        loading.set(true);
    
        let allFilesUnfiltered = Array.from(files.files).concat(Array.from(folderFiles.files).filter(fileObj => fileObj.name.split('.')[1].toLowerCase() === "csv"));
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
                //const data = JSON.parse(text);
                const splitText = text.split('\n');
                //info is for the purposes of downloading which is a TODO
                const info = splitText[0];
                var csvAnnotations = {};
                console.log(splitText);
                for(i=2; i < splitText.length; i++){
                    const data = splitText[i].split(',');
                    console.log(data);
                    var obj = {
                        index: data[0],
                        time: data[1],
                        type: data[2],
                        annotation: data[3],
                        channels: data[4],
                        duration: data[5],
                        user: data[6],
                        comments: data[7],
                    }
                    console.log(obj)
                    csvAnnotations[data[0]]=obj;
                    console.log(csvAnnotations);
                }
                var check = AnnotationFiles.findOne({"filename" : fileName});
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
                            AnnotationFiles.remove(check._id);
                            AnnotationFiles.insert({"filename": fileName, info: info, "annotations": csvAnnotations});
                            console.log(AnnotationFiles.find({}))
                            //AnnotationFiles.insert({"filename": fileName, "csvAnnotationInfo": info, "csvAnnotations": csvAnnotations});
                        } catch (err){
                            console.log(err);
                            window.prompt("There has been an error, please try again");
                        }
                      } else {
                        return;
                      }
                    });
                } else {
                    AnnotationFiles.insert({"filename": fileName, "info": info, "annotations": csvAnnotations});
                    // AnnotationFiles.insert({"filename": fileName, "csvAnnotationInfo": info, "csvAnnotations": csvAnnotations});
                }
            }
            // need this or the onload wont work
            reader.readAsText(file);
        }
        selectedAnnotationsG.set({});
        loading.set(false);
    },
    'click .btn.download': function(){
      console.log("downloading");
      var allAnnotations = selectedAnnotationsG.get();
      if(Object.keys(allAnnotations).length < 1){
        window.alert("No Annotations Selected To Download");
      } else {
        Object.values(allAnnotations).forEach((item)=>{
          var fileInfo = item.info.replace(/""+/g, '"');
          fileInfo = [fileInfo + "\n"];
          console.log(fileInfo);

          fileInfo.push(["Index", "Time", "Type", "Annotation", "Channels", "Duration", "User", "Comment"] + '\n');

          Object.values(item.annotations).forEach(arr=>{
           console.log(arr);
           fileInfo.push([arr.index, arr.time, arr.type, arr.annotation, arr.channels, arr.duration, arr.user, arr.comment] + '\n');
          });

          const blob = new Blob(fileInfo, { type: "text/csv" });
          const href = URL.createObjectURL(blob);
          fileName = item.filename;
          const a = Object.assign(document.createElement("a"),
            {
              href,
              style: "display:none",
              download: fileName,
            }
          )
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(href);
          a.remove();

        })
      }
    //   console.log("hellp");
    //   var allPreferences = selectedPreferencesG.get();
    //   if(Object.keys(allPreferences).length < 1){
    //     window.alert("No Preferences Selected To Download");
    //   } else {
    //     Object.values(allPreferences).forEach((item)=>{
    //       var annotatorConfigObj = item.annotatorConfig;
    //       console.log(item);
    //       var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(annotatorConfigObj));
    //       var downloadAnchorNode = document.createElement('a');
    //       downloadAnchorNode.setAttribute("href", dataStr);
    //       let fileName = item.name;
    //       downloadAnchorNode.setAttribute("download", fileName);
    //       document.body.appendChild(downloadAnchorNode); // required for firefox
    //       downloadAnchorNode.click();
    //       downloadAnchorNode.remove();
    //     });

    //   }
    }
});


// TabularTables.AnnotationFiles = new Tabular.Table({
//     name: "AnnotationFiles",
//     collection: AnnotationFiles,
//     columns: [
//       {data: "filename", title: "Filename"},
//       {data: "csvAnnotations", title: "# of Annotations", 
//       render:function(val){
//         return Object.entries(val).length;
//       }},
//       {title: "Delete",
//         tmpl: Meteor.isClient && Template.deleteButtonPreferences},
//       {title: "Selected", 
//         tmpl: Meteor.isClient && Template.selectedPreferences}
//       ],
//     initComplete: function() {
//       $('.dataTables_empty').html('processing');
//     },
//     processing: false,
//     skipCount: true,
//     pagingType: 'simple',
//     infoCallback: (settings, start, end, total) => `Total: ${total}, Showing ${start} to ${end} `,
//   });

Template.selectedAnnotations.helpers({
    id(){
      return this._id;
    },
    isChecked() {
      let selectedData = selectedDataG.get();
      return selectedData[this._id] != null;
    }
  });
  
  Template.Annotations.helpers({
    loading(){
        //console.log(Template.instance());
        return Template.instance().loading.get();
      },
  })
  Template.selectedAnnotations.events({
    'change .select-annotation': function (event, template) {
      const target = $(event.target);
      const isSelected = target.is(':checked');
      const id = this._id;
      console.log(this);
      let selectedAnnotations = selectedAnnotationsG.get();
      //console.log(Template.Data);
      if (isSelected) {
        const annotation = AnnotationFiles.findOne(id);
        console.log(annotation);
        selectedAnnotations[id] = annotation;
  
        let user = Meteor.user();
  
        console.log(user);
  
      }
      else {
        delete selectedAnnotations[id];
      }
      selectedAnnotationsG.set(selectedAnnotations);
      console.log(selectedAnnotationsG.get());
    }
  });
  
  Template.deleteButtonAnnotation.events({
    'click .delete-button': function(event,template){
      
      console.log(this);
      console.log(this._id);
      //const dataId = target.data('id');
      const dataId = this._id;
    // since we only have to deal with one collection we can simply do a try/catch without
    // any crazy conditions or checks
      try{
        AnnotationFiles.remove(dataId);
      } catch(err){
        console.log(err);
      }
      
      
    }
  });
  
  // Tabular does not do well with parent-child relationships with the ReactiveVars so global variable had to be made
  Template.Annotations.onCreated(function () {
    this.selectedAnnotations = selectedAnnotationsG;
    this.loading = loading;
  });
  
  Template.selectedAnnotations.onCreated(function(){
  });