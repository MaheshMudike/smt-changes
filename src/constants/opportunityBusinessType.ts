import translate from '../utils/translate';

export enum OpportunityBusinessType {
    New_Equipment_NEB = "New Equipment (NEB)",
    Modernization_FRB = "Modernization (FRB)",
    Modernization_NEB = "Modernization (TRB)",
    Maintenance_SEB = "Maintenance (SEB)",
    VA_Repairs = "VA Repairs",
    VB_Repairs = "VB Repairs",
    EBULI = "EBULI",
    Spares = "Spares",
    Doors = "Doors"
}

const oppBusinessTypeTranslationsKeys: { [index: string]: string } = {
    [OpportunityBusinessType.New_Equipment_NEB]: 'opportunity-business-type.new-equipment-neb',
    [OpportunityBusinessType.Modernization_FRB]: 'opportunity-business-type.modernization-frb',
    [OpportunityBusinessType.Modernization_NEB]: 'opportunity-business-type.modernization-neb',
    [OpportunityBusinessType.Maintenance_SEB]: 'opportunity-business-type.maintenance-seb',
    [OpportunityBusinessType.VA_Repairs]: 'opportunity-business-type.va-repairs',
    [OpportunityBusinessType.VB_Repairs]: 'opportunity-business-type.vb-repairs',
    [OpportunityBusinessType.EBULI]: 'opportunity-business-type.ebuli',
    [OpportunityBusinessType.Spares]: 'opportunity-business-type.spares',
    [OpportunityBusinessType.Doors]: 'opportunity-business-type.doors',
   
};

export function opportunityBusinessTypeName(btype: string): string {
    const translationKey = oppBusinessTypeTranslationsKeys[btype];
    if(translationKey == null) return null;
    return translate(translationKey);
}
