import { SvgIcon } from '../../constants/SvgIcon';
import Query from '../../models/feed/Query';
import { FieldValueType, IFieldValue } from '../../models/fields';
import { joinOptionals } from '../../utils/formatUtils';
import { formatLabel } from '../../utils/formatUtils';
import TransactionalSurveyCase from 'src/models/feed/TransactionalSurveyCase';

const fields = (surveyCase: TransactionalSurveyCase): IFieldValue[] => {
    return [
        {
            icon: SvgIcon.Info,
            label: formatLabel('generic.field.npi-score'),
            value: surveyCase.npiScore,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Title,
            label: formatLabel('generic.field.survey-name'),
            value: surveyCase.surveyName,
            kind: FieldValueType.Plain,
        },        
        {
            icon: SvgIcon.Title,
            label: formatLabel('generic.field.subject'),
            value: surveyCase.subject,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.description'),
            value: surveyCase.description,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Contacts,
            label: formatLabel('generic.field.contact-name'),
            value: surveyCase.contactName,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Phone,
            label: formatLabel('generic.field.contact-phone'),
            value: surveyCase.contactPhone,
            kind: FieldValueType.Plain,
        },        
        {
            icon: SvgIcon.Info,
            label: formatLabel('generic.field.response-received'),
            //TODO
            value: '?????',
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Date,
            label: formatLabel('generic.field.due-date'),
            value: surveyCase.dueDate,
            kind: FieldValueType.Plain,
        },
        {
            icon: SvgIcon.Description,
            label: formatLabel('generic.field.comment'),
            value: surveyCase.comment,
            kind: FieldValueType.Plain,
        },
    ];
};

export default fields;
