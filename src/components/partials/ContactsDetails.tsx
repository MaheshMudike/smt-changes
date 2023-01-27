import * as React from 'react';
import * as Dropdown from 'react-bootstrap/lib/Dropdown'
import * as MenuItem from 'react-bootstrap/lib/MenuItem'
import { connect } from 'react-redux';

import { showModal } from '../../actions/modalActions';
import { ModalType } from '../../constants/modalTypes';
import { SvgIcon } from '../../constants/SvgIcon';
import Contact from '../../models/accounts/Contact';
import { openObjectInSalesforce } from '../../services/externalApps';
import { joinOptionals } from '../../utils/formatUtils';
import translate from '../../utils/translate';
import { Icon } from '../layout/Icon';
import { ListItemBody, listItemCssClasses } from '../list/ListItem';
import * as cx from 'classnames';
import { IGlobalState } from 'src/models/globalState';
import { TextDirection } from 'src/models/authentication';

interface IContactDetailsProps {
    contacts: Contact[];
    online: boolean;
    direction: TextDirection;
}

class ContactDetailsClass extends React.Component<IContactDetailsProps & typeof ContactDetailsDispatchProps, object> {

    public render() {
        return (
                <ul>
                    {this.props.contacts.map((contact, index) => (
                    <li key={contact.id}>
                        {
                        <div className={cx(listItemCssClasses)}>
                            <ListItemBody onClick={() => this.props.showModal(this.props.online ? ModalType.ShowContactModal : ModalType.ShowContactOfflineModal, contact)}
                                title={joinOptionals([contact.fullName, contact.titleAddress, (contact as any).role])}
                                body={joinOptionals([contact.phone, contact.email, contact.mobilePhone])} />
                            <Dropdown id={'contact-actions-dropdown' + contact.id} 
                                pullRight={this.props.direction === TextDirection.ltr} 
                                dropup>
                                <Dropdown.Toggle noCaret>
                                    <Icon svg={SvgIcon.Edit} />
                                </Dropdown.Toggle>
                                <Dropdown.Menu className='super-colors'>
                                    <MenuItem onClick={ev => {
                                        ev.preventDefault();
                                        this.props.showModal(this.props.online ? ModalType.EditContactModal : ModalType.EditContactOfflineModal, contact)
                                    }}>
                                        {translate('generic.button.edit-in-smt')}
                                    </MenuItem>
                                    {this.props.online &&
                                        <MenuItem onClick={() => openObjectInSalesforce(contact.id)}>
                                            {translate('generic.button.edit-in-salesforce')}
                                        </MenuItem>
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                        }
                    </li>
                    ))}
                </ul>
        );
    }

}

const ContactDetailsDispatchProps = {
    showModal,
}

export const ContactsDetails = connect((state: IGlobalState) => ({ direction: state.authentication.direction }), ContactDetailsDispatchProps)(ContactDetailsClass);
