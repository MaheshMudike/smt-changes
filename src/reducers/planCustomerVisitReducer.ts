import * as _ from 'lodash';

import { IPayloadAction } from '../actions/actionUtils';
import { PLAN_CUSTOMER_VISIT_CHANGE_VALUE, PLAN_CUSTOMER_VISIT_INITIALIZE, 
    PLAN_CUSTOMER_VISIT_SELECT_CONTACTS, PLAN_CUSTOMER_VISIT_SET_RELATED_TO as PLAN_CUSTOMER_VISIT_SET_RELATED_TO, PLAN_CUSTOMER_VISIT_SET_EQ_ACCOUNTS, PLAN_CUSTOMER_VISIT_SET_SOURCE_ENTITY,
} from '../actions/planCustomerVisitActions';

import { IPlanCustomerVisitState, IAccountWithType } from '../models/plan/IPlanCustomerVisitState';

const initialPlanCustomerVisitState: IPlanCustomerVisitState = {
    form: {},
    relatedAccounts: []
};

export function planCustomerVisitReducer(state: IPlanCustomerVisitState = initialPlanCustomerVisitState, action: IPayloadAction<any>) {
    switch (action.type) {
        case PLAN_CUSTOMER_VISIT_CHANGE_VALUE:
            return { ...state, form: { ...state.form, ...action.payload } }
        case PLAN_CUSTOMER_VISIT_INITIALIZE:
            return { ...state, sourceEntity: action.payload[0], form: action.payload[1] }
        case PLAN_CUSTOMER_VISIT_SET_SOURCE_ENTITY:
            return { ...state, sourceEntity: action.payload }
        case PLAN_CUSTOMER_VISIT_SELECT_CONTACTS:
            return { ...state, form: { ...state.form, participants: action.payload} }
        case PLAN_CUSTOMER_VISIT_SET_EQ_ACCOUNTS:
            const payload: IAccountWithType[] = action.payload;
            return { ...state, relatedAccounts: payload };
        case PLAN_CUSTOMER_VISIT_SET_RELATED_TO:
            const account = action.payload;
            //const relatedAccounts = account == null ? [] : [account];
            return { ...state, //relatedAccounts, 
                form: { ...state.form, 
                    participants: state.form && state.form.participants && state.form.participants.filter(c => account == null || account.id === c.accountId), 
                    relatedTo: account
                } 
            }
        default:
            return state;
    }
}
