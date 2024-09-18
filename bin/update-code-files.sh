#!/bin/bash

sed -i.bak -e 's/customZoomInput: true/customZoomInput: false/' src/constants.ts
sed -i.bak -e 's/localize("extensionNameExtended")/localize("extensionName")/' src/popup.tsx

# Remove code blocks that start with /*--EXTENDED_ONLY_START--*/ and end with /*--EXTENDED_ONLY_END--*/
start_dir="src"

# Function to process each file
process_file() {
    local file="$1"
    echo "Processing file: $file"
    
    # Read the file content
    content=$(<"$file")
    
    # Print the original content for debugging
    echo "Original content of $file:"
    echo "$content"
    
    # Remove sections between the specified comment blocks
    modified_content=$(echo "$content" | sed -E '/\/\*--EXTENDED_ONLY_START--\*\*/,/\/\*--EXTENDED_ONLY_END--\*\*/d')

    # Check if content has changed
    if [[ "$content" != "$modified_content" ]]; then
        echo "Modifying file: $file"
        echo "$modified_content" > "$file"
    else
        echo "No changes made to: $file"
    fi
}

# Export the function to use in find
export -f process_file

# Walk through all files in the directory and process them
find "$start_dir" -type f -exec bash -c 'process_file "$0"' {} \;

echo "Finished processing files."