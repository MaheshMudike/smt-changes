import translate from "src/utils/translate";

export default function translateNotificationMessage(notification: { Data__c: string, Translation_Key__c: string }) {
    let dataArray = ['',''];
    try {
        dataArray = JSON.parse(notification.Data__c) as string[];
    } catch(e) {};
    var message = translate(notification.Translation_Key__c);
    for(var i=0; i < dataArray.length; i++) message = message.replace('%s', dataArray[i]);
    return message;
}