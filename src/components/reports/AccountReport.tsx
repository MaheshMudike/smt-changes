import * as React from 'react';

import { formatDateTime } from '../../utils/formatUtils';
import translate from '../../utils/translate';
import { IGlobalState, localeFromState } from 'src/models/globalState';
import { connect } from 'react-redux';
import { showReport, closeReport } from '../../actions/integration/reportActions';
import { Icon } from '../layout/Icon';


import { SvgIcon } from 'src/constants/SvgIcon';
/*
import * as html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import * as html2pdf from 'html2pdf.js';
*/
import * as cx from 'classnames';
import * as _ from 'lodash';

import * as moment from 'moment';

import { TableCompact, CellValue } from '../table/TableCompact';
import { ActionStatus } from '../../actions/actions';
import { CoveringSpinner } from '../CoveringSpinner';
import { IColumnHeaderAppearance } from '../table/Table';
import AccountReportExcel from './AccountReportExcel';
import accountReportTableData from './accountReportTableData';
import { save, MimeType, validFilename } from 'src/utils/fileUtils';
import { showToastMessage } from 'src/actions/toasts/toastActions';
import { ThunkAction } from 'src/actions/thunks';
import { IAccountReportPayload } from 'src/models/api/reports/accountReportApi';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';
//import { IColumnHeaderAppearance } from '../../models/dataTable/TableSchema';

/*
function printElementWithId(id: string) {
    const iframe = document.getElementById("ifmcontentstoprint") as HTMLIFrameElement;
    var pri = iframe.contentWindow;               
    pri.document.open();    
    //pri.document.write("<style>" + style.innerHTML + "@page { size: auto;  margin: 0mm; } body { padding: 50px }</style>");
    pri.document.write(divContentWithStyling(id));
    pri.document.close();    
    pri.focus();
    pri.document.title = "_";
    pri.print();
}
*/

function Header(props: { text: string; big?: boolean }) {
    return props.big ? 
        <h2 className={'report-header'}>{props.text}</h2> :
        <h3 className={'report-header--small'}>{props.text}</h3>;
}

function TableCompactWithSpinner<T>(props: { className?: string, noEntriesLabel?: string, emptyColumnLabel?: string,
    title: string, bigTitle?: boolean, thPrefix: string, ths: IColumnHeaderAppearance[], status: ActionStatus, rows: T[], colgroup?:React.ReactNode
    row: (t: T) => CellValue[]}) {

    const { title, thPrefix, ths, status, rows, row, className, colgroup, noEntriesLabel = 'account-report.no-entries', emptyColumnLabel = 'account-report.not-available' } = props;
    return (
        <div>
        { title == null ? null : <Header text={translate(title)} big={props.bigTitle} /> }
        <div style={ {position: "relative"} }>
        { status == ActionStatus.START ? <CoveringSpinner isSmall  /> : null}
        <TableCompact className={className} noEntriesLabel={noEntriesLabel} emptyColumnLabel={emptyColumnLabel} 
            thPrefix={thPrefix} ths={ths} rows={rows} row={row} colgroup={colgroup} />
        </div>
        </div>
    );
}

const htmlTemplate = (style: string, body: string) => `<!DOCTYPE html><html><head><meta charset="UTF-8">${style}</head><body>${body}</body></html>`;

const excelStyles = 'h1, h2, h3, h4, h5, h6 { margin: auto; } td, th { mso-number-format:"\@"; }'
+ "body { padding: 50px } #report-print-button { display: none; }"

function divContentWithStyling(id: string) {
    var content = document.getElementById(id);
    var style = document.getElementsByTagName("style")[0];
    const cssRulesText = _.flatMap(document.styleSheets, (styleSheet: any) => {
        const cssRules = (styleSheet.cssRules as CSSRuleList);
        var cssText = '';
        for(let i = 0; i < cssRules.length; i++) {
            cssText += cssRules.item(i).cssText;
        }
        return cssText;
    }).join('');

    const styleString = "<style>" + (style == null ? '' : style.innerHTML) + cssRulesText + excelStyles + "</style>";
    return htmlTemplate(styleString, content.innerHTML);
}

export function createReportFilename(accountName: string, date: Date) {
    const m = moment(date);
    return [validFilename(accountName), m.day(), m.month(), m.year()].join('_');
}

function saveReport(id: string, accountName: string, date: Date): ThunkAction<void> {
    return dispatch => {
        const filename = createReportFilename(accountName, date) + ".html";
        var content = divContentWithStyling(id);
        save(filename, MimeType.html, content, (key, error) => dispatch(showToastMessage(key)));
    }
}

function sortCompletedDate(report:IAccountReportPayload){
    for (let i=0; i<report.equipments.length; i++){
        report.equipments[i].closedServiceOrders.sort(function(a,b){
            var dateA=new Date(a.Completed_Date__c||a.EndDate);
            var dateB=new Date(b.Completed_Date__c||b.EndDate);
            return dateB.getTime()-dateA.getTime()
        })
    }
}

type AccountReportProps = ReturnType<typeof AccountReportStateProps> & { accountId: string } & typeof AccountReportDispatchProps

export class AccountReport extends React.Component<AccountReportProps, {}> {

    public componentDidMount(){
        if(isAndroid()) {
            FirebasePlugin.setScreenName('Account Report Screen');
        }
        this.props.closeMenu();
    }
    
    public render() {
        const accountId = this.props.accountId == null || this.props.accountId == undefined? Object.keys(this.props.reports.reports)[0] : this.props.accountId ;
        const reports = this.props.reports.reports;
        const report = reports[accountId];
        if(report == null) return null;

        const locale = this.props.locale;
        const selectedAccounts =  _.values(reports).filter(r => r.accounts[0].Id == accountId);
        const selectedAccountName = selectedAccounts.length > 0 ? selectedAccounts[0].accountName : null;

        const tableData = accountReportTableData(report, locale);
        sortCompletedDate(report);

        return (

            <div className="cover-all scrollable">
            <div className='report-container'>
                    
                <div className="container--horizontal" style={{ marginBottom: "-1px", marginTop: "2.375rem " }}>
                    <div className="filter-bar__button" />
                    { _.values(reports).map(r => r.accounts != null && r.accounts.length > 0 ? 
                        <div className={cx('filter-bar__button', 'container--centered', {clickable: accountId !== r.accountId, 'filter-bar__button--active': accountId == r.accounts[0].Id })} 
                        style={ { padding: "1rem", whiteSpace: "pre", border: "1px solid #d9dadb", maxWidth: "13rem" } }>
                            <span style={ { overflow: "hidden", textOverflow: "ellipsis" } }  onClick={() => this.props.showReport(r.accountId) }>{r.accountName}</span>
                            <Icon svg={SvgIcon.ClearBarDark} onClick={(event) => { this.props.closeReport(r.accountId); event.preventDefault() }} className='clickable' />
                        </div>: null)
                    }
                    <div className="filter-bar__button" />
                </div>

                <AccountReportExcel report={report} locale={locale} activeInFSM={this.props.activeInFSM}/>
                <button id="report-print-button" className="report-print-button" 
                    onClick={ () => this.props.saveReport("report", selectedAccountName, report.createdDate) }
                >
                    <Icon className='icon-big' svg={SvgIcon.FileDownloadBlue} />html
                </button>
                
                <div id="report" className="padding--std">
                <h1 id="report-header">{translate("account-report.header.customer-report")} { selectedAccountName }</h1>
                <h3>{translate("account-report.header.created")} { formatDateTime(report.createdDate, locale) }</h3>

                <Header text={translate('account-report.sections.customer-and-contract')} big={true} />
                
                <TableCompactWithSpinner {...tableData.accountInformation} />
                <TableCompactWithSpinner {...tableData.contracts} />
                <TableCompactWithSpinner {...tableData.customerVisits} />
                <TableCompactWithSpinner {...tableData.notes} />
                <TableCompactWithSpinner {...tableData.surveys} />
                <TableCompactWithSpinner {...tableData.transactionalSurveys} />
                <TableCompactWithSpinner {...tableData.complaints} />
                <TableCompactWithSpinner {...tableData.queries} />
                <TableCompactWithSpinner {...tableData.invoices} />

                <Header text={translate('account-report.sections.equipment-and-operations')} big={true} />

                <TableCompactWithSpinner {...tableData.equipment} />
                <TableCompactWithSpinner {...tableData.opportunities} />
                <TableCompactWithSpinner {...tableData.leads} />
                <TableCompactWithSpinner {...tableData.tenders} />
                <TableCompactWithSpinner {...tableData.technicians} />

                {
                    report.equipments.map(t => 
                        <div id={t.Id}>
                            <TableCompactWithSpinner {...tableData.equipmentInfo(t)} bigTitle />
                            <TableCompactWithSpinner {...tableData.equipmentCallouts(t)} bigTitle />

                            <Header text={translate('account-report.sections.service-orders')} big={true} />

                            <TableCompactWithSpinner {...tableData.equipmentServiceOrders(t,this.props.activeInFSM)} />
                            <TableCompactWithSpinner {...tableData.equipmentCompleted(t,this.props.activeInFSM)} />
                        </div>
                    )
                }
            </div>
            </div>
            </div>
        );
    }
}


const AccountReportStateProps = (state: IGlobalState) => { 
    return {
        accountId: state.reports.accountId,
        reports: state.reports,
        locale: localeFromState(state),
        activeInFSM: state.authentication.currentPlannerGroup.activeInFSM
    };
}
const AccountReportDispatchProps = { showReport, closeReport, saveReport, closeMenu }

export default connect(AccountReportStateProps, AccountReportDispatchProps)(AccountReport);