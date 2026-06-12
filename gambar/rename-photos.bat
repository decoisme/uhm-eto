@echo off
echo ========================================
echo   Photo Renamer - Gesture Memory Gallery
echo ========================================
echo.
echo This will rename all photos in current folder to:
echo 1.jpg, 2.jpg, 3.jpg, etc.
echo.
echo Make sure you're in the gambar folder!
echo.
pause

setlocal enabledelayedexpansion
set count=1

echo.
echo Renaming photos...
echo.

for %%f in (*.jpg *.jpeg *.png *.gif *.webp *.JPG *.JPEG *.PNG *.GIF *.WEBP) do (
    echo Renaming: %%f  -^>  !count!%%~xf
    ren "%%f" "!count!%%~xf"
    set /a count+=1
)

set /a count-=1
echo.
echo ========================================
echo   Done! Renamed %count% photos
echo ========================================
echo.
pause
