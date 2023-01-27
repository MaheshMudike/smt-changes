import * as _ from 'lodash';
import { Dispatch } from 'redux';

import { refreshCachedEvents, refreshCalendarEvents } from '../actions/integration/events/eventActions';
import { synchronize } from '../actions/integration/synchronization';
import { showToast } from '../actions/toasts/toastActions';
import { NotificationType } from '../models/notifications';
import translate from '../utils/translate';
import { SMT_Notification__c } from '../models/api/coreApi';
import { ThunkAction } from '../actions/thunks';
import { refreshOfflineAccount } from '../actions/cache/accountActions';
import translateNotificationMessage from './translateNotificationMessage';


export const GET_GENERATE_REPORT = 'GET_GENERATE_REPORT';

const minSyncInterval = 5 * 60 * 1000;
const throttledSynchronize = _.throttle(synchronize(true), minSyncInterval);

const androidNotification = (message: string) => {
    (cordova.plugins as any).notification && (cordova.plugins as any).notification.local.schedule({ 
        //TODO: check this translation
        //'notifications.header'
        id: _.uniqueId(),
        title: translate('modal.contact-note.create-note-title'),
        text: message,
        foreground: true
    })
}



const translationKeyToNotificationConfig = {
    "notifications.salesForce.taskForComplaintUpdated": "newTaskAssignedRelatedToAComplaint",
    "notifications.salesForce.assignedComplaintUpdated": "newComplaintAssigned",
    "notifications.callout.newSvWillManage": "svWillManageFlag",
    "notifications.technicianAlarm.panic": "technicianPanicAlarm",
    "notifications.technicianAlarm.safety": "technicianSafetyAlert",
    "notifications.sickLift.alert": "sickLift",
    "notifications.callout.rejected": "rejectedCallout",
    "notifications.callout.entrapment": "newEntrapment",
    "notifications.callout.highPriority": "highPriorityCallout",
    "notifications.equipment.stopped": "newStoppedEquipment",
    "notifications.equipment.assigned": "newEquipmentAssigned",
    "notifications.equipment.transfered": "newEquipmentAssigned",
    "notifications.equipment.lost": "newEquipmentAssigned",
    "notifications.callout.technicalHelpDesk": "technicalHelpdeskCase"
};

enum Operation { Update = 'Update', Insert = 'Insert', Delete = 'Delete'};

export const handleNotification = (data: SMT_Notification__c): ThunkAction<void> => 
    (dispatch, getState) => {

    //const messageHandler = appStatus == AppStatus.Background ? backgroundAndroidMessageHandler : (message: string) => showToast({ message })(dispatch);
    
    const state = getState();
    const isOfflineMode = state.sharedState.isOfflineMode;
    switch (data.Type__c) {        
        case NotificationType.Account:
            //this was the old code
            /*             
            const accountNotification = data.data;
            const action = accountNotification.isDeleted ? deleteCachedAccount : updateCachedAccount;
            dispatch(action(new Account(accountNotification)));
            */
            //if(data.Operation__c === Operation.Delete)
            dispatch(refreshOfflineAccount(data.Record_Id__c));
            return;
        case NotificationType.Event:
            dispatch(refreshCalendarEvents);
            dispatch(refreshCachedEvents);
            return;
        case NotificationType.TechnicianAlarm:
        case NotificationType.SickLiftAlert:
        case NotificationType.Callout:
        case NotificationType.Equipment:
        case NotificationType.SalesForceNotification:
            const message = translateNotificationMessage(data);
            const notificationConfigType = translationKeyToNotificationConfig[data.Translation_Key__c];
            const notificationConfig = getState().configuration.actions[notificationConfigType] as {
                "enabled": boolean,
                "pushAction": boolean,
                "toastAction": boolean
            };
            if(notificationConfig != null && (notificationConfig.enabled == null || notificationConfig.enabled === true)) {
                if(notificationConfig.pushAction == null || notificationConfig.pushAction === true) androidNotification(message);
                if(notificationConfig.toastAction == null || notificationConfig.toastAction === true) dispatch(showToast({ message }));
            }
            if (!isOfflineMode) dispatch(synchronize());
            return;
        case NotificationType.DataChange:
            if (!isOfflineMode) {
                //no need to throttle because the notifications are being polled now
                //dispatch(throttledSynchronize);
                dispatch(synchronize(true));
            }
            break;
        default:
            break;
    }
};