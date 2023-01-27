# Instructions for setup

## Install android studio and android sdk (target version >= 7)

## Run the following commands in the project root folder
``` sh
npm install -g cordova
npm install
mkdir www
cordova prepare
cordova platform add android
cordova platform add browser
```

## Add SfDate interface definitions
``` sh
cat overrides/@types/jsforce/date-enum.d.ts >> node_modules/@types/jsforce/date-enum.d.ts

For MacOs :
cp overrides/@types/jsforce/date-enum.d.ts node_modules/@types/jsforce/date-enum.d.ts
```

## Override jsforce files
``` sh
#contains code in lines 16-18 to set the responseType in the XMLHttpRequest
cp overrides/jsforce/lib/browser/request.js node_modules/jsforce/lib/browser/request.js

#contains the change "value.length >= 0" in line 159 to avoid generating invalid SOQL "IN ()"
cp overrides/jsforce/lib/soql-builder.js node_modules/jsforce/lib/soql-builder.js
```

## Override excel plugin files
``` sh
cp overrides/react-data-export/dist/ExcelPlugin/components/ExcelFile.js node_modules/react-data-export/dist/ExcelPlugin/components/ExcelFile.js
```
## Override gradle to support multidex (do this everytime when you add android platform)
cp overrides/platforms/android/app/build.gradle platforms/android/app/build.gradle

## Copy plugins (do this everytime when you update/install cordova plugins)
``` sh
cp -R platforms/browser/platform_www/plugins www/
cp platforms/browser/platform_www/cordova_plugins.js www/
cp platforms/browser/platform_www/cordova.js www/
```

## npm commands
``` sh
#compiles the source code into the www folder
npm run build-full
MacOs : npm run build-full-Mac

#run the web app locally
npm run start-webpack

#packages the compiled code from www into an apk
npm run cordova-build-full
MacOs: npm run build-full-all-Mac

#packages the compiled code from www into an apk and deploys to a connected android device or emulator
npm run cordova-run-full
```

## Other useful commands
``` sh
#compare local with remote versions
cordova-check-plugins

#compare local with absolute remote versions
npm-check-updates

#check version
node -v

#check version
npm -v
```

## Troubleshooting

### If you have issues with cordova compilation try the following

#### Move, delete or rename platforms and plugins folder and run cordova prepare to download  plugins and recreate cordova folder structure
``` sh
cordova platform rm android && cordova platform add android
```

#### Install latest version of gradle
``` sh
# eg. with Homebrew
brew install gradle
```