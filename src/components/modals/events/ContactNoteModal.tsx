import * as React from 'react';
import { connect } from 'react-redux';

import { createSalesforceNoteAndShowToast } from '../../../actions/integration/salesforceActions';
import { goToPrevModal } from '../../../actions/modalActions';
import { createOfflineSfNote } from '../../../actions/offlineChangesActions';
import { SvgIcon } from '../../../constants/SvgIcon';
import translate from '../../../utils/translate';
import WithIcon from '../../forms/WithIcon';
import { DialogHeaderTextButton } from '../../layout/DialogHeaderTextButton';
import { DialogContainer } from '../layout/DialogContainer';
import { FlexDialogContent } from '../layout/DialogContent';
import { DialogHeader } from '../layout/DialogHeader';

class ContactNoteModalClass extends React.Component<IContactNoteModalProps, object> {
    public refs: {
        text: HTMLTextAreaElement;
        [key: string]: HTMLTextAreaElement;
    };

    public render() {
        const { customer } = this.props.modalProps;
        return (
            <DialogContainer>
                <DialogHeader
                    title={translate('modal.contact-note-title')}
                    confirmAction={
                        <DialogHeaderTextButton onClick={this.addNote} label={translate('generic.button.save')} />
                    }
                />
                <FlexDialogContent>
                    <WithIcon icon={SvgIcon.Contacts} className='separated--bottom-dark'>
                        {customer && customer.name}
                    </WithIcon>
                    <WithIcon icon={SvgIcon.Description} multiline className='flex-grow--1'>
                        <textarea ref='text' className='full-height' rows={4}
                            placeholder={translate('generic.placeholder.write-something')}
                        />
                    </WithIcon>
                </FlexDialogContent>
            </DialogContainer>
        );
    }

    private addNote = () => {
        this.props.createNote({
            body: this.refs.text.value,
            parentId: this.props.modalProps.customer.id,
        });
        this.props.goToPrevModal();
    }
}

interface IContactNoteModalProps {
    modalProps: {
        customer: {
            name: string;
            id: string;
        };
    };
    goToPrevModal: typeof goToPrevModal;
    createNote: typeof createSalesforceNoteAndShowToast;
}

export const ContactNoteModal = connect(
    null,
    {
        createNote: createSalesforceNoteAndShowToast,
    },
)(ContactNoteModalClass);

export const ContactNoteOfflineModal = connect<IContactNoteModalProps>(
    null,
    {
        createNote: createOfflineSfNote,
    },
)(ContactNoteModalClass);
