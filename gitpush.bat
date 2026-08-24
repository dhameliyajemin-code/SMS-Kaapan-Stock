@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ===================================================
echo   Git Push Helper for Diamond Stock System
echo ===================================================
echo.

:: Stage files
echo [1/3] Staging changes...
git add index.html style.css app.js extra/ gitpush.bat
git rm -r --cached gitpush --ignore-unmatch 2>nul

:: Prompt for commit message
echo.
echo [2/3] Preparing commit...
set /p commit_msg="Enter commit message (Press Enter to use default: 'update stock system'): "
if "!commit_msg!"=="" set commit_msg=update stock system

:: Check if there are changes to commit
git diff --cached --quiet
if %errorlevel% equ 0 (
    echo No staged changes to commit.
) else (
    git commit -m "!commit_msg!"
)

:: Push to GitHub
echo.
echo [3/3] Pushing to GitHub (origin main)...
git push origin main

if %errorlevel% neq 0 (
    echo.
    echo ❌ Git Push failed!
    echo If this is an authentication error (403), it might be due to incorrect saved credentials.
    echo The old credentials have been cleared. Please log in with the correct account when prompted.
) else (
    echo.
    echo  Git Push completed successfully!
)

echo.
pause
