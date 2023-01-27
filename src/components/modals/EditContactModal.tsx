import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { updateOfflineContact } from '../../actions/cache/accountActions';
import { updateSalesforceContact } from '../../actions/integration/salesforceActions';
import { SvgIcon } from '../../constants/SvgIcon';
import Contact from '../../models/accounts/Contact';
import { formatLabel } from '../../utils/formatUtils';
import translate from '../../utils/translate';
import { CoveringSpinner } from '../CoveringSpinner';
import WithIcon, { WithIconFA } from '../forms/WithIcon';
import { DialogHeaderTextButton } from '../layout/DialogHeaderTextButton';
import { DialogContainer } from './layout/DialogContainer';
import { DialogContent, DialogContentPadding } from './layout/DialogContent';
import { DialogHeader } from './layout/DialogHeader';
import { goToPrevModal } from 'src/actions/modalActions';
import { IModalDefinition } from 'src/models/modals/state';
import { faFax } from '@fortawesome/free-solid-svg-icons';
import { synchronizeCurrentPage } from 'src/actions/integration/synchronization';

interface IEditContactModalState {
    contact: Contact;
    isSaving: boolean;
}

interface IEditContactDispatchProps extends IModalDefinition<Contact>{
    updateContact: typeof updateSalesforceContact;
    goToPrevModal: typeof goToPrevModal;
    synchronizeCurrentPage: typeof synchronizeCurrentPage;
}

class EditContactModalClass extends React.Component<IEditContactDispatchProps, IEditContactModalState> {
    constructor(props: IEditContactDispatchProps) {
        super(props);
        this.state = {
            contact: props.modalProps.clone(),
            isSaving: false,
        };
    }

    public render() {
        const contact = this.state.contact;
        return (
            <DialogContainer>
                <DialogHeader
                    title={`${ this.props.modalProps.title } - ${ translate('modal.edit-contact.edit-info') }`}
                    headerActionButtons={[
                        <DialogHeaderTextButton onClick={this.updateContact} disabled={this.state.isSaving}
                            label={translate('generic.button.save')}/>,
                    ]}
                />
                <DialogContent padding={DialogContentPadding.None}>
                    <form name='form-contact' className='relative'>
                        {this.state.isSaving ? (<CoveringSpinner />) : null}                        
                        <WithIcon icon={SvgIcon.Contacts} key={1} className='separated--bottom-dark'>
                            <input value={contact.firstName}
                                //onChange={this.setValue2(contact.setFirstName)}
                                onChange={this.setValue((value) => this.state.contact.setFirstName(value))}
                                type={'text'} placeholder={formatLabel('generic.placeholder.firstname')}                                
                            />
                        </WithIcon>
                        <WithIcon icon={SvgIcon.Contacts} key={2} className='separated--bottom-dark'>
                            <input value={contact.lastName}
                                onChange={this.setValue((value) => contact.setLastName(value))}
                                type={'text'} placeholder={formatLabel('generic.placeholder.lastname')}           
                                required={true}
                            />
                        </WithIcon>
                        <WithIcon icon={SvgIcon.Phone} key={3} className='separated--bottom-dark'>
                            <input value={contact.phone}
                                onChange={this.setValue((value) => contact.setPhone(value))}
                                type={'text'} placeholder={formatLabel('generic.placeholder.phone-number')}           
                                required={true}
                            />
                        </WithIcon>
                        <WithIcon icon={SvgIcon.Smartphone} key={4} className='separated--bottom-dark'>
                            <input value={contact.mobilePhone}
                                onChange={this.setValue((value) => contact.setMobilePhone(value))}
                                type={'text'} placeholder={formatLabel('generic.placeholder.mobile-number')}
                            />
                        </WithIcon>
                        <WithIcon icon={SvgIcon.Email} key={5} className='separated--bottom-dark'>
                            <input value={contact.email}
                                onChange={this.setValue((value) => contact.setEmail(value))}
                                type={'email'} placeholder={formatLabel('generic.placeholder.email-address')}
                                pattern={'[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$'}
                            />
                        </WithIcon>
                        <WithIconFA icon={faFax} key={6} className='separated--bottom-dark'>
                            <input value={contact.fax}
                                onChange={this.setValue((value) => contact.setFax(value))}
                                type={'text'} placeholder={formatLabel('generic.placeholder.fax')}
                            />
                        </WithIconFA>
                    </form>
                </DialogContent>
            </DialogContainer>
        );
    }

    private setValue(setter: (s: string) => void) {
        //const contact = { ...this.state.contact };
        return (event: React.FormEvent<any>) => {            
            setter(_.get(event.target, 'value') as string)
            this.updateState({ contact: this.state.contact });
        }
    }

    private updateContact = () => {
        const myForm = document.forms.namedItem('form-contact');
        if (false === myForm.reportValidity() || this.state.isSaving) {
            return;
        }

        this.updateState({ isSaving: true });
        this.props.updateContact(
            this.state.contact,
            error => {
                if (error == null) {
                    //TODO handle this if there is some error
                    //this.reloadSalesForceContacts();
                    this.props.goToPrevModal(this.state.contact);
                    this.props.synchronizeCurrentPage();
                } else {
                    this.updateState({ isSaving: false });
                }
            },
        );
    }

    private updateState(state: Partial<IEditContactModalState>) {
        this.setState({ ...this.state, ...state });
        //this.setState(_.assign({}, this.state, state) as IEditContactModalState);
    }

}

export const EditContactModal = connect(
    null,
    {
        updateContact: updateSalesforceContact,
        synchronizeCurrentPage,
        goToPrevModal
    },
)(EditContactModalClass);

export const EditContactOfflineModal = connect(
    null,
    {
        updateContact: updateOfflineContact,
        goToPrevModal
    },
)(EditContactModalClass);
