import { queryTractionControlReport, TractionControlReportType, queryContentVersionDataById, queryContentDocumentLinksContentDocuments } from './http/jsforce';
import { asyncActionNames, itemsStateAsyncActionNames, payloadAction } from './actionUtils';
import { plannerGroupFromState, userIdFromState, plannerGroupIdFromState } from '../models/globalState';
import { asyncHttpActionGeneric } from './http/httpActions';
import * as _ from 'lodash';
import { requestGet, request } from './http/jsforceCore';
import { blobToBase64 } from 'src/utils/fileUtils';
import { ITractionControlReport } from 'src/reducers/tractionControlReducer';

export const TRACTION_CONTROL_REPORT_DOWNLOAD = asyncActionNames('TRACTION_CONTROL_REPORT_DOWNLOAD');
export const TRACTION_CONTROL_REPORTS_QUERY = itemsStateAsyncActionNames('TRACTION_CONTROL_REPORTS_QUERY');
export const TRACTION_CONTROL_REPORT_SELECT = "TRACTION_CONTROL_REPORT_SELECT";
export const TRACTION_CONTROL_REPORT_SELECT_MONTH = "TRACTION_CONTROL_REPORT_SELECT_MONTH";
export const TRACTION_CONTROL_REPORT_QUERY = itemsStateAsyncActionNames('TRACTION_CONTROL_REPORT_QUERY');

export function queryTractionControlReports() {
    return asyncHttpActionGeneric(
        //state => queryPersonalAndServiceTerritoryTractionControlReports(userIdFromState(state), plannerGroupIdFromState(state)),
        state => queryContentDocumentLinksContentDocuments(userIdFromState(state)),
        TRACTION_CONTROL_REPORTS_QUERY
    );
}

// TC#BEL#VA#B16#Weekly_Report.html
// TC#BEL#VA#B16#Monthly_Report.html
// https://siilisolutions.atlassian.net/wiki/spaces/KONESMT/pages/552075798/Traction+Control+-+provide+access+to+historical+Traction+Control+reports
// \\ (/)prodsmttcstorage.file.core.windows.net <https://eur02.safelinks.protection.outlook.com/?url=http://prodsmttcstorage.file.core.windows.net&data=02%7c01%7cAlessandro.Cassina%40kone.com%7cfb148d3be52c47d1c9da08d6b0fb3e89%7c2bb82c642eb143f78862fdc1d2333b50%7c0%7c0%7c636890990464335803&sdata=MveRqRJ/6EvX0U776SZQT1D3s2qK53yQWyFwzQILRPo%3D&reserved=0> \traction-control-reports\Monthly\KED
export function downloadTractionControlReport(reportType: TractionControlReportType) {
    return asyncHttpActionGeneric(
        (state) => {
            const plannerGroup = plannerGroupFromState(state);
            if(plannerGroup == null) return Promise.resolve(null as string);
            return queryTractionControlReport(plannerGroup.salesOrganization, reportType, plannerGroup.branchCode);
        },
        TRACTION_CONTROL_REPORT_DOWNLOAD
    );
}


export function selectTractionControlReport(report: ITractionControlReport) {
    return payloadAction(TRACTION_CONTROL_REPORT_SELECT)(report);
}

export function selectTractionControlYearMonth(yearMonth: string) {
    return payloadAction(TRACTION_CONTROL_REPORT_SELECT_MONTH)(yearMonth);
}

export function queryTractionControlReportById(id: string, fileType: string) {
    return asyncHttpActionGeneric(
        state => queryContentVersionDataById(id).then(data => ({ id, data, fileType })), 
        TRACTION_CONTROL_REPORT_QUERY
    );
}

const responseTypeByFileType = {
    "html": "text",
    "pdf": "blob"
}

export function getContentVersionData(report: ITractionControlReport) {
    return asyncHttpActionGeneric(
        async () => {
            const { fileType, versionData } = report;
            const responseType = fileType == null ? null : responseTypeByFileType[fileType.toLowerCase()];
            const binaryData = await request<Blob | string>(versionData, fileType == null ? null : responseType);
            const data = responseType == 'blob' ? await blobToBase64(binaryData as Blob) : binaryData as string;
            return { data, dataBinary: binaryData as Blob };
        },
        TRACTION_CONTROL_REPORT_QUERY
    );
}