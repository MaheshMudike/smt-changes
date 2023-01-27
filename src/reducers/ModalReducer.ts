import * as _ from 'lodash';

import { IPayloadAction } from '../actions/actionUtils';
import { PREV_MODAL, SHOW_MODAL, HIDE_MODAL_TYPE, HIDE_ALL_MODALS } from '../actions/modalActions';
import { IModalDefinition } from '../models/modals/state';
import clone from '../utils/clone';

export default function modal(state: IModalDefinition<any>[] = [], action: IPayloadAction<any>) {
    switch (action.type) {
        case SHOW_MODAL:
            action.payload.key = _.uniqueId('modal_');
            return state.concat(action.payload);
        case PREV_MODAL:
            if (state.length === 0) {
                return state;
            }

            const newState = state.slice(0, state.length - 1);

            if (action.payload && newState.length > 0) {
                const last = _.last(newState);
                const newModalProps = _.merge(last.modalProps, action.payload);
                newState[newState.length - 1] = clone(last, s => s.modalProps = newModalProps);
            }

            return newState;

        case HIDE_ALL_MODALS:
            return [];
        
        case HIDE_MODAL_TYPE:
            return state.filter(d => d.modalType !== action.payload.modalType);
                    
        default:
            return state;
    }
}
