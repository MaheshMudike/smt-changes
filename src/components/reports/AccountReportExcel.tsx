import * as React from 'react';
import ReactExport from 'react-data-export';
import accountReportTableData, { ReportColor } from './accountReportTableData';
import { IGlobalState } from '../../models/globalState';
import { connect } from 'react-redux';
import { IColumnHeaderAppearance, translateWithPrefix } from '../table/Table';
import { CellValue, JsxElementWrapper } from '../table/TableCompact';
import translate from '../../utils/translate';
import { flatMap } from 'lodash';
import { createReportFilename } from './AccountReport';
import { IAssetReport } from '../../models/api/coreApi';
import { formatDateTime } from '../../utils/formatUtils';
import { Icon } from '../layout/Icon';
import { SvgIcon } from '../../constants/SvgIcon';
import { save, saveBlob } from 'src/utils/fileUtils';
import { showToastMessage } from 'src/actions/toasts/toastActions';
import { IActionStatus } from 'src/actions/actions';
import { IAccountReportPayload } from 'src/models/api/reports/accountReportApi';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;


function excelTable<T>(props: { className?: string, noEntriesLabel?: string, emptyColumnLabel?: string,
    title: string, bigTitle?: boolean, thPrefix: string, ths: IColumnHeaderAppearance[], rows: T[], 
    row: (t: T) => CellValue[]}) {

    if(props.rows.length <= 0) return null;
    const { title } = props;
    const data = [...excelDataArray(props)];
    return <ExcelSheet dataSet={data} name={translate(title).replace('/', '-')}/>
}


const borderColor =  { rgb: "FFEBECED" }
const fontColor = { rgb: "FF646566"};
const borderStyle =  { style: 'thin', color: borderColor }

const thStyle = {
    font: {sz: "14", color: fontColor},
    alignment: { wrapText: true },
    fill: {patternType: "solid", fgColor: {rgb: "fff7f9fa"}},
    border: { top: borderStyle, bottom: borderStyle }
};
const headerStyle = {
    font: {sz: "20", bold: true, color: fontColor}
}

const blueHeaderStyle = {
    font: {sz: "24", bold: true, color: { rgb: "FF0280d0" } }
}

const tdStyle = (fgColor: string = "ffffffff") => ({
    font: {color: fontColor},
    alignment: { wrapText: true },
    fill: {patternType: "solid", fgColor: {rgb: fgColor}},
    border: { bottom: borderStyle }
});

type ExcelColumnRowData = { columns: any[], data: any[][] };

function excelDataArray<T>(data: { title: string, thPrefix: string, ths: IColumnHeaderAppearance[], rows: T[], row: (t: T) => CellValue[]}): ExcelColumnRowData[] {
    return [titleTable(translate(data.title)), excelData(data)];
}

function titleTable(title: string, style: any = headerStyle) {
    return ({ columns: [{ title: "" }], data: [[ { value: title, style } ]] as any });
}

/*
$report-green: #bee7d3;
$report-orange: #f1d8bf;
$report-yellow: #eaf0bf;
$report-red: #f6babc;
*/
function color(color: string) {
    switch(color as ReportColor) {
        case ReportColor.green: return 'FFbee7d3';
        case ReportColor.orange: return 'FFf1d8bf';
        case ReportColor.yellow: return 'FFeaf0bf';
        case ReportColor.red: return 'FFf6babc';
        default: return 'FFFFFFFF';
    }
}

function excelData<T>(data: { thPrefix: string, ths: IColumnHeaderAppearance[], rows: T[], row: (t: T) => CellValue[]}): ExcelColumnRowData {
    const { thPrefix, ths, rows, row } = data;
    const dataResult = {
        columns: ths.map(th => ({ title: '', style: headerStyle,  width: {wch: th.width * 13} })),
        data: [
            ths.map(th => ({ value: translateWithPrefix(thPrefix, th.label) || '', style: thStyle })),
            ...rows.map(r => row(r).map((cell, index) => {
                const value = cell == null ? '' : cell instanceof JsxElementWrapper ? cell.label : cell;
                const c = color(ths[index] && ths[index].color);
                return ({ value, style: tdStyle(c) }); 
            }))
        ]
    };
    return dataResult;
}


function combineRows(data1: any[][], data2: any[][]) {
    var rowsResult = [] as any;
    for(var i = 0; i < Math.max(data1.length, data2.length); i++) {
        const row1 = data1[i] || [];
        const row2 = data2[i] || [];
        rowsResult.push([...row1, ...row2]);
    }
    return rowsResult;
}

function combineData(...data: ExcelColumnRowData[]): ExcelColumnRowData {
    return data.reduceRight((accum, value) => ({ 
        columns: [...accum.columns, ...value.columns],
        data: combineRows(accum.data, value.data)
    }), { columns: [], data: [] })
}


type AccountReportExcelProps = { locale: string, report: IAccountReportPayload & IActionStatus, activeInFSM: boolean } & { showToastMessage: typeof showToastMessage }

function equipmentSummary(tableData: ReturnType<typeof accountReportTableData>, equipments: IAssetReport[]) {
    const reducedData = equipments.reduce(
        (accum, eq) => [
            ...accum,
            titleTable(translate("generic.entity-name.equipment") + " " + eq.Name, blueHeaderStyle),
            ...excelDataArray(tableData.equipmentInfo(eq)), 
            ...excelDataArray(tableData.equipmentCallouts(eq))], []);
    return reducedData;
}

function equipmentOrdersSummary(tableData: ReturnType<typeof accountReportTableData>, equipments: IAssetReport[], activeInFSM: boolean) {
    const reducedData = equipments.reduce(
        (accum, eq) => [
            ...accum,
            titleTable(translate("generic.entity-name.equipment") + " " + eq.Name, blueHeaderStyle),
            ...excelDataArray(tableData.equipmentServiceOrders(eq,activeInFSM)), 
            ...excelDataArray(tableData.equipmentCompleted(eq,activeInFSM))], []);
    return [
        ...reducedData
    ];
}

class AccountReportExcel extends React.Component<AccountReportExcelProps, object> {
    render() {
        const report = this.props.report;
        const tableData = accountReportTableData(report, this.props.locale);
        return (
            <div>
                <ExcelFile 
                    element={
                        <button id="report-print-excel-button" className="report-print-button">
                            <Icon className='icon-big' svg={SvgIcon.FileDownloadBlue} />xlsx
                        </button>
                    }
                    filename={createReportFilename(report.accountName, report.createdDate)}
                    saveAs={ 
                        (blob: Blob, filename: string) => 
                            saveBlob(blob, filename, (key, error) => this.props.showToastMessage(key)) 
                    }
                >
                    {
                        <ExcelSheet dataSet={ [
                            titleTable(translate("account-report.header.customer-report") + " " + report.accountName, blueHeaderStyle),
                            titleTable(translate("account-report.header.created") + formatDateTime(report.createdDate, this.props.locale)),
                            ...excelDataArray(tableData.accountInformation)
                        ] }
                            name={translate(tableData.accountInformation.title)} />
                    }

                    {excelTable(tableData.contracts)}
                    {excelTable(tableData.customerVisits)}
                    {excelTable(tableData.notes)}
                    {excelTable(tableData.surveys)}
                    {excelTable(tableData.complaints)}
                    {excelTable(tableData.queries)}
                    {excelTable(tableData.invoices)}

                    {excelTable(tableData.equipment)}
                    {excelTable(tableData.opportunities)}
                    {excelTable(tableData.leads)}
                    {excelTable(tableData.tenders)}
                    {excelTable(tableData.technicians)}
                    {
                        <ExcelSheet dataSet={ 
                            equipmentSummary(tableData, report.equipments) }
                            name={translate("account-report.equipment.summary")} />
                    }
                    {
                        <ExcelSheet dataSet={ equipmentOrdersSummary(tableData, report.equipments, this.props.activeInFSM) } 
                            name={translate("account-report.equipment.ordersummary")} />
                    }

                    {/*
                        ...report.equipments.map(t => 
                            {
                                return [<ExcelSheet dataSet={ [
                                    ...excelDataArray(tableData.equipmentInfo(t)), 
                                        ...excelDataArray(tableData.equipmentCallouts(t))
                                    ] } 
                                    name={translate("generic.entity-name.equipment") + " - " + t.Name} />,

                                    <ExcelSheet dataSet={ [
                                        ...excelDataArray(tableData.equipmentServiceOrders(t)),
                                        ...excelDataArray(tableData.equipmentCompleted(t))
                                    ] } 
                                        name={translate("generic.entity-name.equipment") + " orders - " + t.Name} />
                                ]
                            }
                        )*/
                    }
                </ExcelFile>
            </div>
        );
    }
}

export default connect(null, { showToastMessage })(AccountReportExcel);
