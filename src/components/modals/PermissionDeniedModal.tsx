import * as React from 'react';
import { connect } from 'react-redux';

import { logout } from '../../actions/authenticationActions';
import { hideAllModals } from '../../actions/modalActions';
import translate from '../../utils/translate';

class PermissionDeniedModalClass extends React.Component<IPermissionDeniedModalProps, object> {
    constructor(props: any) {
        super(props);
        this.confirmDialog = this.confirmDialog.bind(this);
    }

    public render() {
        return (
            <div className='info-modal'>
                <p className='info-modal__title blue-header'>
                    {translate('modal.permission-denied.title')}
                </p>
                <p className='info-modal__body'>
                    {translate('modal.permission-denied.body')}
                </p>
                <div className='info-modal__button-bar separated--top-light'>
                    <span className='info-modal__button' onClick={this.confirmDialog}>
                        {translate('generic.button.ok')}
                    </span>
                </div>
            </div>
        );
    }

    private confirmDialog() {
        this.props.hideModal();
        this.props.logout();
    }
}

interface IPermissionDeniedModalProps {
    hideModal: typeof hideAllModals;
    logout: typeof logout;
}

export const PermissionDeniedModal = connect(
    null,
    { logout },
)(PermissionDeniedModalClass);
