import * as React from 'react';
import { connect } from 'react-redux';

import { SvgIcon } from '../../../constants/SvgIcon';
import ICompany from '../../../models/ICompany';

import { AdminType } from '../../../models/user/UserRole';
import translate from '../../../utils/translate';
import { SelectField } from '../../forms/SelectField';
import WithIcon from '../../forms/WithIcon';
import { DialogHeaderTextButton } from '../../layout/DialogHeaderTextButton';
import { DialogContainer } from '../../modals/layout/DialogContainer';
import { DialogContent } from '../../modals/layout/DialogContent';
import { DialogHeader } from '../../modals/layout/DialogHeader';
import { companyToOption, userRoleToOption, userToOption } from '../Formatters';
import { IGlobalState, ICreateAdminAssignmentState } from '../../../models/globalState';
import { setAdminUserManagementCurrent, assignAdminUser } from '../../../actions/admin/adminUserManagementActions';

import { UserBase } from '../../../models/user/User';
import { IModalDefinition } from 'src/models/modals/state';
import { hideAllModals } from 'src/actions/modalActions';

export class CreateAdminAssignmentDialogClass extends React.Component<ICreateAdminAssignmentDialogProps, object> {

    constructor(props: ICreateAdminAssignmentDialogProps) {
        super(props);
    }

    public render() {
        let adminType = this.props.modalProps.current.adminType;
        if(adminType == AdminType.None) adminType = AdminType.Local;
        return (
            <DialogContainer>
                <DialogHeader title={translate('admin.create-admin-assignment.title')} headerActionButtons={[ 
                    <DialogHeaderTextButton onClick={this.assignAdmin} disabled={false} label={translate('admin.create-admin-assignment.create-button')} />,
                    ]}
                />
                <DialogContent>
                    <WithIcon icon={SvgIcon.Contacts} className='separated'>
                        <SelectField disabled={false} value={this.props.modalProps.current.user}
                            onChange={this.setUser} options={this.users}
                            optionsMapper={userToOption} isLoading={false}
                            placeholder={translate('admin.create-admin-assignment.user.placeholder')}
                        />
                    </WithIcon>
                    <WithIcon icon={SvgIcon.StartDate} className='separated'>
                        <SelectField options={[AdminType.Local, AdminType.Global]} value={adminType}
                            disabled={this.isAdminTypeDropdownDisabled()} isLoading={false} optionsMapper={userRoleToOption}
                            onChange={this.setAdminType} placeholder={translate('admin.create-admin-assignment.admin-type.placeholder')} />
                    </WithIcon>
                    <WithIcon icon={SvgIcon.Account}>
                        <SelectField options={this.companies} value={this.props.modalProps.current.company}
                            isLoading={false} disabled={this.isCompanyDropdownDisabled()}
                            optionsMapper={companyToOption} onChange={this.setCompany}
                            placeholder={translate('admin.create-admin-assignment.company.placeholder')} />
                    </WithIcon>
                </DialogContent>
            </DialogContainer>
        );
    }

    private get users() {        
       return this.props.modalProps.users.filter(user => user.adminType != AdminType.Global);
    }

    private get companies() {
        const allCompanies = this.props.modalProps.companies;
        if(this.props.modalProps.current.user == null) return allCompanies;

        const userCompanies = this.props.modalProps.current.user.adminCompanies;
        return allCompanies.filter(c => !userCompanies.some(userC => userC.code === c.code));
    }

    private isAdminTypeDropdownDisabled = () => {
        return false;
        //return !this.props.modalProps.current.user || !!this.userInfoForUser(this.props.modalProps.current.user);
    };

    private isCompanyDropdownDisabled = () => {
        return this.props.modalProps.current.adminType === AdminType.Global || !this.props.modalProps.current.user;
    };

    private setUser = (user: UserBase) => {
        var adminType = user && user.adminType;
        if(adminType == AdminType.None) adminType = AdminType.Local;
        this.props.setAdminUserManagementCurrent({ user, adminType });
    };

    private setAdminType = (adminType: AdminType) => {
        const adminInfo = adminType === AdminType.Global ?
            { adminType, company: null as any } :
            { adminType };
        this.props.setAdminUserManagementCurrent(adminInfo);
    };

    private setCompany = (company: ICompany) => {
        this.props.setAdminUserManagementCurrent({ company });
    };

    private assignAdmin = () => {
        const { user, adminType, company } = this.props.modalProps.current;
        this.props.assignAdminUser(user, adminType, company);
        this.props.hideAllModals();
    };
}

interface ICreateAdminAssignmentDialogProps extends IModalDefinition<ICreateAdminAssignmentExtendedState> {
    setAdminUserManagementCurrent: typeof setAdminUserManagementCurrent;
    assignAdminUser: typeof assignAdminUser;
    hideAllModals: typeof hideAllModals;
}

interface ICreateAdminAssignmentExtendedState extends ICreateAdminAssignmentState {
    users: UserBase[];
}

export const CreateAdminAssignmentDialog = connect(
    (state: IGlobalState) => ({
        modalProps: {
            ...state.admin.createAdminAssignmentState,
            users: state.admin.userManagementsState.users,
        },
    }),
    {
        setAdminUserManagementCurrent,
        assignAdminUser,
        hideAllModals
    },
)(CreateAdminAssignmentDialogClass);
