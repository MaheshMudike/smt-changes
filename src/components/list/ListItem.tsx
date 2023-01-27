import * as cx from 'classnames';
import * as React from 'react';

import { ITitleBody, IdentifiableTitleBodyHighPriority } from '../../models/list/IListItem';
import { EntityFieldsData } from '../fields/EntityFieldsData';

export function ListItemBody(
    props: { title: string, body: string, bodySecondLine?: string, onClick?: () => void }
) {
    return (
        <div className='flex-grow--1 container--truncate' onClick={props.onClick} >
            <div className='list-item__title text-ellipsis'>
                {props.title}
            </div>
            <div className='list-item__details text-ellipsis'>
                {props.body}
            </div>
            {props.bodySecondLine && 
                <div className='list-item__details text-ellipsis'>
                    {props.bodySecondLine}
                </div>
            }
        </div>
    );
}
/*
export function ListItemBodyString(props: ITitleBody) {    
    return <div  className="flex-grow--1 container--truncate" dangerouslySetInnerHTML={ { __html: 
            `<div class='list-item__title text-ellipsis'>${props.title}</div>
                <div class='list-item__details text-ellipsis'>
                    ${props.body}
                </div>`} } 
            />;
}
*/

export interface IListItemBaseProps<T> {
    item: T;
    isSelected?: boolean;
    onClick?: () => void;
    onBodyClick?: () => void;
}

interface IListItemProps<T> extends IListItemBaseProps<T>, React.WithChildren {
    className?: string;
}

export const listItemCssClasses = ['container--horizontal', 'list-item__content', 'list-item'];

export function ListItem<T extends IdentifiableTitleBodyHighPriority>(props: IListItemProps<T> & { entityFieldsData: EntityFieldsData } & { style?: React.CSSProperties }) {
    const { item, entityFieldsData } = props;
    if (item == null) return <span/>;

    const listItemClass = cx(
        ...listItemCssClasses, props.className,
        {
            'list-item--selected': props.isSelected,
            'list-item__content--high-priority': item.isHighPriority,
        },
    );

    return (
        <div key={item.id} className={listItemClass} onClick={props.onClick} style={props.style}>
            <ListItemBody 
                title={item.title} body={item.body(entityFieldsData)} bodySecondLine={item.bodySecondLine} onClick={props.onBodyClick}
            />
            { item.buttons }
            { props.children }
        </div>
    );
}
