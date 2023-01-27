abstract class WrapperObject<T> {
    protected value: T;

    constructor(entity: T) {
        this.value = entity;
    }
}

export default WrapperObject;
