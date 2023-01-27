import { isBrowser } from "./cordova-utils";

export function save(filename: string, mimeType: string, content: BlobPart, displayError: (key: string, error: any) => void) {
    saveBlob(new Blob([content], {type: mimeType}), filename, displayError);
}

export function saveBlob(blob: Blob, fileName: string, displayError: (key: string, error: any) => void) {
    if(isBrowser()) saveHref(blob, fileName);
    else saveFile(blob, fileName, displayError);
}

//consider using a library like this https://github.com/eligrey/FileSaver.js/blob/master/src/FileSaver.js
function saveHref(content: Blob, fileName: string) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = fileName;
    a.hidden = true;
    document.body.appendChild(a);
    a.innerHTML = "_";
    a.click();
}

/* cordova.file content:
    applicationDirectory: "file:///android_asset/"
    applicationStorageDirectory: "file:///data/user/0/com.fluido.konesmt.full/"
    cacheDirectory: "file:///data/user/0/com.fluido.konesmt.full/cache/"
    dataDirectory: "file:///data/user/0/com.fluido.konesmt.full/files/"
    documentsDirectory: null
    externalApplicationStorageDirectory: "file:///storage/emulated/0/Android/data/com.fluido.konesmt.full/"
    externalCacheDirectory: "file:///storage/emulated/0/Android/data/com.fluido.konesmt.full/cache/"
    externalDataDirectory: "file:///storage/emulated/0/Android/data/com.fluido.konesmt.full/files/"
    externalRootDirectory: "file:///storage/emulated/0/"
    sharedDirectory: null
    syncedDataDirectory: null
    tempDirectory: null
*/

export function validFilename(filename: string) {
    //return filename.replace(/[\s/\\?%*:|"<>]/g, '_');
    //short equivalent for [^a-zA-Z0-9] would be [\W_]
    return filename.replace(/[\W_.]/g,"_");
}

function saveFile(content: Blob, filename: string, displayError: (key: string, error: any) => void) {

    //for the Samsung tab 4 is needs to be stored in the external memory, otherwise external apps cannot open the file
    //in config.xml there is some cordova-plugin-file configuration necessary for the Samsung tab 4 to be able to store the reports 
    //https://stackoverflow.com/questions/38832592/cordova-file-plugin-save-file-in-device/38900101#38900101
    //in android 7 pathToFile can be filename only, maybe we could use device.version to use internal app storage for Android 7 (maybe 6 too)
    
    var fileDir = cordova.file.externalDataDirectory.replace(cordova.file.externalRootDirectory, '');
    const pathToFileOLD = fileDir + filename;
    const pathToFile = 'Download/' + filename;

    window.requestFileSystem(
        LocalFileSystem.PERSISTENT, 0,
        function (fs) {
            fs.root.getFile(
                pathToFile, { create: true, exclusive: false }, 
                fileEntry => {
                    saveFileEntry(fileEntry, content, displayError);
                }, 
                error => displayError("error.generic", error)
            );
        }, 
        error => displayError("error.generic", error)
    );
}

export enum MimeType {
        html = 'text/html',
        json = 'text/json',
        pdf = 'application/pdf',
        xlsx = 'application/octet-stream',
        // xlsx = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    } 
    
    const mimeTypeErrors = {
        [MimeType.html]: 'error.text-editor-not-found',
        [MimeType.xlsx]: 'error.excel-not-found',
        [MimeType.json]: 'error.text-editor-not-found'
    }    

function saveFileEntry(fileEntry: FileEntry, content: Blob, displayError: (key: string, error: any) => void) {
    const mimeType = content.type;
    fileEntry.createWriter((writer) => {
        writer.write(content);
        const plugins = cordova.plugins as any;
        //plugins.fileOpener2.open(fileEntry.nativeURL, mimeType, 
        plugins.fileOpener2.open(fileEntry.toURL(), mimeType, 
            {
                error : function(error: { message: string }) {
                    if(error.message.startsWith("Activity not found")) {
                        var errorKey = mimeTypeErrors[mimeType];
                        if(errorKey == null) errorKey = "error.generic";
                        displayError(errorKey, error);
                    } else {
                        displayError("error.generic", error);
                    }
                }, 
                success : function(){ } 
            } 
        );
    }, error => displayError("error.generic", error))
}

export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      var fr = new FileReader();  
      fr.onload = () => {
        var dataUrl = fr.result;
        var base64 = (dataUrl as string).split(',')[1];
        resolve(base64)
      };
      fr.onerror = (progressEvent) => {
        reject(progressEvent)
      }
      fr.readAsDataURL(blob);
    });
}

/* this was the implementation from admin settings page, I guess done by Siili. Doesnt work in android
function downloadFile(content: string, fileName: string, mimeType: string) {
    const url = window.URL.createObjectURL(new Blob([content], { type: mimeType }));
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}
*/