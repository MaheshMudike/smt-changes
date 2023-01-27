import { IPayloadAction } from '../actions/actionUtils';
import { LOAD_METRICS_RESET, LOAD_METRICS_KFF, LOAD_METRICS_WORKORDERS, LOAD_METRICS_OTHER } from '../actions/integration/metricsActions';
import { IMetric } from '../models/metrics/IMetric';

export const defaultIMetricsState: IMetric = {
    closedThisMonth: 0,
    fraction: 0,
    open: -1
}

export const defaultIMetricsStateNoProgressbar: IMetric = {
    closedThisMonth: 0,
    fraction: null as number,
    open: -1
}

const defaultIMetricsNumber = -1;

const defaultWorkorderMetricsState = {
    inspectionPoints: defaultIMetricsStateNoProgressbar,
    inspections: defaultIMetricsStateNoProgressbar,
    mbm: defaultIMetricsState,
    openRepairs: defaultIMetricsStateNoProgressbar,
    serviceNeeds: defaultIMetricsStateNoProgressbar,
    callouts: defaultIMetricsStateNoProgressbar,
    rejectedWorkOrdersNonFSM: defaultIMetricsNumber,
};

export type IApiServiceOrderMetrics = typeof defaultWorkorderMetricsState;    

const defaultOpportunityMetricsState = {
    opportunitiesWithTenders: defaultIMetricsState,
    opportunities: defaultIMetricsState,
    opportunitiesOwned: defaultIMetricsState,
    opportunitiesWithTendersOwned: defaultIMetricsState,
    opportunitiesCustomers: defaultIMetricsState,
    opportunitiesWithTendersCustomers: defaultIMetricsState
}

export type IApiOpportunityMetrics = typeof defaultOpportunityMetricsState;

const defaultKffMetrics = {
    audit: defaultIMetricsState,
    discussion: defaultIMetricsState,
}

const defaultOtherMetrics = {
    stoppedEquipments: defaultIMetricsNumber,
    tasks: defaultIMetricsState,
    helpdeskCases: defaultIMetricsState,
    detractorCases: defaultIMetricsState,
    queries: defaultIMetricsState,
    complaints: defaultIMetricsState,
    leadMetrics: {
        leads: defaultIMetricsState,
        leadsOwned: defaultIMetricsState,
        leadsCustomers: defaultIMetricsState,
    },
    opportunityMetrics: defaultOpportunityMetricsState,
    events: defaultIMetricsState,
    
    submittedTimesheets: defaultIMetricsNumber,
    rejectedServiceAppointments: defaultIMetricsNumber,
    /*
    tenders: defaultIMetricsState,
    tendersByEquipment:defaultIMetricsState,
    */
}

const defaultWorkorderMetrics = {
    workOrdersMetrics: defaultWorkorderMetricsState,
}

const defaultMetrics = { ...defaultOtherMetrics, ...defaultWorkorderMetrics, ...defaultKffMetrics }

export type IMetricSetWorkOrders = typeof defaultWorkorderMetrics;
export type IMetricSetOthers = typeof defaultOtherMetrics;
export type IMetricSetKff = typeof defaultKffMetrics;
export type IMetricSet = typeof defaultMetrics;

export const defaultMetricsState = {
    
    data: defaultMetrics,
    //isProcessing: false,

    isProcessingKff: false,
    isProcessingWorkorders: false,
    isProcessingOther: false
};

export type MetricState = typeof defaultMetricsState;

export function metricsReducer(state = defaultMetricsState, action: IPayloadAction<IMetricSet>): MetricState {
    switch (action.type) {
        case LOAD_METRICS_RESET: return { ...defaultMetricsState }

        case LOAD_METRICS_KFF.start: return { ...state, isProcessingKff: true }
        case LOAD_METRICS_KFF.success: return { ...state, data: { ...defaultMetricsState.data, ...state.data, ...action.payload }, isProcessingKff: false };
        case LOAD_METRICS_KFF.failure: return { ...state, isProcessingKff: false };

        case LOAD_METRICS_WORKORDERS.start: return { ...state, isProcessingWorkorders: true }
        case LOAD_METRICS_WORKORDERS.success: return { ...state, data: { ...defaultMetricsState.data, ...state.data, ...action.payload }, isProcessingWorkorders: false };
        case LOAD_METRICS_WORKORDERS.failure: return { ...state, isProcessingWorkorders: false };

        case LOAD_METRICS_OTHER.start: return { ...state, isProcessingOther: true }
        case LOAD_METRICS_OTHER.success: return { ...state, data: { ...defaultMetricsState.data, ...state.data, ...action.payload }, isProcessingOther: false };
        case LOAD_METRICS_OTHER.failure: return { ...state, isProcessingOther: false };

        default: return state;
    }
}
