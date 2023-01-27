import WrapperObject from '../WrapperObject';
import * as coreApi from '../api/coreApi';
import { ILatLng } from '../map/LonLat';
import { ContractLineStatus, ContractLineStatusFilter } from '../../constants/ContractLineStatus';
import * as moment from 'moment';
import { conditions } from '../../actions/http/jsforceMappings';
import { TechnicianStatus } from '../../constants/TechnicianStatus';
import { fsmEquipmentConditionToStatusMapping } from 'src/constants/equipmentStatus';
import { assetOpportunityLocations } from 'src/actions/http/jsforce';

export class EquipmentMapItem extends WrapperObject<coreApi.IEquipmentMapItem> {

    constructor(item: coreApi.IEquipmentMapItem, public alarm: boolean) {
        super(item);
    }

    get equipmentStatusApi() {
        return fsmEquipmentConditionToStatusMapping[this.value.FSM_Equipment_Condition__c];
    }

    get coordinates(): ILatLng {
        return { lng: this.value.Geolocation__Longitude__s, lat: this.value.Geolocation__Latitude__s};
    }

    get nonContracted() {
        //return false;
        return !this.value.activeContractLines || this.value.activeContractLines.length <= 0;
    }

    get equipmentType() {
        return !!this.value.RecordType ? this.value.RecordType.Name : null;
    }

    /*
    get contractStatus(): ContractLineStatus {
        return this.value.contractLines && this.value.contractLines.length > 0 &&
            ContractLineStatus[this.value.contractLines[0].Status];
    }
    */

    get contractStatusFilter(): ContractLineStatusFilter[] {
        const now = moment();
        const activeLines = this.value.contractLines.filter(cl => cl.Status == ContractLineStatus.Active);

        if(activeLines.length > 0) return [ContractLineStatusFilter.Active];
        else {
            //future lines have probably all status "Inactive"
            const futureLines = this.value.contractLines.filter(cl => moment(cl.StartDate).isAfter(now) &&
                (cl.Status == ContractLineStatus.Active || cl.Status == ContractLineStatus.Inactive));
            const expiredLines = this.value.contractLines.filter(cl => cl.Status == ContractLineStatus.Expired);

            return [futureLines.length > 0 ? ContractLineStatusFilter.Future : null,
                    expiredLines.length > 0 ? ContractLineStatusFilter.Expired : null].filter(v => v != null);
        }
/*
        if(activeLines.length <= 0) return ContractLineStatusFilter.Expired;
        else {
            const line = activeLines[0];
            if(moment(line.StartDate).isAfter(moment())) return ContractLineStatusFilter.Future;
            else return ContractLineStatusFilter.Active;
        }
        */
    }

    get id() { return this.value.Id; }

    get mainWorkCenter() {
        return this.value.Main_Work_Center__r;
    }
}

export class WorkOrderMapItem extends WrapperObject<coreApi.IWorkOrderMapItem> {

    constructor(value: coreApi.IWorkOrderMapItem, private activeInFSM: boolean) {
        super(value);
    }

    get coordinates(): ILatLng {
        return { lng: this.value.Asset.Geolocation__Longitude__s, lat: this.value.Asset.Geolocation__Latitude__s};
    }

    get highPriority() {
        return conditions.WorkOrder.highPriority(this.activeInFSM).isFullfilledBy(this.value);
    }

    get id() {
        return this.value.Id;
    }

    get rejected() {
        return conditions.WorkOrder.rejected.isFullfilledBy(this.value);
    }

    get status() {
        return this.value.Status;
    }

    get maintenanceActivityType() {
        return this.value.Maintenance_Activity_Type__c;
    }

    get serviceOrderType() {
        return this.value.Service_Order_Type__c;
    }

    get unplanned() {
        return conditions.WorkOrder.callout.isFullfilledBy(this.value);
    }

}

export class TechnicianMapItem extends WrapperObject<coreApi.IServiceResourceMapItem> {

    constructor(mapItem: coreApi.IServiceResourceMapItem, public status: TechnicianStatus, public assetLocation: coreApi.AssetLocation, public clickable: boolean) {
        super(mapItem);
    }

    get id() { return this.value.Id; }

    get coordinates(): ILatLng {
        return { lat: this.value.LastKnownLatitude, lng: this.value.LastKnownLongitude };
    }

    get fullName() { return this.value.Name; }

}

export class OpportunityMapItem {
    //an opportunity can have many locations (equipment)
    constructor(public id: string, public assetOpportunities: coreApi.IAsset_Opportunity_Address__c[], public businessType: string) {
    }

    get coordinates() {
        return assetOpportunityLocations(this.assetOpportunities);
    }
}
