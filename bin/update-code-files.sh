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
    echo "Processing line: '$line'"  # Debug log: Processing line

    # Check if the line is within an extended section
    if [[ "$line" =~ /*\s*EXTENDED_ONLY_START\s*/ ]]; then
      extended_section=true
      echo "Entering extended section"  # Debug log: Entering extended section
    elif [[ "$line" =~ /*\s*EXTENDED_ONLY_END\s*/ ]]; then
      extended_section=false
      echo "Exiting extended section"  # Debug log: Exiting extended section
    fi

    # Skip lines within extended sections and comments
    if [[ ! $extended_section && ! "$line" =~ ^# ]]; then
      echo "$line" >> "$temp_file"
      echo "Writing line to temp file: '$line'"  # Debug log: Writing line to temp file
    else
      echo "Skipping line: '$line'"  # Debug log: Skipping line
      modified=true
    fi
  done < "$file"

  # If the file was modified, move the temporary file to the original file
  if $modified; then
    mv "$temp_file" "$file"
    echo "Modified: $file"
  else
    echo "No modifications made to $file"  # Debug log: No modifications made
    rm "$temp_file"
  fi
}

# Hardcoded starting directory
starting_directory="src"

# Walk through the directory and process files
find "$starting_directory" -type f -exec bash -c 'remove_extended_content "$0"' {} \;