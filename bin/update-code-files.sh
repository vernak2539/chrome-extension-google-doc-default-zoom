#!/bin/bash

sed -i.bak -e 's/customZoomInput: true/customZoomInput: false/' src/constants.ts
sed -i.bak -e 's/localize("extensionNameExtended")/localize("extensionName")/' src/popup.tsx

# Function to remove extended content and comments from a file
remove_extended_content() {
  local file="$1"
  local temp_file=$(mktemp)

  if [[ ! -f "$file" ]]; then
    echo "Error: File '$file' not found."
    return 1
  fi

  # Check if the file has been modified
  modified=false

  while IFS= read -r line; do
    # Check if the line is within an extended section
    if [[ "$line" =~ /*\s*EXTENDED_ONLY_START\s*/ ]]; then
      extended_section=true
    elif [[ "$line" =~ /*\s*EXTENDED_ONLY_END\s*/ ]]; then
      extended_section=false
    fi

    # Skip lines within extended sections and comments
    if [[ ! $extended_section && ! "$line" =~ ^# ]]; then
      echo "$line" >> "$temp_file"
    else
      modified=true
    fi
  done < "$file"

  # If the file was modified, move the temporary file to the original file
  if $modified; then
    mv "$temp_file" "$file"
    echo "Modified: $file"
  else
    rm "$temp_file"
  fi
}

# Hardcoded starting directory
starting_directory="src"

# Walk through the directory and process files
find "$starting_directory" -type f -exec bash -c 'remove_extended_content "$0"' {} \;