import { Assignments } from '/collections'

Template.AnnotatorQuestionnaire.onRendered(function() {
    const annotatorContainer = $(this.find('.annotator-container'));
    const embedIFrame = annotatorContainer.find('iframe');
    let numTimesIFrameLoaded = 0;
    embedIFrame.on('load', () => {
        numTimesIFrameLoaded += 1;
        if (numTimesIFrameLoaded == 2) {
            numTimesIFrameLoaded = 0;
            const assignmentId = embedIFrame.attr('data-assignment-id');
            const assignment = Assignments.findOne(assignmentId);
            if (assignment) {
                assignment.markAsCompleted();
            }
        }
    });
});

Template.AnnotatorQuestionnaire.helpers({
    embedURL() {
        let embedURL = this.assignment.dataDoc().path;
        embedURL = embedURL.replace('{user_id}', Meteor.userId());
        embedURL = embedURL.replace('{assignment_id}', this.assignment._id);
        return embedURL;
    },
});
