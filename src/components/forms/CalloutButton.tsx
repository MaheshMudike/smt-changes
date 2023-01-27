import * as React from 'react';
import { ModalType } from '../../constants/modalTypes';
import Callout from '../../models/feed/Callout';
import ModalButton from './ModalButton';

export default class CalloutButton extends React.Component<{ callout: Callout, className?: string }>{
    public render() {
        return <ModalButton modalType={ ModalType.CalloutDetailsModal } modalProps={ this.props.callout } { ...this.props }/>
    }
}
