import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { queryComplaintsForEquipment } from '../../../actions/integration/complaintActions';
import { queryOpportunitiesForEquipment } from '../../../actions/integration/opportunitiesActions';
import { queryTendersForEquipment } from '../../../actions/integration/tenderActions';
import { showModal } from 'src/actions/modalActions';
import { queryAndShowDetailsDialogFromListItem } from 'src/actions/integration/detailsActions';
import ItemsListGroups from 'src/components/partials/ItemsListGroups';

type IEquipmentCrmInfoClassProps = typeof EquipmentCrmInfoDispatchProps & { id: string };

//000000000010329497 has opportunities
class EquipmentCrmInfoClass extends React.Component<IEquipmentCrmInfoClassProps, {}> {
    public render() {
        return (
            <ItemsListGroups
                key={'EquipmentServiceOrders' + this.props.id} 
                queryParams={ 
                    { id: this.props.id }
                }
                groupProperties={[
                    {
                        title: 'equipment-details.crm.subheader.open-complaints',
                        groupKey: CrmType.Complaints,
                        action: (params: CrmQueryParams) => queryComplaintsForEquipment(params.id)
                    }, 
                    {
                        title: 'equipment-details.crm.subheader.open-opportunities',
                        groupKey: CrmType.Opportunities,
                        action: (params: CrmQueryParams) => queryOpportunitiesForEquipment(params.id)
                    },
                    {
                        title: 'equipment-details.crm.subheader.open-tenders',
                        groupKey: CrmType.Tenders,
                        action: (params: CrmQueryParams) => queryTendersForEquipment(params.id)
                    }
                ]}
            />
        );
    }

}

type CrmQueryParams = { id: string }

enum CrmType { 
    Complaints = "Complaints", 
    Opportunities = "Opportunities",
    Tenders = "Tenders"
}

const EquipmentCrmInfoDispatchProps = {
    showModal,
    queryAndShowDetailsDialogFromListItem
}

export const EquipmentCrmInfo = connect(null, EquipmentCrmInfoDispatchProps)(EquipmentCrmInfoClass);
