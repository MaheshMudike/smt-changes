import * as React from 'react';
import { connect } from 'react-redux';

import { ListItem } from '../list/ListItem';
import { IDialogListItem } from './../../models/list/IListItem';
import translate from './../../utils/translate';
import { DialogContainer } from './layout/DialogContainer';
import { DialogContent } from './layout/DialogContent';
import { DialogHeader } from './layout/DialogHeader';
import { showModal } from 'src/actions/modalActions';
import { IModalDefinition } from 'src/models/modals/state';
import { IGlobalState } from 'src/models/globalState';
import { entityFieldsDataFromState } from '../fields/EntityFieldsData';

class ListOfEntitiesDialogClass extends React.Component<typeof ListOfEntitiesDialogDispatch & ReturnType<typeof ListOfEntitiesDialogStateProps> &
    IModalDefinition<{ listItems: IDialogListItem[] }>, object> {
    public render() {
        return (
            <DialogContainer>
                <DialogHeader title={translate('modal.list-entities.title')} />
                <DialogContent>
                    {this.props.modalProps.listItems.map(item =>
                        <ListItem item={item} key={item.id} onClick={() => this.props.showModal(item.modalType, item)} entityFieldsData={this.props.entityFieldsData}/>
                    )}
                </DialogContent>
            </DialogContainer>
        );
    }
}

const ListOfEntitiesDialogDispatch = {
    showModal
}

const ListOfEntitiesDialogStateProps = (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) })

export const ListOfEntitiesDialog = connect(ListOfEntitiesDialogStateProps, ListOfEntitiesDialogDispatch)(ListOfEntitiesDialogClass);
