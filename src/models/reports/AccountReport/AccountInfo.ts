import { joinOptionals } from '../../../utils/formatUtils';
import WrapperObject from '../../WrapperObject';
import { IAccountReport } from 'src/models/api/coreApi';

export default class AccountInfo extends WrapperObject<IAccountReport> {
    get id(): string {
        return this.value.Id;
    }

    get accountName() {
        return this.value.Name;
    }

    get accountOwner() {
        return this.value.Owner == null ? null : this.value.Owner.Name;        
    }

    get accountPhone() {
        return this.value.Owner == null ? null : this.value.Owner.Phone || this.value.Owner.MobilePhone;        
        
    }

    get phone() {
        return this.value.Phone;
    }

    get address() {
        return joinOptionals([this.street, this.city, this.postalCode, this.country,], ', ', true,);
    }

    get street() {
        return this.value.Street_1__c;
    }

    get postalCode() {
        return this.value.KONE_Zip_Postal_Code__c;
    }

    get city() {
        return this.value.KONE_City__c;
    }

    get country() {
        return this.value.KONE_Country__c;
    }
}
