import * as cx from 'classnames';
import * as React from 'react';

export function DialogContainer(props: IDialogContainerProps) {
    return (
        <div className={cx('modal-dialog__container container--vertical', props.className)}>
            {props.children}
        </div>
    );
}

interface IDialogContainerProps extends React.WithChildren {
    className?: string;
}
