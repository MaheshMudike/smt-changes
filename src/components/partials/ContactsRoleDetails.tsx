import * as React from 'react';

import { ContactWithRole } from '../../models/accounts/Contact';
import StatusContainer from '../StatusContainer';
import { ContactsDetails } from './ContactsDetails';
import { ISelectableItemsState } from '../../models/IItemsState';
import { clone, groupBy } from 'lodash';
import Subheader from '../layout/Subheader';
import { sortBy } from 'lodash';

export class ContactsRoleDetails extends React.Component<ISelectableItemsState<ContactWithRole>, object> {

    public render() {        
        const contacts = groupBy(this.props.items, 'role');
        return <StatusContainer {...this.props}>
        
                { sortBy(Object.keys(contacts)).map(key => 
                    <div>
                    <Subheader>{key}</Subheader>
                    <ContactsDetails contacts={contacts[key]} online={true} />
                    </div>
                ) }
            </StatusContainer>;
    }    

}