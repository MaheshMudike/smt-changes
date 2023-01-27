import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import { Icon } from './Icon';
import * as cx from 'classnames';

const IconButton = (props: IIconButtonProps) => {
    return (
        <button type='button' className={cx('button button--flat container--horizontal', props.className)} onClick={props.onClick}>
            { props.label && <span className='container__item--centered'>{props.label}</span> }
            <Icon className='margin-left--smaller' svg={props.icon} />
        </button>
    );
};

interface IIconButtonProps {
    icon: SvgIcon;
    label?: string;
    onClick: (me: React.MouseEvent<any>) => void;
    className?: string;
}

export default IconButton;
