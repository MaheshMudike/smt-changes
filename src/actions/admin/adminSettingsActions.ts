import { toastMessages } from '../../constants/toastMessages';
import { asyncActionNames } from '../actionUtils';
import { asyncHttpActionGeneric } from '../http/httpActions';
import { querySalesOrganizationConfigurationBase } from '../http/jsforceBase';
import { conditions, SObject } from '../http/jsforceMappings';
import { update } from '../http/jsforceCore';
import { CompanySettings } from '../../models/admin/CompanySettings';
import { IGlobalState } from '../../models/globalState';
import { AdminType } from '../../models/user/UserRole';
import { checkAdmin } from './adminUserManagementActions';
import * as Ajv from 'ajv';
import { schema } from '../../models/configurationSchema';
import { showToast, showToastMessage } from '../toasts/toastActions';
import { save } from 'src/utils/fileUtils';


function companyCodesConditionsFromState(state: IGlobalState) {
    const user = state.authentication.currentUser;
    return state.authentication.currentUser.adminCompanies.map(c => c.code);
}

export function queryCompanySettings(state: IGlobalState) {
    const user = state.authentication.currentUser;
    const localQueryOption = conditions.SMT_Sales_Organization_Configuration__c.salesorgCodes(companyCodesConditionsFromState(state));
    return querySalesOrganizationConfigurationBase(user.adminType === AdminType.Global ? [] : [localQueryOption]).then(
        confs => confs.map(c => new CompanySettings(c))
    );
}

export const ADMIN_SETTINGS_LOAD_COMPANY_SETTINGS = asyncActionNames('ADMIN_SETTINGS_LOAD_COMPANY_SETTINGS');
export const ADMIN_SETTINGS_DOWNLOAD_SETTINGS = asyncActionNames('ADMIN_SETTINGS_DOWNLOAD_SETTINGS');

export function loadCompanySettings() {
    return asyncHttpActionGeneric(state => queryCompanySettings(state), ADMIN_SETTINGS_LOAD_COMPANY_SETTINGS);
}

export function downloadCompanySettings(id: string, salesorg: string, fileName: string) {
    return checkAdmin(AdminType.Local, salesorg)(
        (dispatch) => dispatch(
            asyncHttpActionGeneric(() => 
                querySalesOrganizationConfigurationBase([conditions.SObject.id(id)], ['Configuration_JSON__c'])
                .then(response => {
                    save(
                        fileName, 'text/json', response[0]['Configuration_JSON__c'], 
                        (key, error) => {
                            dispatch(showToastMessage(key));
                        }
                    );
                    return response;
                })
                , ADMIN_SETTINGS_DOWNLOAD_SETTINGS
            )
        )
    );
}

export function uploadAndReloadCompanySettings(id: string, companySettings: string, salesorg: string) {
    return checkAdmin(AdminType.Local, salesorg)(
        (dispatch, getState) => {
            var ajv = new Ajv({ allErrors: true });
            ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
            var validate = ajv.compile(schema);
            var valid = validate(JSON.parse(companySettings));
            if (!valid) {
                const errorMessage = "ERROR: " + validate.errors.map(error => error.dataPath + ' ' + error.message + ' ' + JSON.stringify(error.params)).join(', ');
                dispatch(showToast({ message: toastMessages().INVALID_COMPANY_SETTINGS }));
            } else {
                dispatch(asyncHttpActionGeneric(state => update(SObject.SMT_Sales_Organization_Configuration__c, { Id: id, Configuration_JSON__c: companySettings })
                .then(id => queryCompanySettings(state)), ADMIN_SETTINGS_LOAD_COMPANY_SETTINGS, [], { onFail: toastMessages().INVALID_COMPANY_SETTINGS }))
            }
    });
}
