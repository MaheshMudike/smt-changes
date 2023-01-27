import { IGlobalState } from '../../models/globalState';

export const readEventSelector = (state: IGlobalState) => ({ userId: state.authentication.currentUser.id });
