import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import { deleteAdminUserAssignment, loadAdmins, setAdminUserManagementFilter, showCreateAdminAssignmentDialog } from '../../actions/admin/adminUserManagementActions';

import { hideAllModals, showModal } from '../../actions/modalActions';
import { ModalType } from '../../constants/modalTypes';
import { SvgIcon } from '../../constants/SvgIcon';
import { AdminType } from '../../models/user/UserRole';
import translate from '../../utils/translate';
import { SelectField } from '../forms/SelectField';
//import { default as SelectOrFixedValue } from '../forms/SelectOrFixedValue';
import IconButton from '../layout/IconButton';
import { companyToOption, userRoleToOption, companyToString, userRoleToString } from './Formatters';
import { IGlobalState, IAdminUserManagementState, IAdminUserManagementFilters } from '../../models/globalState';

import { Icon } from '../layout/Icon';
import { IUserInfoAndCompany, UserBase } from '../../models/user/User';
import ICompany from '../../models/ICompany';
import { TableCompact } from '../table/TableCompact';
import { th } from '../table/Table';
import PanelPage from '../../containers/pages/PanelPage';
import { IUser } from 'src/models/api/userApi';
import { closeMenu } from 'src/containers/AppBase';
import { isAndroid } from 'src/utils/cordova-utils';

function renderDeleteButton(user: UserBase, company: ICompany, deleteCallback: (user: UserBase, company: ICompany) => void) {
    if(user.adminType == AdminType.None) return <div />;
    return (
        <div className='container--horizontal container--inversed'>
            <a onClick={() => deleteCallback(user, company)} className='clickable'>
                <Icon className='margin-left--smaller' svg={SvgIcon.DeleteBarCopy} />
            </a>
        </div>
    );
}

class AdminUserManagementClass extends React.Component<IAdminUserManagementDispatchProps & IAdminUserManagementState, {}> {
    
    public render() {
        const tableHeaders = [
            th(2, 'username'), th(3, 'fullName'), th(3, 'company'), th(2, 'admin-type'), th(2, '')
        ];
        return <PanelPage>
                    <div className='blue-header blue-header--small padding-horizontal--std'>
                        {translate('admin.user-management.administrators')}
                    </div>
                    <div className='row padding-horizontal--std'>
                        <div className='col-xs-3'>
                            <div className='separated--bottom-dark'>
                                <input type='text'
                                    onChange={this.setUsernameFilter}
                                    value={this.props.filters.username}
                                    placeholder={translate('admin.user-management.username.placeholder')} />
                            </div>
                        </div>
                        <div className='col-xs-3'>
                            <SelectField options={[...this.companies]}//, { code: null, label: translate('admin.user-management.select-company.placeholder') }]} 
                                value={this.props.filters.company}
                                className='separated--bottom-dark'
                                clearable={true}
                                isLoading={false}
                                optionsMapper={companyToOption}
                                onChange={this.setFilterCompany}
                                placeholder={translate('admin.user-management.select-company.placeholder')} />
                        </div>
                        <div className='col-xs-3'>
                            <SelectField
                                options={[AdminType.Global, AdminType.Local]}//, translate("admin.user-management.admin-type.placeholder")]} 
                                value={this.props.filters.adminType}
                                className='separated--bottom-dark'
                                clearable={true}
                                isLoading={false}
                                optionsMapper={userRoleToOption}
                                onChange={this.setFilterAdminType}
                                placeholder={translate('admin.user-management.admin-type.placeholder')} />
                        </div>
                        <div className='col-xs-3 container--horizontal container--inversed'>
                            <IconButton icon={SvgIcon.AddCricle} onClick={this.addCompany} />
                        </div>
                    </div>
                    <div className='padding-top--large flex--1 relative'>
                        <div className='cover-all scrollable'>
                            <TableCompact fixedHeader={false} noEntriesLabel="admin.user-management.table.no-entries" emptyColumnLabel="admin.user-management.table.empty-column" thPrefix="admin.user-management.table" ths={[
                                th(2, 'username'), th(3, 'fullName'), th(3, 'company'), th(2, 'admin-type'), th(2, '')
                            ]} rows={this.filteredUsers} row={r => [
                                r[0].userName, r[0].fullName, companyToString(r[1]), userRoleToString(r[0].adminType), renderDeleteButton(r[0], r[1], this.deleteUser)                                
                            ]} />
                        </div>
                    </div>
                </PanelPage>
        ;
    }

    public componentDidMount() {
        if(isAndroid()) FirebasePlugin.setScreenName('Admin User Management Screen');
        this.props.closeMenu();
        this.props.loadAdmins();
    }

    private deleteUser = (user: UserBase, company: ICompany) => {
        this.props.showModal(ModalType.ConfirmModal, {
            action: () => {
                this.props.deleteAdminUserAssignment(user, company);
                this.props.hideAllModals();
            },
            labelKeyPrefix: 'admin.user-management.confirm-remove',
        });
    };

    private setUsernameFilter = (event: React.FormEvent<any>) => {
        const newValue = _.get(event.target, 'value') as string;
        this.props.setAdminUserManagementFilter({ username: newValue });
    };

    private setFilterCompany = (company: ICompany | ICompany[]) => {
        const companyValue = company instanceof Array ? null : company;
        this.props.setAdminUserManagementFilter({ company: companyValue });
    };

    private setFilterAdminType = (adminType: AdminType | AdminType[]) => {
        const adminTypeValue = adminType instanceof Array ? null : adminType;
        this.props.setAdminUserManagementFilter({ adminType: adminTypeValue });
    };

    private addCompany = () => {
        this.props.showCreateAdminAssignmentDialog();
    };

    private get companies() {
        return _(this.props.users).map(t => t.adminCompanies || []).flatten().uniqBy('code').value() as ICompany[];
    };

    
    private filter = (uac: IUserInfoAndCompany) => {
        const filterState = this.props.filters;

        const company = uac[1];
        const companyMatch = filterState.company == null || filterState.company.code == null || company != null && company.code === filterState.company.code;
        
        const loginMatch = filterState.username == null || uac[0].userName.toLowerCase().indexOf(filterState.username.toLowerCase()) === 0;
        const adminTypeMatch = filterState.adminType == null || uac[0].adminType === filterState.adminType;
        return companyMatch && loginMatch && adminTypeMatch;
    };

    toFlatAdmin = (user: UserBase): IUserInfoAndCompany[] => {
        if(user.adminCompanies == null || user.adminCompanies.length <= 0) return [[user, null]]
        return user.adminCompanies.map(c => [user, c] as [UserBase, ICompany]);
    }

    private get filteredUsers(): IUserInfoAndCompany[] {
        const flatUsers = _(this.props.users).map(this.toFlatAdmin).flatten().value();
        return _(flatUsers).filter(this.filter).value();
    };

}

interface IAdminUserManagementDispatchProps {
    showModal: typeof showModal;
    loadAdmins: () => void;
    hideAllModals: typeof hideAllModals;
    showCreateAdminAssignmentDialog: () => Promise<{ companies: ICompany[]; users: UserBase<IUser>[]; }>;
    deleteAdminUserAssignment: (user: UserBase, company: ICompany) => void;
    setAdminUserManagementFilter: (filter: IAdminUserManagementFilters) => { payload: IAdminUserManagementFilters; type: string; };
    closeMenu: typeof closeMenu;
}

const AdminUserManagementDispatchProps = {
    loadAdmins,
    hideAllModals,
    setAdminUserManagementFilter,
    showModal,
    showCreateAdminAssignmentDialog,
    deleteAdminUserAssignment,
    closeMenu,
}

export const AdminUserManagement = connect(
    (state: IGlobalState) => (state.admin.userManagementsState),
    AdminUserManagementDispatchProps,
)(AdminUserManagementClass);
