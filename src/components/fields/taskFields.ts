import { SvgIcon } from '../../constants/SvgIcon';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { formatDate, joinOptionals } from '../../utils/formatUtils';
import { formatLabel } from '../../utils/formatUtils';
import whatField from './relatedToField';
import Task from '../../models/feed/Task';
import { EntityFieldsData } from './EntityFieldsData';

const taskFields = (task: Task, entityFieldsData: EntityFieldsData): IFieldValue[] => {
    const { locale } = entityFieldsData;
    return [
        whatField(task.whatForEvent),
        {
            icon: SvgIcon.Contacts,
            label: formatLabel('generic.field.contact-name'),
            value: joinOptionals([task.contact.name, task.contact.phone]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Status,
            label: formatLabel('generic.field.priority', 'generic.field.status'),
            value: joinOptionals([task.priority, task.status]),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.due-date'),
            value: formatDate(task.dueDate, locale),
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Title,
            label: formatLabel('generic.field.subject'),
            value: task.subject,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.comments'),
            multiLine: true,
            value: task.description,
            kind: FieldValueType.Plain,
        },
    ];
};

export default taskFields;
