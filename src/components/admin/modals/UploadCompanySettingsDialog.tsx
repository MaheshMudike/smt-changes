import * as cx from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';

import { uploadAndReloadCompanySettings } from '../../../actions/admin/adminSettingsActions';
import { showToast } from '../../../actions/toasts/toastActions';
import { SvgIcon } from '../../../constants/SvgIcon';
import { toastMessages } from '../../../constants/toastMessages';
import translate from '../../../utils/translate';
import { IFile } from '../../FileLoader';
import { Icon } from '../../layout/Icon';
import { DialogContainer } from '../../modals/layout/DialogContainer';
import { DialogContent, DialogContentPadding } from '../../modals/layout/DialogContent';
import { DialogHeader } from '../../modals/layout/DialogHeader';
import { UploadBox } from '../../UploadBox';
import { companyToString } from '../Formatters';
import { CompanySettings } from '../../../models/admin/CompanySettings';
import { IModalDefinition } from 'src/models/modals/state';
import { hideAllModals } from 'src/actions/modalActions';

interface IUploadCompanySettingsDialogDispatchProps {
    uploadAndReloadCompanySettings: typeof uploadAndReloadCompanySettings;
    showToast: typeof showToast;
    hideAllModals: typeof hideAllModals;
}

class UploadCompanySettingsDialogClass extends React.Component<IModalDefinition<CompanySettings> & IUploadCompanySettingsDialogDispatchProps, IFile> {
    public render() {
        return (
            <DialogContainer>
                <DialogHeader
                    title={`${ translate('admin.upload-settings.title') }: ${ companyToString(this.props.modalProps) }`}
                    headerActionButtons={[
                        <Icon className={cx('clickable', { disabled: !this.state })}
                            svg={SvgIcon.Done} disabled={!this.state}
                            onClick={() => this.uploadSettings()} />,
                    ]}
                />
                <DialogContent padding={DialogContentPadding.None}>
                    <div className='padding--std'>
                        {/* .json only didn't work in android anymore */}
                        <UploadBox onLoad={(f: IFile) => this.setState(f)} accept='.json,application/json' />
                    </div>
                </DialogContent>
            </DialogContainer>
        );
    }

    private uploadSettings = () => {
        try {
            const companySettings = atob(this.state.base64Content);
            this.props.uploadAndReloadCompanySettings(this.props.modalProps.id, companySettings, this.props.modalProps.code);
            this.props.hideAllModals();
        } catch (e) {
            this.props.showToast({
                message: toastMessages().INVALID_COMPANY_SETTINGS,
            });
        }
    };
}

export const UploadCompanySettingsDialog = connect(
    null,
    {
        uploadAndReloadCompanySettings,
        showToast,
        hideAllModals
    },
)(UploadCompanySettingsDialogClass);
