import * as cx from 'classnames';
import * as React from 'react';

import { SvgIcon } from '../constants/SvgIcon';
import translate from '../utils/translate';
import { Icon } from './layout/Icon';

export const EmptyView = (props: IEmptyViewProps & React.WithChildren) => {
    const {
        title = translate('layout.empty-view.title'),
        description = translate('layout.empty-view.description'),
    } = props;
    return (
        <div className={cx(
            'container--vertical container--centered full-height flex-grow--1',
            { 'empty-view--grey': props.isGrey },
        )}>
            {props.svg ? (
                <Icon
                    svg={props.svg}
                    alt='Empty view icon'
                    className='empty-view__icon'
                />
            ) : null}
            { props.children }
            <div className='empty-view__title'>{title}</div>
            <div className='empty-view__description'>{description}</div>
        </div>
    );
};

export const ErrorView = (props: IEmptyViewProps) => {
    const {
        title = translate('layout.error-view.title'),
        description = translate('layout.error-view.description'),
    } = props;
    return (
        <EmptyView title={title} description={description} {...props} />
    );
};

interface IEmptyViewProps {
    svg?: SvgIcon;
    title?: string;
    description?: string;
    isGrey?: boolean;
}
