import WrapperObject from "../WrapperObject";
import { WorkOrderLineItem as WorkOrderLineItemApi } from "../../models/api/coreApi";
import { IdentifiableTitleBodyHighPriority } from "../list/IListItem";
import { joinOptionals } from "../../utils/formatUtils";

export default class WorkOrderLineItem extends WrapperObject<WorkOrderLineItemApi> implements IdentifiableTitleBodyHighPriority {
    
    get id() {
        return this.value.Id;
    }

    get isHighPriority() {
        return false;
    }

    get title() {
        return joinOptionals([this.value.Operation_Text__c]);//this.value.Id;
    }

    body() {
        return null as string;//this.value.Operation_Text__c;
    }

}