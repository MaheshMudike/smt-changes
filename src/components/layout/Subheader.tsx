import * as cx from 'classnames';
import * as React from 'react';

export default function Subheader(props: { noTopSeparator?: boolean } & React.WithChildren) {
    return (
        <div className={cx( 'subheader separated--bottom-light container--horizontal', { 'separated--top-light': !props.noTopSeparator } )}>
            {props.children}
        </div>
    );
}
