import * as React from 'react';
import { connect } from 'react-redux';
import { CoveringSpinner } from '../CoveringSpinner';
import { IGlobalState } from '../../models/globalState';
import translate from '../../utils/translate';
import { queryTractionControlReports, selectTractionControlReport, getContentVersionData, selectTractionControlYearMonth } from '../../actions/tractionControlActions';
import { ListContainer } from '../ListSplitPanel';
import * as _ from 'lodash';
import { createSelector } from 'reselect';
import { SelectField } from '../forms/SelectField';
import { request } from 'src/actions/http/jsforceCore';
import { save, MimeType, validFilename } from 'src/utils/fileUtils';
import { showToastMessage } from 'src/actions/toasts/toastActions';
import { ThunkAction } from 'src/actions/thunks';
import { ListItem } from '../list/ListItem';
import { ContentDocument } from 'src/models/api/coreApi';
import * as cx from 'classnames';
import { ListBodyContainer } from '../list/ListBodyContainer';
import { ActionStatus } from 'src/actions/actions';
import { formatDateMonthYear } from 'src/utils/formatUtils';
import * as moment from 'moment';
import { TractionControlReportClass2 } from './TractionControlReport';
import { EmptyView } from '../EmptyView';
import { Icon } from '../layout/Icon';
import { SvgIcon } from 'src/constants/SvgIcon';
import { ITractionControlReport } from 'src/reducers/tractionControlReducer';
import { entityFieldsDataFromState, EntityFieldsData } from '../fields/EntityFieldsData';
import { TractionControlReportType } from 'src/actions/http/jsforce';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

interface ITractionControlReportsDispatchProps {
    queryTractionControlReports: typeof queryTractionControlReports;
    selectTractionControlReport: typeof selectTractionControlReport;
    selectTractionControlYearMonth: typeof selectTractionControlYearMonth;
    saveReport: typeof saveReport;
    saveReportFile: typeof saveReportFile;
    getContentVersionData: typeof getContentVersionData;
    closeMenu: typeof closeMenu;
}

type TractionControlReportsProps = ReturnType<typeof TractionControlReportsStateProps> & { reportType: TechnicianReportType } & ITractionControlReportsDispatchProps;

enum TechnicianReportType { 
    VC = "VC", 
    VA = "VA" 
}

const REPORT_NAME_DIVIDER = "#";

/*
Here’s what agreed for the naming convention for monthly reports

Planner Group Monthly report : “TC#SalesOrganization#VA/VC#PlannerGroupName(SAP code)#Monthly_Report#Year_Month.pdf“
Technician Monthly report:     “TC#SalesOrganization#VA/VC#PlannerGroupName(SAP code)#Monthly_Report#Year_Month#Workcenter#TechnicianName.pdf“
*/
class TractionControlReportsClass extends React.Component<TractionControlReportsProps> {
    
    private formatYearMonth(yearMonth: string, locale: string) {
        if(yearMonth == null) return null;
        return formatDateMonthYear(moment(yearMonth, "YYYY_MM"), locale);
    }

    public render() {
        const { reportType, selectedReport, selectedReportData, reports, selectedReportDownloadStatus, entityFieldsData } = this.props;
        const { weeklyVAReports = [], weeklyVCReports = [], reportsByMonthVA = {}, reportsByMonthVC = {} } = reports;

        const fileType = (selectedReport && selectedReport.fileType || '').toLowerCase();
        const android = isAndroid();
        
        const reportsByMonth =  reportType == TechnicianReportType.VA ? reportsByMonthVA : reportsByMonthVC;
        const monthlyReports = reportsByMonth[this.props.selectedYearMonth] || [];
        const months = _.keys(reportsByMonth).sort().reverse();
        const selectField = months.length <= 0 ? null : <SelectField options={months}
            value={this.props.selectedYearMonth}
            //className='separated--all-dark'
            isLoading={false}
            optionsMapper={(yearMonth) => ({ label: this.formatYearMonth(yearMonth, entityFieldsData.locale), value: yearMonth }) }
            onChange={yearMonth => this.setYearMonth(yearMonth)}
            placeholder={translate('admin.user-management.select-company.placeholder')}
        />;

        const pdfSource = selectedReportData == null ? null : `data:application/pdf;base64,${encodeURI(selectedReportData.data)}`;

        const isLoading = this.props.actionStatus === ActionStatus.START;
        return <div className='full-height'>
            <CoveringSpinner actionStatus={this.props.actionStatus} className='above-split-panel' />

            <ListContainer listItemsClasses="full-height col-xs-4 col-md-3 col-lg-3" 
                list={
                    <ListBodyContainer isLoading={isLoading} >
                        {//listItems && listItems.map(item => item.render({}, this.props.selectedReport === item.id))
                        }
                        {this.listSubHeader(translate('tracking-control.weekly-reports'))}
                        {reportType == TechnicianReportType.VA && weeklyVAReports.slice(0,1).map(item => this.listItem(item, entityFieldsData)) }
                        {reportType == TechnicianReportType.VC && weeklyVCReports.slice(0,1).map(item => this.listItem(item, entityFieldsData)) }
                        {this.listSubHeader(translate('tracking-control.monthly-reports'), selectField)}
                        {monthlyReports.map(item => this.listItem(item, entityFieldsData)) }
                    </ListBodyContainer>
                }

                detail={ 
                    <div className='content__container col-xs-8 col-md-9 col-lg-9 no-padding'>
                        <CoveringSpinner actionStatus={selectedReportDownloadStatus} />
                        { selectedReport && fileType == 'pdf' && !android &&
                            <object width="100%" height="100%" data={pdfSource} type="application/pdf" >
                                <embed src={pdfSource} type="application/pdf" />
                            </object>
                            //<iframe width='100%' height='100%' src={pdfSource}></iframe>
                        }
                        { selectedReport && fileType == 'pdf' && android &&
                            <EmptyView title={translate('tracking-control.download-report')}>
                                <Icon
                                    svg={SvgIcon.FileDownload}
                                    className='empty-view__icon'
                                    onClick={() => this.props.saveReport(selectedReport)}
                                />
                            </EmptyView>
                        }
                        { selectedReportData && selectedReportData.data && fileType != 'pdf' && //fileType == 'html' &&
                            <TractionControlReportClass2 htmlContent={ selectedReportData.data } status={ selectedReportDownloadStatus } />
                        }
                    </div> 
                } 
            />
        </div>;
    }

    public componentWillReceiveProps(props: TractionControlReportsProps) {
        const { reports, reportType } = props;
        const { reportsByMonthVA, reportsByMonthVC } = reports;
        const reportsByMonth = reportType === TechnicianReportType.VA ? reportsByMonthVA : reportsByMonthVC;
        const months = _.keys(reportsByMonth).reverse();

        /*
        if(props.selectedReport == null) {
            const { weeklyVAReports, weeklyVCReports } = reports;
            
            if(reportType === TechnicianReportType.VA && weeklyVAReports.length > 0) this.selectAndDownloadReport(weeklyVAReports[0]);
            else if(reportType === TechnicianReportType.VC && weeklyVCReports.length > 0) this.selectAndDownloadReport(weeklyVCReports[0]);

            const monthReports = reportsByMonth[this.props.selectedYearMonth] || [];
            if(monthReports && monthReports.length > 0) this.selectAndDownloadReport(monthReports[0]);
        }
        */

        if(props.selectedYearMonth == null || !_.includes(months, props.selectedYearMonth)) {
            const newValue = months.length <= 0 ? null : months[0];
            if(newValue != props.selectedYearMonth) this.setYearMonth(newValue);
        }
    }

    private setYearMonth = (yearMonth: string | string[]) => {
        const yearMonthValue = yearMonth instanceof Array ? null : yearMonth;
        this.props.selectTractionControlYearMonth(yearMonthValue);
    };

    public componentDidMount() {
        this.props.closeMenu();
        this.props.queryTractionControlReports();
    }    

    private selectAndDownloadReport(report: ITractionControlReport) {
        const { fileType } = report;
        this.props.selectTractionControlReport(report);
        if(isAndroid() && fileType.toLowerCase() === 'pdf') {
            this.props.saveReport(report);
        } else {
            this.props.getContentVersionData(report);
        }
    }

    private listItem(item: ITractionControlReport, entityFieldsData: EntityFieldsData) {
        return <ListItem item={item} isSelected={this.props.selectedReport && this.props.selectedReport.id === item.id} key={`${ item.id }`} 
            onClick={() => this.selectAndDownloadReport(item)} entityFieldsData={entityFieldsData}
        />
    }

    private listSubHeader(title: string, element?: JSX.Element) {
        return <div key={title}>
            <div className={cx('list-item subheader subheader--auto-height', 'container--horizontal')}>
                <div className='flex-grow--1'>{title}</div>
                {element}
            </div>
        </div>;
    }
}

function saveReport(report: { id: string, title: string, versionData: string, fileExtension: string }): ThunkAction<void> {
    const { title, versionData, fileExtension } = report;
    return async dispatch => {
        //const filename = createReportFilename(accountName, date) + ".html";
        const blob = await request<Blob>(versionData, "blob");
        dispatch(saveReportFile(title, fileExtension, blob));
    }
}

function saveReportFile(title: string, fileExtension: string, data: BlobPart): ThunkAction<void> {
    return dispatch => save(
        `${validFilename(title)}.${fileExtension}`, MimeType.pdf, data, 
        (key, error) => {
            console.log("ERROR: ", key, error)
            dispatch(showToastMessage(key))
        }
    )
}

/*
Here’s what agreed for the naming convention for monthly reports

Planner Group Monthly report : “TC#SalesOrganization#VA/VC#PlannerGroupName(SAP code)#Monthly_Report#Year_Month.pdf“
Technician Monthly report:     “TC#SalesOrganization#VA/VC#PlannerGroupName(SAP code)#Monthly_Report#Year_Month#Workcenter#TechnicianName.pdf“
*/
function filterReports<T extends ContentDocument>(reports: T[], salesorgCode: string, plannerGroup: string) {

    const reportWrappers = _.uniqBy(reports, r => r.Title).map(r => {
        const [name, extension] = r.Title.split('.');
        const nameParts = name.split(REPORT_NAME_DIVIDER);
        const salesOrganization = nameParts[1];
        const reportType = nameParts[2];
        const plannerGroupSAPCode = nameParts[3];
        const reportFrequency = nameParts[4];
        const yearMonth = nameParts[5];
        const workcenter = nameParts[6];
        const technicianName = nameParts[7];

        const title = workcenter == null ? 
            `${reportType} ${translate('tracking-control.planner-group')}: ${plannerGroupSAPCode}`: 
            `${reportType} ${translate('tracking-control.work-center')}: ${workcenter} - ${technicianName}`;

        const item = { id: r.Id, isHighPriority: false, title: title, body: () => "" }
        return {
            ...item, 
            versionData: r.LatestPublishedVersion.VersionData,
            fileExtension: r.LatestPublishedVersion.FileExtension,
            fileType: r.LatestPublishedVersion.FileType,
            salesOrganization, reportType, plannerGroupSAPCode, reportFrequency, yearMonth, workcenter, technicianName
        };
    }).filter(r => r.salesOrganization === salesorgCode && r.plannerGroupSAPCode === plannerGroup);

    const monthlyReports = reportWrappers.filter(r => r.reportFrequency === "Monthly_Report");
    const weeklyReports = reportWrappers.filter(r => r.reportFrequency == "Weekly_Report");
    const weeklyVAReports = weeklyReports.filter(r => r.reportType === TechnicianReportType.VA);
    const weeklyVCReports = weeklyReports.filter(r => r.reportType === TechnicianReportType.VC);
    const monthlyVAReports = monthlyReports.filter(r => r.reportType === TechnicianReportType.VA);
    const monthlyVCReports = monthlyReports.filter(r => r.reportType === TechnicianReportType.VC);
    const reportsByMonthVA = _.groupBy(monthlyVAReports, r => r.yearMonth);
    const reportsByMonthVC = _.groupBy(monthlyVCReports, r => r.yearMonth);
    return { weeklyVAReports, weeklyVCReports, reportsByMonthVA, reportsByMonthVC };
}

const TractionControlReportsStateProps = createSelector(
    (state: IGlobalState) => state.tractionControlReports,
    state => state.authentication.currentPlannerGroup,
    state => entityFieldsDataFromState(state),
    (tractionControlReports, plannerGroup, entityFieldsData) => {
        const { weeklyVAReports, weeklyVCReports, reportsByMonthVA, reportsByMonthVC } = 
            filterReports(tractionControlReports.reports, plannerGroup && plannerGroup.salesOrganization, plannerGroup && plannerGroup.branchCode);
        return { ...tractionControlReports, plannerGroup, 
            reports: { weeklyVAReports, weeklyVCReports, reportsByMonthVA, reportsByMonthVC }, entityFieldsData }
    }
)

export const TractionControlReports =  connect(
    TractionControlReportsStateProps,
    {
        queryTractionControlReports,
        selectTractionControlReport,
        selectTractionControlYearMonth,
        saveReport,
        saveReportFile,
        getContentVersionData,
        closeMenu
    },
)(TractionControlReportsClass);

export class TractionControlReportsVA extends React.Component {
    render() {
        return <TractionControlReports reportType={TechnicianReportType.VA}/>;
    }
}

export class TractionControlReportsVC extends React.Component {
    render() {
        return <TractionControlReports reportType={TechnicianReportType.VC}/>;
    }
}