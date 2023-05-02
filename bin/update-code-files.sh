#!/bin/bash

sed -i.bak -e 's/customZoomInput: true/customZoomInput: false/' src/constants.ts
sed -i.bak -e 's/localize("extensionNameExtended")/localize("extensionName")/' src/popup.tsx