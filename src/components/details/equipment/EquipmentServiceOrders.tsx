import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { queryEquipmentServiceOrders } from '../../../actions/integration/equipmentActions';
import Callout from '../../../models/feed/Callout';
import { IGlobalState } from '../../../models/globalState';
import { entityFieldsDataFromState, EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import { WorkOrderTypeSelectField, serviceOrderTypesFromFilter, MaintenanceActivityTypeReportFilter } from 'src/components/reports/ServiceOrdersReport';
import ItemsListGroups from 'src/components/partials/ItemsListGroups';
import { conditions } from 'src/actions/http/jsforceMappings';
import { filterWithMaintenanceActivityTypeFilters } from 'src/constants/ServiceOrderType';

type EquipmentServiceOrderProps = ReturnType<typeof EquipmentServiceOrdersStateProps> & { id: string }


class EquipmentServiceOrdersClass extends React.Component<EquipmentServiceOrderProps, { serviceOrderTypes: MaintenanceActivityTypeReportFilter[] }> {

    constructor(props: EquipmentServiceOrderProps) {
        super(props);
        this.state = { serviceOrderTypes: [] };
    }

    public render() {
        const { entityFieldsData } = this.props;

        const serviceOrderTypes = serviceOrderTypesFromFilter(this.state.serviceOrderTypes);
        const filterOrder = (c: Callout) => filterWithMaintenanceActivityTypeFilters(c, serviceOrderTypes);
        return <ItemsListGroups
            filter={filterOrder}
            topbar={<WorkOrderTypeSelectField serviceOrderTypes={this.state.serviceOrderTypes} setServiceOrderTypes={this.setServiceOrderTypes} />}
            key={'EquipmentServiceOrders' + this.props.id} 
            queryParams={ 
                { equipmentId: this.props.id, entityFieldsData: this.props.entityFieldsData } 
            }
            groupProperties={[
                {
                    title: 'generic.open',
                    groupKey: WorkOrderGroup.Open,
                    action: (params: WorkordersQueryParams) =>
                        queryEquipmentServiceOrders(params.equipmentId, params.entityFieldsData, [conditions.WorkOrder.open(params.entityFieldsData.activeInFSM)])
                }, 
                {
                    title: 'generic.closed',
                    groupKey: WorkOrderGroup.Closed,
                    action: (params: WorkordersQueryParams) => 
                        queryEquipmentServiceOrders(params.equipmentId, params.entityFieldsData, [conditions.WorkOrder.closed(params.entityFieldsData.activeInFSM)])
                }
            ]}
        />;
    }

    private setServiceOrderTypes = (types: MaintenanceActivityTypeReportFilter[]) => {
        this.setState({ ...this.state, serviceOrderTypes: types});
    }

}

type WorkordersQueryParams = { equipmentId: string, entityFieldsData: EntityFieldsData }

enum WorkOrderGroup { 
    Open = "Open", 
    Closed = "Closed"
}

const EquipmentServiceOrdersStateProps = (state: IGlobalState) => ({ 
    entityFieldsData: entityFieldsDataFromState(state)
})

export const EquipmentServiceOrders = connect(EquipmentServiceOrdersStateProps, {})(EquipmentServiceOrdersClass);
