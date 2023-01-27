import { EnumValues } from 'enum-values';
import * as React from 'react';
import { connect } from 'react-redux';

import { showModal } from '../../../actions/modalActions';
import { formatLabel } from '../../../utils/formatUtils';
import equipmentAccountsAndContractFields from '../../fields/equipmentAccountsAndContractFields';
import { renderFields } from '../../forms/renderFields';
import { EquipmentCrmInfo } from './EquipmentCrmInfo';
import { EquipmentServiceOrders } from './EquipmentServiceOrders';
import equipmentFields from '../../fields/equipmentFields';
import { EquipmentHelpdeskCases } from './EquipmentHelpdeskCases';
import { EquipmentContacts } from './EquipmentContacts';
import { TabbedDetail } from '../../tabs/TabbedDetail';
import { downloadServiceVisitHistory } from '../../../actions/integration/equipmentActions';
import Equipment from 'src/models/equipment/Equipment';
import { IGlobalState } from 'src/models/globalState';
import { EntityFieldsData, entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';

type IEquipmentDetailsProps = typeof EquipmentDetailsDispatchProps 
    & { equipment: Equipment, entityFieldsData: EntityFieldsData }

class EquipmentDetail extends React.Component<IEquipmentDetailsProps, { currentTab: EquipmentDetailTab }> {

    constructor(props: IEquipmentDetailsProps) {
        super(props);
        this.state = { currentTab: EquipmentDetailTab.BasicInfo };
    }

    public render() {
        return (
        <TabbedDetail 
            items={EnumValues.getNames(EquipmentDetailTab).map(name => (
                <span>{formatLabel(`equipment-details.tab.${ name.toLowerCase() }`)}</span>
            ))}
            onChangeTab={(index: EquipmentDetailTab) => this.setState({ ...this.state, currentTab: index })} 
            selectedTab={this.state.currentTab}>
            {this.renderDialogContent()}
        </TabbedDetail>
        )
    };

    private renderDialogContent() {
        const equipment = this.props.equipment;
        const equipmentId = equipment.id;
        const { entityFieldsData } = this.props;
        switch (this.state.currentTab) {
            case EquipmentDetailTab.BasicInfo:
                return <div>{renderFields(equipmentFields(equipment, entityFieldsData))}</div>;
            case EquipmentDetailTab.AccountAndContract:
                return <div>{renderFields(equipmentAccountsAndContractFields(equipment, entityFieldsData.locale))}</div>;
            case EquipmentDetailTab.ServiceOrders:
                return <EquipmentServiceOrders id={equipmentId} />;
            case EquipmentDetailTab.CrmInfo:
                return <EquipmentCrmInfo id={equipmentId} />;
                /*
            case EquipmentDetailTab.VisitHistory:
                return <EventList id={equipment.account.id} />; 
               /*
                <ServiceVisitHistories id={equipmentId} 
                    downloadServiceVisitHistory={limit => this.props.downloadServiceVisitHistory(this.props.equipment.id, limit)}/>
                    */
            case EquipmentDetailTab.Contacts:
                return <EquipmentContacts contractId={equipment.contract.id} locationId={equipment.locationId} />
            case EquipmentDetailTab.HelpdeskCases:
                return <EquipmentHelpdeskCases id={equipmentId}/>
            default:
                return null;
        }
    };

}

enum EquipmentDetailTab {
    BasicInfo,
    AccountAndContract,
    ServiceOrders,
    CrmInfo,
    //VisitHistory,
    Contacts,
    HelpdeskCases
}

const EquipmentDetailsDispatchProps = { showModal, downloadServiceVisitHistory };

export default connect((state: IGlobalState) => ({ entityFieldsData: entityFieldsDataFromState(state) }), EquipmentDetailsDispatchProps)(EquipmentDetail);
