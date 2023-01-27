import * as cx from 'classnames';
import * as React from 'react';

export default function CheckButton(props: ICheckButtonProps) {
    return (
        <button className={cx(props.className, 'check-button__container padding--decreased')}
            onClick={props.onClick}>
            <span
                className={cx(
                    'check-button', {
                        'check-button--checked': props.isChecked,
                    },
                )}>
            </span>
        </button>
    );
}

interface ICheckButtonProps {
    isChecked: boolean;
    className?: string;
    onClick: (ev: React.MouseEvent<any>) => void;
}
