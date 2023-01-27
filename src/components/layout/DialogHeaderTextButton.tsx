import * as cx from 'classnames';
import * as React from 'react';

export const DialogHeaderTextButton = (props: IHeaderButtonProps) => {
    const disabled = props.disabled === true;
    return (
        <button type='button' disabled={disabled} onClick={props.onClick}
            className={ cx('dialog-header__btn-confirm', { 'dialog-header__btn--disabled': disabled })} >
            {props.label}
        </button>
    );
};

interface IHeaderButtonProps {
    label: string;
    disabled?: boolean;
    onClick: (ev: React.MouseEvent<any>) => void;
}
