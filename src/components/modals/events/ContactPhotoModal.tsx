import * as moment from 'moment';
import * as React from 'react';
import { connect } from 'react-redux';

import { createSalesforceAttachmentAndShowToast } from '../../../actions/integration/salesforceActions';
import { createOfflineSfAttachment } from '../../../actions/offlineChangesActions';
import INameAndId from '../../../models/INameAndId';
import translate from '../../../utils/translate';
import { FileLoader, IFile } from '../../FileLoader';
import { ForegroundPanel } from '../../panels/ForegroundPanel';
import { showToast } from '../../../actions/toasts/toastActions';
import { toastMessages } from '../../../constants/toastMessages';
import { ThunkAction } from '../../../actions/thunks';
import { goToPrevModal } from 'src/actions/modalActions';
import { IModalDefinition } from 'src/models/modals/state';


function takePicture(success: (s: string) => void): ThunkAction<void> {
    return dispatch => {
        //this is a hack to make it work in some phones, with this code it works for the Moto G4 plus with android 7.0
        //https://stackoverflow.com/questions/37808733/cordova-navigator-camera-getpicture-not-working-in-android
        if (device.platform === 'Android') {
            setInterval(function () {
               cordova.exec(null, null, '', '', [])
            }, 200);
        }

        navigator.camera.getPicture(
            imageData => success(imageData),
            reason => {
                console.error('>>> Take picture failed', reason);
                dispatch(showToast({
                    message: toastMessages().TAKE_PICTURE_FAILED,
                }));
            },
            {
                destinationType: Camera.DestinationType.DATA_URL,                
            },
        );
    };
}

class ContactPhotoModalClass extends React.Component<IContactPhotoModalProps, object> {
    public render() {
        return (
            <ForegroundPanel title={translate('modal.contact-photo.title')} buttons={[
                <div className='padding--large' key='0'>
                    <button className='button button--flat button--no-padding' onClick={this.takePicture}>
                        {translate('generic.button.take-picture')}
                    </button>
                </div>,
                <label className='padding--large relative' key='1'>
                    <FileLoader accept='image/*' onLoad={this.loadFile} />
                    <button className='button button--flat button--no-padding'>
                        {translate('generic.button.load-picture')}
                    </button>
                </label>,
            ]}>
                {translate('modal.contact-photo.add-attachment')}
            </ForegroundPanel>
        );
    }

    private takePicture = () => {
        const customer = this.props.modalProps.customer;
        this.props.takePicture((imageData => {
            this.props.createAttachment(customer, `${ moment().format('YYYY-MM-DD-hh-mm-ss') }.jpeg`, imageData);
            this.props.goToPrevModal();
        }));
    };

    private loadFile = (file: IFile) => {
        const contact = this.props.modalProps.customer;
        this.props.createAttachment(contact, file.fileName, file.base64Content);
        this.props.goToPrevModal();
    };
}

interface IContactPhotoModalProps extends IModalDefinition<ICustomer> {
    createAttachment: typeof createSalesforceAttachmentAndShowToast;
    takePicture: typeof takePicture;
    goToPrevModal: typeof goToPrevModal;
}

interface ICustomer {
    customer: INameAndId;
}

export const ContactPhotoModal = connect(
    null,
    {
        takePicture,
        createAttachment: createSalesforceAttachmentAndShowToast,
    },
)(ContactPhotoModalClass);

export const ContactPhotoOfflineModal = connect(
    null,
    {
        takePicture,
        createAttachment: createOfflineSfAttachment,
    },
)(ContactPhotoModalClass);