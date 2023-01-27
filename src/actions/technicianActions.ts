import Callout from '../models/feed/Callout';
import { TechnicianDetailsSetType } from '../models/technicianDetails/ITechnicianDetails';
import { asyncActionNames, emptyAction } from './actionUtils';
import { asyncHttpActionGeneric } from './http/httpActions';
import { queryWorkOrdersForTechnician } from './http/jsforce';
import { activeInFSMFromState, serviceResourceEnabledFromState } from '../models/globalState';
import { queryTechnicianDetails } from 'src/models/technicians/Technician';
import { queryAndShowDetailsDialogGeneric } from './integration/detailsActions';
import { ModalType } from 'src/constants/modalTypes';
import { replaceModalIfIncomplete } from './modalActions';
import { entityFieldsDataFromState } from 'src/components/fields/EntityFieldsData';

export const LOAD_TECHNICIAN_SERVICE_ORDERS = asyncActionNames('LOAD_TECHNICIAN_SERVICE_ORDERS');
export const RESET_TECHNICIAN_DETAILS = 'RESET_TECHNICIAN_DETAILS';

export function loadTechnicianServiceOrders(technicianId: string, detailsSetType: TechnicianDetailsSetType) {
    return asyncHttpActionGeneric(
        state => queryWorkOrdersForTechnician(activeInFSMFromState(state), serviceResourceEnabledFromState(state), technicianId, detailsSetType).then(orders => 
            ({detailsSetType, serviceOrders: orders.map(c => new Callout(c, entityFieldsDataFromState(state)))})
        ),
        LOAD_TECHNICIAN_SERVICE_ORDERS
        //, [], {}, orders => ({detailsSetType, serviceOrders: orders.map(c => new Callout(c))})
    );
}

export const downloadAndShowTechnicianDetails = (ids: string[]) => queryAndShowDetailsDialogGeneric(
    '',
    (state) => queryTechnicianDetails(ids, entityFieldsDataFromState(state)).then(ts => ts[0]),
    item => dispatch => dispatch(replaceModalIfIncomplete(ModalType.TechnicianDialog, item))
)

export const resetTechnicianDetails = () => emptyAction(RESET_TECHNICIAN_DETAILS);