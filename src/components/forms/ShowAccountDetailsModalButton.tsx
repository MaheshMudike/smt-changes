import * as React from 'react';
import { connect } from 'react-redux';
import { downloadAndShowAccount } from '../../actions/integration/accountActions';
import { DetailsModalButton } from './DetailsModalButton';
import { downloadAndShowEquipment } from 'src/actions/integration/equipmentActions';
import { downloadAndShowWorkOrder } from 'src/actions/integration/calloutActions';
import { activeInFSMFromState, IGlobalState } from 'src/models/globalState';
import { Identifiable } from 'src/models/feed/ISObject';
import { entityFieldsDataFromState, EntityFieldsData } from '../fields/EntityFieldsData';
import { downloadAndShowTechnicianDetails } from 'src/actions/technicianActions';

class ShowDetailsButtonClass extends React.Component<{ 
    identifiable: { id: string, name: string }, 
    queryAndShowDetails: (identifiable: Identifiable & { name: string }, entityFieldsData: EntityFieldsData) => void,
    entityFieldsData: EntityFieldsData
} & React.WithChildren, object> {
    public render() {
        return <DetailsModalButton action={() => this.props.queryAndShowDetails(this.props.identifiable, this.props.entityFieldsData)}>
            { this.props.children }
        </DetailsModalButton>;
    }
}

const ShowAccountDetailsButton = connect(
    (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) }),
    { queryAndShowDetails: downloadAndShowAccount}
)(ShowDetailsButtonClass);

export const showAccountLinkWrapper = (account: { id: string, name: string }) => (props: React.WithChildren) => (
    <ShowAccountDetailsButton identifiable={account} >{props.children}</ShowAccountDetailsButton>
);

const ShowEquipmentDetailsButton = connect(
    (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) }),
    { queryAndShowDetails: (identifiable: Identifiable) => downloadAndShowEquipment(identifiable.id)}
)(ShowDetailsButtonClass);

export const showEquipmentLinkWrapper = (equipment: { id: string, name: string }) => (props: React.WithChildren) => (
    <ShowEquipmentDetailsButton identifiable={equipment} >{props.children}</ShowEquipmentDetailsButton>
);

const ShowWorkOrderDetailsButton = connect(
    (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) }),
    { queryAndShowDetails: (identifiable: Identifiable) => downloadAndShowWorkOrder(identifiable.id) }
)(ShowDetailsButtonClass);

export const showWorkOrderLinkWrapper = (wo: { id: string, name: string }) => (props: React.WithChildren) => (
    <ShowWorkOrderDetailsButton identifiable={wo} >{props.children}</ShowWorkOrderDetailsButton>
);

export const showActionLinkWrapper = (action: () => void) => (props: React.WithChildren) => (
    <DetailsModalButton action={action}>
        {props.children}
    </DetailsModalButton>
);

const ShowTechnicianDetailsButton = connect(
    (state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) }),
    { queryAndShowDetails: (identifiable: Identifiable, entityFieldsData: EntityFieldsData) => downloadAndShowTechnicianDetails([identifiable.id])}
)(ShowDetailsButtonClass);

export const showTechnicianLinkWrapper = (technician: { id: string, name: string }) => (props: React.WithChildren) => (
    <ShowTechnicianDetailsButton identifiable={technician} >{props.children}</ShowTechnicianDetailsButton>
);