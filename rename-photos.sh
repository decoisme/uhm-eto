#!/bin/bash

echo "========================================"
echo "  Photo Renamer - Gesture Memory Gallery"
echo "========================================"
echo ""
echo "This will rename all photos in current folder to:"
echo "1.jpg, 2.jpg, 3.jpg, etc."
echo ""
echo "Make sure you're in the gambar folder!"
echo ""
read -p "Press Enter to continue..."

count=1

echo ""
echo "Renaming photos..."
echo ""

for file in *.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}; do
    if [ -f "$file" ]; then
        ext="${file##*.}"
        echo "Renaming: $file  ->  ${count}.${ext}"
        mv "$file" "${count}.${ext}"
        ((count++))
    fi
done

((count--))
echo ""
echo "========================================"
echo "  Done! Renamed $count photos"
echo "========================================"
echo ""
