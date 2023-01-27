import { IPayloadAction } from '../../actions/actionUtils';
export function payloadValueReducerFactory<T>(actionName: string, initialState: T) {
    return (state = initialState, action: IPayloadAction<T>) => {
        return action.type === actionName ? action.payload : state;
    };
}