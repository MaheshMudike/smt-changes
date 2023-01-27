import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';

import { LOAD_AUDITS } from '../actions/integration/auditActions';
import { LOAD_INSPECTION_POINTS, LOAD_INSPECTIONS, LOAD_REPAIRS, LOAD_SERVICE_NEEDS, CHANGE_UNPLANNED_CALLOUTS_GROUPING, LOAD_UNPLANNED_CALLOUTS, CHANGE_MBM_GROUPING, LOAD_MBM_CALLOUTS, LOAD_EQUIPMENT_CONTACTS, LOAD_EQUIPMENT_HELPDESK_CASES, LOAD_REJECTED_SERVICE_ORDERS, CHANGE_INSPECTION_POINTS_GROUPING, CHANGE_INSPECTIONS_GROUPING, CHANGE_SERVICE_NEEDS_GROUPING, CHANGE_SERVICE_NEEDS_FILTER, LOAD_REJECTED_WORK_ORDERS_NON_FSM } from '../actions/integration/calloutActions';
import { LOAD_COMPLAINTS } from '../actions/integration/complaintActions';
import { LOAD_DISCUSSIONS } from '../actions/integration/discussionActions';
import { LOAD_EQUIPMENTS, LOAD_SERVICE_VISIT_HISTORIES } from '../actions/integration/equipmentActions';
import { LOAD_QUERIES } from '../actions/integration/queryActions';
import { LOAD_TASKS } from '../actions/integration/tasks/taskActions';
import { LOAD_TENDERS } from '../actions/integration/tenderActions';
import { IGlobalState } from '../models/globalState';
import { selectableAsyncListReducerFactory, queriableAsyncListReducerFactory, asyncListReducerFactory, selectableItemReducerFactory } from '../reducers/factories/asyncActionReducerFactory';
import { composeReducers } from '../utils/composeReducers';
import adminReducer from './adminsReducer';
import authenticationReducer from './AuthenticationReducer';
import configurationReducer from './configurationReducer';
import cacheReducer from './cache';
import calendarReducer from './calendarReducer';
import feedReducer from './feedReducer';
import { mapReducer } from './mapReducer';
import { metricsReducer } from './MetricsReducer';
import modalReducer from './ModalReducer';
import offlineChangesReducer from './offlineChanges/offlineJobsReducer';
import { planCustomerVisitReducer } from './planCustomerVisitReducer';
import searchReducer from './searchReducer';
import { selectContactsDialogReducer } from './selectContactsDialogReducer';
import { sharedStateReducer } from './sharedStateReducer';
import technicianDetailsReducer from './technicianDetailsReducer';
import toastReducer from './ToastReducer';

import reportsReducer from 'src/reducers/reportsReducer';
import Audit, { AuditListItem } from '../models/audits/Audit';
import { tractionControlReducer, tractionControlReportsReducer } from './tractionControlReducer';
import { dragAndDropReducer } from './dragAndDropReducer';
import { IPayloadAction } from '../actions/actionUtils';
import { CHANGE_OPPORTUNITIES_FILTER, CHANGE_OPPORTUNITIES_GROUPING, LOAD_OPPORTUNITIES, CHANGE_OPPORTUNITIES_WITH_TENDERS_FILTER, CHANGE_OPPORTUNITIES_WITH_TENDERS_GROUPING, LOAD_OPPORTUNITIES_WITH_TENDERS, LOAD_OPPORTUNITY_CONTACTS, CHANGE_OPPORTUNITIES_OWNED_FILTER, CHANGE_OPPORTUNITIES_OWNED_GROUPING, CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_FILTER, CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_GROUPING, LOAD_OPPORTUNITIES_WITH_TENDERS_OWNED, LOAD_OPPORTUNITIES_OWNED, LOAD_OPPORTUNITIES_CUSTOMERS, CHANGE_OPPORTUNITIES_CUSTOMERS_FILTER, CHANGE_OPPORTUNITIES_CUSTOMERS_GROUPING, CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_FILTER, CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_GROUPING, LOAD_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS, CHANGE_SALES_LEADS_GROUPING, CHANGE_SALES_LEADS_FILTER, CHANGE_SALES_LEADS_CUSTOMERS_GROUPING, CHANGE_SALES_LEADS_OWNED_FILTER, CHANGE_SALES_LEADS_OWNED_GROUPING, CHANGE_SALES_LEADS_CUSTOMERS_FILTER } from '../actions/integration/opportunitiesActions';
import { CHANGE_LEADS_FILTER, CHANGE_LEADS_GROUPING, CHANGE_LEADS_OWNED_FILTER, CHANGE_LEADS_OWNED_GROUPING, CHANGE_LEADS_CUSTOMERS_FILTER, CHANGE_LEADS_CUSTOMERS_GROUPING } from '../actions/integration/leadActions';
import { payloadValueReducerFactory } from './factories/payloadValueReducerFactory';
import { OpportunityFilter } from '../models/overview/OpportunityFilter';
import { OpportunityGrouping } from '../models/overview/OpportunityGrouping';
import { ServiceOrderGrouping } from '../models/overview/CalloutGrouping';
import Callout from '../models/feed/Callout';
import Complaint from '../models/feed/Complaint';
import { writeTaskFormReducer } from './writeTask/writeTaskFormReducer';
import { searchUsersReducer } from './writeTask/searchUsersReducer';

import { LOCATION_CHANGE } from 'react-router-redux'
import * as moment from 'moment';
import { momentToSfDateTimeString } from '../actions/http/jsforceCore';
import { LOCATION_CLEAR } from '../actions/authenticationActions';
import { technicianReportReducer } from './TechnicianReportReducer';
import { serviceOrdersReportReducer } from './serviceOrdersReportReducer';

import Event from '../models/events/Event';
import Opportunity from '../models/feed/Opportunity';
import Query from '../models/feed/Query';
import Task from '../models/feed/Task';
import Tender from '../models/tenders/Tender';
import { CalloutListItem } from '../models/feed/Callout';
import { IWorkOrderForListItem, IServiceAppointmentVisitHistory, IContactAccount } from '../models/api/coreApi';
import { TOGGLE_MENU, CLOSE_MENU } from '../containers/AppBase';
import Contact, { ContactWithRole } from '../models/accounts/Contact';
import { RESET_MODEL } from '../actions/globalActions';
import { CHANGE_REPAIR_FILTER, CHANGE_REPAIR_GROUPING } from '../actions/integration/repairActions';
import { RepairFilter } from '../models/overview/RepairFilter';
import { RepairGrouping } from '../models/overview/RepairGrouping';
import HelpdeskCase from '../models/feed/HelpdeskCase';
import { LOAD_HELPDESK_CASES } from '../actions/integration/helpdeskCasesActions';
import { ServiceVisitHistory } from '../models/service/ServiceVisitHistory';
import { OPEN_KOL_APP } from '../actions/integration/accountActions';
import { ActionStatus } from '../actions/actions';
import RejectedServiceOrder, { RejectedServiceOrderListItem } from 'src/models/feed/RejectedServiceOrder';
import Equipment from 'src/models/equipment/Equipment';
import { LOAD_EVENTS } from 'src/actions/integration/events/eventActions';
import { CHANGE_REJECTED_WORKORDER_FILTER, RejectedServiceAppointmentGrouping, CHANGE_REJECTED_WORKORDER_GROUPING } from 'src/components/overview/RejectedServiceAppointmentTopBar';
import { ServiceNeedsFilter } from 'src/models/overview/ServiceNeedsFilter';
import { LOAD_LEADS_OWNED, LOAD_LEADS_CUSTOMERS, LOAD_LEADS } from 'src/actions/integration/leadActions';
import { SELECT_SALES_LEAD, SELECT_SALES_LEAD_OWNED, SELECT_SALES_LEAD_CUSTOMERS } from 'src/actions/salesLeadsActions';
import Lead from 'src/models/feed/Lead';
import { IdentifiableTitleBodyHighPriority } from 'src/models/list/IListItem';
import RejectedServiceOrderNonFSM, { RejectedWorkOrderNonFSMListItem } from 'src/models/feed/RejectedWorkOrderNonFSM';
import { CHANGE_REJECTED_WORKORDER_NON_FSM_FILTER, CHANGE_REJECTED_WORKORDER_NON_FSM_GROUPING } from 'src/components/overview/RejectedWorkOrderNonFSMTopBar';
import { LOAD_DESCRIBE, DescribeResult } from 'src/actions/integration/metadataActions';
import { LOAD_DETRACTOR_CASES } from 'src/actions/integration/detractorCasesActions';
import TransactionalSurveyCase from 'src/models/feed/TransactionalSurveyCase';
import DiscussionListItem, { Discussion } from 'src/models/audits/Discussion';
import { LeadGrouping } from 'src/models/overview/LeadGrouping';
import { LeadFilter } from 'src/models/overview/LeadFilter';

function layoutReducer(state = { menuOpen: false }, action: any) {
    switch (action.type) {
        case TOGGLE_MENU:
            return ({ ...state, menuOpen: !state.menuOpen });
        case CLOSE_MENU:
            return ({ ...state, menuOpen: false });
        default:
            return state;
    }
}

/*
interface UsageStatisticEntry {
    Type__c: string, 
    SMT_User_Info__c: string, 
    Value__c: string, 
    Timestamp__c: string
}
*/

function locationReducer(state = [] as { location: string, timestamp: string }[], action: any) {
    switch (action.type) {
        case LOCATION_CHANGE:
            const payload: { pathname: string } = action.payload;
            return [...state, { location: payload.pathname, timestamp: momentToSfDateTimeString(moment()) }];
        case LOCATION_CLEAR:
            return state.slice(action.payload);
        default: 
            return state;
    }
}

const initialKolLaunchStatus = { status: ActionStatus.SUCCESS, contact: null as IContactAccount }

export type IKolLaunchStatus = typeof initialKolLaunchStatus;

const smtReducersObject = {
    audits: combineReducers({
        grouping: () => null as any,
        list: queriableAsyncListReducerFactory<AuditListItem, Audit>(LOAD_AUDITS),
    }),

    authentication: authenticationReducer,
    cache: cacheReducer,
    calendar: calendarReducer,
    complaints: selectableAsyncListReducerFactory<Complaint>(LOAD_COMPLAINTS),
    configuration: configurationReducer,
    describes: (state = {}, action: IPayloadAction<DescribeResult>) => {
        switch (action.type) {
            case LOAD_DESCRIBE.start:
                return { ...state, [action.payload.sobject]: null };
            case LOAD_DESCRIBE.success:
                return { ...state, [action.payload.sobject]: action.payload.describe };
            default:
                return state;
        }
    },
    discussions: combineReducers({
        grouping: () => null as any,
        list: queriableAsyncListReducerFactory<DiscussionListItem, Discussion>(LOAD_DISCUSSIONS),
    }),
    dragAndDrop: dragAndDropReducer,
    equipment: selectableAsyncListReducerFactory<Equipment>(LOAD_EQUIPMENTS),
    equipmentDetails: combineReducers({
        helpdeskCases: selectableAsyncListReducerFactory<HelpdeskCase>(LOAD_EQUIPMENT_HELPDESK_CASES, true),
        contacts: selectableAsyncListReducerFactory<ContactWithRole>(LOAD_EQUIPMENT_CONTACTS, true)
    }),
    events: selectableAsyncListReducerFactory<Event>(LOAD_EVENTS),
    feed: feedReducer,
    helpdeskCases: selectableAsyncListReducerFactory<HelpdeskCase>(LOAD_HELPDESK_CASES),
    detractorCases: selectableAsyncListReducerFactory<TransactionalSurveyCase>(LOAD_DETRACTOR_CASES),

    //inspectionPoints: selectableAsyncListReducerFactory<Callout>(LOAD_INSPECTION_POINTS),
    inspectionPoints: combineReducers({
        grouping: payloadValueReducerFactory(CHANGE_INSPECTION_POINTS_GROUPING, ServiceOrderGrouping.ByDate),
        list: queriableAsyncListReducerFactory<CalloutListItem<IWorkOrderForListItem>, Callout>(LOAD_INSPECTION_POINTS),
        //list: selectableAsyncListReducerFactory<Callout>(LOAD_INSPECTION_POINTS),
    }),

    //inspections: selectableAsyncListReducerFactory<Callout>(LOAD_INSPECTIONS),
    inspections: combineReducers({
        grouping: payloadValueReducerFactory(CHANGE_INSPECTIONS_GROUPING, ServiceOrderGrouping.ByDate),
        list: queriableAsyncListReducerFactory<CalloutListItem<IWorkOrderForListItem>, Callout>(LOAD_INSPECTIONS),
        //list: selectableAsyncListReducerFactory<Callout>(LOAD_INSPECTIONS),
    }),

    layout: layoutReducer,
    locations: locationReducer,
    map: mapReducer,
    mbmCallouts: combineReducers({
        grouping: payloadValueReducerFactory(CHANGE_MBM_GROUPING, ServiceOrderGrouping.ByDate),
        list: queriableAsyncListReducerFactory<CalloutListItem<IWorkOrderForListItem>, Callout>(LOAD_MBM_CALLOUTS),
    }),
    metrics: metricsReducer,
    modal: modalReducer,
    offlineChanges: offlineChangesReducer,

    //this was put into local state
    /*
    workorderOperations: asyncListReducerFactory<WorkOrderLineItem>(QUERY_OPERATIONS),
    workorderProductsConsumed: asyncListReducerFactory<ProductConsumed>(QUERY_SPARE_PARTS),
    */

    leads: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_LEADS_FILTER, LeadFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_LEADS_GROUPING, LeadGrouping.StageName),
        list: selectableAsyncListReducerFactory<Lead>(LOAD_LEADS),
    }),
    leadsOwned: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_LEADS_OWNED_FILTER, LeadFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_LEADS_OWNED_GROUPING, LeadGrouping.StageName),
        list: selectableAsyncListReducerFactory<Lead>(LOAD_LEADS_OWNED),
    }),
    leadsCustomers: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_LEADS_CUSTOMERS_FILTER, LeadFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_LEADS_CUSTOMERS_GROUPING, LeadGrouping.StageName),
        list: selectableAsyncListReducerFactory<Lead>(LOAD_LEADS_CUSTOMERS),
    }),

    /*
    salesLeadSelected: selectableItemReducerFactory<IdentifiableTitleBodyHighPriority>(SELECT_SALES_LEAD),
    salesLeadOwnedSelected: selectableItemReducerFactory<IdentifiableTitleBodyHighPriority>(SELECT_SALES_LEAD_OWNED),
    salesLeadCustomersSelected: selectableItemReducerFactory<IdentifiableTitleBodyHighPriority>(SELECT_SALES_LEAD_CUSTOMERS),
    */

   salesLeadSelected: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_SALES_LEADS_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_SALES_LEADS_GROUPING, OpportunityGrouping.Stage),
        selectedItem: payloadValueReducerFactory<IdentifiableTitleBodyHighPriority>(SELECT_SALES_LEAD, null),
    }),
   salesLeadOwnedSelected: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_SALES_LEADS_OWNED_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_SALES_LEADS_OWNED_GROUPING, OpportunityGrouping.Stage),
        selectedItem: payloadValueReducerFactory<IdentifiableTitleBodyHighPriority>(SELECT_SALES_LEAD_OWNED, null),
    }),
   salesLeadCustomersSelected: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_SALES_LEADS_CUSTOMERS_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_SALES_LEADS_CUSTOMERS_GROUPING, OpportunityGrouping.Stage),
        selectedItem: payloadValueReducerFactory<IdentifiableTitleBodyHighPriority>(SELECT_SALES_LEAD_CUSTOMERS, null),
    }),

    opportunityContacts: asyncListReducerFactory<Contact>(LOAD_OPPORTUNITY_CONTACTS),
    opportunities: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_GROUPING, OpportunityGrouping.Stage),
        list: selectableAsyncListReducerFactory<Opportunity>(LOAD_OPPORTUNITIES),
    }),
    opportunitiesOwned: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_OWNED_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_OWNED_GROUPING, OpportunityGrouping.Stage),
        list: selectableAsyncListReducerFactory<Opportunity>(LOAD_OPPORTUNITIES_OWNED),
    }),
    opportunitiesCustomers: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_CUSTOMERS_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_CUSTOMERS_GROUPING, OpportunityGrouping.Stage),
        list: selectableAsyncListReducerFactory<Opportunity>(LOAD_OPPORTUNITIES_CUSTOMERS),
    }),
    opportunitiesWithTenders: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_WITH_TENDERS_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_WITH_TENDERS_GROUPING, OpportunityGrouping.Stage),
        list: selectableAsyncListReducerFactory<Opportunity>(LOAD_OPPORTUNITIES_WITH_TENDERS),
    }),
    opportunitiesWithTendersOwned: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_WITH_TENDERS_OWNED_GROUPING, OpportunityGrouping.Stage),
        list: selectableAsyncListReducerFactory<Opportunity>(LOAD_OPPORTUNITIES_WITH_TENDERS_OWNED),
    }),
    opportunitiesWithTendersCustomers: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_FILTER, OpportunityFilter.VARepairsAndDoors),
        grouping: payloadValueReducerFactory(CHANGE_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS_GROUPING, OpportunityGrouping.Stage),
        list: selectableAsyncListReducerFactory<Opportunity>(LOAD_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS),
    }),
    planCustomerVisit: planCustomerVisitReducer,
    queries: selectableAsyncListReducerFactory<Query>(LOAD_QUERIES),
    routing,
    //selectableAsyncListReducerFactory<ICallout>(LOAD_REPAIRS),
    repairs: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_REPAIR_FILTER, RepairFilter.PackagedServiceRepair),
        grouping: payloadValueReducerFactory<RepairGrouping | ServiceOrderGrouping>(CHANGE_REPAIR_GROUPING, RepairGrouping.None),
        list: selectableAsyncListReducerFactory<Callout>(LOAD_REPAIRS),
    }),
    reports: reportsReducer,
    search: searchReducer,
    selectContactsDialog: selectContactsDialogReducer,
    serviceNeeds: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_SERVICE_NEEDS_FILTER, ServiceNeedsFilter.All),
        grouping: payloadValueReducerFactory(CHANGE_SERVICE_NEEDS_GROUPING, ServiceOrderGrouping.ByDate),
        list: queriableAsyncListReducerFactory<CalloutListItem<IWorkOrderForListItem>, Callout>(LOAD_SERVICE_NEEDS)
    }),
    rejectedServiceOrders: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_REJECTED_WORKORDER_FILTER, null),
        grouping: payloadValueReducerFactory(CHANGE_REJECTED_WORKORDER_GROUPING, RejectedServiceAppointmentGrouping.TimeOfRejection),
        list: queriableAsyncListReducerFactory<RejectedServiceOrderListItem<any>, RejectedServiceOrder>(LOAD_REJECTED_SERVICE_ORDERS),
    }),
    rejectedWorkOrdersNonFSM: combineReducers({
        filter: payloadValueReducerFactory(CHANGE_REJECTED_WORKORDER_NON_FSM_FILTER, null),
        grouping: payloadValueReducerFactory(CHANGE_REJECTED_WORKORDER_NON_FSM_GROUPING, RejectedServiceAppointmentGrouping.TimeOfRejection),
        list: queriableAsyncListReducerFactory<RejectedWorkOrderNonFSMListItem<any>, RejectedServiceOrderNonFSM>(LOAD_REJECTED_WORK_ORDERS_NON_FSM),
    }),
    serviceOrdersReport: serviceOrdersReportReducer,
    serviceVisitHistory: selectableAsyncListReducerFactory<ServiceVisitHistory>(LOAD_SERVICE_VISIT_HISTORIES),
    sharedState: sharedStateReducer,
    tasks: selectableAsyncListReducerFactory<Task>(LOAD_TASKS),
    technicianDetails: technicianDetailsReducer,
    technicianReport: technicianReportReducer,
    tenders: selectableAsyncListReducerFactory<Tender>(LOAD_TENDERS),
    toasts: toastReducer,
    unplannedCallouts: combineReducers({
        grouping: payloadValueReducerFactory(CHANGE_UNPLANNED_CALLOUTS_GROUPING, ServiceOrderGrouping.ByDate),
        list: queriableAsyncListReducerFactory<CalloutListItem<IWorkOrderForListItem>, Callout>(LOAD_UNPLANNED_CALLOUTS),
    }),
    tractionControlReportVA: tractionControlReducer,
    tractionControlReportVC: tractionControlReducer,

    tractionControlReports: tractionControlReportsReducer,    

    writeTask: combineReducers({
        form: writeTaskFormReducer,
        searchUsers: searchUsersReducer,
    }),

    kolLaunchStatus: (state = initialKolLaunchStatus, action: IPayloadAction<IContactAccount>): IKolLaunchStatus => {
        switch (action.type) {
            case OPEN_KOL_APP.start:
                return { status: ActionStatus.START, contact: action.payload };
            case OPEN_KOL_APP.failure:
                return { ...state, status: ActionStatus.FAILURE };
            case OPEN_KOL_APP.success:
                return { status: ActionStatus.SUCCESS, contact: action.payload };
        }
        return state;
    },
    admin: adminReducer
}

function globalReducer(previousState: IGlobalState, action: IPayloadAction<any>): IGlobalState {
    switch (action.type) {
        case RESET_MODEL:
            return { routing: previousState.routing } as IGlobalState;
        default:
            return previousState;
    }
}

const smtAndAdminReducers = composeReducers<IGlobalState, any>(
    null,
    globalReducer,
    combineReducers<IGlobalState>(smtReducersObject)
)


export const rootReducer = smtAndAdminReducers;