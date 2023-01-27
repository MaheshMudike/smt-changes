import { uniq } from 'lodash';
import { Dispatch } from 'redux';

//import UserInfo from '../../models/user/UserInfo';
import { AdminType } from '../../models/user/UserRole';
import { asyncActionNames, payloadAction } from '../actionUtils';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { User, UserBase } from '../../models/user/User';
import { ModalType } from '../../constants/modalTypes';
import { showModal } from '../modalActions';
import { update, insert } from '../http/jsforceCore';
import { querySMTUsers, smtUserInfoDefault, querySMTUserInfoForUser } from '../http/jsforce';
import ICompany from '../../models/ICompany';
import { userIdFromState, IAdminUserManagementFilters } from '../../models/globalState';
import { LOGIN_REQUEST } from '../authenticationActions';
import { replace } from 'react-router-redux';
import { paths } from '../../config/paths';
import { SObject } from '../http/jsforceMappings';
import { queryCompanySettings } from './adminSettingsActions';
import { ThunkAction } from '../thunks';

export const ADMIN_USER_MANAGEMENT_LOAD_ADMINS = asyncActionNames('ADMIN_USER_MANAGEMENT_LOAD_ADMINS');
export const ADMIN_USER_MANAGEMENT_LOAD_ADMINS_ONLY = asyncActionNames('ADMIN_USER_MANAGEMENT_LOAD_ADMINS_ONLY');
export const ADMIN_USER_MANAGEMENT_SET_FILTERS = 'ADMIN_USER_MANAGEMENT_SET_FILTERS';

function querySMTUserBase() {
    return querySMTUsers().then(users => users.map(c => new UserBase(c[0], c[1])));    
}

export function checkAdmin<T>(adminType: AdminType, salesorg?: string) {
    return (action: ThunkAction<void>): ThunkAction<void> => {
        return (dispatch, getState) => {
            const state = getState()
            return querySMTUserInfoForUser(userIdFromState(state)).then(info => {
                if(info.length > 0) {      
                    dispatch(payloadAction(LOGIN_REQUEST.success)(new User(state.authentication.currentUser.userValue, info[0])));
                    const isValidAdmin = 
                           info[0].Admin_Type__c === AdminType.Global 
                        || adminType === AdminType.Local && (info[0].Admin_Type__c === AdminType.Local && info[0].Admin_Sales_Organizations__c && info[0].Admin_Sales_Organizations__c.indexOf(salesorg) >= 0)
                    if(isValidAdmin) {
                        dispatch(action)
                    } else {
                        dispatch(replace(paths.OVERVIEW));
                    }
                }
            });
        }
    }
}

const checkGlobalAdmin = checkAdmin(AdminType.Global)

export function loadAdmins() {
    return checkGlobalAdmin(asyncHttpActionGeneric(querySMTUserBase, ADMIN_USER_MANAGEMENT_LOAD_ADMINS));
}

export function setAdminUserManagementFilter(filter: IAdminUserManagementFilters) {
    return (dispatch: Dispatch<any>) => dispatch({ payload: filter, type: ADMIN_USER_MANAGEMENT_SET_FILTERS });
}

export function deleteAdminUserAssignment(user: UserBase, company: ICompany) {        
    return checkGlobalAdmin(asyncHttpActionGeneric((state) => {
        const info = user.smtUserInfo;
        if(user.adminType === AdminType.Local) {
            const newCompanies = user.adminCompanies.filter(c => c.code != company.code);
            const uniqNewCompanies = uniq(newCompanies);
            info.Admin_Sales_Organizations__c = JSON.stringify(uniqNewCompanies);
            if(uniqNewCompanies.length <= 0) info.Admin_Type__c = AdminType.None;
        } else {
            info.Admin_Sales_Organizations__c = '[]';
            info.Admin_Type__c = AdminType.None;
        }       
        return update('SMT_User_Info__c', info).then(id => querySMTUserBase());
    }, ADMIN_USER_MANAGEMENT_LOAD_ADMINS_ONLY));
}

/*
//this is not needed anymore, just query configuration files to get all countries
function getCompanies() {
    return querySMTConfiguration().then(
        config => {
            if(config.length > 0) {
                try {                    
                    return JSON.parse(config[0].Sales_Organizations_For_Admin_Assignment__c) as ICompany[]
                } catch(error) {
                    console.log('Error casting sales orgs from global config: ', config[0]);
                }                
            }
            return [] as ICompany[];
        }
    );    
}
*/

export const LOAD_CREATE_ADMIN_ASSIGNMENT_DIALOG = asyncActionNames('LOAD_CREATE_ADMIN_ASSIGNMENT_DIALOG');
export const ADMIN_CREATE_ADMIN_ASSIGNMENT_SET_CURRENT = 'ADMIN_CREATE_ADMIN_ASSIGNMENT_SET_CURRENT';

export function setAdminUserManagementCurrent(filter: any) {
    return (dispatch: Dispatch<any>) => {
        dispatch({
            payload: filter,
            type: ADMIN_CREATE_ADMIN_ASSIGNMENT_SET_CURRENT,
        });
    };
}

export function showCreateAdminAssignmentDialog() {    
    return asyncHttpActionGeneric(
        state => Promise.all([queryCompanySettings(state),querySMTUserBase()]).then(companiesAndUsers => ({ companies: companiesAndUsers[0].map(c => ({ label: c.label, code: c.code } as ICompany)), users: companiesAndUsers[1] })),
        LOAD_CREATE_ADMIN_ASSIGNMENT_DIALOG,
        [(dispatch, result) => dispatch(showModal(ModalType.CreateAdminAssignmentDialog, result))]         
    );
}

export function assignAdminUser(user: UserBase, adminType: AdminType, company?: ICompany) {
    return checkGlobalAdmin(asyncHttpActionGeneric(state => {
        let info = user.smtUserInfo;
        if(info == null) info = smtUserInfoDefault(user.id);
        info.Admin_Type__c = adminType;
        if(adminType === AdminType.Local) {
            const newCompanies = user.adminCompanies;
            newCompanies.push(company);
            info.Admin_Sales_Organizations__c = JSON.stringify(uniq(newCompanies));        
        } else {
            info.Admin_Sales_Organizations__c = JSON.stringify([]);
        }
        const soql = info.Id == null ? insert(SObject.SMT_User_Info__c, info) : update('SMT_User_Info__c', info);
        return soql.then(() => querySMTUserBase())
    }, ADMIN_USER_MANAGEMENT_LOAD_ADMINS_ONLY));
}