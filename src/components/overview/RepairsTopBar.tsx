import * as React from 'react';

import { connect } from 'react-redux';

import { IGlobalState } from '../../models/globalState';
import { RepairFilter } from '../../models/overview/RepairFilter';
import { IFilterButton } from './IFilterButton';
import { changeRepairsFilter, changeRepairsGrouping } from '../../actions/integration/repairActions';
import { createTopBarClass } from './OpportunityTopBar';
import { ServiceOrderGrouping } from 'src/models/overview/CalloutGrouping';
import { RepairGrouping } from 'src/models/overview/RepairGrouping';
import GroupingButton from './GroupingButton';
import FilterButton from './FilterButton';

class RepairsFilterButtonClass extends React.Component<IFilterButton<RepairFilter> & { className: string }, {}> {
    public render() {
        const filterOptions = Object.keys(RepairFilter).map(filter => 
            [RepairFilter[filter], RepairFilter[filter]] as [RepairFilter, string]
        );
        return <FilterButton {...this.props} className={this.props.className} options={filterOptions} />;
    }
}

export const RepairsFilterButton = connect(
    (state: IGlobalState) => ({ selectedOption: state.repairs.filter }),
    {
        select: changeRepairsFilter
    },
)(RepairsFilterButtonClass);


class RepairsGroupingButtonClass extends React.Component<IFilterButton<ServiceOrderGrouping> & { className?: string }, {}> {
    public render() {
        return <GroupingButton {...this.props} className={this.props.className}
        options={[
            /*[RepairGrouping.Type, 'repair.grouping.type'],*/
            [RepairGrouping.None, 'repair.grouping.none'],
            [ServiceOrderGrouping.ByDate, 'generic.field.date'],
            [ServiceOrderGrouping.ByWorkCenter, 'callout.field.work-center'],
            [ServiceOrderGrouping.ByStatus, 'generic.field.status'],
            [ServiceOrderGrouping.ByAssemblyCode, 'generic.field.assembly-code']
        ] as Array<[RepairGrouping | ServiceOrderGrouping, string]>} />;
    }
}

const RepairsGroupingButton = connect(
    (state: IGlobalState) => ({ selectedOption: state.repairs.grouping }),
    {
        select: changeRepairsGrouping
    },
)(RepairsGroupingButtonClass);

export const RepairsTopBar = RepairsGroupingButton;