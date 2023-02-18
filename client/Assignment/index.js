import { Patients, Data, Tasks, Assignments, Annotations } from '/collections';
import swal from 'sweetalert2';
import moment from 'moment';

Template.AssignmentsPending.helpers({
    assignments() {
        return Assignments.find({
            users: Meteor.userId(),
            status: { $eq: 'Pending' },
            isHidden: { $ne: true },
        });
    },
});

Template.AssignmentsInReview.helpers({
    assignments(){
        user = Meteor.users.findOne(Meteor.userId());
        if(user){
            // if admin, we want to make sure the Reviewing ones stay in Review until done
            if(user.roles){
                return Assignments.find({
                    users: Meteor.userId(),
                    status: { $in: ['Review', "In Progress"] },
                    isHidden: { $ne: true },
                    dataFiles: { $ne: undefined },
                    reviewing: { $ne: undefined },
                });
            } else {
                // if not admin then just find the ones under review
                return Assignments.find({
                    users: Meteor.userId(),
                    status: { $eq: 'Review' },
                    isHidden: { $ne: true },
                });
            }
        }
        
    }
})

Template.AssignmentsInProgress.helpers({
    assignments() {
        return Assignments.find({
            users: Meteor.userId(),
            status: { $eq: 'In Progress' },
            isHidden: { $ne: true },
            reviewing: { $eq: undefined },
        });
    },
});

Template.AssignmentsCompleted.helpers({
    assignments() {
        return Assignments.find({
            users: Meteor.userId(),
            status: { $eq: 'Completed' },
            isHidden: { $ne: true },
        });
    },
});

Template.Assignment.onCreated(function() {
    this.incrementNumPendingItemsToSave = () => {
        Session.set('numPendingItemsToSave', Session.get('numPendingItemsToSave') + 1);
    };
    this.decrementNumPendingItemsToSave = () => {
        setTimeout(() => {
            Session.set('numPendingItemsToSave', Math.max(0, Session.get('numPendingItemsToSave') - 1));            
        }, 400);
    };
});

Template.Assignment.helpers({
    template () {
        return 'Annotator' + this.task.annotator;
    },
    data () {
        return this;
    }
})

Template.Assignment.onRendered(function() {
    const data = this.data;
    console.log('data: ', data)
    Session.set('numPendingItemsToSave', 0); 
    // when we open a file that is in review:
    if( data.assignment.reviewing === undefined){
        users = [];
        users.push(data.assignment.reviewer);
        const info = {
          task: data.assignment.task,
          dataFiles: data.assignment.dataFiles,
          users: users,
          reviewing: Meteor.userId(),
        };
        Meteor.call("deleteAssignmentForReview", info);
    // if the reviewer opens a completed file, then the mark it as under review, and the annotator should be able to open it again
    } else if(data.assignment.status === "Completed") {
        users = [];
        console.log("HERE");
        users.push(data.assignment.reviewing);
        const info = {
          task: data.assignment.task,
          dataFiles: data.assignment.dataFiles,
          users: users,
          reviewer: Meteor.userId(),
        };
        Meteor.call('updateAssignmentWithDataQuery', info, { $set: { status: 'Review', canBeReopenedAfterCompleting: true} })
    }
    Meteor.call('updateAssignmentWithoutHook', data.assignment._id, { $set: { status: 'In Progress' } });
    let messageToDisplayBeforeStart = data.assignment.messageToDisplayBeforeStart;
    let messageDisplayedBeforeStart;
    if (messageToDisplayBeforeStart) {
        messageToDisplayBeforeStart = messageToDisplayBeforeStart.trim();
    }
    if (messageToDisplayBeforeStart == '') {
        messageToDisplayBeforeStart = undefined;
    }
    const timeLimitInSeconds = data.assignment.timeLimitInSeconds;
    if (timeLimitInSeconds > 0) {
        let timeLeftInSeconds = timeLimitInSeconds;
        if (data.assignment.timeLeftInSeconds !== undefined && data.assignment.timeLeftInSeconds !== null) {
            timeLeftInSeconds = Math.min(data.assignment.timeLeftInSeconds, timeLimitInSeconds);
        }
        if (timeLeftInSeconds <= 0) {
            data.assignment.markAsCompleted();
        }
        else {
            let clockFace = 'MinuteCounter';
            let timeFormatPattern = 's';
            let timeUnitMax = 'second';
            if (timeLeftInSeconds >= 3600) {
                clockFace = 'HoursCounter';
                timeFormatPattern = 'h:mm:ss';
                timeUnitMax = 'hour';
                if (timeLeftInSeconds >= 3600 * 2) {
                    timeUnitMax += 's';
                }
            }
            else if (timeLeftInSeconds >= 60) {
                clockFace = 'MinuteCounter';
                timeFormatPattern = 'm:ss';
                timeUnitMax = 'minute';
                if (timeLeftInSeconds >= 60 * 2) {
                    timeUnitMax += 's';
                }
            }
            else if (timeLeftInSeconds >= 2) {
                timeUnitMax += 's';
            }
            const timerElement = this.find('.assignment-timer');
            if (timerElement) {
                const timer = $(timerElement).FlipClock({
                    clockFace: clockFace,
                    callbacks: {
                        interval: function() {
                            if (!timer || !timer.getTime) return;
                            const timeLeftRightNowInSeconds = timer.getTime().time;
                            data.assignment.timeLeftInSeconds = timeLeftRightNowInSeconds;
                            Assignments.update(data.assignment._id, { $set: { timeLeftInSeconds: timeLeftRightNowInSeconds } });
                            if (data.assignment.timeLeftInSeconds <= 0) {
                                swal({
                                    title: "Time's up! This task will now automatically be marked as complete!",
                                    confirmButtonText: 'OK, GO AHEAD!',
                                    allowOutsideClick: false,
                                    animation: false,
                                })
                                .then((result) => {
                                    data.assignment.markAsCompleted();
                                });
                            }
                        },
                    },
                });
                timer.stop();
                timer.setTime(timeLeftInSeconds);
                timer.setCountdown(true);
                const timeLeftFormatted = moment.utc(timeLeftInSeconds * 1000).format(timeFormatPattern);
                if (messageToDisplayBeforeStart) {
                    messageToDisplayBeforeStart += '<br><br>';
                }
                else {
                    messageToDisplayBeforeStart = '';
                }
                messageToDisplayBeforeStart += 'You will be able to <b>click the button below</b> once all data required for this task has been loaded. This may take a few minutes if there is a lot of data. If it seems to be taking very long, please feel free to keep the browser tab open and do something else while waiting for this process to complete. <b>Thanks for bearing with us!</b>';
                messageDisplayedBeforeStart = swal({
                    title: "You've got " + timeLeftFormatted + " " + timeUnitMax + " to complete this task.",
                    html: messageToDisplayBeforeStart,
                    confirmButtonText: 'CLICK TO START TIMER',
                    allowOutsideClick: false,
                    animation: false,
                })
                .then((result) => {
                    timer.start();
                });
                swal.disableConfirmButton();
                $(this.find('.assignment-container')).on('readyToStart', swal.enableConfirmButton);
            }
        }
    }
    else if (messageToDisplayBeforeStart) {
        messageDisplayedBeforeStart = swal({
            title: 'Please read this first!',
            html: messageToDisplayBeforeStart,
            confirmButtonText: 'CLICK TO GET STARTED',
            allowOutsideClick: false,
            animation: false,
        });
    }
    $(this.findAll('[data-bound-annotation-type]')).each(function() {
        const inputElement = $(this);
        const annotationType = inputElement.data('bound-annotation-type');
        const annotation = Annotations.findOne({
            assignment: data.assignment._id,
            user: Meteor.userId(),
            dataFiles: data.assignment.dataFiles,
            type: annotationType,
        });
        if (annotation) {
            if (inputElement.is(':checkbox')) {
                inputElement.prop('checked', annotation.value);
            }
            else {
                inputElement.val(annotation.value);
            }
        }
        inputElement.change();
    });
    $(this.findAll('[data-bound-action]')).each(function() {
        const inputElement = $(this);
        inputElement.on('click', actionEventListener);

        function actionEventListener() {
            const action = inputElement.data('bound-action');
            switch (action) {
                case 'COMPLETE_ASSIGNMENT':
                    data.assignment.markAsCompleted();
                    break;
                default:
                    console.error('Unknown action "' + action + '".');
            }
        }
    });
    $(this.findAll('select')).material_select();
});

Template.Assignment.events({
    'keyup input, change input, keyup textarea, change textarea, change select'(event, template) {
        const data = this;
        const inputElement = $(event.target);
        const annotationType = inputElement.data('bound-annotation-type');
        if (!annotationType) {
            return;
        }
        let annotationId = inputElement.data('bound-annotation-id');
        let annotationValue = inputElement.val();
        if (inputElement.is(':checkbox')) {
            annotationValue = inputElement.is(':checked');
        }
        const annotationSelector = {
            assignment: data.assignment._id,
            user: Meteor.userId(),
            dataFiles: data.dataset,  // a list of datafile ids
            type: annotationType,
        };
        const annotationDocument = $.extend($.extend(true, {}, annotationSelector), {
            value: annotationValue
        });
        let annotation;
        if (annotationId) {
            annotation = Annotations.findOne(annotationId);
        }
        if (!annotation) {
            annotation = Annotations.findOne(annotationSelector);
        }
        if (annotation) {
            if (JSON.stringify(annotation.value) === JSON.stringify(annotationValue)) {
                return;
            }
            annotationId = annotation._id;
            template.incrementNumPendingItemsToSave();
            Annotations.update({ _id: annotationId }, { $set: annotationDocument }, (error, _) => {
                if (!error) {
                    template.decrementNumPendingItemsToSave();
                }
            });
        }
        else {
            template.incrementNumPendingItemsToSave();
            annotationId = Annotations.insert(annotationDocument, (error, _) => {
                if (!error) {
                    template.decrementNumPendingItemsToSave();
                }
            });
        }
        inputElement.data('bound-annotation-id', annotationId);
    },
});