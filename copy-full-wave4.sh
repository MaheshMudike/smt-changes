#!/bin/bash
rm -rf ./kone_smt_releases
mkdir ./kone_smt_releases
cp ./platforms/android/app/build/outputs/apk/debug/app-debug.apk ./kone_smt_releases/app-full-wave-4.apk
rm -rf ./platforms/android/app/build/outputs/apk/debug/app-debug.apk