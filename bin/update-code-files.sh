#!/bin/bash

sed -i '' 's/customZoomInput: true/customZoomInput: false/' src/constants.ts
sed -i '' 's/extensionNameExtended/extensionName/' src/popup.tsx