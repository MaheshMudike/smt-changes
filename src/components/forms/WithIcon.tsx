import * as cx from 'classnames';
import * as React from 'react';

import { SvgIcon } from '../../constants/SvgIcon';
import { Icon } from '../layout/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface IWithIconProps<TIcon> extends React.WithChildren {
    className?: string;
    icon: TIcon;
    multiline?: boolean;
}

function IconContainer(props: { className?: string; multiline?: boolean; icon: React.ReactNode } & React.WithChildren) {
    return (
        <div className={cx('container--horizontal', props.className, { 'container--align-start': props.multiline })}>
            <div className={cx('container--centered icon-container')}>
                { props.icon }
            </div>
            <div className={cx('flex-grow--1', { 'container__item--stretch': props.multiline })}>
                {props.children}
            </div>
        </div>
    );
}

export function WithIconFA(props: IWithIconProps<IconProp>) {
    return (
        <IconContainer className={ props.className } multiline={ props.multiline } icon={ 
            <div className='icon-dimensions-font-awesome'><FontAwesomeIcon icon={props.icon} /></div> 
        }>
            {props.children}
        </IconContainer>
    );
}

export default function WithIcon(props: IWithIconProps<SvgIcon>) {
    return (
        <IconContainer className={ props.className } multiline={ props.multiline } icon={ 
            <Icon svg={props.icon} /> 
        }>
            {props.children}
        </IconContainer>
    );
}
