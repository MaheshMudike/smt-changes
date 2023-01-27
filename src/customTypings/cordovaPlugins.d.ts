interface SecureStorage {
    new (win: Function, fail: Function, s: string): SecureStorage;
    get: any;
    set: any;
    remove: any;
    keys: any;
    clear: any;
}

interface CordovaPlugins {
    SecureStorage: SecureStorage,
}

declare var startApp: StartAppPlugin.StartApp;

declare namespace StartAppPlugin {
    export interface StartApp {
        set: (so: SetOptions) => App;
    }

    export interface SetOptions {
        action?: string;
        package?: string;
        uri?: string;
    }

    export interface App {
        check: (success: () => void, error: () => void) => void;
        start: () => void;
    }
}
