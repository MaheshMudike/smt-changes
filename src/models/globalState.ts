import { RouterState } from 'react-router-redux';

import Audit, { AuditListItem } from './audits/Audit';
import { ICalendarState, ITimeSpan } from './events/calendarState';
import Event from './events/Event';
import Callout from './feed/Callout';
import Complaint from './feed/Complaint';
import Opportunity from './feed/Opportunity';
import Query from './feed/Query';
import { FeedState } from './feed/state';
import { IFullyConfigurableItemsState, ISelectableItemsState, IConfigurableGroupingItemsQueriableState, IItemsState, IConfigurableGroupingFilterItemsQueriableState, ISelectedItemState, ISelectedFilterGroupingItemState, IQueriableItemsState } from './IItemsState';
import { IMapState } from './map/state';
import { IModalDefinition } from './modals/state';
import { IOfflineChangeJob } from './offlineChanges/IOfflineChanges';
import { ServiceOrderGrouping } from './overview/CalloutGrouping';
import { OpportunityFilter } from './overview/OpportunityFilter';
import { OpportunityGrouping } from './overview/OpportunityGrouping';
import { IPlanCustomerVisitState } from './plan/IPlanCustomerVisitState';
import { ISelectContactsDialogState } from './plan/ISelectContactsDialogState';
import { ISearchState } from './search/state';
import { WriteTaskState } from './tasks/writeTaskState';
import { ITechnicianDetails } from './technicianDetails/ITechnicianDetails';
import Tender from './tenders/Tender';
import { Toast } from './toasts';
import { IAccountReportPayload } from 'src/models/api/reports/accountReportApi';
import { ISalesOrganizationConfigurationState } from './configuration';
import { MetricState } from '../reducers/MetricsReducer';
import { IActionStatus } from '../actions/actions';
import { ITractionControlReportState, ITractionControlReports } from '../reducers/tractionControlReducer';
import { IDragAndDropState } from '../reducers/dragAndDropReducer';
import Task from './feed/Task';
import { ITechnicianReport } from '../reducers/TechnicianReportReducer';
import { IServiceOrdersReport } from '../reducers/serviceOrdersReportReducer';
import { CalloutListItem } from './feed/Callout';
import { IWorkOrderForListItem } from './api/coreApi';
import { RepairFilter } from './overview/RepairFilter';
import { RepairGrouping } from './overview/RepairGrouping';
import HelpdeskCase from './feed/HelpdeskCase';
import { ServiceVisitHistory } from './service/ServiceVisitHistory';
import { IKolLaunchStatus } from '../reducers';
import RejectedServiceOrder, { RejectedServiceOrderListItem } from './feed/RejectedServiceOrder';
import Equipment, { UnitOfMeasure } from './equipment/Equipment';
import { DescribeSObjectResult } from 'jsforce';
import { AccountWithContacts } from './accounts/AccountWithContacts';
import { UserBase } from './user/User';
import { CompanySettings } from './admin/CompanySettings';
import ICompany from './ICompany';
import { AdminType } from './user/UserRole';
import { IAuthenticationState } from 'src/reducers/AuthenticationReducer';
import Contact, { ContactWithRole } from './accounts/Contact';
import { MaintenanceActivityTypeFilter } from 'src/constants/ServiceOrderType';
import { RejectedServiceAppointmentGrouping } from 'src/components/overview/RejectedServiceAppointmentTopBar';
import { ServiceNeedsFilter } from './overview/ServiceNeedsFilter';
import Lead from './feed/Lead';
import { IdentifiableTitleBodyHighPriority } from './list/IListItem';
import RejectedServiceOrderNonFSM, { RejectedWorkOrderNonFSMListItem } from './feed/RejectedWorkOrderNonFSM';
import { FitterLocation } from './api/mapApi';
import * as _  from 'lodash';
import TransactionalSurveyCase from './feed/TransactionalSurveyCase';
import DiscussionListItem, { Discussion } from './audits/Discussion';
import { LeadGrouping } from './overview/LeadGrouping';
import { LeadFilter } from './overview/LeadFilter';



export function userId(state: IGlobalState) { return state.authentication.currentUser && state.authentication.currentUser.id; }
export function userIdFromState(state: IGlobalState) { return state.authentication.currentUser && state.authentication.currentUser.id; }
export function localeFromState(state: IGlobalState) { return state.authentication.currentUser && state.authentication.currentUser.locale; }
export function activeInFSMFromState(state: IGlobalState) { return state.authentication.currentPlannerGroup && state.authentication.currentPlannerGroup.activeInFSM; }

export function serviceResourceEnabledFromState(state: IGlobalState) {
    const plannerGroup = plannerGroupFromState(state);
    const plannerGroupServiceResourceEnabled = plannerGroup != null && state.configuration && 
        _.some(state.configuration.serviceResourceEnabledPlannerGroups, s => s === plannerGroup.branchCode || s === 'ALL');
    return plannerGroupServiceResourceEnabled;
}

export function fitterLocationEnabledFromState(state: IGlobalState) {
    return fitterLocationEnabledType(state.configuration.fitterLocation, state.authentication.currentUser.gpsPermissionSet);
}

export function fitterLocationEnabledType(fitterLocation: FitterLocation, gpsPermissionSet: boolean) {
    return (fitterLocation === FitterLocation.GPS && gpsPermissionSet || fitterLocation === FitterLocation.SO);
}

export function uomFromState(state: IGlobalState): UnitOfMeasure {
    const uom = state.configuration.unitOfMeasure;
    return uom === UnitOfMeasure.Imperial || uom === UnitOfMeasure.Metric ? uom as UnitOfMeasure : UnitOfMeasure.Metric;
}

export function plannerGroupId(state: IGlobalState) { 
    return state.authentication.currentPlannerGroup == null ? null : state.authentication.currentPlannerGroup.id; 
}

export function plannerGroupIdFromState(state: IGlobalState) { 
    return state.authentication.currentPlannerGroup == null ? null : state.authentication.currentPlannerGroup.id; 
}

export function plannerGroupFromState(state: IGlobalState) { 
    return state.authentication.currentPlannerGroup == null ? null : state.authentication.currentPlannerGroup; 
}

export interface IAdminCompanySettingsState {
    companySettings: CompanySettings[];
}

export interface ICreateAdminAssignmentState {
    users: UserBase[];
    companies: ICompany[];
    current: {
        adminType?: AdminType;
        user?: UserBase;
        company?: ICompany;
    };
}

export interface IAdminUserManagementState {
    users: UserBase[];
    filters: IAdminUserManagementFilters;
}

export interface IAdminUserManagementFilters {
    company?: ICompany;
    adminType?: AdminType;
    username?: string;
}

export interface IEventsCacheRange {
    range: ITimeSpan;
}

export interface IGlobalState {
    //audits: ISelectableItemsState<Audit>;
    audits: IConfigurableGroupingItemsQueriableState<AuditListItem, Audit, any>;
    admin: {
        userManagementsState: IAdminUserManagementState;
        createAdminAssignmentState: ICreateAdminAssignmentState;
        companySettingsState: IAdminCompanySettingsState;
    };
    authentication: IAuthenticationState;
    cache: {
        events: ISelectableItemsState<Event>;
        eventsRange: IEventsCacheRange;
        offlineAccounts: ISelectableItemsState<AccountWithContacts>;
        offlineAccountsSearchPhrase: string;
    };
    calendar: ICalendarState;
    complaints: ISelectableItemsState<Complaint>;
    configuration: ISalesOrganizationConfigurationState;
    describes: _.Dictionary<DescribeSObjectResult>;
    //discussions: ISelectableItemsState<Audit>;
    discussions: IConfigurableGroupingItemsQueriableState<DiscussionListItem, Discussion, any>;
    dragAndDrop: IDragAndDropState;
    equipment: ISelectableItemsState<Equipment>;
    events: ISelectableItemsState<Event>;
    feed: FeedState;
    helpdeskCases: ISelectableItemsState<HelpdeskCase>;
    detractorCases: ISelectableItemsState<TransactionalSurveyCase>;
    layout: { menuOpen: boolean };
    locations: { location: string, timestamp: string }[];
    map: IMapState;
    mbmCallouts: IConfigurableGroupingItemsQueriableState<CalloutListItem<IWorkOrderForListItem>, Callout, ServiceOrderGrouping>;
    metrics: MetricState;	
    modal: IModalDefinition<any>[];	
    offlineChanges: {
        jobs: IOfflineChangeJob[];
    };

    /*
    workorderOperations: IItemsState<ProductConsumed>;
    workorderProductsConsumed: IItemsState<WorkOrderLineItem>;
    */

    opportunityContacts: IItemsState<Contact>;
    //opportunityContactsWithRole: ISelectableItemsState<ContactWithRole>;
    opportunities: IFullyConfigurableItemsState<Opportunity, OpportunityGrouping, OpportunityFilter>;
    opportunitiesOwned: IFullyConfigurableItemsState<Opportunity, OpportunityGrouping, OpportunityFilter>;
    opportunitiesCustomers: IFullyConfigurableItemsState<Opportunity, OpportunityGrouping, OpportunityFilter>;
    opportunitiesWithTenders: IFullyConfigurableItemsState<Opportunity, OpportunityGrouping, OpportunityFilter>;
    opportunitiesWithTendersOwned: IFullyConfigurableItemsState<Opportunity, OpportunityGrouping, OpportunityFilter>;
    opportunitiesWithTendersCustomers: IFullyConfigurableItemsState<Opportunity, OpportunityGrouping, OpportunityFilter>;

    leads: IFullyConfigurableItemsState<Lead, LeadGrouping, LeadFilter>,
    leadsOwned: IFullyConfigurableItemsState<Lead, LeadGrouping, LeadFilter>,
    leadsCustomers: IFullyConfigurableItemsState<Lead, LeadGrouping, LeadFilter>,

    salesLeadSelected: ISelectedFilterGroupingItemState<IdentifiableTitleBodyHighPriority, OpportunityGrouping, OpportunityFilter>;
    salesLeadOwnedSelected: ISelectedFilterGroupingItemState<IdentifiableTitleBodyHighPriority, OpportunityGrouping, OpportunityFilter>;
    salesLeadCustomersSelected: ISelectedFilterGroupingItemState<IdentifiableTitleBodyHighPriority, OpportunityGrouping, OpportunityFilter>;

    queries: ISelectableItemsState<Query>;
    //report: IReport;
    reports: { 
        accountId: string;
        reports: _.Dictionary<IAccountReportPayload & IActionStatus>;
    }
    routing: RouterState;
    search: ISearchState;
    tasks: ISelectableItemsState<Task>;
    tenders: ISelectableItemsState<Tender>;
    technicianReport: ITechnicianReport;
    toasts: Toast[];
    //unplannedCallouts: IConfigurableGroupingItemsState<ICallout, CalloutGrouping>;
    unplannedCallouts: IConfigurableGroupingItemsQueriableState<CalloutListItem<IWorkOrderForListItem>, Callout, ServiceOrderGrouping>;
    //repairs: ISelectableItemsState<ICallout>;
    repairs: IFullyConfigurableItemsState<Callout, RepairGrouping | ServiceOrderGrouping, RepairFilter>;
     sharedState: {
        isOfflineMode: boolean;
        isWebSocketConnected: boolean;
    };

    inspections: IConfigurableGroupingItemsQueriableState<CalloutListItem<IWorkOrderForListItem>, Callout, ServiceOrderGrouping>;

    inspectionPoints: IConfigurableGroupingItemsQueriableState<CalloutListItem<IWorkOrderForListItem>, Callout, ServiceOrderGrouping>;

    serviceNeeds: IConfigurableGroupingFilterItemsQueriableState<CalloutListItem<IWorkOrderForListItem>, Callout, ServiceOrderGrouping, ServiceNeedsFilter>;

    rejectedServiceOrders: IConfigurableGroupingFilterItemsQueriableState<RejectedServiceOrderListItem<any>, RejectedServiceOrder, RejectedServiceAppointmentGrouping, MaintenanceActivityTypeFilter>;
    rejectedWorkOrdersNonFSM: IConfigurableGroupingFilterItemsQueriableState<RejectedWorkOrderNonFSMListItem<any>, RejectedServiceOrderNonFSM, RejectedServiceAppointmentGrouping, MaintenanceActivityTypeFilter>;
    serviceOrdersReport: IServiceOrdersReport;
    serviceVisitHistory: ISelectableItemsState<ServiceVisitHistory>;
    technicianDetails: ITechnicianDetails;
    equipmentDetails: {
        helpdeskCases: ISelectableItemsState<HelpdeskCase>;
        contacts: ISelectableItemsState<ContactWithRole>;
    };
    planCustomerVisit: IPlanCustomerVisitState;
    selectContactsDialog: ISelectContactsDialogState;
    tractionControlReportVA: ITractionControlReportState,
    tractionControlReportVC: ITractionControlReportState,
    tractionControlReports: ITractionControlReports,
    writeTask: WriteTaskState;
	kolLaunchStatus: IKolLaunchStatus;
}

export type GetGlobalState = () => IGlobalState;
