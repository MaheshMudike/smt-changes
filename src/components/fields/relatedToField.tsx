import { SvgIcon } from '../../constants/SvgIcon';
import { FieldValueType, ILinkedFieldValue } from '../../models/fields';
import INameAndId from '../../models/INameAndId';
import { formatLabel } from '../../utils/formatUtils';
import { salesForceLinkWrapper } from '../forms/SalesForceLink';
import { showAccountLinkWrapper, showWorkOrderLinkWrapper } from '../forms/ShowAccountDetailsModalButton';
import { IdentifiableWithTitle } from 'src/models/feed/ISObject';
import { showEquipmentLinkWrapper } from '../forms/ShowEquipmentDetailsModalButton';

const relateToByIdType = {
    '001': (what: { id: string, name: string}) => ({
        icon: SvgIcon.Account,
        linkWrapper: showAccountLinkWrapper(what)
    }),
    '02i': (what: { id: string, name: string}) => ({
        icon: SvgIcon.Equipment,
        linkWrapper: showEquipmentLinkWrapper(what.id)
    }),
    '0WO': (what: { id: string, name: string}) => ({
        icon: SvgIcon.Serviceorder,
        linkWrapper: showWorkOrderLinkWrapper(what)
    })
}

function idType(id: string) {
    return id && id.substring(0, 3);
}

export default function whatField(what: IdentifiableWithTitle, showLabel = true): ILinkedFieldValue {
    if (!what || !what.id) return null;

    const field = (relateToByIdType[idType(what.id)] && relateToByIdType[idType(what.id)](what)) || {};

    return {
        icon: SvgIcon.Related,
        label: showLabel ? formatLabel('generic.field.related-to') : null,
        linkWrapper: salesForceLinkWrapper(what),
        value: what.title,
        kind: FieldValueType.Linked,

        ...field 
    };
}
