import { connect } from 'react-redux';
import { IGlobalState } from 'src/models/globalState';
import { payloadAction } from 'src/actions/actionUtils';
import { MaintenanceActivityTypeFilter } from 'src/constants/ServiceOrderType';
import { createTopBarClass } from './OpportunityTopBar';
import { RejectedServiceAppointmentGrouping, RejectedServiceAppointmentFilterButtonClass, RejectedServiceAppointmentGroupingButtonClass } from './RejectedServiceAppointmentTopBar';

export const CHANGE_REJECTED_WORKORDER_NON_FSM_FILTER = "CHANGE_REJECTED_WORKORDER_NON_FSM_FILTER";
export const CHANGE_REJECTED_WORKORDER_NON_FSM_GROUPING = "CHANGE_REJECTED_WORKORDER_NON_FSM_GROUPING";

const RejectedWorkorderFilterButton = connect(
    (state: IGlobalState) => ({ selectedOption: state.rejectedWorkOrdersNonFSM.filter }),
    {
        select: payloadAction<MaintenanceActivityTypeFilter>(CHANGE_REJECTED_WORKORDER_NON_FSM_FILTER)
    },
)(RejectedServiceAppointmentFilterButtonClass);

const RejectedWorkorderGroupingButton = connect(
    (state: IGlobalState) => ({ selectedOption: state.rejectedWorkOrdersNonFSM.grouping }),
    {
        select: payloadAction<RejectedServiceAppointmentGrouping>(CHANGE_REJECTED_WORKORDER_NON_FSM_GROUPING)
    },
)(RejectedServiceAppointmentGroupingButtonClass);

export const RejectedWorkOrderNonFSMTopBar = createTopBarClass(RejectedWorkorderFilterButton, RejectedWorkorderGroupingButton);