function deviceReady() {
    return new Promise(resolve => document.addEventListener('deviceready', resolve));
}
export function isAndroid() {
    return cordova.platformId === 'android';
    // return device.platform === 'Android';
}

export function isBrowser() {
    return cordova.platformId === 'browser';
    // return device.platform === 'browser';
}


export function firebaseStartTrace(traceName: string) {
    deviceReady().then(() => {
        FirebasePlugin.startTrace(traceName, () => {
            console.log(traceName + ' started successfully');
        }, e => {
            console.log('Error starting trace' + traceName + e);
        })
    })
}

export function firebaseStopTrace(traceName: string) {
    deviceReady().then(() => {
        FirebasePlugin.stopTrace(traceName);
    })
}