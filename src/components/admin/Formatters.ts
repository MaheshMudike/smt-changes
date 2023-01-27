import { AdminType } from '../../models/user/UserRole';
import translate from '../../utils/translate';
import { Option } from 'react-select';
import ICompany from '../../models/ICompany';

export const companyToString = (company: ICompany): string => {
    return company == null ? '' : `${ company.label } (${ company.code })`;
};

export const companyToOption = (item: ICompany): Option => {
    return item == null ? null : ({ label: companyToString(item), value: item.code });
};

export const userRoleToString = (item: AdminType): string => {
    if(item == null) return null;
    else if(item == AdminType.None) return '-';
    return translate(`admin.admin-type.${ item }`);    
};

export const userRoleToOption = (item: AdminType): Option => {
    return item == null ? null : { label: userRoleToString(item), value: item };    
};

export const userToOption = (item: { fullName: string, userName: string }): Option => {
    return item == null ? null : ({ label: item.fullName, value: item.userName });
};
