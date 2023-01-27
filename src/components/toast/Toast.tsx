import * as React from 'react';
import { connect } from 'react-redux';

import { hideToast } from '../../actions/toasts/toastActions';
import { Toast, isLinkToast, isActionToast } from '../../models/toasts';
import { IToastItemProps, ToastItem, ToastLink } from './ToastItem';
import openLinkExternally from '../../utils/openLinkExternally';
import { IGlobalState } from '../../models/globalState';
import { createSelector } from 'reselect';

export class LinkOrClosableToastItem extends React.Component<IToastItemProps, object> {

    public render() {
        const toast = this.props.toast;
        return (
            <ToastItem toast={toast}>
                {this.renderLinkElement()}
            </ToastItem>
        );
    }

    private renderLinkElement() {
        const toast = this.props.toast;
        if (isLinkToast(toast)) {
            return (
                <ToastLink onClick={() => openLinkExternally(toast.linkUrl) }>
                    {toast.linkTitle}
                </ToastLink>
            );
        } else if (isActionToast(toast)) {
            return (
                <ToastLink onClick={toast.action}>
                    {toast.actionTitle}
                </ToastLink>
            );
        } else {
            return (
                <button onClick={() => this.props.onClose(this.props.toast)} className='toast__close padding--std'>
                    &times;
                </button>
            );
        }
    }
}

class ToastComponent extends React.Component<IToastProps, object> {
    public render() {
        return (
            <div>
                <ul className='toasts'>
                    {this.props.toasts.map((toast, i) =>
                        <LinkOrClosableToastItem key={i} toast={toast} onClose={this.props.hideToast} />,
                    )}
                </ul>
            </div>
        );
    }
}

interface IToastProps {
    toasts: Toast[];
    hideToast: typeof hideToast;
}

export default connect(
    createSelector((state: IGlobalState) => state.toasts, toasts => ({ toasts })),    
    { hideToast },
)(ToastComponent);
