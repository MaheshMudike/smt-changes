import * as React from 'react';
import { connect } from 'react-redux';

import { markEventCompletedAndShowToast } from '../../../actions/integration/events/eventActions';
import { markEventCompletedOffline } from '../../../actions/offlineChangesActions';
import { SvgIcon } from '../../../constants/SvgIcon';
import Event from '../../../models/events/Event';
import translate from '../../../utils/translate';
import WithIcon from '../../forms/WithIcon';
import { DialogHeaderTextButton } from '../../layout/DialogHeaderTextButton';
import { DialogContainer } from '../layout/DialogContainer';
import { FlexDialogContent } from '../layout/DialogContent';
import { DialogHeader } from '../layout/DialogHeader';
import { hideAllModals } from 'src/actions/modalActions';
import { IModalDefinition } from 'src/models/modals/state';

interface ICompleteTaskModalProps extends IModalDefinition<Event> {
    markEventCompleted: typeof markEventCompletedAndShowToast;
    hideAllModals: typeof hideAllModals;
}

class CompleteEventModalClass extends React.Component<ICompleteTaskModalProps, { description: string; }> {

    constructor(props: ICompleteTaskModalProps) {
        super(props);
        this.state = { description: '' };
    }

    public render() {
        return (
            <DialogContainer>
                <DialogHeader
                    title={translate('complete-task-modal.title')}
                    headerActionButtons={[
                        <DialogHeaderTextButton onClick={this.markEventCompleted} label={translate('complete-task-modal.mark-as-completed')} />,
                    ]}
                />
                <FlexDialogContent>
                    <WithIcon icon={SvgIcon.Description} multiline className='flex-grow--1'>
                        <textarea
                            value={this.state.description}
                            onChange={(event: any) => this.setState({ description: event.target.value })}
                            className='full-height'
                            placeholder={translate('generic.placeholder.description')}
                        />
                    </WithIcon>
                </FlexDialogContent>
            </DialogContainer>
        );
    }

    private markEventCompleted = () => {
        this.props.markEventCompleted({
            description: this.state.description,
            event: this.props.modalProps,
        });
        this.props.hideAllModals();
    };

}

export const CompleteEventModal = connect(
    null,
    {
        markEventCompleted: markEventCompletedAndShowToast,
        hideAllModals
    },
)(CompleteEventModalClass);

export const CompleteEventOfflineModal = connect<ICompleteTaskModalProps>(
    null,
    {
        markEventCompleted: markEventCompletedOffline,
        hideAllModals
    },
)(CompleteEventModalClass);
