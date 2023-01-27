import { UnitOfMeasure } from "src/models/equipment/Equipment";
import { IGlobalState, userIdFromState, uomFromState, activeInFSMFromState, localeFromState, serviceResourceEnabledFromState } from "src/models/globalState";

export interface EntityFieldsData {
    userId: string;
    unitOfMeasure: UnitOfMeasure;
    locale:string;
    activeInFSM: boolean;
    serviceResourceEnabled: boolean;
    inactiveDays?: number;
}

export function entityFieldsDataFromState(state: IGlobalState): EntityFieldsData {
    return { 
        userId: userIdFromState(state), 
        unitOfMeasure: uomFromState(state), 
        locale: localeFromState(state),
        activeInFSM: activeInFSMFromState(state),
        serviceResourceEnabled: serviceResourceEnabledFromState(state),
        inactiveDays: state.configuration.technicianInactivityLimitInDays
    };
}