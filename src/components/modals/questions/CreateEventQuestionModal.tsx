import * as React from 'react';
import { connect } from 'react-redux';

import { showWriteEventAndCloseTaskModal } from '../../../actions/integration/feedActions';
import { closeTask } from '../../../actions/integration/tasks/taskActions';
import { hideAllModals } from '../../../actions/modalActions';
import { IFeedItem } from '../../../models/feed/IFeedItem';
import translate from '../../../utils/translate';
import { FlatButton } from '../../panels/FlatButton';
import { ForegroundPanel } from '../../panels/ForegroundPanel';

class CreateEventQuestionModalClass extends React.Component<ICreateEventQuestionModalDispatchProps & { modalProps: IFeedItem }, {}> {
    public render() {
        return (
            <ForegroundPanel title={translate('modal.question.create-event-title')}
                buttons={[
                    <FlatButton onClick={this.closeTask} caption={translate('generic.button.just-close-task')} />,
                    <FlatButton onClick={this.showEventModal} caption={translate('generic.button.create-event')} />,
                ]}>
                {translate('modal.question.create-event-body')}
            </ForegroundPanel>
        );
    }

    private showEventModal = () => {
        this.props.hideAllModals();
        this.props.showWriteEventAndCloseTaskModal(this.props.modalProps);
    }

    private closeTask = () => {
        this.props.closeTask(this.props.modalProps.id);
        this.props.hideAllModals();
    }

}

interface ICreateEventQuestionModalDispatchProps {
    closeTask: typeof closeTask;
    hideAllModals: typeof hideAllModals;    
    showWriteEventAndCloseTaskModal: typeof showWriteEventAndCloseTaskModal;
}

export const CreateEventQuestionModal = connect(
    null,
    {
        closeTask,
        hideAllModals,
        showWriteEventAndCloseTaskModal,
    },
)(CreateEventQuestionModalClass);
