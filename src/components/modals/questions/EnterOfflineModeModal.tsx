import * as React from 'react';
import { connect } from 'react-redux';
import { replace } from 'react-router-redux';

import { goToPrevModal, hideAllModals } from '../../../actions/modalActions';
import { paths } from '../../../config/paths';
import translate from '../../../utils/translate';
import { FlatButton } from '../../panels/FlatButton';
import { ForegroundPanel } from '../../panels/ForegroundPanel';
import { IGlobalState } from 'src/models/globalState';
import { IAuthenticationState } from 'src/reducers/AuthenticationReducer';
import { tryLeavingOfflineMode } from 'src/actions/offlineChangesActions';

interface IEnterOfflineModeModalProps {
    goToPrevModal: typeof goToPrevModal;
    hideAllModals: typeof hideAllModals;
    replace: typeof replace;
    authentication : IAuthenticationState;
    tryLeavingOfflineMode : typeof tryLeavingOfflineMode;

}

class EnterOfflineModeModalClass extends React.Component<IEnterOfflineModeModalProps, object> {
    public render() {
        return (
            <ForegroundPanel
                title={translate('modal.question.enter-offline.title')}
                buttons={this.getButtons()}
            >
                {translate('modal.question.enter-offline.content')}
            </ForegroundPanel>
        );
    }

    private getButtons() {
        return [
            <FlatButton onClick={() => this.props.goToPrevModal()} caption={translate('modal.question.enter-offline.ignore')} />,
            this.props.authentication && this.props.authentication.currentUser && this.props.authentication.currentUser.id ?
            <FlatButton onClick={this.switchToOffline} caption={translate('modal.question.enter-offline.switch')} /> :
            <FlatButton onClick={this.props.tryLeavingOfflineMode} caption={'Retry'} />
        ];
    }

    private switchToOffline = () => {
        this.props.hideAllModals();
        this.props.replace(paths.PLAN_OFFLINE);
    };
}

const mapStatetoProps = (state: IGlobalState) => ({
    authentication : state.authentication
})

export const EnterOfflineModeModal = connect(
    mapStatetoProps,
    {
        hideAllModals,
        goToPrevModal,
        replace,
        tryLeavingOfflineMode
    },
)(EnterOfflineModeModalClass);
