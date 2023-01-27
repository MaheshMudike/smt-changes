import * as coreApi from '../../models/api/coreApi';
import * as userApi from '../../models/api/userApi';
import * as moment from 'moment';
import * as fields from "./queryFields";
import * as _ from 'lodash';

import { IAsyncActionNames } from '../actionUtils';

import { IGlobalState } from '../../models/globalState';
import { query, update, insert, insertMany, restGet, 
    queryWithConditions, multiQuery5, momentToSfDateTime, momentToSfDateTimeString, requestGet, multiQuery1, multiQuery2, StatusWrapper, multiQuery1Extract, upsert, del, queryWithConditionsSimple, joinQueries } from './jsforceCore';

import { IDetailedContact, AssetLocation } from '../../models/api/coreApi';
import { conditions, conditionsFields, ICondition, conditionsFilter, orCondition, andCondition, IConditionAnyResult } from './jsforceMappings';

import { SObject } from './jsforceMappings';
import { TechnicianDetailsSetType } from '../../models/technicianDetails/ITechnicianDetails';
import { queryUsersBase, queryAssetsBase, queryContactsBase, queryWorkOrdersBase, queryCasesBase, 
        queryServiceTerritoryMemberBase, querySMTConfiguration, querySMTUserInfo,
        queryContractLinesBase, queryTimesheetEntriesBase, queryTendersBase,
        queryAssetsOpportunitiesBase, queryAssignedResources, queryServiceAppointmentsBase, queryResourceAbsenceBase, queryPermissionSetAssignments, queryServiceResourcesBase, queryContentVersionsBase, queryFSMServiceVisitHistoryBase, queryWorkOrders, queryContentDocumentLinkBase, queryContentDocumentBase} from './jsforceBase';
import { AdminType } from '../../models/user/UserRole';
import { asyncHttpActionGeneric } from './httpActions';
import { IEventFromEventCreationDialog } from '../../components/modals/events/EventCreationDialog';


export function queryMapServiceResourcesForServiceTerritory(serviceTerritoryId: string, inactiveTimeLimitDays: number, serviceResourceEnabled: boolean) {
    return queryMapServiceResources([conditions.ServiceTerritoryMember.serviceTerritory(serviceTerritoryId), conditions.ServiceTerritoryMember.effectiveEndDate()], inactiveTimeLimitDays, serviceResourceEnabled);
}

const TECHNICIAN_ABSENT_DAYS = 10;

function technicianStatus(serviceAppointments: coreApi.IServiceAppointment[], calloutsById: _.Dictionary<coreApi.IWorkOrderEmergency>): TechnicianStatus {

    if(serviceAppointments == null || serviceAppointments.length == 0) return TechnicianStatus.Inactive;

    /*
    const recentServiceAppointments = serviceAppointments.filter(
        conditions.ServiceAppointment.actualStartTime(moment().add(-TECHNICIAN_ABSENT_DAYS, 'days')).isFullfilledBy
    );
    */

    for(const sa of serviceAppointments) {
        if(sa.StatusCategory === ServiceAppointmentStatusCategory.InProgress && calloutsById[sa.ParentRecordId] != null) {
            const callout = calloutsById[sa.ParentRecordId];
            return conditions.WorkOrder.emergencyFSM.isFullfilledBy(callout) ? TechnicianStatus.EmergencyCallout : TechnicianStatus.Callout;
        }

        if(sa.StatusCategory === ServiceAppointmentStatusCategory.InProgress
            || sa.StatusCategory === ServiceAppointmentStatusCategory.Completed
            //|| sa.StatusCategory === ServiceAppointmentStatusCategory.Dispatched
            //|| sa.StatusCategory === ServiceAppointmentStatusCategory.Scheduled
            ) return TechnicianStatus.Working;
    }
    return TechnicianStatus.Absent;
}

export async function queryMapServiceResources(conds: ICondition<coreApi.IServiceTerritoryMember, coreApi.IServiceTerritoryMember>[], inactiveTimeLimitDays: number, serviceResourceEnabled: boolean) {
    const stms = await queryServiceTerritoryMemberBase(conds, fields.IServiceTerritoryMemberForMap);
    const stmserviceResource = stms.map(stm => stm.ServiceResource);
    const serviceResources = _.uniqBy(stmserviceResource,sr=>sr.Id);
    const serviceResourceIds = serviceResources.map(sr => sr.Id);    
    const [statusById, serviceAppointmentWorkOrderLocationById] = await Promise.all([
        queryServiceAppointmentTechnicianStatus(serviceResourceIds, inactiveTimeLimitDays),
        queryCurrentServiceAppointmentWorkOrderLocationByTechnician(serviceResourceIds)
    ]);

    const completedWorkOrderByTechnician = await queryWorkOrdersCompletedByTechnician(serviceResourceIds);

    return serviceResources.map(sr => {
        const serviceAppointmentWorkOrderLocation = serviceAppointmentWorkOrderLocationById[sr.Id] && serviceAppointmentWorkOrderLocationById[sr.Id].Asset;
        const completedWorkOrder = completedWorkOrderByTechnician[sr.Id] && completedWorkOrderByTechnician[sr.Id][0];
        const completedWorkOrderAsset = completedWorkOrder && completedWorkOrderByTechnician[sr.Id][0].Asset;       
        return new TechnicianMapItem(sr, serviceResourceEnabled ? technicianStatusFromWorkOrder(completedWorkOrder) : statusById[sr.Id], serviceResourceEnabled ? completedWorkOrderAsset : serviceAppointmentWorkOrderLocation, true)
    });
}

export function technicianStatusFromWorkOrder(workOrder: coreApi.IWorkOrderEmergency): TechnicianStatus {
    if(workOrder == null) return TechnicianStatus.Absent;

    if(conditions.WorkOrder.callout.isFullfilledBy(workOrder)) {
        return conditions.WorkOrder.emergencyFSM.isFullfilledBy(workOrder) ? TechnicianStatus.EmergencyCallout : TechnicianStatus.Callout;
    }

    return TechnicianStatus.Working;
}

export async function queryWorkOrdersCompletedByTechnician(serviceResourceIds: string[]) {
    // const IdsChunk = _.chunk(serviceResourceIds,5);
    // const completedWorkOrders1 =  await joinQueries(
    //     ...IdsChunk.map(ids=>
    //         multiQuery1(queryWorkOrdersBase<coreApi.IWorkOrderEmergency & { Asset: AssetLocation, Completed_By__c: string, WorkOrderNumber: string }>(
    //             [conditions.WorkOrder.completedBy(ids)],
    //             [...fields.IWorkOrderEmergency, 'Completed_By__c', 'WorkOrderNumber', ...fields.childToParentQueryFields('Asset', fields.AssetLocation)]
    //         ).sort('Completed_Date__c', 'DESC'))))
            
        const completedWorkOrders =  await joinQueries(
            ...serviceResourceIds.map(ids=>
                multiQuery1(queryWorkOrdersBase<coreApi.IWorkOrderEmergency & { Asset: AssetLocation, Completed_By__c: string, WorkOrderNumber: string, Service_Order_Number__c: string}>(
                    [conditions.WorkOrder.completedBy([ids]), conditions.WorkOrder.technicianCurrentWO, conditions.WorkOrder.newStatusDateNotNull],
                    [...fields.IWorkOrderEmergency, 'Completed_By__c', 'WorkOrderNumber','Service_Order_Number__c', ...fields.childToParentQueryFields('Asset', fields.AssetLocation)]
                ).sort('New_Status_Date__c', 'DESC'))))        
        return _.groupBy(completedWorkOrders.queries.result[0], 'Completed_By__c');
    // return _.groupBy(completedWorkOrders1.queries.result[0], wo => wo.Completed_By__c);
    // const completedWorkOrders = await multiQuery1Extract(
    //     queryWorkOrdersBase<coreApi.IWorkOrderEmergency & { Asset: AssetLocation, Completed_By__c: string, WorkOrderNumber: string }>(
    //         [conditions.WorkOrder.completedBy(serviceResourceIds)],
    //         [...fields.IWorkOrderEmergency, 'Completed_By__c', 'WorkOrderNumber', ...fields.childToParentQueryFields('Asset', fields.AssetLocation)]
    //     ).sort('Completed_Date__c', 'DESC')
    // );
    // return _.groupBy(completedWorkOrders, wo => wo.Completed_By__c);
}

async function queryMapServiceResourcesKonect(serviceResourceIds: string[], inactiveTimeLimitDays: number) {
    const serviceResources = await queryServiceResourcesBase<coreApi.IServiceResourceMapItem>([conditions.ServiceResource.ids(serviceResourceIds)], fields.IServiceResourceMapItem);
    const statusById = await queryServiceAppointmentTechnicianStatus(serviceResources.map(sr => sr.Id), inactiveTimeLimitDays);
    return serviceResources.map(sr => new TechnicianMapItem(sr, statusById[sr.Id], null, false));
}

export async function queryServiceAppointmentTechnicianStatus(serviceResourceIds: string[], inactiveTimeLimitDays: number) {
    
    const timeLimitDays = inactiveTimeLimitDays == null || inactiveTimeLimitDays < TECHNICIAN_ABSENT_DAYS ? TECHNICIAN_ABSENT_DAYS : inactiveTimeLimitDays;
    const dateLimit = moment().add(-timeLimitDays, 'days');

    const serviceAppointments = await multiQuery1Extract(
        queryServiceAppointmentsBase([conditions.ServiceAppointment.assignedServiceResources(serviceResourceIds), conditions.ServiceAppointment.actualStartTime(dateLimit)])
    );

    // multiQuery1Extract(queryWorkOrdersBase<WorkOrderForServiceOrdersReport>([serviceTerritory(serviceTerritoryId), startDateBetween(startDate, endDate), open], fields.IWorkOrderForServiceOrdersReport));    

    const serviceAppointmentsByResource = _.groupBy(serviceAppointments, 'Assigned_Service_Resource__c');

    const inProgressServiceAppointments = serviceAppointments.filter(sa => sa.StatusCategory === ServiceAppointmentStatusCategory.InProgress);
    const callouts = await queryWithConditions<coreApi.IWorkOrderEmergency, coreApi.WorkOrder>(
        [conditions.WorkOrder.callout, conditions.SObject.ids(inProgressServiceAppointments.map(sa => sa.ParentRecordId))], SObject.WorkOrder, fields.IWorkOrderEmergency
    );
    const calloutsById = _.keyBy(callouts, 'Id');
    return _.fromPairs(
        serviceResourceIds.map(sri => [sri, technicianStatus(serviceAppointmentsByResource[sri], calloutsById)])
    ) as _.Dictionary<TechnicianStatus>
}

export async function queryCurrentServiceAppointmentWorkOrderLocationByTechnician<T = coreApi.IWorkOrderLocation>(serviceResourceIds: string[], queryFields: string[] = fields.IWorkOrderLocation) {
    // const inProgressServiceAppointments = await multiQuery1Extract(
    //     queryServiceAppointmentsBase([
    //         conditions.ServiceAppointment.assignedServiceResources(serviceResourceIds),
    //         // conditions.ServiceAppointment.statusCategory([ServiceAppointmentStatusCategory.InProgress])
    //         conditions.ServiceAppointment.newStatusDateNotNull
    //     ]).sort('New_Status_Date__c', 'DESC')
    // );

    const serviceAppointments = await joinQueries(
        ...serviceResourceIds.map(id =>
            multiQuery1(
                queryServiceAppointmentsBase([
                    conditions.ServiceAppointment.assignedServiceResources([id]),
                    // conditions.ServiceAppointment.statusCategory([ServiceAppointmentStatusCategory.InProgress])
                    conditions.ServiceAppointment.newStatusDateNotNull
                ]).sort('New_Status_Date__c', 'DESC')
            ))
    )

    console.log('serviceAppointments--->',serviceAppointments.queries.result[0]);
    
    const mostRecentServiceAppointmentByResource = _.mapValues(_.groupBy(serviceAppointments.queries.result[0], 'Assigned_Service_Resource__c'), saps => saps[0]);
    console.log('mostRecentServiceAppointmentByResource--->',mostRecentServiceAppointmentByResource);
    

    const workorders = await queryWithConditions<T, coreApi.WorkOrder>(
        [conditions.SObject.ids(_.values(mostRecentServiceAppointmentByResource).map(sa => sa.ParentRecordId))], SObject.WorkOrder, queryFields
    );
    const workordersById = _.keyBy(workorders, 'Id');

    return _.mapValues(mostRecentServiceAppointmentByResource, sapp => workordersById[sapp.ParentRecordId]);
}

export function queryUsersByNameSearch(search: string) {
    return queryUsersBase([conditions.User.nameLike('%'+search+'%')])
}

export function smtUserInfoDefault(userId: string): userApi.SMT_User_Info__c {
    return {
        User__c: userId, User_id__c: userId, Admin_Sales_Organizations__c: '[]', 
        Admin_Type__c: AdminType.None, Last_Activity__c: null as string, Last_Login__c: null as string
    };
}

export function queryUser(userId: string) {
    return queryWithConditions<userApi.IUser, userApi.User>([conditions.SObject.id(userId)], SObject.User, fields.IUser);
}

export function queryUserAndConfig(userId: string, environment: string): Promise<[userApi.IUserExtended, userApi.SMT_Configuration__mdt]> {    
    const multi = multiQuery5(
        queryUser(userId),
        queryPermissionSetAssignments<{ PermissionSet: { Name: string } }>(
            [conditions.PermissionSetAssignment.assignee(userId)], ['PermissionSet.Name']
        ),
        query<userApi.IServiceTerritory>({
            IsActive: { $eq: true },
            //Active_In_FSM__c: { $eq: true }
        }, SObject.ServiceTerritory, fields.IServiceTerritory).sort('Name', 'ASC'),
        querySMTUserInfoForUser(userId),
        querySMTConfiguration(environment)
    ).then(
        resultWrapper => {
            const [[user], permissionAssignments, territories, [smtUserInfo], [smtConfig]] = resultWrapper.queries.result;

            const permissionSetNames = permissionAssignments.map(pas => pas.PermissionSet.Name);
            const gpsPermissionSet = permissionSetNames.includes('SMT_3_0_GPS');

            const now = moment();
            
            const userInfo = { ...(smtUserInfo == null ? smtUserInfoDefault(userId) : smtUserInfo), 
                Last_Activity__c: momentToSfDateTimeString(now), Last_Login__c: momentToSfDateTimeString(now) }

            const smtUserInfoPromise: Promise<userApi.SMT_User_Info__c> = userInfo.Id == null ? 
                insert(SObject.SMT_User_Info__c, userInfo).then(id => { return { Id: id as string, ...userInfo } as userApi.SMT_User_Info__c })
                : update(SObject.SMT_User_Info__c, { ...userInfo, }).then(result => userInfo );
            return smtUserInfoPromise.then(
                smtUserInfo => {
                    return [{ ...user, userBranches: territories, smtUserInfo, gpsPermissionSet }, smtConfig] as [userApi.IUserExtended, userApi.SMT_Configuration__mdt];
                }
            );            
        }
    );
    return multi;
}

export function querySMTUserInfoForUser(userId: string) {
    return querySMTUserInfo([conditions.SMT_User_Info__c.user(userId)]).sort('CreatedDate', 'ASC');
}

export function querySMTUsers() {
    return queryPermissionSetAssignments([conditions.PermissionSetAssignment.name('SMT_3_0')]).then(assignments => {
        const AssigneeIdsChunks = _.chunk(assignments.map(a => a.AssigneeId), 500);
        return joinQueries(
            ...AssigneeIdsChunks.map(ids =>
                multiQuery1(
                    queryUsersBase([conditions.User.ids(ids)]).sort('Username', 'ASC')
                )
            )
        ).then(wrapper => {
            const users = wrapper.queries.result[0];
            const userIdsChunks = _.chunk(users.map(u => u.Id), 500);
            return joinQueries(
                ...userIdsChunks.map(ids =>
                    multiQuery1(
                        querySMTUserInfo([conditions.SMT_User_Info__c.users(ids)])
                    )
                )
            ).then(wrapper2 => {
                const userInfos = wrapper2.queries.result[0];
                const userInfosByUserId = _.keyBy(userInfos, 'User__c');
                const res = users.map(user => {
                    let smtUserInfo = userInfosByUserId[user.Id];
                    return [user, smtUserInfo] as [userApi.IUser, userApi.SMT_User_Info__c];
                });
                return res;
            })  
        })
    })     
}

function queryAccountContactRelation(conditions: IConditionAnyResult<coreApi.IAccountContactRelation>[] = [],) {
    return queryWithConditionsSimple<coreApi.IAccountContactRelation>(conditions, SObject.AccountContactRelation, fields.IAccountContactRelation);
}

export function queryContactsForAccountsByAccountContactRelationship(accountIds: string[]) {
    return multiQuery1(queryAccountContactRelation([conditions.AccountContactRelation.accountIds(accountIds)]))
        .then(wrapper => {
            const relations = wrapper.queries.result[0];
            const contactIds = _.uniq(relations.map(r => r.ContactId));
            return contactIds.length > 0 ? multiQuery1(queryContactsBase<coreApi.IDetailedContact>([conditions.Contact.ids(contactIds)]).sort('Name')).then(result => result.queries.result[0]) : [];
        });
}

export function queryContactsForAccountsByAccountContactRelationshipGrouped(accountIds: string[]): Promise<_.Dictionary<coreApi.IDetailedContact[]>> {
    return multiQuery1(queryAccountContactRelation([conditions.AccountContactRelation.accountIds(accountIds)]))
        .then(wrapper => {
            const relations = wrapper.queries.result[0];
            const contactIds = relations.map(r => r.ContactId);
            return contactIds.length <= 0 ? {} : multiQuery1(queryContactsBase<coreApi.IDetailedContact>([conditions.Contact.ids(contactIds)]))
            .then(wrapper => {
                const cs = wrapper.queries.result[0];
                const contactsById = _.keyBy(cs, 'Id');
                const contactsByAccount: _.Dictionary<IDetailedContact[]> = {};
                relations.forEach(r => {
                    var contactsForAccount = contactsByAccount[r.AccountId];
                    if(contactsForAccount == null) {
                        contactsForAccount = [];
                        contactsByAccount[r.AccountId] = contactsForAccount;
                    }
                    const relationContact = contactsById[r.ContactId];
                    if(relationContact != null) contactsForAccount.push(relationContact);
                });
                return contactsByAccount;
            })
        });    
}

export function queryMapEquipments(condition: ICondition<coreApi.IEquipmentMapItem, coreApi.IAssetSobject>[]) {
    return multiQuery1(queryAssetsBase<coreApi.IApiId>(condition, fields.IApiNameAndId))
    .then(async wrapper => {
        const ids = wrapper.queries.result[0].map(i => i.Id);
        const idsChunk = _.chunk(ids, 200);
        const asset = await joinQueries(
            ...idsChunk.map(ids => multiQuery1(queryAssetsBase<coreApi.IEquipmentMapItem>([...condition, conditions.Asset.ids(ids)], fields.IEquipmentMapItem)))
        ).then(wrapper => wrapper.queries.result[0]);
       return queryEquipmentContractLines2(asset)
    })
    .then(assets => {
        return assets.filter(a => a.Geolocation__Longitude__s != null && a.Geolocation__Latitude__s != null)
    });    
}

export function queryMapOpportunitiesForTerritory(serviceTerritoryId: string) {  
    if(isAndroid()){ firebaseStartTrace('Map Opportunity trace') }  
    return queryMapOpportunities(
        [conditions.Asset_Opportunity__c.assetServiceTerritory(serviceTerritoryId), conditions.Asset_Opportunity__c.open]
    );
};

import { OpportunityMapItem, TechnicianMapItem } from '../../models/map/wrappers';
import { ServiceAppointmentStatusCategory } from '../../constants/ServiceAppointmentStatusCategory';
import { TechnicianStatus } from '../../constants/TechnicianStatus';
import { queryServiceOrdersReport } from '../integration/serviceOrdersReportActions';
import { Identifiable } from 'src/models/feed/ISObject';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';

export function assetOpportunityLocations(assetOpps: { Asset__r: { Geolocation__Longitude__s: number, Geolocation__Latitude__s: number } }[]) {
    if(assetOpps == null) return [];
    return assetOpps.map(assetOpp => {
        const asset = assetOpp.Asset__r;
        return { lng: asset.Geolocation__Longitude__s, lat: asset.Geolocation__Latitude__s};
    });
}

export function queryMapOpportunities(conditions: ICondition<coreApi.IAsset_Opportunity__c, coreApi.IAsset_Opportunity__c>[]) {
    return queryAssetOpportunities(conditions).then(
        assetOppsByOppId => {
            return Object.keys(assetOppsByOppId).map(id => {
                const businessTypes = assetOppsByOppId[id].map(assetOpp => {
                    const opp: coreApi.IOpportunity = (assetOpp as any).Opportunity__r;
                    return opp && opp.Business_Type__c;
                }).filter(bt => bt != null)
                //return ({ id, coordinates }) as mapApi.IOpportunityMapItem;
                if(isAndroid()){ firebaseStopTrace('Map Opportunity trace') }
                return new OpportunityMapItem(id, assetOppsByOppId[id], businessTypes[0]);
            });
        }
    );
};

export function queryAssetOpportunities(conditions: IConditionAnyResult<coreApi.IAsset_Opportunity__c>[]) {
    // return queryAssetsOpportunitiesBase<coreApi.IAsset_Opportunity_Address__c>(conditions, fields.IAsset_Opportunity_Address__c)
    return queryAssetsOpportunitiesBase<coreApi.IAsset_Opportunity_Address__c>(conditions, fields.IAsset_Opportunity_Detailed__c)

        .then(assetOpps => {
            const assetOppsByOppId = _.groupBy(assetOpps, 'Opportunity__c');
            return assetOppsByOppId;
        });
};

export function queryMapWorkOrdersForTerritory(territoryId: string, activeInFSM: boolean) {
    return queryMapWorkOrders([conditions.WorkOrder.serviceTerritory(territoryId), conditions.WorkOrder.openFSMandKonect]);
};

// export function queryMapWorkOrders(conditions: ICondition<coreApi.IWorkOrderMapItem, coreApi.WorkOrder>[]) {
//     return multiQuery1Extract(
//         queryWithConditions<coreApi.IWorkOrderMapItem, coreApi.WorkOrder>(conditions, SObject.WorkOrder, fields.IWorkOrderMapItem)
//     ).then(wos => wos.filter(wo => wo.Asset && wo.Asset.Geolocation__Longitude__s != null && wo.Asset.Geolocation__Latitude__s != null));    
// };

export async function queryMapWorkOrders(condition: ICondition<coreApi.IWorkOrderMapItem, coreApi.WorkOrder>[]) {
    const IdsChunk = await multiQuery1(queryWorkOrdersBase(condition,['Id'])).then(res => {             
            return _.chunk(res.queries.result[0].map(wo=> wo.Id),500);
         });

    const wos = await joinQueries(
    ...IdsChunk.map(ids =>
        multiQuery1(queryWithConditions<coreApi.IWorkOrderMapItem, coreApi.WorkOrder>([conditions.WorkOrder.ids(ids)],SObject.WorkOrder,fields.IWorkOrderMapItem
        )))).then(res => { return res.queries.result[0] })

    return wos.filter(wo => wo.Asset && wo.Asset.Geolocation__Longitude__s != null && wo.Asset.Geolocation__Latitude__s != null);
    }

export function queryAccountIdsForTerritory(territoryId: string) {
    return multiQuery1Extract(queryAssetsBase([conditions.Asset.serviceTerritory(territoryId)], ['AccountId']))
        .then(
            assets => _.uniq(assets.map(a => (a as any).AccountId as string).filter(id => id != null))
        );
}

export function queryAssetsForTerritoryStopped(territoryId: string, fieldsToQuery: string[] = fields.IAsset) {    
    //see https://siilisolutions.atlassian.net/wiki/spaces/KONESMT/pages/125980335/Display+Stopped+Equipment+tile
    return queryAssetsBase<coreApi.IAsset>([conditions.Asset.serviceTerritory(territoryId), conditions.Asset.stopped, conditions.Asset.active], fieldsToQuery);
}

export function queryEquipmentsByIds(ids: string[]): Promise<coreApi.IAssetExtended[]> {
    return multiQuery1Extract(queryAssetsBase<coreApi.IAsset>([conditions.SObject.ids(ids)])).then(assets=> queryEquipmentLastServiceOrder(assets))
};

export function queryEquipmentLastServiceOrder(assets: coreApi.IAsset[]) {
    return queryEquipmentContractLines2(assets)
    .then(assets => 
        //queryWorkOrdersBase([conditions.WorkOrder.asset(assets.map(a => a.Id))]).sort('CreatedDate', 'ASC').then(orders => 
        {

        return multiQuery1Extract(
                queryWorkOrdersBase<coreApi.WorkOrderForField>([conditions.WorkOrder.asset(assets.map(a => a.Id))], fields.WorkorderForField).sort('CreatedDate', 'ASC')
            )
            .then(wos => queryWorkordersWithServiceAppointments(wos))
            .then(ordersWithContractLines => {
                const orderByAsset = _.groupBy(ordersWithContractLines, 'Asset.Id');
                const now = moment();
                return assets.map(a => {
                    const assetOrders = orderByAsset[a.Id] || [];
                    
                    //01 = Equipment running, back to normal operation
                    //02 = Equipment running, back to normal operation
                    //03 = Equipment not running or will still be out of order
                    //04 = Equipment secured
                    const stoppedEquipmentOrders = assetOrders.filter(o => 
                        o.Equipment_Condition_On_Departure__c == '03' || o.Equipment_Condition_On_Departure__c == '04');
                    const startedEquipmentOrders = assetOrders.filter(o => o.Equipment_Condition_On_Departure__c == '01' || o.Equipment_Condition_On_Departure__c == '02');
                    //maybe check status on arrival to determnine if equipment was started/stopped
                    const lastEquipmentStartedOrder = startedEquipmentOrders && startedEquipmentOrders[startedEquipmentOrders.length -1];
                    const lastEquipmentStoppedOrder = stoppedEquipmentOrders && stoppedEquipmentOrders[stoppedEquipmentOrders.length -1];
                    
                    const nextMbm = assetOrders.find(
                        wo => conditions.WorkOrder.mbm.isFullfilledBy(wo) && moment(wo.StartDate).isSameOrAfter(now) 
                            && conditions.WorkOrder.statusCompleted.isNotFullfilledBy(wo)
                    );

                    const lastServiceOrder = assetOrders.length > 0 && assetOrders[assetOrders.length - 1];
                    return  { ...a, lastServiceOrder, lastEquipmentStartedOrder, lastEquipmentStoppedOrder, nextMbm } as coreApi.IAssetExtended;
                    //return assetOrders && assetOrders.length > 0 ? { ...a, lastServiceOrder: assetOrders[assetOrders.length - 1] } as coreApi.IAssetExtended : a;
                });
            })
        }
    )        
}
/*
export function queryEquipmentContractLines(equipmentIds: string[]) {
    return queryContractLinesBase<coreApi.IContractLineItem>([conditions.ContractLineItem.assets(equipmentIds), conditions.ContractLineItem.active]);
}
*/
export function queryEquipmentContractLines2<T extends coreApi.IApiId>(assets: T[]) {
    const assetIdsChunks = _.chunk(assets.map(a => a.Id), 500);

    return joinQueries(
        ...assetIdsChunks.map(ids =>
            multiQuery1(
                queryContractLinesBase<coreApi.IContractLineItem>([conditions.ContractLineItem.assets(ids)])
            )
        )
    )
    .then(
        wrapper => {
            const allContractLines = wrapper.queries.result[0];
            const contractLinesByAsset = _.groupBy(allContractLines, 'AssetId');
            const res = [] as (T & { contractLines: coreApi.IContractLineItem[], activeContractLines: coreApi.IContractLineItem[] })[];
            assets.forEach(a => {
                const contractLines = contractLinesByAsset[a.Id] || [];
                res.push({ ...a, 
                    contractLines, 
                    activeContractLines: contractLines.filter(cl => conditions.ContractLineItem.active.isFullfilledBy(cl))
                });
            });
            return res;
        }
    );
}

/*
export function queryOpportunitiesForOwner(userId: string, options: ICondition<coreApi.IOpportunity>[], fieldsToQuery: string[] = fields.IOpportunity) {
    return queryOpportunitiesBase([...options, conditions.Opportunity.owner(userId)], fieldsToQuery);
};
*/
export function queryOpportunitiesForAssets(assetIds: string[]) {
    return multiQuery1Extract(queryAssetsOpportunitiesBase<coreApi.IAssetOpportunityWithOpportunity>([
        conditions.Asset_Opportunity__c.assets(assetIds), conditions.Asset_Opportunity__c.open 
    ], fields.IAssetOpportunityWithOpportunity)).then(
        junctions => junctions.map(j => j.Opportunity__r).filter(opp => opp != null)
    );
};

export function queryComplaintsBase<T = coreApi.IComplaint>(options: IConditionAnyResult<coreApi.Case>[], fieldsToQuery: string[] = fields.IComplaint) {
    return queryCasesBase<T>([...options, orCondition(conditions.Case.complaint, conditions.Case.complaintClosed)], fieldsToQuery);
}

export function queryQueriesBase<T = coreApi.IQuery>(options: IConditionAnyResult<coreApi.Case>[], fieldsToQuery: string[] = fields.IQuery) {
    return queryCasesBase<T>([...options, conditions.Case.query], fieldsToQuery);
}

export function queryHelpdeskCasesBase(options: ICondition<coreApi.IHelpdeskCase, coreApi.Case>[], fieldsToQuery: string[] = fields.IHelpdeskCase) {
    return queryCasesBase<coreApi.IHelpdeskCase>([...options, conditions.Case.helpDeskCase ], fieldsToQuery);
}

export function queryTransactionalSurveyBase(options: ICondition<any, coreApi.Case>[], fieldsToQuery: string[] = fields.ITransactionalSurveyCase) {
    return queryCasesBase<coreApi.ITransactionalSurveyCase>([...options, conditions.Case.surveyResponse ], fieldsToQuery);
}

export function queryTendersOpenForEquipment(assetId: string) {
    return queryOpportunitiesForAssets([assetId])
        .then(opps => queryTendersBase([conditions.Tender__c.opportunities(opps.map(opp => opp.Id)), conditions.Tender__c.active]));
};

export function queryOpportunitiesById(ids: string[]) {
    return queryWithConditions<coreApi.IOpportunity, coreApi.Opportunity>([conditions.Opportunity.ids(ids)], SObject.Opportunity, fields.IOpportunity);        
};

export function queryOpportunityContactRolesForOpportunity(ids: string[]) {
    return queryWithConditions<coreApi.IOpportunityContactRole, coreApi.IOpportunityContactRole>(
        [conditions.OpportunityContactRole.opportunityId(ids)], SObject.OpportunityContactRole, fields.IOpportunityContactRole
    );
};

export function insertTask(record: any) {
    return insert(SObject.Task, record);
}

export interface EventParticipant { Id: string, Name: string, Phone: string }

export function upsertEventFromWriteEventModal(record: IEventFromEventCreationDialog, contactIds: string[]) {
    const recordToInsert = { ...record } as any;
    recordToInsert.WhatId = record.What != null ? record.What.Id : null;
    delete recordToInsert.What;
    return upsert(SObject.Event, recordToInsert).then(eventId => {
        if(recordToInsert.Id == null) insertEventRelations(eventId as string, contactIds);
        else syncEventRelations(recordToInsert.Id, contactIds)
    });
}

export function insertEventRelations(eventId: string, contactIds: string[]) {
    return contactIds.length <= 0 ? Promise.resolve([]) : insertMany(SObject.EventRelation, contactIds.map(id => ({ RelationId: id, EventId: eventId })))
}

function syncEventRelations(eventId: string, contactIds: string[]) {
    const contactIdsSet = new Set(contactIds);
    return multiQuery1Extract(
            queryWithConditions<{ Id: string, EventId: string, RelationId: string }, SObject.EventRelation>(
                [conditions.EventRelation.event([eventId])], SObject.EventRelation, ['Id', 'EventId', 'RelationId']
            )
        )
        .then(eventRelations => {
            const relationsToDelete = eventRelations.filter(er => !contactIdsSet.has(er.RelationId));
            const relationContactIdsSet = new Set(relationsToDelete.map(er => er.RelationId));
            const contactIdsToInsert = contactIds.filter(cid => !relationContactIdsSet.has(cid));
            return del(SObject.EventRelation, relationsToDelete.map(er => er.Id))
                .then(res => insertEventRelations(eventId, contactIdsToInsert));
        })
}

export function queryEventsRange(userId: string, start: moment.Moment, end: moment.Moment) {
    return multiQuery1(query<coreApi.IApiEvent>(
        { $and: [{ StartDateTime: { $gte : momentToSfDateTime(start) } }, 
                 { StartDateTime: { $lte : momentToSfDateTime(end) } }]
        , ...conditions.Event.owner(userId).queryOptions }
        , 
        'Event', fields.Event
    )).then(result => queryEventRelations(result.queries.result[0]));    
}

export function queryEventRelations(events: coreApi.IApiEvent[]): Promise<coreApi.IApiEvent[]> {
    return (events.length <= 0 ? Promise.resolve([]) : 
        //multiQuery1(query({ EventId: { $in: events.map(e => e.Id) }}, 'EventRelation', ['EventId', 'RelationId']))  
        multiQuery1(queryWithConditionsSimple<coreApi.EventRelation>([conditions.EventRelation.event(events.map(e => e.Id))], SObject.EventRelation, fields.EventRelation))
        .then(result => {
            const eventRelations = result.queries.result[0];
            const ids = _.uniq(eventRelations.map(er => er.RelationId));
            //return (ids.length <= 0 ? Promise.resolve([]) : multiQuery1(query<coreApi.IActivityContact>({ Id: { $in: ids } }, 'Contact', fields.IContact))
            return multiQuery1(queryContactsBase<coreApi.IContactCore>([conditions.Contact.ids(ids)], fields.IContactCore))
            .then(result => {
                const contacts = result.queries.result[0];
                const contactsById = _.keyBy(contacts, 'Id');
                const relationsByEventid = _.groupBy(eventRelations, 'EventId');
                //const events =  _.map(relationsByEventid, (relations) => relations[0].Event) as IApiEvent[];
                const contactsByEvent = _.mapValues(relationsByEventid, 
                    (eventRelations, eventId) => eventRelations.map(er => contactsById[er.RelationId]).filter(x => x != null));
                const inviteesByEvent = _.mapValues(relationsByEventid, 
                    (eventRelations, eventId) => eventRelations.map(er => er.IsInvitee ? contactsById[er.RelationId] : null).filter(x => x != null));
                
                events.forEach(e => {
                    e.contacts = contactsByEvent[e.Id];
                    e.invitees = inviteesByEvent[e.Id];
                });
                return events;
            })
        })
    )
}

export function queryWorkOrdersForServiceTerritoryOpen(
    options: ICondition<coreApi.IWorkOrder, coreApi.WorkOrder>[], serviceTerritoryId: string, activeInFSM: boolean, fieldsToQuery: string[] = fields.IWorkOrder
) {
    return queryWorkOrdersBase([...options, conditions.WorkOrder.open(activeInFSM), conditions.WorkOrder.serviceTerritory(serviceTerritoryId)], fieldsToQuery);
}

export function queryWorkOrdersWithContractLines(
    options: ICondition<coreApi.IWorkOrder, coreApi.WorkOrder>[], fieldsToQuery: string[] = fields.IWorkOrder
) {
    return multiQuery1(
        queryWorkOrders([...options], fieldsToQuery).sort('LastModifiedDate', 'DESC'))
        .then(wrapper => queryWorkordersWithServiceAppointments(wrapper.queries.result[0]))
        .then(orders => queryWorkOrderContractLines(orders)
    );
}
/*
export function queryWorkOrdersWithContractLinesForServiceTerritoryOpen(
    options: ICondition<coreApi.IWorkOrder, coreApi.WorkOrder>[], activeInFSM: boolean, serviceTerritoryId: string, fieldsToQuery: string[] = fields.IWorkOrder
) {
    return multiQuery1(
        queryWorkOrders(
            [...options, conditions.WorkOrder.open(activeInFSM), conditions.WorkOrder.serviceTerritory(serviceTerritoryId)], fieldsToQuery).sort('LastModifiedDate', 'DESC')
        )
        .then(wrapper => queryWorkordersWithServiceAppointments(wrapper.queries.result[0]))
        .then(orders => queryWorkOrderContractLines(orders)
    );
}
*/
const woConditions = conditions.WorkOrder;
const conditionsForTechnicianDetailsSetType: _.Dictionary<(activeInFSM: boolean) => ICondition<any, coreApi.IServiceResourceBase>[]> = {
    [TechnicianDetailsSetType.CompletedToday]: (activeInFSM: boolean) => [woConditions.closedFSMandKonect, woConditions.completedToday()],
    [TechnicianDetailsSetType.Mbm]: (activeInFSM: boolean) => [woConditions.mbm, woConditions.openFSMandKonect],
    [TechnicianDetailsSetType.OtherCallouts]: (activeInFSM: boolean) => [woConditions.callout.negate(), woConditions.mbm.negate(), woConditions.openFSMandKonect],
    [TechnicianDetailsSetType.OpenCallouts]: (activeInFSM: boolean) => [woConditions.callout, woConditions.openFSMandKonect]
}

function queryWorkOrdersCompletedBy<T>(serviceResourceIds: string[], workOrderFields: string[]) {
    return multiQuery1Extract(queryWorkOrdersBase<T>([conditions.WorkOrder.completedBy(serviceResourceIds)], workOrderFields));
}

function queryAssignedWorkorderIdsForServiceResource(serviceResourceId: string, serviceResourceEnabled: boolean) {
    return serviceResourceEnabled
        ? queryWorkOrdersCompletedBy<{ Id: string }>([serviceResourceId], ['Id']).then(wos => wos.map(wo => wo.Id))
        :
        multiQuery1Extract(queryAssignedResources([conditions.AssignedResource.serviceResourceIds([serviceResourceId])]))
        .then(assignedResources => {
            const workOrderIds = assignedResources.map(ar => ar.ServiceAppointment.Work_Order__c as string).filter(id => id != null && id != '');
            return workOrderIds;
        })
}

export async function queryWorkOrdersForTechnician(activeInFSM: boolean, serviceResourceEnabled: boolean, serviceResourceId: string, detailsSetType: TechnicianDetailsSetType) {

    const workOrderIds = await queryAssignedWorkorderIdsForServiceResource(serviceResourceId, serviceResourceEnabled);
    if(workOrderIds.length <= 0) return [];

    const wos = await multiQuery1Extract(
        queryWorkOrdersBase<coreApi.IWorkOrder>(
            [conditions.SObject.ids(workOrderIds), ...conditionsForTechnicianDetailsSetType[detailsSetType](activeInFSM)],
            fields.IWorkOrder
        )
    );
    const workorders = await queryWorkordersWithServiceAppointments(wos);
    return await queryWorkOrderContractLines(workorders);
}

export function queryWorkOrderContractLines<T extends { ServiceContractId: string }>(workorders: T[]) {
    const contractIds = workorders.map(wo => wo.ServiceContractId).filter(id => id != null && id != '');
    return (
        contractIds.length > 0 ? 
        multiQuery1(
            queryContractLinesBase<coreApi.IContractLineItemRush>(
                [conditions.ContractLineItem.active, conditions.ContractLineItem.contracts(contractIds)], 
                ['toLabel(RUSH_Contract_type__c)', 'ServiceContractId']
            )
        ).then(wrapper => wrapper.queries.result[0]) 
        : 
        Promise.resolve([] as coreApi.IContractLineItemRush[])
    )
    .then(contractLines => {
        const contractLinesByContractId = _.groupBy(contractLines, 'ServiceContractId');
        return workorders.map(wo => (
            { ...wo,  contractLineItems: contractLinesByContractId[wo.ServiceContractId] }
        ))
    })
}
/*
export function computSvWillManage(workorders: coreApi.IWorkOrder[], userId: string): coreApi.IWorkOrderSvWillManage[] {
    return workorders.map(wo => ({ ...wo, svWillManage: wo.Case.FSM_Escalated_To__c == userId }) );
}
*/

export function queryWorkOrdersMetricsForTechnician(serviceResourceId: string, activeInFSM: boolean, serviceResourceEnabled: boolean) {
    const woFilters = conditions.WorkOrder;
    return queryAssignedWorkorderIdsForServiceResource(serviceResourceId, serviceResourceEnabled).then(
        workOrderIds => {
            const queryFields = conditionsFields(
                ..._.flatten(_.values(conditionsForTechnicianDetailsSetType).map(f => f(activeInFSM)))
                //woFilters.closed, woFilters.mbm, woFilters.callout, woFilters.open
            );
            const woConditions = conditions.WorkOrder;            
            return multiQuery1Extract(queryWorkOrdersBase([woConditions.ids(workOrderIds)], [...queryFields, 'EndDate']))
            .then(workOrders => {                
                const completedToday = workOrders.filter(wo => woConditions.completedToday().isFullfilledBy(wo));
                return {
                    completedToday: conditionsFilter(workOrders, ...conditionsForTechnicianDetailsSetType[TechnicianDetailsSetType.CompletedToday](activeInFSM)).length,
                    mbm: conditionsFilter(workOrders, ...conditionsForTechnicianDetailsSetType[TechnicianDetailsSetType.Mbm](activeInFSM)).length,
                    openOthers: conditionsFilter(workOrders, ...conditionsForTechnicianDetailsSetType[TechnicianDetailsSetType.OtherCallouts](activeInFSM)).length,
                    openCallouts: conditionsFilter(workOrders, ...conditionsForTechnicianDetailsSetType[TechnicianDetailsSetType.OpenCallouts](activeInFSM)).length,
                } as coreApi.ITechnicianServiceOrderMetrics;                    
            })            
        }
    )

}

export function queryWorkOrdersForAssets(assetIds: string[], options: IConditionAnyResult<coreApi.WorkOrder>[], orderBy?: string, direction?: "ASC" | "DESC") {
    let query = queryWorkOrders([conditions.WorkOrder.asset(assetIds), ...options]);
    if(orderBy != null) query = query.sort(orderBy, direction);
    return multiQuery1(query).then(wrapper => queryWorkOrderContractLines(wrapper.queries.result[0]));
}

export function queryFSMServiceVisitHistory(parentRecordIds: string[], limit: number) {
    return queryFSMServiceVisitHistoryBase([conditions.FSM_Site_Visit_History__c.serviceAppointmentParentRecordId(parentRecordIds)])
        .limit(limit).sort('CreatedDate', 'DESC');
}

export function queryTaskContacts(tasks: coreApi.ITask[]) {
    const contactIds = tasks.map(t => t.Who && t.Who.Id).filter(id => id != null);
    if(contactIds.length == 0) return tasks;

    return queryContactsBase([conditions.Contact.ids(contactIds)])
    .then(contacts => {
        const contactsById = _.keyBy(contacts, 'Id');  
        if(isAndroid()){ firebaseStopTrace('Open Tasks trace') }          
        return tasks.map(t => ({ ...t, Who: t.Who != null && contactsById[t.Who.Id] != null ? contactsById[t.Who.Id] : null })) as coreApi.ITaskExtended[];
    })
}

export function queryWorkordersWithServiceAppointments<T extends coreApi.IApiId>(workOrders: T[]) {
//    const ids = workOrders.map(w => w.id);
    //TODO maybe we need to filter the appointment statuses
    return multiQuery1Extract(queryServiceAppointmentsBase([conditions.ServiceAppointment.parentRecord(workOrders.map(w => w.Id))]))
    .then(serviceAppointments => {
        return (
            serviceAppointments.length <= 0 ? 
            Promise.resolve([] as coreApi.IAssignedResourceWithRelatedRecordName[]) 
            :
            multiQuery1Extract(queryAssignedResources<coreApi.IAssignedResourceWithRelatedRecordName>(
                [conditions.AssignedResource.serviceAppointmentIds(serviceAppointments.map(s => s.Id))],
                ['ServiceResourceId', 'ServiceAppointmentId', 'ServiceResource.RelatedRecord.Name', 'ServiceResource.RelatedRecord.Email']
            ))
        ).then(assignedResources => {
            const assignedResourcesByServiceAppointment = _.groupBy(assignedResources, 'ServiceAppointmentId');
            const serviceAppointmentsByWorkOrder = _.groupBy(serviceAppointments, 'ParentRecordId');

            //const serviceAppointmentsByParentRecord = _.groupBy(serviceAppointments, 'ParentRecordId');
            return workOrders.map(wo => {  
                const workOrderAppointments = serviceAppointmentsByWorkOrder[wo.Id];
                const workOrderServiceResources = _.flatMap(
                    workOrderAppointments, 
                    woAppointment => _.flatMap(
                        assignedResourcesByServiceAppointment[woAppointment.Id] || [], 
                        woResource => woResource.ServiceResource.RelatedRecord
                    )
                );
                return { ...wo, assignedResources: workOrderServiceResources.filter(r => r != null), ServiceAppointments: workOrderAppointments };
            });
        })
    });
}

export function queryTechnicianAbsences<T extends coreApi.IApiId>(technicians: T[]) {
    const serviceResourceIds = technicians.map(e => e.Id);
    return multiQuery1(
        queryResourceAbsenceBase([conditions.ResourceAbsence.serviceResources(serviceResourceIds), conditions.ResourceAbsence.futureEntries()]).sort('Start', 'ASC'),
    ).then(resultWrapper => {
        const [futureResourceAbsences] = resultWrapper.queries.result;
        const resourceAbsencesPerServiceResource = _.groupBy(futureResourceAbsences, 'ResourceId');
        const serviceResourceWithMetrics = 
            technicians.map(t => {
                const resourceAbsences = resourceAbsencesPerServiceResource[t.Id];
                if(resourceAbsences == null || resourceAbsences.length == 0) {
                    return { ...t, absentUntil: null, nextAbsenceStarts: null };
                } else {
                    const absence = resourceAbsences[0];
                    return { ...t, absentUntil: absence.End, nextAbsenceStarts: absence.Start };
                }
            });
        return serviceResourceWithMetrics;
    })
}

export async function queryTechnicianServiceAppointmentWorkOrders<T extends { Id: string }>(technicians: T[], entityFieldsData: EntityFieldsData) {
    const workorderLocationByServiceResourceId = await queryCurrentServiceAppointmentWorkOrderLocationByTechnician<coreApi.WorkOrderForServiceResourceField>(technicians.map(t => t.Id), fields.WorkOrderForServiceResourceField);
    const id = technicians.map(t => t.Id);
    const workOrdersByTechnician = await queryWorkOrdersCompletedByTechnician(id);
    const workOrders = workOrdersByTechnician[id[0]];
    const workOrder = workOrders != null && workOrders.length > 0 ? workOrders[0] : null;
    const statusById =  await queryServiceAppointmentTechnicianStatus(id, entityFieldsData.inactiveDays);
    const status = entityFieldsData.serviceResourceEnabled ? technicianStatusFromWorkOrder(workOrder) : statusById[id[0]];
    return technicians.map(t => ({ ...t, technicianStatus: status, serviceAppointmentWorkOrder: workorderLocationByServiceResourceId[t.Id] }));
}

export function wrapFirstResult<T, U>(wrapper: (t: T) => U) { 
    return (ts: T[]) => { return ts == null || ts.length <= 0 ? null : wrapper(ts[0]); }
}

function queryActiveTimesheetEntries(serviceResourceIds: string[]) {
    return queryTimesheetEntriesBase<coreApi.ITimeSheetEntry>(
        [conditions.TimeSheetEntry.serviceResources(serviceResourceIds), ...conditions.TimeSheetEntry.activeNow()], fields.ITimeSheetEntry
    ).sort('StartTime', 'ASC');
}

export function queryCurrentTimeSheetServiceOrderAndCodes<T extends { Id: string }>(serviceResources: T[]) {
    const serviceResourceIds = serviceResources.map(sr => sr.Id);
    return multiQuery2(
            queryActiveTimesheetEntries(serviceResourceIds),
            //query for service resource enabled territories only
            queryWorkOrdersBase<coreApi.WorkOrderForServiceResourceField>(
                [conditions.WorkOrder.completedBy(serviceResourceIds), conditions.WorkOrder.technicianCurrentWO,conditions.WorkOrder.newStatusDateNotNull], fields.WorkOrderForServiceResourceField
            ).sort('New_Status_Date__c', 'DESC')
        ).then(result => {
            const [timeEntries, workOrders] = result.queries.result;
            const timeEntriesPerServiceResource = _.groupBy(timeEntries, 'Service_Resource_Id__c');
            const completedWorkOrderPerServiceResource = _.groupBy(workOrders, 'Completed_By__c');
            return assignAndQueryCurrentTimeSheetServiceOrderPerTechnician(serviceResources, timeEntriesPerServiceResource, completedWorkOrderPerServiceResource);
        }
    );
}

async function assignAndQueryCurrentTimeSheetServiceOrderPerTechnician<T extends coreApi.IApiId>(
    technicians: T[], timeEntriesPerServiceResource: _.Dictionary<coreApi.ITimeSheetEntry[]>, completedWorkOrderPerServiceResource: _.Dictionary<coreApi.WorkOrderForServiceResourceField[]>
) {
    const currentTimeSheetWorkOrderPerTechnician: _.Dictionary<string> = {};
    const timeEntryCodesPerTechnician: _.Dictionary<string> = {};
    technicians.forEach(t => {
        const timeEntries = timeEntriesPerServiceResource[t.Id];
        if(timeEntries != null) {
            const currentTimeEntries = timeEntries;//conditionsFilter(timeEntries, ...activeEntriesCondition);
            const timeEntriesCurrentlyHappeningSorted = _.sortBy(currentTimeEntries, 'EndTime');
            timeEntryCodesPerTechnician[t.Id] = timeEntriesCurrentlyHappeningSorted.length == 0 ? null : 
                _.uniq(
                    timeEntriesCurrentlyHappeningSorted.map(
                        entry => entry.FSM_TimeEntryCode__r == null ? null : entry.FSM_TimeEntryCode__r.Code__c
                    ).filter(entry => entry != null)
                ).join(', ');

            currentTimeSheetWorkOrderPerTechnician[t.Id] = 
                timeEntriesCurrentlyHappeningSorted.length == 0 ? null : timeEntriesCurrentlyHappeningSorted[0].WorkOrderId;
        }
    });    

    const workOrderIds = _.uniq(_.values(currentTimeSheetWorkOrderPerTechnician).filter(id => id != null));
    const timeSheetWorkOrders = workOrderIds.length <= 0
        ? []
        : await multiQuery1Extract(queryWorkOrdersBase<coreApi.WorkOrderForServiceResourceField>([conditions.WorkOrder.ids(workOrderIds)], fields.WorkOrderForServiceResourceField))
    const timeSheetWorkordersById = _.keyBy(timeSheetWorkOrders, 'Id');
    return technicians.map(t => {
        const serviceOrderId = currentTimeSheetWorkOrderPerTechnician[t.Id];
        const completedWorkOrders = completedWorkOrderPerServiceResource[t.Id];
        return {
            ...t,
            currentTimeSheetServiceOrder: serviceOrderId && timeSheetWorkordersById[serviceOrderId],
            lastCompletedWorkOrder: completedWorkOrders != null && completedWorkOrders.length > 0 ? completedWorkOrders[0] : null,
            timeEntryCodes: timeEntryCodesPerTechnician[t.Id]
        };
    });
}

export function insertNoteForParent(parentId: string, title: string, body: string) {
    return insert(SObject.Note, { Body: body, Title: title, ParentId: parentId});
}

export function insertAttachmentForParent(parentId: string, fileName: string, base64Content: string) {
    return insert(SObject.Attachment, { Body: base64Content, Name: fileName, ParentId: parentId});
}

export function updateContact(contact: any) {
    return update(SObject.Contact, contact);
}

export enum TractionControlReportType {
    VA = 'VA',
    VC = 'VC'
}

export function queryTractionControlReport(salesorgCode: string, reportType: TractionControlReportType, plannerGroupCode: string) {
    return queryContentVersionDataByTitle(['TC', salesorgCode, reportType, plannerGroupCode].join('/'));
}

export function queryLanguage(languageCode: string) {
    return queryContentVersionDataByTitle(languageCode)
}

function queryContentVersionDataByTitle(title: string) {    
    return queryContentVersion({ 'FirstPublishLocation.Name': { $eq: 'SMT' }, Title: title });    
}

export function queryContentDocumentLatestPublished(id: string) {
    return queryContentDocumentBase([conditions.ContentDocument.id(id)])
}

export function queryContentVersionDataById(id: string) {    
    return queryContentVersion({ 'Id': { $eq: id } });    
}

function queryContentVersion(options: object) {
    return query<coreApi.ContentVersion>(options, 'ContentVersion', ['VersionData', 'Title']).then(
        cvs => {
            if(cvs.length > 0) return requestGet<string>(cvs[0].VersionData);
            return null as string;
        }
    )
}

export function queryPersonalAndServiceTerritoryTractionControlReports(userId: string, serviceTerritoryId: string) {
    const cv = conditions.ContentVersion;
    return queryContentVersionsBase([orCondition(
        andCondition(cv.firstPublishLocation(serviceTerritoryId), cv.titleLike('TC/%')), 
        andCondition(cv.firstPublishLocation(userId), cv.titleLike('TC/%'))
    )]);
}

export async function queryContentDocumentLinksContentDocuments(userId: string) {
    const cdls = await queryContentDocumentLinkBase([conditions.ContentDocumentLink.linkedEntityId(userId)]).sort('ContentDocument.CreatedDate', 'DESC');
    return cdls.map(cdl => cdl.ContentDocument);
}

export function queryKffBase() {
    //the timestamp is not used in the apex web service
    //const seconds = Math.floor(moment().startOf('quarter').valueOf() / 1000);
    //const urlWithTimeStamp = "/smtapp/kff/?timestamp=" + seconds;
    return restGet<string>("/smtapp/kff").then(auditsJson => {
        let audits = null as coreApi.IAuditApi[];
        try {
            audits = JSON.parse(auditsJson) as coreApi.IAuditApi[];
        } catch(error) {
            console.log("Error parsing audits");
        }
    
        return audits;
    })
}

export async function queryContactsForAudits(audits: coreApi.IAuditApi[]) {
    const contacts = await queryContactsBase<coreApi.IContactCore>([conditions.Contact.names(audits.map(a => a.technician_name))], fields.IContactCore);
    const contactByName = _.keyBy(contacts, c => c.Name.toLowerCase());
    return contactByName;
}

function filterKffAuditDataByTemplateType(audits: coreApi.IAuditApi[], templateTypes: string[]) {    
    return audits.filter(audit => templateTypes.some(v => audit.template_type.toLowerCase() == v));
}

function filterKffMonthlyDataByTemplateType(audits: coreApi.IAuditApi[], templateTypes: string[]) {    
    return audits.filter(audit => !(templateTypes.some(v => audit.template_type.toLowerCase() == v)));
}

export function filterAudits(audits: coreApi.IAuditApi[]) {
    return filterKffAuditDataByTemplateType(audits, ["elevator","escalator","door"]);
}

export function filterMonthlyDiscussions(audits: coreApi.IAuditApi[]) {    
    return filterKffMonthlyDataByTemplateType(audits, ["elevator","escalator","door"]);;    
}

export function filterKffFieldAudits(audits: coreApi.IAuditApi[]) {
    return filterKff90Days(filterAudits(audits));
}

export function filterKffMonthlyDiscussions(audits: coreApi.IAuditApi[]) {
    return filterKff90Days(filterMonthlyDiscussions(audits));
}

export function filterKff90Days(audits: coreApi.IAuditApi[]) {
    const startDate = moment().startOf('day').add(-1, 's');
    const endDate = startDate.clone().add(90, 'days').endOf('day');
    return audits.filter(a => moment(a.date).isBetween(startDate, endDate));
}

export function filterKffMonth(audits: coreApi.IAuditApi[]) {
    const now = moment();
    return audits.filter(a => now.isSame(moment(a.date), 'month'));
}

function filterKffQuarter(audits: coreApi.IAuditApi[]) {
    const now = moment();
    return audits.filter(a => now.isSame(moment(a.date), 'quarter'));
}

export function filterKffOpen(audits: coreApi.IAuditApi[]) {
    return audits.filter(audit => audit.status == coreApi.AuditStatus.Open || audit.status == coreApi.AuditStatus.InProgress);
}
/*
export const getJsforceSingleRecordAction = 
    <ApiObject, UiObject>(query: (state: IGlobalState) => Promise<ApiObject>, 
        wrapper: (apiObject: ApiObject, state: IGlobalState) => UiObject, actionNames: IAsyncActionNames, initialData: any) => {
        return asyncHttpActionGeneric(query, actionNames, [], {}, (apiObject, state) => apiObject == null ? null : wrapper(apiObject, state), initialData);
    }
*/
//UiObject: new (apiObject: ApiObject) => UiObject this doesn't seem to check the types properly
export const getJsforceCollectionAction = 
    <ApiObject, UiObject>(query: (state: IGlobalState) => Promise<ApiObject[]>, UiObject: new (apiObject: ApiObject) => UiObject, actionNames: IAsyncActionNames) => {
        const queryNew = (state: IGlobalState) => query(state).then(objs => objs.map(apiObject => new UiObject(apiObject)))
        return asyncHttpActionGeneric(queryNew, actionNames);
    }

//TODO remove this function
export const getJsforceCollectionActionMapping = 
    <ApiObject, UiObject>(query: (state: IGlobalState) => Promise<ApiObject[]>, 
        mapper: (apiObject: ApiObject, state: IGlobalState) => UiObject, actionNames: IAsyncActionNames) => {
        const queryNew = (state: IGlobalState) => query(state).then(objs => objs.map(o => mapper(o, state)))
        return asyncHttpActionGeneric(queryNew, actionNames);
    }