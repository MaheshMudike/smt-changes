import { combineReducers } from 'redux';

import { IPayloadAction } from '../../actions/actionUtils';
import { INIT_WRITE_TASK_FORM, LOAD_USERS_FOR_TASK, SET_SEARCH_USERS_PHRASE } from '../../actions/integration/tasks/writeTaskFormActions';
import { initialWriteTaskState, SearchUsersState } from '../../models/tasks/writeTaskState';
import { composeReducers } from '../../utils/composeReducers';
import { asyncListReducerFactory } from '../factories/asyncActionReducerFactory';
import { payloadValueReducerFactory } from '../factories/payloadValueReducerFactory';

const initialSearchState = initialWriteTaskState.searchUsers;
const usersReducer = asyncListReducerFactory(LOAD_USERS_FOR_TASK);
const searchPhraseReducer = payloadValueReducerFactory(SET_SEARCH_USERS_PHRASE, initialSearchState.searchPhrase);

function resetReducer(state: SearchUsersState, action: IPayloadAction<void>) {
    if (action.type === INIT_WRITE_TASK_FORM) {
        return initialSearchState;
    }
    return state;
}

export const searchUsersReducer = composeReducers(
    initialSearchState,
    combineReducers<SearchUsersState>({
        searchPhrase: searchPhraseReducer,
        users: usersReducer,
    }),
    resetReducer,
);
