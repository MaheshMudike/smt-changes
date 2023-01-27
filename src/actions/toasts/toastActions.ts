import { isLinkToast, Toast } from '../../models/toasts';
import { payloadAction } from '../actionUtils';
import { ThunkAction } from '../thunks';
import translate from 'src/utils/translate';

const DEFAULT_TOAST_DISPLAY_DURATION = 4000;

export const SHOW_TOAST = 'SHOW_TOAST';
export const HIDE_TOAST = 'HIDE_TOAST';

export const hideToast = payloadAction<Toast>(HIDE_TOAST);

const showAction = payloadAction<Toast>(SHOW_TOAST);

export function showToastMessage(translationKey: string): ThunkAction<void> {
    return dispatch => dispatch(showToast({ message: translate(translationKey) }));
}

export function showToast(toast: Toast): ThunkAction<void> {
    return dispatch => {
        dispatch(showAction(toast));
        if (!toast.requiresManualHiding) {
            const time = (isLinkToast(toast) ? 2 : 1) * DEFAULT_TOAST_DISPLAY_DURATION;
            setTimeout(() => dispatch(hideToast(toast)), time);
        }
    };
}