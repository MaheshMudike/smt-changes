import * as cx from 'classnames';
import * as React from 'react';

import { SvgIcon } from '../../../constants/SvgIcon';
import { Icon } from '../Icon';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IBaseProps {
    className?: string;
    label: string;
    onClick: () => void;

    icon?: SvgIcon;
    faIcon?: IconDefinition;
    iconClassName?: string;
    frontText?: string;
}

export const MenuButton =
    <T extends IBaseProps & React.WithChildren>(props: T) => (
        <button
            className={cx('menu-item menu-item__button container--horizontal', props.className)}
            type='button'
            onClick={() => props.onClick()}
            >
            { props.icon == null ? null : <Icon className={cx('menu-item__icon', props.iconClassName)} svg={props.icon} /> }
            { props.faIcon == null ? null : <FontAwesomeIcon className={cx('menu-item__icon', props.iconClassName)} icon={props.faIcon} /> }
            { props.frontText == null ? null : 
                <div className='menu-item__icon text--left-menu-selected bold'>
                    {props.frontText}
                </div>
            }
            <span className='menu-item__label menu-item__label--light text-ellipsis'>
                {props.label}
            </span>
        </button>
    );
