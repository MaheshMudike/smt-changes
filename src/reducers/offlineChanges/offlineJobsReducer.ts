import * as _ from 'lodash';

import { IPayloadAction } from '../../actions/actionUtils';
import * as offlineActions from '../../actions/offlineChangesActions';
import Contact from '../../models/accounts/Contact';
import { eventTypeToString } from '../../models/api/salesforce/eventTypes';
import { IEventModification } from '../../models/events/IEventModification';
import { IFileAttachment } from '../../models/events/IFileAttachment';
import { INote } from '../../models/events/INote';
import { IOfflineChangeJob, JobStatus } from '../../models/offlineChanges/IOfflineChanges';
import translate from '../../utils/translate';
import { markEventAsCompleted } from 'src/actions/integration/events/eventActions';
import { insertAttachmentForParent, insertNoteForParent, upsertEventFromWriteEventModal } from 'src/actions/http/jsforce';
import { combineReducers } from 'redux';
import { updateContactInfo } from '../../actions/integration/salesforceActions';
import { IApiId } from '../../models/api/coreApi';
import { IEventFromEventCreationDialog } from '../../components/modals/events/EventCreationDialog';

function createJob(translationKey: string, body: string, id: string, sync: () => Promise<any>): IOfflineChangeJob {
    return { displayName: `${ translate(translationKey) }: ${ body }`, id, status: JobStatus.Pending, sync };
}

function createNoteJob(note: INote): IOfflineChangeJob {
    return createJob('synchronisation.summary-modal.new-note', note.body,
        _.uniqueId('job_create_note'),
        () => insertNoteForParent(note.parentId, translate('modal.contact-note.create-note-title'), note.body),
    );
}

function createAttachmentJob(attachment: IFileAttachment): IOfflineChangeJob {
    return createJob('synchronisation.summary-modal.new-attachment', attachment.contact.name,
        _.uniqueId('job_create_attachment'),
        () => insertAttachmentForParent(attachment.contact.id, attachment.fileName, attachment.base64Content),
    );
}

function createEventJob(event: IEventFromEventCreationDialog, contacts: IApiId[]): IOfflineChangeJob {
    return createJob(
        'synchronisation.summary-modal.new-event', `${ eventTypeToString(event.Type) } - ${ event.What.Name }`,
        _.uniqueId('job_create_event'),
        () => upsertEventFromWriteEventModal(event, contacts.map(c => c.Id))
    );
}

function createEditContactJob(contact: Contact): IOfflineChangeJob {
    return createJob(
        'synchronisation.summary-modal.edit-contact', contact.fullName,
        `job_edit_contact_${ contact.id }`,
        () => updateContactInfo(contact),
    );
}

function createMarkEventCompletedJob(mod: IEventModification): IOfflineChangeJob {
    return createJob(
        'synchronisation.summary-modal.completed-event', mod.event.title,
        `job_mark_event_completed_${ mod.event.id }`,
        () => markEventAsCompleted(mod),
    );
}

function updateJobStatus(status: JobStatus, jobId: string, jobs: IOfflineChangeJob[]) {
    const i = _.findIndex(jobs, j => j.id === jobId);
    if (i < 0) return jobs;

    const result = _.clone(jobs);
    result.splice(i, 1, { ...result[i], status });
    return result;
}

function addOrUpdateJob(state: IOfflineChangeJob[], job: IOfflineChangeJob) {
    return _.unionBy([job], state, t => t.id);
}

export function offlineJobsReducer(state: IOfflineChangeJob[] = [], action: IPayloadAction<any>) {
    switch (action.type) {
        case offlineActions.CREATE_OFFLINE_SF_NOTE:
            return state.concat(createNoteJob(action.payload));
        case offlineActions.CREATE_OFFLINE_SF_ATTACHMENT:
            return state.concat(createAttachmentJob(action.payload));
        case offlineActions.MARK_EVENT_COMPLETED_OFFLINE:
            return addOrUpdateJob(state, createMarkEventCompletedJob(action.payload));
        case offlineActions.EDIT_OFFLINE_CONTACT:
            return addOrUpdateJob(state, createEditContactJob(action.payload));
        case offlineActions.CREATE_EVENT_OFFLINE:
            return addOrUpdateJob(state, createEventJob(action.payload.event, action.payload.contacts));
        case offlineActions.SYNC_SINGLE_OFFLINE_CHANGE.success:
            return updateJobStatus(JobStatus.Success, action.payload, state);
        case offlineActions.SYNC_SINGLE_OFFLINE_CHANGE.failure:
            return updateJobStatus(JobStatus.Failure, action.payload, state);
        case offlineActions.CLEAR_SYNC_JOBS:
            return [];
        default:
            return state;
    }
}

export default combineReducers({
    jobs: offlineJobsReducer,
});