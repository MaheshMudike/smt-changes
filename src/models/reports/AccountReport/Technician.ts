import { IServiceResourceReport, IServiceResource } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class Technician extends WrapperObject<IServiceResourceReport> {

    get name() {
        //return this.value.RelatedRecord.FirstName + ' ' + this.value.RelatedRecord.LastName;
        return this.value.Name;
    }

    get phoneNumber() {
        return this.value.RelatedRecord == null ? null : this.value.RelatedRecord.MobilePhone;
    }

    get workcenter() {
        return this.value.roundNumber;        
    }
}
