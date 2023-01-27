import { INote as INoteApi } from '../../api/coreApi';
import WrapperObject from '../../WrapperObject';

export default class Note extends WrapperObject<INoteApi> {

    get subject() {
        return this.value.Title;
    }

    get content() {
        return this.value.Body;
    }

    get createDate(){
        return this.value.CreatedDate;
    }
}
