import { capitalize } from 'lodash';
import * as moment from 'moment';

import { SvgIcon } from '../../constants/SvgIcon';
import { AuditListItemBase } from '../../models/audits/Audit';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatLabel } from '../../utils/formatUtils';
import { AuditStatus } from '../../models/api/coreApi';

export default function auditFields(a: AuditListItemBase): IFieldValue[] {
    return [
        {
            icon: SvgIcon.File,
            label: formatLabel('generic.field.template'),
            value: a.templateName,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Status,
            label: formatLabel('generic.field.status'),
            value: capitalize(AuditStatus[a.status]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Visittype,
            label: formatLabel('generic.field.employee-number'),
            value: a.employeeNumber,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Visittype,
            label: formatLabel('generic.field.technician-name'),
            value: a.technicianName,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.date'),
            value: moment(a.plannedDate).format('DD MMM YYYY'),
            kind: FieldValueType.Plain,
        },
    ];
}
