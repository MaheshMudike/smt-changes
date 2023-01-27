import { SvgIcon } from '../../constants/SvgIcon';
import { IMetric } from '../../models/metrics/IMetric';
import { IMetricSet } from 'src/reducers/MetricsReducer';

export enum TileVisibility {
    FSM = 'FSM',
    NON_FSM = 'NON_FSM',
    ALL = 'ALL'
}

export class Tile {
    
    constructor(public readonly visibilityKey: string, public readonly icon: SvgIcon, private name: string, private path: string, 
        private valueExtractor: (ims: IMetricSet) => IMetric | number, public visibility: TileVisibility = TileVisibility.ALL, public isAbsolutePath: boolean) {
    }

    public getPath() {
        return this.path;
    }

    public getValue(metrics: IMetricSet) {
        return this.valueExtractor == null ? null : this.valueExtractor(metrics);
    }

    public setName(name: string) {
        this.name = name;
        return this;
    }

    public getName() {
        return this.name;
    }

    get isImplemented() {
        return this.valueExtractor != null;
    }

    get isNavigatable() {
        return this.path != null;
    }
}
