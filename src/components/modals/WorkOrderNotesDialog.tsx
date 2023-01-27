import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { SvgIcon } from '../../constants/SvgIcon';
import translate from '../../utils/translate';
import WithIcon from '../forms/WithIcon';
import { DialogHeaderTextButton } from '../layout/DialogHeaderTextButton';
import { DialogContainer } from './layout/DialogContainer';
import { FlexDialogContent } from './layout/DialogContent';
import { DialogHeader } from './layout/DialogHeader';
import { showModal, goToPrevModal } from 'src/actions/modalActions';
import { IModalDefinition } from 'src/models/modals/state';
import { showTaskCreationDialog, setWriteTaskFormField } from 'src/actions/integration/tasks/writeTaskFormActions';
import { FloatingActionButton } from '../layout/FloatingActionButton';
import { ComponentStatus } from 'src/models/IItemsState';
import { upsert, del } from 'src/actions/http/jsforceCore';
import { SObject } from 'src/actions/http/jsforceMappings';
import * as coreApi from '../../models/api/coreApi';
import { ThunkAction } from 'src/actions/thunks';
import { showToast } from 'src/actions/toasts/toastActions';
import { ComponentStatusContainer } from '../StatusContainer';
import { synchronizeCurrentPage } from 'src/actions/integration/synchronization';
import { selectQueriableItemAction } from 'src/actions/http/httpActions';

type WorkOrderNoteModalProps = WorkOrderNotesModalDispatchProps 
    & IModalDefinition<{ item: { notes: coreApi.Note, queryDetails: () => Promise<any> }, workOrderId: string}>

class WorkOrderNoteModalClass extends React.Component<
    WorkOrderNoteModalProps,
    { subject: string, description: string, status: ComponentStatus }
> {
    
    constructor(props: WorkOrderNoteModalProps) {
        super(props);
        if(this.props.modalProps.item.notes == null) {
            this.state = { subject: '', description: '', status: ComponentStatus.INITIAL };
        } else {
            //const { Subject__c, Description__c, Due_Date__c } = this.props.modalProps.item.notes;
            const { Title, Body } = this.props.modalProps.item.notes;
            this.state = { subject: Title, description: Body, status: ComponentStatus.INITIAL };
        }
    }
    
    public render() {
        const { subject, description, status } = this.state;
        const inProgress = status === ComponentStatus.IN_PROGRESS;
        const item = this.props.modalProps.item;
        return (
            <ComponentStatusContainer status={this.state.status}>
            <DialogContainer>
                <DialogHeader
                    title={translate('notes-modal.title')}
                    confirmAction={
                        <React.Fragment>
                        <DialogHeaderTextButton
                            onClick={ this.delete }
                            disabled={ item.notes == null || item.notes.Id == null || inProgress }
                            label={translate('generic.button.delete')}
                        />
                        <DialogHeaderTextButton
                            onClick={ ev => this.save(true) }
                            disabled={ inProgress }
                            label={translate('generic.button.save')}
                        />
                        </React.Fragment>
                    }
                    primaryAction={
                        <FloatingActionButton className='dialog-header__primary-action fab-button--crossing-line'
                            onClick={ev => {
                                this.save(false);
                                this.props.showTaskCreationDialog();
                                this.props.setWriteTaskFormField('subject', subject);
                                this.props.setWriteTaskFormField('description', description);
                                //this.props.setWriteTaskFormField('dueDate', moment(date));
                            }}
                            svg={SvgIcon.AddTaskBar}
                        />
                        //<TaskDialogFloatingButton taskSource={{ subject: Subject__c, description: Description__c, dueDate: moment(Due_Date__c) }} />
                    }
                />
                <FlexDialogContent>
                    {//this.props.form.isWaitingForResponse ? <CoveringSpinner /> : null}
                    }
                    <WithIcon icon={SvgIcon.Title} className='separated flex-shrink--0'>
                        <input value={this.state.subject} maxLength={255} type='text' placeholder={translate('generic.field.subject')} 
                            onChange={ this.handleSubject } />
                    </WithIcon>
                    {/*
                    <WithIcon icon={SvgIcon.Date} className='separated flex-shrink--0'>
                        <DateInput value={this.state.date} placeholder={translate('generic.field.due-date')} onChange={ this.handleDate } />
                    </WithIcon>
                    */}
                    <WithIcon icon={SvgIcon.Description} multiline className='flex-shrink--0 flex-grow--1'>
                        <textarea value={this.state.description} className='full-height' maxLength={255} placeholder={translate('generic.placeholder.description')} 
                            onChange={ this.handleDescription } />
                    </WithIcon>
                </FlexDialogContent>
            </DialogContainer>
            </ComponentStatusContainer>
        );
    }

    handleSubject = (ev: React.FormEvent<HTMLInputElement>) => {
        const subject = ev.currentTarget.value;
        this.setState(prevState => ({ ...prevState, subject }));
    }

    handleDate = (ev: React.FormEvent<HTMLInputElement>) => {
        const date = ev.currentTarget.value;
        this.setState(prevState => ({ ...prevState, date }))
    }

    handleDescription = (ev: any) => {
        const description = ev.currentTarget.value;
        this.setState(prevState => ({ ...prevState, description }))
    }

    delete = () => {
        const notes = this.props.modalProps.item.notes;
        if(notes != null) this.props.deleteNote(this.setStatus, notes.Id);
    }

    save = (hideModal: boolean) => {
        const { subject, description } = this.state;
        const modalProps = this.props.modalProps;
        this.props.saveNotes(
            hideModal,
            this.setStatus,
            /*
            { 
                Id: modalProps.item.notes == null ? null : modalProps.item.notes.Id, Subject__c: subject, 
                Work_Order__c: modalProps.workOrderId, Description__c: description, Due_Date__c: date 
            }
            */
            { 
                Id: modalProps.item.notes == null ? null : modalProps.item.notes.Id, Title: subject, 
                ParentId: modalProps.workOrderId, Body: description
            }
        );
    }

    setStatus = (status: ComponentStatus) => {
        this.setState(prev => ({ ...prev, status }));
    }

}

interface WorkOrderNotesModalDispatchProps {
    saveNotes: typeof saveNotes;
    deleteNote: typeof deleteNote;
    showModal: typeof showModal;
    showTaskCreationDialog: typeof showTaskCreationDialog;
    setWriteTaskFormField: typeof setWriteTaskFormField;
    selectQueriableItemAction: typeof selectQueriableItemAction;
}

/*
function upsertSMTNotes(smtNotes: coreApi.SMT_Notes__c) {
    const { Id, Subject__c, Due_Date__c, Description__c, Work_Order__c } = smtNotes;
    console.log(smtNotes);
    return upsert(SObject.SMT_Note__c, { Id, Subject__c, Due_Date__c, Description__c, Work_Order__c });
}

const deleteSMTNotes = (setStatus: (dataStatus: ComponentStatus) => void, id: string): ThunkAction<void> =>
(dispatch, getState) => {
    setStatus(ComponentStatus.IN_PROGRESS);
    del(SObject.SMT_Note__c, [id])
    .then(() => {
        setStatus(ComponentStatus.SUCCESS);
        dispatch(synchronizeCurrentPage());
        //dispatch(selectQueriableItemAction(item, LOAD_UNPLANNED_CALLOUTS));
        dispatch(goToPrevModal());
        dispatch(showToast({ message: translate('toast.save-notes.success.message') }));
    })
    .catch(() => {
        setStatus(ComponentStatus.FAILURE);
        dispatch(showToast({ message: translate('toast.save-notes.failure.message') }));
    });
};

const saveSMTNotes = (
    hideModal: boolean, 
    setStatus: (dataStatus: ComponentStatus) => void, 
    smtNotes: coreApi.SMT_Note__c
): ThunkAction<void> =>
    (dispatch, getState) => {
        setStatus(ComponentStatus.IN_PROGRESS);
        upsertNote(smtNotes)
        .then(() => {
            setStatus(ComponentStatus.SUCCESS);
            dispatch(synchronizeCurrentPage());
            if(hideModal) dispatch(goToPrevModal());
            dispatch(showToast({ message: translate('toast.save-notes.success.message') }));
        })
        .catch(() => {
            setStatus(ComponentStatus.FAILURE);
            dispatch(showToast({ message: translate('toast.save-notes.failure.message') }));
        });
    };

*/

function upsertNote(note: { Id: string, Title: string, Body: string, ParentId: string }) {
    const { Id, Title, Body, ParentId } = note;
    return upsert(SObject.Note, Id == null ? { Id, Title, Body, ParentId } : { Id, Title, Body });

    //"message":"Update failed. First exception on row 0 with id 0021w000000VhyYAAS; first error: INSUFFICIENT_ACCESS_OR_READONLY, insufficient access rights on object id: []"
    //const attributes = { type: "Note" };    
    //return multiQueryService(Id == null ? { inserts: [{ attributes, Id, Title, Body, ParentId }] } : { updates: [{ attributes, Id, Title, Body }] });
}

const deleteNote = (setStatus: (dataStatus: ComponentStatus) => void, id: string): ThunkAction<void> =>
(dispatch, getState) => {
    setStatus(ComponentStatus.IN_PROGRESS);
    del(SObject.Note, [id])
    .then(() => {
        setStatus(ComponentStatus.SUCCESS);
        dispatch(synchronizeCurrentPage());
        //dispatch(selectQueriableItemAction(item, LOAD_UNPLANNED_CALLOUTS));
        dispatch(goToPrevModal());
        dispatch(showToast({ message: translate('toast.save-notes.success.message') }));
    })
    .catch(error => {
        setStatus(ComponentStatus.FAILURE);
        dispatch(showToast({ message: errorMessage(error) }));
    });
};

const saveNotes = (
    hideModal: boolean, 
    setStatus: (dataStatus: ComponentStatus) => void, 
    smtNotes: { Id: string, Title: string, Body: string, ParentId: string }
): ThunkAction<void> =>
    (dispatch, getState) => {
        setStatus(ComponentStatus.IN_PROGRESS);
        upsertNote(smtNotes)
        .then(() => {
            setStatus(ComponentStatus.SUCCESS);
            dispatch(synchronizeCurrentPage());
            if(hideModal) dispatch(goToPrevModal());
            dispatch(showToast({ message: translate('toast.save-notes.success.message') }));
        })
        .catch(error => {
            setStatus(ComponentStatus.FAILURE);
            dispatch(showToast({ message: errorMessage(error) }));
        });
    };

function errorMessage(error: any) {
    const errorCode = error.errorCode;
    //jsforce crashes and returns "TypeError: Cannot read property '_toRecordResult' of undefined" when trying to delete a record with no access
    return translate(
        errorCode == 'INSUFFICIENT_ACCESS_OR_READONLY' || error == "TypeError: Cannot read property '_toRecordResult' of undefined" ? 'toast.insufficient-access' : 'toast.save-notes.failure.message'
    );
}

export const WorkOrderNotesModal = connect(
    null, 
    { saveNotes, deleteNote, showModal, showTaskCreationDialog, setWriteTaskFormField, selectQueriableItemAction }
)(WorkOrderNoteModalClass);
