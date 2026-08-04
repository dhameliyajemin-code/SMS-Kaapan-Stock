@echo off
cd /d "%~dp0"
echo Staging app files and folders...
git add gitpush
git add extra
git add gitpush.bat
git rm index.html --ignore-unmatch
echo Committing changes...
git commit -m "update stock system - split files"
echo Pushing to GitHub...
git push origin main
echo.
echo Process complete!
pause
