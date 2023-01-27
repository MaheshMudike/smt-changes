import * as React from 'react';

import { connect } from 'react-redux';

import { OpportunityGrouping } from '../../models/overview/OpportunityGrouping';
import { changeOpportunitiesFilter, changeOpportunitiesWithTendersFilter, changeOpportunitiesOwnedGrouping, changeOpportunitiesOwnedFilter, changeOpportunitiesCustomersGrouping, changeOpportunitiesCustomersFilter, changeOpportunitiesWithTendersOwnedFilter, changeOpportunitiesWithTendersOwnedGrouping, changeOpportunitiesWithTendersCustomersGrouping, changeOpportunitiesWithTendersCustomersFilter, changeSalesLeadsGrouping, changeSalesLeadsFilter, changeSalesLeadsOwnedGrouping, changeSalesLeadsOwnedFilter, changeSalesLeadsCustomersGrouping, changeSalesLeadsCustomersFilter } from '../../actions/integration/opportunitiesActions';
import { IGlobalState } from '../../models/globalState';
import { OpportunityFilter } from '../../models/overview/OpportunityFilter';
import { changeOpportunitiesGrouping, changeOpportunitiesWithTendersGrouping } from '../../actions/integration/opportunitiesActions';
import { IPayloadAction } from 'src/actions/actionUtils';
import FilterButton from './FilterButton';
import GroupingButton from './GroupingButton';

export function createTopBarClass(
    FilterButton: React.ComponentClass<{ className?: string }>, 
    GroupingButton: React.ComponentClass<{ className?: string }>
) {
    return class TopBar extends React.Component<object, object> {
        public render() {
            return (
                <div className='container--horizontal'>
                    <FilterButton className='half-width'/>
                    <GroupingButton className='half-width'/>
                </div>
            );
        }
    };
}

class OpportunityBar extends React.Component<{ 
    filter: OpportunityFilter, selectFilter: (payload: OpportunityFilter) => IPayloadAction<OpportunityFilter>, 
    grouping: OpportunityGrouping, selectGrouping: (payload: OpportunityGrouping) => IPayloadAction<OpportunityGrouping> ,
    layout: string,
    showAmount?: boolean
}> {
    public render() {
        const { filter, selectFilter, grouping, selectGrouping, layout, showAmount = false } = this.props;
        return (
            <div className='container--horizontal'>
                <FilterButton selectedOption={filter} select={selectFilter} className={'half-width'} 
                    options={[
                        [OpportunityFilter.All, 'opportunity.filter.all'],
                        ...(layout == 'overview' ? [
                            [OpportunityFilter.AssignedToSupervisor, 'opportunity.filter.supervisor'],
                            [OpportunityFilter.AssignedToPlannerGroup, 'opportunity.filter.planner-group']
                        ] as [OpportunityFilter, string][] : []),
                        [OpportunityFilter.VARepairsAndDoors, 'opportunity.filter.va-repairs-and-doors']
                    ]} 
                />
                <GroupingButton selectedOption={grouping} select={selectGrouping} className={'half-width'} 
                    options={[
                        [OpportunityGrouping.Stage, 'opportunity.field.stage-name'],
                        [OpportunityGrouping.BusinessType, 'generic.field.business-type'],
                        [OpportunityGrouping.MarketSegment, 'opportunity.field.market-segment'],
                        [OpportunityGrouping.CreatedDate, 'opportunity.field.created-date'],
                        [OpportunityGrouping.CloseDate, 'opportunity.field.close-date'],
                        (showAmount ? [OpportunityGrouping.Amount, 'opportunity.field.amount'] : null) as [OpportunityGrouping, string],
                        [OpportunityGrouping.Account, 'generic.entity-name.account'],
                        [OpportunityGrouping.LeadSource, 'opportunity.field.lead-source'],
                        [OpportunityGrouping.TechnicianName, 'opportunity.field.technician-name'],
                        [OpportunityGrouping.Equipment, 'generic.entity-name.equipment'],
                        [OpportunityGrouping.EquipmentAddress, 'generic.field.address'],
                        [OpportunityGrouping.Owner, 'generic.field.owner'],
                        [OpportunityGrouping.OpportunityCategory, 'opportunity.field.opportunity-category']
                    ]}
                />
            </div>
        );
    }
}

export const OpportunityGroupingTitle = {
    'Affordable housing':'filters.Affordable housing',
    'Doors':'filters.Doors',
    //Market Segment
    'Hotel':'filters.Hotel',
    'Retail':'filters.Retail',
    'Office':'filters.Office',
    'Medical':'filters.Medical',
    'Industrial':'filters.Industrial',
    'Residential':'filters.Residential',
    'Public Transportation':'filters.Public Transportation',
    'Leisure and Education':'filters.Leisure and Education',
    //Lead Status
    'New':'filters.New',
    'Qualified':'filters.Qualified',
    'In Process':'filters.In Process',
    //Lead Source
    'KONE Initiated: Prospecting':'filters.KONE Initiated: Prospecting',
    'KONE Initiated: Technician':'filters.KONE Initiated: Technician',
    'Customer Initiated: Request':'filters.Customer Initiated: Request',
    'Agent Initiated':'filters.Agent Initiated',
    'Inspection':'service-order-type.y06',

    //Oppurtunity Category
    'Maintained by Competitors':'filters.Maintained by Competitors',
    'Maintained by KONE':'filters.Maintained by KONE',
    'Repair/Modernization':'filters.Repair/Modernization',

    'Invitation to Tender':'filters.Invitation to Tender',
    'Multiuse Segment':'filters.Multiuse Segment',
    //Stage
    'On Hold':'service-order-konect-status.1',
    'Prospecting/Design Assist':'filters.Prospecting/Design Assist',
    'Tender/Proposal':'filters.Tender/Proposal',

    'RFQ':'filters.RFQ',
    'VA Repairs':'filters.VA Repairs',
}

export const OpportunityTopBar = connect(
    (state: IGlobalState) => ({
        grouping: state.opportunities.grouping,
        filter: state.opportunities.filter,
        layout: state.configuration.content.layout
    }),
    {
        selectGrouping: changeOpportunitiesGrouping,
        selectFilter: changeOpportunitiesFilter
    },
)(OpportunityBar);

export const OpportunityTopBarOwned = connect(
    (state: IGlobalState) => ({
        grouping: state.opportunities.grouping,
        filter: state.opportunities.filter,
        layout: state.configuration.content.layout
    }),
    {
        selectGrouping: changeOpportunitiesOwnedGrouping,
        selectFilter: changeOpportunitiesOwnedFilter
    },
)(OpportunityBar);

export const OpportunityTopBarCustomers = connect(
    (state: IGlobalState) => ({
        grouping: state.opportunitiesCustomers.grouping,
        filter: state.opportunitiesCustomers.filter,
        layout: state.configuration.content.layout
    }),
    {
        selectGrouping: changeOpportunitiesCustomersGrouping,
        selectFilter: changeOpportunitiesCustomersFilter
    },
)(OpportunityBar);


class OpportunityWithTenderBar extends React.Component<{ 
    filter: OpportunityFilter, selectFilter: (payload: OpportunityFilter) => IPayloadAction<OpportunityFilter>, 
    grouping: OpportunityGrouping, selectGrouping: (payload: OpportunityGrouping) => IPayloadAction<OpportunityGrouping> ,
    layout: string
}> {
    public render() {
        return <OpportunityBar {...this.props} showAmount={true} />;
    }
}

export const OpportunityWithTenderTopBar = connect(
    (state: IGlobalState) => ({
        grouping: state.opportunitiesWithTenders.grouping,
        filter: state.opportunitiesWithTenders.filter,
        layout: state.configuration.content.layout
    }),
    {
        selectGrouping: changeOpportunitiesWithTendersGrouping,
        selectFilter: changeOpportunitiesWithTendersFilter
    },
)(OpportunityWithTenderBar);


export const OpportunityWithTenderOwnedTopBar = connect(
    (state: IGlobalState) => ({
        grouping: state.opportunitiesWithTendersOwned.grouping,
        filter: state.opportunitiesWithTendersOwned.filter,
        layout: state.configuration.content.layout
    }),
    {
        selectGrouping: changeOpportunitiesWithTendersOwnedGrouping,
        selectFilter: changeOpportunitiesWithTendersOwnedFilter
    },
)(OpportunityWithTenderBar);


export const OpportunityWithTenderCustomersTopBar = connect(
    (state: IGlobalState) => ({
        grouping: state.opportunitiesWithTendersCustomers.grouping,
        filter: state.opportunitiesWithTendersCustomers.filter,
        layout: state.configuration.content.layout
    }),
    {
        selectGrouping: changeOpportunitiesWithTendersCustomersGrouping,
        selectFilter: changeOpportunitiesWithTendersCustomersFilter
    },
)(OpportunityWithTenderBar);