import * as cx from 'classnames';
import * as React from 'react';

export function FlatButton(props: {
    caption: string;
    disabled?: boolean;
    onClick: (me: React.MouseEvent<any>) => void
}) {
    return (
        <div className='padding--large'>
            <button className={cx( 'button button--flat button--no-padding', { 'button--disabled': props.disabled } )}
                onClick={props.onClick} disabled={ props.disabled } >
                {props.caption}
            </button>
        </div>
    );
}
