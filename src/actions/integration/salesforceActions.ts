import Contact from '../../models/accounts/Contact';
import { INote } from '../../models/events/INote';

import translate from '../../utils/translate';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { insertAttachmentForParent, insertNoteForParent, updateContact } from 'src/actions/http/jsforce';
import INameAndId from '../../models/INameAndId';


function sfToastHttpAction(httpActivity: () => Promise<any>, onFail: string, onSucceed: string) {
    return asyncHttpActionGeneric(
        httpActivity,
        null,
        [],
        { onFail: translate(onFail), onSucceed: translate(onSucceed)},
        (t: any) => t
    );
}

export function updateContactInfo(contact: Contact) {
    const { Id, FirstName, LastName, Phone, MobilePhone, Email, Fax } = contact.getValue();
    return updateContact({ Id, FirstName, LastName, Phone, MobilePhone, Email, Fax });
}

export function updateSalesforceContact(contact: Contact, onFinish: (error: any) => void) {    
    return sfToastHttpAction(
        () => updateContactInfo(contact).then(result => { 
            onFinish(null);
            return result;
        }).catch(err => {
            onFinish(err);
            return Promise.reject(err);
        }),        
        'toast.contact-update-failed.message',
        'toast.contact-update-successful.message',
    );
}

export function createSalesforceNoteAndShowToast(note: INote) {
    return sfToastHttpAction(
        () => insertNoteForParent(note.parentId, translate('modal.contact-note.create-note-title'), note.body),
        'toast.note-create-failed.message',
        'toast.note-create-successful.message'
    );
}

export function createSalesforceAttachmentAndShowToast(contact: INameAndId, fileName: string, base64Content: string) {
    return sfToastHttpAction(
        () => insertAttachmentForParent(contact.id, fileName, base64Content),        
        'toast.attachment-create-failed.message',
        'toast.attachment-create-successful.message'
    );
}