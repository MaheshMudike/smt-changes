import * as React from 'react';

import { connect } from 'react-redux';

import { LeadGrouping } from '../../models/overview/LeadGrouping';
import { changeLeadsFilter, changeLeadsGrouping, changeLeadsOwnedGrouping, changeLeadsOwnedFilter, changeLeadsCustomersGrouping, changeLeadsCustomersFilter } from '../../actions/integration/leadActions';
import { IGlobalState } from '../../models/globalState';
import { LeadFilter } from '../../models/overview/LeadFilter';
import { IPayloadAction } from 'src/actions/actionUtils';
import FilterButton from './FilterButton';
import GroupingButton from './GroupingButton';

export class LeadBar extends React.Component<{ 
    filter: LeadFilter, selectFilter: (payload: LeadFilter) => IPayloadAction<LeadFilter>, 
    grouping: LeadGrouping, selectGrouping: (payload: LeadGrouping) => IPayloadAction<LeadGrouping>
}> {
    public render() {
        const { filter, selectFilter, grouping, selectGrouping } = this.props;
        return (
            <div className='container--horizontal'>
                <FilterButton selectedOption={filter} select={selectFilter} className={'half-width'} 
                    options={[
                        [LeadFilter.All, 'opportunity.filter.all'],
                        [LeadFilter.VARepairsAndDoors, 'opportunity.filter.va-repairs-and-doors']
                    ]} 
                />
                <GroupingButton selectedOption={grouping} select={selectGrouping} className={'half-width'} 
                    options={[
                        [LeadGrouping.StageName, 'lead.field.stage-name'],
                        [LeadGrouping.BusinessType, 'lead.field.business-type'],
                        [LeadGrouping.CreatedDate, 'generic.field.created-date'],
                        [LeadGrouping.LeadSource, 'lead.field.lead-source'],
                        [LeadGrouping.TechnicianName, 'opportunity.field.technician-name'],
                        [LeadGrouping.Urgency, 'lead.field.urgency'],
                    ]} 
                />
            </div>
        );
    }
}

export const LeadTopBar = connect(
    (state: IGlobalState) => ({
        grouping: state.leads.grouping,
        filter: state.leads.filter
    }),
    {
        selectGrouping: changeLeadsGrouping,
        selectFilter: changeLeadsFilter
    },
)(LeadBar);

export const LeadTopBarOwned = connect(
    (state: IGlobalState) => ({
        grouping: state.leads.grouping,
        filter: state.leads.filter
    }),
    {
        selectGrouping: changeLeadsOwnedGrouping,
        selectFilter: changeLeadsOwnedFilter
    },
)(LeadBar);

export const LeadTopBarCustomers = connect(
    (state: IGlobalState) => ({
        grouping: state.leadsCustomers.grouping,
        filter: state.leadsCustomers.filter
    }),
    {
        selectGrouping: changeLeadsCustomersGrouping,
        selectFilter: changeLeadsCustomersFilter
    },
)(LeadBar);