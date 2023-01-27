import Callout, { CalloutListItem, MbmListItem, queryWorkOrderDetail } from '../../models/feed/Callout';
import { plannerGroupId, activeInFSMFromState } from '../../models/globalState';
import { ServiceOrderGrouping } from '../../models/overview/CalloutGrouping';
import translate from '../../utils/translate';
import { itemsStateAsyncActionNames, payloadAction, itemsQueryStateAsyncActionNames } from '../actionUtils';
import { showToast } from '../toasts/toastActions';
import { reloadFeed } from './feedActions';
import { getJsforceCollectionActionMapping, queryWorkOrdersWithContractLines } from '../http/jsforce';
import { conditions, SObject } from '../http/jsforceMappings';
import { update, multiQuery1Extract, multiQuery1, joinQueries } from '../http/jsforceCore';
import { queryWorkOrdersBase, queryWorkorderLineItemBase, queryProductConsumedBase, queryServiceAppointmentsBase, queryWorkOrders } from '../http/jsforceBase';
import { metricConditionsOpenStartDate13Months, metricConditionsRejectedServiceAppointments, metricConditionsRejectedWorkordersNonFSM, metricConditionsOpenStartDate13MonthsEarliestStartDatePresentMonth, metricConditionsOpenStartDate24Months } from '../http/jsforceMetrics';
import { IWorkOrderForListItem, IServiceAppointmentRejectedListItem, IWorkOrderRejectedListItem, IMbmForListItem, IWorkOrderRejectedListItemNonFSM } from '../http/queryFields';
import * as coreApi from '../../models/api/coreApi';
import { ThunkAction } from '../thunks';
import { asyncHttpActionGenericLocalState2, asyncHttpActionGeneric } from '../http/httpActions';
import ProductConsumed from '../../models/feed/ProductConsumed';
import WorkOrderLineItem from '../../models/feed/WorkOrderLineItem';
import { ItemsStatus } from 'src/models/IItemsState';
import * as _ from 'lodash';
import { RejectedServiceOrderListItem } from 'src/models/feed/RejectedServiceOrder';
import { ServiceNeedsFilter } from 'src/models/overview/ServiceNeedsFilter';
import * as moment from 'moment';

import { RejectedWorkOrderNonFSMListItem } from 'src/models/feed/RejectedWorkOrderNonFSM';
import { queryAndShowDetailsDialogGeneric } from './detailsActions';
import { title } from 'src/models/feed/SalesForceListItem';
import { EntityType } from 'src/constants/EntityType';
import { ModalType } from 'src/constants/modalTypes';
import { replaceModalIfIncomplete } from '../modalActions';
import { entityFieldsDataFromState, EntityFieldsData } from 'src/components/fields/EntityFieldsData';
import { firebaseStopTrace, isAndroid, firebaseStartTrace } from 'src/utils/cordova-utils';

export const LOAD_UNPLANNED_CALLOUTS = itemsQueryStateAsyncActionNames('LOAD_UNPLANNED_CALLOUTS');
export const LOAD_REPAIRS = itemsQueryStateAsyncActionNames('LOAD_REPAIRS');
export const LOAD_MBM_CALLOUTS = itemsQueryStateAsyncActionNames('LOAD_MBM_CALLOUTS');
export const LOAD_INSPECTIONS = itemsQueryStateAsyncActionNames('LOAD_INSPECTIONS');
export const CHANGE_INSPECTIONS_GROUPING = 'CHANGE_INSPECTIONS_GROUPING';
export const LOAD_INSPECTION_POINTS = itemsQueryStateAsyncActionNames('LOAD_INSPECTION_POINTS');
export const CHANGE_INSPECTION_POINTS_GROUPING = 'CHANGE_INSPECTION_POINTS_GROUPING';
export const LOAD_SERVICE_NEEDS = itemsQueryStateAsyncActionNames('LOAD_SERVICE_NEEDS');
export const CHANGE_SERVICE_NEEDS_GROUPING = 'CHANGE_SERVICE_NEEDS_GROUPING';
export const CHANGE_SERVICE_NEEDS_FILTER = 'CHANGE_SERVICE_NEEDS_FILTER';
export const LOAD_REJECTED_SERVICE_ORDERS = itemsQueryStateAsyncActionNames('LOAD_REJECTED_SERVICE_ORDERS');
export const LOAD_REJECTED_WORK_ORDERS_NON_FSM = itemsQueryStateAsyncActionNames('LOAD_REJECTED_WORK_ORDERS_NON_FSM');
export const LOAD_EQUIPMENT_HELPDESK_CASES = itemsStateAsyncActionNames('LOAD_EQUIPMENT_HELPDESK_CASES');
export const LOAD_EQUIPMENT_CONTACTS = itemsStateAsyncActionNames('LOAD_EQUIPMENT_CONTACTS');
export const CHANGE_UNPLANNED_CALLOUTS_GROUPING = 'CHANGE_UNPLANNED_CALLOUTS_GROUPING';
export const CHANGE_MBM_GROUPING = 'CHANGE_MBM_GROUPING';
export const QUERY_OPERATIONS_AND_SPARE_PARTS = itemsStateAsyncActionNames('QUERY_OPERATIONS_AND_SPARE_PARTS');

/*
export const QUERY_OPERATIONS = itemsStateAsyncActionNames('QUERY_OPERATIONS');
export const QUERY_SPARE_PARTS = itemsStateAsyncActionNames('QUERY_SPARE_PARTS');
*/

const { packagedServiceRepair, inspection, inspectionPoint, serviceNeeds, mbm, callout, serviceTerritory, open, earliestStartDateLast12Months , closedKonectStatus, completedOrFinished, earliestStartDatePresentMonth, earliestStartDateNext3Months }  = conditions.WorkOrder

/*
export const downloadUnplannedCallouts = getJsforceCollectionActionMapping(
    state => queryWorkOrdersWithContractLinesForServiceTerritoryOpen([callout], plannerGroupId(state)), (c, state) => new Callout(c, userIdFromState(state)), 
    LOAD_UNPLANNED_CALLOUTS
)
*/

export const downloadAndShowWorkOrder = (id: string) => 
    queryAndShowDetailsDialogGeneric(
        // title(EntityType.Callout, wo.name),
        '',
        (state) => queryWorkOrderDetail(id, entityFieldsDataFromState(state)),
        item => dispatch => dispatch(replaceModalIfIncomplete(ModalType.CalloutDetailsModal, item))
    )

export const downloadUnplannedCallouts = getJsforceCollectionActionMapping(
    state => multiQuery1Extract(
        queryWorkOrdersBase<coreApi.IWorkOrderForListItem>(
            [...metricConditionsOpenStartDate13Months.queryConditionsAll(plannerGroupId(state), activeInFSMFromState(state)), callout], IWorkOrderForListItem
        )
    ),
    (c, state) => new CalloutListItem(c, entityFieldsDataFromState(state)), LOAD_UNPLANNED_CALLOUTS
)

export const downloadMbmCalloutsOLD = getJsforceCollectionActionMapping(
    state => 
        multiQuery1Extract(
            queryWorkOrdersBase<coreApi.MbmForListItem>(
                [...metricConditionsOpenStartDate13MonthsEarliestStartDatePresentMonth.queryConditionsOpen(plannerGroupId(state), activeInFSMFromState(state)), mbm], IMbmForListItem
            )//.limit(10000)
        ),
    (c, state) => new MbmListItem(c, entityFieldsDataFromState(state), null, c.WorkOrderLineItems.records), LOAD_MBM_CALLOUTS
);

export const downloadMbmCallouts = asyncHttpActionGeneric(
    async state => {
        if(isAndroid()){ firebaseStartTrace('Open MBMs trace') }
       const IdsChunk = await multiQuery1(queryWorkOrdersBase<coreApi.IWorkOrderForListItem>(
           [...metricConditionsOpenStartDate13MonthsEarliestStartDatePresentMonth.queryConditionsOpen(plannerGroupId(state), activeInFSMFromState(state)),mbm],['Id'])
            ).then(res => {             
                return _.chunk(res.queries.result[0].map(wo=> wo.Id),200);
            })
            const wos = await joinQueries(
                ...IdsChunk.map(ids =>
                    multiQuery1(queryWorkOrdersBase<coreApi.IWorkOrderForListItem>([conditions.WorkOrder.ids(ids)],IWorkOrderForListItem
                    )))).then(res => { return res.queries.result[0] })
            const woLineItems = await multiQuery1Extract(
                    queryWorkorderLineItemBase([conditions.WorkOrderLineItem.workorders(wos.map(wo => wo.Id))], ['Operation_Text__c', 'WorkOrderId'])
                );
            const woLineItemsByWo = _.groupBy(woLineItems, 'WorkOrderId');
            if(isAndroid()){ firebaseStopTrace('Open MBMs trace') }
            return wos.map(wo => new MbmListItem(wo, entityFieldsDataFromState(state), null, woLineItemsByWo[wo.Id] || []))
    }, LOAD_MBM_CALLOUTS
);

// export const downloadMbmCallouts = asyncHttpActionGeneric(
//     async state => {
//         const wos = await multiQuery1Extract(
//             queryWorkOrdersBase<coreApi.IWorkOrderForListItem>(
//                 [...metricConditionsOpenStartDate13MonthsEarliestStartDatePresentMonth.queryConditionsOpen(plannerGroupId(state), activeInFSMFromState(state)), mbm], IWorkOrderForListItem
//             )
//         );
//         const woLineItems = await multiQuery1Extract(
//             queryWorkorderLineItemBase(
//                 [conditions.WorkOrderLineItem.workorders(wos.map(wo => wo.Id))], ['Operation_Text__c', 'WorkOrderId']
//             )
//         );
//         const woLineItemsByWo = _.groupBy(woLineItems, 'WorkOrderId');
//         return wos.map(wo => new MbmListItem(wo, entityFieldsDataFromState(state), null, woLineItemsByWo[wo.Id] || []))
//     }, LOAD_MBM_CALLOUTS
// );

export const downloadServiceNeeds = asyncHttpActionGeneric(
    async state => {
        const wos = await queryWorkOrders<coreApi.IWorkOrderForListItem>(
            [...metricConditionsOpenStartDate13Months.queryConditionsAll(plannerGroupId(state), activeInFSMFromState(state)), serviceNeeds],
            IWorkOrderForListItem
        ).sort('CreatedDate', 'DESC');

        const assetIds = wos.map(wo => wo.Asset.Id);
        const completedMbmsForEquipment = await queryWorkOrdersBase<coreApi.IWorkOrderForListItem & { Completed_Date__c: string }>(
            [mbm, conditions.WorkOrder.statusCompleted, conditions.WorkOrder.asset(assetIds)],//, conditions.WorkOrder.completedDateAfter],
            [...IWorkOrderForListItem, 'Completed_Date__c']
        ).sort('CreatedDate', 'DESC');
        const completedMbmsByEquipment = _.groupBy(completedMbmsForEquipment, mbm => mbm.Asset.Id);

        return wos.map(wo => {
            const completedMbms = completedMbmsByEquipment[wo.Asset.Id] || [];
            const completedMbmsbAfterServiceNeedCreated = _.filter(
                completedMbms,
                mbm => moment(mbm.Completed_Date__c).isAfter(moment(wo.CreatedDate))
            );
            return new CalloutListItem(wo, entityFieldsDataFromState(state), completedMbmsbAfterServiceNeedCreated)
        });
    }, LOAD_SERVICE_NEEDS
);

export const downloadRepairs = getJsforceCollectionActionMapping(
    state => queryWorkOrdersWithContractLines(
        [...metricConditionsOpenStartDate24Months.queryConditionsAll(plannerGroupId(state), activeInFSMFromState(state)), packagedServiceRepair]
    ), 
    (c, state) => new Callout(c, entityFieldsDataFromState(state)), LOAD_REPAIRS
);
export const downloadInspections = getJsforceCollectionActionMapping(
    state => queryWorkOrdersWithContractLines(
        [...metricConditionsOpenStartDate13Months.queryConditionsAll(plannerGroupId(state), activeInFSMFromState(state)), inspection]
    ),
    (c, state) => new Callout(c, entityFieldsDataFromState(state)), LOAD_INSPECTIONS
)
export const downloadInspectionPoints = getJsforceCollectionActionMapping(
    state => queryWorkOrdersWithContractLines(
        [...metricConditionsOpenStartDate13Months.queryConditionsAll(plannerGroupId(state), activeInFSMFromState(state)), inspectionPoint]
    ), 
    (c, state) => new Callout(c, entityFieldsDataFromState(state)), LOAD_INSPECTION_POINTS
);

export const downloadRejectedServiceAppointments = getJsforceCollectionActionMapping(
    state => 
        queryServiceAppointmentsBase<coreApi.IServiceAppointmentRejectedListItem>(
            metricConditionsRejectedServiceAppointments.queryConditionsAll(plannerGroupId(state)),
            IServiceAppointmentRejectedListItem
        ).then(saps => {
            const sapsByWorkOrderId = _.keyBy(saps, 'ParentRecordId');
            const parentRecordIds = saps.map(sap => sap.ParentRecordId)
            return queryWorkOrdersWithContractLines(
                [conditions.WorkOrder.ids(parentRecordIds), conditions.WorkOrder.open(activeInFSMFromState(state)), conditions.WorkOrder.serviceTerritory(plannerGroupId(state))], IWorkOrderRejectedListItem
            ).then(wos => 
                wos.map(
                    wo => [wo, sapsByWorkOrderId[wo.Id]] as [coreApi.IWorkOrderWithContractLineItems, coreApi.IServiceAppointmentRejectedListItem]
                )
            )
        }),
    (c, state) => new RejectedServiceOrderListItem(c[0], c[1], entityFieldsDataFromState(state)), LOAD_REJECTED_SERVICE_ORDERS
);

export const downloadRejectedWorkOrdersNonFSM = getJsforceCollectionActionMapping(
    state => queryWorkOrders<coreApi.IWorkOrderRejectedListItemNonFSM>(metricConditionsRejectedWorkordersNonFSM.queryConditionsAll(plannerGroupId(state)), IWorkOrderRejectedListItemNonFSM),
    (c, state) => new RejectedWorkOrderNonFSMListItem(c, entityFieldsDataFromState(state)), LOAD_REJECTED_WORK_ORDERS_NON_FSM
);

export const closeCallout = (calloutId: string): ThunkAction<void> => (dispatch, getState) =>    
    update(SObject.WorkOrder, { Id: calloutId, Status: conditions.WorkOrder.completed })
    .then(() => {
        dispatch(showToast({ message: translate('toast.complete-service-order.success.message') }));
        dispatch(reloadFeed);
    })
    .catch(() => dispatch(showToast({ message: translate('toast.complete-service-order.failure.message') })));
    


export const queryOperations = (setState: (dataStatus: ItemsStatus<ProductConsumed>) => void, workorderId: string) => 
    asyncHttpActionGenericLocalState2(
        setState, 
        state => multiQuery1Extract(
            queryProductConsumedBase([conditions.ProductConsumed.workorder(workorderId)])
        ).then(parts => parts.map(p => new ProductConsumed(p))),
        //QUERY_SPARE_PARTS
    );

export const querySpareParts = (setState: (dataStatus: ItemsStatus<WorkOrderLineItem>) => void, workorderId: string) => 
    asyncHttpActionGenericLocalState2(
        setState, 
        state => multiQuery1Extract(
            queryWorkorderLineItemBase([conditions.WorkOrderLineItem.workorder(workorderId)])
        ).then(wols => wols.map(wol => new WorkOrderLineItem(wol))), 
        //QUERY_OPERATIONS
    );

export const changeUnplannedCalloutsGrouping = payloadAction<ServiceOrderGrouping>(CHANGE_UNPLANNED_CALLOUTS_GROUPING);
export const changeMbmGrouping = payloadAction<ServiceOrderGrouping>(CHANGE_MBM_GROUPING);
export const changeInspectionPointsGrouping = payloadAction<ServiceOrderGrouping>(CHANGE_INSPECTION_POINTS_GROUPING);
export const changeInspectionsGrouping = payloadAction<ServiceOrderGrouping>(CHANGE_INSPECTIONS_GROUPING);
export const changeServiceNeedsGrouping = payloadAction<ServiceOrderGrouping>(CHANGE_SERVICE_NEEDS_GROUPING);
export const changeServiceNeedsFilter = payloadAction<ServiceNeedsFilter>(CHANGE_SERVICE_NEEDS_FILTER);