#!/bin/bash

# Script to translate store listing from English to multiple languages
# using md-translate tool

set -e  # Exit on any error

# Check for required argument
if [ $# -eq 0 ]; then
    echo "Usage: $0 --listing=<value>"
    echo ""
    echo "Arguments:"
    echo "  --listing=<value>    Required. Must be 'base' or 'extended'"
    echo ""
    echo "Examples:"
    echo "  $0 --listing=base      # Translate docs/store-listings/base/en.md"
    echo "  $0 --listing=extended  # Translate docs/store-listings/extended/en.md"
    exit 1
fi

# Parse --listing parameter
LISTING=""
for arg in "$@"; do
    case $arg in
        --listing=*)
            LISTING="${arg#*=}"
            shift
            ;;
        *)
            echo "Error: Unknown argument '$arg'"
            echo ""
            echo "Usage: $0 --listing=<value>"
            exit 1
            ;;
    esac
done

# Check if listing parameter was provided
if [ -z "$LISTING" ]; then
    echo "Error: --listing parameter is required"
    echo ""
    echo "Usage: $0 --listing=<value>"
    echo ""
    echo "Examples:"
    echo "  $0 --listing=base"
    echo "  $0 --listing=extended"
    exit 1
fi

# Validate listing argument
if [ "$LISTING" != "base" ] && [ "$LISTING" != "extended" ]; then
    echo "Error: --listing must be 'base' or 'extended', got '$LISTING'"
    echo ""
    echo "Usage: $0 --listing=<value>"
    exit 1
fi

# Set source file and output directory based on listing type
SOURCE_FILE="docs/store-listings/$LISTING/en.md"
OUTPUT_DIR="docs/store-listings/$LISTING"

# Ensure source file exists
if [ ! -f "$SOURCE_FILE" ]; then
    echo "Error: Source file $SOURCE_FILE not found!"
    exit 1
fi

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"

# Define languages to translate to (country_code:language_name pairs)
LANGUAGES="de:German es:Spanish fr:French it:Italian ja:Japanese ru:Russian"

echo "🚀 Starting translation of store listing..."
echo "📄 Source: $SOURCE_FILE"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# Translate to each target language
for lang_pair in $LANGUAGES; do
    country_code="${lang_pair%%:*}"
    language="${lang_pair##*:}"
    output_file="$OUTPUT_DIR/$country_code.md"
    
    echo "🔄 Translating to $language ($country_code)..."
    
    if ./node_modules/.bin/md-translate translate \
        -i "$SOURCE_FILE" \
        -l "$language" \
        -o "$output_file"; then
        echo "✅ Successfully translated to $country_code.md"
    else
        echo "❌ Failed to translate to $language ($country_code)"
        exit 1
    fi
    
    echo ""
done

echo "🎉 All translations completed!"
echo ""
echo "📁 Generated files:"
for lang_pair in $LANGUAGES; do
    country_code="${lang_pair%%:*}"
    if [ -f "$OUTPUT_DIR/$country_code.md" ]; then
        echo "   - $OUTPUT_DIR/$country_code.md"
    fi
done
