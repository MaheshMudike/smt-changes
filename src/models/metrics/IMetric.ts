export interface IMetric {
    subtitleKey?: string;
    amount?: number;
    closedThisMonth: number;
    fraction: number;
    open: number;
    openAmount?: number;
    currencyIsoCode?: string;
}
