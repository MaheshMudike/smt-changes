import { Dispatch } from 'redux';
import { ModalType } from '../constants/modalTypes';
import { emptyAction, IPayloadAction, payloadAction } from './actionUtils';
import { isIncompleteModalShown } from '../services/modals/isModalTypeShown';
import { ThunkAction } from './thunks';

export const SHOW_MODAL = 'SHOW_MODAL';
export const HIDE_MODAL_TYPE = 'HIDE_MODAL_TYPE';
export const HIDE_ALL_MODALS = 'HIDE_ALL_MODALS';
export const PREV_MODAL = 'PREV_MODAL';

export interface IShowModalPayload {
    modalType: ModalType;
    modalProps?: any;
}

export function hideAllModals() {
    return emptyAction(HIDE_ALL_MODALS);
    //return modalType == null ? emptyAction(HIDE_MODAL) : payloadAction(HIDE_MODAL)({ modalType });
}

export function hideModalType(modalType: ModalType) {
    return payloadAction(HIDE_MODAL_TYPE)({ modalType });
}

export function showModal(modalType: ModalType, modalProps?: any) {
    return payloadAction(SHOW_MODAL)({ modalType, modalProps });
}

export function replaceModal(modalType: ModalType, modalProps?: any) {
    return (dispatch: Dispatch<any>) => {
        dispatch(goToPrevModal());
        dispatch(showModal(modalType, modalProps));
    };
}

export function replaceModalIfIncomplete(modalType: ModalType, modalProps?: any): ThunkAction<void> {
    return (dispatch, state) => {
        if(isIncompleteModalShown(state)) {
            dispatch(goToPrevModal());
            dispatch(showModal(modalType, modalProps));
        }
    };
}

export function goToPrevModal<T>(
    modalProps?: T
): IPayloadAction<T> {
    return {
        payload: modalProps,
        type: PREV_MODAL,
    };
}
