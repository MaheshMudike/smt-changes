interface IAsyncValue<T> {
    getValue(): Promise<T>;
    setValue(v: T): Promise<void>;
    remove(): Promise<void>;
}

export default IAsyncValue;
