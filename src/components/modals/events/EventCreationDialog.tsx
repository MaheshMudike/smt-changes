import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';

import { changeFormValue, selectContactsOnPlanCustomerVisit, setRelatedToOnPlanCustomerVisit, eventCreationSetContactSelectionAccounts } 
    from '../../../actions/planCustomerVisitActions';
import { SvgIcon } from '../../../constants/SvgIcon';
import { IApiNameAndId } from '../../../models/api/coreApi';
import { IPlanCustomerVisitState, IAccountWithType } from '../../../models/plan/IPlanCustomerVisitState';
import { joinOptionals } from '../../../utils/formatUtils';
import translate from '../../../utils/translate';
import { CoveringSpinner } from '../../CoveringSpinner';
import { DateTimeInput } from '../../forms/DateTimeInput';
import { SelectField, SelectFieldStub } from '../../forms/SelectField';
import WithIcon, { WithIconFA } from '../../forms/WithIcon';
import { DialogContainer } from '../layout/DialogContainer';
import { FlexDialogContent } from '../layout/DialogContent';
import { DialogHeader } from '../layout/DialogHeader';
import { DialogHeaderTextButton } from '../../layout/DialogHeaderTextButton';
import { Option as ReactSelectOption } from 'react-select';
import * as _ from 'lodash';
import { EntityType } from 'src/constants/EntityType';
import { upsertEventWithToast, scheduleCustomerMeetingOffline, queryEventDescribe, deleteEventWithToast } from '../../../actions/integration/events/eventActions';
import { createSelector } from 'reselect';
import { IGlobalState, activeInFSMFromState } from '../../../models/globalState';

import { showSelectContactsDialog } from '../../../actions/selectContactsDialogActions';
import { showModal } from '../../../actions/modalActions';

import { EventType, translateEventType } from '../../../constants/EventType';
import Callout from 'src/models/feed/Callout';
import { downloadEquipment } from 'src/actions/integration/equipmentActions';
import { IdentifiableWithTitleEntity } from 'src/models/feed/ISObject';
import { ModalType } from 'src/constants/modalTypes';
import { SObject } from 'src/actions/http/jsforceMappings';
import { DescribeSObjectResult } from 'jsforce';
import { ILabelValue } from 'src/models/ILabelValue';
import { faBullseye, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import IEventSource from 'src/models/events/IEventSource';
import { entityFieldsDataFromState, EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import Audit from 'src/models/audits/Audit';

export function isAccount(relatedTo: any) {
    //return relatedTo && (relatedTo as IAccount).id !== undefined;
    return relatedTo != null && relatedTo.entityType == EntityType.Account
}

export const writeEventModalTitle = 'modal.write-event.title';

export interface IEventFromEventCreationDialog {
    Id?: string;
    Description: string,
    EndDateTime: string,
    StartDateTime: string,
    Subject: string,
    Type: string,
    What: IApiNameAndId,
    WhoId: string
}

const writableEventTypes = [EventType.CustomerVisit, EventType.ProspectingVisit, EventType.CustomerEvent, EventType.PhoneVisit];

type EventCreationProps = ReturnType<typeof EventCreationStateProps> & IEventModalDispatchProps & IPlanCustomerVisitState
& { closesTask: boolean, userId: string, online: boolean, eventDescribe: DescribeSObjectResult, entityFieldsData: EntityFieldsData };

export enum EventObjective {
    CXOnboardingVisit = 'CX onboarding visit',
    CXSiteVisit = 'CX site visit'
}

function translateEventObjective(eo: EventObjective) {
    switch(eo) {
        case EventObjective.CXOnboardingVisit:
            return translate("event-modal.cx-onboarding-visit");
        case EventObjective.CXSiteVisit:
            return translate("event-modal.cx-site-visit");
        default:
            return eo;
    }
}

const eventObjectives = [EventObjective.CXOnboardingVisit, EventObjective.CXSiteVisit];

class EventCreationDialogClass extends React.Component<EventCreationProps, object> {

    public componentDidMount() {
        this.loadEventSourceAccounts(this.props.sourceEntity);
        //this.props.queryEventDescribe();
    }

    public componentWillReceiveProps(nextProps: EventCreationProps) {
        if(this.props.sourceEntity != nextProps.sourceEntity) {
            this.loadEventSourceAccounts(nextProps.sourceEntity);
        }
    }

    private loadEventSourceAccounts = (eventSource: IEventSource) => {
        if(eventSource && this.props.form && this.props.form.relatedTo != null ){
            this.props.eventCreationSetContactSelectionAccounts([{accountType:[],account:this.props.form.relatedTo}])
        }
        // const equipmentId = eventSource && (eventSource as Callout).equipmentId;
        // const isCalloutWithEquipment = eventSource && eventSource.entityType === EntityType.Callout && equipmentId != null;
        // const accountsPromise = 
        //     isCalloutWithEquipment && this.props.online ? 
        //         downloadEquipment(equipmentId, this.props.entityFieldsData).then(eq => eq.accountsForEventCreation) :
        //         eventSource && eventSource.accountsForEventCreation || Promise.resolve([] as IAccountWithType[]);
        // accountsPromise.then(accountIdsAndTypes => this.props.eventCreationSetContactSelectionAccounts(accountIdsAndTypes));
        // if(eventSource != null && eventSource.entityType != EntityType.Audit && eventSource.contactsForEventCreation ) eventSource.contactsForEventCreation.then(cs => this.props.selectContactsOnPlanCustomerVisit(cs))
    }

    public render() {
        const sourceEntityType = this.props.sourceEntity && this.props.sourceEntity.entityType;
        const isEventWithAuditNumber = sourceEntityType === EntityType.Event && (this.props.sourceEntity as any).auditNumber != null;
        const isAudit = sourceEntityType === EntityType.Audit || isEventWithAuditNumber;
        const isContactSelectionDisabled = !this.props.form.relatedTo && !isAudit || isEventWithAuditNumber;
        const selectedContactsPlaceholder = translate(isContactSelectionDisabled ? 'generic.placeholder.contact-account-first' : 'generic.placeholder.contact-customer');

        const form = this.props.form;

        const isPlanCustomerVisitFormValid = form.eventType != null && moment(form.startDate).isBefore(form.endDate);

        const sourceEntity = this.props.sourceEntity;
        const showRelatedSearchButton = sourceEntity == null || this.getRelatedOptions().length <= 0;

        //const eventObjectivePicklistEntries = this.getObjectivePicklistValues();
        //const eventObjectiveOptions = eventObjectivePicklistEntries.filter(e => e.active).map(e => ({ label: e.label, value: e.value }));

        const title = isAudit ? 'modal.audit-event.title' : writeEventModalTitle;
        /*
        const accountIds = this.props.relatedAccounts.map(a => a.account.id);
        if(isAccount(this.props.form.relatedTo)) accountIds.push(this.props.form.relatedTo.id);
        */
       const relatedItemPlaceholder = translate('generic.placeholder.account-choose');
        return <DialogContainer>
            <DialogHeader
                title={translate(title)}
                confirmAction={
                    <React.Fragment>
                        {/*
                        <DialogHeaderTextButton onClick={() => this.deleteMeeting()} 
                            disabled={this.props.form.id == null || form.isWaitingForResponse}
                            label={ translate('generic.button.delete')} 
                        />
                        */}
                        <DialogHeaderTextButton onClick={() => this.saveMeeting()} 
                            disabled={!isPlanCustomerVisitFormValid || form.isWaitingForResponse}
                            label={ translate(this.props.closesTask ? 'generic.button.create-close-task' : 'generic.button.save')} 
                        />
                    </React.Fragment>
                }
            />
            <FlexDialogContent>
                {form.isWaitingForResponse ? <CoveringSpinner /> : null}
                {showRelatedSearchButton && !isAudit &&
                    <WithIcon icon={SvgIcon.Related} className='separated flex-shrink--0'>
                        <SelectFieldStub
                            caption={form.relatedTo == null ? null : form.relatedTo.title}
                            onClick={() => this.props.showModal(ModalType.SearchAccountDialog)}
                            placeholder={relatedItemPlaceholder}
                        />
                    </WithIcon>
                }
                {!showRelatedSearchButton && !isAudit &&
                    <WithIcon icon={SvgIcon.Related} className='separated flex-shrink--0'>
                        <SelectField
                            className="flex--1"
                            value={form.relatedTo}
                            options={this.getRelatedOptions()}
                            optionsMapper={(item: IdentifiableWithTitleEntity): ReactSelectOption => {
                                return item == null ? null : { label: item.title, value: item.id };
                            }}
                            onChange={(relatedTo: IdentifiableWithTitleEntity) => { this.props.setRelatedToOnPlanCustomerVisit(relatedTo) }}
                            //isLoading={this.props.accountOptions.isAccountsLoading}
                            placeholder={relatedItemPlaceholder}
                        />
                    </WithIcon>
                }
                <WithIcon icon={SvgIcon.Contacts} className='separated flex-shrink--0'>
                    <div className='contact-field padding-vertical--std padding-horizontal--smallest' onClick={() => {
                        if(isContactSelectionDisabled !== true) {
                            this.props.showSelectContactsDialog({
                                confirmSelection: this.props.selectContactsOnPlanCustomerVisit, 
                                contacts: form.participants,
                                //accountIds: accountIds,
                                //getContactOptions: (accountIds: string[]) => this.props.getContacts(accountIds)
                            });
                        }
                    }}>
                        { _.isEmpty(form.participants) ? <div className='placeholder'>{selectedContactsPlaceholder}</div>
                            : form.participants.map(contact =>
                                <span key={contact.id} className=' padding-vertical--smallest margin-right--smallest contact-field--item'>{contact.fullName}</span>
                            )
                        }
                    </div>

                </WithIcon>
                <WithIcon icon={SvgIcon.Reason} className='separated flex-shrink--0'>
                    <SelectField
                        value={form.eventType}
                        options={isAudit ? [EventType.MeetingInternal] : writableEventTypes}
                        optionsMapper={(item: EventType): ReactSelectOption => {
                            return item == null ? null : { label: translateEventType(item), value: item };
                        }}
                        isLoading={false}
                        onChange={(eventType: EventType) => this.props.changeFormValue({ eventType })}
                        placeholder={translate('generic.placeholder.event-type-choose')}
                    />
                </WithIcon>
                {!isAudit &&  this.props.form && this.props.form.eventType && this.props.form.eventType.toString() == EventType.CustomerVisit ?
                    <WithIconFA icon={faBullseye} className='separated flex-shrink--0'>
                        <SelectField
                            //multi={true}
                            value={form.objectives}
                            options={eventObjectives}
                            optionsMapper={(item: EventObjective): ReactSelectOption => {
                                return item == null ? null : { label: translateEventObjective(item), value: item };
                            }}
                            isLoading={false}
                            onChange={(objectives: EventObjective) => this.props.changeFormValue({ objectives })}
                            placeholder={translate('generic.placeholder.objectives-choose')}
                        />
                    </WithIconFA> : null
                }
                <WithIconFA icon={faMapMarkerAlt} className='separated flex-shrink--0'>
                    <input
                        type="text"
                        placeholder={translate('generic.placeholder.location')}
                        value={form.location}
                        onChange={(event: any) => this.props.changeFormValue({ location: event.target.value })}
                        //placeholder={translate('generic.placeholder.objectives')}
                    />
                </WithIconFA>
                {/*
                <WithIcon icon={SvgIcon.Reason} className='separated flex-shrink--0'>
                    <SelectField
                        multi={true}
                        value={form.objectives}
                        options={eventObjectiveOptions}
                        optionsMapper={item => item}
                        isLoading={false}
                        onChange={(objectives: PicklistEntry[]) => this.props.changeFormValue({ objectives })}
                        placeholder={translate('generic.placeholder.objectives-choose')}
                    />
                </WithIcon>
                */}
                <WithIcon icon={SvgIcon.StartDate} className='separated flex-shrink--0'>
                    <DateTimeInput value={form.startDate} 
                        onChange={(startDate: moment.Moment) => this.props.changeFormValue({ startDate, endDate: moment(startDate).add('hour', 1) }) } />
                </WithIcon>
                <WithIcon icon={SvgIcon.EndDate} className='separated flex-shrink--0'>
                    <DateTimeInput value={form.endDate} onChange={(endDate: moment.Moment) => this.props.changeFormValue({ endDate })} />
                </WithIcon>
                <WithIcon icon={SvgIcon.Description} multiline className='flex-grow--1'>
                    <textarea value={form.description} className='full-height' placeholder={translate('generic.placeholder.description')}
                        onChange={(event: any) => this.props.changeFormValue({ description: event.target.value })} />
                </WithIcon>
            </FlexDialogContent>
        </DialogContainer>
    }

    private getObjectivePicklistValues() {
        const fieldDescribe = this.props.eventDescribe && this.props.eventDescribe.fields 
            && this.props.eventDescribe.fields.find(f => f.name === "Objectives__c");
        return fieldDescribe && fieldDescribe.picklistValues || [];
    }

    private getRelatedOptions() {
        const results = [] as IdentifiableWithTitleEntity[];
        // const results = this.props.relatedAccounts.map(ra => 
            //({ ...ra.account, title: joinOptionals([ra.account.title, formatAccountTypes(ra.accountType)]) })
            // ra.account
        // );
        const relatedTo = this.props.form && this.props.form.relatedTo;
        if(relatedTo && !results.find(item => item.id == relatedTo.id)) {
            results.push(relatedTo);
        }
        return results;
    };

    private deleteMeeting = () => {
        this.props.deleteEventWithToast(this.props.form.id);
    }

    private saveMeeting = () => {
        const sourceEntityType = this.props.sourceEntity && this.props.sourceEntity.entityType;
        const isAudit = sourceEntityType === EntityType.Audit
        const form = this.props.form;
        const accountName = form && form.relatedTo ? form.relatedTo.title : null;
        const contacts = form.participants;
        const subjectParts = isAudit ? [translate("generic.entity-name.audit"), (this.props.sourceEntity as Audit).technicianName] : [translateEventType(form.eventType), accountName];
        const event = {
            Description: form.description,
            EndDateTime: form.endDate.toISOString(),
            StartDateTime: form.startDate.toISOString(),
            Subject: joinOptionals(subjectParts, ' - ', true),
            Type: form.eventType,
            What: form.relatedTo == null ? null : { Id: form.relatedTo.id, Name: form.relatedTo.title },
            WhatId: form.relatedTo == null ? null : form.relatedTo.id,
            Audit_Number__c: form.auditNumber == null ? null : form.auditNumber,
            //TODO camera and attachment not visible if WhoId not set, putting the first contact, must be checked
            WhoId: contacts && contacts[0] && contacts[0].id,
            Objectives__c: form.objectives,//.map(objs => objs.value).join(";"),
            Location: form.location
        } as IEventFromEventCreationDialog;

        const sourceIsTask = this.props.sourceEntity && this.props.sourceEntity.entityType === EntityType.Task;
        const taskToCloseId = this.props.closesTask && sourceIsTask ? this.props.sourceEntity.id : null;
        // this.props.insertEventWithToast(event, contacts, taskToCloseId);
        const formId = this.props.form.id;
        if(formId != null) event.Id = formId;
        this.props.online == true ? this.props.upsertEventWithToast(event, contacts, taskToCloseId) : this.props.scheduleOfflineMeeting(event, contacts);

    };
}

const EventCreationDispatchProps = {
    changeFormValue,
    upsertEventWithToast,
    selectContactsOnPlanCustomerVisit,
    setRelatedToOnPlanCustomerVisit,
    showSelectContactsDialog,
    showModal,
    eventCreationSetContactSelectionAccounts,
    queryEventDescribe,
    deleteEventWithToast,
}

type IEventModalDispatchProps = typeof EventCreationDispatchProps & {
    scheduleMeeting: typeof upsertEventWithToast;
    scheduleOfflineMeeting: typeof scheduleCustomerMeetingOffline;
}

const EventCreationStateProps = (closesTask: boolean, online: boolean) =>
    createSelector(
        (state: IGlobalState) => state.planCustomerVisit,
        state => state.authentication.currentUser.id,
        state => state.describes[SObject.Event],
        state => entityFieldsDataFromState(state),
        (planCustomerVisit, userId, eventDescribe, entityFieldsData) => 
            ({ ...planCustomerVisit, closesTask, userId, online, eventDescribe, entityFieldsData })
    )

function connectWriteEventModalClass(closesTask: boolean, 
    //getContacts: (accountIds: string[]) => any, //getAccountsNameAndId: () => void,
    scheduleMeeting: typeof upsertEventWithToast,
    scheduleOfflineMeeting: typeof scheduleCustomerMeetingOffline,
    online: boolean
) {
    return connect(
        EventCreationStateProps(closesTask, online),
        { ...EventCreationDispatchProps, scheduleMeeting, scheduleOfflineMeeting }
    )(EventCreationDialogClass);
}

export const EventCreationDialog = connectWriteEventModalClass(false,upsertEventWithToast,null,true);
export const EventCreationOfflineDialog = connectWriteEventModalClass(false,null, scheduleCustomerMeetingOffline, false);
export const EventCreationAndCloseTaskDialog = connectWriteEventModalClass(true, upsertEventWithToast,null, true);