import { Annotations, Instructions } from '/collections';

Template.RationaleForm.events({
    'keydown input': (event) => {
        if (event.which == 27 || event.key == 'Escape') {
            event.preventDefault();
            $(event.target).focus();
        }
    },
    'autocompleteselect input.rationale-instruction' (event, template, instruction) {
        selectInstruction(instruction);
        $(event.currentTarget).val('');
    },
    'click .guideline .reactive-table tbody tr' (event) {
        const instruction = Instructions.findOne(this._id);
        selectInstruction(instruction);
    },
    'click .instruction .delete' (event, template) {
        const instructionId = $(event.currentTarget).parents('.instruction').data('id');
        const selectedInstructions = Template.instance().selectedInstructions.get();
        delete selectedInstructions[instructionId];
        Template.instance().selectedInstructions.set(selectedInstructions);
    },
    'click .conditions .belief .btn' (event, template) {
        event.preventDefault();
        const key = $(event.currentTarget).data('key');
        const level = parseFloat($(event.currentTarget).data('level'));
        const instructionId = $(event.currentTarget).parents('.instruction').data('id');
        const propositionId = $(event.currentTarget).parents('.condition').data('id');
        const selectedInstructions = Template.instance().selectedInstructions.get();
        selectedInstructions[instructionId].conditions.forEach((condition) => {
            if (condition.doc._id != propositionId) return;
            condition.belief = {
                level,
                key,
            };
            condition.belief[key] = true;
        });
        Template.instance().selectedInstructions.set(selectedInstructions);
    },
});

function selectInstruction(instruction) {
    const selectedInstructions = Template.instance().selectedInstructions.get();
    if (!selectedInstructions[instruction._id]) {
        selectedInstructions[instruction._id] = {
            doc: instruction,
            conditions: instruction.conditionDocs().map((conditionDoc) => {
                return {
                    doc: conditionDoc,
                };
            }),
        };
        Template.instance().selectedInstructions.set(selectedInstructions);
    }
}

Template.RationaleForm.onCreated(function() {
    this.selectedInstructions = new ReactiveVar({});
});

Template.RationaleForm.helpers({
    guideline() {
        return this.task.guidelineDoc();
    },
    instructionRationaleAutocompleteSettings() {
        const filter = {};
        if (this.task.guideline) {
            filter.guideline = this.task.guideline;
        }
        return {
            position: 'bottom',
            limit: Number.MAX_SAFE_INTEGER,
            rules: [
                {
                    collection: Instructions,
                    filter: filter,
                    field: 'autoCompleteText',
                    matchAll: true,
                    template: Template.instructionRationaleAutocomplete,
                    noMatchTemplate: Template.autocompleteNoMatch,
                }
            ],
        }
    },
    instructions() {
        return Object.values(Template.instance().selectedInstructions.get());
    },
    numInstructions() {
        return Object.keys(Template.instance().selectedInstructions.get()).length;
    },
    guidelineTableSettings() {
        const guideline = this.task.guidelineDoc();
        const selectedInstructions = Template.instance().selectedInstructions.get();
        if (!guideline) return {};
        const instructions = guideline.instructionDocs();
        instructions.forEach((instruction) => {
            instruction.actionDescriptions = instruction.actionDescriptionsCapitalized();
        });
        return {
            collection: instructions,
            class: 'table col-sm-12',
            rowClass: function(instruction) {
                let classes = ['selectable'];
                if (!!selectedInstructions[instruction._id]) {
                    classes.push('isSelected');
                }
                return classes.join(' ');
            },
            showNavigation: 'auto',
            rowsPerPage: Number.MAX_SAFE_INTEGER,
            showFilter: false,
            showColumnToggles: false,
            filters: [
                'filterIdentifier',
                'filterText',
                'filterActions',
            ],
            fields: [
                {
                    key: 'identifier',
                    label: 'Code',
                    sortable: false,
                },
                {
                    key: 'text',
                    label: 'Instruction',
                    sortable: false,
                },
                {
                    key: 'actionDescriptions',
                    label: 'Stage',
                    sortable: false,
                },
            ],
        };
    },
    filterFieldsIdentifier: ['identifier'],
    filterFieldsText: ['text'],
    filterFieldsActions: ['actionDescriptions'],
    freeFormRationaleAutocompleteSettings() {
        const filter = { user: Meteor.userId() };
        filter[this.decisionField] = this.decision;
        return {
            position: 'bottom',
            limit: Number.MAX_SAFE_INTEGER,
            rules: [
                {
                    collection: Annotations,
                    filter: filter,
                    field: 'rationale.freeForm',
                    matchAll: true,
                    template: Template.freeFormRationaleAutocomplete,
                    noMatchTemplate: Template.autocompleteNoMatch,
                }
            ],
        }
    },
    rationale(errorCallback) {
        const template = this;
        errorCallback = errorCallback || alert;
        let errorMessage;
        let usePlural;
        const rationale = {};
        const data = template.data;
        const freeFormInput = $(template.find('.rationale-free-form'));
        const freeForm = (freeFormInput.val() || '').trim();
        if (!data.task.guideline && freeForm == '') {
            errorCallback('Please explain your decision in your own words!');
            freeFormInput.focus();
            return;
        }
        rationale.freeForm = freeForm;
        if (data.task.guideline) {
            const instructionInput = $(template.find('.rationale-instruction'));
            const selectedInstructions = Object.values(template.selectedInstructions.get());
            const selectedInstructionsInSupportOfDecision = selectedInstructions.filter((instruction) => {
                return instruction.doc.actionDocs().some((a) => {
                    return (
                           a.predicate == 'ANNOTATION_FIELD_SHOULD_BE_SET_TO_VALUE'
                        && a.placeholders.field == data.decisionField
                        && a.placeholders.value == data.decision
                        && !a.negated
                    );
                });
            });
            if (selectedInstructionsInSupportOfDecision.length == 0) {
                errorCallback('Please cite at least one guideline instruction supporting your decision!');
                return;
            }
            const selectedInstructionsWithMissingBeliefs = selectedInstructions.filter((instruction) => {
                return instruction.conditions.some(c => !c.belief);
            });
            if (selectedInstructionsWithMissingBeliefs.length > 0) {
                const instructionIdentifiers = selectedInstructionsWithMissingBeliefs.map(i => i.doc.identifier);
                errorMessage = 'Please select whether you think';
                usePlural = selectedInstructionsWithMissingBeliefs.length > 1 || selectedInstructionsWithMissingBeliefs[0].conditions.length > 1;
                if (usePlural) {
                    errorMessage += ' all conditions';
                }
                else {
                    errorMessage += ' the condition';
                }
                errorMessage += ' for instruction';
                if (selectedInstructionsWithMissingBeliefs.length > 1) {
                    errorMessage += 's';
                }
                errorMessage += ' ' + instructionIdentifiers.join(', ');
                if (usePlural) {
                    errorMessage += ' are';
                }
                else {
                    errorMessage += ' is';
                }
                errorMessage += ' met!';
                errorCallback(errorMessage);
                return;
            }
            const selectedInstructionsInSupportOfDecisionWithPositiveBeliefs = selectedInstructionsInSupportOfDecision.filter((instruction) => {
                return instruction.conditions.every(c => c.belief && c.belief.level > 0);
            });
            if (selectedInstructionsInSupportOfDecisionWithPositiveBeliefs.length == 0) {
                errorCallback('Based on your current selection, you do not think the conditions for any of the instructions supporting your decision are met or at least likely to be met. Please try to make sure this is the case!');
                return;
            }
            const instructions = _.clone(selectedInstructions);
            instructions.forEach((instruction) => {
                instruction._id = instruction.doc._id;
                delete instruction.doc;
                instruction.conditions.forEach((condition) => {
                    condition._id = condition.doc._id;
                    delete condition.doc;
                    delete condition.belief[condition.belief.key];
                    delete condition.belief.key;
                });
            });
            rationale.instructions = instructions;
        }
        return rationale;
    },
});
