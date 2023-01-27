import { conditions, orCondition, andCondition, ICondition } from "./jsforceMappings";
import { IGeoBounds } from "../../models/feed/state";
import { Query } from "jsforce";
import { multiQuery2, multiQuery3, QuerySubset, multiQuery6 } from "./jsforceCore";
import { queryComplaintsBase, queryQueriesBase, queryKffBase, queryAssetOpportunities, queryTransactionalSurveyBase } from "./jsforce";
import * as coreApi from '../../models/api/coreApi';
import { queryWorkOrdersBase, queryTaskBase, queryEventsBase, queryAssetsBase, queryLeadsBase, queryTendersBase, queryAssetsOpportunitiesBase, queryOpportunitiesBase,queryWorkOrders, queryServiceAppointmentsBase, queryVersionBase, querySMTNotificationReads } from "./jsforceBase";
import * as moment from 'moment';
import * as fields from "./queryFields";
import { metricConditionsOpportunity, filterKffFieldAuditsOpen } from "./jsforceMetrics";
import { IFeedItem } from "../../models/feed/IFeedItem";
import { TaskFeedItem } from "../../models/feed/Task";
import { LeadFeedItem } from "../../models/feed/Lead";
import { OpportunityFeedItem } from "../../models/feed/Opportunity";
import { TenderFeedItem } from "../../models/tenders/Tender";
import { CalloutFeedItem, PlannedWorkorderFeedItem } from "../../models/feed/Callout";
import { QueryFeedItem } from "../../models/feed/Query";
import { ComplaintFeedItem } from "../../models/feed/Complaint";
import { getDateGroup } from "../../utils/formatUtils";
import translate from "../../utils/translate";
import { IListGroup } from "../../models/list/aggregations";

import * as _ from 'lodash';
import { TransactionalSurveyCaseFeedItem } from "src/models/feed/TransactionalSurveyCase";
import { EntityFieldsData } from "src/components/fields/EntityFieldsData";
import {querySMTNotifications} from "./jsforceBase"
import { NotificationFeedItem } from "src/models/feed/Notification";
import { AuditFeedItem } from "src/models/audits/Audit";



interface ISortDate {
    sortDate: string;
    id: string;
}

function groupItemsBySortDate<T extends { sortDate: string }>(
    otherItems: T[], specialItems: T[], specialGroupTitle: string = '', locale: string
): IListGroup<T>[] {
    return groupItems(otherItems, specialItems, specialGroupTitle, t => getDateGroup(t.sortDate, locale));
}

//TODO items need to be sorted for this function to work
function groupItemsSorted<T>(
    otherItems: T[], specialItems: T[], specialGroupTitle: string = '', group: (t: T) => string
): IListGroup<T>[] {
    if (otherItems.length === 0 && specialItems.length === 0) return [];

    return [
        ...(specialItems.length > 0 ? [ { isExtraordinary: true, title: translate(specialGroupTitle), items: specialItems } ] : []),
        ...otherItems.reduce(
            (acc, item) => {
                const groupTitle = group(item);
                const lastGroup = _.last(acc);
                if (lastGroup != null && groupTitle === lastGroup.title) {
                    lastGroup.items.push(item);
                    return acc;
                }
                return acc.concat([ { isExtraordinary: false, title: groupTitle, items: [item]  } ]);
            },
            []
        )
    ];
}

function groupItems<T>(
    otherItems: T[], specialItems: T[], specialGroupTitle: string = '', group: (t: T) => string
): IListGroup<T>[] {
    if (otherItems.length === 0 && specialItems.length === 0) return [];
    const groups = _.groupBy(otherItems, g => group(g));
    const otherItemsGrouped = Object.keys(groups).map((key, index) => ({ isExtraordinary: false, title: key, items: groups[key] }));
    return [
        ...(specialItems.length > 0 ? [ { isExtraordinary: true, title: translate(specialGroupTitle), items: specialItems } ] : []),
        ...otherItemsGrouped
    ];
}


function computeOffsetAndLimit(includePreviousPages: boolean, pageNumber: number, pageSize: number) {
    
    //querying pagenumber items of each object type so dates are sorted and handled correctly
    return [0, pageNumber * pageSize];
    /*
    const offset = includePreviousPages ? 0 : (pageNumber - 1) * pageSize;
    const limit = includePreviousPages ? pageSize * (pageNumber - 1) : pageSize;
    return [offset, limit];
    */
}

//https://siilisolutions.atlassian.net/wiki/spaces/KONESMT/pages/126104730/Display+My+Tasks+feed+-+Closed+tasks
//added Id to sort to keep consisten results if Date is the same for the objects
export function feedPageMyTasksQueries(plannerGroupId: string, activeInFSM: boolean, userId: string, box: IGeoBounds, open: boolean, overdue: boolean, 
    commonFields?: string[], sort = true) {
    const taskQuery = queryTaskBase([conditions.Task.owner(userId),
        overdue == null ? null : overdue ? conditions.Task.overdue : conditions.Task.overdue.negate(),        
        open ? conditions.Task.open : conditions.Task.closed], commonFields ? commonFields : fields.ITask);
    return [
        sort ? taskQuery.sort('-ActivityDate Id') : taskQuery
    ] as [Query<coreApi.ITask[]>]
}

export function queryFeedPageMytasks(plannerGroupId: string, entityFieldsData: EntityFieldsData, open: boolean,
    box: IGeoBounds, includePreviousPages: boolean, pageNumber: number, pageSize: number) {
    const { userId, locale, activeInFSM } = entityFieldsData;
    const [offset, limit] = computeOffsetAndLimit(includePreviousPages, pageNumber, pageSize);
    const offsetLimit = <T>(query: Query<T>) => query.offset(offset).limit(limit)
    const [overdueTasksQuery] = feedPageMyTasksQueries(plannerGroupId, activeInFSM, userId, box, open, true);
    const [tasksQuery] = feedPageMyTasksQueries(plannerGroupId, activeInFSM, userId, box, open, false);
    return multiQuery2(
        offsetLimit(tasksQuery),
        offsetLimit(overdueTasksQuery)
    ).then(resultWrapper => {
        const [otherTasks, overdueTasks] = resultWrapper.queries.result;// as [coreApi.ITask[], coreApi.IWorkOrder[]];
        //const equipmentTasks = tasks.filter(t => t.What && t.What.Type === 'Asset');        
        //const overdueTasks = tasks.filter(t => overdue(t));
        //const otherTasks = tasks.filter(t => !overdue(t));
        
        const specialItems = sortAndSliceFeed([
            ...overdueTasks.map(t => new TaskFeedItem(t, entityFieldsData))
        ], pageNumber, pageSize);

        const otherItems = sortAndSliceFeed(
            [
                ...otherTasks.map(t => new TaskFeedItem(t, entityFieldsData))
            ],
            pageNumber, pageSize, specialItems.length
        );
        
        const content = [...specialItems as typeof otherItems, ...otherItems];

        return { last: content.length < limit, itemGroups: groupItemsBySortDate(otherItems, specialItems, 'feed.group.overdue', locale) }
    });
}

export function queryFeedCustomerPage(plannerGroupId: string, entityFieldsData: EntityFieldsData, box: IGeoBounds, includePreviousPages: boolean, pageNumber: number, pageSize: number) {
    const { locale, userId } = entityFieldsData;
    const { geoBounds, serviceTerritory, active } = conditions.Asset;
    return (box == null ? Promise.resolve(null as coreApi.IAsset[]) : queryAssetsBase<coreApi.IAsset>([geoBounds(box), serviceTerritory(plannerGroupId)])).then(
        assets => {
            const [offset, limit] = computeOffsetAndLimit(includePreviousPages, pageNumber, pageSize);
            const sortOffsetLimit = <T>(query: QuerySubset<T>) => query == null ? null : query.sort('-CreatedDate Id').offset(offset).limit(limit);
            const assetIds = assets == null ? null : assets.map(a => a.Id);

            const caseConditions: ICondition<any, coreApi.Case> = assetIds == null ? conditions.Case.owner(userId) : orCondition(conditions.Case.owner(userId), conditions.Case.assets(assetIds));
            return multiQuery2(
                queryAssetsOpportunitiesBase<coreApi.IAsset_Opportunity__c>([
                    conditions.Asset_Opportunity__c.assetServiceTerritory(plannerGroupId),  
                    assetIds == null ? null : conditions.Asset_Opportunity__c.assets(assetIds)
                ]),
                queryVersionBase<{ Tender__c: string }>([conditions.Version__c.owner(userId)], ['Tender__c'])
            ).then(resultWrapper => {
                const assetOpportunities = resultWrapper.queries.result[0];
                const assetOpportunitiesIds = assetOpportunities.map(ao => ao.Opportunity__c);
                const versions = resultWrapper.queries.result[1];
                const tenderIds = versions.map(v => v.Tender__c);
                return multiQuery6(
                    sortOffsetLimit(queryComplaintsBase([caseConditions,conditions.Case.open])),
                    sortOffsetLimit(queryQueriesBase([caseConditions,conditions.Case.open])),
                    sortOffsetLimit(queryTransactionalSurveyBase([orCondition(conditions.Case.serviceTerritory(plannerGroupId), caseConditions),conditions.Case.open])),
                    sortOffsetLimit(queryOpportunitiesBase([...metricConditionsOpportunity.queryConditionsAll(assetOpportunities.map(ao => ao.Opportunity__c), userId), 
                        conditions.Opportunity.owner(userId), conditions.Opportunity.open])),
                    sortOffsetLimit(queryLeadsBase([conditions.Lead.owner(userId), conditions.Lead.open,conditions.Lead.notConverted, assetIds == null ? null : conditions.Lead.assets(assetIds)])),
                    sortOffsetLimit(queryTendersBase([conditions.Tender__c.ids(tenderIds),conditions.Tender__c.active]))
            )}).then(resultWrapper => {
                const result = resultWrapper.queries.result;// as [coreApi.ICase[], coreApi.ICase[], coreApi.IOpportunity[], coreApi.IApiLead[]];
                const oppListItems = result[3];
                return queryAssetOpportunities([conditions.Asset_Opportunity__c.opportunities(oppListItems.map(o => o.Id))])
                .then(assetOpps => {
                    const complaints = result[0].map(t => new ComplaintFeedItem(t, userId));
                    const queries = result[1].map(t => new QueryFeedItem(t, userId));
                    const transactionalSurveyCases = result[2].map(t => new TransactionalSurveyCaseFeedItem(t, userId));
                    const opps = oppListItems.map(t => new OpportunityFeedItem(t, assetOpps[t.Id]));
                    const leads = result[4].map(t => new LeadFeedItem(t, entityFieldsData));
                    const tenders = result[5].map(t => new TenderFeedItem(t));
                    const content = sortAndSliceFeed([...complaints, ...queries, ...transactionalSurveyCases, ...opps, ...leads, ...tenders] as IFeedItem[], pageNumber, pageSize);
                    return { itemGroups: groupItemsBySortDate(content, [], '', locale), last: content.length < limit }
                })
            });
        }
    )
    
}

export async function queryFeedOperationalPage(serviceTerritoryId: string, entityFieldsData: EntityFieldsData, box: IGeoBounds, 
    includePreviousPages: boolean, pageNumber: number, pageSize: number) {
    const { userId, activeInFSM, locale } = entityFieldsData;
    const [offset, limit] = computeOffsetAndLimit(includePreviousPages, pageNumber, pageSize);

    const woConds = conditions.WorkOrder;
    const swoConds = conditions.ServiceAppointment;

    const sortOffsetLimitUnplanned = <T>(query: QuerySubset<T>) => query.sort('-New_Status_Date__c').offset(offset).limit(limit)
    if(activeInFSM) {
        const resultSA = await multiQuery3(

            sortOffsetLimitUnplanned(
                queryServiceAppointmentsBase<coreApi.IServiceAppointmentForWorkOrder>(
                    [swoConds.newStatusDateNotNull,swoConds.serviceTerritory(serviceTerritoryId), swoConds.openWO(activeInFSM), swoConds.emergency, swoConds.geoBounds(box)],
                    fields.IServiceAppointmentForWorkOrder
                )
            ),
    
            sortOffsetLimitUnplanned(
                queryServiceAppointmentsBase<coreApi.IServiceAppointmentForWorkOrder>(
                    [swoConds.serviceTerritory(serviceTerritoryId), swoConds.emergency.negate(), swoConds.newStatusDate72hours(), swoConds.newWOFSM.negate(), swoConds.callout, swoConds.geoBounds(box)],
                    fields.IServiceAppointmentForWorkOrder
                )
            ),
    
            sortOffsetLimitUnplanned(
                queryServiceAppointmentsBase<coreApi.IServiceAppointmentForWorkOrder>(
                    [swoConds.serviceTerritory(serviceTerritoryId), swoConds.emergency.negate(), swoConds.newStatusDate72hours(), swoConds.newWOFSM.negate(), swoConds.callout.negate(), swoConds.geoBounds(box)],
                    fields.IServiceAppointmentForWorkOrder
                )
            ),
        );

        const [emergencySAWorkOrders,unplannedSAWorkOrders,plannedSAWorkorders] = 
            resultSA.queries.result.map(
                ws => _.uniqBy(
                    ws.map(wo => {
                        wo.Work_Order__r.New_Status_Date__c = wo.New_Status_Date__c;
                        return wo.Work_Order__r
                    }),
                    'Id'
                )
            );

        const resultWrapper = await multiQuery3(
            sortOffsetLimitUnplanned(queryWorkOrders<coreApi.IWorkOrderForListItemSupervisorWillManage>(
                [woConds.serviceTerritory(serviceTerritoryId), woConds.open(activeInFSM), woConds.emergencyFSM, woConds.geoBounds(box), woConds.ids(emergencySAWorkOrders.map(w => w.Id)).negate()],
                fields.IWorkOrderForListItemSupervisorWillManage
            )),
            sortOffsetLimitUnplanned(queryWorkOrders<coreApi.IWorkOrderForListItemSupervisorWillManage>(
                [woConds.serviceTerritory(serviceTerritoryId), woConds.emergencyFSM.negate(), woConds.newStatusDate72hours(), woConds.newFSM.negate(), woConds.callout, woConds.geoBounds(box),woConds.ids(unplannedSAWorkOrders.map(w => w.Id)).negate()],
                fields.IWorkOrderForListItemSupervisorWillManage
            )),
            sortOffsetLimitUnplanned(queryWorkOrders<coreApi.IWorkOrderForListItemSupervisorWillManage>(
                [woConds.serviceTerritory(serviceTerritoryId), woConds.emergencyFSM.negate(), woConds.newStatusDate72hours(), woConds.newFSM.negate(), woConds.callout.negate(), woConds.geoBounds(box), woConds.ids(plannedSAWorkorders.map(w => w.Id)).negate()],
                fields.IWorkOrderForListItemSupervisorWillManage
            ))
        );

        const [emergencyWorkOrders, unplannedWorkOrders, plannedWorkorders] = resultWrapper.queries.result;
        const emergencyWorkOrdersAll = [...emergencySAWorkOrders, ...emergencyWorkOrders];
        const unplannedWorkOrdersAll = [...unplannedSAWorkOrders, ...unplannedWorkOrders];
        const plannedWorkordersAll = [...plannedSAWorkorders, ...plannedWorkorders];

        const emergencies = sortAndSliceFeed(emergencyWorkOrdersAll.map(wo => new CalloutFeedItem(wo, entityFieldsData)), pageNumber, pageSize);
        const other = sortAndSliceFeed(
            [...unplannedWorkOrdersAll.map(wo => new CalloutFeedItem(wo, entityFieldsData)), 
            ...plannedWorkordersAll.map(wo => new PlannedWorkorderFeedItem(wo, entityFieldsData))],
            pageNumber, pageSize, emergencies.length
        );
        //const mbms = sortAndSliceFeed(mbmsWorkorders.map((wo: any) => new MbmFeedItem(wo, userId)), pageNumber, pageSize, emergencies.length);

        const content = emergencies.concat(other)
        return {
            last: content.length < limit, itemGroups: groupItemsBySortDate(other, emergencies, 'feed.group.entrapments', entityFieldsData.locale)
        }
    } else {
        // Konect-specific logic - fetch workorders directly instead of going through SAs and order based on WO's new_status_date instead
        const resultWrapper = await multiQuery3(
            sortOffsetLimitUnplanned(queryWorkOrders<coreApi.IWorkOrderForListItemSupervisorWillManage>(
                [woConds.serviceTerritory(serviceTerritoryId), woConds.newStatusDateNotNull, woConds.open(activeInFSM), woConds.emergencyKonect, woConds.geoBounds(box)],
                fields.IWorkOrderForListItemSupervisorWillManage
            )),
            sortOffsetLimitUnplanned(queryWorkOrders<coreApi.IWorkOrderForListItemSupervisorWillManage>(
                [woConds.serviceTerritory(serviceTerritoryId), woConds.emergencyKonect.negate(), woConds.newKonect.negate(), woConds.newStatusDate72hours(), woConds.callout, woConds.geoBounds(box)],
                fields.IWorkOrderForListItemSupervisorWillManage
            )),
            sortOffsetLimitUnplanned(queryWorkOrders<coreApi.IWorkOrderForListItemSupervisorWillManage>(
                [woConds.serviceTerritory(serviceTerritoryId), woConds.emergencyKonect.negate(), woConds.newKonect.negate(), woConds.newStatusDate72hours(), woConds.callout.negate(), woConds.geoBounds(box)],
                fields.IWorkOrderForListItemSupervisorWillManage
            ))
        );
        var emergencyWorkOrders = resultWrapper.queries.result[0];
        var unplannedWorkOrders = resultWrapper.queries.result[1];
        var plannedWorkorders = resultWrapper.queries.result[2];

        const emergencies = sortAndSliceFeed(emergencyWorkOrders.map(wo => new CalloutFeedItem(wo, entityFieldsData)), pageNumber, pageSize);
        const other = sortAndSliceFeed(
            unplannedWorkOrders.map(wo => new CalloutFeedItem(wo, entityFieldsData)).concat(plannedWorkorders.map(wo => new PlannedWorkorderFeedItem(wo, entityFieldsData)))
            , pageNumber, pageSize, emergencies.length);
        //const mbms = sortAndSliceFeed(mbmsWorkorders.map((wo: any) => new MbmFeedItem(wo, userId)), pageNumber, pageSize, emergencies.length);

        const content = emergencies.concat(other)
        return {
            last: content.length < limit, itemGroups: groupItemsBySortDate(other, emergencies, 'feed.group.entrapments', locale)
        }
    }
}

export async function queryFeedNotificationsPage(
    serviceTerritoryId: string, 
    entityFieldsData: EntityFieldsData, 
    box: IGeoBounds, 
    includePreviousPages: boolean, 
    pageNumber: number, 
    pageSize: number
) {
    const smtNotifConds = conditions.SMT_Notification__c;

    
    const allNotificationReads = await querySMTNotificationReads([
        conditions.SMT_Notification_Read__c.user(entityFieldsData.userId)
    ]);

    const [offset, limit] = computeOffsetAndLimit(includePreviousPages, pageNumber, pageSize);
    const res = await querySMTNotifications([
        smtNotifConds.createdDateAfter(moment().subtract(14, 'days')),
        orCondition(
            andCondition(smtNotifConds.serviceTerritory(serviceTerritoryId), smtNotifConds.userId(null)),
            smtNotifConds.userId( entityFieldsData.userId ),
            andCondition(
                smtNotifConds.serviceTerritory(null), smtNotifConds.userId(null)
            )
        ),
        conditions.SObject.ids(allNotificationReads.map(n => n.SMT_Notification__c)).negate()
    ]).sort('-CreatedDate').offset(offset).limit(limit);

    /*
    const notificationReads = await querySMTNotificationReads([
        conditions.SMT_Notification_Read__c.user(entityFieldsData.userId), 
        conditions.SMT_Notification_Read__c.notifications(res.map(n => n.Id))
    ]);
    const notificationReadsById = _.groupBy(notificationReads, 'SMT_Notification__c');
    const notifRead = notificationReadsById[n.Id] && notificationReadsById[n.Id].length > 0));
    */

    const notifications = res.map(n => new NotificationFeedItem(n, entityFieldsData, false));
    const other = sortAndSliceFeed(notifications, pageNumber, pageSize, notifications.length);

    return {
        last: notifications.length < limit, itemGroups: groupItemsBySortDate(other, [], '', entityFieldsData.locale)
    }
}

export async function queryFeedAuditsPage(entityFieldsData: EntityFieldsData, open: boolean, includePreviousPages: boolean, pageNumber: number, pageSize: number) {
    const [offset, limit] = computeOffsetAndLimit(includePreviousPages, pageNumber, pageSize);
    const { userId } = entityFieldsData;

    const allAuditsResults = await queryKffBase();
    const filteredAuditsResults = filterKffFieldAuditsOpen(allAuditsResults);
    const auditNumbers = _.map(filteredAuditsResults, item => item.audit_id.toString());
    const events = await queryEventsBase<coreApi.EventForAudit>([conditions.Event.createdBy(userId),conditions.Event.auditNumbers(auditNumbers)], fields.EventForAudit);

    const eventByAuditNumber = _.keyBy(events, 'Audit_Number__c');
    const closedAudits: coreApi.IAuditApi[] = [], openAudits: coreApi.IAuditApi[] = [];
    for(const audit of filteredAuditsResults) {
        const relatedEvent = eventByAuditNumber[audit.audit_id.toString()];
        if(relatedEvent != null) {
            closedAudits.push(audit);
        } else {
            openAudits.push(audit);
        }
    }

    const selectedAudits = open ? openAudits : closedAudits;

    const audits = selectedAudits.map(audit => new AuditFeedItem(audit, entityFieldsData))
    return {
        last: audits.length < limit,
        itemGroups: groupItems(
            sortFeed(audits, false),
            [], '', t => t.technicianName
        )
    }
}

export function queryFeedAuditsCounters(plannerGroupId: string, activeInFSM: boolean, userId: string) {
    let closedAudits: coreApi.IAuditApi[] = [], openAudits: coreApi.IAuditApi[] = [], filteredAudits: coreApi.IAuditApi[] = [];

    return queryKffBase().then(allAuditsResults => filterKffFieldAuditsOpen(allAuditsResults))
        .then(filteredAuditsResults => {
            filteredAudits = filteredAuditsResults;
            const auditNumbersToString = _.map(filteredAudits, item => {
                                                  return item.audit_id.toString();
                                                })
            return queryEventsBase<coreApi.EventForAudit>([conditions.Event.createdBy(userId),conditions.Event.auditNumbers(auditNumbersToString)], fields.EventForAudit);
        })
        .then(events => {
            for(const audit of filteredAudits) {
                var isOpen = true;
                for(const event of events) {
                    if(audit.audit_id.toString() == event.Audit_Number__c) {
                        closedAudits.push(audit);
                        isOpen = false;
                        continue;
                    }
                }
                if(isOpen) {
                    openAudits.push(audit);
                }                
            }

            return ({
            open: openAudits.length,
            closed: closedAudits.length
            })
        })
}

function sortAndSliceFeed<T extends ISortDate>(items: T[], pageNumber: number, pageSize: number, previousItems = 0, ascending: boolean = true) {
    return sliceFeed(sortFeed(items, ascending), pageNumber, pageSize, previousItems);
}

function sliceFeed<T>(items: T[], pageNumber: number, pageSize: number, previousItems = 0) {
    return items.slice(0, pageNumber * pageSize - previousItems);
}

function sortFeed<T extends ISortDate>(items: T[], descending: boolean = true) {
    const signum = descending ? 1 : -1;
    return items.sort((fi1, fi2) => { 
        const res = signum * (moment(fi2.sortDate).valueOf() - moment(fi1.sortDate).valueOf()); 
        //console.log(fi1.title, fi2.title, fi1.title.localeCompare(fi2.title));
        return res == 0 ? signum * fi1.id.localeCompare(fi2.id) : res;
    });
}