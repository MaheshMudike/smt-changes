import { KFF_WEB, SALESFORCE_WEB, TRACE_DB_WEB } from '../constants/externalApps';
import openLinkExternally from '../utils/openLinkExternally';
import { ThunkAction } from 'src/actions/thunks';
import { showToast } from 'src/actions/toasts/toastActions';

function startExternalAppOrError(appPackage: string, appUri?: string, error?: (errorMessage: string) => void) {
    const app = (startApp as any).set({
        package: appPackage,
        application: appPackage
    });
    if(appUri != null) startApp.set({ uri: appUri });
    app.check(
        () => app.start(),
        (error == null ? (error: string) => console.log(error) : error) as any
    );
}

function startExternalAppOrUrl(webUrl: string, appPackage: string, appUri?: string) {
    startExternalAppOrError(appPackage, appUri, () => openLinkExternally(webUrl));
}

export function startExternalApp(appPackage: string, appUri?: string, toastErrorMessage?: string): ThunkAction<void> {
    return dispatch => {
        startExternalAppOrError(
            appPackage,
            appUri,
            () => {
                if(toastErrorMessage != null) dispatch(showToast({ message: toastErrorMessage }))
            }
        );
    }
}

export function openObjectInSalesforce(id: string) {
    //this is an attempt to log in with the oauth token to Salesforce, but doesn't work<
    /*
    restPost(SALESFORCE_WEB.frontDoorUrl, {
        sid: '00D6E0000000gK8!AQEAQEdh0IZlxX6lOMVAuiNoet7n.0a2eHWyAa_2S9.csUgaR9gi0b0XdLfRIx7poLXVtEhHxL4ITebSW9kblpb4zw3g0DuO',
        retURL: '/apex/realtive'
    });
    */
    openLinkExternally(SALESFORCE_WEB.buildViewSobjectUrl(id));
    /*
    startExternalAppOrUrl(
        SALESFORCE_WEB.buildViewSobjectUrl(id),
        SALESFORCE_1.package,
        SALESFORCE_1.buildViewSobjectUrl(id),
    );
    */
}

export function editObjectInSalesforce(id: string) {
    openLinkExternally(SALESFORCE_WEB.buildEditSobjectUrl(id));
    /*
    startExternalAppOrUrl(
        SALESFORCE_WEB.buildEditSobjectUrl(id),
        SALESFORCE_1.package,
        SALESFORCE_1.buildEditSobjectUrl(id),
    );
    */
}

export function openObjectAsKffAudit(id: string) {
    openLinkExternally(KFF_WEB.buildAuditUrl(id));
}

export function openTraceDb(AssetNumber: string) {
    openLinkExternally(TRACE_DB_WEB.buildTraceDbUrl(AssetNumber));
}