import * as _ from 'lodash';
import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import Callout from '../../models/feed/Callout';
import { formatDate, formatLabel } from '../../utils/formatUtils';
import CalloutButton from '../forms/CalloutButton';
import { Icon } from '../layout/Icon';
import { ListItem} from './ListItem';
import { EntityFieldsData } from '../fields/EntityFieldsData';

function DateField(props: { date: string; label: string; locale: string }) {
    return (
        <div className='list-item__side-note padding-left--std no-wrap'>
            {formatLabel(props.label)} {formatDate(props.date, props.locale)}
        </div>
    );
}

interface IClickableServiceOrderListItemProps {
    item: Callout;
    showDate?: 'createDate' | 'startOrCreateDate';
    entityFieldsData: EntityFieldsData;
}

export function ClickableServiceOrderListItem(props: IClickableServiceOrderListItemProps) {
    const { item, entityFieldsData } = props;
    return (
        <CalloutButton callout={item}>
            <ListItem item={item} onClick={_.noop} className='padding-right--std' entityFieldsData={entityFieldsData}>
                {renderDate(props)}
                <Icon svg={SvgIcon.ChevronRight} className="icon-oriented"/>
            </ListItem>
        </CalloutButton>
    );
}

function renderDate(props: IClickableServiceOrderListItemProps) {
    const { item, showDate, entityFieldsData } = props;
    const locale = entityFieldsData.locale;
    const createdDateLabel = 'generic.field.created';
    switch (showDate) {
        case 'createDate':
            return <DateField date={item.createdDate} label={createdDateLabel} locale={locale}/>;
        case 'startOrCreateDate':
            if(item.startDate != null) return <DateField date={item.startDate} label="generic.field.start-date" locale={locale}/>
            else if(item.createdDate != null) return <DateField date={item.createdDate} label={createdDateLabel} locale={locale}/>
            return null;
        default:
            return null;
    }
}
