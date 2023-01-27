interface SfDate {
    //constructor(params: any)
    
    /**
     * Convert JavaScript date object to ISO8601 Date format (e.g. 2012-10-31)
     *
     * @param {String|Number|Date} date - Input date
     * @returns {SfDate} - Salesforce date literal with ISO8601 date format
     */
    toDateLiteral(date: any): SfDate
    toDateTimeLiteral(date: any): SfDate
}

export let SfDate: SfDate