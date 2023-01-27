import * as cx from 'classnames';
import { includes } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { goToPrevModal, hideAllModals } from '../../actions/modalActions';
import { IGlobalState } from '../../models/globalState';
import { ExternalClosingStrategy, IModalDefinition } from '../../models/modals/state';

import { ModalType } from '../../constants/modalTypes';
import { CreateAdminAssignmentDialog } from '../admin/modals/CreateAdminAssignmentDialog';
import { UploadCompanySettingsDialog } from '../admin/modals/UploadCompanySettingsDialog';
import { ConfirmActionDialog } from './ConfirmActionDialog';
import { EditContactModal, EditContactOfflineModal } from './EditContactModal';
import { CompleteEventModal, CompleteEventOfflineModal } from './events/CompleteEventModal';
import { ContactNoteModal, ContactNoteOfflineModal } from './events/ContactNoteModal';
import { ContactPhotoModal, ContactPhotoOfflineModal } from './events/ContactPhotoModal';
import { EventCreationAndCloseTaskDialog, EventCreationDialog, EventCreationOfflineDialog } from './events/EventCreationDialog';
import { IncompleteDialog, IncompleteEntityDialog } from './IncompleteEntityDialog';
import { ListOfEntitiesDialog } from './ListOfEntitiesDialog';
import { MapServiceOrderLayersModal } from './MapServiceOrderLayersModal';
import { PermissionDeniedModal } from './PermissionDeniedModal';
import { CreateEventQuestionModal } from './questions/CreateEventQuestionModal';
import { EnterOfflineModeModal } from './questions/EnterOfflineModeModal';
import { LeaveOfflineModeModal } from './questions/LeaveOfflineModeModel';
import { SearchUserDialog } from './SearchUserDialog';
import { SelectContactsDialog } from './SelectContactsDialog';
import { SelectOptionDialog } from './SelectOptionDialog';
import { SelectPlannerGroupDialog } from './SelectPlannerGroupDialog';
import { SynchronisationSummaryDialog } from './SynchronisationSummaryDialog';

import ReactModal from 'react-modal2';
import { TaskCreationModal } from './TaskCreationDialog';
import { SearchAccountDialog } from './SearchAccountDialog';
import { MapEquipmentFilteringModal } from './MapEquipmentFilteringModal';
import { MapOpportunityFilteringModal} from './MapOpportunityFilteringModal';
import { IPayloadAction } from '../../actions/actionUtils';
import { OpenInKff } from '../../components/details/links/OpenInKff';

import { ViewInSalesForce } from '../details/links/ViewInSalesForce';
import { IdentifiableWithTitle } from '../../models/feed/ISObject';
import { DialogContainer } from './layout/DialogContainer';
import { DialogHeader } from './layout/DialogHeader';
import { DialogContent, DialogContentPadding } from './layout/DialogContent';
import { renderFields } from '../forms/renderFields';
import { LocationBar } from '../icons/iconBars';
import { eventSourceFloatingButton, isMapMarker } from '../../containers/pages/ListDetails';
import { AccountDetailProps, CalloutDetailProps, ComplaintDetailProps, HelpdeskCaseDetailProps, EventDetailProps, QueryDetailProps, LeadDetailProps, TaskDetailProps, TenderDetailProps, TechnicianDetailProps, EquipmentDetailProps, EventDetailOfflineProps, ContactDetailProps, DetailPropsContent, DetailPropsFields, OpportunityDetailProps, TransactionSurveyCaseDetailProps, TenderFieldsDiv, AuditDetailProps } from 'src/containers/pages/EntityDetails';
import { EntityFieldsData, entityFieldsDataFromState } from '../fields/EntityFieldsData';
import { createSelector } from 'reselect';
import { WorkOrderNotesModal } from './WorkOrderNotesDialog';
import { ContactCreationDialog } from './ContactCreationDialog';

// Needed for accessibility reasons
// https://github.com/cloudflare/react-modal2#accessibility
ReactModal.getApplicationElement = () => document.getElementById('app');

export function getClosingFunctionByStrategy(strategy: ExternalClosingStrategy, choices = { hideAllModals, goToPrevModal }): () => IPayloadAction<any> {
    switch (strategy) {
        case ExternalClosingStrategy.PrevModal:
            return choices.goToPrevModal;
        case ExternalClosingStrategy.NoClosing:
            return () => undefined;
        default:
            throw new Error(`Unhandled closing strategy ${ strategy }`);
    }
}

//TODO remove this
const MODAL_CLASSES = {
    [ModalType.CreateEventQuestionModal]: 'foreground-panel',
    [ModalType.EnterOfflineModeDialog]: 'foreground-panel',
    [ModalType.ConfirmModal]: 'modal-dialog--size-narrow modal-dialog--flexible',
    [ModalType.SelectPlannerGroupDialog]: 'modal-dialog--size-narrow',
    [ModalType.ReSelectPlannerGroupDialog]: 'modal-dialog--size-narrow',
    [ModalType.UploadCompanySettings]: 'modal-dialog--flexible'
}

interface IGlobalModalProps {
    modals: IModalDefinition<any>[];
    //authentication: IAuthenticationState;
    //dispatchProps: IGlobalModalDispatchProps;
    goToPrevModal: typeof goToPrevModal;
    hideAllModals: typeof hideAllModals;
    entityFieldsData: EntityFieldsData;
}

class GlobalModal extends React.Component<IGlobalModalProps, object> {
    public render() {
        const topIndex = this.props.modals.length - 1;
        return (
            <div>
                {this.props.modals.map((modal, index) => {
                    if (modal.modalType == null) return null;
        
                    //const strategy = modal.externalClosingStrategy;
                    const SpecificModal = MODAL_COMPONENTS[modal.modalType];
                    
                    const modalClass = MODAL_CLASSES[modal.modalType];
                    const strategy = modalClosingStrategy(modal.modalType);
                    const dispatchProps = { goToPrevModal: this.props.goToPrevModal, hideAllModals: this.props.hideAllModals };
                    return (
                        <ReactModal key={modal.key}
                            // onClose: A callback that gets called whenever the `esc` key is pressed, or the backdrop is clicked.  
                            onClose={getClosingFunctionByStrategy(strategy, dispatchProps)} closeOnEsc={true}
                            closeOnBackdropClick={includes([//ExternalClosingStrategy.HideModal, 
                                    ExternalClosingStrategy.PrevModal], strategy)}
                            backdropClassName={cx('modal-dialog__overlay', { 'modal-dialog__overlay--transparent': topIndex !== index })}
                            modalClassName={cx('modal-dialog', modalClass)}>

                            {/*TODO this is passing variables to modals that don't need the parameters, refactor*/}
                            <SpecificModal {...modal.modalProps} { ...modal } entityFieldsData={this.props.entityFieldsData} />
                        </ReactModal>
                    );
                })}
            </div>
        );
    }
}

const selector = createSelector(
    (state: IGlobalState) => state.modal,
    state => entityFieldsDataFromState(state),
    (modals, entityFieldsData) => ({ modals, entityFieldsData}),
)

export default connect(    
    selector,
    { goToPrevModal, hideAllModals }
)(GlobalModal);

export function modalClosingStrategy(modalType: ModalType) {
    return MODAL_CLOSING_STRATEGY[modalType] || ExternalClosingStrategy.PrevModal;
}

//PrevModal closes with the backdrop
const MODAL_CLOSING_STRATEGY: { [index: string]: ExternalClosingStrategy } = {
    [ModalType.EditContactModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.EditContactOfflineModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.WriteEventModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.WriteEventOfflineModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.ContactNoteModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.ContactNoteOfflineModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.WriteEventAndCloseTaskModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.WriteTaskModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.SynchronisationSummary]: ExternalClosingStrategy.NoClosing,
    [ModalType.CompleteEventModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.CompleteEventOfflineModal]: ExternalClosingStrategy.NoClosing,
    [ModalType.CreateEventQuestionModal]: ExternalClosingStrategy.PrevModal,
    [ModalType.EnterOfflineModeDialog]: ExternalClosingStrategy.PrevModal,
    [ModalType.ConfirmModal]: ExternalClosingStrategy.PrevModal,    
    [ModalType.SelectPlannerGroupDialog]: ExternalClosingStrategy.NoClosing,
    [ModalType.ReSelectPlannerGroupDialog]: ExternalClosingStrategy.PrevModal,
    [ModalType.UploadCompanySettings]: ExternalClosingStrategy.PrevModal,
};

type IModalDefinitionEntityFieldsData<T> = IModalDefinition<T> & { entityFieldsData: EntityFieldsData }

const MODAL_COMPONENTS: { [index: string]: React.ComponentType<any> } = 
{    
    [ModalType.AccountModal]: salesForceItemDialogBuilderContent(AccountDetailProps),
    [ModalType.CalloutDetailsModal]: salesForceItemDialogBuilderContent(CalloutDetailProps),
    [ModalType.ComplaintModal]: salesForceItemDialogFields(ComplaintDetailProps),
    [ModalType.HelpdeskModal]: salesForceItemDialogFields(HelpdeskCaseDetailProps),
    [ModalType.CreateEventQuestionModal]: CreateEventQuestionModal,
    [ModalType.EnterOfflineModeDialog]: EnterOfflineModeModal,
    [ModalType.EquipmentDetails]: salesForceItemDialogBuilderContent(EquipmentDetailProps),
    [ModalType.ListOfEntitiesModal]: ListOfEntitiesDialog,
    [ModalType.ReadEventModal]: salesForceItemDialogFields(EventDetailProps),
    [ModalType.ReadEventOfflineModal]: salesForceItemDialogFields(EventDetailOfflineProps),
    [ModalType.ContactCreationModal]: ContactCreationDialog,
    [ModalType.ContactNoteModal]: ContactNoteModal,
    [ModalType.ContactNoteOfflineModal]: ContactNoteOfflineModal,
    [ModalType.ContactPhotoModal]: ContactPhotoModal,
    [ModalType.ContactPhotoOfflineModal]: ContactPhotoOfflineModal,
        //salesForceItemDialogBuilder({ fieldsetBuilder: opportunityFields, online: true }),
    [ModalType.OpportunityModal]: salesForceItemDialogBuilderContent(OpportunityDetailProps),
    [ModalType.PermissionDeniedModal]: PermissionDeniedModal,
    [ModalType.LeadModal]: salesForceItemDialogFields(LeadDetailProps),
    [ModalType.QueryModal]: salesForceItemDialogFields(QueryDetailProps),
    [ModalType.TransactionalSurveyCase]: salesForceItemDialogFields(TransactionSurveyCaseDetailProps),
    [ModalType.EditContactModal]: EditContactModal,
    [ModalType.EditContactOfflineModal]: EditContactOfflineModal,
    [ModalType.ShowContactModal]: salesForceItemDialogFields(ContactDetailProps(ModalType.EditContactModal, true)),
    [ModalType.ShowContactOfflineModal]: salesForceItemDialogFields(ContactDetailProps(ModalType.EditContactOfflineModal, false)),
    [ModalType.WriteEventModal]: EventCreationDialog,
    [ModalType.WriteEventOfflineModal]: EventCreationOfflineDialog,
    [ModalType.WriteEventAndCloseTaskModal]: EventCreationAndCloseTaskDialog,
    [ModalType.TaskModal]: salesForceItemDialogFields(TaskDetailProps),
    [ModalType.AuditTaskModal]: kffItemDialogBuilder(AuditDetailProps),
    [ModalType.TechnicianDialog]: salesForceItemDialogBuilderContent(TechnicianDetailProps),
    [ModalType.TenderDialog]: salesForceItemDialogBuilderContent(TenderDetailProps),
    [ModalType.MapServiceOrderLayers]: MapServiceOrderLayersModal,
    [ModalType.MapEquipmentFiltering]: MapEquipmentFilteringModal,
    [ModalType.MapOpportunityFiltering] : MapOpportunityFilteringModal,
    [ModalType.CompleteEventModal]: CompleteEventModal,
    [ModalType.CompleteEventOfflineModal]: CompleteEventOfflineModal,
    [ModalType.ConfirmModal]: ConfirmActionDialog,
    [ModalType.CreateAdminAssignmentDialog]: CreateAdminAssignmentDialog,
    [ModalType.SelectOptionModal]: SelectOptionDialog,
    [ModalType.SelectPlannerGroupDialog]: SelectPlannerGroupDialog,
    [ModalType.ReSelectPlannerGroupDialog]: SelectPlannerGroupDialog,
    [ModalType.LeaveOfflineModeModal]: LeaveOfflineModeModal,
    [ModalType.SynchronisationSummary]: SynchronisationSummaryDialog,
    [ModalType.SelectContactsDialog]: SelectContactsDialog,
    [ModalType.IncompleteDialog]: IncompleteDialog,
    [ModalType.IncompleteEntityDialog]: IncompleteEntityDialog,
    [ModalType.SearchUserDialog]: SearchUserDialog,

    [ModalType.SearchAccountDialog]: SearchAccountDialog,

    [ModalType.UploadCompanySettings]: UploadCompanySettingsDialog,
    [ModalType.WriteTaskModal]: TaskCreationModal,

    [ModalType.WorkOrderNotesModal]: WorkOrderNotesModal
};

function salesForceItemDialogBuilderContent<TEntity extends IdentifiableWithTitle>(props: DetailPropsContent<TEntity>) {
    return (tprops: IModalDefinition<TEntity>) => 
        <SalesforceItemDialog {...props} {...tprops}>
            {props.content(tprops.modalProps)}
        </SalesforceItemDialog>;
}

function salesForceItemDialogFields<TEntity extends IdentifiableWithTitle>(props: DetailPropsFields<TEntity>) {
    return (tprops: IModalDefinitionEntityFieldsData<TEntity>) => 
        <SalesforceItemDialog {...props} {...tprops} >
            {renderFields(props.fields(tprops.modalProps, tprops.entityFieldsData))}
        </SalesforceItemDialog>
}

function kffItemDialogBuilder<TEntity extends IdentifiableWithTitle>(props: DetailPropsFields<TEntity>) {
    return (tprops: IModalDefinitionEntityFieldsData<TEntity>) => 
        <SalesforceItemDialog {...props} {...tprops} externalActionButtons={ item => [<OpenInKff id={item.id} />]} hideSalesforceButton={true}>
            {renderFields(props.fields(tprops.modalProps, tprops.entityFieldsData))}
        </SalesforceItemDialog>;
}

interface SalesforceDialogProps<TEntity> extends React.WithChildren {
    online?: boolean,
    primaryAction?: (props: TEntity) => JSX.Element,
    topBar?: (props: TEntity) => JSX.Element,
    externalActionButtons?: (item: TEntity) => JSX.Element[],
    hideSalesforceButton?: boolean
}

class SalesforceItemDialog<TEntity extends IdentifiableWithTitle> 
extends React.Component<IModalDefinition<TEntity> & SalesforceDialogProps<TEntity>, object> {
    public render() {

        const { primaryAction } = this.props;
        const props = this.props;
        const modalProps = props.modalProps;
        const primaryAction2 = primaryAction === undefined ? eventSourceFloatingButton(modalProps, props.online) : primaryAction(modalProps);

        const locationBar = isMapMarker(modalProps) ? <LocationBar showOnSearchMap={false} locatable={modalProps} /> : null;
        return <DialogContainer>
            <DialogHeader 
                buttons={(props.topBar || locationBar) && 
                    <div className="dialog-header__actions container--horizontal">
                        {props.topBar && props.topBar(modalProps)}
                        {locationBar}
                    </div>
                }
                title={modalProps.title}
                primaryAction={primaryAction2} />
            <DialogContent padding={!!props.primaryAction ? DialogContentPadding.TopSmall : DialogContentPadding.HorizontalSmallest}>
                {props.children}
            </DialogContent>
            <div className='modal-dialog__button-bar separated--top-light'>
                <div className='container--horizontal'>
                    {props.externalActionButtons && props.externalActionButtons(modalProps) }
                    {!props.hideSalesforceButton ? <ViewInSalesForce id={modalProps.id} /> : null}
                </div>
            </div>
        </DialogContainer>
    }
}