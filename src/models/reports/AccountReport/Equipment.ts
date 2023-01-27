import * as _ from 'lodash';
import Callout from './Callout';
import { IAssetReport, IApiNameAndId, IContractLineItemReport } from 'src/models/api/coreApi';
import { EquipmentBase } from 'src/models/equipment/Equipment';

export default class Equipment extends EquipmentBase<IAssetReport> {

    constructor(asset: IAssetReport, private activeContractLine: IContractLineItemReport) {
        super(asset);
    }

    get completedCallouts(): number {
        return this.value.completedCallouts;
    }

    get otherCompletedServiceOrders(): number {
        return this.value.otherCompletedServiceOrders;
    }

    get missedVisits(): number {
        return this.value.missedVisits;
    }

    get openMBMs(): number {
        return this.value.openMBMs;
    }

    get openServiceOrders() {
        return this.value.openServiceOrders == null ? [] : this.value.openServiceOrders.map(so => new Callout(so));
    }

    get closedServiceOrders() {
        return this.value.closedServiceOrders == null ? [] : this.value.closedServiceOrders.map(so => new Callout(so));
    }

    get serviceOrdersHistogram(): _.Dictionary<number> {
        return this.value.serviceOrdersHistogram;
    }

    get contractServiceHours() {
        return this.activeContractLine && this.activeContractLine.Service_hours__c;
    }

    get contractResponseTime() {
        return this.activeContractLine && this.activeContractLine.Response_time_office_hours__c;
    }
}
