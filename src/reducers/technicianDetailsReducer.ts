import { IPayloadAction } from '../actions/actionUtils';
import { LOAD_TECHNICIAN_SERVICE_ORDERS, RESET_TECHNICIAN_DETAILS } from '../actions/technicianActions';
import { ITechnicianDetails, IDetailsSet } from '../models/technicianDetails/ITechnicianDetails';
import * as _ from 'lodash';

function updateDetailsSetForTechnicianDetailsSetType(technicianDetails: ITechnicianDetails, newSet: IDetailsSet) {
    const newSetArray = _.unionWith(technicianDetails.detailsSet,
        [newSet],
        (a: IDetailsSet, b: IDetailsSet): boolean => a.detailsSetType === b.detailsSetType);
    return { ...technicianDetails, detailsSet: newSetArray };
}

const initialTechnicianDetailsState: ITechnicianDetails = {
    detailsSet: [],
};

export default function technicianDetailsReducer(
    previousState = initialTechnicianDetailsState,
    action: IPayloadAction<any>,
): ITechnicianDetails {
    switch (action.type) {
        case LOAD_TECHNICIAN_SERVICE_ORDERS.success:
            return updateDetailsSetForTechnicianDetailsSetType(
                previousState, {
                    detailsSetType: action.payload.detailsSetType,
                    isDownloaded: true,
                    isDownloading: false,
                    items: action.payload.serviceOrders,
                }) as ITechnicianDetails;
        case RESET_TECHNICIAN_DETAILS:
            return initialTechnicianDetailsState;
        default:
            return previousState;
    }
}
