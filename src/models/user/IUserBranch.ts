export interface IUserBranch {    
    id: string;
    activeInFSM: boolean;
    branchCode: string;
    branchLabel: string;
    branchToString: string;
    shortBranchCode: string;
    salesOrganization: string;
    owned: boolean;
}
