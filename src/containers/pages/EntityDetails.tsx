import * as React from 'react';
import Account from "src/models/accounts/Account";
import { AccountIconsBar, AccountDetail, AccountDetailBase } from "src/components/details/account/AccountDetail";
import Callout from "src/models/feed/Callout";
import { CalloutActionsBar, EventActionsBar, ContactActionsBar } from "src/components/icons/iconBars";

import taskFields from '../../components/fields/taskFields';
import leadFields from '../../components/fields/leadFields';
import queryFields from '../../components/fields/queryFields';
import transactionalSurveyCaseFields from '../../components/fields/transactionalSurveyCaseFields';
import tenderFields from '../../components/fields/tenderFields';
import complaintFields from '../../components/fields/complaintFields';
import contactFields from '../../components/fields/contactFields';
import eventFields from '../../components/fields/eventFields';
import { IFieldValue } from 'src/models/fields';
import helpdeskCaseFields from 'src/components/fields/helpdeskCaseFields';
import { ModalType } from 'src/constants/modalTypes';
import IconButton from 'src/components/layout/IconButton';
import { formatLabel } from 'src/utils/formatUtils';
import { SvgIcon } from 'src/constants/SvgIcon';
import { editObjectInSalesforce } from 'src/services/externalApps';
import Event from 'src/models/events/Event';
import Technician from 'src/models/technicians/Technician';
import { TechnicianDetail } from 'src/components/details/TechnicianDetail';
import EquipmentDetail from 'src/components/details/equipment/EquipmentDetail';
import Contact from 'src/models/accounts/Contact';
import { ViewInTraceDb } from 'src/components/details/links/ViewInTraceDb';
import WorkorderDetail from 'src/components/details/WorkorderDetail';
import Opportunity from 'src/models/feed/Opportunity';
import OpportunityDetail from 'src/components/details/OpportunityDetail';
import { AccountWithContacts } from 'src/models/accounts/AccountWithContacts';
import ViewInKOL from 'src/components/details/links/ViewInKOL';
import Audit from 'src/models/audits/Audit';
import auditFields from 'src/components/fields/auditFields';
import rejectedServiceOrderFields from 'src/components/fields/rejectedServiceOrderFields';
import rejectedServiceOrderNonFSMFields from 'src/components/fields/rejectedWorkOrderNonFSMFields';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import Equipment from 'src/models/equipment/Equipment';
import {  faSms } from '@fortawesome/free-solid-svg-icons';
import { faSkype } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import { IconsBarGeneric } from 'src/components/layout/IconsBar';
import Tender from 'src/models/tenders/Tender';
import { renderFields } from 'src/components/forms/renderFields';
import { connect } from 'react-redux';
import { downloadAndShowOpportunity } from 'src/actions/integration/opportunitiesActions';
import { localeFromState, IGlobalState } from 'src/models/globalState';
import { ThunkAction } from 'src/actions/thunks';
import { showToast } from 'src/actions/toasts/toastActions';
import { toastMessages } from 'src/constants/toastMessages';
import { ViewInKKM } from 'src/components/details/links/ViewInKKM';
import { isAndroid } from 'src/utils/cordova-utils';
import { Icon } from 'src/components/layout/Icon';

export interface DetailPropsContent<TEntity> {
    online: boolean,
    content: (item: TEntity) => JSX.Element,
    topBar?: (props: TEntity) => JSX.Element,
    externalActionButtons?: (item: TEntity) => JSX.Element[],
}

/*
export interface DetailPropsFieldsetBuilder<TEntity>  {
    online?: boolean,
    topBar?: (props: TEntity) => JSX.Element,
    externalActionButtons?: (item: TEntity) => JSX.Element[],
    fieldsetBuilder: (t: TEntity) => FieldsetBuilder
}
*/

export interface DetailPropsFields<TEntity>  {
    online?: boolean,
    topBar?: (props: TEntity) => JSX.Element,
    externalActionButtons?: (item: TEntity) => JSX.Element[],
    fields: (t: TEntity, entityFieldsData: EntityFieldsData) => IFieldValue[]
}

export const AccountDetailProps = {
    topBar: account => <AccountIconsBar account={account} />,
    content: item => <AccountDetail account={item} contacts={item.contacts} />,
    externalActionButtons: item => [<ViewInKOL accountId={item.id}/>],
    online: true
} as DetailPropsContent<Account>

export const AccountDetailOfflineProps = {
    content: (item) => 
        <AccountDetailBase account={item.account} report={null} contacts={item.contacts} primaryContact={null} 
            online={false} showReport={(id: string) => {}}/>,
    online: false
} as DetailPropsContent<AccountWithContacts>;

export const AuditDetailProps = {
    fields: auditFields,
    online: true
} as DetailPropsFields<Audit>;

export const CalloutDetailProps = {
    content: item => <WorkorderDetail workorder={item} />,
    topBar: callout => <CalloutActionsBar callout={callout} />,
    online: true
} as DetailPropsContent<Callout>

export const RejectedWorkorderDetailProps = { fields: rejectedServiceOrderFields, online: true }

export const RejectedWorkorderNonFSMDetailProps = { fields: rejectedServiceOrderNonFSMFields, online: true }

export const ComplaintDetailProps = { fields: complaintFields, online: true }

export const HelpdeskCaseDetailProps = { fields: helpdeskCaseFields, online: true }

export const EquipmentDetailProps = {
    content: item => <EquipmentDetail equipment={item} />,
    externalActionButtons: item => [
        <ViewInTraceDb id={item.equipmentNumber} />,
        <ViewInKKM />
    ],
    online: true
} as DetailPropsContent<Equipment>;

export const EventDetailProps = {
    fields: eventFields,
    topBar: event => <EventActionsBar event={event} completeEventModal={ModalType.CompleteEventModal} 
        contactNoteModal={ModalType.ContactNoteModal} 
        contactPhotoModal={ModalType.ContactPhotoModal} />,
    externalActionButtons: item => [
        <IconButton label={formatLabel('generic.button.edit-salesforce')} icon={SvgIcon.ButtonArrow} onClick={() => editObjectInSalesforce(item.id)} />
    ],
    online: true
} as DetailPropsFields<Event>

export const EventDetailOfflineProps = {
    fields: eventFields,
    topBar: event => <EventActionsBar event={event} completeEventModal={ModalType.CompleteEventOfflineModal} contactNoteModal={ModalType.ContactNoteOfflineModal} 
        contactPhotoModal={ModalType.ContactPhotoOfflineModal} />,        
    online: false
} as DetailPropsFields<Event>

export const TechnicianDetailProps = {
    content: (t: Technician) => <TechnicianDetail item={t} />,
    online: true,
    //topBar: item => <div>{skypeLink(item.telMobile, 'white')}{smsLink(item.telMobile, 'white')}</div>,
    topBar: item => <IconsBarGeneric 
        items={[
            // <SkypeLink className="icon-button" phone={item.telMobile} color={'white'} />, 
            <TeamsLink email = {item.email} />,
            <SmsLink className="icon-button" phone={item.telMobile} color={'white'} />
        ]} 
        itemKey={(item, index) => index + ""}
        itemContent={t => t} />
} as DetailPropsContent<Technician>

class SkypeLinkClass extends React.Component<{ phone: string, color: string, className?: string, size?: SizeProp, openSkype: typeof openSkype }> {

    public render() {
        const { size, phone, className, color } = this.props;
        const android = isAndroid();
        if(android && phone) {
            return <a onClick={() => this.props.openSkype(phone)} className={className}>
                <FontAwesomeIcon size={size ||"1x"} color={color} icon={faSkype}/>
            </a>;
        }

        return phone && 
            <a href={"skype:" + phone} className={className}>
                <FontAwesomeIcon size={size ||"1x"} color={color} icon={faSkype}/>
            </a>;
    }

}

export const SkypeLink = connect(null, { openSkype })(SkypeLinkClass)

function openSkype(phone: string): ThunkAction<void> {
    return (dispatch, getState) => {
        const app = startApp.set({ /* params */
            "action": "ACTION_VIEW",
            "package": "com.skype.raider",
            "uri": "skype:" + phone
        });
        app.check(
            () => app.start(),
            () => dispatch(showToast({ message: toastMessages().OPEN_EXTERNAL_APP_FAILED }))
        );
    }
}


class TeamsLinkClass extends React.Component<{ email: string, className?: string, openTeams: typeof openTeams }> {
    public render() {
        const { email, className } = this.props;
        if (email == null) return null
        const Email = email && email!= null && email.includes('full') ? email.slice(0, email.length - 5) : email.includes('invalid') ? email.slice(0 , email.length - 8) : email
        const android = isAndroid();
        if(android && Email) {
            return <a onClick={() => this.props.openTeams(Email)} className={className}>
                <Icon svg={SvgIcon.Teams} />
            </a>;
        }
        return Email && 
            <a href={"https://teams.microsoft.com/l/chat/0/0?users="+Email} target="_blank" className={className}>
                {/* <FontAwesomeIcon size={size ||"1x"} color={color} icon={faMicrosoft}/> */}
                <Icon svg={SvgIcon.Teams} />
            </a>;
    }
}

export const TeamsLink = connect(null, { openTeams })(TeamsLinkClass)

function openTeams(email: string): ThunkAction<void> {
    return (dispatch, getState) => {
        const app = startApp.set({ /* params */
            "action": "ACTION_VIEW",
            "package": "com.microsoft.teams",
            "uri": "https://teams.microsoft.com/l/chat/0/0?users="+email
        });
        app.check(
            () => app.start(),
            () => dispatch(showToast({ message: toastMessages().OPEN_EXTERNAL_APP_FAILED }))
        );
    }
}



export function SmsLink(props: { phone: string, color: string, className?: string, size?: SizeProp }) {
    return props.phone && <a href={"sms:" + props.phone} className={props.className}>
            <FontAwesomeIcon size={props.size ||"1x"} color={props.color} icon={faSms}/>
        </a>;
}

export const LeadDetailProps = { fields: leadFields, online: true }
export const QueryDetailProps = { fields: queryFields, online: true }
export const TransactionSurveyCaseDetailProps = { fields: transactionalSurveyCaseFields, online: true }
export const TaskDetailProps = { fields: taskFields, online: true }
export const TenderDetailProps = { fields: tenderFields, online: true, content: (t: Tender) => <TenderFieldsDiv tender={t} /> }

function TenderFieldsDivComponent(props: { 
    tender: Tender, 
    downloadAndShowOpportunity: (id: string, accountName: string) => void, 
    className?: string,
    locale: string
}) {
    return <div className={props.className}>
            { renderFields(TenderDetailProps.fields(props.tender, props.downloadAndShowOpportunity, props.locale)) }
        </div>;
}

export const TenderFieldsDiv = connect(
    (state: IGlobalState) => ({ locale: localeFromState(state) }), 
    { downloadAndShowOpportunity }
)(TenderFieldsDivComponent)

export const OpportunityDetailProps = {
    content: (t: Opportunity) => <OpportunityDetail opportunity={t} />,
    online: true
} as DetailPropsContent<Opportunity>

export function ContactDetailProps(modalType: ModalType, online: boolean) {
    return { 
        fields: contactFields,
        buttons: (contact: Contact) => <ContactActionsBar modalType={modalType} contact={contact}/>,
        online 
    };
}
