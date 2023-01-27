import * as React from 'react';
import { connect } from 'react-redux';
import { IDetailModal } from 'src/models/list/IListItem';
import { queryAndShowDetailsDialogGeneric } from 'src/actions/integration/detailsActions';
import { replaceModalIfIncomplete } from 'src/actions/modalActions';

export class DetailsModalButton extends React.Component<{ action: () => void }, object> {
    public render() {
        return (
            <button className='relative link-wrapper--full-width' onClick={this.props.action}>
                {this.props.children}
            </button>
        );
    }
}

class DetailsModalButtonListItemClass extends React.Component<{ item: IDetailModal<any>, downloadAndShowDetailModal: typeof downloadAndShowDetailModal }, object> {
    public render() {
        return (
            <button className='relative link-wrapper--full-width' onClick={() => this.props.downloadAndShowDetailModal(this.props.item) }>
                {this.props.children}
            </button>
        );
    }
}

function downloadAndShowDetailModal<T>(listitem: IDetailModal<T>) { 
    return queryAndShowDetailsDialogGeneric(
        listitem.title,
        () => listitem.queryDetails(),
        item => dispatch => dispatch(replaceModalIfIncomplete(listitem.modalType, item))
    );
}

export const DetailsModalButtonListItem = connect(null, { downloadAndShowDetailModal })(DetailsModalButtonListItemClass)