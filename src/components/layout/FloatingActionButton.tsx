import * as cx from 'classnames';
import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import { Icon } from './Icon';

export interface IFAButtonProps {
    className?: string;
    isRotated?: boolean;
    isSmall?: boolean;
    onClick: (ev: React.MouseEvent<any>) => void;
}

export function FloatingActionButton(props: IFAButtonProps & { svg: SvgIcon; }) {
    return (
        <FloatingActionButtonContainer { ...props }>
            <Icon className='fab-button__icon' svg={props.svg} />
        </FloatingActionButtonContainer>
    );
}

export function FloatingActionButtonContainer(props: IFAButtonProps & React.WithChildren) {
    return (
        <button className={cx('fab-button', props.className, { 'fab-button--rotated': props.isRotated, 'fab-button--small': props.isSmall })}
            onClick={props.onClick}>
            { props.children }
        </button>
    );
}