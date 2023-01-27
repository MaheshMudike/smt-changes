import * as React from 'react';
import { connect } from 'react-redux';

import { showModal } from '../../actions/modalActions';
import { ModalType } from '../../constants/modalTypes';

class ModalButton extends React.Component<{ modalType: ModalType, modalProps: any, className?: string } & typeof ModalButtonDispatch> {

    public render() {
        return (
            <div className={(this.props.className || '')} onClick={() => this.props.showModal(this.props.modalType, this.props.modalProps)}>
                {this.props.children}
            </div>
        );
    }

}

const ModalButtonDispatch = { showModal };

export default connect(null, ModalButtonDispatch)(ModalButton);