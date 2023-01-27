import * as React from 'react';
import { connect } from 'react-redux';

import { changeMbmGrouping, changeUnplannedCalloutsGrouping, changeInspectionPointsGrouping, changeInspectionsGrouping, changeServiceNeedsGrouping, changeServiceNeedsFilter } from '../../actions/integration/calloutActions';
import { IGlobalState } from '../../models/globalState';
import { ServiceOrderGrouping } from '../../models/overview/CalloutGrouping';

import { ServiceNeedsFilter } from 'src/models/overview/ServiceNeedsFilter';
import GroupingButton from './GroupingButton';
import FilterButton from './FilterButton';

type GroupingWithText = [ServiceOrderGrouping, string];

const groupings: GroupingWithText[] = [
    [ServiceOrderGrouping.ByDate, 'generic.field.date'],
    [ServiceOrderGrouping.ByWorkCenter, 'callout.field.work-center'],
    [ServiceOrderGrouping.ByStatus, 'generic.field.status'],
];

class ServiceOrderGroupingBar extends React.Component<IWorkOrderGroupingBarProps, {}> {
    public render() {
        return <GroupingButton {...this.props} options={groupings} />;
    }
}

interface IWorkOrderGroupingBarProps {
    selectedOption: ServiceOrderGrouping;
    select: typeof changeUnplannedCalloutsGrouping;
}

export const UnplannedCalloutGroupingBar = connect(
    (state: IGlobalState) => ({
        selectedOption: state.unplannedCallouts.grouping,
    }),
    {
        select: changeUnplannedCalloutsGrouping
    },
)(ServiceOrderGroupingBar);

export const MbmCalloutGroupingBar = connect(
    (state: IGlobalState) => ({
        selectedOption: state.mbmCallouts.grouping,
    }),
    {
        select: changeMbmGrouping
    },
)(ServiceOrderGroupingBar);

export const InspectionPointsGroupingBar = connect(
    (state: IGlobalState) => ({
        selectedOption: state.inspectionPoints.grouping,
    }),
    {
        select: changeInspectionPointsGrouping
    },
)(ServiceOrderGroupingBar);

export const InspectionsGroupingBar = connect(
    (state: IGlobalState) => ({
        selectedOption: state.inspections.grouping,
    }),
    {
        select: changeInspectionsGrouping
    },
)(ServiceOrderGroupingBar);

class ServiceNeedsGroupingBarClass extends React.Component<IWorkOrderGroupingBarProps, {}> {
    public render() {
        return <GroupingButton {...this.props} options={[...groupings, [ServiceOrderGrouping.ByAssemblyCode, 'generic.field.assembly-code']]} />;
    }
}

export const ServiceNeedsGroupingBar = connect(
    (state: IGlobalState) => ({
        selectedOption: state.serviceNeeds.grouping,
    }),
    {
        select: changeServiceNeedsGrouping
    },
)(ServiceNeedsGroupingBarClass);

// class ServiceNeedsGroupingBarClass extends React.Component<{
//     selectedGrouping: ServiceOrderGrouping;
//     selectGrouping: typeof changeServiceNeedsGrouping;
//     selectedFilter: ServiceNeedsFilter;
//     selectFilter: typeof changeServiceNeedsFilter;
// }, {}> {
//     public render() {
//         return <div className='container--horizontal'>
//             <FilterButton selectedOption={this.props.selectedFilter} select={this.props.selectFilter} className={'half-width'}
//                 options={[
//                     [ServiceNeedsFilter.All, 'service-needs.filter.all'],
//                     [ServiceNeedsFilter.MissedServiceNeeds, 'service-needs.filter.missed-service-needs']
//                 ]} />
//             <GroupingButton selectedOption={this.props.selectedGrouping} select={this.props.selectGrouping} className={'half-width'} 
//                 options={[...groupings, [ServiceOrderGrouping.ByAssemblyCode, 'generic.field.assembly-code']]} />
//         </div>;
//     }
// }

// export const ServiceNeedsGroupingBar = connect(
//     (state: IGlobalState) => ({
//         selectedGrouping: state.serviceNeeds.grouping,
//         selectedFilter: state.serviceNeeds.filter,
//     }),
//     {
//         selectGrouping: changeServiceNeedsGrouping,
//         selectFilter: changeServiceNeedsFilter
//     },
// )(ServiceNeedsGroupingBarClass);
