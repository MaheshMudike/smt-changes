import { payloadAction } from "../actionUtils";

export const CHANGE_REPAIR_GROUPING = 'CHANGE_REPAIR_GROUPING';
export const CHANGE_REPAIR_FILTER = 'CHANGE_REPAIR_FILTER';

export const changeRepairsGrouping = payloadAction(CHANGE_REPAIR_GROUPING);
export const changeRepairsFilter = payloadAction(CHANGE_REPAIR_FILTER);