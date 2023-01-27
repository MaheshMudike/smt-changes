import * as React from 'react';
import { connect } from 'react-redux';

import { downloadCompanySettings, loadCompanySettings } from '../../actions/admin/adminSettingsActions';
import { showModal } from '../../actions/modalActions';
import { ModalType } from '../../constants/modalTypes';
import { CompanySettings } from '../../models/admin/CompanySettings';
import translate from '../../utils/translate';
import { IGlobalState, localeFromState } from '../../models/globalState';
import { companyToString } from './Formatters';
import { formatDateTime } from '../../utils/formatUtils';
import * as Dropdown from 'react-bootstrap/lib/Dropdown'
import * as MenuItem from 'react-bootstrap/lib/MenuItem'
import { Icon } from '../layout/Icon';
import { SvgIcon } from '../../constants/SvgIcon';
import { TableCompact } from '../table/TableCompact';
import { th } from '../table/Table';
import PanelPage from '../../containers/pages/PanelPage';
import { TextDirection } from 'src/models/authentication';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

function renderDropdown(companySettings: CompanySettings, downloadCompanySettings: (ics: CompanySettings) => void, 
    uploadCompanySettings: (ics: CompanySettings) => void, direction: TextDirection) {
    return (
        <div className='container--horizontal container--inversed covering-dropdown'>
            <Dropdown id='admin-settings-table-dropdown' pullRight={direction === TextDirection.ltr}>
                <Dropdown.Toggle noCaret>
                    <Icon svg={SvgIcon.More} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <MenuItem onClick={() => downloadCompanySettings(companySettings)}>
                        {translate('admin.company-settings.table.download')}
                    </MenuItem>
                    <MenuItem onClick={() => uploadCompanySettings(companySettings)}>
                        {translate('admin.company-settings.table.upload')}
                    </MenuItem>
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

class AdminSettingsClass extends React.Component<ReturnType<typeof AdminUserManagementState> & typeof AdminUserManagementDispatchProps, {}> {
    public render() {
        const { locale, direction, companySettings } = this.props;
        return (
            <PanelPage>
                <div className='blue-header blue-header--small padding-horizontal--std'>
                    {translate('admin.company-settings.company-settings')}
                </div>
                <div className='padding-top--large flex--1 relative'>
                    <div className='cover-all scrollable full-height'>
                        <TableCompact noEntriesLabel="admin.company-settings.table.no-entries" className='data-table--scrollable' 
                            thPrefix="admin.company-settings.table" 
                            ths={[ th(5, 'company'), th(3, 'modifiedBy'), th(3, 'last-modification'), th(2, '') ]} 
                            rows={companySettings} 
                            row={r => [
                                companyToString(r), r.modifiedBy, formatDateTime(r.lastModification, locale), 
                                renderDropdown(r, this.downloadSettings, this.uploadSettings, direction)
                            ]} 
                        />
                    </div>
                </div>
            </PanelPage>
        );
    }

    public componentDidMount() {
        if(isAndroid()) FirebasePlugin.setScreenName('Admin settings Screen');
        this.props.closeMenu();
        this.props.loadCompanySettings();
    }

    private downloadSettings = (s: CompanySettings) => {
        this.props.downloadCompanySettings(s.id, s.code, `${ s.code }.json`);
    };

    private uploadSettings = (s: CompanySettings) => {
        this.props.showModal(ModalType.UploadCompanySettings, s);
    };
}

const AdminUserManagementState = (state: IGlobalState) => (
    { ...state.admin.companySettingsState, direction: state.authentication.direction, locale: localeFromState(state) })

const AdminUserManagementDispatchProps = {
    loadCompanySettings,
    downloadCompanySettings,
    showModal,
    closeMenu,
}

export const AdminSettings = connect(AdminUserManagementState, AdminUserManagementDispatchProps)(AdminSettingsClass);
