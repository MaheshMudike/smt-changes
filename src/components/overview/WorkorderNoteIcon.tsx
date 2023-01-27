import * as React from 'react';
import IconButtonFA from '../layout/IconButonFA';
import { showModal } from 'src/actions/modalActions';
import { ModalType } from 'src/constants/modalTypes';
import { connect } from 'react-redux';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Note } from 'src/models/api/coreApi';

class SMTNotesIconClass extends React.Component<
    { item: { queryDetails: () => Promise<any> }, workOrderId: string, className?: string, icon?: IconProp } & { showModal: typeof showModal }, {}
> {

    public render() {
        const { item, workOrderId, showModal, className, icon } = this.props;
        return <IconButtonFA className={className} icon={icon || faClipboard}  
            onClick={(ev) => { ev.stopPropagation(); showModal(ModalType.WorkOrderNotesModal, { item, workOrderId })} }
        />
    }
}

export function SMTNotesIconFun(props: { item: { queryDetails: () => Promise<any>}, workOrderId: string, className?: string  }) {
    return <SMTNotesIcon {...props} />
}

export const SMTNotesIcon = connect(null, { showModal })(SMTNotesIconClass)
