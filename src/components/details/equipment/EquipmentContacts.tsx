import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { downloadEquipmentContacts } from '../../../actions/integration/equipmentActions';
import { IGlobalState } from '../../../models/globalState';
import { ContactsRoleDetails } from '../../partials/ContactsRoleDetails';

type EquipmentContactsProps = typeof equipmentContactsDispatch & ReturnType<typeof equipmentContactsState> & { contractId: string, locationId: string }

class EquipmentContactsClass extends React.Component<EquipmentContactsProps, {}> {
    public render() {
        return <ContactsRoleDetails { ...this.props.contacts }/>
    }

    public componentWillReceiveProps(nextProps: EquipmentContactsProps) {
        if (this.props.contractId !== nextProps.contractId) {
            this.props.downloadEquipmentContacts(nextProps.contractId, nextProps.locationId);
        }
    }

    public componentDidMount() {
        this.props.downloadEquipmentContacts(this.props.contractId, this.props.locationId);
    }
}


const equipmentContactsState = (state: IGlobalState) => ({ contacts: state.equipmentDetails.contacts })
const equipmentContactsDispatch = {
    downloadEquipmentContacts
}

export const EquipmentContacts = connect(equipmentContactsState, equipmentContactsDispatch)(EquipmentContactsClass);
