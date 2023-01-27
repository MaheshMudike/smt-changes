import { IPayloadAction } from '../actions/actionUtils';

import { IDragging } from '../models/dragging';
import { DND_SET_DROP_DATA, DND_DRAGGING } from '../components/list/Dragging';

export const initialState = {
    dragging: null as IDragging,
    dropData: null as any,
};

export type IDragAndDropState = typeof initialState;

export function dragAndDropReducer(state = initialState, action: IPayloadAction<any>) {
    switch (action.type) {
        case DND_SET_DROP_DATA:
            return {
                dragging: null,
                dropData: action.payload,
            };
        case DND_DRAGGING:
            return { ...state, dragging: action.payload };
        default:
            return state;
    }
}
