import * as React from 'react';
import { connect } from 'react-redux';
import { downloadAndShowEquipment } from '../../actions/integration/equipmentActions';
import { userIdFromState, IGlobalState, activeInFSMFromState } from 'src/models/globalState';

class ShowEquipmentDetailsModalButtonClass extends React.Component<
    { equipmentId: string; userId: string; activeInFSM: boolean } & typeof ShowEquipmentDispatchProps, object
> {
    public render() {
        return (
            <button className='relative link-wrapper--full-width' 
                onClick={() => this.props.downloadAndShowEquipment(this.props.equipmentId)}>
                {this.props.children}
            </button>
        );
    }
}

const ShowEquipmentDetailsModalButton = connect(
    (state: IGlobalState) => ({ userId: userIdFromState(state), activeInFSM: activeInFSMFromState(state) })
)(ShowEquipmentDetailsModalButtonClass)

const ShowEquipmentDispatchProps = {
    downloadAndShowEquipment
}

const ShowEquipmentDetailsButton = connect(null, ShowEquipmentDispatchProps)(ShowEquipmentDetailsModalButton);

export const showEquipmentLinkWrapper = (equipmentId: string) => (props: React.WithChildren) => (
    <ShowEquipmentDetailsButton equipmentId={equipmentId} >
        {props.children}
    </ShowEquipmentDetailsButton>
);

