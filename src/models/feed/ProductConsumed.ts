import WrapperObject from "../WrapperObject";
import { ProductConsumed as ProductConsumedApi } from "../../models/api/coreApi";
import { IdentifiableTitleBodyHighPriority } from "../list/IListItem";
import { joinOptionals } from "../../utils/formatUtils";
import translate from "src/utils/translate";

export default class ProductConsumed extends WrapperObject<ProductConsumedApi> implements IdentifiableTitleBodyHighPriority {
    
    get id() {
        return this.value.Id;
    }

    get isHighPriority() {
        return false;
    }
    
   //title and body not used anymore
    get title() {
        return joinOptionals([
            'product-consumed.field.spare-part-number', 'generic.field.description',
            'generic.field.quantity', 'generic.field.status'
        ].map(translate), '|');
    }

    body() {
        return joinOptionals([
            this.value.Material_SAP_Number__c + '', this.value.ProductName, 
            this.value.QuantityConsumed + '', this.value.Status__c
        ], '|');
    }
    
    get sparePartNumber() {
        return this.value.Material_SAP_Number__c
    }

    get description() {
        return this.value.ProductName;
    }

    get quantity() {
        return this.value.QuantityConsumed;
    }

    get status() {
        return this.value.Status__c;
    }

    
}