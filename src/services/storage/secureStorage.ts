import IAsyncValue from '../../models/IAsyncValue';

var storage: SecureStorage = null;

class SecureStorageValue2<T> implements IAsyncValue<T>{
    constructor(private key: string, storage: SecureStorage) {}

    public getValue<T>() {        
        return new Promise((resolve: (value: T) => void, reject: (reason: any) => void) =>
            storage.get(
                (data: string) => { data == null ? reject('No data.') : resolve(JSON.parse(data)) },
                reject, 
                this.key
            ));
    }

    public setValue(value: T) {
        return new Promise((resolve: (value: void) => void, reject: (reason: any) => void) =>
            storage.set(resolve, reject, this.key, JSON.stringify(value))
        );
    }

    public remove() {
        return new Promise((resolve: (value: void) => void, reject: (reason: any) => void)  =>
            storage.remove(resolve, reject, this.key)
        );
    }

}

export const initSecureStorageMethod = (environment: string) => new Promise<SecureStorage>((resolve, reject) => {
    storage = new cordova.plugins.SecureStorage(() => {
        resolve(storage);
    }, reject, 'KONE-SMT-' + environment);
});

//export const secureStorage = new SecureStorageWrapper('KONE-SMT');
export const valueForKey = <T>(key: string): IAsyncValue<T> => new SecureStorageValue2(key, storage)
    //secureStorage.valueForKey(key);