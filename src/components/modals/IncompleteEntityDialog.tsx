import * as React from 'react';
import { connect } from 'react-redux';

import { ITitle } from '../../models/list/IListItem';
import { CoveringSpinner } from '../CoveringSpinner';
import { DialogContainer } from './layout/DialogContainer';
import { DialogContent } from './layout/DialogContent';
import { DialogHeader } from './layout/DialogHeader';
import { IFeedItem } from '../../models/feed/IFeedItem';
import { isIncompleteEntityModalShown } from '../../services/modals/isModalTypeShown';
import { replaceModal } from '../../actions/modalActions';
import { hideModalAndShowDetailsFailedToast } from '../../actions/integration/detailsActions';
import { GetGlobalState } from '../../models/globalState';
import { ThunkDispatch } from '../../actions/thunks';
import { IModalDefinition } from 'src/models/modals/state';

interface IncompleteDialogProps extends IModalDefinition<ITitle> {    
    mountAction: (iwt: ITitle) => void;
}

export class IncompleteDialog extends React.Component<IncompleteDialogProps, object> {
    public render() {
        return (
            <DialogContainer>
                <DialogHeader title={this.props.modalProps.title} />
                <DialogContent>
                    <CoveringSpinner />
                </DialogContent>
            </DialogContainer>
        );
    }

    public componentDidMount() {
        if(this.props.mountAction != null) this.props.mountAction(this.props.modalProps);
    }
}


const loadFeedItemDetails = (feedItem: IFeedItem) => {
    const entityType = feedItem.entityType;
    return (dispatch: ThunkDispatch, getState: GetGlobalState) => {
        return feedItem.queryDetails().then(item => {
            if (isIncompleteEntityModalShown(getState)) replaceModal(feedItem.modalType, item)(dispatch);
        }).catch(hideModalAndShowDetailsFailedToast(() => isIncompleteEntityModalShown(getState), dispatch))
    }
}

export const IncompleteEntityDialog = connect<IncompleteDialogProps>(
    null,
    {
        mountAction: loadFeedItemDetails
    },
)(IncompleteDialog);
