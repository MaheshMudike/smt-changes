export const enum JobStatus {
    Pending = 'Pending',
    Success = 'Success',
    Failure = 'Failure',
}

export interface IOfflineChangeJob {
    id: string;
    displayName: string;
    sync: () => Promise<any>;
    status: JobStatus;
}
