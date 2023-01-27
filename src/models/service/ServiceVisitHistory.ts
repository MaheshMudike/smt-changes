import { IServiceAppointmentVisitHistory } from '../api/coreApi';
import WrapperObject from '../WrapperObject';

export class ServiceVisitHistory extends WrapperObject<IServiceAppointmentVisitHistory> {
    
    get id() {
        return this.value.Id;
    }
    get name(){
        return this.value.Name;
    }
    get createdDate(){
        return this.value.CreatedDate;
    }
    get owner(){
        return this.value.Owner.Name
    }

    get serviceAppointment() {
        const sa = this.value.Service_Appointment__r;
        return { id: sa.Id, status: sa.Status, appointmentNumber: sa.AppointmentNumber };
    }

    get noteBody(){
        if(this.value.Notes != null)
           return this.value.Notes.records.item.Body || '';
        else return '';
    }
    get noteTitle(){
        if(this.value.Notes != null)
            return this.value.Notes.records.item.Title || '';
        else return '';
    }
    
}