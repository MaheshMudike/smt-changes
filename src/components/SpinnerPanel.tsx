import * as React from 'react';
import { CoveringSpinner } from './CoveringSpinner';
import { ActionStatus } from '../actions/actions';

export function SpinnerPanel<T>(props: React.WithChildren & { status: ActionStatus }) {
    const { status } = props;
    return (
        <div style={ {position: "relative"} }>
            { status == ActionStatus.START ? <CoveringSpinner isSmall  /> : null}
            { props.children }
        </div>
    );
}