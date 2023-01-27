import { IPayloadAction } from '../actions/actionUtils';
import { LOGIN_REQUEST, SET_PLANNER_GROUP, isRtlLanguage } from '../actions/authenticationActions';
import { TextDirection } from '../models/authentication';
import { User } from '../models/user/User';
import { IUserBranch } from 'src/models/user/IUserBranch';

const initialState = {
    currentPlannerGroup: null as IUserBranch,
    currentUser: null as User,
    error: null as any,
    isLoggedIn: false,
    isProcessing: false,
    direction: TextDirection.ltr
};

export type IAuthenticationState = typeof initialState;

export const SWITCH_DIRECTION = "SWITCH_DIRECTION";

export default function reducer(state = initialState, action: IPayloadAction<any>): IAuthenticationState {
    switch (action.type) {
        case LOGIN_REQUEST.start:
            return { ...state, isProcessing: true };
        case LOGIN_REQUEST.success:
            const currentUser = action.payload as User;
            const isRtl = isRtlLanguage(currentUser.languageLocale);
            return { ...state, currentUser, direction: isRtl ? TextDirection.rtl : TextDirection.ltr };
        case LOGIN_REQUEST.failure:
            return { ...state, error: action.payload, isProcessing: false };
        case SET_PLANNER_GROUP:
            return { ...state, currentPlannerGroup: action.payload, isProcessing: false, };
        case SWITCH_DIRECTION:
            return { ...state, direction: state.direction === TextDirection.rtl ? TextDirection.ltr : TextDirection.rtl }
        default:
            return state;
    }
}
