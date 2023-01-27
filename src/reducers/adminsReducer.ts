import { combineReducers } from 'redux';
import { IPayloadAction } from '../actions/actionUtils';
import { ADMIN_SETTINGS_LOAD_COMPANY_SETTINGS } from '../actions/admin/adminSettingsActions';
import { ADMIN_USER_MANAGEMENT_LOAD_ADMINS, ADMIN_USER_MANAGEMENT_LOAD_ADMINS_ONLY, ADMIN_USER_MANAGEMENT_SET_FILTERS, LOAD_CREATE_ADMIN_ASSIGNMENT_DIALOG, ADMIN_CREATE_ADMIN_ASSIGNMENT_SET_CURRENT } from '../actions/admin/adminUserManagementActions';
import { IAdminUserManagementState, ICreateAdminAssignmentState, IAdminCompanySettingsState } from 'src/models/globalState';


const initialAdminUserManagementState: IAdminUserManagementState = {
    users: [],
    filters: {},
};

function adminUserManagementReducer(state = initialAdminUserManagementState, action: IPayloadAction<any>): IAdminUserManagementState {
    switch (action.type) {
        case ADMIN_USER_MANAGEMENT_LOAD_ADMINS.success:
            return { ...state, users: action.payload, filters: {} };
        case ADMIN_USER_MANAGEMENT_LOAD_ADMINS_ONLY.success:
            return { ...state, users: action.payload };
        case ADMIN_USER_MANAGEMENT_SET_FILTERS:
            return { ...state, filters: { ...state.filters, ...action.payload }}
                //clone(state, s => s.filters = _.assign({}, s.filters, action.payload));
        default:
            return state;
    }
}

const initialCreateAdminAssignmentState: ICreateAdminAssignmentState = {
    companies: [],
    current: {},
    users: [],
};

function createAdminAssignmentReducer(state = initialCreateAdminAssignmentState, action: IPayloadAction<any>): ICreateAdminAssignmentState {
    switch (action.type) {
        case LOAD_CREATE_ADMIN_ASSIGNMENT_DIALOG.success:
            return { ...action.payload, current: {} } // _.merge({}, action.payload, { current: {} });
        case ADMIN_CREATE_ADMIN_ASSIGNMENT_SET_CURRENT:
            return { ...state, current: { ...state.current, ...action.payload } }
                //clone(state, s => s.current = _.assign({}, s.current, action.payload));
        default:
            return state;
    }
}

const initialAdminSettingsState: IAdminCompanySettingsState = {
    companySettings: [],
};

function adminCompanySettingsReducer(state = initialAdminSettingsState,action: IPayloadAction<any>): IAdminCompanySettingsState {
    switch (action.type) {
        case ADMIN_SETTINGS_LOAD_COMPANY_SETTINGS.success:
            return {...state, companySettings: action.payload};
        default:
            return state;
    }
}

export default combineReducers({
    //common: adminCommonReducer,
    companySettingsState: adminCompanySettingsReducer,
    createAdminAssignmentState: createAdminAssignmentReducer,
    userManagementsState: adminUserManagementReducer,
});
