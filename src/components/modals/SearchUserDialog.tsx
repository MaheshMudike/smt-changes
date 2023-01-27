import * as React from 'react';
import { connect } from 'react-redux';

import { setSearchUsersPhrase, setSelectedUser } from '../../actions/integration/tasks/writeTaskFormActions';
import { IGlobalState } from '../../models/globalState';
import { SearchUsersState } from '../../models/tasks/writeTaskState';
import translate from '../../utils/translate';
import { CoveringSpinner } from '../CoveringSpinner';
import { EmptyView } from '../EmptyView';
import { ListItem } from '../list/ListItem';
import { SearchDialogClass, ISearchDialogStateProps, ISearchDialogDispatchProps } from './SearchDialog';
import { IModalDefinition } from 'src/models/modals/state';
import { goToPrevModal, hideAllModals } from 'src/actions/modalActions';
import { entityFieldsDataFromState } from '../fields/EntityFieldsData';

const SearchUserDialogContainer = connect<ISearchDialogStateProps, ISearchDialogDispatchProps, {}>(
    (state: IGlobalState) => ({
        searchPhrase: state.writeTask.searchUsers.searchPhrase,
        title: translate('search-user-modal.title'),
        inputPlaceholder: translate('search-user-modal.input-placeholder')
    }),
    {
        setSearchPhrase: setSearchUsersPhrase
    },
)(SearchDialogClass);

class SearchUserDialogClass extends React.Component<IModalDefinition<any> & ReturnType<typeof SearchUserDialogStateProps> & typeof SearchUserDialogDispatchProps, object> {
    public render() {
        return <SearchUserDialogContainer hideModal={ this.props.hideAllModals } goToPrevModal={ this.props.goToPrevModal }>
            {this.renderUsers()}
        </SearchUserDialogContainer>;
    }

    public componentDidMount() {
        this.props.setSelectedUser(null);
    }

    private renderUsers() {
        if(this.props.users.isProcessing) return <CoveringSpinner />;

        if (this.props.searchPhrase && !this.props.users.isProcessing && this.props.users.items.length === 0) {
            return <EmptyView />;
        }
        return this.props.users.items.map(user =>
            <ListItem key={user.value} item={ { id: user.value, title: user.label, body: () => null, isHighPriority: false } }
                entityFieldsData={ this.props.entityFieldsData }
                onClick={() => {
                    this.props.setSelectedUser(user);
                    this.props.goToPrevModal();
                }
            } />
        );
    }
}

const SearchUserDialogDispatchProps = {
    setSearchUsersPhrase,
    setSelectedUser,
    hideAllModals,
    goToPrevModal
}

const SearchUserDialogStateProps = (state: IGlobalState) => ({
    ...state.writeTask.searchUsers,
    entityFieldsData: entityFieldsDataFromState(state)
})

export const SearchUserDialog = connect(SearchUserDialogStateProps, SearchUserDialogDispatchProps)(SearchUserDialogClass);