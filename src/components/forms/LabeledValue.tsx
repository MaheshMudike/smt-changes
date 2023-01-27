import * as cx from 'classnames';
import * as React from 'react';

interface ILabeledValueProps extends React.WithChildren {
    label: JSX.Element | string;
    className?: string;
}

export default function LabeledValue(props: ILabeledValueProps) {
    return (
        <div className={cx('labeled-value container--vertical ', props.className)}>
            <div className='labeled-value__label'>
                {props.label}
            </div>
            <div className='labeled-value__value'>
                {props.children}
            </div>
        </div>
    );
}
