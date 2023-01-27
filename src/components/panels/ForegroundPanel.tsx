import * as cx from 'classnames';
import * as React from 'react';

export function ForegroundPanel(props: IForegroundPanelProps) {
    return (
        <div>
            <h2 className='foreground-panel__title bold padding--large'>{props.title}</h2>
            <div
                className={cx(
                    'foreground-panel__body font-size--s',
                    {
                        'padding--large': !props.noPadding,
                    })}
                >
                {props.children}
            </div>
            <div className='container--horizontal container--inversed'>
                {props.buttons.map((b, i) => <div key={i}>{b}</div>)}
            </div>
        </div>
    );
}

interface IForegroundPanelProps extends React.WithChildren {
    title: string;
    buttons: JSX.Element[];
    noPadding?: boolean;
}
