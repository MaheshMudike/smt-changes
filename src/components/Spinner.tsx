import * as cx from 'classnames';
import * as React from 'react';

interface ISpinnerProps {
    isLight?: boolean;
    isSmall?: boolean;
}

export function Spinner(props: ISpinnerProps) {
    const spinnerClass = cx(
        'spinner', {
            'spinner--light': props.isLight,
            'spinner--small': props.isSmall,
        },
    );

    return (
        //<div className={spinnerClass} />
        <div className={spinnerClass}>
            <div className="before"/><div className="after"/>
        </div>
    );
}
