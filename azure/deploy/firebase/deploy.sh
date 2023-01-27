OUTPUT_PATH=$1
echo 'Install the Firebase CLI on the release agent'
npm install -g firebase-tools

echo 'Starting deploy'
# Deploy app to Firebase and notify the tester groups
firebase appdistribution:distribute _konecorp.Kone-SMT3/outputs/qa/app-debug.apk \
    --token 1//0gfI7SvJ2yOQcCgYIARAAGBASNwF-L9IranZEUVLShZgHK87wHoiQRdbEpuk7lkDgHd5xVZnrR_TQ_ZBGKO5OZ6DAUUyHQDyx6t0 \
    --app 1:1061756005321:android:98cf3c10a1ac92751a5618 \
    --groups "testers"