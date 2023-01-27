import { ModalType } from '../../constants/modalTypes';
import Equipment from '../../models/equipment/Equipment';
import { itemsStateAsyncActionNames } from '../actionUtils';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { replaceModalIfIncomplete } from '../modalActions';
import { queryAssetsForTerritoryStopped, queryEquipmentsByIds, queryEquipmentLastServiceOrder, getJsforceCollectionActionMapping, queryFSMServiceVisitHistory, queryWorkOrdersForAssets, queryHelpdeskCasesBase} from '../http/jsforce';
import { plannerGroupId, userIdFromState, activeInFSMFromState } from '../../models/globalState';
import { multiQuery1Extract, multiQuery2, EmptyQuery } from '../http/jsforceCore';
import { ServiceVisitHistory } from '../../models/service/ServiceVisitHistory';
import { LOAD_EQUIPMENT_HELPDESK_CASES, LOAD_EQUIPMENT_CONTACTS } from './calloutActions';
import { queryContractContactRoleBase, queryLocationContactsBase, queryWorkOrdersBase, queryContactServiceContractJunctionBase } from '../http/jsforceBase';
import { conditions, IConditionAnyResult } from '../http/jsforceMappings';
import HelpdeskCase from '../../models/feed/HelpdeskCase';
import Callout from '../../models/feed/Callout';
import { ContactWithRole } from '../../models/accounts/Contact';
import { flatten } from 'lodash';
import { queryAndShowDetailsDialogGeneric } from './detailsActions';
import { ContractContactRole, Location_Contact__c, WorkOrder, ContactServiceContractJunction__c } from 'src/models/api/coreApi';
import { EntityFieldsData, entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';
import { isAndroid, firebaseStartTrace, firebaseStopTrace } from 'src/utils/cordova-utils';

export const LOAD_EQUIPMENTS = itemsStateAsyncActionNames('LOAD_EQUIPMENTS');
export const LOAD_SERVICE_VISIT_HISTORIES = itemsStateAsyncActionNames('LOAD_SERVICE_VISIT_HISTORIES');

export function downloadStoppedEquipments() {
    if(isAndroid()){ firebaseStartTrace('Stopped Equipment trace') }
    return getJsforceCollectionActionMapping(
        state => 
            multiQuery1Extract(queryAssetsForTerritoryStopped(plannerGroupId(state)))
            .then(assets => queryEquipmentLastServiceOrder(assets)), 
        (e, state) => { 
            if(isAndroid()){ firebaseStopTrace('Stopped Equipment trace') }
            return new Equipment(e, entityFieldsDataFromState(state))
        }, LOAD_EQUIPMENTS
    );
}

export const downloadServiceVisitHistory = (assetId: string, limit: number) => asyncHttpActionGeneric(
    state => 
        multiQuery1Extract(queryWorkOrdersBase<{ Id: string }>([conditions.WorkOrder.asset([assetId])], ["Id"]))
        //queryWorkOrdersForAssets([assetId])
        .then(wos => queryFSMServiceVisitHistory(wos.map(wo => wo.Id), limit).then(svhs =>svhs.map(s => new ServiceVisitHistory(s)))
    ),
    LOAD_SERVICE_VISIT_HISTORIES
)

export function downloadEquipment(id: string, entityFieldsData: EntityFieldsData) {
    return queryEquipmentsByIds([id]).then(apiEquipments => new Equipment(apiEquipments[0], entityFieldsData));
}

export const downloadAndShowEquipment = (id: string) => queryAndShowDetailsDialogGeneric(
    //TODO add title to preload, not really necessary...
    //equipmentTitle(type, equipmentNumber,siteName),
    '',
    (state) => downloadEquipment(id, entityFieldsDataFromState(state)),
    item => dispatch => dispatch(replaceModalIfIncomplete(ModalType.EquipmentDetails, item))
)

export const queryEquipmentServiceOrders = (assetId: string, entityFieldsData: EntityFieldsData, options: IConditionAnyResult<WorkOrder>[]) => 
    queryWorkOrdersForAssets([assetId], options).then(cs => cs.map(c => new Callout(c, entityFieldsData)))

export const downloadEquipmentHelpdeskCases = (assetId: string) => asyncHttpActionGeneric(
    state => multiQuery1Extract(queryHelpdeskCasesBase([conditions.Case.asset(assetId)])).then(cases => cases.map(c => new HelpdeskCase(c)))
    , LOAD_EQUIPMENT_HELPDESK_CASES
)

export const downloadEquipmentContacts = (contractId: string, locationId: string) => asyncHttpActionGeneric(
    async state => {
        const result = await multiQuery2(
            /*contractId == null ? 
                new EmptyQuery([] as ContractContactRole[]) : 
                queryContractContactRoleBase([conditions.ContractContactRole.contract(contractId)]).sort('Contact.Name'),*/
            contractId == null ? 
                new EmptyQuery([] as ContactServiceContractJunction__c[]) : 
                queryContactServiceContractJunctionBase([conditions.ContactServiceContractJunction__c.contract(contractId)]).sort('Contact__r.Name'),
            locationId == null ? 
                new EmptyQuery([] as Location_Contact__c[]) : 
                queryLocationContactsBase([conditions.Location_Contact__c.location(locationId)]).sort('Contact__r.Name')
        );
        
        const [contractContacts, locationContacts] = result.queries.result;
        return [
            ...contractContacts.map(c => new ContactWithRole(c.Contact__r, c.Role__c)), 
            ...flatten(locationContacts.map(c => (c.Location_Roles__c || '').split(';').map(role => new ContactWithRole(c.Contact__r, role))))
        ] as ContactWithRole[];
    }
    , LOAD_EQUIPMENT_CONTACTS
)

