import { SvgIcon } from '../../constants/SvgIcon';
import Callout, { workOrderStatus } from '../../models/feed/Callout';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatDateTime, joinOptionals, formatDate } from '../../utils/formatUtils';
import { formatLabel } from '../../utils/formatUtils';
import { showEquipmentLinkWrapper } from '../forms/ShowEquipmentDetailsModalButton';
import { showAccountLinkWrapper, showTechnicianLinkWrapper } from '../forms/ShowAccountDetailsModalButton';
import { ServiceOrderType } from 'src/constants/ServiceOrderType';
import { EntityFieldsData } from './EntityFieldsData';
import * as React from 'react';
import { connect } from 'react-redux';
import { showModal } from 'src/actions/modalActions';
import { ModalType } from 'src/constants/modalTypes';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import translate from 'src/utils/translate';
import { Note } from 'src/models/api/coreApi';

const fields = (callout: Callout, entityFieldsData: EntityFieldsData): IFieldValue[] => {
    const { userId, locale, activeInFSM } = entityFieldsData;
    const technician = lastTechnicianAssigned(callout, entityFieldsData);
    return [
        {
            icon: SvgIcon.Location,
            label: formatLabel('generic.field.address'),
            value: activeInFSM ? callout.address : callout.locationAddress,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Contacts,
            label: formatLabel('generic.field.caller-name', 'generic.field.caller-phone-number'),
            value: joinOptionals(
                activeInFSM ? [callout.callerName, callout.callerPhone] : [callout.konectCallerName, callout.konectCallerPhone]
            ),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Equipment,
            label: formatLabel('generic.field.equipment-number', 'generic.field.equipment-serial-number'),
            linkWrapper: showEquipmentLinkWrapper(callout.equipmentId),
            value: joinOptionals([callout.equipmentNumber, callout.equipmentSerialNumber]),
            kind: FieldValueType.Linked,
        },
        {
            icon: SvgIcon.Account,
            label: formatLabel('generic.field.account-name'),
            linkWrapper: showAccountLinkWrapper({ id: callout.equipmentAccountId, name: callout.equipmentAccountName }),
            value: callout.equipmentAccountName,
            kind: FieldValueType.Linked,
        },
        {
            faIcon: faClipboard,
            label: formatLabel('callout.field.notes'),
            linkWrapper: (props: React.WithChildren) => 
                <WorkorderNoteModalButtonListItem item={callout} workOrderId={callout.id}>{props.children}</WorkorderNoteModalButtonListItem>,
            value: callout.notes == null ? 
                translate('callout.field.click-to-add-notes') : 
                //formatDate(callout.notes.Due_Date__c, locale) + '\n' + 
                callout.notes.Title,
            kind: FieldValueType.Linked,
        },
        {
            icon: SvgIcon.Status,
            label: formatLabel('generic.field.status', 'callout.field.assembly-code'),
            value: joinOptionals([workOrderStatus(callout, activeInFSM), callout.assemblyCodeDescription]),
            // value: joinOptionals([activeInFSM ? callout.status : callout.konectStatus || callout.status, callout.assemblyCodeDescription])
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.detailed-reason-for-rejection'),
            value: callout.detailedReasonForRejection,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Visit,
            label: formatLabel('generic.field.visit-type-priority', 'generic.field.failure-type'),
            value: joinOptionals([callout.visitType, callout.failureType]),
            kind: FieldValueType.Plain,
        },
        /*
        {
            icon: SvgIcon.Locate,
            label: formatLabel('DEBUG: serviceOrderType', 'assemblyCode'),
            value: joinOptionals([callout.serviceOrderType, callout.assemblyCode]),
        },
        */
       technician == null || technician.Id == null ? {
            icon: SvgIcon.Visittype,
            label: formatLabel('generic.field.last-technician-assigned'),
            value: technician && technician.Name,
            kind: FieldValueType.Plain,
        } : {
            icon: SvgIcon.Visittype,
            label: formatLabel('generic.field.last-technician-assigned'),
            linkWrapper: showTechnicianLinkWrapper({ id: technician.Id, name: technician.Name }),
            value: technician.Name,
            kind: FieldValueType.Linked,
        },
        activeInFSM ?
        {
            icon: SvgIcon.Parent,
            label: formatLabel('generic.field.calculated-response-time'),
            value: formatDateTime(callout.calculatedResponseTime, locale),
            kind: FieldValueType.Plain,
        } : null,
        {
            icon: SvgIcon.Contract,
            label: formatLabel('generic.field.contract-type'),
            value: callout.contractType,
            kind: FieldValueType.Plain,
        },
        // {
        //     icon: SvgIcon.Date,
        //     label: formatLabel('generic.field.created'),
        //     value: formatDateTime(callout.createdDate, locale),
        //     kind: FieldValueType.Plain
        // },
        /*
        {
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.start-date'),
            value: formatDateTime(callout.startDate),
        },
        */

        {
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.earliest-start-date'),
            value: formatDateTime(callout.earliestStartDate, locale),
            kind: FieldValueType.Plain,
        },
        ...( !activeInFSM || callout.serviceOrderType == ServiceOrderType.YSM3 || callout.serviceOrderType == ServiceOrderType.YSM4 ? 
            [] : [
            {
                icon: SvgIcon.Date,
                label: formatLabel('generic.field.created'),
                value: formatDateTime(callout.createdDate, locale),
                kind: FieldValueType.Plain
           },
            {
                icon: SvgIcon.Date,
                label: formatLabel('generic.field.due-date'),
                value: formatDateTime(callout.dueDate, locale),
                kind: FieldValueType.Plain
            }
            ] as IFieldValue[]  ),
        ...(activeInFSM ? [
            {
                icon: SvgIcon.Date,
                label: formatLabel('generic.field.scheduled-start-date'),
                value: formatDateTime(callout.scheduledStartDate, locale),
                kind: FieldValueType.Plain,
            },
            {
                icon: SvgIcon.Date,
                label: formatLabel('generic.field.scheduled-end-date'),
                value: formatDateTime(callout.scheduledEndDate, locale),
                kind: FieldValueType.Plain,
            }
        ] as IFieldValue[] : []),
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.failure-description'),
            value: (activeInFSM ? callout.workOrderLinesOperationCodes : callout.visitType != 'Maintenance' ? callout.description : callout.workOrderLinesOperationCodes ),
            // value: callout.workOrderLinesOperationCodes,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.job-description'),
            value: callout.jobDescription,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.FlagEmpty,
            label: formatLabel('generic.field.supervisor-will-manage'),
            value: formatLabel(`generic.answer.${ callout.svWillManage ? 'yes' : 'no' }`),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.supervisor-comment'),
            value: callout.supervisorComment,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.supervisor-will-manage-reason'),
            value: callout.SupervisorWillManageReason,
            kind: FieldValueType.Plain,
        },
    ];
};

function lastTechnicianAssigned(callout: { lastTechnicianAssigned: string, completedBy: { Id: string, Name: string }, technicianName: string }, entityFieldsData: EntityFieldsData) {
    const { activeInFSM, serviceResourceEnabled } = entityFieldsData;
    if(activeInFSM) {
        return { Id: null, Name: callout.lastTechnicianAssigned };
    } else {
        return serviceResourceEnabled ? callout.completedBy : { Id: null, Name: callout.technicianName };
    }
}

export function workorderTechnicianNameKonect(serviceResourceEnabled: boolean, callout: { completedByName: string, technicianName: string }) {
    return serviceResourceEnabled ? callout.completedByName : callout.technicianName;
}

export default fields;

class WorkorderNoteModalButtonListItemClass extends React.Component<{ 
    item: { notes: Note, queryDetails: () => Promise<any> },
    workOrderId: string, showModal: typeof showModal 
}, object> {
    public render() {
        const { item, workOrderId } = this.props;
        return (
            <button className='relative link-wrapper--full-width' onClick={
                () => this.props.showModal(ModalType.WorkOrderNotesModal, { item, workOrderId }) 
            }>
                {this.props.children}
            </button>
        );
    }
}

export const WorkorderNoteModalButtonListItem = connect(null, { showModal })(WorkorderNoteModalButtonListItemClass)
