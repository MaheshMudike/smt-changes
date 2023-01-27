import * as cx from 'classnames';
import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { finishSynchronisation, syncOfflineChanges } from '../../actions/offlineChangesActions';
import { SvgIcon } from '../../constants/SvgIcon';
import { IGlobalState } from '../../models/globalState';
import { IOfflineChangeJob, JobStatus } from '../../models/offlineChanges/IOfflineChanges';
import translate from '../../utils/translate';
import { Icon } from '../layout/Icon';
import { FlatButton } from '../panels/FlatButton';
import { ForegroundPanel } from '../panels/ForegroundPanel';

class SynchronisationSummaryDialogClass extends React.Component<ISynchronisationSummaryDialogProps, {}> {
    public render() {
        return (
            <ForegroundPanel title={translate('synchronisation.summary-modal.title')} buttons={[
                <FlatButton onClick={this.continue} caption={translate('generic.button.continue')} disabled={!this.props.canContinue} />
            ]} noPadding>
                <ul className='sync-items-panel'>
                    {this.props.jobs.map((job, index) => (
                        <li className='block--smaller container--horizontal without-overflow padding-right--large' key={index}>
                            <div className='padding-vertical--large text-ellipsis flex-grow--1'>
                                {job.displayName}
                            </div>
                            <Icon svg={this.getSvgIcon(job.status)} className={cx({ spin: job.status === JobStatus.Pending })} />
                        </li>
                    ))}
                </ul>
            </ForegroundPanel>
        );
    }

    public componentDidMount() {
        this.props.syncOfflineChanges();
    }

    private continue = () => {
        if (!this.props.canContinue) {
            return;
        }
        this.props.finishSynchronisation();
    }

    private getSvgIcon(status: JobStatus) {
        switch (status) {
            case JobStatus.Pending:
                return SvgIcon.Sync;
            case JobStatus.Success:
                return SvgIcon.Success;
            case JobStatus.Failure:
                return SvgIcon.FailureRed;
            default:
                throw new Error('Unhandled job status: ' + status);
        }
    }
}

interface ISynchronisationSummaryDialogProps {
    canContinue: boolean;
    jobs: IOfflineChangeJob[];
    syncOfflineChanges: typeof syncOfflineChanges;
    finishSynchronisation: typeof finishSynchronisation;
}

export const SynchronisationSummaryDialog = connect(
    (state: IGlobalState) => {
        const jobs = state.offlineChanges.jobs;
        return {
            canContinue: _.every(jobs, j => j.status !== JobStatus.Pending),
            jobs,
        };
    },
    {
        syncOfflineChanges,
        finishSynchronisation,
    },
)(SynchronisationSummaryDialogClass);
