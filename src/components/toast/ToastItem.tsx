import * as React from 'react';

import { ISimpleToast, Toast } from '../../models/toasts';

//changed the children defs

export function ToastItem(props: { toast: ISimpleToast, children: JSX.Element }) {//props: { toast: ISimpleToast } & React.WithChildren) {
    return (
        <li className='toast fade-in container--horizontal container--oposite'>
            <span className='toast__message padding--std'>
                {props.toast.message}
            </span>
            {props.children}
        </li>
    );
}

export function ToastLink(props: { onClick: () => void, children: string }) {//props: { onClick: f.Action } & React.WithChildren) {
    return (
        <button onClick={props.onClick} className='toast__more padding--std'>
            {props.children}
        </button>
    );
}

export interface IToastItemProps {
    toast: Toast;
    onClose?: (t: Toast) => void;
}
