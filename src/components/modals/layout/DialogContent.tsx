import * as cx from 'classnames';
import * as React from 'react';

interface IDialogContentProps extends React.WithChildren {
    padding?: DialogContentPadding;
    className?: string;    
}

export enum DialogContentPadding {
    HorizontalSmallest,
    None,
    TopSmall,
}

export function DialogContent(props: IDialogContentProps) {
    const { children = null, padding = DialogContentPadding.HorizontalSmallest } = props;

    const dialogClass = cx('modal-dialog__body', 'cover-all', props.className || '',
        {
            'padding-bottom--smallest': padding !== DialogContentPadding.None,
            'padding-top--small': padding === DialogContentPadding.TopSmall,
            'padding-top--smallest': padding === DialogContentPadding.HorizontalSmallest,
        },
    );

    return (
        <div className='relative flex-grow--1'>
            <div className={dialogClass}>
                {children}
            </div>
        </div>
    );
}

export function FlexDialogContent(props: IDialogContentProps) {
    return (
        <DialogContent {...props} className={cx('container--vertical container--justify-start', props.className)}/>
    );
}
