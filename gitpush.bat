@echo off
cd /d "%~dp0"
echo Staging app files and folders...
git add index.html style.css app.js
git add extra
git add gitpush.bat
git rm -r --cached gitpush --ignore-unmatch
echo Committing changes...
git commit -m "update stock system - modular files at root"
echo Pushing to GitHub...
git push origin main
echo.
echo Process complete!
pause
