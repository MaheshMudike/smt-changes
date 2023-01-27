import * as React from 'react';

import { SvgIcon } from '../../../constants/SvgIcon';
import translate from '../../../utils/translate';
import ListRow from '../../forms/ListRow';
import IconButton from '../../layout/IconButton';
import { ActionStatus } from '../../../actions/actions';
import IReport from '../../../models/api/reportApi';
import { formatDateTime } from '../../../utils/formatUtils';

const getText = (text: string) => {
    return <div className='list-tile__secondary-content__text'>{text}</div>;
};

const reportStatusContent = (accountId: string, status: string, showReport: (accountId: string) => void) => {    
    switch (status) {
        case ActionStatus.FAILURE:
            return getText(translate('layout.report-item.status.error'));
        case ActionStatus.START:
            return getText(translate('layout.report-item.status.in-progress'));
        case ActionStatus.SUCCESS:
            return <IconButton
                label={translate('layout.report-item.button.view-report')}
                icon={SvgIcon.ButtonArrow}
                onClick={() => showReport(accountId)}
            />
        default:
            throw new Error(`Status ${ status } not handled correctly.`);
    }    

    //return null;
};

export default function ReportItem(props: { report: IReport; showReport: (accountId: string) => void; locale: string }) {
    let title: string;
    let subTitle: string;
    const report = props.report;

    if (report == null) {
        title = translate('layout.report-item.empty-title');
        subTitle = translate('layout.report-item.empty-subtitle');
    } else {
        title = report.accountName;
        subTitle = formatDateTime(report.createdDate, props.locale);
    }

    return (
        <ListRow title={title} subTitle={subTitle} svg={SvgIcon.File} hasBottomLine={false} 
            secondaryContent={reportStatusContent(report.accountId, report.status, props.showReport)}/>
    );
}