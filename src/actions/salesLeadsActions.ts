import { downloadOpportunities, downloadOpportunitiesOwned, downloadOpportunitiesCustomers } from "./integration/opportunitiesActions";
import { ThunkAction } from "./thunks";
import { queryLeads, queryLeadsOwned, queryLeadsCustomers } from "./integration/leadActions";

export const SELECT_SALES_LEAD = 'SELECT_SALES_LEAD';
export const SELECT_SALES_LEAD_OWNED = 'SELECT_SALES_LEAD_OWNED';
export const SELECT_SALES_LEAD_CUSTOMERS = 'SELECT_SALES_LEAD_CUSTOMERS';

export const downloadSalesLeads: ThunkAction<void> = (dispatch, getState) => {
    dispatch(downloadOpportunities);
    dispatch(queryLeads);
};

export const downloadSalesLeadsOwned: ThunkAction<void> = (dispatch, getState) => {
    dispatch(downloadOpportunitiesOwned);
    dispatch(queryLeadsOwned);
};

export const downloadSalesLeadsCustomers: ThunkAction<void> = (dispatch, getState) => {
    dispatch(downloadOpportunitiesCustomers);
    dispatch(queryLeadsCustomers);
};