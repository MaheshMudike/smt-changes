import { IPayloadAction } from '../actions/actionUtils';
import { ISalesOrganizationConfigurationState } from '../models/configuration';

export const salesOrganizationConfigDefault = {
    "content": {
        "complaintsActive": true,
        "queriesActive": true,
        "tendersActive": false,
        "opportunitiesActive": true,
        "leadsActive": true,
        "timesheetActive": true,
        "fieldAuditsActive": true,
        "helpdeskCasesActive": true,
        "monthlyDiscussionsActive": true,
        "repairsActive": true,
        "inspectionsActive": true,
        "serviceNeedsActive": false,
        "inspectionPointsActive": true
    },
    "actions": {
        "newEquipmentAssigned": {
        "enabled": true,
        "toastAction": true
    },
    "newEntrapment": {
        "enabled": true,
        "pushAction": true,
        "toastAction": true
    },
    "svWillManageFlag": {
        "enabled": true,
        "pushAction": true,
        "toastAction": true
    },
    "highPriorityCallout": {
        "enabled": true,
        "pushAction": false,
        "toastAction": true
    },
    "newComplaintAssigned": {
        "enabled": true,
        "pushAction": true,
        "toastAction": true
    },
    "declinedSA": {
        "enabled": false,
        "taskAction": false,
    },
    "newTaskAssignedRelatedToAComplaint": {
        "enabled": true,
        "pushAction": true
    },
    "customerPreparationReportGenerationFinished": {
        "enabled": true,
        "toastAction": true
    },
    "technicianPanicAlarm": {
        "enabled": true,
        "taskAction": true,
        "pushAction": true,
        "toastAction": true
    },
    "technicianSafetyAlert": {
        "enabled": true,
        "taskAction": true,
        "pushAction": true,
        "toastAction": true
    },
    "sickLift": {
        "enabled": true,
        "toastAction": true
    },
    "newStoppedEquipment": {
        "enabled": true,
        "toastAction": true
    },
    "rejectedCallout": {
        "enabled": true,
        "toastAction": true
    },
    "gamificationRewards": {
        "enabled": true,
        "pushAction": true
    },
    "onBoardingVisitForNewContract": {
        "enabled": false,
        "taskAction": false
    },
    "scheduleCustomerCall": {
        "enabled": true,
        "taskAction": true
    }
    },
    //"fitterLocation": "SO"
} as ISalesOrganizationConfigurationState

export const SET_SALESORG_CONFIG = 'SET_SALESORG_CONFIG';

export default function reducer(state = salesOrganizationConfigDefault, action: IPayloadAction<ISalesOrganizationConfigurationState>) {
    switch (action.type) {
        case SET_SALESORG_CONFIG:
            return action.payload;
        default:
            return state;
    }
}
