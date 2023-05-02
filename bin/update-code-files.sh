#!/bin/bash

sed -i '' 's/customZoomInput: true/customZoomInput: false/' src/constants.ts
sed -i '' 's/localize("extensionNameExtended")/localize("extensionName")/' src/popup.tsx