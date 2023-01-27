import { SvgIcon } from '../../constants/SvgIcon';
import { formatLabel, formatDateTime } from '../../utils/formatUtils';
import { FieldValueType, IFieldValue } from "../../models/fields";
import calloutFields, { workorderTechnicianNameKonect } from '../../components/fields/calloutFields';
import { EntityFieldsData } from './EntityFieldsData';
import RejectedWorkOrderNonFSM from '../../models/feed/RejectedWorkOrderNonFSM';

export default (rso: RejectedWorkOrderNonFSM, entityFieldsData: EntityFieldsData): IFieldValue[] => {
    const serviceAppointmentFields =  [
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Person,
            label: formatLabel('technician.field.name'),
            value: workorderTechnicianNameKonect(entityFieldsData.serviceResourceEnabled, rso),
        },
        {
            kind: FieldValueType.Plain,
            icon: SvgIcon.Date,
            label: formatLabel('service-appointment.field.rejection-date'),
            value: formatDateTime(rso.newStatusDate, entityFieldsData.locale),
        },
    ] as IFieldValue[];

    const workorderFields = calloutFields(rso.workOrder, entityFieldsData);

    return [...serviceAppointmentFields, ...workorderFields];
};