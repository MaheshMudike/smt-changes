import IAsyncValue from '../../models/IAsyncValue';

export default class CachedValue<T> implements IAsyncValue<T> {
    private value: T;

    constructor(private asyncValue: IAsyncValue<T>) {}

    public getValue(): Promise<T> {
        if (this.value === undefined) {
            return this.asyncValue.getValue().then(v => this.value = v);
        }
        return Promise.resolve(this.value);
    }

    public setValue(v: T): Promise<void> {
        return this.asyncValue.setValue(v).then(() => { this.value = v; });
    }

    public remove(): Promise<void> {
        return this.asyncValue.remove().then(() => { delete this.value; });
    }
}
