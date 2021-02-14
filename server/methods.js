import { Assignments } from '/collections';

Meteor.methods({
    updateAssignmentWithoutHook(assignmendId, modifier) {
        const assignment = Assignments.findOne(assignmendId);
        if (
            Roles.userIsInRole(this.userId, 'admin')
            || assignment.users.indexOf(this.userId) >= 0
        ) {
            Assignments.direct.update({ _id: assignmendId }, modifier);
        }
    },
})