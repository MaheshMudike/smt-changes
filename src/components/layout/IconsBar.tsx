import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import { Icon } from '../layout/Icon';
import * as cx from 'classnames';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export function IconsBarGeneric<T>(props: { items: T[], itemContent: (t: T) => JSX.Element, itemKey: (t: T, index: number) => string }) {
    return (
            <ul className='container--horizontal container--inversed'>
            { props.items && props.items.map((item, i) => 
                <li className='margin-left--std margin-right--std' key={ props.itemKey(item, i) }>
                    { props.itemContent(item) }
                </li>
            ) }
            </ul>
    );
}

export function IconsBar(props: IIconsBarProps) {
    return (
            <ul className='container--horizontal container--inversed'>
            { props.buttons && props.buttons.map((item, i) =>
                item && <li className='margin-left--std margin-right--std' key={item.icon || item.faIcon.iconName }>
                    <button type='button' className={cx('icon-button', item.className, { 'icon-button--disabled': item.disabled })}
                        onClick={item.onClick} disabled={item.disabled}>
                        { item.icon && <Icon svg={item.icon} /> }
                        { item.faIcon && <FontAwesomeIcon icon={item.faIcon}/> }
                    </button>
                </li>
            ) }
            { props.elements && props.elements.map((item, i) =>
                <li className='margin-left--std margin-right--std'>
                    {item}
                </li>
            ) }
            </ul>
    );
}

export interface IIconButton {
    icon?: SvgIcon;
    faIcon?: IconDefinition;
    className?: string;
    onClick: (ev: React.MouseEvent<any>) => void;
    disabled?: boolean;
}

interface IIconsBarProps {
    buttons: IIconButton[];
    elements?: JSX.Element[];
}
