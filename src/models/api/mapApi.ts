export enum FitterLocation {
    SO = 'SO',
    GPS = 'GPS',
    OFF = 'OFF'
}
//export type FitterLocation = 'SO' | 'GPS';

interface IMapEntityConfig {
    visible: boolean;
    filters: string[];
}

export interface IMapConfig {
    callouts: IMapEntityConfig;
    opportunities: { visible: boolean };
    technicians: { visible: boolean };
}
