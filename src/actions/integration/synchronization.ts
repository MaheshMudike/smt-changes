import * as _ from 'lodash';
import { paths } from '../../config/paths';
import { downloadMapItems, updateObsoleteMapDataToastVisibility } from '../mapActions';
import { downloadAudits } from './auditActions';
import { downloadInspectionPoints, downloadInspections, downloadMbmCallouts, downloadRepairs, downloadServiceNeeds, downloadUnplannedCallouts, downloadRejectedServiceAppointments, downloadRejectedWorkOrdersNonFSM, LOAD_UNPLANNED_CALLOUTS, LOAD_MBM_CALLOUTS, LOAD_REPAIRS, LOAD_SERVICE_NEEDS, LOAD_INSPECTION_POINTS, LOAD_INSPECTIONS } from './calloutActions';
import { downloadComplaints } from './complaintActions';
import { downloadDiscussions } from './discussionActions';
import { downloadStoppedEquipments } from './equipmentActions';
import { downloadEvents, refreshCachedEvents } from './events/eventActions';
import { reloadFeed } from './feedActions';
import { downloadMetrics } from './metricsActions';
import { downloadOpportunities, downloadOpportunitiesWithTenders, downloadOpportunitiesOwned, downloadOpportunitiesWithTendersOwned, downloadOpportunitiesCustomers, downloadOpportunitiesWithTendersCustomers } from './opportunitiesActions';
import { downloadQueries } from './queryActions';
import { downloadTasks } from './tasks/taskActions';
import { TractionControlReportType } from '../http/jsforce';
import { downloadTractionControlReport, queryTractionControlReports } from '../tractionControlActions';
import { getOfflineAccounts } from '../cache/accountActions';
import { ThunkAction } from '../thunks';
import { queryServiceOrdersReport } from './serviceOrdersReportActions';
import { queryTechnicianReport } from './technicianReportActions';
import { queryHelpdeskCases } from './helpdeskCasesActions';
import { downloadSalesLeads, downloadSalesLeadsOwned, downloadSalesLeadsCustomers } from '../salesLeadsActions';
import { IItemsQueryStateAsyncActionNames } from '../actionUtils';
import { IGlobalState } from 'src/models/globalState';
import { selectQueriableItemAction } from '../http/httpActions';
import { reloadSearchItem } from '../searchActions';
import { queryDetractorCases } from './detractorCasesActions';
import { queryLeads, queryLeadsOwned, queryLeadsCustomers } from './leadActions';

type Sync = [string, ThunkAction<any>];

export const synchronizeMap = (): ThunkAction<void> => (dispatch, getState) =>  {
    dispatch(downloadMapItems());
    dispatch(updateObsoleteMapDataToastVisibility(false));
}

const overviewListSynch = <TItem extends { queryDetails: () => Promise<TDetail> }, TDetail extends TItem>(
    listAction: ThunkAction<void>,
    selectedItem: (state: IGlobalState) => TItem,
    action: IItemsQueryStateAsyncActionNames
): ThunkAction<any> => (dispatch, getState) => {
    dispatch(listAction);
    const item = selectedItem(getState());
    if(item != null) dispatch(selectQueriableItemAction(item, action));
}

const pageSpecificSynchronizations: Sync[] = [
    [paths.LOCATE, synchronizeMap()],
    [paths.OPEN_UNPLANNED_JOBS, overviewListSynch(downloadUnplannedCallouts, state => state.unplannedCallouts.list.selectedItem, LOAD_UNPLANNED_CALLOUTS)],
    [paths.EQUIPMENT, downloadStoppedEquipments()],
    [paths.MBM_LEFT_THIS_MONTH, 
        overviewListSynch(downloadMbmCallouts, state => state.mbmCallouts.list.selectedItem, LOAD_MBM_CALLOUTS)],
    [paths.QUERIES, downloadQueries()],

    [paths.LEADS, queryLeads],
    [paths.LEADS_OWNED, queryLeadsOwned],
    [paths.LEADS_CUSTOMERS, queryLeadsCustomers],

    [paths.OPPORTUNITIES, downloadOpportunities],
    [paths.OPPORTUNITIES_WITH_TENDERS, downloadOpportunitiesWithTenders],
    [paths.OPPORTUNITIES_OWNED, downloadOpportunitiesOwned],
    [paths.OPPORTUNITIES_WITH_TENDERS_OWNED, downloadOpportunitiesWithTendersOwned],
    [paths.OPPORTUNITIES_CUSTOMERS, downloadOpportunitiesCustomers],
    [paths.OPPORTUNITIES_WITH_TENDERS_CUSTOMERS, downloadOpportunitiesWithTendersCustomers],

    [paths.SALES_LEADS, downloadSalesLeads],
    [paths.SALES_LEADS_OWNED, downloadSalesLeadsOwned],
    [paths.SALES_LEADS_CUSTOMERS, downloadSalesLeadsCustomers],

    [paths.TASKS, downloadTasks()],
    [paths.COMPLAINTS, downloadComplaints()],
    [paths.CUSTOMER_VISITS, downloadEvents()],    
    [paths.TECHNICAL_HELPDESK_CASES, queryHelpdeskCases()],
    [paths.DETRACTOR_CASES, queryDetractorCases()],
    /*
    [paths.TENDERS, downloadTenders(false, false)],
    [paths.TENDERS_BY_EQUIPMENTS, downloadTenders(false, true)],
    */
    [paths.AUDIT, downloadAudits()],
    [paths.MONTHLY_DISCUSSIONS, downloadDiscussions()],
    [paths.REPAIRS, downloadRepairs],
    [paths.INSPECTIONS, overviewListSynch(downloadInspections, state => state.inspections.list.selectedItem, LOAD_INSPECTIONS)],
    [paths.INSPECTION_POINTS, overviewListSynch(downloadInspectionPoints, state => state.inspectionPoints.list.selectedItem, LOAD_INSPECTION_POINTS)],
    [paths.REJECTED_SERVICE_APPOINTMENTS, downloadRejectedServiceAppointments],
    [paths.REJECTED_WORK_ORDERS_NON_FSM, downloadRejectedWorkOrdersNonFSM],
    [paths.SERVICE_NEEDS, overviewListSynch(downloadServiceNeeds, state => state.serviceNeeds.list.selectedItem, LOAD_SERVICE_NEEDS)],
    [paths.SERVICE_ORDERS_REPORT, queryServiceOrdersReport()],
    [paths.TECHNICIAN_REPORT, queryTechnicianReport()],
    [paths.TRACTION_CONTROL_REPORTS, queryTractionControlReports()],
    [paths.TRACTION_CONTROL_REPORT_VA, downloadTractionControlReport(TractionControlReportType.VA)],
    [paths.TRACTION_CONTROL_REPORT_VC, downloadTractionControlReport(TractionControlReportType.VC)],

    [paths.SEARCH, reloadSearchItem]
];

const isForCurrentPage = (currentHash: string) => (sync: Sync) => {
    return sync[0] === currentHash;    
};

export const synchronizeCurrentPage = (): ThunkAction<void> => (dispatch, getState) => {
    const path = getState().routing.location.pathname;
    const pageSpecificSynchronization = _.find(pageSpecificSynchronizations, isForCurrentPage(path));
    if(pageSpecificSynchronization != null) dispatch(pageSpecificSynchronization[1]);
};

export const synchronize = (skipExpensiveSyncsOrMap = false): ThunkAction<void> => (dispatch, getState) => {
    dispatch(reloadFeed);
    dispatch(downloadMetrics);
    dispatch(refreshCachedEvents);

    const path = getState().routing.location.pathname;
    if (!skipExpensiveSyncsOrMap || path !== paths.LOCATE) dispatch(synchronizeCurrentPage());
    //this is else
    if (skipExpensiveSyncsOrMap && path === paths.LOCATE) dispatch(updateObsoleteMapDataToastVisibility(true));

    if (!skipExpensiveSyncsOrMap) dispatch(getOfflineAccounts());
};
