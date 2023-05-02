#!/bin/bash

sed -i '' 's/customZoomInput: true/customZoomInput: false/' src/constants.ts
sed -i '' 's/extensionName/extensionNameExtended/' src/popup.tsx