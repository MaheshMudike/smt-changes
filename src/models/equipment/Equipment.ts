import { EntityType } from '../../constants/EntityType';
import { fsmEquipmentConditionToStatusMapping, EquipmentStatusFilter, equipmentStatusTranslationsKeys} from '../../constants/equipmentStatus';
import { joinOptionals } from '../../utils/formatUtils';
import { parseDateToTimestamp } from '../../utils/parse';
import translate from '../../utils/translate';
import { IApiNameAndId, IAssetBase, IAssetExtended, IContractLineItem  } from '../api/coreApi';
import WrapperObject from '../WrapperObject';
import INameAndId from 'src/models/INameAndId';
import { ModalType } from '../../constants/modalTypes';
import { queryEquipmentsByIds, wrapFirstResult, queryMapEquipments } from '../../actions/http/jsforce';
import { WorkOrderField } from '../feed/Callout';
import { AccountType } from '../accounts/AccountType';
import { accountIdAndTypeForNameAndId } from 'src/actions/planCustomerVisitActions';
import { IAccountWithType } from '../plan/IPlanCustomerVisitState';
import { find } from 'lodash';
import { equipmentMarker, transparentMarker } from 'src/containers/pages/markers';
import { conditions } from 'src/actions/http/jsforceMappings';
import { EquipmentMapItem } from '../map/wrappers';
import { LocatableMapMarker } from '../map/Locatable';
import normalizeNameAndId from 'src/services/SalesForce/normalizeNameAndId';
import IEventSource from '../events/IEventSource';
import { EntityFieldsData } from 'src/components/fields/EntityFieldsData';

export function equipmentAddress(value: {
    Installation_Street__c: string;
    Installation_Zip_Postal_Code__c: string;
    Installation_City__c: string;
}) {
    return joinOptionals([
        value.Installation_Street__c,
        value.Installation_Zip_Postal_Code__c,
        value.Installation_City__c,
    ], ' ', true);
}

export function equipmentType(equipment: { Equipment_Type__c: string }) {
    return equipment.Equipment_Type__c == null ? null : translate('equipment-type.' + equipment.Equipment_Type__c);
}

export function siteName(equipment: { Location: { Name: string } }) {
    return equipment.Location == null ? null : equipment.Location.Name;
}
import { ContractLineStatus } from '../../constants/ContractLineStatus';

export abstract class EquipmentBase<T extends IAssetBase> //extends SalesforceListItem<T> {//
    extends WrapperObject<T> {

    get siteAddress() {
        return equipmentAddress(this.value);
    }

    get manufacturer() {
        return this.value.Manufacturer__c;
    }

    get serialNumber() {
        return this.value.Manufacturer_Serial_Number__c;
    }

    get equipmentNumber() {
        return this.value.Name;
    }

    get type() {
        return equipmentType(this.value);
    }

    get statusApi() {
        return fsmEquipmentConditionToStatusMapping[this.value.FSM_Equipment_Condition__c];
    }

    get status() {
        return translate(equipmentStatusTranslationsKeys[this.statusApi]);
    }

    get id() {
        return this.value.Id;
    }

}

function fixNullINameAndId(idName: IApiNameAndId): INameAndId {
    return idName == null ? 
    {
        id: null,
        name: null
    } :
    {
        id: idName.Id,
        name: idName.Name,
    };
}

const emptyNameAndId = { id: null, name: null } as INameAndId

function joinAccountsEventSource(accounts: IAccountWithType[]) {
    return accounts.reduce((accum, accountWithType) => {
        if(accountWithType == null) return accum;
        const found = find(accum, a => a.account.id == accountWithType.account.id);
        if(found) found.accountType = [...found.accountType, ...accountWithType.accountType];
        return found ? accum : [...accum, accountWithType];
    }, [] as IAccountWithType[]);
}

function equipmentTitle(equipmentType: string, equipmentNumber: string, siteName: string) {
    const equipmentTypeText = equipmentType == null ? translate('generic.entity-name.equipment') : equipmentType;
    return joinOptionals([`${ equipmentTypeText } ${ equipmentNumber }`, siteName], ' - ', true);
}

export enum UnitOfMeasure {
    Metric = 'Metric',
    Imperial = 'Imperial'
}

export interface IEquipmentContract {
    id: string;
    number: string;
    startDate: string;
    endDate: string;
    responseTime: string;
    responseTimeOutOfHours: string;
    contractType: string;
    serviceHours: string;
    fsmServiceContractCharacteristic: INameAndId; 
}

export function getAccountsFromContractLines(activeContractLines: IContractLineItem[], allContractLines: IContractLineItem[]) {
    const expiredContractLines = allContractLines.filter(cl => cl.Status == ContractLineStatus.Expired );
    const contractLines = activeContractLines.length <= 0 ? expiredContractLines : activeContractLines;
    const billToAccounts = contractLines.map(acc => acc.ServiceContract.Bill_To__r).filter(acc => acc != null);
    const decidedByAccounts = contractLines.map(acc => acc.ServiceContract.Decided_By__r).filter(acc => acc != null);
    const soldToAccounts = contractLines.map(acc => acc.ServiceContract.Sold_To__r).filter(acc => acc != null);

    return {
        billedToAccount: billToAccounts.length > 0 ? fixNullINameAndId(billToAccounts[0]) : emptyNameAndId,
        decidedByAccount: decidedByAccounts.length > 0 ? fixNullINameAndId(decidedByAccounts[0]) : emptyNameAndId,
        soldToAccount: soldToAccounts.length > 0 ? fixNullINameAndId(soldToAccounts[0]) : emptyNameAndId,
    }
}
class Equipment extends EquipmentBase<IAssetExtended> implements LocatableMapMarker, IEventSource {//, IDialogListItem
    
    public readonly soldToAccount = emptyNameAndId;
    public readonly decidedByAccount = emptyNameAndId;
    public readonly billedToAccount = emptyNameAndId;
    public readonly account = emptyNameAndId;
   
    public readonly contract: IEquipmentContract = {
        id: null,
        contractType: null,
        startDate: null,
        endDate: null,
        number: null,
    
        responseTime: null,
        responseTimeOutOfHours: null,
        serviceHours: null,
        fsmServiceContractCharacteristic: emptyNameAndId,
    };

    constructor(asset: IAssetExtended, private entityFieldsData: EntityFieldsData) {
        super(asset);

        this.account = normalizeNameAndId(this.value.Account);

        const activeContractLines = this.value.activeContractLines || [];
        const expiredContractLines = this.value.contractLines ? this.value.contractLines.filter(cl => cl.Status == ContractLineStatus.Expired ) : [];
        const contractLines = activeContractLines.length <= 0 ? expiredContractLines : activeContractLines;
        const contractAccounts = getAccountsFromContractLines(activeContractLines, contractLines);
        this.billedToAccount = contractAccounts.billedToAccount;
        this.decidedByAccount = contractAccounts.decidedByAccount;
        this.soldToAccount = contractAccounts.soldToAccount;

        if(contractLines && contractLines.length > 0) {
            const fsmServiceContractCharacteristics = contractLines.map(acc => acc.Characteristics__r).filter(acc => acc != null);
            const contractLine = contractLines[0];
            const contract = contractLine.ServiceContract;
            this.contract = {
                id: contract.Id,
                contractType: contractLines[0].RUSH_Contract_type__c,
                startDate: contractLines[0].StartDate,
                endDate: contractLines[0].EndDate,
                // number: contract.ContractNumber + '',
                number:contract.Contract_SAP_Number__c + '',

                responseTime: contractLine.Response_time_office_hours__c,
                responseTimeOutOfHours: contractLine.Response_time_outside_office_hours__c,
                serviceHours: contractLine.Service_hours__c, 
                fsmServiceContractCharacteristic: (fsmServiceContractCharacteristics.length > 0) ? fixNullINameAndId(fsmServiceContractCharacteristics[0].records[0]) : emptyNameAndId, 
            }
        }
    }

    get contractResponseTime() {
        return this.contract.responseTime;
    }

    get contractResponseTimeOutsideOfficeHours() {
        return this.contract.responseTimeOutOfHours;
    }

    get coordinates() {
        return {
            lat: this.value.Geolocation__Latitude__s,
            lng: this.value.Geolocation__Longitude__s,
            type: EntityType.Equipment
        };
    }

    marker() {
        return queryMapEquipments([conditions.Asset.ids([this.id])]).then(
            assets => {
                const markers = assets.map(a => {
                    const alarm = conditions.Asset.stopped.isFullfilledBy(a);
                    return new EquipmentMapItem(a, alarm);
                }).map(emi => transparentMarker(equipmentMarker(emi, emi.id)));
                return markers.length > 0 ? markers[0] : null;
            }
        );
    }

    get entityType() {
        return EntityType.Equipment;
    }

    get title() {
        return equipmentTitle(this.type, this.equipmentNumber, this.siteName)
    }

    body() {
        return joinOptionals([this.status, this.customerAssetName], '|');
        //return `Status: ${ this.status || '' }`;
    }

    get bodySecondLine() {
        return this.siteAddress;
    }

    get customerAssetName() {
        return this.value.Customer_Asset_Name__c;
    }

    get lastServiceOrder() {
        return this.value.lastServiceOrder;
    }

    get nextMbm() {
        return this.value.nextMbm;
    }

    get lastEquipmentStartedOrder() {
        return this.value.lastEquipmentStartedOrder && new WorkOrderField(this.value.lastEquipmentStartedOrder, this.entityFieldsData);
    }

    get lastEquipmentStoppedOrder() {
        return this.value.lastEquipmentStoppedOrder && new WorkOrderField(this.value.lastEquipmentStoppedOrder, this.entityFieldsData);
    }

    get accountsForEventCreation() {
        return Promise.resolve(joinAccountsEventSource( [
            accountIdAndTypeForNameAndId(this.billedToAccount, AccountType.BilledTo),
            accountIdAndTypeForNameAndId(this.decidedByAccount, AccountType.DecidedBy),
            accountIdAndTypeForNameAndId(this.soldToAccount, AccountType.SoldTo),
            //accountIdAndTypeForNameAndId(this.account, AccountType.Unknown)
        ]));
    }

    get descriptionForEvent() {
        return null as string;
    }

    get whatForEvent() {
        const account = normalizeNameAndId(this.value.Account)
        return { ...account, title: account.name, entityType: EntityType.Account };
    }

    get contactsForEventCreation() {
        return Promise.resolve([]);
    }

    get isHighPriority() {
        return this.value.FSM_Equipment_Condition__c === EquipmentStatusFilter.OUT_OF_ORDER;
        //return this.status === equipmentStatusTranslations().OUT_OF_ORDER;
    }

    /* FSM not captured
    get statusInfo() {
        return this.value.statusInfo == null ? null : new EquipmentStatusInfo(this.value.statusInfo);        
    }
    */

    get locationId() {
        return this.value.Location && this.value.Location.Id;
    }

    get siteName() {
        return this.value.Location == null ? null : this.value.Location.Name;
    }

    get mainWorkCenterName() {
        return this.value.Main_Work_Center__r && this.value.Main_Work_Center__r.Name;
    }

    get mainWorkCenterDescription() {
        return this.value.Main_Work_Center__r && this.value.Main_Work_Center__r.Description__c;
    }

    get year() {
        return this.value.Construction_Year__c;
    }

    get technicalPlatform() {
        return this.value.Elevator_Technical_Platform__c;
    }

    get ratedSpeed() {
        return this.value.Rated_Speed__c;
    }

    get ratedLoad() {
        return this.value.Rated_Load__c;
    }

    get ratedSpeedImperial() {
        return this.value.Rated_Speed_Imperial__c;
    }

    get ratedLoadImperial() {
        return this.value.Rated_Load_Imperial__c;
    }

    get numberOfFloors() {
        return this.value.Number_Of_Floors__c;
    }

    get marketSegment() {
        return this.value.Market_segment__c;
    }

    get lastModification() {
        return parseDateToTimestamp(this.value.LastModifiedDate);
    }

    public getEntityType() {
        return EntityType.Equipment;
    }

    get modalType() {
        return ModalType.EquipmentDetails;
    }

    public queryDetails() {
        return queryEquipmentsByIds([this.id]).then(
            wrapFirstResult(e => new Equipment(e, this.entityFieldsData))
        );
    }
    
    get stopDate() {
        return this.value.FSM_Out_Of_Order_Date__c;
    }
    
    get stopReason() {
        return this.value.FSM_Condition_Reason_Code__c;
    }

    get startDate() {
        return this.value.FSM_Back_In_Order_Date__c;
    }

}

export default Equipment;
