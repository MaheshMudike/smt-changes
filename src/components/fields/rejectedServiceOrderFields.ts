import { SvgIcon } from '../../constants/SvgIcon';
import { formatLabel, formatDateTime } from '../../utils/formatUtils';
import { FieldValueType, IFieldValue } from "../../models/fields";
import RejectedServiceOrder from "src/models/feed/RejectedServiceOrder";
import calloutFields from '../../components/fields/calloutFields';
import { EntityFieldsData } from './EntityFieldsData';

/*
-'Technician name who rejected' + 'SA number rejected' + 
"Time of rejection" + "Reason for rejection" + WO details;
*/
export default (rso: RejectedServiceOrder, entityFieldsData: EntityFieldsData): IFieldValue[] => {
    const serviceAppointmentFields =  rso.serviceAppointment == null ? [] : [
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Person,
            label: formatLabel('technician.field.name'),
            value: rso.serviceAppointment.Assigned_Service_Resource__r && rso.serviceAppointment.Assigned_Service_Resource__r.Name,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Number,
            label: formatLabel('service-appointment.field.number'),
            value: rso.serviceAppointment.AppointmentNumber,
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Date,
            label: formatLabel('service-appointment.field.rejection-date'),
            value: formatDateTime(rso.serviceAppointment.New_Status_Date__c, entityFieldsData.locale),
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Description,
            label: formatLabel('service-appointment.field.rejection-reason'),
            value: rso.serviceAppointment.Rejection_Reason__c,
        },
    ] as IFieldValue[];

    const workorderFields = calloutFields(rso.workOrder, entityFieldsData);

    return [...serviceAppointmentFields, ...workorderFields];
};