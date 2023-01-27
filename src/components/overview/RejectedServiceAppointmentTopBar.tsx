import * as React from 'react';
import { connect } from 'react-redux';
import { IFilterButton } from './IFilterButton';
import { MaintenanceActivityTypeFilter, maintenanceActivityTypeFilterLabel } from 'src/constants/ServiceOrderType';
import translate from 'src/utils/translate';
import { IGlobalState } from 'src/models/globalState';
import { payloadAction } from 'src/actions/actionUtils';
import { createTopBarClass } from './OpportunityTopBar';
import { IGroupingButton } from './IGroupingButton';
import GroupingButton from './GroupingButton';
import FilterButton from './FilterButton';

export const CHANGE_REJECTED_WORKORDER_FILTER = "CHANGE_REJECTED_WORKORDER_FILTER";
export const CHANGE_REJECTED_WORKORDER_GROUPING = "CHANGE_REJECTED_WORKORDER_GROUPING";

export enum RejectedServiceAppointmentGrouping {
    TimeOfRejection,
    Technician
}

export class RejectedServiceAppointmentGroupingButtonClass extends React.Component<IGroupingButton<RejectedServiceAppointmentGrouping> & { className: string }, {}> {
    public render() {
        const options = [
            [RejectedServiceAppointmentGrouping.TimeOfRejection, 'service-appointment.field.time-of-rejection'],
            [RejectedServiceAppointmentGrouping.Technician, 'service-appointment.field.technician']
        ] as [RejectedServiceAppointmentGrouping, string][];
        return <GroupingButton {...this.props} options={options} />
    }
}

export class RejectedServiceAppointmentFilterButtonClass extends React.Component<IFilterButton<MaintenanceActivityTypeFilter> & { className: string }, {}> {
    public render() {
        const options = [
            [null, translate("generic.filter.all")],
            ...Object.keys(MaintenanceActivityTypeFilter).map(sot => 
                [MaintenanceActivityTypeFilter[sot], maintenanceActivityTypeFilterLabel(sot as MaintenanceActivityTypeFilter)] as [MaintenanceActivityTypeFilter, string]
            )
        ] as [MaintenanceActivityTypeFilter, string][];
        return <FilterButton {...this.props} options={options} />;
    }
}

const RejectedServiceAppointmentFilterButton = connect(
    (state: IGlobalState) => ({ selectedOption: state.rejectedServiceOrders.filter }),
    {
        select: payloadAction<MaintenanceActivityTypeFilter>(CHANGE_REJECTED_WORKORDER_FILTER)
    },
)(RejectedServiceAppointmentFilterButtonClass);

const RejectedServiceAppointmentGroupingButton = connect(
    (state: IGlobalState) => ({ selectedOption: state.rejectedServiceOrders.grouping }),
    {
        select: payloadAction<RejectedServiceAppointmentGrouping>(CHANGE_REJECTED_WORKORDER_GROUPING)
    },
)(RejectedServiceAppointmentGroupingButtonClass);

export const RejectedServiceAppointmentTopBar = createTopBarClass(RejectedServiceAppointmentFilterButton, RejectedServiceAppointmentGroupingButton);