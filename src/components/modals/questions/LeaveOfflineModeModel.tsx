import * as React from 'react';
import { connect } from 'react-redux';

import { hideAllModals, replaceModal } from '../../../actions/modalActions';
import { ModalType } from '../../../constants/modalTypes';
import translate from '../../../utils/translate';
import { FlatButton } from '../../panels/FlatButton';
import { ForegroundPanel } from '../../panels/ForegroundPanel';

interface ILeaveOfflineModeModalProps {
    hideModal: typeof hideAllModals;
    replaceModal: typeof replaceModal;
}

class LeaveOfflineModeModalClass extends React.Component<ILeaveOfflineModeModalProps, object> {
    public render() {
        return (
            <ForegroundPanel title={translate('modal.question.leave-offline.title')} buttons={[
                <FlatButton onClick={() => this.props.hideModal()} caption={translate('generic.button.cancel')} />,
                <FlatButton onClick={() => this.props.replaceModal(ModalType.SynchronisationSummary)} caption={translate('generic.button.continue')} />,
            ]}>
                {translate('modal.question.leave-offline.content')}
            </ForegroundPanel>
        );
    }
}

export const LeaveOfflineModeModal = connect(
    null,
    {
        hideAllModals,
        replaceModal,
    },
)(LeaveOfflineModeModalClass);
