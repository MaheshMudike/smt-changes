import { paths } from '../../config/paths';
import { SvgIcon } from '../../constants/SvgIcon';
import { Tile, TileVisibility } from './tile';

const mbms = new Tile(null, SvgIcon.Salesforce, 'overview-page.operations-overview.mbm-left-this-month', paths.MBM_LEFT_THIS_MONTH, m => m.workOrdersMetrics.mbm, TileVisibility.ALL, false);
const equipment = new Tile(null, SvgIcon.Salesforce, 'overview-page.operations-overview.stopped-equipment', paths.EQUIPMENT, m => m.stoppedEquipments, TileVisibility.ALL, false);
const audits = new Tile('fieldAudits', SvgIcon.Kff, 'overview-page.operations-overview.field-audits', paths.AUDIT, m => m.audit, TileVisibility.ALL, false);
const callouts = new Tile(null, SvgIcon.Salesforce, 'overview-page.operations-overview.open-unplanned-jobs', paths.OPEN_UNPLANNED_JOBS, m => m.workOrdersMetrics.callouts, TileVisibility.ALL, false);
const timeSheets = new Tile('timesheet', SvgIcon.Salesforce, 'overview-page.operations-overview.open-timesheets-to-be-approved', '${ connection.instanceUrl }/apex/FSM_TimesheetApproval_STView?id=${ ServiceTerritoryId }', m => m.submittedTimesheets, TileVisibility.FSM, true);
const monthlyDiscussions = new Tile('fieldAudits', SvgIcon.Kff, 'overview-page.operations-overview.monthly-discussions', paths.MONTHLY_DISCUSSIONS, m => m.discussion, TileVisibility.ALL, false);
const repairs = new Tile('repairs', SvgIcon.Salesforce, 'overview-page.operations-overview.open-repairs', paths.REPAIRS, m => m.workOrdersMetrics.openRepairs, TileVisibility.ALL, false);
const inspections = new Tile('inspections', SvgIcon.Salesforce, 'overview-page.operations-overview.inspections', paths.INSPECTIONS, m => m.workOrdersMetrics.inspections, TileVisibility.ALL, false);
const inspectionPoints = new Tile('inspectionPoints', SvgIcon.Salesforce, 'overview-page.operations-overview.inspection-points', paths.INSPECTION_POINTS, m => m.workOrdersMetrics.inspectionPoints, TileVisibility.ALL, false);
const serviceNeeds = new Tile('serviceNeeds', SvgIcon.Salesforce, 'overview-page.operations-overview.service-needs', paths.SERVICE_NEEDS, m => m.workOrdersMetrics.serviceNeeds, TileVisibility.ALL, false);
const rejectedWorkOrders = new Tile('rejectedWorkOrders', SvgIcon.Salesforce, 'overview-page.operations-overview.rejected-service-appointments', paths.REJECTED_SERVICE_APPOINTMENTS, m => m.rejectedServiceAppointments, TileVisibility.FSM, false);
const rejectedWorkOrdersNonFSM = new Tile('rejectedWorkOrders', SvgIcon.Salesforce, 'overview-page.operations-overview.rejected-work-orders', paths.REJECTED_WORK_ORDERS_NON_FSM, m => m.workOrdersMetrics.rejectedWorkOrdersNonFSM, TileVisibility.NON_FSM, false);

const tasks = new Tile(null, SvgIcon.Salesforce, 'overview-page.customer-overview.open-tasks', paths.TASKS, m => m.tasks, TileVisibility.ALL, false)
const complaints = new Tile('complaints', SvgIcon.Salesforce, 'overview-page.customer-overview.open-complaints', paths.COMPLAINTS, m => m.complaints, TileVisibility.ALL, false)
const queries = new Tile('queries', SvgIcon.Salesforce, 'overview-page.customer-overview.open-queries', paths.QUERIES, m => m.queries, TileVisibility.ALL, false)
const technicalHelpdeskCases = new Tile('helpdeskCases', SvgIcon.Salesforce, 'Overview-page.customer-overview.technical-helpdesk-cases', paths.TECHNICAL_HELPDESK_CASES, m => m.helpdeskCases, TileVisibility.ALL, false)
const detractorCases = new Tile('detractorCases', SvgIcon.Salesforce, 'overview-page.customer-overview.detractor-cases', paths.DETRACTOR_CASES, m => m.detractorCases, TileVisibility.ALL, false)

const leads = new Tile('leads', SvgIcon.Salesforce, 'overview-page.customer-overview.open-leads', paths.LEADS, m => m.leadMetrics.leads, TileVisibility.ALL, false)
const leadsOwned = new Tile('leads', SvgIcon.Salesforce, 'overview-page.customer-overview.open-leads-owned', paths.LEADS_OWNED, m => m.leadMetrics.leadsOwned, TileVisibility.ALL, false)
const leadsCustomers = new Tile('leads', SvgIcon.Salesforce, 'overview-page.customer-overview.open-leads-customers', paths.LEADS_CUSTOMERS, m => m.leadMetrics.leadsCustomers, TileVisibility.ALL, false)

const opportunitiesWithoutTenders = new Tile('opportunities', SvgIcon.Salesforce, 'overview-page.customer-overview.open-opportunities', paths.OPPORTUNITIES, m => m.opportunityMetrics.opportunities, TileVisibility.ALL, false)
const opportunitiesWithTenders = new Tile('opportunities', SvgIcon.Salesforce, 'overview-page.customer-overview.opportunities-with-tenders', paths.OPPORTUNITIES_WITH_TENDERS, m => m.opportunityMetrics.opportunitiesWithTenders, TileVisibility.ALL, false)
const opportunitiesWithoutTendersOwned = new Tile('opportunities', SvgIcon.Salesforce, 'overview-page.customer-overview.open-opportunities-owned', paths.OPPORTUNITIES_OWNED, m => m.opportunityMetrics.opportunitiesOwned, TileVisibility.ALL, false)
const opportunitiesWithTendersOwned = new Tile('opportunities', SvgIcon.Salesforce, 'overview-page.customer-overview.opportunities-with-tenders-owned', paths.OPPORTUNITIES_WITH_TENDERS_OWNED, m => m.opportunityMetrics.opportunitiesWithTendersOwned, TileVisibility.ALL, false)
const opportunitiesWithoutTendersCustomers = new Tile('opportunities', SvgIcon.Salesforce, 'overview-page.customer-overview.open-opportunities-customers', paths.OPPORTUNITIES_CUSTOMERS, m => m.opportunityMetrics.opportunitiesCustomers, TileVisibility.ALL, false)
const opportunitiesWithTendersCustomers = new Tile('opportunities', SvgIcon.Salesforce, 'overview-page.customer-overview.opportunities-with-tenders-customers', paths.OPPORTUNITIES_WITH_TENDERS_CUSTOMERS, m => m.opportunityMetrics.opportunitiesWithTendersCustomers, TileVisibility.ALL, false)
const customerVisits = new Tile(null, SvgIcon.Calendar, 'overview-page.customer-overview.customer-visits', paths.CUSTOMER_VISITS, m => m.events, TileVisibility.ALL, false)

/* decided to be removed, meeting from 15.0
new Tile(SvgIcon.Salesforce, 'overview-page.customer-overview.open-supervisor-tenders', paths.TENDERS, m => m.tenders)
new Tile(SvgIcon.Salesforce, 'overview-page.customer-overview.open-planner-group-tenders', paths.TENDERS_BY_EQUIPMENTS, m => m.tendersByEquipment)
*/

/* tiles before sales leads update
export const customerTiles = [tasks, complaints, leads, queries, opportunitiesWithoutTenders, opportunitiesWithTenders, customerVisits, technicalHelpdeskCases];
export const operationsTiles = [mbms, equipment, audits, callouts, timeSheets, monthlyDiscussions, repairs, inspections, inspectionPoints, serviceNeeds, rejectedWorkOrders];

export const myOpenActivitiesTiles = [customerVisits, complaints, queries, leads, opportunitiesWithoutTendersOwned, opportunitiesWithTendersOwned, 
    audits, monthlyDiscussions, timeSheets, tasks];
export const myCustomersOpenActivitiesTiles = [leads, opportunitiesWithoutTendersCustomers, opportunitiesWithTendersCustomers];
export const myTechnicianOpenActivitiesTiles = [equipment, callouts, mbms, repairs, inspections, inspectionPoints, serviceNeeds, rejectedWorkOrders, technicalHelpdeskCases];
*/

export const customerTiles = [tasks, complaints, queries, customerVisits, technicalHelpdeskCases, detractorCases];
export const operationsTiles = [mbms, audits, monthlyDiscussions, callouts, equipment, timeSheets, inspections, inspectionPoints, serviceNeeds, rejectedWorkOrders, rejectedWorkOrdersNonFSM];
export const salesTiles = [leads, opportunitiesWithoutTenders, opportunitiesWithTenders, repairs];

export const myOpenActivitiesTiles = [customerVisits, complaints, queries, leadsOwned, opportunitiesWithoutTendersOwned, opportunitiesWithTendersOwned, audits, monthlyDiscussions, timeSheets, tasks, detractorCases];
export const myCustomersOpenActivitiesTiles = [leadsCustomers, opportunitiesWithoutTendersCustomers, opportunitiesWithTendersCustomers];
export const myTechnicianOpenActivitiesTiles = [equipment, callouts, mbms, repairs, inspections, inspectionPoints, serviceNeeds, rejectedWorkOrders, rejectedWorkOrdersNonFSM, technicalHelpdeskCases];



export const allTiles = [mbms, equipment, audits, callouts, timeSheets, monthlyDiscussions, repairs, inspections, inspectionPoints, 
    serviceNeeds, rejectedWorkOrders, rejectedWorkOrdersNonFSM, tasks, complaints, queries, 
    opportunitiesWithoutTenders, opportunitiesWithTenders, 
    opportunitiesWithoutTendersOwned, opportunitiesWithTendersOwned,
    opportunitiesWithoutTendersCustomers, opportunitiesWithTendersCustomers,
    leads, leadsOwned, leadsCustomers,
    customerVisits, technicalHelpdeskCases, detractorCases];

