import { IPayloadAction } from "../actions/actionUtils";
import { ActionStatus } from "../actions/actions";
import { LOAD_TECHNICIAN_REPORT, SET_UOM_TECHNICIAN_REPORT, SORT_TECHNICIAN_REPORT, FILTER_TECHNICIAN_REPORT } from "../actions/integration/technicianReportActions";
import { TechnicianTechnicianReport } from "../models/technicians/Technician";

export enum UnitOfMeasure {
    Imperial = 'Imperial',
    Metric = 'Metric'
}

export enum UnitOfLength {
    km = 'km',
    mile = 'mile'
}

export enum SortOrder {
    Ascending = 'Ascending',
    Descending = 'Descending'
}

export function invertSortOrder(sortOrder: SortOrder) {
    return sortOrder == SortOrder.Ascending ? SortOrder.Descending : SortOrder.Ascending;
}

const defaultTechnicianReport = {
    technicians: [] as TechnicianTechnicianReport[],
    sortBy: 'fullName',
    sortOrder: SortOrder.Ascending,
    filterTechnicianWithDifferences: false,
    //unitOfMeasure: UnitOfMeasure.Metric,
    actionStatus: ActionStatus.SUCCESS
}

export type ITechnicianReport = typeof defaultTechnicianReport;


export function technicianReportReducer(state = defaultTechnicianReport, action: IPayloadAction<any>): ITechnicianReport {
    switch (action.type) {

        case LOAD_TECHNICIAN_REPORT.start: return { ...state, actionStatus: ActionStatus.START };
        case LOAD_TECHNICIAN_REPORT.success: return { ...state, technicians: action.payload, actionStatus: ActionStatus.SUCCESS };
        case LOAD_TECHNICIAN_REPORT.failure: return { ...state, actionStatus: ActionStatus.FAILURE };
        //case SET_UOM_TECHNICIAN_REPORT: return { ...state, unitOfMeasure: action.payload };
        case SORT_TECHNICIAN_REPORT: {            
            return { ...state, sortBy: action.payload, sortOrder: action.payload != state.sortBy ? SortOrder.Ascending : invertSortOrder(state.sortOrder) };
        };
        case FILTER_TECHNICIAN_REPORT: {
            return { ...state, sortBy: action.payload, filterTechnicianWithDifferences: action.payload };
        };
        default: return state;
    }
}

