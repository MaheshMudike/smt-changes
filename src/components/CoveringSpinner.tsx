import * as cx from 'classnames';
import * as React from 'react';

import { Spinner } from './Spinner';
import { ActionStatus } from '../actions/actions';

export function CoveringSpinner(props: { className?: string, isLight?: boolean, isSmall?: boolean, actionStatus?: ActionStatus }) {
    return props.actionStatus == null || props.actionStatus == ActionStatus.START ?
        <div className={cx('cover-all overlay container--centered', props.className)}>
            <Spinner isLight={props.isLight} isSmall={props.isSmall}/>
        </div> : null;
}