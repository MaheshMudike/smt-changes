import * as React from 'react';
import { LOAD_COMPLAINTS } from "../../actions/integration/complaintActions";
import Complaint from '../../models/feed/Complaint';
import { LOAD_INSPECTION_POINTS, LOAD_INSPECTIONS, LOAD_SERVICE_NEEDS, LOAD_REPAIRS, LOAD_UNPLANNED_CALLOUTS, LOAD_MBM_CALLOUTS, LOAD_REJECTED_SERVICE_ORDERS, LOAD_REJECTED_WORK_ORDERS_NON_FSM,  } from "../../actions/integration/calloutActions";
import Callout from "../../models/feed/Callout";
import { createOverviewListDataSelector, createOverviewListDataSelectorForGroups, filterSortGroupItems2, createOverviewListQueriableSelector, filterSortGroupItems, createOverviewListQueriableFilterSelector } from "../../selectors";
import Query from "../../models/feed/Query";
import { LOAD_QUERIES } from "../../actions/integration/queryActions";
import translate from "../../utils/translate";
import { getDateGroup, userFriendlyDate, formatCurrency, userFriendlyDateTime } from "../../utils/formatUtils";
import { LOAD_TASKS } from "../../actions/integration/tasks/taskActions";
import Task from "../../models/feed/Task";
import { IGlobalState } from "../../models/globalState";
import { createSelector } from "reselect";
import { getWorkOrderGrouping } from "../../selectors/getCalloutGrouping";
import { UnplannedCalloutGroupingBar, InspectionsGroupingBar, InspectionPointsGroupingBar, ServiceNeedsGroupingBar } from "../../components/overview/CalloutGroupingBar";
import { IFullyConfigurableItemsState, IItemsState, ISelectedFilterGroupingItemState } from '../../models/IItemsState';

import { OpportunityGrouping } from '../../models/overview/OpportunityGrouping';
import { OpportunityFilter } from '../../models/overview/OpportunityFilter';
import Opportunity from '../../models/feed/Opportunity';

import { LOAD_OPPORTUNITIES, LOAD_OPPORTUNITIES_WITH_TENDERS, LOAD_OPPORTUNITIES_WITH_TENDERS_OWNED, LOAD_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS, LOAD_OPPORTUNITIES_CUSTOMERS, LOAD_OPPORTUNITIES_OWNED } from '../../actions/integration/opportunitiesActions';
import { OpportunityTopBar, OpportunityWithTenderTopBar, OpportunityTopBarOwned, OpportunityTopBarCustomers, OpportunityWithTenderOwnedTopBar, OpportunityWithTenderCustomersTopBar } from '../../components/overview/OpportunityTopBar';
import Event from '../../models/events/Event';

import { ServiceOrderGrouping } from '../../models/overview/CalloutGrouping';
import { CalloutListItem } from '../../models/feed/Callout';
import { MbmCalloutGroupingBar } from '../../components/overview/CalloutGroupingBar';

import { payloadAction, IItemsStateAsyncActionNames, IItemsQueryStateAsyncActionNames } from '../../actions/actionUtils';
import { LOAD_EQUIPMENTS } from '../../actions/integration/equipmentActions';
import { equipmentStatusTranslationsKeys, EquipmentStatusFilter} from '../../constants/equipmentStatus';
import { IListGroup, IAggregatedList } from '../../models/list/aggregations';
import { LOAD_AUDITS } from '../../actions/integration/auditActions';
import Audit, { AuditListItem } from '../../models/audits/Audit';
import { LOAD_DISCUSSIONS } from '../../actions/integration/discussionActions';
import { connect } from 'react-redux';
import { EquipmentListDetail, CalloutListDetail, ComplaintListDetail, QueryListDetail, TaskListDetail, OpportunityListDetail, EventListDetail, AuditListDetail, DetailMode, 
    HelpdeskCaseListDetail, AccountListDetailOffline, RejectedWorkorderListDetail, IListDetailProps, LeadListDetail, RejectedWorkorderNonFSMListDetail, TransactionSurveyCaseListDetail } from './ListDetails';
import { selectQueriableItemAction } from '../../actions/http/httpActions';

import * as _ from 'lodash';
import { accountSearchRank, AccountSearchRank } from '../../services/accounts/accountSearchRank';
import { AccountWithContacts } from '../../models/accounts/AccountWithContacts';
import { ActionStatus } from '../../actions/actions';
import { CACHE_GET_ACCOUNTS } from '../../actions/cache/accountActions';
import { noGrouping } from '../../selectors';
import { IdentifiableTitleBodyHighPriority } from '../../models/list/IListItem';
import { IdentifiableWithTitle } from '../../models/feed/ISObject';
import OverviewList, { IOverviewListOptions2 } from '../../components/overview/OverviewList';
import { RepairsTopBar } from '../../components/overview/RepairsTopBar';
import { RepairFilter } from '../../models/overview/RepairFilter';
import { ServiceOrderType, MaintenanceActivityTypeFilter, filterWithMaintenanceActivityTypeFilter } from '../../constants/ServiceOrderType';
import { RepairGrouping } from '../../models/overview/RepairGrouping';
import HelpdeskCase from '../../models/feed/HelpdeskCase';
import { LOAD_HELPDESK_CASES } from '../../actions/integration/helpdeskCasesActions';
import Equipment from 'src/models/equipment/Equipment';
import { LOAD_EVENTS } from 'src/actions/integration/events/eventActions';
import { EntityFieldsData, entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';
import { RejectedServiceAppointmentTopBar, RejectedServiceAppointmentGrouping } from 'src/components/overview/RejectedServiceAppointmentTopBar';
import { ServiceNeedsFilter } from 'src/models/overview/ServiceNeedsFilter';
import { EntityType } from 'src/constants/EntityType';
import Lead from 'src/models/feed/Lead';
import { SELECT_SALES_LEAD, SELECT_SALES_LEAD_OWNED, SELECT_SALES_LEAD_CUSTOMERS } from 'src/actions/salesLeadsActions';
import { IApiNameAndId } from 'src/models/api/coreApi';
import { IWithLastModification } from 'src/models/feed/IWithLastModification';
import { RejectedWorkOrderNonFSMTopBar } from 'src/components/overview/RejectedWorkOrderNonFSMTopBar';
import { Moment } from 'moment';
import { LOAD_DETRACTOR_CASES } from 'src/actions/integration/detractorCasesActions';
import TransactionalSurveyCase from 'src/models/feed/TransactionalSurveyCase';
import DiscussionListItem, { Discussion } from 'src/models/audits/Discussion';
import { LOAD_LEADS, LOAD_LEADS_OWNED, LOAD_LEADS_CUSTOMERS } from 'src/actions/integration/leadActions';
import { LeadGrouping } from 'src/models/overview/LeadGrouping';
import { LeadFilter } from 'src/models/overview/LeadFilter';
import { LeadTopBar, LeadTopBarOwned, LeadTopBarCustomers } from 'src/components/overview/LeadTopBar';
import * as moment from 'moment';

export interface IAggregatedListWithItemToRender<TListItem,TDetail> {
    itemToRender: TDetail,
    itemToRenderStatus: ActionStatus,
}

interface IOverviewListDispatchFromProps<T> {
    //synchronizeCurrentPage: () => void;
    //showModal: (mt: ModalType, a: any) => void;
    selectAction: (t: T) => void;
}

export type OverviewClassSelectorProps<TListItem, TDetail> = 
    IAggregatedListWithItemToRender<TListItem, TDetail> & IAggregatedList<TListItem> & { entityFieldsData: EntityFieldsData } &
    { listTopPart?: JSX.Element, renderCollapsibleGroups?: boolean; }

export type OverviewClassProps<TListItem, TDetail> = OverviewClassSelectorProps<TListItem, TDetail> & IOverviewListDispatchFromProps<TListItem>

abstract class OverviewClass<TListItem, TDetail> extends React.Component<OverviewClassProps<TListItem, TDetail>, object> {}

function SalesforceOverviewList<T extends IdentifiableTitleBodyHighPriority, U extends IdentifiableWithTitle>(props: IOverviewListOptions2<T, U>) {
    return <OverviewList {...props }></OverviewList>;
}

export const groupByLastModification = (item: IWithLastModification, efd: EntityFieldsData) => userFriendlyDate(item.lastModifiedDate, efd.locale);

export const sortByLastModification = (item: IWithLastModification) => -item.lastModifiedDate;

export const Complaints = connectSalesforceOverviewList(
    createOverviewListDataSelector<Complaint>(state => state.complaints, { group: groupByLastModification, sort: sortByLastModification }),
    LOAD_COMPLAINTS,
    ComplaintListDetail
)

function connectSalesforceOverviewList<TListItem extends IdentifiableTitleBodyHighPriority, TDetail extends IdentifiableWithTitle & { entityType: EntityType }>(
    selector: (state: IGlobalState) => OverviewClassSelectorProps<TListItem, TDetail>,
    //props: OverviewClassProps<TListItem, TDetail>, 
    action: IItemsStateAsyncActionNames, 
    Detail: (props: IListDetailProps<TDetail> & { entityFieldsData: EntityFieldsData }) => JSX.Element,
    listTopPart?: JSX.Element, renderCollapsibleGroups?: boolean
) {
    return connectSalesforceOverviewListAction(selector, action.selectItem, Detail, listTopPart, renderCollapsibleGroups);
}

function connectSalesforceOverviewListAction<TListItem extends IdentifiableTitleBodyHighPriority, TDetail extends IdentifiableWithTitle & { entityType: EntityType }>(
    selector: (state: IGlobalState) => OverviewClassSelectorProps<TListItem, TDetail>,
    //props: OverviewClassProps<TListItem, TDetail>, 
    action: string, 
    Detail: (props: IListDetailProps<TDetail> & { entityFieldsData: EntityFieldsData }) => JSX.Element,
    listTopPart?: JSX.Element, renderCollapsibleGroups?: boolean
) {
    return connect(
        selector,
        {
            selectAction: payloadAction(action),
        }
    )((props: OverviewClassProps<TListItem, TDetail>) => 
        <SalesforceOverviewList detail={ item => <Detail detailMode={DetailMode.OVERVIEW} item={item} entityFieldsData={props.entityFieldsData} /> } 
            listTopPart={listTopPart} renderCollapsibleGroups={renderCollapsibleGroups}
            { ...props } 
        />
    );
}


function connectSalesforceOverviewListQueriable<
    TListItem extends IdentifiableTitleBodyHighPriority & { queryDetails: () => Promise<TListItem> }, 
    TDetail extends IdentifiableWithTitle & { entityType: EntityType }
>(
    selector: (state: IGlobalState) => IAggregatedListWithItemToRender<TListItem, TDetail>, 
    action: IItemsQueryStateAsyncActionNames, 
    Detail: (props: IListDetailProps<TDetail> & { entityFieldsData: EntityFieldsData }) => JSX.Element,
    listTopPart?: JSX.Element, renderCollapsibleGroups?: boolean
) {
    return connect(
        selector, { selectAction: (listItem: TListItem) => selectQueriableItemAction(listItem, action) }
    )((props: OverviewClassProps<TListItem, TDetail>) => 
        <SalesforceOverviewList detail={ item => <Detail detailMode={DetailMode.OVERVIEW} item={item} entityFieldsData={props.entityFieldsData} /> } 
            listTopPart={listTopPart} renderCollapsibleGroups={renderCollapsibleGroups}
            { ...props } 
        />
    );
}

export const InspectionPoints = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableSelector<CalloutListItem<any>, Callout, ServiceOrderGrouping>(
        state => state.inspectionPoints, 
        (grouping, entityFieldsData) => getWorkOrderGrouping(grouping, false, entityFieldsData)
        //{ sort: sortByLastModification }
    ),
    LOAD_INSPECTION_POINTS,
    CalloutListDetail,
    <InspectionPointsGroupingBar />
)

export const Inspections = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableSelector<CalloutListItem<any>, Callout, ServiceOrderGrouping>(
        state => state.inspections, 
        (grouping, entityFieldsData) => getWorkOrderGrouping(grouping, false, entityFieldsData),
        //{ sort: sortByLastModification }
    ),
    LOAD_INSPECTIONS,
    CalloutListDetail,
    <InspectionsGroupingBar />
);

export const OverviewServiceNeedsList = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableFilterSelector<CalloutListItem<any>, Callout, ServiceOrderGrouping, ServiceNeedsFilter>(
        state => state.serviceNeeds, 
        (grouping, filter, entityFieldsData) => ({
            ...getWorkOrderGrouping(grouping, false, entityFieldsData), 
            // filter: item => {
            //     switch(filter) {
            //         case ServiceNeedsFilter.All:
            //             return true;
            //         case ServiceNeedsFilter.MissedServiceNeeds:
            //             return item.completedMbmsbAfterServiceNeedCreated != null && item.completedMbmsbAfterServiceNeedCreated.length > 0;
            //         default:
            //             return true;
            //     }
            // }
        })
    ),
    LOAD_SERVICE_NEEDS,
    CalloutListDetail,
    <ServiceNeedsGroupingBar />
);

const rejectedWorkOrderGrouping = <T extends { id: string, newStatusDate: Moment, newStatusDateApi: string, technicianNameForGrouping: string, maintenanceActivityType: string, serviceOrderType: string }>(
    grouping: RejectedServiceAppointmentGrouping, filter: MaintenanceActivityTypeFilter, entityFieldsData: EntityFieldsData,
) => ({
    sort: (item: T) => -item.newStatusDate.unix(),
    filter: (item: T) => filterWithMaintenanceActivityTypeFilter(item, filter),
    group: (item: T) => {
        switch(grouping) {
            case RejectedServiceAppointmentGrouping.Technician:
                return item.technicianNameForGrouping || '-';
            case RejectedServiceAppointmentGrouping.TimeOfRejection:
                return userFriendlyDateTime(item.newStatusDateApi, entityFieldsData.locale);
            default:
                return userFriendlyDateTime(item.newStatusDateApi, entityFieldsData.locale);
        }
    }
})

export const RejectedServiceAppointmentsList = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableFilterSelector(
        state => state.rejectedServiceOrders,
        rejectedWorkOrderGrouping
    ),
    LOAD_REJECTED_SERVICE_ORDERS,
    RejectedWorkorderListDetail,
    <RejectedServiceAppointmentTopBar />
);

export const RejectedWorkOrdersNonFSMList = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableFilterSelector(
        state => state.rejectedWorkOrdersNonFSM,
        rejectedWorkOrderGrouping
    ),
    LOAD_REJECTED_WORK_ORDERS_NON_FSM,
    RejectedWorkorderNonFSMListDetail,
    <RejectedWorkOrderNonFSMTopBar />
);

export const Queries = connectSalesforceOverviewList(
    createOverviewListDataSelector<Query>(state => state.queries, { group: groupByLastModification, sort: sortByLastModification }),
    LOAD_QUERIES,
    QueryListDetail
);

export const HelpdeskCases = connectSalesforceOverviewList(
    createOverviewListDataSelector<HelpdeskCase>(
        state => state.helpdeskCases, 
        {
            group: item => item.isClosed ? translate('generic.closed') : translate('generic.open'),//groupByLastModification(item), 
            // sort: sortByLastModification,
            //make closed group appear at the end
            groupSort: group => group.title === translate('generic.closed') ? 1 : -1,
        }
    ),
    LOAD_HELPDESK_CASES,
    HelpdeskCaseListDetail
);

export const DetractorCases = connectSalesforceOverviewList(
    createOverviewListDataSelector<TransactionalSurveyCase>(
        state => state.detractorCases,
        {
            group: item => item.isClosed ? translate('generic.closed') : translate('generic.open'),
            groupSort: group => group.title === translate('generic.closed') ? 1 : -1,
        }
    ),
    LOAD_DETRACTOR_CASES,
    TransactionSurveyCaseListDetail
);

function groupingKey(c: Callout) {
    for(let key in repairFiltersByTypes) {
        if(key == RepairFilter.All) continue;
        if(repairFiltersByTypes[key](c)) return key;
    }
    return RepairFilter.Other;
}


const repairGroupingsByTypes: _.Dictionary<(r: Callout) => string> = {    
    [RepairGrouping.Type]: r => groupingKey(r),
    [RepairGrouping.None]: r => null
};


function YSM1orYSM2 (r: Callout) {
    return r.serviceOrderType === ServiceOrderType.YSM1 || r.serviceOrderType === ServiceOrderType.YSM2;
}

function YSM3orYSM4 (r: Callout) {
    return r.serviceOrderType === ServiceOrderType.YSM3 || r.serviceOrderType === ServiceOrderType.YSM4;
}

const repairFiltersByTypes: { [index: string]:  (r: Callout) => boolean } = {
    [RepairFilter.All]: r => true,

    [RepairFilter.PackagedServiceRepair]: r => r.serviceOrderType === ServiceOrderType.YSM6,
    [RepairFilter.UnplannedServiceRepair]: r => YSM3orYSM4(r),
    
    [RepairFilter.FieldLetters]: r => YSM1orYSM2(r) && r.assemblyCode && r.assemblyCode.startsWith('KCO_FL'),
    [RepairFilter.ExpressLetters]: r => YSM1orYSM2(r) && r.assemblyCode && r.assemblyCode.startsWith('KCO_EXP'),
    [RepairFilter.ClinicaVisits]: r => YSM1orYSM2(r) && r.assemblyCode && r.assemblyCode === 'KCO_CLINICA',
    [RepairFilter.FirstVisitDefects]: r => YSM1orYSM2(r) && r.assemblyCode && r.assemblyCode === 'KCO_1ST_DEF',
    [RepairFilter.PlannedServiceRepairs]: r => YSM1orYSM2(r) && (r.assemblyCode === "" || r.assemblyCode == null),
    /*
    [RepairFilter.OtherYSM1orYSM2]: r => YSM1orYSM2(r) && r.assemblyCodeDescription && !r.assemblyCodeDescription.startsWith('KCO_FL')
        && !r.assemblyCodeDescription.startsWith('KCO_Exp') && r.assemblyCodeDescription !== 'KCO_CLINICA' && r.assemblyCodeDescription !== 'KCO_1ST_DEF'
        */
};

const otherRepairFilter = (c: Callout) => {
    for(let key in repairFiltersByTypes) {
        if(key == RepairFilter.All) continue;
        if(repairFiltersByTypes[key](c)) return false;;
    }
    return true;
}

const repairsSelector = createOverviewListDataSelectorForGroups(
    (state: IGlobalState) => state.repairs.list,
    createSelector(
        (state: IGlobalState) => state.repairs.list.items,
        state => state.repairs.list.hasError,
        state => state.repairs.grouping,
        state => state.repairs.filter,
        state => state.authentication.currentUser.id,
        state => entityFieldsDataFromState(state),
        
        (items, hasError, groupingType, filterType, userId, entityFieldsData) => {
            const filter = filterType == RepairFilter.Other ? otherRepairFilter : repairFiltersByTypes[filterType];
            var grouping = null as any;//repairGroupingsByTypes[RepairGrouping.Type];
            if(groupingType == RepairGrouping.None || groupingType == RepairGrouping.Type) {
                const grouping = repairGroupingsByTypes[groupingType];
                
                // const filter = filterType == RepairFilter.Other ? otherRepairFilter : repairFiltersByTypes[filterType];
                if(grouping == null) throw new Error('Unhandled grouping type: ' + groupingType);

                return filterSortGroupItems2(
                    items,
                    hasError,
                    entityFieldsData,
                    filter, 
                    r => grouping(r) || '',
                    (items, key) => ({ items, title: translate(key) }), 
                    r => -r.lastModifiedDate,
                    r => r.title
                );
            } else {
                return filterSortGroupItems(items, hasError, entityFieldsData, getWorkOrderGrouping(groupingType, false, entityFieldsData), filter);
            }

        }
    )
);

export const Repairs = connectSalesforceOverviewList(
    repairsSelector,
    LOAD_REPAIRS,
    CalloutListDetail,
    <RepairsTopBar />,
    true
);

export const Tasks = connectSalesforceOverviewList(
    createOverviewListDataSelector<Task>(
        state => state.tasks,
        {
            group: (t, efd) => t.isOverdue ? translate('feed.group.overdue') : getDateGroup(t.dueDate, efd.locale),
            sort: t => t.dueDate,
        }
    ),
    LOAD_TASKS,
    TaskListDetail
);

export const Equipments = connectSalesforceOverviewList(
    createOverviewListDataSelector<Equipment>(
        state => state.equipment,
        {
            group: (item: Equipment) => item.status,
            groupSort: (group: IListGroup<Equipment>) => group.title === translate(equipmentStatusTranslationsKeys[EquipmentStatusFilter.NORMAL_OPERATION]),
            sort: (item: Equipment) => -item.lastModification,
        },
    ),
    LOAD_EQUIPMENTS,
    EquipmentListDetail
);

export const Audits = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableSelector(
        state => state.audits, () => ({ sort: (item: AuditListItem) => item.plannedDate }),
    ),
    LOAD_AUDITS,
    (tprops: IListDetailProps<Audit>) => <AuditListDetail {...tprops} />
);

export const MonthlyDiscussions = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableSelector(
        state => state.discussions, () => ({ sort: (item: DiscussionListItem) => item.plannedDate }),
    ),
    LOAD_DISCUSSIONS,
    (tprops: IListDetailProps<Discussion>) => <AuditListDetail {...tprops} />
);


export const UnplannedCallouts = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableSelector<CalloutListItem<any>, Callout, ServiceOrderGrouping>(
        state => state.unplannedCallouts, 
        (grouping, entityFieldsData) => getWorkOrderGrouping(grouping, true, entityFieldsData)
    ),
    LOAD_UNPLANNED_CALLOUTS,
    CalloutListDetail,
    <UnplannedCalloutGroupingBar />
);

export const MbmCallouts = connectSalesforceOverviewListQueriable(
    createOverviewListQueriableSelector<CalloutListItem<any>, Callout, ServiceOrderGrouping>(
        state => state.mbmCallouts, 
        (grouping, entityFieldsData) => getWorkOrderGrouping(grouping, false, entityFieldsData)
    ),
    LOAD_MBM_CALLOUTS,
    CalloutListDetail,
    <MbmCalloutGroupingBar />
);

const leadFiltersByTypes: _.Dictionary<(opp: { ownerId: string, businessType: string }, s: string) => boolean> = {
    [LeadFilter.All]: (opp, userId) => true,
    [LeadFilter.VARepairsAndDoors]: (opp, userId) => opp.businessType == 'VA Repairs' || opp.businessType == 'Doors'
};

const leadGroupingsByTypes: _.Dictionary<(opp: { 
    stageName: string, 
    businessType: string, 
    createdDate: string,
    leadSource: string,
    technicianName: string,
    urgency: string
}, locale: string) => string> = {
    [LeadGrouping.StageName]: o => o.stageName,
    [LeadGrouping.BusinessType]: o => o.businessType,
    [LeadGrouping.CreatedDate]: (o, locale) => userFriendlyDate(o.createdDate, locale),
    [LeadGrouping.LeadSource]: (o, locale) => o.leadSource,
    [LeadGrouping.TechnicianName]: (o, locale) => o.technicianName,
    [LeadGrouping.Urgency]: o => o.urgency || '',
};

const leadGroupSortingByTypes: _.Dictionary<(opp: { 
    createdDate: string,
    stageName: string
}) => string | number | boolean> = {
    [LeadGrouping.CreatedDate]: o => -moment(o.createdDate).valueOf(),
    [LeadGrouping.StageName]: o => {
        if(o.stageName == 'New') return '00';
        else if(o.stageName == 'In Process') return'01';
        else if(o.stageName == 'Qualified') return '02';
        else if(o.stageName == 'Postponed') return '03';
        return o.stageName;
    }
};

function leadSelector(
    leadsStateGetter: (gs: IGlobalState) => IFullyConfigurableItemsState<Lead, LeadGrouping, LeadFilter>
) {
    return createOverviewListDataSelectorForGroups(
        (state: IGlobalState) => leadsStateGetter(state).list,
        createSelector(
            (state: IGlobalState) => leadsStateGetter(state).list.items,
            state => leadsStateGetter(state).list.hasError,
            state => leadsStateGetter(state).grouping,
            state => leadsStateGetter(state).filter,
            state => state.authentication.currentUser.id,
            state => entityFieldsDataFromState(state),
            (items, hasError, groupingType, filterType, userId, entityFieldsData) => {
                const grouping = leadGroupingsByTypes[groupingType];
                const filter = leadFiltersByTypes[filterType];
                if(grouping == null) throw new Error('Unhandled grouping type: ' + groupingType);

                const groupSort = leadGroupSortingByTypes[groupingType];
                return filterSortGroupItems2(items, 
                    hasError,
                    entityFieldsData,
                    lead => filter(lead, userId), 
                    lead => grouping(lead, entityFieldsData.locale),
                    (items, key) => key == null || key == 'null' ? null : ({ items, title: key }), 
                    lead => -lead.amount, 
                    g => groupSort != null ? groupSort(g.items[0]) : g.title
                )
            },
        )
    );
}

export const Leads = connectSalesforceOverviewList(
    leadSelector(state => state.leads),
    LOAD_LEADS,
    LeadListDetail,
    <LeadTopBar />,
    true
);

export const LeadsCustomers = connectSalesforceOverviewList(
    leadSelector(state => state.leadsOwned),
    LOAD_LEADS_OWNED,
    LeadListDetail,
    <LeadTopBarOwned />,
    true
);

export const LeadsOwned = connectSalesforceOverviewList(
    leadSelector(state => state.leadsOwned),
    LOAD_LEADS_CUSTOMERS,
    LeadListDetail,
    <LeadTopBarCustomers />,
    true
);



const groupingsByTypes: _.Dictionary<(opp: { 
    stageName: string, 
    businessType: string, 
    marketSegment: string, 
    amount: number, 
    currencyIsoCode?: string,
    accountApiForTitle: IApiNameAndId,
    leadSource: string,
    technicianName?: string,
    createdDate: string,
    closeDate: string,
    equipmentAddress: string,
    equipmentName: string,
    ownerName?: string,
    opportunityCategory?: string
}, locale: string) => string> = {
    [OpportunityGrouping.Stage]: o => o.stageName,
    [OpportunityGrouping.BusinessType]: o => o.businessType,
    [OpportunityGrouping.MarketSegment]: o => o.marketSegment,
    [OpportunityGrouping.CreatedDate]: (o, locale) => userFriendlyDate(o.createdDate, locale),
    [OpportunityGrouping.CloseDate]: (o, locale) => userFriendlyDate(o.closeDate, locale),
    [OpportunityGrouping.Amount]: (o, locale) => formatCurrency(o.amount, o.currencyIsoCode, locale),
    [OpportunityGrouping.Account]: o => o.accountApiForTitle && o.accountApiForTitle.Name,
    [OpportunityGrouping.LeadSource]: o => o.leadSource,
    [OpportunityGrouping.TechnicianName]: o => o.technicianName,
    [OpportunityGrouping.Equipment]: o => o.equipmentName,
    [OpportunityGrouping.EquipmentAddress]: o => o.equipmentAddress,
    [OpportunityGrouping.Owner]: o => o.ownerName,
    [OpportunityGrouping.OpportunityCategory]: o => o.opportunityCategory,
};

const oppGroupSortingByTypes: _.Dictionary<(opp: { 
    createdDate: string,
    closeDate: string,
    amount: number
}) => string | number | boolean> = {
    [OpportunityGrouping.CreatedDate]: o => -moment(o.createdDate).valueOf(),
    [OpportunityGrouping.CloseDate]: o => -moment(o.closeDate).valueOf(),
    [OpportunityGrouping.Amount]: o => -o.amount
};

const filtersByTypes: _.Dictionary<(opp: Opportunity, s: string) => boolean> = {
    [OpportunityFilter.All]: (opp, userId) => true,
    [OpportunityFilter.AssignedToSupervisor]: (opp, userId) => opp.ownerId === userId,
    [OpportunityFilter.AssignedToPlannerGroup]: (opp, userId) => opp.ownerId !== userId,
    [OpportunityFilter.VARepairsAndDoors]: (opp, userId) => opp.businessType == 'VA Repairs' || (opp.businessType == 'Doors' && opp.opportunityCategory == 'Repair/Modernization')
};

function opportunitySelector(stateBranch: (gs: IGlobalState) => IFullyConfigurableItemsState<Opportunity, OpportunityGrouping, OpportunityFilter>) {
    return createOverviewListDataSelectorForGroups(
        (state: IGlobalState) => stateBranch(state).list,
        createSelector(
            (state: IGlobalState) => stateBranch(state).list.items,
            state => stateBranch(state).list.hasError,
            state => stateBranch(state).grouping,
            state => stateBranch(state).filter,
            state => state.authentication.currentUser.id,
            state => entityFieldsDataFromState(state),
            (items, hasError, groupingType, filterType, userId, entityFieldsData) => {
                const grouping = groupingsByTypes[groupingType];
                const filter = filtersByTypes[filterType];
                if(grouping == null) throw new Error('Unhandled opportunity grouping type: ' + groupingType);

                const groupSort = oppGroupSortingByTypes[groupingType];
                return filterSortGroupItems2(
                    items,
                    hasError,
                    entityFieldsData,
                    opp => filter(opp, userId), 
                    opp => grouping(opp, entityFieldsData.locale) || '-', 
                    (items, key) => ({ items, title: key }), 
                    opp => -opp.amount, 
                    g => groupSort != null ? groupSort(g.items[0]) : g.title
                )
            },
        )
    );
}

export const Opportunities = connectSalesforceOverviewList(
    opportunitySelector(state => state.opportunities),
    LOAD_OPPORTUNITIES,
    OpportunityListDetail,
    <OpportunityTopBar />,
    true
);

export const OpportunitiesOwned = connectSalesforceOverviewList(
    opportunitySelector(state => state.opportunitiesOwned),
    LOAD_OPPORTUNITIES_OWNED,
    OpportunityListDetail,
    <OpportunityTopBarOwned />,
    true
);

export const OpportunitiesCustomers = connectSalesforceOverviewList(
    opportunitySelector(state => state.opportunitiesCustomers),
    LOAD_OPPORTUNITIES_CUSTOMERS,
    OpportunityListDetail,
    <OpportunityTopBarCustomers />,
    true
);

export const OpportunitiesWithTenders = connectSalesforceOverviewList(
    opportunitySelector(state => state.opportunitiesWithTenders),
    LOAD_OPPORTUNITIES_WITH_TENDERS,
    OpportunityListDetail,
    <OpportunityWithTenderTopBar />,
    true
);

export const OpportunitiesWithTendersOwned = connectSalesforceOverviewList(
    opportunitySelector(state => state.opportunitiesWithTendersOwned),
    LOAD_OPPORTUNITIES_WITH_TENDERS_OWNED,
    OpportunityListDetail,
    <OpportunityWithTenderOwnedTopBar />,
    true
);

export const OpportunitiesWithTendersCustomers = connectSalesforceOverviewList(
    opportunitySelector(state => state.opportunitiesWithTendersCustomers),
    LOAD_OPPORTUNITIES_WITH_TENDERS_CUSTOMERS,
    OpportunityListDetail,
    <OpportunityWithTenderCustomersTopBar />,
    true
);


// function SalesLeadDetail(tprops: IListDetailProps<any> & { entityFieldsData: EntityFieldsData }) {//Opportunity | Lead>) {
//     return tprops.item.entityType === EntityType.Opportunity ? <OpportunityListDetail {...tprops} /> : <LeadListDetail {...tprops} />
// }


// function salesLeadSelector(
//     selectableItemsState: (gs: IGlobalState) => ISelectedFilterGroupingItemState<IdentifiableTitleBodyHighPriority, OpportunityGrouping, OpportunityFilter>, 
//     leadsStateGetter: (gs: IGlobalState) => IFullyConfigurableItemsState<Lead, LeadGrouping, LeadFilter>,
//     opportunitiesStateGetter: (gs: IGlobalState) => IFullyConfigurableItemsState<Opportunity, OpportunityGrouping, OpportunityFilter>
// ) {

//     return createOverviewListDataSelectorForGroups(
//         (state: IGlobalState) => ({ ...selectableItemsState(state), isProcessing: false }),
//         createSelector(
//             (state: IGlobalState) => [...opportunitiesStateGetter(state).list.items, ...leadsStateGetter(state).list.items],
//             state => opportunitiesStateGetter(state).list.hasError || leadsStateGetter(state).list.hasError,
//             state => selectableItemsState(state).grouping,
//             state => selectableItemsState(state).filter,
//             state => state.authentication.currentUser.id,
//             state => entityFieldsDataFromState(state),
//             (items, hasError, groupingType, filterType, userId, entityFieldsData) => {
//                 const grouping = groupingsByTypes[groupingType];
//                 const filter = filtersByTypes[filterType];
//                 if(grouping == null) throw new Error('Unhandled opportunity grouping type: ' + groupingType);

//                 return filterSortGroupItems2(items, 
//                     hasError,
//                     entityFieldsData,
//                     opp => filter(opp, userId), 
//                     opp => grouping(opp, entityFieldsData.locale),// || '-', 
//                     (items, key) => key == null || key == 'null' ? null : ({ items, title: key }), 
//                     opp => -opp.amount, 
//                     g => groupingType == OpportunityGrouping.Amount ? -g.items[0].amount : g.title)
//             },
//         )
//     );
// }


export const CustomerVisits = connectSalesforceOverviewList(
    createOverviewListDataSelector<Event>(state => state.events, { sort: item => item.startDateTime }),
    LOAD_EVENTS,
    EventListDetail
);



function isTooShort(searchPhrase: string) {
    return _.every(searchPhrase.split(/\s+/), str => str.length < 3);
}

export function getMatchingAccounts(items: AccountWithContacts[], searchPhrase: string) {
    if (isTooShort(searchPhrase)) {
        return [];
    }
    const searchRankForPhrase = accountSearchRank(searchPhrase);
    const matchingItems = items
        .map(i => [i, searchRankForPhrase(i)] as [AccountWithContacts, AccountSearchRank])
        .filter(pair => pair[1] !== AccountSearchRank.NoMatch);
    return _.sortBy(matchingItems, pair => pair[1]).map(pair => pair[0]);
}

const matchingAccountsSelector = createSelector(
    (state: IGlobalState) => state.cache.offlineAccounts.items,
    state => state.cache.offlineAccountsSearchPhrase,
    (items, searchPhrase) => getMatchingAccounts(items, searchPhrase),
);


class OfflineAccountsClass extends OverviewClass<AccountWithContacts, AccountWithContacts> {
    public render() { 
        return <SalesforceOverviewList { ...this.props } 
            detail={ item => <AccountListDetailOffline item={item} detailMode={DetailMode.OVERVIEW} /> } />;
    }
}

export const OfflineAccounts = connect(
    createSelector(
        matchingAccountsSelector,
        state => state.cache.offlineAccounts.selectedItem,
        state => entityFieldsDataFromState(state),
        (items, selectedItem, entityFieldsData) => ({
            isProcessing: false,
            listItems: noGrouping(items),
            selectedItem,
            itemToRender: selectedItem,
            itemToRenderStatus: ActionStatus.SUCCESS,
            entityFieldsData
        }),// as IAggregatedListWithItemToRender<IAccountWithContacts, IAccountWithContacts>),
    ),
    {
        selectAction: payloadAction(CACHE_GET_ACCOUNTS.selectItem),
    }
)(OfflineAccountsClass);
/*
export const OfflineAccounts = connectSalesforceOverviewList(
    createSelector(
        matchingAccountsSelector,
        state => state.cache.offlineAccounts.selectedItem,
        state => entityFieldsDataFromState(state),
        (items, selectedItem, entityFieldsData) => ({
            isProcessing: false,
            listItems: noGrouping(items),
            selectedItem,
            itemToRender: selectedItem,
            itemToRenderStatus: ActionStatus.SUCCESS,
            entityFieldsData
        }),// as IAggregatedListWithItemToRender<IAccountWithContacts, IAccountWithContacts>),
    ),
    CACHE_GET_ACCOUNTS,
    AccountListDetailOffline
);
*/