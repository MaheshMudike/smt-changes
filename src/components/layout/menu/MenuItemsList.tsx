import * as cx from 'classnames';
import * as React from 'react';

interface IMenuItemsListProps {
    items: JSX.Element[];
    isBottom?: boolean;
}

export function MenuItemsList(props: IMenuItemsListProps) {
    return (
        <ul className={cx('menu-items', 'padding-top--smallest', {
                    'scrollable--vertical flex--1': !props.isBottom,
                    'separated--top-dark': props.isBottom,
                })}>
            {props.items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
    );
}
